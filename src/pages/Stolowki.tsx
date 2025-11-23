import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/seo/SEO";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Copy, ArrowLeft, ArrowDown, PiggyBank, Scale, Users, HeartPulse, Clock3, Leaf, HelpCircle, Mail, MailPlus } from "lucide-react";

interface Reason {
  id: string;
  title: string;
  summary: string;
  details: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const ALL_REASONS: Reason[] = [
  {
    id: "dostepnosc",
    title: "Dostępność cenowa",
    summary: "Posiłki są tańsze niż w prywatnych lokalach i uczelnia kontroluje ceny.",
    details:
      "Posiłki w publicznych stołówkach są znacznie tańsze niż w prywatnych lokalach, bo publiczne stołówki nie są nastawione na zysk. Ponadto uczelnia zachowuje kontrolę nad cenami, co zapewnia stabilność cen nawet w obliczu kryzysów.",
    Icon: PiggyBank,
  },
  {
    id: "rownowartosc",
    title: "Wyrównywanie szans",
    summary: "Jest elementem wsparcia materialnego i realną pomocą dla osób bez budżetu na rynkowe ceny.",
    details:
      "Stołówki są ważnym elementem systemu wsparcia materialnego dla studiujących. To realna pomoc dla tych, którzy nie mogą sobie pozwolić na posiłki w rynkowych cenach. Zaspokajanie podstawowych potrzeb studiujących jest konieczne, aby zapewnić realnie równy dostęp do edukacji.",
    Icon: Scale,
  },
  {
    id: "wspolnota",
    title: "Wspólnota",
    summary: "Stołówka to miejsce integracji i rozmowy dla całej społeczności uczelni.",
    details:
      "Stołówki stanowią miejsca integracji dla wszystkich osób tworzących uczelnianą społeczność, również pracujących i doktoryzujących się. Zmniejszają dystans i zapewniają przestrzeń do rozmowy. Animują życie społeczne i są tętniącym sercem uczelni. Dzięki nim możemy podtrzymywać i nawiązywać znajomości niezależnie od tytułu naukowego, wydziału czy studiowanego kierunku.",
    Icon: Users,
  },
  {
    id: "zdrowie",
    title: "Zdrowie",
    summary: "Zapewnia dostęp do zbilansowanych posiłków i możliwość dostosowania diety.",
    details:
      "Dostęp do zbilansowanych posiłków, jakie oferują stołówki, pozwala wyrabiać i utrzymywać zdrowe nawyki. W przeciwieństwie do słodkich przekąsek z automatów, obiadokolacji, którą możemy zjeść dopiero późnym wieczorem w domu, obiad na stołówce zapewnia energię na cały dzień nauki i pracy. Oprócz tego, publiczne stołówki pozwalają na dostosowanie oferowanej diety do potrzeb osób z niepełnosprawnościami, chorobami czy alergiami pokarmowymi.",
    Icon: HeartPulse,
  },
  {
    id: "komfort",
    title: "Czas i komfort",
    summary: "Bliskość posiłku na kampusie to oszczędność czasu i wygoda w ciągu dnia.",
    details:
      "Stołówka na terenie uczelni, niedaleko od miejsca, w którym odbywają się zajęcia i praca, to oszczędność czasu oraz komfort w ciągu dnia. Nie trzeba przemierzać pół miasta do najbliższego baru mlecznego, ani jeść przygotowanej kanapki w tłumie na korytarzu. Dodatkowo uczelnia może korzystać z własnego zaplecza gastronomicznego przy okazji wydarzeń otwartych, zamiast korzystać z drogiego cateringu.",
    Icon: Clock3,
  },
  {
    id: "ekologia",
    title: "Środowisko",
    summary: "Zorganizowana, masowa dystrybucja posiłków w miejscu nauki i pracy ogranicza marnowanie jedzenia i zużycie jednorazowych opakowań.",
    details:
      "Zorganizowane, masowe posiłki w miejscu nauki i pracy to rozwiązanie przyjazne środowisku. Ograniczają marnowanie jedzenia i zużycie jednorazowych opakowań. Uczelnie mogą też decydować o jadłospisie, biorąc pod uwagę kwestie ekologiczne.",
    Icon: Leaf,
  },
];

// Mapa adresów uczelnianych (trafiają do CC)
import { UNIVERSITY_CC } from "@/data/universityCc";


const UNIVERSITIES = Object.keys(UNIVERSITY_CC).sort((a, b) => a.localeCompare(b, 'pl', { sensitivity: 'base' }));

function encodeMailtoComponent(value: string) {
  return encodeURIComponent(value);
}

function lowercaseFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
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
  const subject = `Apel o uczelniane stołówki`;

  const reasonsLines = selectedReasons.map((r) => `- ${lowercaseFirst(r.summary)}`).join("\r\n");
  const customLine = includeCustom && customReasons.trim() ? `- ${lowercaseFirst(customReasons.trim())}` : "";
  const reasonsCount = selectedReasons.length + (includeCustom && customReasons.trim() ? 1 : 0);
  const reasonsIntro = reasonsCount === 1
    ? "Wskazuję, że stołówka jest potrzebna z następującego powodu:"
    : "Wskazuję, że stołówka jest potrzebna z następujących powodów:";

  const body = [
    "Szanowni Państwo,",
    "",
    "dołączam do apelu o uruchomienie ogólnopolskiego funduszu stołówkowego dla szkolnictwa wyższego, który umożliwi otrzymanie środków na prowadzenie publicznej stołówki na uczelni, na której obecnie studiuję. Liczę, że władze wywiążą się z deklaracji zawartych w porozumieniu strajkowym między studiującymi a MNiSW z czerwca br.",
    "",
    reasonsIntro,
    reasonsLines,
    customLine,
    "",
    "Z wyrazami szacunku,",
    name || "Student/ka",
    university || "",
  ]
    .filter((v) => v !== null && v !== undefined)
    .join("\r\n");

  const commonTo = [
    "Karolina.Ziolo-Puzuk@mnisw.gov.pl",
    "Sekretariat.MKZP@mnisw.gov.pl",
    "kontakt@kprm.gov.pl",
    "bprm@kprm.gov.pl",
    "kontakt@kprm.gov.pl",
    "kancelaria@mnisw.gov.pl",
    "biuro@marcinkulasek.pl",
    "biuro@donaldtusk.pl",
    "agnieszka.dziemianowicz-bak@sejm.pl",
    "kontakt@dziemianowicz-bak.pl",
    "komunikacja@krasp.org.pl",
    "biuro@krasp.org.pl",
    "rzecznik@krasp.org.pl",
    "president@krasp.org.pl",
    "sekretariat.bm@mnisw.gov.pl",
    "sekretariat.dsw@mnisw.gov.pl",
    "sekretariat.dbf@mnisw.gov.pl"
  ];

  const rawCc = university && UNIVERSITY_CC[university] ? UNIVERSITY_CC[university] : [];
  const sanitize = (arr: string[]) => Array.from(new Set(arr
    .map(s => (s || "").trim())
    .filter(s => s && s !== "n/d" && s.toLowerCase() !== "n/d" && !s.toLowerCase().startsWith("kod błędu") && s.includes("@") && !s.includes(" "))
  ));

  const recipients = {
    to: Array.from(new Set([...commonTo])),
    cc: sanitize(rawCc),
    bcc: [],
  };

  const mailto = `mailto:${recipients.to.join(",")}?subject=${encodeMailtoComponent(subject)}&body=${encodeMailtoComponent(body)}${
    recipients.cc && recipients.cc.length ? `&cc=${encodeMailtoComponent(recipients.cc.join(","))}` : ""
  }${recipients.bcc && recipients.bcc.length ? `&bcc=${encodeMailtoComponent(recipients.bcc.join(","))}` : ""}`;

  return { subject, body, mailto, recipients };
}

export default function Stolowki() {
  // Combobox state
  const comboInputRef = useRef<HTMLInputElement | null>(null);
  const [comboOpen, setComboOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Mobile details drawer state
  const [mobileDetails, setMobileDetails] = useState<string | null>(null);
  // Anchor to wizard/form
  const progressRef = useRef<HTMLDivElement | null>(null);
  // Re-implemented smooth scroll to the start of the form (progress bar)
  const computeOffset = () => {
    const header = document.querySelector('.sticky-page-header-wrapper') as HTMLElement | null;
    const banner = document.getElementById('join-banner') as HTMLElement | null;
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const bannerH = banner ? banner.getBoundingClientRect().height : 0;
    // Small breathing space below sticky elements
    return headerH + bannerH + 8;
  };

  const ensureScrollMargin = () => {
    if (!progressRef.current) return;
    const offset = computeOffset();
    progressRef.current.style.scrollMarginTop = `${offset}px`;
  };

  useEffect(() => {
    // Keep scroll-margin up to date on resize/orientation changes
    ensureScrollMargin();
    const onResize = () => ensureScrollMargin();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollToForm = () => {
    if (!progressRef.current) return;
    ensureScrollMargin();
    progressRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToStep = (s: 1 | 2 | 3) => {
    // Pre-scroll instantly to establish a stable anchor before step change
    ensureScrollMargin();
    if (progressRef.current) {
      progressRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }

    setStep(s);

    // Post-scroll smoothly after the DOM updates and layout settles
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(scrollToForm, 60);
      });
    });
  };


  // filteredUniversities will be defined after university state is declared to avoid temporal dead zone.
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [customReasons, setCustomReasons] = useState("");

  const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filteredUniversities = useMemo(() => {
    if (!university) return UNIVERSITIES;
    const q = normalized(university);
    return UNIVERSITIES.filter(u => normalized(u).includes(q)).slice(0, 50);
  }, [university]);

  const selectedReasons = useMemo(
    () => ALL_REASONS.filter((r) => selectedIds.includes(r.id)),
    [selectedIds]
  );

  const { subject, body, mailto, recipients } = useMemo(
    () => buildEmail({ name, university, selectedReasons, customReasons, includeCustom: selectedIds.includes('custom') }),
    [name, university, selectedReasons, customReasons, selectedIds]
  );

  const gmailUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('view', 'cm');
    params.set('fs', '1');
    if (recipients?.to?.length) params.set('to', recipients.to.join(','));
    if (recipients?.cc?.length) params.set('cc', recipients.cc.join(','));
    params.set('su', subject);
    params.set('body', body);
    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [recipients, subject, body]);

  const outlookUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (recipients?.to?.length) params.set('to', recipients.to.join(','));
    if (recipients?.cc?.length) params.set('cc', recipients.cc.join(','));
    params.set('subject', subject);
    params.set('body', body);
    return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
  }, [recipients, subject, body]);

  const canGoNextFromStep1 = selectedIds.length > 0 || customReasons.trim().length > 0;
  const canGoNextFromStep2 = true;

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

  // Scroll to a precise offset so that the stage bar sits below the "Dołącz do nas!" banner
  useEffect(() => {
    // no-op: programmatic scroll handled by goToStep via progressRef
  }, [step]);

  useEffect(() => {
    // zamykanie comboboxa przy kliknięciu poza
    const onClick = (e: MouseEvent) => {
      if (!comboInputRef.current) return;
      const target = e.target as Node;
      if (!comboInputRef.current.contains(target)) {
        setComboOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="space-y-2 sm:space-y-2 animate-enter -mt-3 md:-mt-5 relative">
      <SEO
        title="Przywróćmy stołówki, wyślij apel do władz!"
        description="Napisz wiadomość w sprawie stołówek studenckich – wybierz powody i wyślij gotowego maila."
      />

      {/* Quick-start inline button for mobile/tablet */}
      <div className="md:hidden flex justify-end">
        <button
          type="button"
          onClick={scrollToForm}
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <span>Przejdź do formularza</span>
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      {/* Intro section with repeating image background */}
      <section
        className="space-y-3 text-sm leading-6 p-3 md:p-5 rounded-lg border border-white/20 shadow-sm text-white"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.1)), url('https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//bg.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "top left",
          textShadow: "0 1px 1px rgba(0,0,0,.5), 0 0 1px rgba(0,0,0,.3)",
          textAlign: 'justify',
        }}
      >
        <h3 className="text-xl sm:text-2xl font-semibold">Zastanawialiście się kiedyś, gdzie się podziały uczelniane stołówki? My też.</h3>
        <p>
          Długo szukałyśmy odpowiedzi na to pytanie i w końcu dotarłyśmy do sedna sprawy. W 2005 roku w życie weszła nowa ustawa o szkolnictwie
          wyższym, która rozbiła poprzedni fundusz pomocy materialnej, którego początki sięgają jeszcze 1958 roku i który definiował <em>pomoc materialną</em> bardzo szeroko i uwzględniał w niej stołówki. Nowe przepisy, które weszły w życie w 2005 roku, zawęziły pojęcie pomocy materialnej wyłącznie do świadczeń bezpośrednich, jak stypendia. Jednocześnie finansowanie stołówek zepchnięto do ogólnej subwencji uczelni, gdzie musiały konkurować o środki np. z pensjami kadry. Trzeba też pamiętać, że w tamtych latach liczba studentów gwałtownie rosła, a rząd nie zwiększył proporcjonalnie nakładów budżetowych. Zabezpieczono więc tylko absolutną podstawę (stypendia), a o reszcie zapomniano – w tym o dopłatach do akademików i stołówek.
        </p>
        <p>
          Skutek? W ciągu 4 lat uczelnie w Polsce zanotowały 10-krotny spadek korzystających ze stołówek. W 2007 ostały się już tylko pojedyncze, z cenami bliskimi tych rynkowych. Pozbyto się miejsc, w których socjalizowali się studiujący i pracujący na uczelniach i odizolowano nas od siebie wzajemnie, czego skutki cierpimy my dzisiaj.
        </p>
        <p>
          Parę lat temu zrzeszyłyśmy się w związku zawodowym Inicjatywa Pracownicza, aby zawalczyć o godne warunki życia młodych ludzi — w tym o potrzeby materialne studiujących. W czerwcu br. w wyniku okupacji Uniwersytetu Warszawskiego podpisałyśmy <a href="https://mlodzi.ozzip.pl/news/mamy-deklaracje-ministerstwa-ws-postulatow-strajkowych" className="text-destructive underline-offset-2 hover:underline">porozumienie strajkowe</a>, w którym ministra Karolina Zioło-Pużuk deklaruje <em>podjęcia prac i przedstawienia programu finansowania publicznych stołówek na uczelniach do końca 2025 r.</em>
        </p>
        <p>
          Według Ministerstwa Nauki i Szkolnictwa Wyższego prace nad funduszem i zabezpieczeniem środków na 2026 r. trwają, jednak w obliczu decyzji rządu o budżecie na naukę pozostajemy podejrzliwi. <strong>Przypomnij razem z nami, jak ważna jest inwestycja w zaplecze socjalne uczelni i jak wiele mogą zmienić powszechne publiczne stołówki.</strong> Tylko oddolna presja gwarantuje zmianę!
        </p>
        <div className="pt-1"></div>
      </section>

      <div ref={progressRef} aria-hidden className="h-0" />
      <div ref={progressRef} className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
      </div>

      {step === 1 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Dlaczego stołówki są dla Ciebie ważne?</CardTitle>
            <CardDescription>Wybierz powody!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 -mx-2 sm:mx-0 items-stretch">
              {ALL_REASONS.map((reason) => (
                <div
                  role="button"
                  tabIndex={0}
                  key={reason.id}
                  onClick={() => toggleReason(reason.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReason(reason.id); } }}
                  className={`text-left rounded-lg border p-4 hover:shadow transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-ring ${
                    selectedIds.includes(reason.id) ? "border-primary bg-primary/5" : "border-border"
                  } -mx-2 sm:mx-0 h-full`}
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
                      <div className="flex items-center gap-2">
                        <reason.Icon className="h-4 w-4 text-primary" />
                        <div className="font-medium leading-5">{reason.title}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{reason.summary}</div>
                    </div>
                    <div className="ml-auto pl-2">
                      <div className="hidden sm:block">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent self-center"
                              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                              onTouchStart={(e) => { e.stopPropagation(); }}
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Pokaż szczegóły"
                              title="Pokaż szczegóły"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-80">
                            <div className="flex items-center gap-2 mb-2">
                              <reason.Icon className="h-5 w-5 text-primary" />
                              <div className="font-semibold">{reason.title}</div>
                            </div>
                            <div className="text-sm whitespace-pre-line text-muted-foreground">{reason.details}</div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="block sm:hidden">
                        <button
                          type="button"
                          className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent self-center"
                          onPointerDown={(e) => { e.stopPropagation(); }}
                          onMouseDown={(e) => { e.stopPropagation(); }}
                          onTouchStart={(e) => { e.stopPropagation(); }}
                          onClick={(e) => { e.stopPropagation(); setMobileDetails(reason.id); }}
                          aria-label="Pokaż szczegóły"
                          title="Pokaż szczegóły"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </div>
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
                className={`text-left rounded-lg border p-4 hover:shadow transition-all cursor-pointer select-none ${
                  selectedIds.includes('custom') ? "border-primary bg-primary/5" : "border-border"
                } -mx-2 sm:mx-0 h-full sm:col-span-2`}
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
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <div className="flex gap-2">
              <Button onClick={() => goToStep(2)} disabled={!canGoNextFromStep1}>Dalej</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 transition-all duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Dostosuj wiadomość</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm mb-1 block">Imię i nazwisko</label>
                  <Input placeholder="Jan Kowalski" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="relative" onKeyDown={(e) => {
                  // Esc zamyka listę
                  if (e.key === 'Escape') setComboOpen(false);
                }}>
                  <label className="text-sm mb-1 block">Uczelnia</label>
                  <div className="relative">
                    <input
                      ref={comboInputRef}
                      className="flex h-12 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="- Wybierz uczelnię -"
                      value={university}
                      onChange={(e) => {
                        setUniversity(e.target.value);
                        setComboOpen(true);
                      }}
                      onFocus={() => setComboOpen(true)}
                      aria-autocomplete="list"
                      aria-expanded={comboOpen}
                      aria-controls="uni-combobox-list"
                      role="combobox"
                    />
                    {university && (
                      <button
                        type="button"
                        onClick={() => { setUniversity(''); setComboOpen(false); comboInputRef.current?.focus(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Wyczyść"
                        title="Wyczyść"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {comboOpen && filteredUniversities.length > 0 && (
                    <div
                      id="uni-combobox-list"
                      role="listbox"
                      className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
                    >
                      {filteredUniversities.map((u, idx) => (
                        <div
                          key={u}
                          role="option"
                          aria-selected={idx === activeIndex}
                          onMouseDown={(e) => {
                            // onMouseDown to avoid input blur before click
                            e.preventDefault();
                            setUniversity(u);
                            setComboOpen(false);
                            setActiveIndex(-1);
                          }}
                          className={`cursor-pointer select-none rounded px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${idx === activeIndex ? 'bg-accent text-accent-foreground' : ''}`}
                        >
                          {u}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <div className="flex gap-2">
                <Button variant="outline" className="col-start-1 row-start-1 px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center" onClick={() => goToStep(1)}>
                  <ArrowLeft className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Wstecz</span>
                </Button>
                <Button onClick={() => goToStep(3)} disabled={!canGoNextFromStep2}>Przejrzyj</Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Podgląd wiadomości</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 p-3 rounded-md border">
{body}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Reason Details Drawer */}
      <Drawer open={!!mobileDetails} onOpenChange={(open) => !open && setMobileDetails(null)}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center gap-2">
              {(() => { const R = ALL_REASONS.find(r => r.id === mobileDetails); return R ? <R.Icon className="h-5 w-5 text-primary" /> : null })()}
              <DrawerTitle>{ALL_REASONS.find(r => r.id === mobileDetails)?.title}</DrawerTitle>
            </div>
            <div className="px-4 sm:px-0">
              <DrawerDescription className="mt-2 whitespace-pre-line text-left">
                {ALL_REASONS.find(r => r.id === mobileDetails)?.details}
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="p-4 pt-0">
            <Button variant="outline" className="w-full" onClick={() => setMobileDetails(null)}>Zamknij</Button>
          </div>
        </DrawerContent>
      </Drawer>

      {step === 3 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Sprawdź treść i wyślij wiadomość</CardTitle>
            
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Temat:</div>
              <div className="p-2 rounded border bg-muted/30 text-sm">{subject}</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground mb-1">Adresaci:</div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-9 sm:h-10 px-3">Zobacz</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adresaci</DialogTitle>
                      <DialogDescription>Wszystkie skrzynki są oficjalnymi adresami email</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm max-h-72 overflow-auto pr-1">
                      <ul className="list-disc pl-5 space-y-1 break-all">
                        {Array.from(new Set([...(recipients.to || []), ...((recipients.cc || []))])).map((addr) => (
                          <li key={addr}>{addr}</li>
                        ))}
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Treść:</div>
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 p-3 rounded-md border">
{body}
              </pre>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
            <div className="grid w-full grid-cols-[auto,1fr,auto] gap-2 sm:flex sm:w-auto sm:items-stretch sm:gap-2">
              <Button variant="outline" className="px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Wstecz</span>
              </Button>
              <a href={mailto} className="flex-1 sm:flex-none">
                <Button className="w-full justify-center">Otwórz w mailu</Button>
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
              <div className="col-span-3 grid grid-cols-2 gap-1 sm:hidden">
                <a href={gmailUrl} target="_blank" rel="noopener noreferrer" title="Otwórz w Gmailu" aria-label="Otwórz w Gmailu" className="justify-self-end">
                  <Button variant="outline" className="px-2 w-10 shrink-0 justify-center">
                    <img src="https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//gmail.png" alt="Gmail" className="h-4 w-4" />
                  </Button>
                </a>
                <a href={outlookUrl} target="_blank" rel="noopener noreferrer" title="Otwórz w Outlooku" aria-label="Otwórz w Outlooku" className="justify-self-start">
                  <Button variant="outline" className="px-2 w-10 shrink-0 justify-center">
                    <img src="https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//outlook.png" alt="Outlook" className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              <a href={gmailUrl} target="_blank" rel="noopener noreferrer" title="Otwórz w Gmailu" aria-label="Otwórz w Gmailu" className="hidden sm:block">
                <Button variant="outline" className="px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center">
                  <img src="https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//gmail.png" alt="Gmail" className="h-4 w-4" />
                </Button>
              </a>
              <a href={outlookUrl} target="_blank" rel="noopener noreferrer" title="Otwórz w Outlooku" aria-label="Otwórz w Outlooku" className="hidden sm:block">
                <Button variant="outline" className="px-2 sm:px-3 w-10 sm:w-auto shrink-0 justify-center">
                  <img src="https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//outlook.png" alt="Outlook" className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
