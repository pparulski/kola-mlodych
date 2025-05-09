
import { useDownloadsData } from "@/hooks/useDownloadsData";
import { DownloadFilesTable } from "@/components/downloads/DownloadFilesTable";
import { DownloadFileUploader } from "@/components/downloads/DownloadFileUploader";

export function ManageDownloads() {
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
        <div className="text-lg text-foreground">Wczytywanie...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Zarządzaj plikami</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl">Umieść nowy plik</h2>
        <DownloadFileUploader onFileUploaded={fetchFiles} />
      </div>

      <div>
        <h2 className="text-xl mb-4">Lista plików</h2>
        <DownloadFilesTable
          files={files}
          adminMode={true}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
