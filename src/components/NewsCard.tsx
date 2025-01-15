import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  content: string;
  previewLength?: number;
}

export function NewsCard({ id, title, date, content, previewLength = 200 }: NewsCardProps) {
  const preview = content.length > previewLength 
    ? content.substring(0, previewLength) + "..."
    : content;

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{date}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-card-foreground">{preview}</p>
        {content.length > previewLength && (
          <Button asChild variant="outline">
            <Link to={`/news/${id}`}>Czytaj więcej</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}