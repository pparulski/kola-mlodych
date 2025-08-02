export interface StaticPage {
  id: string;
  title: string;
  content: string; // Heavy field
  slug: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  sidebar_position: number | null;
  show_in_sidebar: boolean;
  position_type: string;
}

// Lightweight version for menu/sidebar
export interface StaticPageMenuItem {
  id: string;
  title: string;
  slug: string;
  show_in_sidebar: boolean;
  sidebar_position: number | null;
  position_type: string;
  created_at: string;
  updated_at: string;
}