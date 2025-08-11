
import { z } from "zod";

export const ebookFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tytuł jest wymagany"),
  pageCount: z.number().int("Liczba stron musi być liczbą całkowitą").min(1, "Minimalna liczba stron to 1").optional(),
  description: z.string().optional(),
  fileUrl: z.string().min(1, "Plik PDF jest wymagany"),
  coverUrl: z.string().optional(),
  ebookType: z.string().min(1, "Typ publikacji jest wymagany"),
});

export type EbookFormValues = z.infer<typeof ebookFormSchema>;
