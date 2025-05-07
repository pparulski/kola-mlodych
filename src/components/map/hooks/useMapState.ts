
import { useState, useEffect } from "react";
import { Union } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Custom hook to manage map state and interactions
 */
export const useMapState = (unions: Union[] | undefined) => {
  const isMobile = useIsMobile();
  const [selectedUnion, setSelectedUnion] = useState<string | null>(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [popupInfo, setPopupInfo] = useState<Union | null>(null);
  const [isSettingToken, setIsSettingToken] = useState<boolean>(false);
  
  // Get Mapbox token from localStorage or use empty string
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });

  // Initialize token setting state based on whether a token exists
  useEffect(() => {
    setIsSettingToken(!mapboxToken);
  }, []);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
    }
  }, [mapboxToken]);

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
    
    // Scroll to the union card in the list
    const element = document.getElementById(`union-card-${unionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
    mapboxToken,
    setMapboxToken,
    isSettingToken,
    setIsSettingToken,
    handleCardInteraction,
    handleMapSelection,
    toggleMapView,
    isMobile
  };
};
