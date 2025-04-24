import React, { createContext, useState, useEffect, useContext } from 'react';
import { openConnection, subscribe, unsubscribe, checkMarketStatus, getOpenPriceAndPercentChange } from '../services/stockService';

const StockDataContext = createContext();

export const StockDataProvider = ({ symbol, children }) => {
  const [ohlcHistory, setOhlcHistory] = useState({});
  const [lineData, setLineData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [activeCandle, setActiveCandle] = useState(null);
  const [lastPrice, setLastPrice] = useState(null);
  const [interval, setInterval] = useState(5);
  const [marketOpen, setMarketOpen] = useState(false);
  const [openPrice, setOpenPrice] = useState(0);
  const [percentChange, setPercentChange] = useState(0);

  useEffect(() => {
    checkMarketStatus().then((status) => {
      setMarketOpen(status);
      console.log("Market Open:", status);
    });
  }, []);

  useEffect(() => {
    if (marketOpen && symbol) {
      getOpenPriceAndPercentChange(symbol).then(({ open, percentChange }) => {
        setOpenPrice(open);
        setPercentChange(percentChange);
      });
    }
  }, [marketOpen, symbol]);

  useEffect(() => {
    if (marketOpen && symbol) {
      const ws = openConnection();
      setSocket(ws);

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.data) {
          processTradeData(response.data);
        }
      };

      ws.onerror = () => console.error("WebSocket error");
      ws.onclose = () => console.log("WebSocket closed");

      subscribe(ws, symbol);

      return () => {
        unsubscribe(ws, symbol);
        ws.close();
        setSocket(null);
      };
    }
  }, [marketOpen, symbol]);

  // Process Real-time Data
  const processTradeData = (trades) => {
    // Update Last Price
    const lastTrade = trades[trades.length - 1];
    setLastPrice(lastTrade.p);

    const now = Math.floor(Date.now() / 1000);
    const tradeTime = Math.floor(lastTrade.t / 1000); // Convert to seconds
    const bucketTime = Math.floor(tradeTime / interval) * interval;

    setOhlcHistory((prevHistory) => {
      const updatedHistory = { ...prevHistory };

      trades.forEach(({ p, v }) => {
        if (!updatedHistory[bucketTime]) {
          updatedHistory[bucketTime] = { open: p, high: p, low: p, close: p, volume: v };
        } else {
          const candle = updatedHistory[bucketTime];
          candle.high = Math.max(candle.high, p);
          candle.low = Math.min(candle.low, p);
          candle.close = p;
          candle.volume += v;
        }
      });

      return fillMissingCandles(updatedHistory, interval); // Fill gaps in missing candles
    });

    // Update Active Candle (For real-time candlestick updates)
    setActiveCandle((prevCandle) => {
      const open = prevCandle ? prevCandle.y[3] : lastTrade.p; // Open = Prev Close
      const high = prevCandle ? prevCandle.y[3] : lastTrade.p; // Start High as Open
      const low = prevCandle ? prevCandle.y[3] : lastTrade.p;  // Start Low as Open
      const close = lastTrade.p; // Close updates on each trade
    
      return {
        x: new Date(bucketTime * 1000),
        y: [open, high, low, close],
      };
    });
    
    

    // Update Line Chart (Keep last 100 points, and show real-time trades)
    setLineData((prev) => {
      if (prev.length > 99 && lastTrade.p === prev[prev.length - 1].y) return prev;
      return [...prev.slice(-99), { x: new Date(now * 1000), y: lastTrade.p }];
    });
    
  };

  // Function to fill gaps in candlestick data if WebSocket is slow
  const fillMissingCandles = (history, interval) => {
    const timestamps = Object.keys(history).map(Number).sort((a, b) => a - b);
    if (timestamps.length === 0) return history;
  
    let lastClose = history[timestamps[0]].close; 
  
    for (let i = 1; i < timestamps.length; i++) {
      let expectedTime = timestamps[i - 1] + interval;
      while (expectedTime < timestamps[i]) {
        history[expectedTime] = {
          open: lastClose,
          high: lastClose,
          low: lastClose,
          close: lastClose,
          volume: 0, // No new trades in this interval
        };
        expectedTime += interval;
      }
      lastClose = history[timestamps[i]].close;
    }
  
    return history;
  };
  

  return (
    <StockDataContext.Provider value={{ ohlcHistory, lineData, activeCandle, lastPrice, interval, setInterval, marketOpen, openPrice, percentChange }}>
      {children}
    </StockDataContext.Provider>
  );
};

export const useStockData = () => useContext(StockDataContext);
