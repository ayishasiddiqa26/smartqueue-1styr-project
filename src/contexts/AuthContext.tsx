import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

type UserRole = 'student' | 'admin' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  showLoginFirst: boolean;
  login: (email: string, password: string, expectedRole?: 'student' | 'admin') => Promise<void>;
  register: (email: string, password: string, role: 'student' | 'admin', studentId?: string) => Promise<void>;
  logout: () => Promise<void>;
  proceedToDashboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showLoginFirst, setShowLoginFirst] = useState(true);

  useEffect(() => {
    // Check if Firebase is properly configured
    const checkConfiguration = () => {
      try {
        // Check if Firebase config has placeholder values
        const isPlaceholder = auth.app.options.apiKey === 'your-api-key-here' ||
                             auth.app.options.projectId === 'your-project-id';
        
        setIsConfigured(!isPlaceholder);
        
        if (isPlaceholder) {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Firebase configuration error:', error);
        setIsConfigured(false);
        setLoading(false);
        return;
      }
    };

    checkConfiguration();

    if (!isConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isConfigured]);

  const login = async (email: string, password: string, expectedRole?: 'student' | 'admin') => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured. Please check your configuration.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // If expectedRole is provided, verify the user's role matches
    if (expectedRole) {
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        if (userRole !== expectedRole) {
          // Sign out the user and throw an error
          await signOut(auth);
          throw new Error(`Access denied. This account is registered as ${userRole}, not ${expectedRole}.`);
        }
      } else {
        await signOut(auth);
        throw new Error('User profile not found. Please contact support.');
      }
    }
  };

  const register = async (email: string, password: string, userRole: 'student' | 'admin', studentId?: string) => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured. Please check your configuration.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store user role and additional info in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      role: userRole,
      studentId: studentId || null,
      createdAt: new Date()
    });
  };

  const logout = async () => {
    if (!isConfigured) {
      return;
    }
    await signOut(auth);
    // Reset to show login first when user logs out
    setShowLoginFirst(true);
  };

  const proceedToDashboard = () => {
    setShowLoginFirst(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      role, 
      userId: user?.uid || null,
      user,
      loading,
      isConfigured,
      showLoginFirst,
      login, 
      register,
      logout,
      proceedToDashboard
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
