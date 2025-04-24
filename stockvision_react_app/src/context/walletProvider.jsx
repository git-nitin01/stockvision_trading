import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserTransactions, getWallet } from '../services/tradeService';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState({});
  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);

  const mutateWallet = () => {
    getWallet()
      .then((res) => setWallet(res.data))
      .catch((err) => toast.error(err.message));
  }

  const mutateTransactions = () => {
    getUserTransactions(user.uid)
      .then((res) => setTransactions(res.data))
      .catch((err) => toast.error(err.message));
  }

  useEffect(() => {
    if (!user) return;
    getWallet()
      .then((res) => setWallet(res.data))
      .catch((err) => toast.error(err.message));
    
    // get user transactions
    getUserTransactions(user.uid)
      .then((res) => setTransactions(res.data))
      .catch((err) => toast.error(err.message));
  }
  , [user]);

  return (
    <WalletContext.Provider value={{ wallet, setWallet, mutateWallet, transactions, setTransactions, mutateTransactions }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
