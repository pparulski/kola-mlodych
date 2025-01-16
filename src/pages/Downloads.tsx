import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DownloadsProps {
  adminMode?: boolean;
}

const Downloads = ({ adminMode = false }: DownloadsProps) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from("downloads")
        .select("*");

      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setFiles(data);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h1>Downloads Page</h1>
      {adminMode && <button>Add New File</button>}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Downloads;
