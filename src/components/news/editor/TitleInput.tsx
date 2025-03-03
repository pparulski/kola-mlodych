
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TitleInputProps {
  title: string;
  setTitle: (title: string) => void;
}

export function TitleInput({ title, setTitle }: TitleInputProps) {
  return (
    <div>
      <Label htmlFor="title">Tytuł</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł artykułu..."
        className="w-full"
      />
    </div>
  );
}
