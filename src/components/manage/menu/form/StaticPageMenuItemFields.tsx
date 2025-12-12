
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StaticPageMenuItemFieldsProps {
  pageId: string | undefined;
  setPageId: (value: string) => void;
  pages: Array<{ id: string; title: string }> | undefined;
}

export function StaticPageMenuItemFields({ 
  pageId, 
  setPageId, 
  pages 
}: StaticPageMenuItemFieldsProps) {
  return (
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
  );
}
