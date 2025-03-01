
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function AuthGuard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        console.log("Session found, checking admin status");
        const { data: isAdmin, error: adminCheckError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminCheckError) {
          console.error("Admin check failed:", adminCheckError);
          navigate("/auth");
          return;
        }

        if (!isAdmin) {
          console.log("User is not an admin, redirecting to auth");
          navigate("/auth");
          return;
        }

        console.log("Admin status confirmed, allowing access");
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/auth");
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check admin status on sign-in event
        const { data: isAdmin } = await supabase.rpc('is_admin', { 
          user_id: session.user.id 
        });
        
        if (!isAdmin) {
          navigate("/auth");
        } else {
          setIsLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="text-lg">Ładowanie panelu administracyjnego...</div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
