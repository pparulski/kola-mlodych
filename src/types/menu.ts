
export type MenuItemType = "default" | "static_page" | "filtered_feed" | "category_feed" | "custom";

export interface MenuItem {
  id: string;
  title: string;
  type: MenuItemType;
  link?: string;
  icon?: string;
  parent_id?: string | null;
  page_id?: string | null;
  category_id?: string | null;
  position: number;
  is_public: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface MenuItemFormData {
  title: string;
  type: MenuItemType;
  link?: string;
  icon?: string;
  parent_id?: string | null;
  page_id?: string | null;
  category_id?: string | null;
  is_public: boolean;
  is_admin: boolean;
}
