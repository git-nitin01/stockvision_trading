import React, { useState } from "react";
import { Modal, Box, Typography, Tabs, Tab, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Prediction from "./Prediction";
import HistoricalChart from "./HistoricalChart";
import RealTrades from "./RealTrades";
import { StockDataProvider } from "../../context/StockProvider";

const StockModal = ({ open, onClose, symbol, mode="buy", holding=null }) => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Modal open={open} onClose={onClose} sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3
    }}>
      <Box
        sx={{
          width: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
          overflow: "hidden"
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Stock Analysis - {symbol}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <StockDataProvider symbol={symbol}>
          <Tabs value={tabIndex} onChange={(event, newIndex) => setTabIndex(newIndex)} centered>
            <Tab label="Stock Data" />
            <Tab label="Real-Time" />
            <Tab label="Prediction Analysis" />
          </Tabs>
          <Box mt={2}>
            {tabIndex === 0 && <HistoricalChart symbol={symbol} />}
            {tabIndex === 1 && <RealTrades symbol={symbol} mode={mode} holding={holding}/>}
            {tabIndex === 2 && <Prediction symbol={symbol}/>}
          </Box>
        </StockDataProvider>
      </Box>
    </Modal>
  );
};

export default StockModal;
