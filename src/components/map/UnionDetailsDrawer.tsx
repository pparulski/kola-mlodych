import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Facebook, Instagram, Mail } from "lucide-react";
import { Union } from "./types";
import { toast } from "sonner";

interface UnionDetailsDrawerProps {
  union: Union | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UnionDetailsDrawer: React.FC<UnionDetailsDrawerProps> = ({ union, open, onOpenChange }) => {
  const [copied, setCopied] = useState(false);

  // Reset copied state when switching unions
  React.useEffect(() => {
    setCopied(false);
  }, [union?.contact]);

  const handleCopyEmail = async () => {
    if (!union?.contact) return;
    try {
      await navigator.clipboard.writeText(union.contact);
      toast.success("Skopiowano adres e-mail");
      setCopied(true);
      const btn = document.getElementById('drawer-copy-email-btn');
      if (btn) {
        btn.classList.add('animate-scale-in');
        setTimeout(() => btn.classList.remove('animate-scale-in'), 250);
      }
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      toast.error("Nie udało się skopiować e-maila");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base text-center">
            {union?.name}
          </DrawerTitle>
        </DrawerHeader>

        {/* Centered, minimal actions with labels */}
        <div className="p-4 pt-0">
          <div className="flex items-center justify-center gap-3">
            {union?.contact && (
              <button
                id="drawer-copy-email-btn"
                onClick={handleCopyEmail}
                aria-label="Skopiuj adres e-mail"
                title="Skopiuj adres e-mail"
                className="px-3 py-1.5 rounded-full hover:bg-accent/10 text-accent hover:text-primary transition-colors flex items-center gap-2 border"
              >
                <span className="text-xs font-medium">{copied ? "SKOPIOWANO" : "EMAIL"}</span>
                <Mail className="h-4 w-4" />
              </button>
            )}

            {union?.facebook_url && (
              <a
                href={union.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Otwórz stronę na Facebooku"
                title="Facebook"
                className="px-3 py-1.5 rounded-full hover:bg-accent/10 text-accent hover:text-primary transition-colors flex items-center gap-2 border"
              >
                <span className="text-xs font-medium">FB</span>
                <Facebook className="h-4 w-4" />
              </a>
            )}

            {union?.instagram_url && (
              <a
                href={union.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Otwórz profil na Instagramie"
                title="Instagram"
                className="px-3 py-1.5 rounded-full hover:bg-accent/10 text-accent hover:text-primary transition-colors flex items-center gap-2 border"
              >
                <span className="text-xs font-medium">IG</span>
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
