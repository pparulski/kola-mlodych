
import React from "react";
import { IndexContent } from "@/components/home/IndexContent";
import type { Data } from "./+data";

export default function HomePage({ data }: { data: Data }) {
  return (
    <div className="animate-enter">
      <IndexContent searchQuery="" selectedCategories={[]} />
    </div>
  );
}
