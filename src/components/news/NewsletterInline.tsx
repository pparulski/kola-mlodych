import React, { useEffect, useRef, useState } from "react";

export function NewsletterInline() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hide if already submitted previously
  useEffect(() => {
    try {
      const v = localStorage.getItem("newsletter_submitted");
      if (v === "1") setHidden(true);
    } catch {}
  }, []);

  if (hidden) return null;


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setError("Nieprawidłowy email");
      return;
    }
    // TODO: wire to backend endpoint
    try {
      localStorage.setItem("newsletter_submitted", "1");
    } catch {}
    // Show confirmation now, and hide on next load
    setSubmitted(true);
  };

  return (
  <>
    <div
      ref={anchorRef}
      className="!mt-2 relative flex flex-col items-center max-w-[640px] mx-auto w-full"
    >
      {/* Image:
        - w-[56px]: Smaller size on mobile
        - md:w-[90px]: Larger size on desktop
        - -mb-[1px]: Pulls it down 1 pixel to overlap the card's top border perfectly
      */}
      <img
        src="/img/post.png"
        alt="Newsletter"
        className="pointer-events-none select-none w-[72px] lg:w-[90px] h-auto object-contain z-0 -mb-[1px]"
        loading="lazy"
        decoding="async"
      />

      <div className="w-full relative z-10 content-box rounded-lg border border-border bg-[hsl(var(--content-box))] px-3 py-3 lg:px-4 lg:py-4">
        <div className="grid grid-cols-1 gap-3 items-center">
          <div className="grid gap-2 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center min-h-[56px]">
            {submitted ? (
              <p className="m-0 text-sm lg:text-base text-green-600 dark:text-green-400 col-span-full">
                Dziękujemy! Sprawdź swoją skrzynkę.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="contents">
                <span className="block whitespace-nowrap text-sm lg:text-base font-medium text-foreground lg:mr-2">
                  Chcesz być na bieżąco?
                </span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    onInvalid={(e) => (e.currentTarget as HTMLInputElement).setCustomValidity("Nieprawidłowy email")}
                    onInput={(e) => (e.currentTarget as HTMLInputElement).setCustomValidity("")}
                    placeholder="Zostaw maila!"
                    className="w-full lg:w-auto lg:flex-1 lg:basis-0 lg:min-w-[240px] min-w-0 postal-input text-sm lg:text-base text-foreground placeholder:text-muted-foreground"
                    aria-label="Adres e-mail"
                    required
                  />
                  <button type="submit" className="postal-button text-sm lg:text-base">
                    Wyślij
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  </>
);
}
