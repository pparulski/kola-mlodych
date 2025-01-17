import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  content: string;
  featured_image?: string | null;
  previewLength?: number;
}

export function NewsCard({ 
  id, 
  title, 
  date, 
  content, 
  featured_image,
  previewLength = 200 
}: NewsCardProps) {
  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const plainText = stripHtml(content);
  const preview = plainText.length > previewLength 
    ? plainText.substring(0, previewLength) + "..."
    : plainText;

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow bg-card overflow-hidden">
      {featured_image && (
        <div className="relative w-full h-[200px]">
          <img
            src={featured_image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{date}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-card-foreground">{preview}</p>
        {plainText.length > previewLength && (
          <Button asChild variant="outline">
            <Link to={`/news/${id}`}>Czytaj więcej</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}