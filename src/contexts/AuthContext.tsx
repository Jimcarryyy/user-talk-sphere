
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  signup: (username: string) => Promise<void>;
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

  const signup = async (username: string) => {
    try {
      // Check if username already exists
      const existingUsers = JSON.parse(localStorage.getItem('talkSphere_users') || '[]');
      const userExists = existingUsers.some((u: User) => u.username.toLowerCase() === username.toLowerCase());
      
      if (userExists) {
        throw new Error('Username already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username: username.trim()
      };
      
      // Add to users list
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('talkSphere_users', JSON.stringify(updatedUsers));
      
      // Save current user session
      localStorage.setItem('talkSphere_user', JSON.stringify(newUser));
      setUser(newUser);
      
      console.log('User signed up:', newUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (username: string) => {
    try {
      // Check if user exists
      const existingUsers = JSON.parse(localStorage.getItem('talkSphere_users') || '[]');
      const existingUser = existingUsers.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
      
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      // Save current user session
      localStorage.setItem('talkSphere_user', JSON.stringify(existingUser));
      setUser(existingUser);
      
      console.log('User logged in:', existingUser);
    } catch (error) {
      console.error('Login error:', error);
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
