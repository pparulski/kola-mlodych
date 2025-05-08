
import { useDownloadsData } from "@/hooks/useDownloadsData";
import { DownloadFileUploader } from "@/components/downloads/DownloadFileUploader";
import { DownloadFilesTable } from "@/components/downloads/DownloadFilesTable";

interface DownloadsProps {
  adminMode?: boolean;
}

const Downloads = ({ adminMode = false }: DownloadsProps) => {
  const {
    files,
    isLoading,
    sortField,
    sortDirection,
    handleDelete,
    handleSort,
    fetchFiles
  } = useDownloadsData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg text-foreground">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {adminMode && (
        <DownloadFileUploader onFileUploaded={fetchFiles} />
      )}

      <DownloadFilesTable
        files={files}
        adminMode={adminMode}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onDelete={handleDelete}
      />

      {files.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          Brak plików do pobrania
        </div>
      )}
    </div>
  );
}

export default Downloads;
