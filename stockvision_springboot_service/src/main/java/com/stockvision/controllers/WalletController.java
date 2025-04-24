package com.stockvision.controllers;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stockvision.models.Wallet;
import com.stockvision.repositories.WalletRepository;
import com.stockvision.services.TransactionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import com.stockvision.models.Transaction;
import com.stockvision.repositories.TransactionRepository;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = {"http://localhost:5173/", "http://localhost:8080/"})
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public ResponseEntity<?> getWallet(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        Wallet wallet = walletRepository.findByUserId(userId);
        if (wallet == null) {
            Wallet userWallet = new Wallet();
            userWallet.setBalance(0);
            userWallet.setUserId(userId);
            walletRepository.save(userWallet);
            wallet = userWallet;
        }

        // Fetch transactions for this user
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        wallet.setTransactions(transactions); // Attach transactions to wallet response

        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            double amount = Double.parseDouble(request.get("amount").toString()); // Keep only one amount variable
            long amountInCents = (long) (amount * 100); // Convert to cents

            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setClientReferenceId(userId)  // Store userId for later use
                    .putMetadata("userId", userId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(amountInCents) // Convert USD to cents
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Wallet Deposit")
                                            .build())
                                    .build())
                            .build())
                    .setSuccessUrl("http://localhost:5173")  // Change later when frontend is ready
                    .setCancelUrl("http://localhost:5173")   // Change later when frontend is ready
                    .build();

            Session session = Session.create(params);

            return ResponseEntity.ok(Map.of("sessionId", session.getId(), "message", "Payment session created"));

        } catch (StripeException | NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment initiation failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdrawFunds(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            double amount = Double.parseDouble(request.get("amount").toString());

            if (amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid withdrawal amount"));
            }

            Wallet wallet = walletRepository.findByUserId(userId);
            if (wallet == null || wallet.getBalance() < amount) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient balance"));
            }

            wallet.setBalance(wallet.getBalance() - amount);
            walletRepository.save(wallet);

            //Adding transactions entry
            transactionService.insertTransactionEntry(-amount, userId, "withdraw", "completed");
            
            return ResponseEntity.ok(Map.of("message", "Withdrawal successful", "remainingBalance", wallet.getBalance()));

        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid amount format"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }
}
