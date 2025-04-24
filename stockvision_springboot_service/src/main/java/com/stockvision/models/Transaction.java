package com.stockvision.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    private String userId;
    private String type; // deposit, withdrawal, trade
    private double amount;
    private String status; // pending, completed, failed
    private Date timestamp = new Date();
}
