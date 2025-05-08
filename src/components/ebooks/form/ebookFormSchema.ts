
import { z } from "zod";

export const ebookFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tytuł jest wymagany"),
  publicationYear: z.number()
    .int("Rok musi być liczbą całkowitą")
    .min(1900, "Rok musi być co najmniej 1900")
    .max(new Date().getFullYear(), `Rok nie może być większy niż ${new Date().getFullYear()}`),
  pageCount: z.number().int("Liczba stron musi być liczbą całkowitą").min(1, "Minimalna liczba stron to 1").optional(),
  description: z.string().max(1300, "Opis nie może przekraczać 1300 znaków").optional(),
  fileUrl: z.string().min(1, "Plik PDF jest wymagany"),
  coverUrl: z.string().optional(),
});

export type EbookFormValues = z.infer<typeof ebookFormSchema>;
