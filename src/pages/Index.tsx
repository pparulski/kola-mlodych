import { NewsCard } from "@/components/NewsCard";

const newsItems = [
  {
    title: "Student Union Elections Announced",
    date: "2024-02-20",
    content: "Annual elections for the Student Union leadership positions will be held next month. All students are encouraged to participate.",
  },
  {
    title: "New Study Space Opening",
    date: "2024-02-19",
    content: "A new 24/7 study space will be opening in the library building next week, featuring modern amenities and group study rooms.",
  },
];

const Index = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Latest News</h1>
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <NewsCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Index;