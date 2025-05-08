
import { EbooksPage } from "@/components/ebooks/page/EbooksPage";

interface EbooksProps {
  adminMode?: boolean;
}

export default function Ebooks({ adminMode = false }: EbooksProps) {
  return <EbooksPage adminMode={adminMode} />;
}
