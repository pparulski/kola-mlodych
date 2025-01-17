import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface NewsPreviewProps {
  id: string;
  title: string;
  content: string;
  date: string;
  featured_image?: string | null;
  previewLength?: number;
}

export function NewsPreview({ id, title, content, date, featured_image, previewLength = 200 }: NewsPreviewProps) {
  const previewContent = content.length > previewLength 
    ? content.substring(0, previewLength) + "..."
    : content;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {featured_image && (
            <div className="relative w-full h-[200px] overflow-hidden rounded-lg">
              <img
                src={featured_image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Link 
            to={`/news/${id}`}
            className="block hover:text-accent transition-colors"
          >
            <h2 className="text-2xl font-bold">{title}</h2>
          </Link>
          <p className="text-sm text-muted-foreground">{date}</p>
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
          <div className="flex justify-end">
            <Button asChild variant="ghost">
              <Link to={`/news/${id}`} className="flex items-center gap-2">
                Czytaj więcej
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}