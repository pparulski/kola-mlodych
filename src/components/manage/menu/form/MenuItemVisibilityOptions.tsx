
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MenuItemVisibilityOptionsProps {
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

export function MenuItemVisibilityOptions({ 
  isPublic, 
  setIsPublic, 
  isAdmin, 
  setIsAdmin 
}: MenuItemVisibilityOptionsProps) {
  return (
    <>
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
    </>
  );
}
