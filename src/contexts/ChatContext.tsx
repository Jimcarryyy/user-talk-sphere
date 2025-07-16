
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: Date;
  sender_username?: string;
}

interface ChatContextType {
  messages: Message[];
  users: Array<{ id: string; username: string }>;
  sendMessage: (receiver_id: string, message: string) => Promise<void>;
  getMessagesForUser: (userId: string) => Message[];
  refreshUsers: () => void;
  isPolling: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; username: string }>>([]);
  const [isPolling, setIsPolling] = useState(false);
  const { user } = useAuth();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadMessages();
    loadUsers();
  }, []);

  // Start/stop polling based on user authentication
  useEffect(() => {
    if (user) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [user]);

  const loadMessages = () => {
    const savedMessages = localStorage.getItem('talkSphere_messages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  };

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('talkSphere_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with some demo users
      const demoUsers = [
        { id: '1', username: 'Alice' },
        { id: '2', username: 'Bob' },
        { id: '3', username: 'Charlie' },
        { id: '4', username: 'Diana' }
      ];
      setUsers(demoUsers);
      localStorage.setItem('talkSphere_users', JSON.stringify(demoUsers));
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    
    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(); // Refresh messages every 2 seconds
      console.log('Polling for new messages...');
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  const refreshUsers = () => {
    // Add current user to users list if not already present
    if (user) {
      const currentUsers = JSON.parse(localStorage.getItem('talkSphere_users') || '[]');
      const userExists = currentUsers.some((u: any) => u.id === user.id);
      
      if (!userExists) {
        const updatedUsers = [...currentUsers, user];
        localStorage.setItem('talkSphere_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
      }
    }
  };

  const sendMessage = async (receiver_id: string, message: string) => {
    if (!user) throw new Error('User not logged in');

    const newMessage: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      receiver_id,
      message: message.trim(),
      timestamp: new Date(),
      sender_username: user.username
    };

    // Get current messages from localStorage (for real-time sync)
    const currentMessages = JSON.parse(localStorage.getItem('talkSphere_messages') || '[]');
    const updatedMessages = [...currentMessages, newMessage];
    
    // Update localStorage immediately
    localStorage.setItem('talkSphere_messages', JSON.stringify(updatedMessages));
    
    // Update local state
    setMessages(updatedMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })));

    console.log('Message sent:', newMessage);
  };

  const getMessagesForUser = (userId: string) => {
    if (!user) return [];
    
    return messages
      .filter(msg => 
        (msg.sender_id === user.id && msg.receiver_id === userId) ||
        (msg.sender_id === userId && msg.receiver_id === user.id)
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  return (
    <ChatContext.Provider value={{
      messages,
      users,
      sendMessage,
      getMessagesForUser,
      refreshUsers,
      isPolling
    }}>
      {children}
    </ChatContext.Provider>
  );
};
