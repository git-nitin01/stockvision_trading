package com.stockvision.controllers;

import com.stockvision.models.Order;
import com.stockvision.models.Wallet;
import com.stockvision.models.Holdings;
import com.stockvision.repositories.OrderRepository;
import com.stockvision.repositories.WalletRepository;
import com.stockvision.repositories.HoldingsRepository;
import com.stockvision.services.TransactionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173/", "http://localhost:8080/"})
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private HoldingsRepository holdingsRepository;

    @Autowired
    private TransactionService transactionService;

    // Buy Stock API
    @PostMapping("/buy")
    public ResponseEntity<?> placeBuyOrder(@RequestBody Order order, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        Wallet wallet = walletRepository.findByUserId(userId);
        if (wallet == null || wallet.getBalance() < order.getQuantity() * order.getPrice()) {
            return ResponseEntity.badRequest().body("Insufficient funds");
        }

        // Deduct from wallet
        double totalCost = order.getQuantity() * order.getPrice();
        wallet.setBalance(wallet.getBalance() - totalCost);
        walletRepository.save(wallet);
        transactionService.insertTransactionEntry(-totalCost, userId, "buy trade", "completed");

        // Save Order
        order.setUserId(userId);
        order.setStatus("executed");
        order.setTimestamp(new Date());
        orderRepository.save(order);

        // Update Holdings
        Holdings holding = holdingsRepository.findByUserIdAndSymbol(userId, order.getSymbol());
        if (holding == null) {
            holding = new Holdings();
            holding.setUserId(userId);
            holding.setSymbol(order.getSymbol());
            holding.setQuantity(order.getQuantity());
            holding.setAveragePrice(order.getPrice());
            holding.setTotalInvested(totalCost);
        } else {
            double totalValue = (holding.getQuantity() * holding.getAveragePrice()) + totalCost;
            int newQuantity = holding.getQuantity() + order.getQuantity();
            holding.setAveragePrice(totalValue / newQuantity);
            holding.setQuantity(newQuantity);
            holding.setTotalInvested(holding.getTotalInvested() + totalCost); // Update Total Invested
        }
        holdingsRepository.save(holding);

        return ResponseEntity.ok("Buy order executed successfully");
    }


    // Sell Stock API
    @PostMapping("/sell")
    public ResponseEntity<?> placeSellOrder(@RequestBody Order order, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        Holdings holding = holdingsRepository.findByUserIdAndSymbol(userId, order.getSymbol());
        if (holding == null || holding.getQuantity() < order.getQuantity()) {
            return ResponseEntity.badRequest().body("Insufficient stock holdings");
        }

        // Calculate how much of the original investment should be reduced
        double sellFraction = (double) order.getQuantity() / holding.getQuantity();
        double amountToReduce = holding.getTotalInvested() * sellFraction;

        // Update Holdings
        holding.setQuantity(holding.getQuantity() - order.getQuantity());
        holding.setTotalInvested(holding.getTotalInvested() - amountToReduce);

        if (holding.getQuantity() == 0) {
            holdingsRepository.delete(holding); // Remove if all sold
        } else {
            holdingsRepository.save(holding);
        }

        // Update Wallet Balance
        Wallet wallet = walletRepository.findByUserId(userId);
        wallet.setBalance(wallet.getBalance() + (order.getQuantity() * order.getPrice()));
        walletRepository.save(wallet);
        transactionService.insertTransactionEntry((order.getQuantity() * order.getPrice()), userId, "sell trade", "completed");

        // Save Order
        order.setUserId(userId);
        order.setStatus("executed");
        order.setTimestamp(new Date());
        orderRepository.save(order);

        return ResponseEntity.ok("Sell order executed successfully");
    }


    // Fetch Order History
    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        List<Order> orderHistory = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(orderHistory);
    }

}
