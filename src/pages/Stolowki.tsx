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
    summary: "Masowe żywienie jest przyjazne środowisku i ogranicza jednorazowe opakowania.",
    details:
      "Zorganizowane, masowe posiłki w miejscu nauki i pracy to rozwiązanie przyjazne środowisku. Ograniczają marnowanie jedzenia i zużycie jednorazowych opakowań. Uczelnie mogą też decydować o jadłospisie, biorąc pod uwagę kwestie ekologiczne.",
    Icon: Leaf,
  },
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
};

const UNIVERSITIES_BASE = [
  // Uczelnie artystyczne (dodane)
  "Akademia Muzyczna im. Feliksa Nowowiejskiego w Bydgoszczy",
  "Akademia Muzyczna im. Grażyny i Kiejstuta Bacewiczów w Łodzi",
  "Akademia Muzyczna im. Karola Szymanowskiego w Katowicach",
  "Akademia Muzyczna im. Krzysztofa Pendereckiego w Krakowie",
  "Akademia Muzyczna im. K. Lipińskiego we Wrocławiu",
  "Akademia Sztuk Pięknych im. Eugeniusza Gepperta we Wrocławiu",
  "Akademia Sztuk Pięknych im. Jana Matejki w Krakowie",
  "Akademia Sztuk Pięknych im. Władysława Strzemińskiego w Łodzi",
  "Akademia Sztuk Pięknych w Gdańsku",
  "Akademia Sztuk Pięknych w Katowicach",
  "Akademia Sztuk Pięknych w Warszawie",
  "Akademia Sztuk Teatralnych im. St. Wyspiańskiego w Krakowie",
  "Akademia Sztuki w Szczecinie",
  "Państwowa Wyższa Szkoła Filmowa, Telewizyjna i Teatralna im. L.Schillera w Łodzi",
  "Uniwersytet Artystyczny im. Magdaleny Abakanowicz w Poznaniu",
  "Uniwersytet Muzyczny Fryderyka Chopina",

  "Akademia Bialska im. Jana Pawła II",
  "Akademia Górniczo-Hutnicza im. Stanisława Staszica w Krakowie",
  "Akademia im. Jakuba z Paradyża",
  "Akademia Łomżyńska",
  "Akademia Mazowiecka",
  "Akademia Nauk Stosowanych Angelusa Silesiusa",
  "Akademia Nauk Stosowanych im. Hipolita Cegielskiego w Gnieźnie Uczelnia Państwowa",
  "Akademia Nauk Stosowanych im. Jana Amosa Komeńskiego w Lesznie",
  "Akademia Nauk Stosowanych im. Stanisława Staszica w Pile",
  "Akademia Nauk Stosowanych Stefana Batorego",
  "Akademia Nauk Stosowanych w Elblągu",
  "Akademia Nauk Stosowanych w Koninie",
  "Akademia Nauk Stosowanych w Nowym Sączu",
  "Akademia Nauk Stosowanych w Nowym Targu",
  "Akademia Nauk Stosowanych w Raciborzu",
  "Akademia Nauk Stosowanych w Wałczu",
  "Akademia Pedagogiki Specjalnej im. Marii Grzegorzewskiej",
  "Akademia Piotrkowska",
  "Akademia Tarnowska",
  "Akademia Wychowania Fizycznego i Sportu im. Jędrzeja Śniadeckiego w Gdańsku",
  "Akademia Wychowania Fizycznego im. Bronisława Czecha w Krakowie",
  "Akademia Wychowania Fizycznego im. Eugeniusza Piaseckiego w Poznaniu",
  "Akademia Wychowania Fizycznego im. Jerzego Kukuczki w Katowicach",
  "Akademia Wychowania Fizycznego im. Polskich Olimpijczyków we Wrocławiu",
  "Akademia Wychowania Fizycznego Józefa Piłsudskiego w Warszawie",
  "Akademia Zamojska",
  "Chrześcijańska Akademia Teologiczna w Warszawie",
  "Collegium Witelona Uczelnia Państwowa",
  "Karkonoska Akademia Nauk Stosowanych w Jeleniej Górze",
  "Katolicki Uniwersytet Lubelski Jana Pawła II",
  "Małopolska Uczelnia Państwowa im. rotmistrza Witolda Pileckiego w Oświęcimiu",
  "Państwowa Akademia Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie",
  "Państwowa Akademia Nauk Stosowanych im. ks. Bronisława Markiewicza w Jarosławiu",
  "Państwowa Akademia Nauk Stosowanych im. prof. Stanisława Tarnowskiego w Tarnobrzegu",
  "Państwowa Akademia Nauk Stosowanych w Chełmie",
  "Państwowa Akademia Nauk Stosowanych w Głogowie",
  "Państwowa Akademia Nauk Stosowanych w Koszalinie",
  "Państwowa Akademia Nauk Stosowanych w Krośnie",
  "Państwowa Akademia Nauk Stosowanych w Nysie",
  "Państwowa Akademia Nauk Stosowanych w Przemyślu",
  "Państwowa Akademia Nauk Stosowanych we Włocławku",
  "Państwowa Uczelnia Zawodowa im. prof. Edwarda F. Szczepanika w Suwałkach",
  "Politechnika Białostocka",
  "Politechnika Bydgoska im. Jana i Jędrzeja Śniadeckich",
  "Politechnika Częstochowska",
  "Politechnika Gdańska",
  "Politechnika Koszalińska",
  "Politechnika Krakowska im. Tadeusza Kościuszki",
  "Politechnika Lubelska",
  "Politechnika Łódzka",
  "Politechnika Opolska",
  "Politechnika Poznańska",
  "Politechnika Rzeszowska imienia Ignacego Łukasiewicza",
  "Politechnika Śląska",
  "Politechnika Świętokrzyska",
  "Politechnika Warszawska",
  "Politechnika Wrocławska",
  "Publiczna Uczelnia Zawodowa w Grudziądzu",
  "Szkoła Główna Gospodarstwa Wiejskiego w Warszawie",
  "Szkoła Główna Handlowa w Warszawie",
  "Szkoła Główna Mikołaja Kopernika",
  "Uczelnia Państwowa im. Jana Grodka w Sanoku",
  "Uniwersytet Bielsko-Bialski",
  "Uniwersytet Ekonomiczny w Katowicach",
  "Uniwersytet Ekonomiczny w Krakowie",
  "Uniwersytet Ekonomiczny w Poznaniu",
  "Uniwersytet Ekonomiczny we Wrocławiu",
  "Uniwersytet Gdański w Gdańsku",
  "Uniwersytet im. Adama Mickiewicza w Poznaniu",
  "Uniwersytet Jagielloński w Krakowie",
  "Uniwersytet Jana Długosza w Częstochowie",
  "Uniwersytet Jana Kochanowskiego w Kielcach",
  "Uniwersytet Kaliski im. Prezydenta Stanisława Wojciechowskiego",
  "Uniwersytet Kardynała Stefana Wyszyńskiego w Warszawie",
  "Uniwersytet Kazimierza Wielkiego",
  "Uniwersytet Komisji Edukacji Narodowej w Krakowie",
  "Uniwersytet Łódzki",
  "Uniwersytet Marii Curie-Skłodowskiej",
  "Uniwersytet Mikołaja Kopernika w Toruniu",
  "Uniwersytet Opolski",
  "Uniwersytet Pomorski w Słupsku",
  "Uniwersytet Przyrodniczy w Lublinie",
  "Uniwersytet Przyrodniczy w Poznaniu",
  "Uniwersytet Przyrodniczy we Wrocławiu",
  "Uniwersytet Radomski im. Kazimierza Pułaskiego",
  "Uniwersytet Rolniczy im. Hugona Kołłątaja w Krakowie",
  "Uniwersytet Rzeszowski",
  "Uniwersytet Szczeciński",
  "Uniwersytet Śląski w Katowicach",
  "Uniwersytet Warszawski",
  "Uniwersytet Warmińsko-Mazurski w Olsztynie",
  "Uniwersytet w Białymstoku",
  "Uniwersytet w Siedlcach",
  "Uniwersytet Wrocławski",
  "Uniwersytet Zielonogórski w Zielonej Górze",
  "Zachodniopomorski Uniwersytet Technologiczny w Szczecinie",
];

const UNIVERSITIES = [...UNIVERSITIES_BASE].sort((a, b) => a.localeCompare(b, 'pl', { sensitivity: 'base' }));

function encodeMailtoComponent(value: string) {
  return encodeURIComponent(value);
}

function lowercaseFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const GENITIVE_BY_UNI: Record<string, string> = {
  // Uczelnie artystyczne
  "Akademia Muzyczna im. Feliksa Nowowiejskiego w Bydgoszczy": "Akademii Muzycznej im. Feliksa Nowowiejskiego w Bydgoszczy",
  "Akademia Muzyczna im. Grażyny i Kiejstuta Bacewiczów w Łodzi": "Akademii Muzycznej im. Grażyny i Kiejstuta Bacewiczów w Łodzi",
  "Akademia Muzyczna im. Karola Szymanowskiego w Katowicach": "Akademii Muzycznej im. Karola Szymanowskiego w Katowicach",
  "Akademia Muzyczna im. Krzysztofa Pendereckiego w Krakowie": "Akademii Muzycznej im. Krzysztofa Pendereckiego w Krakowie",
  "Akademia Muzyczna im. K. Lipińskiego we Wrocławiu": "Akademii Muzycznej im. K. Lipińskiego we Wrocławiu",
  "Akademia Sztuk Pięknych im. Eugeniusza Gepperta we Wrocławiu": "Akademii Sztuk Pięknych im. Eugeniusza Gepperta we Wrocławiu",
  "Akademia Sztuk Pięknych im. Jana Matejki w Krakowie": "Akademii Sztuk Pięknych im. Jana Matejki w Krakowie",
  "Akademia Sztuk Pięknych im. Władysława Strzemińskiego w Łodzi": "Akademii Sztuk Pięknych im. Władysława Strzemińskiego w Łodzi",
  "Akademia Sztuk Pięknych w Gdańsku": "Akademii Sztuk Pięknych w Gdańsku",
  "Akademia Sztuk Pięknych w Katowicach": "Akademii Sztuk Pięknych w Katowicach",
  "Akademia Sztuk Pięknych w Warszawie": "Akademii Sztuk Pięknych w Warszawie",
  "Akademia Sztuk Teatralnych im. St. Wyspiańskiego w Krakowie": "Akademii Sztuk Teatralnych im. St. Wyspiańskiego w Krakowie",
  "Akademia Sztuki w Szczecinie": "Akademii Sztuki w Szczecinie",
  "Państwowa Wyższa Szkoła Filmowa, Telewizyjna i Teatralna im. L.Schillera w Łodzi": "Państwowej Wyższej Szkoły Filmowej, Telewizyjnej i Teatralnej im. L.Schillera w Łodzi",
  "Uniwersytet Artystyczny im. Magdaleny Abakanowicz w Poznaniu": "Uniwersytetu Artystycznego im. Magdaleny Abakanowicz w Poznaniu",
  "Uniwersytet Muzyczny Fryderyka Chopina": "Uniwersytetu Muzycznego Fryderyka Chopina",

  "Akademia Górniczo-Hutnicza im. Stanisława Staszica w Krakowie": "Akademii Górniczo-Hutniczej im. Stanisława Staszica w Krakowie",
  "Akademia im. Jakuba z Paradyża": "Akademii im. Jakuba z Paradyża",
  "Akademia Mazowiecka": "Akademii Mazowieckiej",
  "Akademia Pedagogiki Specjalnej im. Marii Grzegorzewskiej": "Akademii Pedagogiki Specjalnej im. Marii Grzegorzewskiej",
  "Akademia Piotrkowska": "Akademii Piotrkowskiej",
  "Akademia Wychowania Fizycznego i Sportu im. Jędrzeja Śniadeckiego w Gdańsku": "Akademii Wychowania Fizycznego i Sportu im. Jędrzeja Śniadeckiego w Gdańsku",
  "Akademia Wychowania Fizycznego im. Bronisława Czecha w Krakowie": "Akademii Wychowania Fizycznego im. Bronisława Czecha w Krakowie",
  "Akademia Wychowania Fizycznego im. Eugeniusza Piaseckiego w Poznaniu": "Akademii Wychowania Fizycznego im. Eugeniusza Piaseckiego w Poznaniu",
  "Akademia Wychowania Fizycznego im. Jerzego Kukuczki w Katowicach": "Akademii Wychowania Fizycznego im. Jerzego Kukuczki w Katowicach",
  "Akademia Wychowania Fizycznego im. Polskich Olimpijczyków we Wrocławiu": "Akademii Wychowania Fizycznego im. Polskich Olimpijczyków we Wrocławiu",
  "Akademia Wychowania Fizycznego Józefa Piłsudskiego w Warszawie": "Akademii Wychowania Fizycznego Józefa Piłsudskiego w Warszawie",
  "Chrześcijańska Akademia Teologiczna w Warszawie": "Chrześcijańskiej Akademii Teologicznej w Warszawie",
  "Katolicki Uniwersytet Lubelski Jana Pawła II": "Katolickiego Uniwersytetu Lubelskiego Jana Pawła II",
  "Politechnika Białostocka": "Politechniki Białostockiej",
  "Politechnika Bydgoska im. Jana i Jędrzeja Śniadeckich": "Politechniki Bydgoskiej im. Jana i Jędrzeja Śniadeckich",
  "Politechnika Częstochowska": "Politechniki Częstochowskiej",
  "Politechnika Gdańska": "Politechniki Gdańskiej",
  "Politechnika Koszalińska": "Politechniki Koszalińskiej",
  "Politechnika Krakowska im. Tadeusza Kościuszki": "Politechniki Krakowskiej im. Tadeusza Kościuszki",
  "Politechnika Lubelska": "Politechniki Lubelskiej",
  "Politechnika Łódzka": "Politechniki Łódzkiej",
  "Politechnika Opolska": "Politechniki Opolskiej",
  "Politechnika Poznańska": "Politechniki Poznańskiej",
  "Politechnika Rzeszowska imienia Ignacego Łukasiewicza": "Politechniki Rzeszowskiej imienia Ignacego Łukasiewicza",
  "Politechnika Śląska": "Politechniki Śląskiej",
  "Politechnika Świętokrzyska": "Politechniki Świętokrzyskiej",
  "Politechnika Warszawska": "Politechniki Warszawskiej",
  "Politechnika Wrocławska": "Politechniki Wrocławskiej",
  "Szkoła Główna Gospodarstwa Wiejskiego w Warszawie": "Szkoły Głównej Gospodarstwa Wiejskiego w Warszawie",
  "Szkoła Główna Handlowa w Warszawie": "Szkoły Głównej Handlowej w Warszawie",
  "Szkoła Główna Mikołaja Kopernika": "Szkoły Głównej Mikołaja Kopernika",
  "Uniwersytet Bielsko-Bialski": "Uniwersytetu Bielsko-Bialskiego",
  "Uniwersytet Ekonomiczny w Katowicach": "Uniwersytetu Ekonomicznego w Katowicach",
  "Uniwersytet Ekonomiczny w Krakowie": "Uniwersytetu Ekonomicznego w Krakowie",
  "Uniwersytet Ekonomiczny w Poznaniu": "Uniwersytetu Ekonomicznego w Poznaniu",
  "Uniwersytet Ekonomiczny we Wrocławiu": "Uniwersytetu Ekonomicznego we Wrocławiu",
  "Uniwersytet Gdański w Gdańsku": "Uniwersytetu Gdańskiego w Gdańsku",
  "Uniwersytet im. Adama Mickiewicza w Poznaniu": "Uniwersytetu im. Adama Mickiewicza w Poznaniu",
  "Uniwersytet Jagielloński w Krakowie": "Uniwersytetu Jagiellońskiego w Krakowie",
  "Uniwersytet Jana Długosza w Częstochowie": "Uniwersytetu Jana Długosza w Częstochowie",
  "Uniwersytet Jana Kochanowskiego w Kielcach": "Uniwersytetu Jana Kochanowskiego w Kielcach",
  "Uniwersytet Kaliski im. Prezydenta Stanisława Wojciechowskiego": "Uniwersytetu Kaliskiego im. Prezydenta Stanisława Wojciechowskiego",
  "Uniwersytet Kardynała Stefana Wyszyńskiego w Warszawie": "Uniwersytetu Kardynała Stefana Wyszyńskiego w Warszawie",
  "Uniwersytet Kazimierza Wielkiego": "Uniwersytetu Kazimierza Wielkiego",
  "Uniwersytet Komisji Edukacji Narodowej w Krakowie": "Uniwersytetu Komisji Edukacji Narodowej w Krakowie",
  "Uniwersytet Łódzki": "Uniwersytetu Łódzkiego",
  "Uniwersytet Marii Curie-Skłodowskiej": "Uniwersytetu Marii Curie-Skłodowskiej",
  "Uniwersytet Mikołaja Kopernika w Toruniu": "Uniwersytetu Mikołaja Kopernika w Toruniu",
  "Uniwersytet Opolski": "Uniwersytetu Opolskiego",
  "Uniwersytet Pomorski w Słupsku": "Uniwersytetu Pomorskiego w Słupsku",
  "Uniwersytet Przyrodniczy w Lublinie": "Uniwersytetu Przyrodniczego w Lublinie",
  "Uniwersytet Przyrodniczy w Poznaniu": "Uniwersytetu Przyrodniczego w Poznaniu",
  "Uniwersytet Przyrodniczy we Wrocławiu": "Uniwersytetu Przyrodniczego we Wrocławiu",
  "Uniwersytet Radomski im. Kazimierza Pułaskiego": "Uniwersytetu Radomskiego im. Kazimierza Pułaskiego",
  "Uniwersytet Rolniczy im. Hugona Kołłątaja w Krakowie": "Uniwersytetu Rolniczego im. Hugona Kołłątaja w Krakowie",
  "Uniwersytet Rzeszowski": "Uniwersytetu Rzeszowskiego",
  "Uniwersytet Szczeciński": "Uniwersytetu Szczecińskiego",
  "Uniwersytet Śląski w Katowicach": "Uniwersytetu Śląskiego w Katowicach",
  "Uniwersytet w Białymstoku": "Uniwersytetu w Białymstoku",
  "Uniwersytet w Siedlcach": "Uniwersytetu w Siedlcach",
  "Uniwersytet Warmińsko-Mazurski w Olsztynie": "Uniwersytetu Warmińsko-Mazurskiego w Olsztynie",
  "Uniwersytet Warszawski": "Uniwersytetu Warszawskiego",
  "Uniwersytet Wrocławski": "Uniwersytetu Wrocławskiego",
  "Uniwersytet Zielonogórski w Zielonej Górze": "Uniwersytetu Zielonogórskiego w Zielonej Górze",
  "Zachodniopomorski Uniwersytet Technologiczny w Szczecinie": "Zachodniopomorskiego Uniwersytetu Technologicznego w Szczecinie",
  "Akademia Bialska im. Jana Pawła II": "Akademii Bielskiej im. Jana Pawła II",
  "Akademia Łomżyńska": "Akademii Łomżyńskiej",
  "Akademia Nauk Stosowanych Angelusa Silesiusa": "Akademii Nauk Stosowanych Angelusa Silesiusa",
  "Akademia Nauk Stosowanych im. Hipolita Cegielskiego w Gnieźnie Uczelnia Państwowa": "Akademii Nauk Stosowanych im. Hipolita Cegielskiego w Gnieźnie Uczelni Państwowej",
  "Akademia Nauk Stosowanych im. Jana Amosa Komeńskiego w Lesznie": "Akademii Nauk Stosowanych im. Jana Amosa Komeńskiego w Lesznie",
  "Akademia Nauk Stosowanych im. Stanisława Staszica w Pile": "Akademii Nauk Stosowanych im. Stanisława Staszica w Pile",
  "Akademia Nauk Stosowanych Stefana Batorego": "Akademii Nauk Stosowanych Stefana Batorego",
  "Akademia Nauk Stosowanych w Elblągu": "Akademii Nauk Stosowanych w Elblągu",
  "Akademia Nauk Stosowanych w Koninie": "Akademii Nauk Stosowanych w Koninie",
  "Akademia Nauk Stosowanych w Nowym Sączu": "Akademii Nauk Stosowanych w Nowym Sączu",
  "Akademia Nauk Stosowanych w Nowym Targu": "Akademii Nauk Stosowanych w Nowym Targu",
  "Akademia Nauk Stosowanych w Raciborzu": "Akademii Nauk Stosowanych w Raciborzu",
  "Akademia Nauk Stosowanych w Wałczu": "Akademii Nauk Stosowanych w Wałczu",
  "Akademia Tarnowska": "Akademii Tarnowskiej",
  "Akademia Zamojska": "Akademii Zamojskiej",
  "Collegium Witelona Uczelnia Państwowa": "Collegium Witelona Uczelni Państwowej",
  "Karkonoska Akademia Nauk Stosowanych w Jeleniej Górze": "Karkonoskiej Akademii Nauk Stosowanych w Jeleniej Górze",
  "Małopolska Uczelnia Państwowa im. rotmistrza Witolda Pileckiego w Oświęcimiu": "Małopolskiej Uczelni Państwowej im. rotmistrza Witolda Pileckiego w Oświęcimiu",
  "Państwowa Akademia Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie": "Państwowej Akademii Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie",
  "Państwowa Akademia Nauk Stosowanych im. ks. Bronisława Markiewicza w Jarosławiu": "Państwowej Akademii Nauk Stosowanych im. ks. Bronisława Markiewicza w Jarosławiu",
  "Państwowa Akademia Nauk Stosowanych w Chełmie": "Państwowej Akademii Nauk Stosowanych w Chełmie",
  "Państwowa Akademia Nauk Stosowanych w Głogowie": "Państwowej Akademii Nauk Stosowanych w Głogowie",
  "Państwowa Akademia Nauk Stosowanych w Koszalinie": "Państwowej Akademii Nauk Stosowanych w Koszalinie",
  "Państwowa Akademia Nauk Stosowanych w Krośnie": "Państwowej Akademii Nauk Stosowanych w Krośnie",
  "Państwowa Akademia Nauk Stosowanych w Nysie": "Państwowej Akademii Nauk Stosowanych w Nysie",
  "Państwowa Akademia Nauk Stosowanych w Przemyślu": "Państwowej Akademii Nauk Stosowanych w Przemyślu",
  "Państwowa Akademia Nauk Stosowanych we Włocławku": "Państwowej Akademii Nauk Stosowanych we Włocławku",
  "Państwowa Uczelnia Zawodowa im. prof. Edwarda F. Szczepanika w Suwałkach": "Państwowej Uczelni Zawodowej im. prof. Edwarda F. Szczepanika w Suwałkach",
  "Publiczna Uczelnia Zawodowa w Grudziądzu": "Publicznej Uczelni Zawodowej w Grudziądzu",
  "Uczelnia Państwowa im. Jana Grodka w Sanoku": "Uczelni Państwowej im. Jana Grodka w Sanoku",
};

function toGenitive(university: string) {
  if (!university) return "naszej uczelni";
  if (GENITIVE_BY_UNI[university]) return GENITIVE_BY_UNI[university];
  const patterns: Array<{ re: RegExp; replace: string }> = [
    { re: /^Państwowa Akademia Nauk Stosowanych/i, replace: "Państwowej Akademii Nauk Stosowanych" },
    { re: /^Akademia Wychowania Fizycznego i Sportu/i, replace: "Akademii Wychowania Fizycznego i Sportu" },
    { re: /^Akademia Wychowania Fizycznego Józefa Piłsudskiego/i, replace: "Akademii Wychowania Fizycznego Józefa Piłsudskiego" },
    { re: /^Akademia Wychowania Fizycznego/i, replace: "Akademii Wychowania Fizycznego" },
    { re: /^Akademia Nauk Stosowanych/i, replace: "Akademii Nauk Stosowanych" },
    { re: /^Szkoła Główna/i, replace: "Szkoły Głównej" },
    { re: /^Szkoła/i, replace: "Szkoły" },
    { re: /^Uczelnia/i, replace: "Uczelni" },
    { re: /^Uniwersytet/i, replace: "Uniwersytetu" },
    { re: /^Politechnika/i, replace: "Politechniki" },
    { re: /^Akademia/i, replace: "Akademii" },
  ];
  for (const { re, replace } of patterns) {
    if (re.test(university)) {
      return university.replace(re, replace);
    }
  }
  return university; // fallback
}

function toPrepositional(university: string) {
  // Build from genitive as base and adjust headword to locative; pick preposition
  const gen = toGenitive(university);
  let prep = "na";
  let loc = gen;
  if (/^Uniwersytetu/i.test(gen)) {
    loc = gen.replace(/^Uniwersytetu/i, "Uniwersytecie");
    prep = "na";
  } else if (/^Politechniki/i.test(gen)) {
    loc = gen.replace(/^Politechniki/i, "Politechnice");
    prep = "na";
  } else if (/^Akademii/i.test(gen)) {
    // Akademii stays the same form; prefer "na"
    loc = gen;
    prep = "na";
  } else if (/^Szkoły Głównej/i.test(gen)) {
    loc = gen.replace(/^Szkoły Głównej/i, "Szkole Głównej");
    prep = "w";
  } else if (/^Szkoły/i.test(gen)) {
    loc = gen.replace(/^Szkoły/i, "Szkole");
    prep = "w";
  } else if (/^Uczelni/i.test(gen)) {
    // Uczelni (no change), prefer "w"
    loc = gen;
    prep = "w";
  } else if (/^Collegium/i.test(gen)) {
    // keep as is; prefer "w"
    loc = gen;
    prep = "w";
  }
  return `${prep} ${loc}`;
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
    "apeluję o uruchomienie ogólnopolskiego funduszu stołówkowego dla szkolnictwa wyższego, który umożliwi prowadzenie stołówki studenckiej na uczelni, na której obecnie studiuję.",
    "",
    reasonsIntro,
    reasonsLines,
    customLine,
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
  ];

  const baseRecipients = university && RECIPIENTS_BY_UNI[university]
    ? RECIPIENTS_BY_UNI[university]
    : { to: ["kontakt@przyklad.pl"], cc: [], bcc: [] };

  const recipients = {
    to: Array.from(new Set([...(baseRecipients.to || []), ...commonTo])),
    cc: baseRecipients.cc || [],
    bcc: baseRecipients.bcc || [],
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
  const scrollToForm = () => {
    if (!progressRef.current) return;
    const header = document.querySelector('.sticky-page-header-wrapper') as HTMLElement | null;
    const banner = document.getElementById('join-banner') as HTMLElement | null;

    // Temporarily disable sticky behavior to avoid covering content during programmatic scroll
    let restore: null | (() => void) = null;
    if (header) {
      const prevPosition = header.style.position;
      const prevTop = header.style.top;
      header.style.position = 'static';
      header.style.top = '';
      restore = () => {
        header.style.position = prevPosition;
        header.style.top = prevTop;
      };
    }

    const headerH = header ? header.getBoundingClientRect().height : 0;
    const bannerH = banner ? banner.getBoundingClientRect().height : 0;
    const fallback = window.matchMedia('(max-width: 640px)').matches ? 100 : 120;
    const offset = (headerH + bannerH) || fallback;
    const rect = progressRef.current.getBoundingClientRect();
    const target = rect.top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });

    // Restore sticky after scroll settles
    if (restore) {
      window.setTimeout(() => restore && restore(), 400);
    }
  };
  const goToStep = (s: 1|2|3) => {
    // Do not auto-scroll between steps to avoid triggering sticky header behavior
    setStep(s);
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
