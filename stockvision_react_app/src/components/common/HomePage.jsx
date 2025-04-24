import { Button, Typography, Container, Stack, Box } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InsightsIcon from '@mui/icons-material/Insights';
import { openAuth } from "../../store/slices/popperSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const navigateUser = ()=>{
        if(user) navigate("/stocks");
        else dispatch(openAuth());
    }

  return (
    <div>
        <div className="w-[90vw] mx-auto bg-white mt-12">
        <section className="py-24 text-center text-white rounded-[5rem]" style={{ background: "oklch(0.623 0.214 259.815)" }}>
            <Container maxWidth="lg">
            <Typography variant="h2" className="text-5xl font-extrabold mb-4">
                Welcome to StockVision
            </Typography>
            <Typography variant="h5" className="text-xl opacity-90 mb-6">
                Unlock the power of AI-driven stock predictions and portfolio management.
            </Typography>
            <Button
                variant="contained"
                sx={{
                mt: 2,
                backgroundColor: "black",
                color: "white",
                fontSize: "1.2rem",
                px: 5, py: 2,
                borderRadius: "30px",
                "&:hover": { backgroundColor: "gray" },
                transition: "0.3s ease-in-out",
                }}
                onClick={navigateUser}
            >
                 {user ? "Explore Your Dashboard" : "Get Started"}
            </Button>
            </Container>
        </section>

        <section className="py-24">
            <Container maxWidth="lg">
            <Typography variant="h4" className="text-center text-4xl font-bold mb-12 text-blue-900">
                Why Choose StockVision?
            </Typography>
            <Stack spacing={6} direction={{ xs: "column", md: "row" }} justifyContent="center">
                {[ 
                { icon: <TrendingUpIcon fontSize="large" />, title: "Real-Time Stock Insights", desc: "Get the latest stock market trends and updates in real time." },
                { icon: <ShieldIcon fontSize="large" />, title: "Secure & Reliable", desc: "Your financial data is protected with advanced security protocols." },
                { icon: <AccountBalanceIcon fontSize="large" />, title: "Smart Portfolio Management", desc: "Track and optimize your investment portfolio with ease." },
                { icon: <InsightsIcon fontSize="large" />, title: "AI-Powered Stock Predictions", desc: "Leverage machine learning to predict stock performance." }
                ].map((item, index) => (
                <Box key={index} className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-2xl transition-all w-full md:w-1/4">
                    <div className="flex justify-center text-blue-900 mb-4">{item.icon}</div>
                    <Typography variant="h6" className="text-xl font-semibold mb-2">
                    {item.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 leading-relaxed">
                    {item.desc}
                    </Typography>
                </Box>
                ))}
            </Stack>
            </Container>
        </section>
        <section className="py-24 text-center text-white rounded-[5rem]" style={{ background: "oklch(0.623 0.214 259.815)" }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" className="text-4xl font-semibold mb-6">
                    Real Users, Real Success
                    </Typography>
                    <Typography variant="h6" className="text-xl opacity-90 mb-12">
                    Hear from our users who have transformed their investments with StockVision.
                    </Typography>
                    <Stack spacing={6} direction={{ xs: "column", md: "row" }} justifyContent="center">
                    {[
                        { name: "John Doe", quote: "StockVision helped me make smarter stock picks and grow my portfolio by 20% in 6 months." },
                        { name: "Jane Smith", quote: "The AI-powered predictions made it easy to track and optimize my investments." }
                    ].map((testimonial, index) => (
                        <Box key={index} className="bg-white text-gray-600 p-8 rounded-2xl shadow-lg text-center w-full md:w-1/3">
                        <Typography variant="h6" className="text-lg font-semibold mb-4">"{testimonial.quote}"</Typography>
                        <Typography variant="body2" className="font-medium">- {testimonial.name}</Typography>
                        </Box>
                    ))}
                    </Stack>
                </Container>
            </section>


        </div>
        <footer className="text-blue-500 py-6 text-center">
            <Typography variant="body2">
            © 2025 StockVision, All Rights Reserved
            </Typography>
        </footer>
    </div>
  );
};

export default HomePage;
