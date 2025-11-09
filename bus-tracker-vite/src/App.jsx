// Import React and related hooks
import React, { useState, useMemo, useRef } from 'react';

// Import components from @react-google-maps/api
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';

// Define the map container styles
const containerStyle = {
  width: '100%',
  height: '500px',
};

// Define which Google Maps libraries to load (places, directions, etc.)
const libraries = ['places','directions'];

// A fake current location for demonstration
const mockCurrentLocation = {
  lat: 16.49101,
  lng: 80.60530,
};

// A fake route made up of multiple points
const mockSampleRouteCoordinates = [
  { lat: 16.49101, lng: 80.60530 },
  { lat: 16.48847, lng: 80.60746 },
  { lat: 16.48214, lng: 80.61064 },
  { lat: 16.48019, lng: 80.61709 },
  { lat: 16.48416, lng: 80.61940 },
  { lat: 16.49963, lng: 80.63784 },
  { lat: 16.49354, lng: 80.64746 },
  { lat: 16.49161, lng: 80.65077 },
  { lat: 16.49046, lng: 80.65267 },
  { lat: 16.49030, lng: 80.65454 },
  { lat: 16.49141, lng: 80.65525 },
  { lat: 16.49341, lng: 80.65693 },
  { lat: 16.49564, lng: 80.65727 },
  { lat: 16.49672, lng: 80.65834 },
  { lat: 16.46853, lng: 80.73905 },
];

// A reusable MapContainer component that takes props
const MapContainer = ({
  center,
  zoom,
  options,
  currentLocation,
  routeCoordinates,
  isRouteSelected,
  onLoad,
  onUnmount,
}) => {
  // Store the route directions result
  const [directionsResponse, setDirectionsResponse] = useState(null);

  // Store any error from the Directions API
  const [directionsError, setDirectionsError] = useState(null);

  // Prepare the request for the DirectionsService ONLY if a route is selected
  const directionsRequest = useMemo(() => {
    if (!isRouteSelected || routeCoordinates.length < 2) return null;

    // First coordinate is start, last is end
    const origin = routeCoordinates[0];
    const destination = routeCoordinates[routeCoordinates.length - 1];

    // Middle points are waypoints
    const waypoints = routeCoordinates.slice(1, -1).map(point => ({
      location: point,
      stopover: true,
    }));

    return {
      origin,
      destination,
      waypoints,
      travelMode: 'DRIVING',
    };
  }, [isRouteSelected, routeCoordinates]);

  // Callback when Directions API returns a result
  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirectionsResponse(response);
        setDirectionsError(null);
      } else {
        setDirectionsResponse(null);
        setDirectionsError(response.status);
      }
    }
  };

  // Render the GoogleMap component
  return (
    <GoogleMap
      mapContainerStyle={containerStyle} // styles
      center={center}                    // start center
      zoom={zoom}                         // start zoom
      options={options}                   // map config options
      onLoad={onLoad}                     // when map loads
      onUnmount={onUnmount}               // when map is removed
    >
      {/* Show current location if no route selected */}
      {!isRouteSelected && currentLocation && (
        <Marker position={currentLocation} />
      )}

      {/* Show route if selected */}
      {isRouteSelected && directionsRequest && (
        <>
          <DirectionsService
            options={directionsRequest}
            callback={directionsCallback}
          />
          {directionsResponse && (
            <DirectionsRenderer options={{ directions: directionsResponse }} />
          )}
        </>
      )}

      {/* Show error if Directions API failed */}
      {isRouteSelected && directionsError && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-lg shadow-lg font-semibold z-10"
        >
          Directions API Error: {directionsError}
        </div>
      )}
    </GoogleMap>
  );
};

// Main App Component
export default function App() {
  // Google API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Switch between location view or route view
  const [isRouteSelected, setIsRouteSelected] = useState(false);

  // Reference to store map instance
  const mapRef = useRef(null);

  // Load Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    version: 'weekly',
    libraries,
  });

  // Center and zoom depend on selected mode
  const mapCenter = isRouteSelected
    ? mockSampleRouteCoordinates[0]
    : mockCurrentLocation;
  const mapZoom = isRouteSelected ? 12 : 15;

  // Static map options
  const mapOptions = useMemo(
    () => ({
      gestureHandling: 'greedy',
      tilt: 45,
      heading: 90,
      mapTypeControl: true,
      fullscreenControl: true,
      disableDefaultUI: false,
      zoomControl: true,
    }),
    []
  );

  // Store the map instance when it loads
  const onMapLoad = (mapInstance) => {
    mapRef.current = mapInstance;
  };

  // Clear map instance when it unmounts
  const onMapUnmount = () => {
    mapRef.current = null;
  };

  // Handle API load error
  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  // Render the UI
  return (
    <div className="p-8">
      <h1>Custom Map Example</h1>

      {/* Buttons to toggle between location and route */}
      <div>
        <button onClick={() => setIsRouteSelected(false)}>Show Current Location</button>
        <button onClick={() => setIsRouteSelected(true)}>Show Route</button>
      </div>

      {/* Map display */}
      <div>
        {isLoaded ? (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            options={mapOptions}
            currentLocation={mockCurrentLocation}
            routeCoordinates={mockSampleRouteCoordinates}
            isRouteSelected={isRouteSelected}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
          />
        ) : (
          <div style={containerStyle}>Loading map...</div>
        )}
      </div>
    </div>
  );
}
