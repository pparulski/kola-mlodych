
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ebookFormSchema, type EbookFormValues } from "./ebookFormSchema";
import type { Ebook } from "@/components/ebooks/types";

type SubmitHandler = (
  id: string | undefined,
  title: string,
  file_url: string,
  cover_url: string,
  publication_year: number,
  description?: string,
  page_count?: number
) => Promise<void>;

interface UseEbookFormProps {
  onSubmit: SubmitHandler;
  ebookToEdit?: Ebook | null;
}

export function useEbookForm({ onSubmit, ebookToEdit }: UseEbookFormProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EbookFormValues>({
    resolver: zodResolver(ebookFormSchema),
    defaultValues: {
      id: undefined,
      title: "",
      publicationYear: new Date().getFullYear(),
      pageCount: undefined,
      description: "",
      fileUrl: "",
      coverUrl: "",
    },
    mode: "onChange"
  });

  // Set form data when editing an existing ebook
  useEffect(() => {
    if (ebookToEdit) {
      console.log("Setting form data for editing:", ebookToEdit);
      
      form.reset({
        id: ebookToEdit.id,
        title: ebookToEdit.title,
        publicationYear: ebookToEdit.publication_year || new Date().getFullYear(),
        pageCount: ebookToEdit.page_count,
        description: ebookToEdit.description || "",
        fileUrl: ebookToEdit.file_url,
        coverUrl: ebookToEdit.cover_url || "",
      });
      
      setFileUrl(ebookToEdit.file_url);
      setCoverUrl(ebookToEdit.cover_url || "");
    }
  }, [ebookToEdit, form]);

  // Track changes in fileUrl and coverUrl to update form
  useEffect(() => {
    if (fileUrl) {
      form.setValue("fileUrl", fileUrl, { shouldValidate: true });
    }
  }, [fileUrl, form]);

  useEffect(() => {
    if (coverUrl) {
      form.setValue("coverUrl", coverUrl, { shouldValidate: true });
    }
  }, [coverUrl, form]);

  const handleSubmit = async (data: EbookFormValues) => {
    if (!fileUrl && !data.fileUrl) {
      toast.error("Plik PDF jest wymagany");
      return;
    }
    
    const effectiveFileUrl = data.fileUrl || fileUrl;
    const effectiveCoverUrl = data.coverUrl || coverUrl;
    
    setIsSubmitting(true);
    try {
      console.log("Submitting form with data:", data);
      console.log("File URL:", effectiveFileUrl);
      console.log("Cover URL:", effectiveCoverUrl);
      
      await onSubmit(
        data.id,
        data.title,
        effectiveFileUrl,
        effectiveCoverUrl,
        data.publicationYear,
        data.description,
        data.pageCount
      );
      
      // Reset form only if not editing
      if (!ebookToEdit) {
        form.reset({
          id: undefined,
          title: "",
          publicationYear: new Date().getFullYear(),
          pageCount: undefined,
          description: "",
          fileUrl: "",
          coverUrl: "",
        });
        
        setFileUrl("");
        setCoverUrl("");
      }
    } catch (error) {
      console.error("Error submitting ebook:", error);
      toast.error("Wystąpił błąd podczas zapisywania publikacji");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    fileUrl,
    setFileUrl,
    coverUrl,
    setCoverUrl,
    isSubmitting,
    handleSubmit,
    isEditing: !!ebookToEdit,
  };
}
