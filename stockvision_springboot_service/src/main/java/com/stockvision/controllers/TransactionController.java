package com.stockvision.controllers;

import com.stockvision.models.Transaction;
import com.stockvision.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173/", "http://localhost:8080/"})
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Get all transactions for a specific user
    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactionsByUserId(@PathVariable String userId) {
        return transactionRepository.findByUserId(userId);
    }

    // Save a new transaction
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // Optional: Get a transaction by ID
    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }

    // Optional: Delete a transaction
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable String id) {
        transactionRepository.deleteById(id);
    }
}
