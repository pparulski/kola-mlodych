import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/seo/SEO";
import { useToast } from "@/components/ui/use-toast";
import { Copy, ArrowLeft } from "lucide-react";

interface Reason {
  id: string;
  title: string;
  description?: string;
}

const ALL_REASONS: Reason[] = [
  { id: "dostepnosc", title: "Dostępność cenowych posiłków", description: "Stołówki obniżają koszty wyżywienia studentów." },
  { id: "zdrowie", title: "Zdrowe i zbilansowane jedzenie", description: "Promowanie zdrowych nawyków żywieniowych." },
  { id: "rownowartosc", title: "Równość szans", description: "Wsparcie dla studentek i studentów o niższych dochodach." },
  { id: "wspolnota", title: "Wspólnota akademicka", description: "Miejsce integracji i życia uczelni." },
  { id: "komfort", title: "Komfort i czas", description: "Bliskość posiłku na kampusie oszczędza czas." },
  { id: "ekologia", title: "Aspekt ekologiczny", description: "Mniej jednorazowych opakowań i transportu." },
];

// Proste mapowanie przykładowych adresów – zostaną podmienione później
const RECIPIENTS_BY_UNI: Record<string, { to: string[]; cc?: string[]; bcc?: string[] }> = {
  "Uniwersytet Testowy": {
    to: ["rektor@uni-test.pl", "kanclerz@uni-test.pl"],
    cc: ["samorzad@student.uit.pl"],
  },
  "Politechnika Przykładowa": {
    to: ["rektor@pp.pl"],
    cc: ["dziekan@pp.pl"],
  },
  "Inna uczelnia": {
    to: ["kontakt@uczelnia.pl"],
  },
};

const UNIVERSITIES = Object.keys(RECIPIENTS_BY_UNI);

function encodeMailtoComponent(value: string) {
  return encodeURIComponent(value);
}

function buildEmail({
  name,
  university,
  selectedReasons,
  customReasons,
  includeCustom,
}: {
  name: string;
  university: string;
  selectedReasons: Reason[];
  customReasons: string;
  includeCustom: boolean;
}) {
  const subject = `Przywróćmy stołówki, wyślij apel do władz!`;

  const reasonsLines = selectedReasons.map((r) => `- ${r.title}${r.description ? ` – ${r.description}` : ""}`).join("\n");
  const customBlock = includeCustom && customReasons.trim() ? `\nDodatkowe powody:\n${customReasons.trim()}` : "";

  const body = [
    "Szanowni Państwo,",
    "",
    `Zwracamy się z uprzejmą prośbą o podjęcie działań zmierzających do utworzenia/stabilnego funkcjonowania stołówek studenckich na ${university || "naszej uczelni"}.`,
    "Uważamy, że stołówki są potrzebne z następujących powodów:",
    reasonsLines,
    customBlock,
    "",
    "Z wyrazami szacunku,",
    name || "Student/ka",
    university || "",
  ]
    .filter(Boolean)
    .join("\r\n");

  const recipients = university && RECIPIENTS_BY_UNI[university]
    ? RECIPIENTS_BY_UNI[university]
    : { to: ["kontakt@przyklad.pl"], cc: [], bcc: [] };

  const mailto = `mailto:${recipients.to.join(",")}?subject=${encodeMailtoComponent(subject)}&body=${encodeMailtoComponent(body)}${
    recipients.cc && recipients.cc.length ? `&cc=${encodeMailtoComponent(recipients.cc.join(","))}` : ""
  }${recipients.bcc && recipients.bcc.length ? `&bcc=${encodeMailtoComponent(recipients.bcc.join(","))}` : ""}`;

  return { subject, body, mailto, recipients };
}

export default function Stolowki() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [customReasons, setCustomReasons] = useState("");

  const selectedReasons = useMemo(
    () => ALL_REASONS.filter((r) => selectedIds.includes(r.id)),
    [selectedIds]
  );

  const { subject, body, mailto } = useMemo(
    () => buildEmail({ name, university, selectedReasons, customReasons, includeCustom: selectedIds.includes('custom') }),
    [name, university, selectedReasons, customReasons, selectedIds]
  );

  const canGoNextFromStep1 = selectedIds.length > 0 || customReasons.trim().length > 0;
  const canGoNextFromStep2 = name.trim().length > 1;

  const toggleReason = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const copyBody = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast({ title: "Skopiowano treść", description: "Treść wiadomości została skopiowana do schowka." });
    } catch (e) {
      toast({ title: "Błąd kopiowania", description: "Nie udało się skopiować treści.", variant: "destructive" as any });
    }
  };

  // Scroll to top on step change (helps on mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-enter -mt-2 sm:mt-0">
      <SEO
        title="Przywróćmy stołówki, wyślij apel do władz!"
        description="Napisz wiadomość w sprawie stołówek studenckich – wybierz powody i wyślij gotowego maila."
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
      </div>

      {step === 1 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Dlaczego stołówki są potrzebne?</CardTitle>
            <CardDescription>Wybierz co najmniej jeden powód (możesz zaznaczyć kilka).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_REASONS.map((reason) => (
                <div
                  role="button"
                  tabIndex={0}
                  key={reason.id}
                  onClick={() => toggleReason(reason.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReason(reason.id); } }}
                  className={`text-left rounded-lg border p-4 hover:shadow transition-all active:scale-[0.99] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-ring ${
                    selectedIds.includes(reason.id) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                      <Checkbox
                        checked={selectedIds.includes(reason.id)}
                        onCheckedChange={() => toggleReason(reason.id)}
                        className="pointer-events-none h-5 w-5"
                      />
                    </div>
                    <div>
                      <div className="font-medium leading-5">{reason.title}</div>
                      {reason.description && (
                        <div className="text-sm text-muted-foreground mt-1">{reason.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Custom reason box */}
              <div
                role="button"
                onClick={() => {
                  setSelectedIds((prev) => prev.includes('custom') ? prev.filter(id => id !== 'custom') : [...prev, 'custom']);
                }}
                className={`text-left rounded-lg border p-4 hover:shadow transition-all active:scale-[0.99] cursor-pointer select-none ${
                  selectedIds.includes('custom') ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                    <Checkbox checked={selectedIds.includes('custom')} className="pointer-events-none h-5 w-5" />
                  </div>
                  <div className="w-full">
                    <div className="font-medium leading-5">Twój własny powód</div>
                    <Textarea
                      rows={3}
                      placeholder="Masz własny powód? Dopisz go tutaj!"
                      value={customReasons}
                      onChange={(e) => setCustomReasons(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">Jeśli pozostawisz to pole puste, nie zostanie dodane do wiadomości.</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} disabled={!canGoNextFromStep1}>Dalej</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 transition-all duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Dostosuj wiadomość</CardTitle>
              <CardDescription>Uzupełnij dane. Dodatkowy powód dodajesz w kroku 1.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block">Imię i nazwisko</label>
                  <Input placeholder="Jan Kowalski" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Uczelnia</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="">- Wybierz uczelnię -</option>
                    {UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <div className="flex gap-2">
                <Button variant="outline" className="px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Wstecz</span>
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canGoNextFromStep2}>Przejrzyj i wyślij</Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Podgląd wiadomości</CardTitle>
              <CardDescription>Możesz jeszcze wprowadzić zmiany powyżej.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 p-3 rounded-md border">
{body}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Ostatni podgląd</CardTitle>
            <CardDescription>Sprawdź treść i wyślij wiadomość.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Temat</div>
              <div className="p-2 rounded border bg-muted/30 text-sm">{subject}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Treść</div>
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 p-3 rounded-md border">
{body}
              </pre>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
            <div className="grid grid-cols-[auto,1fr,auto] gap-1 w-full sm:flex sm:w-auto sm:items-stretch sm:gap-2">
              <Button variant="outline" className="px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Wstecz</span>
              </Button>
              <a href={mailto} className="flex-1 sm:flex-none">
                <Button className="w-full justify-center">Wyślij e‑mail</Button>
              </a>
              <Button
                variant="outline"
                className="px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center sm:inline-flex inline-flex"
                onClick={copyBody}
                title="Skopiuj treść"
                aria-label="Skopiuj treść"
              >
                <Copy className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Skopiuj treść</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
