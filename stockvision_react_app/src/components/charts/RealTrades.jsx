import React, { useEffect, useState } from 'react';
import CanvasJSReact from '@canvasjs/react-stockcharts';
import { Card, CardContent, Box, Typography, ToggleButton, ToggleButtonGroup, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import HttpsIcon from '@mui/icons-material/Https';
import { useStockData } from '../../context/StockProvider';
import BuyModal from '../trades/BuyModal';
import SellModal from '../trades/SellModal';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const RealTrades = ({ symbol, mode, holding }) => {
  const { ohlcHistory, lineData, activeCandle, lastPrice, marketOpen, openPrice } = useStockData();
  const [ohlc, setOhlc] = useState([]);
  const [chartType, setChartType] = useState("line"); // Default to Line Chart
  const [prevPrice, setPrevPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuyOpen, setIsBuyOpen] = useState(false);

  // Live Price Indicator Color
  const priceColor = prevPrice >= openPrice ? "green" : "red";
  const percentChange = ((lastPrice - openPrice) / openPrice) * 100;

  useEffect(() => {
    setPrevPrice(lastPrice);
  }, [lastPrice]);

  useEffect(() => {
    if(!marketOpen) {
      setLoading(false);
    }
    if(marketOpen && lineData.length > 0) {
      setLoading(false);
    }
  }, [lineData, marketOpen]);

  useEffect(() => {
    const formattedOhlc = Object.entries(ohlcHistory).map(([time, { open, high, low, close }]) => ({
      x: new Date(parseInt(time) * 1000),
      y: [open, high, low, close],
      risingColor: close >= open ? "green" : "red",
      fallingColor: close < open ? "red" : "green",
    }));

    if (activeCandle) {
      formattedOhlc.push(activeCandle);
    }

    setOhlc(formattedOhlc);
  }, [ohlcHistory, activeCandle]);

  return (
    loading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><CircularProgress /></Box> :
    <Card sx={{ p: 2, maxWidth: 900, margin: 'auto', position: 'relative'}}>
      <CardContent>
        {!marketOpen && (
          <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
          }}>
            <HttpsIcon sx={{ fontSize: 100, color: 'white' }} />
            <Typography variant="h4" color="white">Market Closed</Typography>
          </Box>
        )}
        <Typography variant="h5" sx={{ textAlign: "left", fontWeight: "bold", mb: 2 }}>
          <span style={{ color: priceColor }}>{lastPrice ? `$${lastPrice.toFixed(2)}` : "Loading..."}</span>
          <span style={{ color: priceColor }}> ({percentChange ? percentChange.toFixed(2) : "0"}%)</span> 
        </Typography>

          {/* Buy/Sell component */}
          {mode === 'buy' &&
          <div>
            <Button 
              onClick={() => setIsBuyOpen(true)}
              variant='contained'
              color="success"
              sx={{ float: 'right' }}
            >
              Buy
            </Button>
            {isBuyOpen && <BuyModal symbol={symbol} isOpen={isBuyOpen} onClose={() => setIsBuyOpen(false)} />}
          </div>
          }

          {
            mode === 'sell' &&
            <div>
              <Button 
                onClick={() => setIsBuyOpen(true)}
                variant='contained'
                color="error"
                sx={{ float: 'right' }}
              >
                Sell
              </Button>
              {isBuyOpen && <SellModal symbol={symbol} isOpen={isBuyOpen} onClose={() => setIsBuyOpen(false)} holding={holding}/>}
            </div>
          }

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

        <Box sx={{ mt: 2, height: 'fit-content', position: 'relative' }}>
          <CanvasJSChart
            containerProps={{ width: "100%", height: "400px" }}
            options={{
              theme: "light2",
              axisX: { title: "Time", valueFormatString: "HH:mm:ss" },
              axisY: { title: "Price", prefix: "$" },
              data: [
                chartType === "candlestick"
                  ? { type: "candlestick", dataPoints: ohlc, risingColor: "green", fallingColor: "red" }
                  : { type: "line", dataPoints: lineData, color: "blue" }
              ]
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealTrades;
