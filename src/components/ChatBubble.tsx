
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: Date;
  sender_username?: string;
}

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

const ChatBubble = ({ message, isOwn }: ChatBubbleProps) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs ${isOwn ? 'message-bubble-sent' : 'message-bubble-received'}`}>
        <p className="text-sm">{message.message}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {format(message.timestamp, 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
