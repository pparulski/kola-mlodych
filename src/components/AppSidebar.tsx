import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Newspaper, MapPin, Download, Book, Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "News", icon: Newspaper, path: "/" },
  { title: "Local Unions Map", icon: MapPin, path: "/map" },
  { title: "Downloads", icon: Download, path: "/downloads" },
  { title: "eBooks", icon: Book, path: "/ebooks" },
];

const socialLinks = [
  { icon: Facebook, url: "https://facebook.com/studentunion" },
  { icon: Instagram, url: "https://instagram.com/studentunion" },
  { icon: Twitter, url: "https://twitter.com/studentunion" },
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
      <SidebarFooter className="p-4 border-t">
        <div className="flex justify-center space-x-4">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}