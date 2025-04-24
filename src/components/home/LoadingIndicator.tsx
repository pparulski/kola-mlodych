
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingIndicatorProps = {
  type?: "default" | "minimal" | "skeleton" | "inline";
  height?: string;
  className?: string;
};

export function LoadingIndicator({ 
  type = "default", 
  height = "200px", 
  className = "" 
}: LoadingIndicatorProps) {
  if (type === "minimal") {
    return (
      <div className={`flex justify-center items-center py-2 ${className}`}>
        <div className="text-muted-foreground text-sm">Ładowanie...</div>
      </div>
    );
  }
  
  if (type === "skeleton") {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }
  
  if (type === "inline") {
    return (
      <span className={`text-muted-foreground text-sm ${className}`}>
        Ładowanie...
      </span>
    );
  }
  
  // Default loading indicator
  return (
    <div className={`flex justify-center items-center min-h-[${height}] ${className}`}>
      <div className="text-muted-foreground">Wczytywanie...</div>
    </div>
  );
}
