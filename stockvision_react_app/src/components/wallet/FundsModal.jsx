import { Modal, Box, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import WithdrawFunds from "./WithdrawFunds";
import DepositFunds from "./DepositFunds"; 

const FundsModal = ({ open, onClose, type }) => {
    return (
        <Modal open={open} onClose={onClose} aria-labelledby="funds-modal">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "transparent",
                    p: 3,
                    borderRadius: 2,
                    outline: "none",
                }}
            >
                <Box display="flex" justifyContent="end" sx={{ mb: 1 }}>
                    <IconButton onClick={onClose} sx={{ color: "#1465c0", bgcolor: "#fff", float: "right", "&:hover": { bgcolor: "#1465c0", color: "#fff" } }}>
                        <Close />
                    </IconButton>
                </Box>

                {type === "withdraw" ? <WithdrawFunds onClose={onClose} /> : <DepositFunds onClose={onClose} />}
            </Box>
        </Modal>
    );
};

export default FundsModal;
