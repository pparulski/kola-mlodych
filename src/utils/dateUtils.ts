import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";

const ROMAN_MONTHS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
];

export function formatDatePL(date: Date | string | number): string {
  const d = new Date(date);
  return isValid(d) ? format(d, "d MMMM yyyy", { locale: pl }) : "";
}

export function formatDatePLRoman(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) return "";
  const day = d.getDate();
  const monthRoman = ROMAN_MONTHS[d.getMonth()]; // 0-based
  const year = d.getFullYear();
  return `${day} ${monthRoman} ${year}`;
}
