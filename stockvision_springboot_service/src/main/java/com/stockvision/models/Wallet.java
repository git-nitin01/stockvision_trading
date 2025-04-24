package com.stockvision.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "wallet")
public class Wallet {
    @Id
    private String id;
    private String userId;
    private double balance;
    private transient List<Transaction> transactions;
}
