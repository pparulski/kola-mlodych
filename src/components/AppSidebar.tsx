import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
        <div className="p-6 flex justify-center">
          <img 
            src="/lovable-uploads/a69e03ab-2d39-4e2c-acef-8b773e96bc91.png" 
            alt="Logo Koła Młodych" 
            className="w-40 h-40 object-contain"
          />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className="transition-colors hover:text-accent text-lg py-3"
                    >
                      <item.icon className="w-6 h-6" />
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
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}