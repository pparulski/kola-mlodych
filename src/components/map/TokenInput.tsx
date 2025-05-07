
import { Card } from "@/components/ui/card";

interface TokenInputProps {
  mapboxToken: string;
  onTokenSubmit: (token: string) => void;
}

/**
 * This component is no longer used but kept for references
 */
export const TokenInput = ({ mapboxToken, onTokenSubmit }: TokenInputProps) => {
  return null;
};
