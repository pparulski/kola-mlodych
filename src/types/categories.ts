
import { ReactNode } from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  show_in_menu?: boolean;
  description?: string;
}

export interface FilterComponentProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
  position?: "top" | "bottom";
  children?: ReactNode;
}
