
export interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
  publication_year?: number;
  description?: string;
  page_count?: number;
}
