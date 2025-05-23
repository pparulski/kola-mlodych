
import { memo } from "react";
import { IndexContent } from "@/components/home/IndexContent";
import { SEO } from "@/components/seo/SEO";

const Index = memo(function Index() {
  return (
    <>
      <SEO
        title="Aktualności"
        description="Koła Młodych OZZ Inicjatywy Pracowniczej - najnowsze informacje i aktualności dotyczące działalności młodzieżowych struktur związku zawodowego."
        keywords="związek zawodowy, aktualności, młodzi pracownicy, inicjatywa pracownicza"
        image="/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png"
      />
      
      <div className="animate-enter">
        <IndexContent />
      </div>
    </>
  );
});

export default Index;
