
import { useState } from "react";
import { Union } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Custom hook to manage map state and interactions
 */
export const useMapState = (unions: Union[] | undefined) => {
  const isMobile = useIsMobile();
  const [selectedUnion, setSelectedUnion] = useState<string | null>(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(true); // Changed to true to show map by default
  const [popupInfo, setPopupInfo] = useState<Union | null>(null);

  // Handle card interaction (click/hover)
  const handleCardInteraction = (unionId: string) => {
    setSelectedUnion(unionId);
    
    // Find the union for popup info
    const union = unions?.find(u => u.id === unionId);
    if (union) setPopupInfo(union);
    
    // Scroll the card into view if not visible
    const element = document.getElementById(`union-card-${unionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handle map marker selection
  const handleMapSelection = (unionId: string) => {
    setSelectedUnion(unionId === selectedUnion ? null : unionId);
    
    // Find the union to set popup info
    const union = unions?.find(u => u.id === unionId);
    if (union) setPopupInfo(union);
    
    // On mobile, show the list after selecting a marker
    if (isMobile) {
      setShowMapOnMobile(false);
    }
    
    // Scroll to the union card in the list with a smooth animation
    setTimeout(() => {
      const element = document.getElementById(`union-card-${unionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Toggle map view on mobile
  const toggleMapView = () => {
    setShowMapOnMobile(!showMapOnMobile);
  };

  return {
    selectedUnion,
    setSelectedUnion,
    showMapOnMobile,
    popupInfo,
    setPopupInfo,
    handleCardInteraction,
    handleMapSelection,
    toggleMapView,
    isMobile
  };
};
