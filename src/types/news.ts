
export interface NewsArticle {
  id: string;
  title: string;
  content?: string;
  preview_content?: string;
  slug: string;
  featured_image: string | null;
  created_at: string | null;
  created_by: string | null;
  date: string | null;
  short_url?: string | null;
  category_names?: (string | null)[];
  category_ids?: (string | null)[];
}
