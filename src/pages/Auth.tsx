
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  });

  // If already logged in, redirect to home
  if (session) {
    return <Navigate to="/" />;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Błąd logowania",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zalogowano pomyślnie",
          description: "Witamy z powrotem!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast({
        title: "Wystąpił błąd",
        description: "Spróbuj ponownie później",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Błąd rejestracji",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rejestracja udana",
          description: "Sprawdź swoją skrzynkę email, aby potwierdzić konto.",
        });
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      toast({
        title: "Wystąpił błąd",
        description: "Spróbuj ponownie później",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Dostęp do panelu</CardTitle>
          <CardDescription className="text-center">
            Zaloguj się lub zarejestruj, aby uzyskać dostęp
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Logowanie</TabsTrigger>
            <TabsTrigger value="register">Rejestracja</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Hasło</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Hasło</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Rejestracja jest obecnie dostępna tylko dla administratorów. 
                  Twoje konto będzie wymagało zatwierdzenia.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Rejestracja..." : "Zarejestruj się"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
