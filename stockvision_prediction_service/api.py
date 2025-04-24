from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import tensorflow as tf
import json
import yfinance as yf
import ta
from datetime import datetime, timedelta
import pandas_market_calendars as mcal
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # Allow all origins (Change to frontend URL in production)
  allow_credentials=True,
  allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
  allow_headers=["*"],  # Allow all headers
)

MODEL_PATH = "trained_models/"
SCALER_PATH = "data_pipeline/scalers/"

LISTED_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "JNJ", "V",
  "PG", "DIS", "MA", "PYPL", "NFLX", "ADBE", "INTC", "CMCSA", "PFE", "KO",
  "PEP", "CSCO", "XOM", "ABT", "CRM", "NKE", "MRK", "WMT", "T", "BAC",
  "MCD", "COST", "CVX", "MDT", "NEE", "LLY", "HON", "ORCL", "AVGO", "TXN",
  "UNH", "QCOM", "BMY", "IBM", "AMD", "AMAT", "GE", "CAT", "MMM", "GS"
]

class StockRequest(BaseModel):
  symbol: str

# Function to fetch latest stock data
def fetch_latest_stock_data(stock_symbol):
    """Fetches the latest 180 days of stock data and applies technical indicators."""
    stock = yf.Ticker(stock_symbol)
    df = stock.history(period="1y")  # Fetch more data (ensure 180 days exist)

    if df.empty:
        raise HTTPException(status_code=400, detail=f"No recent data found for {stock_symbol}")

    # Keep only relevant columns
    df = df[['Close', 'Open', 'High', 'Low', 'Volume']].copy()

    # Compute technical indicators
    df["SMA_20"] = ta.trend.sma_indicator(df["Close"], window=20)
    df["SMA_50"] = ta.trend.sma_indicator(df["Close"], window=50)
    df["EMA_20"] = ta.trend.ema_indicator(df["Close"], window=20)
    df["RSI"] = ta.momentum.rsi(df["Close"], window=14)
    df["MACD"] = ta.trend.macd(df["Close"])
    df["Bollinger_Upper"] = ta.volatility.bollinger_hband(df["Close"], window=20)
    df["Bollinger_Lower"] = ta.volatility.bollinger_lband(df["Close"], window=20)

    df.dropna(inplace=True)  # Drop NaN values

    # Ensure exactly 180 rows
    if len(df) < 180:
        raise HTTPException(status_code=400, detail=f"Not enough historical data for {stock_symbol}")

    return df[-180:]  # Return exactly 180 rows

def inverse_transform_predictions(y_pred, scaler):
  """Inverse transforms predictions using the saved MinMaxScaler."""
  num_samples, pred_days, num_features = y_pred.shape  # (samples, 20, 5)

  # Reshape from (samples, 20, 5) → (samples * days, 5)
  y_pred_reshaped = y_pred.reshape(-1, num_features)

  # Fix: Create a placeholder array for all 12 features
  temp = np.zeros((y_pred_reshaped.shape[0], 12))  # Placeholder for 12 features
  temp[:, :5] = y_pred_reshaped  # Fill first 5 columns with predictions

  # Apply inverse transform (restoring real values)
  temp_original = scaler.inverse_transform(temp)

  # Extract only the first 5 columns (Close, Open, High, Low, Volume)
  y_pred_original = temp_original[:, :5]

  # Reshape back to (samples, 20, 5)
  return y_pred_original.reshape(num_samples, pred_days, num_features)

# Function to generate predictions
def generate_predictions(stock_symbol, latest_data):

  X_input = latest_data.values[-180:].reshape(1, 180, 12)

  with open("trained_models/best_models.json", "r") as f:
    best_models = json.load(f)

  best_model_type = best_models.get(stock_symbol, "General")
  model_path = f"{MODEL_PATH}{'fine_tuned' if best_model_type == 'Fine-Tuned' else 'hybrid'}/{stock_symbol}.keras"

  model = tf.keras.models.load_model(model_path)

  y_pred_scaled = model.predict(X_input)
  y_pred_scaled = np.clip(y_pred_scaled, 0, 1)
  y_pred_scaled = y_pred_scaled.reshape(1, 20, 5)

  scaler_path = f"{SCALER_PATH}{stock_symbol}_scaler.pkl"
  scaler = joblib.load(scaler_path)
  y_pred_original = inverse_transform_predictions(y_pred_scaled, scaler)

  latest_real_values = latest_data.iloc[-1][["Open", "High", "Low", "Close", "Volume"]].values
  predicted_avg_values = np.mean(y_pred_original[:, :, :], axis=1)[0]

  correction_factors = np.where(predicted_avg_values != 0, latest_real_values / predicted_avg_values, 1)
  y_pred_adjusted = y_pred_original * correction_factors

  for i in range(20):
    open_price, high, low, close, volume = y_pred_adjusted[0, i]

    if low > high:
      low, high = high, low

    open_price = min(max(open_price, low), high)
    close = min(max(close, low), high)

    y_pred_adjusted[0, i, 0] = open_price
    y_pred_adjusted[0, i, 1] = high
    y_pred_adjusted[0, i, 2] = low
    y_pred_adjusted[0, i, 3] = close

  market_days = get_next_market_days(20)

  return y_pred_adjusted, market_days


def generate_overall_action(predicted_data, base_threshold=5):
  """Determines Buy, Sell, or Hold based on predicted short-term price movement and volume trends."""

  # Convert predicted data (20 days) to DataFrame
  predicted_df = pd.DataFrame(predicted_data[0], columns=["Open", "High", "Low", "Close", "Volume"])

  # Get predicted closing prices and volumes
  predicted_closes = predicted_df["Close"]

  # Reference values (Day 1)
  start_price = predicted_closes.iloc[0]

  # Calculate % changes over 5 days
  pct_changes = ((predicted_closes.iloc[1:6] - start_price) / start_price) * 100

  # Calculate average change to dynamically adjust threshold
  avg_change = pct_changes.mean()

  # Decision Rules
  if avg_change > base_threshold:
    return "BUY"
  elif avg_change < 2:
    return "SELL"
  else:
    return "HOLD"



# Function to get next market days
def get_next_market_days(n_days):
  """Returns the next `n_days` valid stock market trading days (excludes weekends & holidays)."""
  nyse = mcal.get_calendar("NYSE")  # Get NYSE market calendar
  start_date = datetime.today() + timedelta(days=1)  # Start from tomorrow
  end_date = start_date + timedelta(days=40)  # Buffer for skipping weekends & holidays

  # Get all valid trading days within range
  market_days = nyse.valid_days(start_date=start_date, end_date=end_date)

  # Convert to list of strings in YYYY-MM-DD format
  return [str(date.date()) for date in market_days[:n_days]]  

# FastAPI Route for Predictions
@app.post("/predict")
async def predict(request: StockRequest):
  try:
    symbol = request.symbol.upper()

    if symbol not in LISTED_STOCKS:
      raise HTTPException(status_code=400, detail=f"{symbol} is not a listed stock.")
    
    latest_data = fetch_latest_stock_data(symbol)

    predictions, market_days = generate_predictions(symbol, latest_data)

    # round off predictions to 3 decimal places
    predictions = np.round(predictions, 3)

    response = {
      "stock": symbol,
      "predictions": [
        {"date": market_days[i], "open": float(predictions[0, i, 0]), "high": float(predictions[0, i, 1]),
         "low": float(predictions[0, i, 2]), "close": float(predictions[0, i, 3]), "volume": float(predictions[0, i, 4])}
        for i in range(20)
      ],
      "overall_action": generate_overall_action(predictions)
    }
    
    return response
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  
@app.post("/stockdata")
async def get_stock_data(request: StockRequest):
  try:
    symbol = request.symbol.upper()
    if not symbol:
      raise HTTPException(status_code=400, detail="Symbol is required")

    # Fetch historical data (past 20 days + today)
    today = datetime.today()
    start_date = today - timedelta(days=20)

    stock = yf.Ticker(symbol)
    historical = stock.history(start=start_date.strftime("%Y-%m-%d"), end=today.strftime("%Y-%m-%d"))

    if historical.empty:
      raise HTTPException(status_code=404, detail="No historical data found")

    # Convert historical data to a list (convert NumPy types to Python types)
    historical_data = []
    for date, row in historical.iterrows():
      historical_data.append({
        "date": date.strftime("%Y-%m-%d"),
        "open": float(row["Open"]),
        "high": float(row["High"]),
        "low": float(row["Low"]),
        "close": float(row["Close"]),
        "volume": int(row["Volume"])
      })

    return {
      "stock": symbol,
      "historical": historical_data
    }

  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  
@app.get("/listedstocks")
async def get_listed_stocks():
  return {"stocks": LISTED_STOCKS}

if __name__ == "__main__":
  actions = {}
  for stock in LISTED_STOCKS:
    latest_data = fetch_latest_stock_data(stock)
    predict, _ = generate_predictions(stock, latest_data)
    actions[stock] = generate_overall_action(predict)
  
  json.dump(actions, open("actions.json", "w"))
  