
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  slug: string | null;
  featured_image: string | null;
  created_at: string | null;
  created_by: string | null;
  date: string | null;
}
