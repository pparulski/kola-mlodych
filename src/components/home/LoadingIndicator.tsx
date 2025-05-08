
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingIndicatorProps {
  text?: string;
  minHeight?: string;
  showSkeleton?: boolean;
}

export function LoadingIndicator({
  text = "Wczytywanie...",
  minHeight = "200px",
  showSkeleton = false,
}: LoadingIndicatorProps) {
  return (
    <div className={`flex justify-center items-center min-h-[${minHeight}]`}>
      {showSkeleton ? (
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </div>
      ) : (
        <div className="text-muted-foreground">{text}</div>
      )}
    </div>
  );
}
