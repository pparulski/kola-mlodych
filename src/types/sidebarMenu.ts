
import { StaticPage } from "./staticPages";
import { LucideIcon } from "lucide-react";

export enum MenuItemType {
  STATIC_PAGE = "static_page",
  REGULAR = "regular"
}

export interface SidebarMenuItem {
  id: string;
  title: string;
  path: string;
  icon: string | LucideIcon;
  position: number;
  type: MenuItemType;
  originalId?: string; // For static pages, store the original ID
}

export interface MenuOrderPayload {
  items: SidebarMenuItem[];
}
