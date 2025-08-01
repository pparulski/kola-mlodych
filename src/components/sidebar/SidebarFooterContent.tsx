
import { Mail, Handshake } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ui/theme-provider";
import { useState, useEffect } from "react";

export function SidebarFooterContent() {
  const { resolvedTheme, setTheme } = useTheme();
  const [emailElement, setEmailElement] = useState<JSX.Element | null>(null);
  
  // Email obfuscation technique
  useEffect(() => {
    // Break up email into parts to make it harder for bots to scrape
    const user = "mlodzi.ip";
    const domain = "ozzip.pl";
    
    // Only assemble the email when the component mounts in the browser
    setEmailElement(
      <a
        href={`mailto:${user}@${domain}`}
        onClick={() => {
          window.location.href = `mailto:${user}@${domain}`;
        }}
        className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
        aria-label="Email kontaktowy"
      >
        <Mail className="w-4 h-4" />
        <span>{user}[at]{domain}</span>
      </a>
    );
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm">Ciemny motyw</span>
        <Switch
          checked={resolvedTheme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Przełącz ciemny motyw"
        />
      </div>
      <div className="flex justify-center flex-col items-center gap-2">
        <a
          href="https://ozzip.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
        >
          <Handshake className="w-4 h-4" />
          <span>OZZ „Inicjatywa Pracownicza"</span>
        </a>
        {emailElement}
      </div>
      <div className="text-sm text-foreground">
        OZZ IP {new Date().getFullYear()}
      </div>
    </div>
  );
}
