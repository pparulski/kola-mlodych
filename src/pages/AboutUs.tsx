
import React from 'react';

export default function AboutUs() {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert bg-[hsl(var(--content-box))] p-3 md:p-5 rounded-lg shadow-sm">
      <h1>O nas</h1>
      
      <section>
        <h2>Kim jesteśmy?</h2>
        <p>
          Jesteśmy Kołem Młodych Inicjatywy Pracowniczej - organizacją zrzeszającą młodych pracowników i pracowniczki, 
          działającą w ramach Ogólnopolskiego Związku Zawodowego Inicjatywa Pracownicza (OZZ IP).
        </p>
      </section>

      <section>
        <h2>Nasza misja</h2>
        <p>
          Naszym celem jest ochrona praw i interesów młodych pracowników i pracowniczek w Polsce. 
          Działamy na rzecz poprawy warunków pracy, godnych wynagrodzeń oraz przeciwdziałania 
          dyskryminacji w miejscu pracy.
        </p>
      </section>

      <section>
        <h2>Co robimy?</h2>
        <ul>
          <li>Organizujemy szkolenia i warsztaty dotyczące praw pracowniczych</li>
          <li>Udzielamy wsparcia prawnego i związkowego</li>
          <li>Prowadzimy działania edukacyjne i informacyjne</li>
          <li>Współpracujemy z innymi organizacjami pracowniczymi</li>
          <li>Wspieramy procesy organizowania się w miejscach pracy</li>
        </ul>
      </section>

      <section>
        <h2>Dołącz do nas</h2>
        <p>
          Jeśli chcesz działać na rzecz praw pracowniczych, dołącz do nas! Razem możemy więcej. 
          Skontaktuj się z nami przez formularz kontaktowy lub przyjdź na jedno z naszych spotkań.
        </p>
      </section>

      <section>
        <h2>Nasze wartości</h2>
        <ul>
          <li>Solidarność pracownicza</li>
          <li>Demokracja w miejscu pracy</li>
          <li>Równość i przeciwdziałanie dyskryminacji</li>
          <li>Transparentność działań</li>
          <li>Wzajemne wsparcie</li>
        </ul>
      </section>
    </div>
  );
}
