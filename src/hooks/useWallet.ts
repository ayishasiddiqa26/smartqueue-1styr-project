// Wallet management hook for student payments
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
  lastUpdated: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  jobId?: string;
}

export const useWallet = () => {
  const { userId } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize wallet with ₹200 for new users
  const initializeWallet = async (userId: string): Promise<WalletData> => {
    const initialWallet: WalletData = {
      balance: 200, // ₹200 initial balance
      transactions: [
        {
          id: `init_${Date.now()}`,
          type: 'credit',
          amount: 200,
          description: 'Welcome bonus - Initial wallet balance',
          timestamp: new Date()
        }
      ],
      lastUpdated: new Date()
    };

    await setDoc(doc(db, 'wallets', userId), initialWallet);
    return initialWallet;
  };

  // Load wallet data
  useEffect(() => {
    const loadWallet = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const walletDoc = await getDoc(doc(db, 'wallets', userId));
        
        if (walletDoc.exists()) {
          const data = walletDoc.data() as WalletData;
          // Convert timestamp strings back to Date objects
          const processedData = {
            ...data,
            lastUpdated: data.lastUpdated.toDate ? data.lastUpdated.toDate() : new Date(data.lastUpdated),
            transactions: data.transactions.map(t => ({
              ...t,
              timestamp: t.timestamp.toDate ? t.timestamp.toDate() : new Date(t.timestamp)
            }))
          };
          setWalletData(processedData);
        } else {
          // Initialize wallet for new user
          const newWallet = await initializeWallet(userId);
          setWalletData(newWallet);
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
        // Fallback to local initialization
        const fallbackWallet: WalletData = {
          balance: 200,
          transactions: [],
          lastUpdated: new Date()
        };
        setWalletData(fallbackWallet);
      }
      
      setLoading(false);
    };

    loadWallet();
  }, [userId]);

  // Deduct amount from wallet
  const deductFromWallet = async (amount: number, description: string, jobId?: string): Promise<boolean> => {
    if (!userId || !walletData || walletData.balance < amount) {
      return false;
    }

    try {
      const newTransaction: WalletTransaction = {
        id: `debit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'debit',
        amount,
        description,
        timestamp: new Date(),
        jobId
      };

      const updatedWallet: WalletData = {
        balance: walletData.balance - amount,
        transactions: [newTransaction, ...walletData.transactions].slice(0, 100), // Keep last 100 transactions
        lastUpdated: new Date()
      };

      await updateDoc(doc(db, 'wallets', userId), updatedWallet);
      setWalletData(updatedWallet);
      return true;
    } catch (error) {
      console.error('Error deducting from wallet:', error);
      return false;
    }
  };

  // Add amount to wallet
  const addToWallet = async (amount: number, description: string): Promise<boolean> => {
    if (!userId || !walletData) {
      return false;
    }

    try {
      const newTransaction: WalletTransaction = {
        id: `credit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'credit',
        amount,
        description,
        timestamp: new Date()
      };

      const updatedWallet: WalletData = {
        balance: walletData.balance + amount,
        transactions: [newTransaction, ...walletData.transactions].slice(0, 100),
        lastUpdated: new Date()
      };

      await updateDoc(doc(db, 'wallets', userId), updatedWallet);
      setWalletData(updatedWallet);
      return true;
    } catch (error) {
      console.error('Error adding to wallet:', error);
      return false;
    }
  };

  // Check if wallet has sufficient balance
  const hasSufficientBalance = (amount: number): boolean => {
    return walletData ? walletData.balance >= amount : false;
  };

  return {
    walletData,
    loading,
    deductFromWallet,
    addToWallet,
    hasSufficientBalance,
    balance: walletData?.balance || 0
  };
};