
import { useChat } from '../contexts/ChatContext';
import { Wifi, WifiOff } from 'lucide-react';

const RealtimeIndicator = () => {
  const { isPolling } = useChat();

  return (
    <div className={`flex items-center space-x-1 text-xs ${isPolling ? 'text-green-600' : 'text-muted-foreground'}`}>
      {isPolling ? (
        <>
          <Wifi size={12} />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

export default RealtimeIndicator;
