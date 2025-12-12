import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const CTA_IMG = "https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//cta_3.png";
const LS_KEY = "stolowki_cta_closed";

export default function StickyStolowkiCTA() {
  const location = useLocation();
  const [hidden, setHidden] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem(LS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (hidden) return null;
  if (location.pathname === "/stolowki") return null;

  return (
    <div
      className="fixed right-3 bottom-3 sm:right-6 sm:bottom-6 z-50 transition-opacity hover:opacity-95"
      style={{ pointerEvents: "auto" }}
    >
      <div className="relative">
        <button
          onClick={() => { localStorage.setItem(LS_KEY, "1"); setHidden(true); }}
          aria-label="Zamknij"
          title="Zamknij"
          className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
        <Link to="/stolowki" aria-label="Przywróćmy stołówki – przejdź do formularza" title="Przywróćmy stołówki – przejdź do formularza" onClick={() => { try { localStorage.setItem(LS_KEY, '1'); } catch {} setHidden(true); }}>
          <img
            src={CTA_IMG}
            alt="Przywróćmy stołówki – akcja"
            className="block object-contain object-center h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44 rounded-md hover:opacity-95 transition"
            loading="lazy"
          />
        </Link>
      </div>
    </div>
  );
}
