import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { NewsPreview } from "./news/NewsPreview";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  content: string;
  featured_image?: string | null;
  previewLength?: number;
}

export function NewsCard(props: NewsCardProps) {
  const formattedDate = format(new Date(props.date), "d MMMM yyyy", { locale: pl });
  
  return (
    <NewsPreview {...props} date={formattedDate} />
  );
}