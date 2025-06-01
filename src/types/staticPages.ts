
export interface StaticPage {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  show_in_sidebar?: boolean;
  sidebar_position?: number | null;
}
