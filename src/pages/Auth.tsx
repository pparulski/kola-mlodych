import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log("Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.id);
      
      if (event === "SIGNED_IN" && session?.user?.id) {
        console.log("User signed in, checking admin status");
        // Check if the user is an admin
        const { data: isAdmin, error: adminCheckError } = await supabase
          .rpc('is_admin', { user_id: session.user.id });

        console.log("Admin check result:", isAdmin, "Error:", adminCheckError);

        if (adminCheckError) {
          console.error("Error checking admin status:", adminCheckError);
          setErrorMessage("Error verifying admin status");
          return;
        }

        if (isAdmin) {
          console.log("User is admin, redirecting to home");
          navigate("/");
        } else {
          console.log("User is not admin, showing error");
          setErrorMessage("Access denied. Only administrators can log in.");
          await supabase.auth.signOut();
        }
      }
    });

    return () => {
      console.log("Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <div className="border rounded-lg p-4">
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                }
              }
            }
          }}
          providers={[]}
          view="sign_in"
          showLinks={false}
        />
      </div>
    </div>
  );
};

export default Auth;