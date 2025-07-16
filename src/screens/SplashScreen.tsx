
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

const SplashScreen = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/users');
        } else {
          navigate('/login');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <MessageCircle size={64} className="text-primary animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-primary mb-2">TalkSphere</h1>
        <p className="text-muted-foreground mb-8">Connect. Chat. Share.</p>
        
        <div className="flex justify-center">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
