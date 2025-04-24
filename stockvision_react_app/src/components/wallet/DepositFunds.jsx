import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import axiosInstance from "../../utils/interceptors";
import { Card, TextField, Button, Typography, CircularProgress, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { useWallet } from "../../context/walletProvider";

const DepositFunds = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeposit = async () => {
    if (!stripe || !elements) {
      setMessage("Stripe is not properly initialized.");
      return;
    }
    if (!amount || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axiosInstance.post("/wallet/deposit", { amount });

      if (response.data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      } else {
        setMessage("Error: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      setMessage("Error processing payment: " + (error.response?.data?.error || error.message));
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          p: 3,
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          background: "linear-gradient(45deg,rgba(26, 34, 126, 0.7),rgba(13, 72, 161, 0.8))",
          color: "white",
          textAlign: "center",
          width: "100%",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Deposit Funds
        </Typography>

        <TextField
          label="Enter Amount"
          type="number"
          variant="outlined"
          fullWidth
          sx={{
              my: 2,
              input: { color: "white" },
              label: { color: "rgba(255,255,255,0.8)" },
              "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white", borderRadius: "10px" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
              },
          }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {message && <Alert severity="error" sx={{ my: 1 }}>{message}</Alert>}

        <Button
          variant="contained"
          fullWidth
          onClick={handleDeposit}
          disabled={loading}
          sx={{ borderRadius: "20px", mt: 2, py: 1.5, backgroundColor: "#1465c0 !important" }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Deposit"}
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ borderRadius: "20px", mt: 1, py: 1.5, backgroundColor: "#000 !important" }}
        >
          Cancel
        </Button>
      </Card>
    </motion.div>
  );
};

export default DepositFunds;
