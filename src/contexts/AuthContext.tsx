
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Demo accounts for testing
const DEMO_ACCOUNTS = [
  { id: '1', username: 'Alice', email: 'alice@demo.com', password: 'password123' },
  { id: '2', username: 'Bob', email: 'bob@demo.com', password: 'password123' },
  { id: '3', username: 'Charlie', email: 'charlie@demo.com', password: 'password123' },
  { id: '4', username: 'Diana', email: 'diana@demo.com', password: 'password123' },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('talkSphere_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check demo accounts first
      const demoUser = DEMO_ACCOUNTS.find(
        account => account.email.toLowerCase() === email.toLowerCase() && account.password === password
      );

      if (demoUser) {
        const user: User = {
          id: demoUser.id,
          username: demoUser.username,
          email: demoUser.email
        };
        
        localStorage.setItem('talkSphere_user', JSON.stringify(user));
        setUser(user);
        console.log('Demo user logged in:', user);
        return;
      }

      // Check registered users
      const existingUsers = JSON.parse(localStorage.getItem('talkSphere_users') || '[]');
      const existingUser = existingUsers.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!existingUser) {
        throw new Error('Invalid email or password');
      }
      
      const user: User = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email
      };
      
      localStorage.setItem('talkSphere_user', JSON.stringify(user));
      setUser(user);
      console.log('User logged in:', user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      // Check if email already exists in demo accounts
      const demoEmailExists = DEMO_ACCOUNTS.some(account => 
        account.email.toLowerCase() === email.toLowerCase()
      );
      
      if (demoEmailExists) {
        throw new Error('Email already exists in demo accounts');
      }

      // Check if email or username already exists in registered users
      const existingUsers = JSON.parse(localStorage.getItem('talkSphere_users') || '[]');
      const emailExists = existingUsers.some((u: any) => 
        u.email.toLowerCase() === email.toLowerCase()
      );
      const usernameExists = existingUsers.some((u: any) => 
        u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (emailExists) {
        throw new Error('Email already exists');
      }
      
      if (usernameExists) {
        throw new Error('Username already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        email: email.trim(),
        password: password
      };
      
      // Add to users list
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('talkSphere_users', JSON.stringify(updatedUsers));
      
      // Save current user session
      const user: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      };
      
      localStorage.setItem('talkSphere_user', JSON.stringify(user));
      setUser(user);
      
      console.log('User signed up:', user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('talkSphere_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
