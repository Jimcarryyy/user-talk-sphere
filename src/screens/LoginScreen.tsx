
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, User, Mail, Lock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const demoAccounts = [
    { email: 'alice@demo.com', username: 'Alice' },
    { email: 'bob@demo.com', username: 'Bob' },
    { email: 'charlie@demo.com', username: 'Charlie' },
    { email: 'diana@demo.com', username: 'Diana' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Fields Required",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isSignup && !username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(username, email, password);
        toast({
          title: "Account Created!",
          description: `Welcome to TalkSphere, ${username}!`,
        });
      } else {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: `Successfully logged in`,
        });
      }
      navigate('/users');
    } catch (error: any) {
      toast({
        title: isSignup ? "Signup Failed" : "Login Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      toast({
        title: "Demo Login Successful!",
        description: `Logged in as ${demoEmail}`,
      });
      navigate('/users');
    } catch (error: any) {
      toast({
        title: "Demo Login Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageCircle size={32} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignup ? 'Join TalkSphere' : 'Welcome to TalkSphere'}
          </CardTitle>
          <CardDescription>
            {isSignup ? 'Create your account to start chatting' : 'Sign in to continue chatting'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => setIsSignup(!isSignup)}
              disabled={loading}
              className="text-sm"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              disabled={loading}
              className="w-full text-sm"
            >
              <Info className="w-4 h-4 mr-2" />
              {showDemoAccounts ? 'Hide Demo Accounts' : 'Show Demo Accounts'}
            </Button>
          </div>

          {showDemoAccounts && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Demo accounts (password: password123)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account.email)}
                    disabled={loading}
                    className="text-xs"
                  >
                    {account.username}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
