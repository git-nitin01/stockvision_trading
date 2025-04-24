package com.stockvision.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stockvision.models.Transaction;
import com.stockvision.repositories.TransactionRepository;

@Service
public class TransactionService {
	
    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionService.class);
    private final TransactionRepository transactionRepository;
    
    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    
    
    public void insertTransactionEntry(double amount, String userId, String type, String status)
    {
    	try {
    		Transaction transaction = new Transaction();
	        transaction.setAmount(amount);
	        transaction.setUserId(userId);
	        transaction.setStatus(status);
	        transaction.setType(type);
	        transactionRepository.save(transaction);
	        LOGGER.info("Transcation type {} added successfully agaist userId {} with amount {}", type,userId, amount);
		} catch (Exception e) {
			LOGGER.error("Error while inserting transaction entry against userId: {}. Error: {}", userId, e.getMessage());
		}
    }
    

}
