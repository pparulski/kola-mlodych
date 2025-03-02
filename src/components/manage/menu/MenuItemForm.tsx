
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, MenuItemFormData, MenuItemType } from "@/types/menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/types/categories";

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

          <div className="space-y-2">
            <Label htmlFor="type">Typ</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as MenuItemType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MenuItemType.DEFAULT}>Standardowy (link)</SelectItem>
                <SelectItem value={MenuItemType.STATIC_PAGE}>Strona statyczna</SelectItem>
                <SelectItem value={MenuItemType.FILTERED_FEED}>Feed z kategorią</SelectItem>
                <SelectItem value={MenuItemType.CATEGORY_FEED}>Kategoria</SelectItem>
                <SelectItem value={MenuItemType.CUSTOM}>Niestandardowy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(type === MenuItemType.DEFAULT || type === MenuItemType.CUSTOM) && (
            <>
              <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  placeholder="URL"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Ikona (opcjonalnie)</Label>
                <Input
                  id="icon"
                  placeholder="Nazwa ikony z lucide-react"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
            </>
          )}

          {type === MenuItemType.STATIC_PAGE && (
            <div className="space-y-2">
              <Label htmlFor="page_id">Strona</Label>
              <Select
                value={pageId}
                onValueChange={setPageId}
              >
                <SelectTrigger id="page_id">
                  <SelectValue placeholder="Wybierz stronę" />
                </SelectTrigger>
                <SelectContent>
                  {pages?.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === MenuItemType.FILTERED_FEED || type === MenuItemType.CATEGORY_FEED) && (
            <div className="space-y-2">
              <Label htmlFor="category_id">Kategoria</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
            />
            <Label htmlFor="is_public">Pokaż w menu publicznym</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_admin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked === true)}
            />
            <Label htmlFor="is_admin">Pokaż w menu administratora</Label>
          </div>

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
