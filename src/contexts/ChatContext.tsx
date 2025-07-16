
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const { user } = useAuth();

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('talkSphere_messages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }

    // Load users from localStorage
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
  }, []);

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

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('talkSphere_messages', JSON.stringify(updatedMessages));

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
      refreshUsers
    }}>
      {children}
    </ChatContext.Provider>
  );
};
