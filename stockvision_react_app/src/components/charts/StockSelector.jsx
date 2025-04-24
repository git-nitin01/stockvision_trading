import React, { useState, useRef } from "react";
import { Box, Typography, Button, Paper, TextField, Autocomplete } from "@mui/material";
import StockModal from "./StockModal";

const stockCategories = {
  "🔹 Tech Giants": ["AAPL", "MSFT", "GOOGL", "META", "NVDA", "AMD", "ORCL", "INTC"],
  "🏦 Finance": ["JPM", "V", "MA", "PYPL", "BAC", "GS"],
  "🏥 Healthcare": ["JNJ", "PFE", "ABT", "MRK", "LLY", "BMY", "UNH", "MDT"],
  "🏭 Industrials": ["GE", "CAT", "MMM", "HON"],
  "🛍️ Consumer Goods": ["WMT", "PG", "KO", "PEP", "MCD", "NKE", "COST"],
  "⛽ Energy": ["XOM", "CVX", "NEE"],
  "🎬 Entertainment & Media": ["NFLX", "DIS", "CMCSA"],
};

const allStocks = Object.values(stockCategories).flat(); 

const StockSelector = () => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedStock, setHighlightedStock] = useState(null);
  const stockRefs = useRef({});

  const handleOpenModal = (symbol) => {
    setSelectedStock(symbol);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSearchChange = (_, value) => {
    setSearch(value);
  };

  const handleSelectStock = (symbol) => {
    setSearch(symbol);
    setHighlightedStock(symbol);

    if (stockRefs.current[symbol]) {
      stockRefs.current[symbol].scrollIntoView({ behavior: "smooth", block: "center" });
      stockRefs.current[symbol].focus();
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4, px: 4, maxWidth: "90vw", mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        📊 Select a Stock to Analyze
      </Typography>

      {/* Search Bar with Dropdown */}
      <Autocomplete
        freeSolo
        options={allStocks}
        value={search}
        onInputChange={handleSearchChange}
        onChange={(_, value) => handleSelectStock(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="🔍 Search for a stock..."
            variant="outlined"
            fullWidth
            sx={{
              mb: 3,
              maxWidth: 500,
              borderRadius: 10, 
              "& .MuiOutlinedInput-root": {
                borderRadius: "30px",
              },
            }}
          />
        )}
      />

      {/* Scrollable Stock List with Hidden Scrollbar */}
      <Box
        sx={{
          overflowY: "auto",
          p: 3,
          borderRadius: 3,
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar
          "-ms-overflow-style": "none", // Hide scrollbar in IE
          "scrollbar-width": "none", // Hide scrollbar in Firefox
        }}
      >
        {Object.entries(stockCategories).map(([category, stocks]) => (
          <Paper
            key={category}
            elevation={3}
            sx={{
              mb: 3,
              p: 3,
              borderRadius: "30px", 
              textAlign: "left",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {/* Category Title */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}>
              {category}
            </Typography>
            {/* Stock Buttons */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {stocks.map((symbol) => (
                <Button
                  key={symbol}
                  ref={(el) => (stockRefs.current[symbol] = el)}
                  variant="contained"
                  sx={{
                    backgroundColor: highlightedStock === symbol ? "gold" : "primary.main",
                    borderRadius: "12px", 
                    "&:hover": { backgroundColor: highlightedStock === symbol ? "goldenrod" : "primary.dark" },
                  }}
                  onClick={() => handleOpenModal(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      {modalOpen && <StockModal open={modalOpen} onClose={handleCloseModal} symbol={selectedStock} />}
    </Box>
  );
};

export default StockSelector;
