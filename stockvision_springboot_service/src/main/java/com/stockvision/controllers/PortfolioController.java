package com.stockvision.controllers;

import com.stockvision.models.Holdings;
import com.stockvision.repositories.HoldingsRepository;
import com.stockvision.services.StockService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = {"http://localhost:5173/", "http://localhost:8080/"})
public class PortfolioController {

    @Autowired
    private HoldingsRepository holdingsRepository;

    @Autowired
    private StockService stockService;

    // Fetch User Portfolio
    @GetMapping
    public ResponseEntity<?> getPortfolio(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");

        List<Holdings> holdings = holdingsRepository.findByUserId(userId);
        double totalInvested = holdings.stream().mapToDouble(Holdings::getTotalInvested).sum();

        double totalValue = 0;
        for (Holdings holding : holdings) {
            double latestPrice = stockService.getLatestStockPrice(holding.getSymbol()); // Fetch latest price
            totalValue += holding.getQuantity() * latestPrice;
        }

        return ResponseEntity.ok(Map.of(
                "totalInvested", totalInvested,
                "totalValue", totalValue,
                "holdings", holdings
        ));
    }

}
