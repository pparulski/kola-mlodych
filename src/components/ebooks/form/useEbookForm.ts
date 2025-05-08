
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ebookFormSchema, type EbookFormValues } from "./ebookFormSchema";

type SubmitHandler = (
  title: string,
  file_url: string,
  cover_url: string,
  publication_year: number,
  description?: string,
  page_count?: number
) => Promise<void>;

export function useEbookForm(onUploadSuccess: SubmitHandler) {
  const [fileUrl, setFileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EbookFormValues>({
    resolver: zodResolver(ebookFormSchema),
    defaultValues: {
      title: "",
      publicationYear: new Date().getFullYear(),
      pageCount: undefined,
      description: "",
      fileUrl: "",
      coverUrl: "",
    },
    mode: "onChange"
  });

  const handleSubmit = async (data: EbookFormValues) => {
    if (!data.fileUrl) {
      toast.error("Plik PDF jest wymagany");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUploadSuccess(
        data.title,
        data.fileUrl,
        coverUrl,
        data.publicationYear,
        data.description,
        data.pageCount
      );
      
      // Reset form
      form.reset({
        title: "",
        publicationYear: new Date().getFullYear(),
        pageCount: undefined,
        description: "",
        fileUrl: "",
        coverUrl: "",
      });
      
      setFileUrl("");
      setCoverUrl("");
    } catch (error) {
      console.error("Error submitting ebook:", error);
      toast.error("Wystąpił błąd podczas dodawania publikacji");
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
  };
}
