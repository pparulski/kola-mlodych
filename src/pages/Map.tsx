
import React from "react";
import { MapView } from "@/components/map/MapView";
import { UnionsList } from "@/components/map/UnionsList";
import { useUnionsData } from "@/components/map/hooks/useUnionsData";
import { useMapState } from "@/components/map/hooks/useMapState";
import { MapContainer } from "@/components/map/MapContainer";
import { MapSkeleton } from "@/components/map/MapSkeleton";

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
    showMapOnMobile,
    popupInfo,
    setPopupInfo,
    handleCardInteraction,
    handleMapSelection,
    toggleMapView,
    isMobile
  } = useMapState(unions);

  // Show loading state
  if (isLoading) {
    return <MapSkeleton />;
  }

  return (
    <div className="container mx-auto px-1 py-2">
      <MapContainer
        isMobile={isMobile}
        showMapOnMobile={showMapOnMobile}
        toggleMapView={toggleMapView}
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
