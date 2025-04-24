package com.stockvision.services;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.springframework.beans.factory.annotation.Value;
import com.google.j2objc.annotations.Property;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class StockService {

    private String apiKey;
    private String apiUrl;

    public StockService(
        @Value("${fmp_api_key}") String apiKey,
        @Value("${fmp_base_url}") String apiUrl
    ) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    public double getLatestStockPrice(String symbol) {
        try {
            String urlString = apiUrl + symbol + "?apikey=" + apiKey;
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            JSONArray jsonArray = new JSONArray(response.toString());
            if (jsonArray.length() > 0) {
                JSONObject stockData = jsonArray.getJSONObject(0);
                return stockData.getDouble("price");
            } else {
                throw new Exception("No data found for symbol: " + symbol);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Handle exceptions appropriately in your application
            return -1;
        }
    }
}
