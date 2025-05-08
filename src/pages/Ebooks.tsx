
import { EbooksPage } from "@/components/ebooks/page/EbooksPage";
import { SEO } from "@/components/seo/SEO";

interface EbooksProps {
  adminMode?: boolean;
}

export default function Ebooks({ adminMode = false }: EbooksProps) {
  return (
    <div className="mt-4">
      <SEO
        title="Publikacje"
        description="Zbiór publikacji i materiałów edukacyjnych Kół Młodych Inicjatywy Pracowniczej"
        keywords="publikacje, ebooki, materiały edukacyjne, związek zawodowy, inicjatywa pracownicza"
      />
      <EbooksPage adminMode={adminMode} />
    </div>
  );
}
