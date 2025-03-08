
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  ipAddress?: string;
}

export default function LoginForm({ ipAddress }: LoginFormProps) {
  const { email, setEmail, password, setPassword, loading, handleLogin } = useAuth();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleLogin(e, ipAddress);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
