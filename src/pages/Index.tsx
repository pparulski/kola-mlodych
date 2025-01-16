import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { NewsEditor } from "@/components/NewsEditor";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const newsItems = [
  {
    id: "1",
    title: "Wybory do Zarządu Koła Młodych",
    date: "2024-02-20",
    content: "Coroczne wybory do zarządu Koła Młodych odbędą się w przyszłym miesiącu. Zachęcamy wszystkich członków do aktywnego udziału w tym ważnym wydarzeniu. Kandydaci będą mieli okazję zaprezentować swoje programy i wizje rozwoju organizacji. W tym roku szczególny nacisk kładziemy na zwiększenie zaangażowania studentów w działalność związkową oraz rozwój współpracy międzyuczelnianej. Wybory odbędą się w formie hybrydowej, umożliwiając głosowanie zarówno stacjonarne jak i online. Szczegółowy harmonogram oraz zasady zgłaszania kandydatur zostaną opublikowane w najbliższym czasie.",
  },
  {
    id: "2",
    title: "Nowa przestrzeń do nauki",
    date: "2024-02-19",
    content: "W przyszłym tygodniu zostanie otwarta nowa przestrzeń do nauki w budynku biblioteki, dostępna 24/7, wyposażona w nowoczesny sprzęt i sale do pracy grupowej. Przestrzeń została zaprojektowana z myślą o potrzebach współczesnych studentów, oferując ergonomiczne miejsca do pracy indywidualnej oraz przestrzenie do współpracy grupowej. Każde stanowisko zostało wyposażone w szybkie łącze internetowe, dostęp do gniazdek elektrycznych oraz regulowane oświetlenie. W ramach projektu powstały również dwie sale konferencyjne z pełnym wyposażeniem multimedialnym, które można rezerwować na spotkania kół naukowych czy konsultacje projektowe. Dodatkowo, w przestrzeni znajdzie się strefa relaksu z wygodnymi fotelami i dostępem do gorących napojów.",
  },
];

interface IndexProps {
  adminMode?: boolean;
}

const Index = ({ adminMode = false }: IndexProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Aktualności</h1>
        {adminMode ? (
          <Button onClick={() => setShowEditor(!showEditor)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj artykuł
          </Button>
        ) : null}
      </div>
      
      {showEditor && adminMode && (
        <div className="mb-8">
          <NewsEditor />
        </div>
      )}

      <div className="space-y-4">
        {newsItems.map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Index;