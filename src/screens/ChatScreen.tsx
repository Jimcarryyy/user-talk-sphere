
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import RealtimeIndicator from '../components/RealtimeIndicator';

const ChatScreen = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { users, getMessagesForUser, sendMessage } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatUser = users.find(u => u.id === userId);
  const messages = getMessagesForUser(userId || '');

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!userId || !message.trim()) return;

    try {
      await sendMessage(userId, message);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  if (!chatUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">User not found</p>
          <Button variant="outline" onClick={() => navigate('/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-grey-stroke/10 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
              className="mr-3"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-primary/10 text-primary">
                {chatUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="font-semibold">{chatUser.username}</h1>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          
          <RealtimeIndicator />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatScreen;
