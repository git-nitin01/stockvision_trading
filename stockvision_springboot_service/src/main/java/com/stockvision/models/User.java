package com.stockvision.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id; // Firebase UID
    private String name;
    private String email;
    private String stripeAccountId; // For withdrawals
    private boolean socialLogin;
    private Date createdAt = new Date();
}
