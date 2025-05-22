
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAllNewsArticleSlugs } from "@/utils/slugUtils";

interface SlugUpdaterButtonProps {
  onComplete?: (updatedCount: number) => void;
}

export function SlugUpdaterButton({ onComplete }: SlugUpdaterButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateSlugs = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      toast.info("Rozpoczęto aktualizację slugów artykułów...");
      
      const updatedCount = await updateAllNewsArticleSlugs();
      
      if (updatedCount > 0) {
        toast.success(`Zaktualizowano slugi ${updatedCount} artykułów`);
      } else {
        toast.info("Nie znaleziono artykułów wymagających aktualizacji");
      }
      
      onComplete?.(updatedCount);
    } catch (error) {
      console.error("Error updating slugs:", error);
      toast.error("Wystąpił błąd podczas aktualizacji slugów");
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Button 
      onClick={handleUpdateSlugs}
      disabled={isUpdating}
      variant="outline"
    >
      {isUpdating ? "Aktualizowanie..." : "Aktualizuj slugi artykułów"}
    </Button>
  );
}
