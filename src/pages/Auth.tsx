
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Function to get login attempts from localStorage with expiry check
const getLoginAttempts = () => {
  const storedData = localStorage.getItem('loginAttempts');
  if (!storedData) return { count: 0, timestamp: Date.now(), blocked: false, blockUntil: 0 };
  
  const data = JSON.parse(storedData);
  
  // Check if the block time has expired
  if (data.blocked && Date.now() > data.blockUntil) {
    // Reset if the block time has passed
    return { count: 0, timestamp: Date.now(), blocked: false, blockUntil: 0 };
  }
  
  return data;
};

// Function to update login attempts
const updateLoginAttempts = (success: boolean) => {
  const currentData = getLoginAttempts();
  
  if (success) {
    // Reset on successful login
    localStorage.setItem('loginAttempts', JSON.stringify({
      count: 0,
      timestamp: Date.now(),
      blocked: false,
      blockUntil: 0
    }));
    return true;
  } else {
    // Increment count on failed login
    const newCount = currentData.count + 1;
    let blocked = currentData.blocked;
    let blockUntil = currentData.blockUntil;
    
    // Apply blocking rules
    if (newCount >= 10) {
      // Block for 24 hours after 10 failed attempts
      blocked = true;
      blockUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    } else if (newCount >= 3) {
      // Block for 10 minutes after 3 failed attempts
      blocked = true;
      blockUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
    }
    
    localStorage.setItem('loginAttempts', JSON.stringify({
      count: newCount,
      timestamp: Date.now(),
      blocked,
      blockUntil
    }));
    
    return !blocked;
  }
};

// Function to get remaining blocked time in minutes
const getBlockedTimeRemaining = () => {
  const currentData = getLoginAttempts();
  if (!currentData.blocked) return 0;
  
  const remainingMs = Math.max(0, currentData.blockUntil - Date.now());
  return Math.ceil(remainingMs / (60 * 1000)); // Convert to minutes
};

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedTimeRemaining, setBlockedTimeRemaining] = useState(0);
  const navigate = useNavigate();

  // Check login block status on component mount and periodically
  useEffect(() => {
    const checkBlockStatus = () => {
      const loginAttempts = getLoginAttempts();
      setIsBlocked(loginAttempts.blocked);
      setBlockedTimeRemaining(getBlockedTimeRemaining());
    };
    
    // Check initially
    checkBlockStatus();
    
    // Check periodically (every minute)
    const interval = setInterval(checkBlockStatus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if login is blocked
    const loginAttempts = getLoginAttempts();
    if (loginAttempts.blocked) {
      const timeRemaining = getBlockedTimeRemaining();
      const timeUnit = timeRemaining >= 60 ? 'godzin' : 'minut';
      const timeValue = timeRemaining >= 60 ? Math.ceil(timeRemaining / 60) : timeRemaining;
      
      toast.error(`Za dużo nieudanych prób logowania. Spróbuj ponownie za ${timeValue} ${timeUnit}.`);
      setIsBlocked(true);
      setBlockedTimeRemaining(timeRemaining);
      return;
    }
    
    setLoading(true);
    
    try {
      // Login only
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Update login attempts (success)
      updateLoginAttempts(true);
      
      toast.success('Zalogowano pomyślnie');
      navigate('/');
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Update login attempts (failure)
      const canRetry = updateLoginAttempts(false);
      
      if (!canRetry) {
        const attempts = getLoginAttempts();
        const timeRemaining = getBlockedTimeRemaining();
        const timeUnit = timeRemaining >= 60 ? 'godzin' : 'minut';
        const timeValue = timeRemaining >= 60 ? Math.ceil(timeRemaining / 60) : timeRemaining;
        
        toast.error(`Za dużo nieudanych prób logowania. Spróbuj ponownie za ${timeValue} ${timeUnit}.`);
        setIsBlocked(true);
        setBlockedTimeRemaining(timeRemaining);
      } else {
        const attempts = getLoginAttempts();
        const attemptsLeft = attempts.count < 3 ? 3 - attempts.count : 10 - attempts.count;
        toast.error(`${error.message || 'Wystąpił błąd. Spróbuj ponownie.'} Pozostało prób: ${attemptsLeft}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Logowanie</CardTitle>
          <CardDescription>
            Zaloguj się, aby zarządzać treścią strony.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {isBlocked ? (
              <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
                Za dużo nieudanych prób logowania. Spróbuj ponownie za {blockedTimeRemaining >= 60 
                  ? `${Math.ceil(blockedTimeRemaining / 60)} godzin` 
                  : `${blockedTimeRemaining} minut`}.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    required
                    disabled={isBlocked}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Hasło</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    disabled={isBlocked}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isBlocked}
            >
              {loading ? 'Przetwarzanie...' : 'Zaloguj się'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
