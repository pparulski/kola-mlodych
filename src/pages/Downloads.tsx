import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const downloads = [
  {
    title: "Formularz członkowski",
    description: "Formularz wymagany do dołączenia do Koła Młodych",
    type: "PDF",
    size: "156 KB"
  },
  {
    title: "Regulamin organizacji",
    description: "Aktualny regulamin organizacji studenckiej",
    type: "PDF",
    size: "284 KB"
  },
  {
    title: "Wniosek o dofinansowanie",
    description: "Formularz wniosku o dofinansowanie projektu",
    type: "DOCX",
    size: "78 KB"
  }
];

const Downloads = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Pliki do pobrania</h1>
      <div className="grid gap-4">
        {downloads.map((file, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{file.title}</span>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Pobierz {file.type}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{file.description}</p>
              <p className="text-sm text-muted-foreground mt-2">Rozmiar: {file.size}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Downloads;