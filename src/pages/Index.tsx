import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { NewsEditor } from "@/components/NewsEditor";

const newsItems = [
  {
    id: "1",
    title: "Wybory do Zarządu Koła Młodych",
    date: "2024-02-20",
    content: "Coroczne wybory do zarządu Koła Młodych odbędą się w przyszłym miesiącu. Zachęcamy wszystkich członków do aktywnego udziału.",
  },
  {
    id: "2",
    title: "Nowa przestrzeń do nauki",
    date: "2024-02-19",
    content: "W przyszłym tygodniu zostanie otwarta nowa przestrzeń do nauki w budynku biblioteki, dostępna 24/7, wyposażona w nowoczesny sprzęt i sale do pracy grupowej.",
  },
];

const Index = () => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Aktualności</h1>
        <Button onClick={() => setShowEditor(!showEditor)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj artykuł
        </Button>
      </div>
      
      {showEditor && (
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