import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

const ebooks = [
  {
    title: "Podstawy działalności związkowej",
    author: "Dr Anna Kowalska",
    description: "Kompendium wiedzy dla początkujących działaczy",
    pages: 156
  },
  {
    title: "Prawo pracy dla studentów",
    author: "Prof. Jan Nowak",
    description: "Praktyczny przewodnik po prawie pracy",
    pages: 284
  },
  {
    title: "Organizacja wydarzeń studenckich",
    author: "Mgr Piotr Wiśniewski",
    description: "Poradnik organizacji eventów akademickich",
    pages: 198
  }
];

const Ebooks = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">eBooki</h1>
      <div className="grid gap-4">
        {ebooks.map((book, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{book.title}</span>
                <Button variant="outline" size="sm">
                  <Book className="mr-2 h-4 w-4" />
                  Czytaj
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Autor: {book.author}</p>
              <p className="text-sm text-muted-foreground mt-2">{book.description}</p>
              <p className="text-sm text-muted-foreground mt-1">Liczba stron: {book.pages}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Ebooks;