
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FILE_SHORTCODE_PATTERN } from './plugin/FileShortcode';

interface FileData {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface FileRendererProps {
  fileId: string;
}

// Component that replaces file shortcode with actual file download button
export function FileRenderer({ fileId }: FileRendererProps) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('downloads')
          .select('*')
          .eq('id', fileId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setFileData(data as FileData);
        } else {
          setError(`File with ID ${fileId} not found`);
        }
      } catch (err) {
        console.error('Error fetching file data:', err);
        setError('Failed to load file data');
        toast.error('Failed to load file data');
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) {
      fetchFileData();
    }
  }, [fileId]);

  if (isLoading) {
    return (
      <div className="file-renderer-loading animate-pulse bg-muted h-10 w-48 rounded-md"></div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="file-renderer-error p-2 text-sm text-destructive bg-destructive/10 rounded-md">
        {error || 'File not available'}
      </div>
    );
  }

  return (
    <div className="file-renderer my-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">{fileData.name}</div>
        <Button asChild variant="outline" size="sm">
          <a href={fileData.url} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Pobierz
          </a>
        </Button>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Dodano: {new Date(fileData.created_at).toLocaleDateString("pl-PL")}
      </div>
    </div>
  );
}

// File Renderer Initializer - finds and replaces file shortcodes in content
export function processFileShortcodes(content: string): JSX.Element[] {
  const elements: JSX.Element[] = [];
  
  // Split content by file shortcodes
  const parts = content.split(FILE_SHORTCODE_PATTERN);
  
  // Process each part
  for (let i = 0; i < parts.length; i++) {
    // Add text content
    if (parts[i]) {
      elements.push(<span key={`text-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />);
    }
    
    // Add file renderer for each file ID (which appear at odd indices starting from 1)
    if (i < parts.length - 1 && i % 2 === 0) {
      const fileId = parts[i + 1];
      if (fileId) {
        elements.push(<FileRenderer key={`file-${fileId}`} fileId={fileId} />);
      }
    }
  }
  
  return elements;
}
