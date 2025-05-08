
import { ArrowDown, ArrowUp } from "lucide-react";
import { TableHead } from "../ui/table";

export type SortField = "name" | "created_at";
export type SortDirection = "asc" | "desc";

interface SortableTableHeaderProps {
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  label: string;
  className?: string;
  onSort: (field: SortField) => void;
}

export function SortableTableHeader({
  field,
  currentSortField,
  sortDirection,
  label,
  className,
  onSort,
}: SortableTableHeaderProps) {
  const getSortIcon = () => {
    if (currentSortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 inline-flex shrink-0" />
      : <ArrowDown className="h-4 w-4 inline-flex shrink-0" />;
  };

  return (
    <TableHead 
      className={`cursor-pointer ${className || ""}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span>{label}</span>
        {getSortIcon()}
      </div>
    </TableHead>
  );
}
