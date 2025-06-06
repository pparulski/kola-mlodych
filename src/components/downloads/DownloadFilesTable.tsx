
import { TableBody, TableHeader, TableRow, Table } from "@/components/ui/table";
import { DownloadFileItem } from "./DownloadFileItem";
import { SortableTableHeader, SortDirection, SortField } from "./SortableTableHeader";

interface DownloadItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface DownloadFilesTableProps {
  files: DownloadItem[];
  adminMode?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
  className?: string; // Add the optional className property
}

export function DownloadFilesTable({
  files,
  adminMode = false,
  sortField,
  sortDirection,
  onSort,
  onDelete,
  className, // Add the className parameter
}: DownloadFilesTableProps) {
  const sortedFiles = [...files].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === "asc" 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className={`overflow-hidden shadow-sm rounded-lg border border-border ${className || ''}`}>
      <Table className="w-full table-fixed">
        <colgroup>
          <col className="w-3/6 md:w-auto" /> {/* Example: 60% for filename on mobile */}
          <col className="w-2/6 md:w-[150px]" /> {/* Example: 20% for date on mobile */}
          <col className="w-1/6 md:w-[120px]" /> {/* Example: 20% for actions on mobile */}
        </colgroup>
        <TableHeader className="bg-secondary">
          <TableRow className="hover:bg-transparent">
            <SortableTableHeader
              field="name"
              currentSortField={sortField}
              sortDirection={sortDirection}
              label="Nazwa pliku"
              className="text-white hover:bg-transparent px-2 sm:px-4 py-3"
              onSort={onSort}
            />
            <SortableTableHeader
              field="created_at"
              currentSortField={sortField}
              sortDirection={sortDirection}
              label="Dodano"
              className="text-white hover:bg-transparent px-2 sm:px-4 py-3 text-right sm:text-left"
              onSort={onSort}
            />
            <TableHeader className="hover:bg-transparent px-2 sm:px-4 py-3 text-right"></TableHeader>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-background">
          {sortedFiles.map((file) => (
            <DownloadFileItem
              key={file.id}
              file={file}
              adminMode={adminMode}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
