
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, MenuItemFormData, MenuItemType } from "@/types/menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Category } from "@/types/categories";
import { DefaultMenuItemFields } from "./form/DefaultMenuItemFields";
import { StaticPageMenuItemFields } from "./form/StaticPageMenuItemFields";
import { CategoryMenuItemFields } from "./form/CategoryMenuItemFields";
import { MenuItemTypeSelect } from "./form/MenuItemTypeSelect";
import { MenuItemVisibilityOptions } from "./form/MenuItemVisibilityOptions";

interface MenuItemFormProps {
  editingItem: MenuItem | null;
  onSubmit: (data: MenuItemFormData) => void;
  onCancel: () => void;
}

export function MenuItemForm({ editingItem, onSubmit, onCancel }: MenuItemFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MenuItemType>(MenuItemType.DEFAULT);
  const [link, setLink] = useState("");
  const [icon, setIcon] = useState("");
  const [pageId, setPageId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch static pages for selection
  const { data: pages } = useQuery({
    queryKey: ["static_pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("static_pages")
        .select("id, title")
        .order("title");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories for selection
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Reset form when editing item changes
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setType(editingItem.type || MenuItemType.DEFAULT);
      setLink(editingItem.link || "");
      setIcon(editingItem.icon || "");
      setPageId(editingItem.page_id || undefined);
      setCategoryId(editingItem.category_id || undefined);
      setIsPublic(editingItem.is_public);
      setIsAdmin(editingItem.is_admin);
    } else {
      // Reset form for new item
      setTitle("");
      setType(MenuItemType.DEFAULT);
      setLink("");
      setIcon("");
      setPageId(undefined);
      setCategoryId(undefined);
      setIsPublic(true);
      setIsAdmin(false);
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: MenuItemFormData = {
      title: title.trim(),
      type,
      is_public: isPublic,
      is_admin: isAdmin,
    };

    // Add appropriate fields based on menu item type
    if (type === MenuItemType.DEFAULT || type === MenuItemType.CUSTOM) {
      formData.link = link.trim();
      formData.icon = icon.trim();
    } else if (type === MenuItemType.STATIC_PAGE) {
      formData.page_id = pageId;
    } else if (type === MenuItemType.FILTERED_FEED || type === MenuItemType.CATEGORY_FEED) {
      formData.category_id = categoryId;
    }

    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingItem ? "Edytuj element menu" : "Dodaj nowy element menu"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              placeholder="Nazwa elementu menu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <MenuItemTypeSelect 
            type={type} 
            onTypeChange={setType} 
          />

          {(type === MenuItemType.DEFAULT || type === MenuItemType.CUSTOM) && (
            <DefaultMenuItemFields
              link={link}
              setLink={setLink}
              icon={icon}
              setIcon={setIcon}
            />
          )}

          {type === MenuItemType.STATIC_PAGE && (
            <StaticPageMenuItemFields
              pageId={pageId}
              setPageId={setPageId}
              pages={pages}
            />
          )}

          {(type === MenuItemType.FILTERED_FEED || type === MenuItemType.CATEGORY_FEED) && (
            <CategoryMenuItemFields
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              categories={categories}
            />
          )}

          <MenuItemVisibilityOptions
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
          />

          <div className="flex gap-2">
            <Button type="submit">
              {editingItem ? "Aktualizuj" : "Dodaj"}
            </Button>
            {editingItem && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
