import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Newspaper, Users, Download, Book, Facebook, Instagram, X, Building2, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Aktualności", icon: Newspaper, path: "/" },
  { title: "Lista Kół Młodych", icon: Users, path: "/map" },
  { title: "Pliki do pobrania", icon: Download, path: "/downloads" },
  { title: "eBooki", icon: Book, path: "/ebooks" },
];

const socialLinks = [
  { icon: Facebook, url: "https://facebook.com/studentunion" },
  { icon: Instagram, url: "https://instagram.com/studentunion" },
  { icon: X, url: "https://x.com/studentunion" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 flex justify-center">
          <img 
            src="/lovable-uploads/a69e03ab-2d39-4e2c-acef-8b773e96bc91.png" 
            alt="Logo Koła Młodych" 
            className="w-24 h-24 object-contain"
          />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className="transition-colors hover:text-accent"
                    >
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
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://ozzip.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>Inicjatywa Pracownicza</span>
            </a>
            <a
              href="mailto:mlodzi.ip@ozzip.pl"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>mlodzi.ip@ozzip.pl</span>
            </a>
          </div>
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
            <a
              href="https://tiktok.com/@studentunion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}