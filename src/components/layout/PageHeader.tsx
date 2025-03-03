import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  backLabel?: string;
  backTo?: string;
}

export function PageHeader({ title, backLabel = "Powrót", backTo = "/" }: PageHeaderProps) {
  const navigate = useNavigate();

  const onBackClick = () => {
    navigate(backTo);
  };

  return (
    <div data-header="header" className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mr-2 flex items-center text-foreground hover:bg-transparent"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </div>
  );
}
