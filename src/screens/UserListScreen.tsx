
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, LogOut, Users } from 'lucide-react';

const UserListScreen = () => {
  const { user, logout } = useAuth();
  const { users, refreshUsers } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const availableUsers = users.filter(u => u.id !== user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-grey-stroke/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <MessageCircle size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TalkSphere</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user?.username}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users size={20} className="mr-2" />
              Available Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No other users available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableUsers.map((chatUser) => (
                  <div
                    key={chatUser.id}
                    className="user-card"
                    onClick={() => handleUserClick(chatUser.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {chatUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{chatUser.username}</h3>
                      <p className="text-sm text-muted-foreground">Tap to start chatting</p>
                    </div>
                    <MessageCircle size={20} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserListScreen;
