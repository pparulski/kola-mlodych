
// Update the FilterComponentProps to include the new compactOnMobile prop
export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  show_in_menu?: boolean;
}

export interface FilterComponentProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
  position?: 'top' | 'bottom';
  compactOnMobile?: boolean;
}
