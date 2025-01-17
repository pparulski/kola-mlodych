import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: string) {
  if (!date) return "";
  
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) {
    console.error("Invalid date value:", date);
    return "";
  }
  
  return format(parsedDate, "dd.MM.yyyy");
}