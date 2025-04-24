const finnhubBaseUrl = import.meta.env.VITE_FINNHUB_URL;
const finnhubToken = import.meta.env.VITE_FINNHUB_API_KEY;
const finnhubRestBaseUrl = import.meta.env.VITE_FINNHUB_REST_URL;
const fmpBaseUrl = import.meta.env.VITE_FMP_URL;
const fmpToken = import.meta.env.VITE_FMP_API_KEY;

// Open WebSocket connection
const openConnection = () => {
  const socket = new WebSocket(`${finnhubBaseUrl}?token=${finnhubToken}`);

  socket.onopen = () => console.log("WebSocket connection opened.");
  socket.onerror = (error) => console.error("WebSocket error:", error);
  socket.onclose = () => console.log("WebSocket connection closed.");

  return socket;
};

// Subscribe to stock updates
const subscribe = (socket, symbol) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "subscribe", symbol }));
  } else {
    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "subscribe", symbol }));
    });
  }
};

// Unsubscribe from stock updates
const unsubscribe = (socket, symbol) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "unsubscribe", symbol }));
  }
};

const fetchData = async (symbol) => {
  try {
    const response = await fetch(
      `${fmpBaseUrl}/historical-price-full/${symbol}?from=2023-01-01&apikey=${fmpToken}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Ensure data exists and transform it into the required format
    if (!json.historical || json.historical.length === 0) {
      throw new Error("No historical data found");
    }

    return json.historical.map((entry) => ({
      time: entry.date,
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume,
      adjClose: entry.adjClose,
    }));
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return [];
  }
};

const fetchIntradayData = async (symbol) => {
  try {
    // Get current UTC time and subtract 24 hours
    const now = new Date();
    const fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Format dates as YYYY-MM-DD
    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = now.toISOString().split("T")[0];

    const response = await fetch(
      `${fmpBaseUrl}/historical-chart/5min/${symbol}?from=${fromDateString}&to=${toDateString}&apikey=${fmpToken}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Ensure data exists
    if (!json || json.length === 0) {
      throw new Error("No intraday data found");
    }

    // Transform the response into the required format
    return json.map((entry) => ({
      time: entry.date, // Date string (e.g., "2024-03-02 14:55:00")
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume,
    }));
  } catch (error) {
    console.error("Error fetching intraday stock data:", error);
    return [];
  }
};

// Check if the market is open using Finnhub's Market Status API
const checkMarketStatus = async () => {
  try {
    const response = await fetch(
      `${finnhubRestBaseUrl}/stock/market-status?exchange=US&token=${finnhubToken}`
    );
    const data = await response.json();

    if (!data || typeof data.isOpen === "undefined") {
      throw new Error("Invalid market status response");
    }

    if (data.session !== null) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    console.error("Error checking market status:", error);
    return false; // Default to closed if there's an error
  }
};

const getOpenPriceAndPercentChange = async (symbol) => {
  try {
    const response = await fetch(
      `${fmpBaseUrl}/quote/${symbol}?apikey=${fmpToken}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Ensure data exists
    if (!json || json.length === 0) {
      throw new Error("No quote data found");
    }

    return {
      open: json[0].open,
      percentChange: json[0].changesPercentage,
    };
  } catch (error) {
    console.error("Error fetching stock quote data:", error);
    return { open: 0, percentChange: 0 };
  }
}

export { openConnection, subscribe, unsubscribe, fetchIntradayData, checkMarketStatus, fetchData, getOpenPriceAndPercentChange };
