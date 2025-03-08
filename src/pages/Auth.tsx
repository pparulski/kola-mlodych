
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);
  
  // Query to get client IP address
  const { data: ipData } = useQuery({
    queryKey: ['client-ip'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('Error fetching IP:', error);
        return 'unknown';
      }
    }
  });
  
  // Function to check login attempts
  const checkLoginAttempts = async (ip: string) => {
    // Get the current timestamp minus various durations
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Use a stored procedure to check attempts
    const { data: recentAttempts, error: recentError } = await supabase
      .rpc('get_recent_login_attempts', { 
        ip_addr: ip,
        minutes_ago: 10
      });
    
    if (recentError) {
      console.error('Error checking recent login attempts:', recentError);
      return { blocked: false };
    }
    
    // If 3 or more attempts in the last 10 minutes, block for 10 minutes
    if (recentAttempts && recentAttempts >= 3) {
      return { 
        blocked: true, 
        reason: "10 minutes", 
        duration: "10 minut",
        attemptsLeft: 0 
      };
    }
    
    // Check attempts in the last 24 hours
    const { data: dayAttempts, error: dayError } = await supabase
      .rpc('get_daily_login_attempts', { 
        ip_addr: ip,
        hours_ago: 24
      });
    
    if (dayError) {
      console.error('Error checking 24h login attempts:', dayError);
      return { blocked: false };
    }
    
    // If 10 or more attempts in the last 24 hours, block for 24 hours
    if (dayAttempts && dayAttempts >= 10) {
      return { 
        blocked: true, 
        reason: "24 hours", 
        duration: "24 godzin",
        attemptsLeft: 0 
      };
    }
    
    // Not blocked, return attempts left
    return { 
      blocked: false, 
      attemptsLeft: recentAttempts ? 3 - recentAttempts : 3 
    };
  };
  
  // Function to record a login attempt
  const recordLoginAttempt = async (ip: string, success: boolean) => {
    const { error } = await supabase
      .rpc('record_login_attempt', { 
        ip_addr: ip,
        was_successful: success
      });
    
    if (error) {
      console.error('Error recording login attempt:', error);
    }
  };
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Proszę wypełnić wszystkie pola");
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for rate limiting
      if (ipData) {
        const rateLimit = await checkLoginAttempts(ipData);
        
        if (rateLimit.blocked) {
          toast.error(`Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za ${rateLimit.duration}.`);
          setLoading(false);
          return;
        }
        
        // Proceed with login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          await recordLoginAttempt(ipData, false);
          
          // Check again after recording this attempt
          const updatedRateLimit = await checkLoginAttempts(ipData);
          
          if (updatedRateLimit.blocked) {
            toast.error(`Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za ${updatedRateLimit.duration}.`);
          } else {
            toast.error(`Błąd logowania: ${error.message}. Pozostało prób: ${updatedRateLimit.attemptsLeft}`);
          }
        } else {
          // Successful login
          await recordLoginAttempt(ipData, true);
          
          // Check if user is admin
          const { data: isAdmin } = await supabase
            .rpc('is_admin', { user_id: data.user?.id });
            
          if (isAdmin) {
            toast.success("Zalogowano pomyślnie");
            navigate("/");
          } else {
            // Not an admin, sign out
            await supabase.auth.signOut();
            toast.error("Brak uprawnień administratora");
          }
        }
      } else {
        // Fallback if IP fetch failed
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          toast.error(`Błąd logowania: ${error.message}`);
        } else {
          // Check if user is admin
          const { data: isAdmin } = await supabase
            .rpc('is_admin', { user_id: data.user?.id });
            
          if (isAdmin) {
            toast.success("Zalogowano pomyślnie");
            navigate("/");
          } else {
            // Not an admin, sign out
            await supabase.auth.signOut();
            toast.error("Brak uprawnień administratora");
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Wystąpił błąd podczas logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Panel administratora</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Twój email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Hasło
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Twoje hasło"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>
    </div>
  );
}
