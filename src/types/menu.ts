
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  position: number;
  type: 'default' | 'static_page' | 'category_feed' | 'custom' | 'filtered_feed';
  category_slug?: string;
  icon?: string;
  resource_id?: string; // ID of the resource (staticPage, etc.) if applicable
}

export interface MenuItemMove {
  menuItemId: string;
  direction: 'up' | 'down';
}
