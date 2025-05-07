
import React from "react";
import { MapView } from "@/components/map/MapView";
import { UnionsList } from "@/components/map/UnionsList";
import { useUnionsData } from "@/components/map/hooks/useUnionsData";
import { useMapState } from "@/components/map/hooks/useMapState";
import { MapContainer } from "@/components/map/MapContainer";
import { TokenInput } from "@/components/map/TokenInput";
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
    mapboxToken,
    setMapboxToken,
    isSettingToken,
    setIsSettingToken,
    handleCardInteraction,
    handleMapSelection,
    toggleMapView,
    isMobile
  } = useMapState(unions);

  // Handle token submission
  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setIsSettingToken(false);
  };

  // Show loading state
  if (isLoading) {
    return <MapSkeleton />;
  }

  // Show token input form if needed
  if (isSettingToken) {
    return (
      <div className="container mx-auto px-2 py-4">
        <TokenInput 
          mapboxToken={mapboxToken} 
          onTokenSubmit={handleTokenSubmit} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-3">
      <MapContainer
        isMobile={isMobile}
        showMapOnMobile={showMapOnMobile}
        toggleMapView={toggleMapView}
        onOpenTokenSettings={() => setIsSettingToken(true)}
        mapComponent={
          unions && (
            <MapView 
              unions={unions} 
              selectedUnion={selectedUnion}
              setSelectedUnion={handleMapSelection}
              popupInfo={popupInfo}
              setPopupInfo={setPopupInfo}
              mapboxToken={mapboxToken}
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
