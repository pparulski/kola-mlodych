
import React from "react";
import { NewsDetails } from "@/pages/NewsDetails";
import type { Data } from "./+data";

export default function NewsPage({ data }: { data: Data }) {
  if (!data.article) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        Artykuł nie został znaleziony.
      </div>
    );
  }

  return <NewsDetails />;
}
