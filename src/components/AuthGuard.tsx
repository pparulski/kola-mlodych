
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingIndicator } from "./home/LoadingIndicator";

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
          toast.error("Zaloguj się, aby uzyskać dostęp do panelu administracyjnego");
          navigate("/auth");
          return;
        }

        console.log("Session found, checking admin status");
        const { data: isAdmin, error: adminCheckError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        if (adminCheckError || !isAdmin) {
          console.error("Admin check failed:", adminCheckError);
          toast.error("Brak uprawnień administratora");
          navigate("/");
          return;
        }

        console.log("Admin status confirmed, allowing access");
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Wystąpił błąd podczas weryfikacji uprawnień");
        navigate("/auth");
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  return <Outlet />;
}
