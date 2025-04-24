import Navbar from "./components/common/Navbar";
import Layout from "./components/auth/Layout";
import StockDashboard from "./components/dashboard/StockDashboard";
import Portfolio from "./components/portfolio/Portfolio";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Orders from "./components/orders/Orders";
import { useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firebaseAuth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import tradingSocketService from "./services/tradingSocketService";
import HomePage from "./components/common/HomePage";
import { useWallet } from "./context/walletProvider";

function App() {
  const { mutateWallet, mutateTransactions } = useWallet();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        const token = user.stsTokenManager.accessToken;
        tradingSocketService.connect(token);
        const handleSocketMessage = (data) => {
          switch (data.type) {
            case 'ORDER_EXECUTED':
              mutateWallet();
              mutateTransactions();
              toast.success(`Order Executed: ${data.symbol} at $${data.priceExecuted}`);
              break;
            case 'CANCEL_CONFIRMATION':
              if (data.status === 'CANCELLED') {
                toast.info(`Order Cancelled: ${data.orderId}`);
              } else {
                toast.warn(`Order Not Found: ${data.orderId}`);
              }
              break;
            case 'USER_ORDERS':
              console.log('Received user orders');
              break;
            case 'ORDER_ERROR':
              toast.error(`Order Error: ${data.message}`);
              break;
            case 'ERROR':
              toast.error(`Error: ${data.message}`);
              break;
            default:
              console.log('Unhandled WebSocket message:', data);
          }
        };
    
        tradingSocketService.addListener(handleSocketMessage);

        return () => {
          tradingSocketService.removeListener(handleSocketMessage);
        };
      }
    })
    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <>
    <Router>
      <Navbar />
      <Layout/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={ <PrivateRoute element={<Portfolio />}/>} />
        <Route path="/stocks" element={ <PrivateRoute element={<StockDashboard />}/>} />
        <Route path="/orders" element={ <PrivateRoute element={<Orders />}/>} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      </Router>
    </>
  );
}

export default App;
