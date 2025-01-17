import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { NewsEditor } from "@/components/NewsEditor";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { newsItems } from "@/data/newsItems";

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