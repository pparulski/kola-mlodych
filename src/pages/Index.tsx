
import { useOutletContext } from "react-router-dom";
import { IndexContent } from "@/components/home/IndexContent";
import { SEO } from "@/components/seo/SEO";
import { memo, useEffect } from "react";

interface IndexContext {
  searchQuery: string;
  selectedCategories: string[];
}

const Index = memo(function Index() {
  const context = useOutletContext<IndexContext>();
  const searchQuery = context?.searchQuery || "";
  const selectedCategories = context?.selectedCategories || [];
  
  // Log when index loads with search params for debugging
  useEffect(() => {
    if (searchQuery || (selectedCategories && selectedCategories.length > 0)) {
      console.log("Index loaded with search params:", { 
        searchQuery, 
        selectedCategories 
      });
    }
  }, [searchQuery, selectedCategories]);
  
  return (
    <>
      <SEO
        title="Aktualności"
        description="Koła Młodych OZZ Inicjatywy Pracowniczej - najnowsze informacje i aktualności dotyczące działalności młodzieżowych struktur związku zawodowego."
        keywords="związek zawodowy, aktualności, młodzi pracownicy, inicjatywa pracownicza"
        image="/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png"
      />
      
      <div className="animate-enter">
        <IndexContent searchQuery={searchQuery} selectedCategories={selectedCategories} />
      </div>
    </>
  );
});

export default Index;
