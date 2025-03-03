
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeft } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError();
  
  // Determine if it's a 404 error or another type
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-primary">
          {is404 ? "Strona nie znaleziona" : "Wystąpił błąd"}
        </h1>
        
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-lg mb-4">
            {is404 
              ? "Przepraszamy, ale strona której szukasz nie istnieje."
              : "Przepraszamy, wystąpił nieoczekiwany błąd podczas ładowania strony."}
          </p>
          
          {isRouteErrorResponse(error) ? (
            <div className="mb-4 p-3 bg-muted rounded-md text-left">
              <p className="font-semibold">Status: {error.status}</p>
              <p>{error.statusText}</p>
              {error.data?.message && <p className="mt-2">{error.data.message}</p>}
            </div>
          ) : error instanceof Error ? (
            <div className="mb-4 p-3 bg-muted rounded-md text-left">
              <p className="font-semibold">Błąd: {error.message}</p>
            </div>
          ) : null}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button asChild variant="outline">
              <Link to="/" className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                Strona główna
              </Link>
            </Button>
            <Button asChild>
              <Link to=".." className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Powrót
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
