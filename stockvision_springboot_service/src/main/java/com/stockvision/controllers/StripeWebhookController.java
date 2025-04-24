package com.stockvision.controllers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockvision.models.Wallet;
import com.stockvision.repositories.WalletRepository;
import com.stockvision.services.TransactionService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final WalletRepository walletRepository;
    private final TransactionService transactionService;
    private static final Logger LOGGER = LoggerFactory.getLogger(StripeWebhookController.class);
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON parser

    @Autowired
    public StripeWebhookController(WalletRepository walletRepository, TransactionService transactionService) {
        this.walletRepository = walletRepository;
        this.transactionService = transactionService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleStripeWebhook(HttpServletRequest request, @RequestHeader("Stripe-Signature") String signature) {
        try {
            byte[] payloadBytes = IOUtils.toByteArray(request.getInputStream());
            String payload = new String(payloadBytes, StandardCharsets.UTF_8);

            Event event = Webhook.constructEvent(payload, signature, webhookSecret);
            LOGGER.info("Received Webhook Event: {}", event.getType());

            JsonNode jsonNode = objectMapper.readTree(payload);
            JsonNode dataObject = jsonNode.get("data").get("object");

            switch (event.getType()) {
                case "checkout.session.completed":
                    return handleCheckoutSessionCompleted(dataObject);
                default:
                    LOGGER.warn("Unhandled event type: {}", event.getType());
                    return ResponseEntity.ok("Webhook received but event type is unhandled.");
            }

        } catch (SignatureVerificationException e) {
            LOGGER.error("Invalid webhook signature: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature: " + e.getMessage());
        } catch (IOException e) {
            LOGGER.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.status(400).body("Webhook error: " + e.getMessage());
        } catch (Exception e) {
            LOGGER.error("Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    /**
     * Handles Checkout Session Completed events to update the user's wallet.
     */
    private ResponseEntity<?> handleCheckoutSessionCompleted(JsonNode sessionNode) {
        if (sessionNode == null || !sessionNode.has("client_reference_id")) {
            LOGGER.error("Session object missing or incorrect in webhook event.");
            return ResponseEntity.status(400).body("Invalid webhook: Session data missing or incorrect");
        }

        String userId = sessionNode.get("client_reference_id").asText();
        if ((userId == null || userId.isEmpty()) && sessionNode.has("metadata")) {
            userId = sessionNode.get("metadata").get("userId").asText();
        }

        if (userId == null || userId.isEmpty()) {
            LOGGER.error("User ID is missing in webhook event.");
            return ResponseEntity.status(400).body("Invalid session: userId missing");
        }

        String paymentStatus = sessionNode.has("payment_status") ? sessionNode.get("payment_status").asText() : "";
        if (!"paid".equalsIgnoreCase(paymentStatus)) {
            LOGGER.warn("Payment not completed yet for session.");
            return ResponseEntity.ok("Webhook received but payment not completed yet.");
        }

        double amount = sessionNode.has("amount_total") ? sessionNode.get("amount_total").asDouble() / 100.0 : 0.0;
        LOGGER.info("Updating wallet: userId={}, amount=${}", userId, amount);

        Wallet wallet = walletRepository.findByUserId(userId);
        if (wallet == null) {
            wallet = new Wallet();
            wallet.setUserId(userId);
            wallet.setBalance(amount);
        } else {
            wallet.setBalance(wallet.getBalance() + amount);
        }
        walletRepository.save(wallet);
        LOGGER.info("Wallet updated successfully for userId: {}", userId);
        
        //Adding transactions entry
        transactionService.insertTransactionEntry(amount, userId,  "deposit", "completed");
        
        return ResponseEntity.ok("Wallet updated successfully");
    }

}
