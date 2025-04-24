import axiosInstance from "../utils/interceptors";

export const placeOrder = async (order) => {
  try {
    return await axiosInstance.post("/orders/buy", order);
  } catch (error) {
    console.log("Failed to place order:", error);
    throw error;
  }
}

export const sellOrder = async (order) => {
  try {
    return await axiosInstance.post("/orders/sell", order);
  } catch (error) {
    console.log("Failed to place order:", error);
    throw error;
  }
}

export const getPortfolio = async () => {
  try {
    return await axiosInstance.get("/portfolio");
  } catch (error) {
    console.log("Failed to fetch portfolio:", error);
    throw error;
  }
}

export const getExecutedOrders = async () => {
  try {
    return await axiosInstance.get("/orders/history");
  } catch (error) {
    console.log("Failed to fetch orders:", error);
    throw error;
  }
}

export const getWallet = async () => {
  try {
    return await axiosInstance.get("/wallet");
  } catch (error) {
    console.log("Failed to fetch wallet:", error);
    throw error;
  }
}

export const getUserTransactions = async (userId) => {
  try {
    return await axiosInstance.get(`/transactions/user/${userId}`);
  } catch (error) {
    console.log("Failed to fetch transactions:", error);
    throw error;
  }
}
