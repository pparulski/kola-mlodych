
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkLoginAttempts, recordLoginAttempt } from "@/utils/authUtils";

export function useAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, ipAddress?: string) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Proszę wypełnić wszystkie pola");
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for rate limiting if IP is available
      if (ipAddress) {
        const rateLimit = await checkLoginAttempts(ipAddress);
        
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
          await recordLoginAttempt(ipAddress, false);
          
          // Check again after recording this attempt
          const updatedRateLimit = await checkLoginAttempts(ipAddress);
          
          if (updatedRateLimit.blocked) {
            toast.error(`Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za ${updatedRateLimit.duration}.`);
          } else {
            toast.error(`Błąd logowania: ${error.message}. Pozostało prób: ${updatedRateLimit.attemptsLeft}`);
          }
        } else {
          // Successful login
          await recordLoginAttempt(ipAddress, true);
          
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin
  };
}
