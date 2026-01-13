// Wallet management hook for student payments
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
  lastUpdated: Timestamp | Date;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Timestamp | Date;
  jobId?: string;
}

export const useWallet = () => {
  const { userId } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet with ₹200 for new users
  const initializeWallet = async (userId: string): Promise<WalletData> => {
    const initialWallet = {
      balance: 200, // ₹200 initial balance for demo
      transactions: [
        {
          id: `init_${Date.now()}`,
          type: 'credit' as const,
          amount: 200,
          description: '🎉 Welcome Bonus - Demo Wallet',
          timestamp: Timestamp.now()
        }
      ],
      lastUpdated: Timestamp.now()
    };

    try {
      await setDoc(doc(db, 'users', userId, 'wallet', 'data'), initialWallet);
      console.log('✅ Demo wallet initialized with ₹200');
      return {
        ...initialWallet,
        lastUpdated: initialWallet.lastUpdated.toDate(),
        transactions: initialWallet.transactions.map(t => ({
          ...t,
          timestamp: t.timestamp.toDate()
        }))
      };
    } catch (error) {
      console.error('❌ Failed to initialize wallet in Firestore:', error);
      // Return local wallet as fallback
      return {
        balance: 200,
        transactions: [{
          id: `init_${Date.now()}`,
          type: 'credit' as const,
          amount: 200,
          description: '🎉 Welcome Bonus - Demo Wallet',
          timestamp: new Date()
        }],
        lastUpdated: new Date()
      };
    }
  };

  // Real-time wallet listener
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up wallet listener for user:', userId);
    setLoading(true);
    setError(null);

    const walletRef = doc(db, 'users', userId, 'wallet', 'data');
    
    const unsubscribe = onSnapshot(
      walletRef,
      async (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            // Convert Firestore timestamps to Date objects
            const processedData: WalletData = {
              balance: data.balance || 200,
              lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate() : new Date(data.lastUpdated),
              transactions: (data.transactions || []).map((t: any) => ({
                ...t,
                timestamp: t.timestamp instanceof Timestamp ? t.timestamp.toDate() : new Date(t.timestamp)
              }))
            };
            console.log('💰 Wallet data updated:', { balance: processedData.balance, transactions: processedData.transactions.length });
            setWalletData(processedData);
          } else {
            console.log('🆕 No wallet found, initializing...');
            const newWallet = await initializeWallet(userId);
            setWalletData(newWallet);
          }
        } catch (error) {
          console.error('❌ Error processing wallet data:', error);
          setError('Failed to load wallet data');
          // Create fallback wallet
          const fallbackWallet: WalletData = {
            balance: 200,
            transactions: [{
              id: `fallback_${Date.now()}`,
              type: 'credit',
              amount: 200,
              description: '🔄 Fallback Demo Wallet',
              timestamp: new Date()
            }],
            lastUpdated: new Date()
          };
          setWalletData(fallbackWallet);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Wallet listener error:', error);
        setError('Failed to connect to wallet service');
        setLoading(false);
        // Create fallback wallet
        const fallbackWallet: WalletData = {
          balance: 200,
          transactions: [{
            id: `fallback_${Date.now()}`,
            type: 'credit',
            amount: 200,
            description: '🔄 Offline Demo Wallet',
            timestamp: new Date()
          }],
          lastUpdated: new Date()
        };
        setWalletData(fallbackWallet);
      }
    );

    return () => {
      console.log('🔌 Cleaning up wallet listener');
      unsubscribe();
    };
  }, [userId]);

  // Deduct amount from wallet (secure server-side simulation)
  const deductFromWallet = async (amount: number, description: string, jobId?: string): Promise<{ success: boolean; message: string; newBalance?: number }> => {
    if (!userId || !walletData) {
      console.error('❌ Wallet deduction failed: No user or wallet data');
      return { success: false, message: 'Wallet not available. Please try again.' };
    }

    if (walletData.balance < amount) {
      console.error(`❌ Insufficient balance: Have ₹${walletData.balance}, Need ₹${amount}`);
      return { 
        success: false, 
        message: `Insufficient balance. You have ₹${walletData.balance}, but need ₹${amount}. Please add funds to your demo wallet.` 
      };
    }

    try {
      console.log(`💳 Processing wallet payment: ₹${amount}`);
      
      const newTransaction = {
        id: `debit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'debit' as const,
        amount,
        description,
        timestamp: Timestamp.now(),
        jobId
      };

      const newBalance = walletData.balance - amount;
      const updatedWallet = {
        balance: newBalance,
        transactions: [newTransaction, ...walletData.transactions.slice(0, 99)], // Keep last 100 transactions
        lastUpdated: Timestamp.now()
      };

      // Update Firestore
      await updateDoc(doc(db, 'users', userId, 'wallet', 'data'), updatedWallet);
      
      console.log(`✅ Wallet payment successful: ₹${amount} deducted, new balance: ₹${newBalance}`);
      return { 
        success: true, 
        message: `Payment successful! ₹${amount} deducted from wallet.`,
        newBalance 
      };
    } catch (error) {
      console.error('❌ Error processing wallet payment:', error);
      return { 
        success: false, 
        message: 'Payment processing failed. Please try again.' 
      };
    }
  };

  // Add amount to wallet (for demo purposes)
  const addToWallet = async (amount: number, description: string): Promise<boolean> => {
    if (!userId || !walletData) return false;

    try {
      const newTransaction = {
        id: `credit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'credit' as const,
        amount,
        description,
        timestamp: Timestamp.now()
      };

      const updatedWallet = {
        balance: walletData.balance + amount,
        transactions: [newTransaction, ...walletData.transactions.slice(0, 99)],
        lastUpdated: Timestamp.now()
      };

      await updateDoc(doc(db, 'users', userId, 'wallet', 'data'), updatedWallet);
      console.log(`✅ Added ₹${amount} to wallet`);
      return true;
    } catch (error) {
      console.error('❌ Error adding to wallet:', error);
      return false;
    }
  };

  // Check if wallet has sufficient balance
  const hasSufficientBalance = (amount: number): boolean => {
    const sufficient = walletData ? walletData.balance >= amount : false;
    console.log(`💰 Balance check: Need ₹${amount}, Have ₹${walletData?.balance || 0}, Sufficient: ${sufficient}`);
    return sufficient;
  };

  return {
    walletData,
    loading,
    error,
    deductFromWallet,
    addToWallet,
    hasSufficientBalance,
    balance: walletData?.balance || 0
  };
};