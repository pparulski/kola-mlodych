
import { useOutletContext } from "react-router-dom";
import { IndexContent } from "@/components/home/IndexContent";

interface IndexContext {
  searchQuery: string;
  selectedCategories: string[];
}

export default function Index() {
  const { searchQuery, selectedCategories } = useOutletContext<IndexContext>();
  
  return <IndexContent searchQuery={searchQuery} selectedCategories={selectedCategories} />;
}
