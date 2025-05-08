
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
    <div className="page-container section-spacing">
      <h1 className="text-3xl font-bold">Zarządzaj plikami</h1>
      
      <section className="component-spacing">
        <h2 className="text-xl mb-4">Umieść nowy plik</h2>
        <DownloadFileUploader onFileUploaded={fetchFiles} />
      </section>

      <section className="component-spacing">
        <h2 className="text-xl mb-4">Lista plików</h2>
        <DownloadFilesTable
          files={files}
          adminMode={true}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
