import React, { useState, useCallback, useMemo, memo } from 'react';
import { DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

function RouteRenderer({ path, color }) {
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const origin = path[0];
  const destination = path[path.length - 1];
  const waypoints = path.slice(1, -1).map(coord => ({
    location: coord,
    stopover: true
  }));

  const directionsCallback = useCallback((response, status) => {
    if (status === 'OK') {
      setDirectionsResponse(response);
    } else {
      console.error(`Directions request failed for a route due to ${status}`);
    }
  }, []);

  const rendererOptions = useMemo(() => ({
    preserveViewport: true,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: color || '#0075FF',
      strokeWeight: 5,
      strokeOpacity: 0.8,
    },
  }), [color]);

  return (
    <>
      <DirectionsService
        options={{
          origin,
          destination,
          waypoints,
          travelMode: 'DRIVING'
        }}
        callback={directionsCallback}
      />

      {directionsResponse && (
        <DirectionsRenderer options={{ ...rendererOptions, directions: directionsResponse }} />
      )}
    </>
  );
}

export default memo(RouteRenderer);