import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { newsItems } from "./Index"; // We'll need to move this to a shared location later

const NewsArticle = () => {
  const { id } = useParams();
  const article = newsItems.find(item => item.id === id);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-red-500">Artykuł nie został znaleziony</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{article.date}</p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none">
            {article.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsArticle;