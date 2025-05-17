
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PasswordOverlayProps {
  correctPassword: string;
  onPasswordCorrect: () => void;
}

export const PasswordOverlay: React.FC<PasswordOverlayProps> = ({ 
  correctPassword,
  onPasswordCorrect
}) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      onPasswordCorrect();
      // Store in sessionStorage to remember throughout this session
      sessionStorage.setItem('sitePasswordEntered', 'true');
    } else {
      toast.error("Niepoprawne hasło. Spróbuj ponownie.");
      setPassword('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 p-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-card rounded-lg shadow-lg border border-border animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Strona chroniona hasłem</h1>
          <p className="text-muted-foreground mb-6">
            Wprowadź hasło, aby uzyskać dostęp do strony.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              ref={inputRef}
              type="password"
              placeholder="Wprowadź hasło..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
              autoFocus
            />
          </div>
          
          <Button type="submit" className="w-full">
            Wejdź
          </Button>
        </form>
      </div>
    </div>
  );
};
