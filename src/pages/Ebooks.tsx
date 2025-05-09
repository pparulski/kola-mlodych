
import { EbooksPage } from "@/components/ebooks/page/EbooksPage";

interface EbooksProps {
  adminMode?: boolean;
}

export default function Ebooks({ adminMode = false }: EbooksProps) {
  return (
    <div className="animate-enter">
      <EbooksPage adminMode={adminMode} />
    </div>
  );
}
