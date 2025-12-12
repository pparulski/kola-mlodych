import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface MarkerIconProps {
  src?: string | null;
  alt?: string;
  selected?: boolean;
}

export const MarkerIcon: React.FC<MarkerIconProps> = ({ src, alt = "", selected = false }) => {
  const [error, setError] = useState(false);

  const showImage = !!src && !error;

  return (
    <div
      className={cn(
        "rounded-full bg-white shadow-md border",
        "flex items-center justify-center",
        selected ? "ring-2 ring-primary" : "ring-0",
        // Base size ~32px, selected slightly larger
        selected ? "w-9 h-9" : "w-8 h-8"
      )}
      aria-hidden
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          className={cn("rounded-full object-cover", selected ? "w-8 h-8" : "w-7 h-7")}
          onError={() => setError(true)}
          draggable={false}
        />
      ) : (
        <img
          src="/img/a69f462f-ae71-40a5-a60a-babfda61840e.png"
          alt=""
          aria-hidden
          className={cn("rounded-full object-cover", selected ? "w-8 h-8" : "w-7 h-7")}
          draggable={false}
        />
      )}
    </div>
  );
};
