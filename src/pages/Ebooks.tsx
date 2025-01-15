import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

const ebooks = [
  {
    title: "Podstawy działalności związkowej",
    author: "Dr Anna Kowalska",
    description: "Kompendium wiedzy dla początkujących działaczy",
    pages: 156,
    cover: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
  },
  {
    title: "Prawo pracy dla studentów",
    author: "Prof. Jan Nowak",
    description: "Praktyczny przewodnik po prawie pracy",
    pages: 284,
    cover: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
  },
  {
    title: "Organizacja wydarzeń studenckich",
    author: "Mgr Piotr Wiśniewski",
    description: "Poradnik organizacji eventów akademickich",
    pages: 198,
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475"
  }
];

const Ebooks = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-8">eBooki</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ebooks.map((book, index) => (
          <Card key={index} className="flex flex-col overflow-hidden">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={`${book.cover}?auto=format&fit=crop&w=800&q=80`}
                alt={book.title}
                className="object-cover w-full h-full transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="flex flex-col gap-2 p-4">
              <h3 className="text-xl font-semibold">{book.title}</h3>
              <p className="text-sm font-medium">Autor: {book.author}</p>
              <p className="text-sm text-muted-foreground">{book.description}</p>
              <p className="text-sm text-muted-foreground">Liczba stron: {book.pages}</p>
              <Button className="mt-2" variant="outline">
                <Book className="mr-2 h-4 w-4" />
                Czytaj
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Ebooks;