
import React from 'react';
import { SEO } from '@/components/seo/SEO';

export default function AboutUs() {
  return (
    <>
      <SEO
        title="O nas"
        description="Koła Młodych Inicjatywy Pracowniczej - organizacja zrzeszająca młodych pracowników i pracowniczki, działająca w ramach Ogólnopolskiego Związku Zawodowego Inicjatywa Pracownicza (OZZ IP)."
        keywords="związek zawodowy, młodzi pracownicy, prawa pracownicze, inicjatywa pracownicza"
      />
      
      <div className="prose prose-lg max-w-none dark:prose-invert content-box p-4 md:p-6 shadow-elevated animate-enter">
        <section className="my-4">
          <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">Kim jesteśmy?</h2>
          <p className="mt-3">
            Jesteśmy Kołem Młodych Inicjatywy Pracowniczej - organizacją zrzeszającą młodych pracowników i pracowniczki, 
            działającą w ramach Ogólnopolskiego Związku Zawodowego Inicjatywa Pracownicza (OZZ IP).
          </p>
        </section>

        <section className="my-6">
          <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">Nasza misja</h2>
          <p className="mt-3">
            Naszym celem jest ochrona praw i interesów młodych pracowników i pracowniczek w Polsce. 
            Działamy na rzecz poprawy warunków pracy, godnych wynagrodzeń oraz przeciwdziałania 
            dyskryminacji w miejscu pracy.
          </p>
        </section>

        <section className="my-6">
          <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">Co robimy?</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>Organizujemy szkolenia i warsztaty dotyczące praw pracowniczych</li>
            <li>Udzielamy wsparcia prawnego i związkowego</li>
            <li>Prowadzimy działania edukacyjne i informacyjne</li>
            <li>Współpracujemy z innymi organizacjami pracowniczymi</li>
            <li>Wspieramy procesy organizowania się w miejscach pracy</li>
          </ul>
        </section>

        <section className="my-6 accent-gradient-light p-4 rounded-lg">
          <h2 className="text-2xl font-bold pb-2">Dołącz do nas</h2>
          <p className="mt-3">
            Jeśli chcesz działać na rzecz praw pracowniczych, dołącz do nas! Razem możemy więcej. 
            Skontaktuj się z nami przez formularz kontaktowy lub przyjdź na jedno z naszych spotkań.
          </p>
        </section>

        <section className="my-6">
          <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">Nasze wartości</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>Solidarność pracownicza</li>
            <li>Demokracja w miejscu pracy</li>
            <li>Równość i przeciwdziałanie dyskryminacji</li>
            <li>Transparentność działań</li>
            <li>Wzajemne wsparcie</li>
          </ul>
        </section>
      </div>
    </>
  );
}
