package com.stockvision.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String userId;
    private String symbol;
    private String orderType; // market, limit, oco, stop-loss
    private String action; // buy or sell
    private int quantity;
    private double price;
    private String status; // pending, executed, canceled
    private Date timestamp = new Date();
}
