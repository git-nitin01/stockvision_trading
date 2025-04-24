import { useState } from "react";
import { Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import FundsModal from "./FundsModal";
import { useWallet } from "../../context/walletProvider";

const WalletActions = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("withdraw");
    const { wallet } = useWallet();

    const openModal = (type) => {
        setModalType(type);
        setModalOpen(true);
    };

    return (
        <Stack spacing={2} sx={{ width: "100%", mt: 2 }}>
            {
                wallet && (
                    <p className="ttext-slate-600 text-md">
                        Wallet Balance: ${wallet?.balance?.toFixed(2)}
                    </p>
                )
            }
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#1465c0",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "30px",
                        padding: "10px",
                        width: "100%",
                        "&:hover": { backgroundColor: "#0056b3" },
                    }}
                    onClick={() => openModal("deposit")}
                >
                    Deposit Funds
                </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "rgb(0, 0, 0)",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "30px",
                        padding: "10px",
                        width: "100%",
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.66))" },
                    }}
                    onClick={() => openModal("withdraw")}
                >
                    Withdraw Funds
                </Button>
            </motion.div>

            <FundsModal open={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
        </Stack>
    );
};

export default WalletActions;
