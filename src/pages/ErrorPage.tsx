
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeft } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError();
  
  // Determine if it's a 404 error or another type
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background animate-fade-in">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-primary">
          {is404 ? "Strona nie znaleziona" : "Wystąpił błąd"}
        </h1>
        
        <div className="content-box shadow-elevated border-2">
          <p className="text-lg mb-6">
            {is404 
              ? "Przepraszamy, ale strona której szukasz nie istnieje."
              : "Przepraszamy, wystąpił nieoczekiwany błąd podczas ładowania strony."}
          </p>
          
          {isRouteErrorResponse(error) ? (
            <div className="mb-6 p-4 bg-muted/50 rounded-md text-left border border-border shadow-subtle">
              <p className="font-semibold">Status: {error.status}</p>
              <p>{error.statusText}</p>
              {error.data?.message && <p className="mt-2">{error.data.message}</p>}
            </div>
          ) : error instanceof Error ? (
            <div className="mb-6 p-4 bg-muted/50 rounded-md text-left border border-border shadow-subtle">
              <p className="font-semibold">Błąd: {error.message}</p>
            </div>
          ) : null}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button asChild variant="outline" className="shadow-subtle">
              <Link to="/" className="flex items-center gap-2 interactive-element">
                <HomeIcon className="h-4 w-4" />
                Strona główna
              </Link>
            </Button>
            <Button asChild className="shadow-subtle">
              <Link to=".." className="flex items-center gap-2 interactive-element">
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
