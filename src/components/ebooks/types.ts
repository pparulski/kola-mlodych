
export interface Ebook {
  id: string;
  title: string;
  slug?: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
  description?: string;
  page_count?: number;
  ebook_type: string;
}
