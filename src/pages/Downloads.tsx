
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
      <div className="flex justify-center items-center min-h-[200px] animate-pulse">
        <div className="text-lg text-foreground">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      {adminMode && (
        <div className="content-box shadow-elevated">
          <DownloadFileUploader onFileUploaded={fetchFiles} />
        </div>
      )}

      <div className="content-box shadow-elevated overflow-hidden">
        <DownloadFilesTable
          files={files}
          adminMode={adminMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onDelete={handleDelete}
          className="table-zebra"
        />

        {files.length === 0 && (
          <div className="text-center text-muted-foreground mt-8 mb-4">
            Brak plików do pobrania
          </div>
        )}
      </div>
    </div>
  );
}

export default Downloads;
