import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface EbooksProps {
  adminMode?: boolean;
}

const Ebooks = ({ adminMode = false }: EbooksProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">eBooki</h1>
        {adminMode && (
          <Button onClick={() => setShowEditor(!showEditor)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj ebooka
          </Button>
        )}
      </div>

      {showEditor && adminMode && (
        <div className="mb-8">
          {/* Editor component will be added later */}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ebook cards will be added here */}
      </div>
    </div>
  );
};

export default Ebooks;