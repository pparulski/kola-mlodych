import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Union } from "./types";
import { UnionDetailsDrawer } from "./UnionDetailsDrawer";

interface MapPageControllerProps {
  selectedUnionId: string | null;
  unions: Union[];
  onOpenChange: (open: boolean) => void;
}

export const MapPageController: React.FC<MapPageControllerProps> = ({ selectedUnionId, unions, onOpenChange }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [union, setUnion] = useState<Union | null>(null);

  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
      return;
    }
    if (selectedUnionId) {
      const u = unions.find(u => u.id === selectedUnionId) || null;
      setUnion(u);
      setOpen(!!u);
    } else {
      setOpen(false);
      setUnion(null);
    }
  }, [selectedUnionId, unions, isMobile]);

  return isMobile ? (
    <UnionDetailsDrawer union={union} open={open} onOpenChange={(v) => { setOpen(v); onOpenChange(v); }} />
  ) : null;
};
