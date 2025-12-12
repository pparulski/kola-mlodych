export enum MenuItemType {
  DEFAULT = "default",
  STATIC_PAGE = "static_page",
  FILTERED_FEED = "filtered_feed",
  CATEGORY_FEED = "category_feed",
  CUSTOM = "custom"
}

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
  created_at?: string;
}

export interface MenuItemFormData {
  title: string;
  type: MenuItemType;
  link?: string;
  icon?: string;
  page_id?: string;
  category_id?: string;
  is_public: boolean;
  is_admin: boolean;
}

export interface MenuPosition {
  id: string;
  type: string;
  position: number;
  resource_id?: string;
  icon?: string;
  created_at?: string;
}

// Extend the MenuPosition interface to ensure compatibility with database schema
export interface MenuItemPosition extends MenuPosition {
  created_at?: string;
}
