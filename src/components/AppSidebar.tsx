import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Newspaper, MapPin, Download, Book, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "News", icon: Newspaper, path: "/" },
  { title: "Local Unions Map", icon: MapPin, path: "/map" },
  { title: "Downloads", icon: Download, path: "/downloads" },
  { title: "eBooks", icon: Book, path: "/ebooks" },
  { title: "Social Media", icon: Share2, path: "/social" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student Union</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}