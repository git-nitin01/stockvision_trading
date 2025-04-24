import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { setupInterceptor } from './utils/interceptors.js';
import { authObserver } from './services/firebaseAuth.js';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { WalletProvider } from "./context/walletProvider";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

setupInterceptor()
authObserver();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </Elements>
    </Provider>
  </StrictMode>
)
