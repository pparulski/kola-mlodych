
import { Mail, Handshake } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ui/theme-provider";

export function SidebarFooterContent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm">Ciemny motyw</span>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <a
          href="https://ozzip.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
        >
          <Handshake className="w-4 h-4" />
          <span>OZZ „Inicjatywa Pracownicza"</span>
        </a>
        <a
          href="mailto:mlodzi.ip@ozzip.pl"
          className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>mlodzi.ip@ozzip.pl</span>
        </a>
      </div>
      <div className="text-sm text-foreground">
        OZZ IP 2025
      </div>
    </div>
  );
}
