
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenText } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EbookData {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  publication_year?: number;
  created_at: string;
}

interface EbookRendererProps {
  ebookId: string;
}

// Component that replaces ebook shortcode with actual ebook card
export function EbookRenderer({ ebookId }: EbookRendererProps) {
  const [ebookData, setEbookData] = useState<EbookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEbookData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('ebooks')
          .select('*')
          .eq('id', ebookId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setEbookData(data as EbookData);
        } else {
          setError(`Ebook with ID ${ebookId} not found`);
        }
      } catch (err) {
        console.error('Error fetching ebook data:', err);
        setError('Failed to load ebook data');
        toast.error('Failed to load ebook data');
      } finally {
        setIsLoading(false);
      }
    };

    if (ebookId) {
      fetchEbookData();
    }
  }, [ebookId]);

  const handleOpenPdf = () => {
    if (ebookData?.file_url) {
      window.open(ebookData.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="ebook-renderer-loading animate-pulse bg-muted h-64 w-full rounded-md my-4"></div>
    );
  }

  if (error || !ebookData) {
    return (
      <div className="ebook-renderer-error p-2 text-sm text-destructive bg-destructive/10 rounded-md">
        {error || 'Ebook not available'}
      </div>
    );
  }

  return (
    <Card className="ebook-renderer my-4 max-w-xs mx-auto bg-muted/10">
      <CardContent className="pt-6">
        <div className="text-lg font-semibold text-center mb-2">
          {ebookData.title}
        </div>
        
        <button
          onClick={handleOpenPdf}
          className="w-full group"
        >
          <LazyLoadImage
            src={ebookData.cover_url || ''}
            alt={`Okładka ${ebookData.title}`}
            className="w-full object-contain rounded-md mb-4 transition-transform duration-200 group-hover:scale-105"
            style={{ maxHeight: '240px' }}
            effect="opacity"
            threshold={100}
            wrapperClassName="w-full"
          />
        </button>
        
        {ebookData.publication_year && (
          <p className="text-sm text-center dark:text-muted-foreground text-foreground">
            Rok publikacji: {ebookData.publication_year}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <a href={ebookData.file_url} target="_blank" rel="noopener noreferrer">
            <BookOpenText className="mr-2 h-4 w-4" />
            Czytaj
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Ebook Renderer Initializer - finds and replaces ebook shortcodes in content
export function processEbookShortcodes(content: string): JSX.Element[] {
  const elements: JSX.Element[] = [];
  const EBOOK_SHORTCODE_PATTERN = /\[ebook id="([^"]+)"\]/g;
  
  // Split content by ebook shortcodes
  const parts = content.split(EBOOK_SHORTCODE_PATTERN);
  
  // Process each part
  for (let i = 0; i < parts.length; i++) {
    // Add text content
    if (parts[i]) {
      elements.push(<span key={`text-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />);
    }
    
    // Add ebook renderer for each ebook ID (which appear at odd indices starting from 1)
    if (i < parts.length - 1 && i % 2 === 0) {
      const ebookId = parts[i + 1];
      if (ebookId) {
        elements.push(<EbookRenderer key={`ebook-${ebookId}`} ebookId={ebookId} />);
      }
    }
  }
  
  return elements;
}
