
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Auth() {
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
        return undefined;
      }
    }
  });

  return (
    <Card className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg mt-16">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Panel administratora</CardTitle>
      </CardHeader>
      
      <CardContent>
        <LoginForm ipAddress={ipData} />
      </CardContent>
    </Card>
  );
}
