
import React from "react";
import { MapView } from "@/components/map/MapView";
import { UnionsList } from "@/components/map/UnionsList";
import { useUnionsData } from "@/components/map/hooks/useUnionsData";
import { useMapState } from "@/components/map/hooks/useMapState";
import { MapContainer } from "@/components/map/MapContainer";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { SEO } from "@/components/seo/SEO";

/**
 * UnionsMap page component that displays a map of union locations
 * and a list of unions that can be interacted with.
 */
const UnionsMap = () => {
  // Fetch unions data from Supabase using our custom hook
  const { data: unions, isLoading } = useUnionsData();
  
  // Use our custom hook to manage map state
  const {
    selectedUnion,
    popupInfo,
    setPopupInfo,
    handleCardInteraction,
    handleMapSelection,
    isMobile
  } = useMapState(unions);

  // Show loading state
  if (isLoading) {
    return <MapSkeleton />;
  }

  return (
    <div className="page-container section-spacing mt-4">
      <SEO
        title="Struktury związkowe"
        description="Mapa struktur związkowych Kół Młodych Inicjatywy Pracowniczej w Polsce"
        keywords="struktury związkowe, mapa, związek zawodowy, inicjatywa pracownicza"
      />
      
      <MapContainer
        isMobile={isMobile}
        mapComponent={
          unions && (
            <MapView 
              unions={unions} 
              selectedUnion={selectedUnion}
              setSelectedUnion={handleMapSelection}
              popupInfo={popupInfo}
              setPopupInfo={setPopupInfo}
            />
          )
        }
        listComponent={
          unions && (
            <UnionsList
              unions={unions}
              selectedUnion={selectedUnion}
              handleCardInteraction={handleCardInteraction}
            />
          )
        }
      />
    </div>
  );
};

export default UnionsMap;
