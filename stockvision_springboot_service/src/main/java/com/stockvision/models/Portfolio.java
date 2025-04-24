package com.stockvision.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "portfolio")
public class Portfolio {
	@Id
	private String id;
	private String userId;
	private double totalInvested;
	private double totalValue;
	private Date updatedAt = new Date();
}
