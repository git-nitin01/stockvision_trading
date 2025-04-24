import React, { useState } from "react";
import { Drawer, Button, Typography, IconButton, Divider, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { logout } from "../../services/firebaseAuth";
import { useNavigate } from "react-router-dom";
import WalletActions from "../wallet/WalletActions";
import { useSelector } from "react-redux";
import Transactions from "../wallet/Transactions";

const UserProfileDrawer = () => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const closeProfileDrawer = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ borderRadius: "20px", backgroundColor: "#1465c0", color: "white" }}
      >
        Profile
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={closeProfileDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: "fit-content",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            borderRadius: "30px 0 0 30px",
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {user ? `${user.displayName}'s Profile` : "Profile"}
          </Typography>
          <IconButton onClick={closeProfileDrawer} sx={{ color: "#A4B0C0", "&:hover": { bgcolor: "#1465c0", color: "#fff" }}}>
            <CloseIcon sx={{
              fontSize: "30px",
              padding: "0",
              margin: "0"
            }}/>
          </IconButton>
        </Box>

        <Divider sx={{ backgroundColor: "#A4B0C0", marginBottom: "20px" }} />

        {user ? (
          <Box>
            <Typography className="text-slate-600 text-md">
              {user.email}
            </Typography>

            <WalletActions />

            <div style={{ marginTop: "3em" }}>
              <Typography className="text-slate-600 text-md">
                Recent Transactions
              </Typography>
              <Transactions />
            </div>
          </Box>
        ) : (
          <Typography>No user information available.</Typography>
        )}

        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{
            borderRadius: "10px",
            padding: "10px",
            marginTop: "auto",
            backgroundColor: "#E63946",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Drawer>
    </>
  );
};

export default UserProfileDrawer;
