
import { useOutletContext } from "react-router-dom";
import { IndexContent } from "@/components/home/IndexContent";
import { SEO } from "@/components/seo/SEO";
import { memo } from "react";

interface IndexContext {
  searchQuery: string;
  selectedCategories: string[];
}

const Index = memo(function Index() {
  const context = useOutletContext<IndexContext>();
  const searchQuery = context?.searchQuery || "";
  const selectedCategories = context?.selectedCategories || [];
  
  return (
    <>
      <SEO
        title="Aktualności"
        description="Koła Młodych OZZ Inicjatywy Pracowniczej - najnowsze informacje i aktualności dotyczące działalności młodzieżowych struktur związku zawodowego."
        keywords="związek zawodowy, aktualności, młodzi pracownicy, inicjatywa pracownicza"
      />
      
      <div className="animate-enter">
        <IndexContent searchQuery={searchQuery} selectedCategories={selectedCategories} />
      </div>
    </>
  );
});

export default Index;
