import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewsCardProps {
  title: string;
  date: string;
  content: string;
}

export function NewsCard({ title, date, content }: NewsCardProps) {
  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-sm text-gray-500">{date}</p>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{content}</p>
      </CardContent>
    </Card>
  );
}