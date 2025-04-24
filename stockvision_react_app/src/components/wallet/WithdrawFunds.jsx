import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import axiosInstance from "../../utils/interceptors";
import { Card, TextField, Button, Typography, CircularProgress, Alert, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useWallet } from "../../context/walletProvider";

const WithdrawFunds = ({ onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { mutateWallet, mutateTransactions } = useWallet();

    const handleWithdraw = async () => {
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

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement),
        });

        if (error) {
            setMessage("Error: " + error.message);
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post("/wallet/withdraw", {
                amount: amount,
                paymentMethodId: paymentMethod.id
            });

            if (response.data.message) {
                setMessage(response.data.message);
                onClose();
                mutateWallet();
                mutateTransactions();
            } else {
                setMessage("Error: " + response.data.error);
            }
        } catch (err) {
            setMessage("Error processing withdrawal: " + (err.response?.data?.error || err.message));
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
                    p: 4,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    background: "linear-gradient(45deg,rgba(26, 34, 126, 0.7),rgba(13, 72, 161, 0.8))",
                    color: "white",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: 400,
                    position: "relative",
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Withdraw Funds
                </Typography>

                <Box
                    sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        padding: 2,
                        my: 2,
                        boxShadow: "inset 0 0 8px rgba(255,255,255,0.2)"
                    }}
                >
                    <Typography variant="body2" color="white" sx={{ textAlign: "left", mb: 1 }}>
                        Card Details
                    </Typography>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    color: "#ffffff",
                                    "::placeholder": { color: "rgba(255,255,255,0.7)" },
                                },
                                invalid: { color: "#ff4c4c" },
                            },
                        }}
                    />
                </Box>

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

                {message && (
                    <Alert
                        severity={message.includes("successful") ? "success" : "error"}
                        sx={{ my: 2, background: "rgba(255,255,255,0.2)", color: "white" }}
                    >
                        {message}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleWithdraw}
                    disabled={loading}
                    sx={{
                        borderRadius: "30px",
                        mt: 2,
                        py: 1.5,
                        background: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": { background: "rgba(255,255,255,0.5)" },
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Withdraw"}
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={onClose}
                    sx={{
                        borderRadius: "30px",
                        mt: 1,
                        py: 1.5,
                        color: "white",
                        borderColor: "rgba(255,255,255,0.5)",
                        "&:hover": { borderColor: "white" },
                    }}
                >
                    Cancel
                </Button>
            </Card>
        </motion.div>
    );
};

export default WithdrawFunds;
