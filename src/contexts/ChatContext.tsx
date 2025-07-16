
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: Date;
  sender_username?: string;
}

interface ChatContextType {
  users: User[];
  messages: Message[];
  sendMessage: (receiverId: string, message: string) => void;
  loadMessages: (userId: string) => Message[];
  refreshMessages: () => void;
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

// Demo users for chat (includes demo accounts + any registered users)
const DEMO_USERS = [
  { id: '1', username: 'Alice', email: 'alice@demo.com' },
  { id: '2', username: 'Bob', email: 'bob@demo.com' },
  { id: '3', username: 'Charlie', email: 'charlie@demo.com' },
  { id: '4', username: 'Diana', email: 'diana@demo.com' },
];

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Load users (demo users + registered users)
    const loadUsers = () => {
      const registeredUsers = JSON.parse(localStorage.getItem('talkSphere_users') || '[]');
      const allUsers = [
        ...DEMO_USERS,
        ...registeredUsers.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email
        }))
      ];
      
      // Remove duplicates and current user
      const uniqueUsers = allUsers.filter((u, index, self) => 
        index === self.findIndex(t => t.id === u.id) && u.id !== user?.id
      );
      
      setUsers(uniqueUsers);
    };

    if (user) {
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    // Load messages from localStorage
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

    loadMessages();
  }, []);

  // Real-time message polling
  useEffect(() => {
    if (!user) return;

    const pollMessages = () => {
      console.log('Polling for new messages...');
      const savedMessages = localStorage.getItem('talkSphere_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    };

    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = (receiverId: string, message: string) => {
    if (!user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      receiver_id: receiverId,
      message,
      timestamp: new Date(),
      sender_username: user.username
    };

    const savedMessages = JSON.parse(localStorage.getItem('talkSphere_messages') || '[]');
    const updatedMessages = [...savedMessages, newMessage];
    localStorage.setItem('talkSphere_messages', JSON.stringify(updatedMessages));
    
    setMessages(prev => [...prev, newMessage]);
    console.log('Message sent:', newMessage);
  };

  const loadMessages = (userId: string): Message[] => {
    if (!user) return [];
    
    return messages.filter(msg => 
      (msg.sender_id === user.id && msg.receiver_id === userId) ||
      (msg.sender_id === userId && msg.receiver_id === user.id)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const refreshMessages = () => {
    const savedMessages = localStorage.getItem('talkSphere_messages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  };

  return (
    <ChatContext.Provider value={{ users, messages, sendMessage, loadMessages, refreshMessages }}>
      {children}
    </ChatContext.Provider>
  );
};
