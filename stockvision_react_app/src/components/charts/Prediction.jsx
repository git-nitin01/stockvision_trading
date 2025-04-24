import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup } from "@mui/material";
import CanvasJSReact from "@canvasjs/react-stockcharts";

import axios from "axios";

const CanvasJSStockChart = CanvasJSReact.CanvasJSChart;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Prediction = ({ symbol }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [overallAction, setOverallAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("candlestick"); // Default to Candlestick

  useEffect(() => {
    if (symbol) {
      fetchStockData(symbol);
    }
  }, [symbol]);

  const smoothData = (data, windowSize = 3) => {
    return data.map((item, index, arr) => {
      if (index < windowSize - 1) return item; // Keep first few values unchanged
  
      const avgClose = arr
        .slice(index - windowSize + 1, index + 1)
        .reduce((sum, val) => sum + val.y[3], 0) / windowSize;
  
      return { ...item, y: [item.y[0], item.y[1], item.y[2], avgClose] };
    });
  };
  
  const fetchStockData = async (stockSymbol) => {
    setLoading(true);
    try {
      const historyResponse = await axios.post("http://localhost:8000/stockdata", { symbol: stockSymbol });
      const historyResult = historyResponse.data;
  
      const formattedHistorical = historyResult.historical.map((item) => ({
        x: new Date(item.date),
        y: [item.open, item.high, item.low, item.close],
      }));
  
      const predictionResponse = await axios.post(`${import.meta.env.VITE_PREDICTION_URL}/predict`, { symbol: stockSymbol });
      const predictionResult = predictionResponse.data;
  
      let formattedPredictions = predictionResult.predictions.map((item) => ({
        x: new Date(item.date),
        y: [item.open, item.high, item.low, item.close],
        volume: item.volume,
      }));
  
      formattedPredictions = smoothData(formattedPredictions, 3);
  
      setHistoricalData(formattedHistorical);
      setPredictedData(formattedPredictions);
      setOverallAction(predictionResult.overall_action);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const options = {
    theme: "light2",
    axisX: { valueFormatString: "DD MMM" },
    axisY: { prefix: "$"},
    data: [
      {
        type: chartType,
        showInLegend: true,
        name: "Historical Data",
        dataPoints: historicalData,
      },
      {
        type: chartType,
        showInLegend: true,
        name: "Predicted Data",
        dataPoints: predictedData,
        color: "rgba(0, 123, 255, 0.5)", // Light color for predictions
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, boxShadow: 3, maxHeight: 700, overflow: "scroll" }}>
      {overallAction && (
        <Box mt={2}>
          <Alert severity={overallAction === "BUY" ? "success" : "error"}>
            {overallAction === "BUY" ? "Recommended Action: BUY" : "Recommended Action: SELL"}
          </Alert>
        </Box>
      )}
      
      <ToggleButtonGroup
        color="primary"
        value={chartType}
        exclusive
        onChange={(e) => setChartType(e.target.value)}
        aria-label="Platform"
      >
        <ToggleButton value="line">Line</ToggleButton>
        <ToggleButton value="candlestick">Candle</ToggleButton>
      </ToggleButtonGroup>

      {
        chartType === "candlestick" ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400} mt={2}>
        {loading ? <CircularProgress /> : <CanvasJSStockChart options={options} />}
      </Box>) : (
          <CanvasJSChart
          containerProps={{ width: "100%", height: "400px" }}
          options={{
            theme: "light2",
            axisX: {
              valueFormatString: "DD MMM YYYY",
              labelFormatter: function (e) {
                return e.value.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
              },
            },
            axisY: { prefix: "$" },
            data: [
              {
                type: chartType,
                showInLegend: true,
                name: "Historical Data",
                dataPoints: historicalData.map((item) => ({
                  x: new Date(item.x), 
                  y: item.y[3], // Use closing price for line/spline charts
                })),
              },
              {
                type: chartType,
                showInLegend: true,
                name: "Predicted Data",
                dataPoints: predictedData.map((item) => ({
                  x: new Date(item.x),
                  y: item.y[3], // Use closing price
                })),
                color: "rgba(0, 123, 255, 0.5)",
              },
            ],
          }}
        />
        
      )
      }
      

      {/* Predicted Prices Table */}
      <Box mt={4}>
        <Typography variant="h6" align="center">20-Day Predicted Prices & Volume</Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Open ($)</TableCell>
                <TableCell>High ($)</TableCell>
                <TableCell>Low ($)</TableCell>
                <TableCell>Close ($)</TableCell>
                <TableCell>Volume</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.x.toISOString().split("T")[0]}</TableCell>
                  <TableCell>{row.y[0].toFixed(3)}</TableCell>
                  <TableCell>{row.y[1].toFixed(3)}</TableCell>
                  <TableCell>{row.y[2].toFixed(3)}</TableCell>
                  <TableCell>{row.y[3].toFixed(3)}</TableCell>
                  <TableCell>{row.volume}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default Prediction;
