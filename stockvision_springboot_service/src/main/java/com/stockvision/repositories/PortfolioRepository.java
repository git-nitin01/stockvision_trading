package com.stockvision.repositories;

import com.stockvision.models.Portfolio;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends MongoRepository<Portfolio, String> {
	Portfolio findByUserId(String userId);
}
