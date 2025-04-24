package com.stockvision.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "holdings")
public class Holdings {
	@Id
	private String id;
	private String userId;
	private String symbol;
	private int quantity;
	private double averagePrice;
	private double totalInvested;
}
