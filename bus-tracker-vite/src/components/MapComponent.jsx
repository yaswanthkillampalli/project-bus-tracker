import React,{ useState, useRef, useCallback, memo, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, MarkerF } from '@react-google-maps/api';
import PuffLoader from "react-spinners/PuffLoader";
import busRoute12 from "../assets/busRoute12.png"
import busRoute11 from "../assets/busRoute11.png"

import busIcon from '../assets/bus-fill.svg'
const containerStyle = {
  width: '100%',
  height: '100%'
};

const loaderContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%'
};


const SingleRoute = memo(({ path, color }) => {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const origin = path[0];
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

  const markerIcon = {
    url : busIcon,
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
  }

  return (
    <>
      <DirectionsService
        options={{
          origin: origin,
          destination: path[path.length - 1],
          waypoints: path.slice(1, -1).map(c => ({ location: c, stopover: true })),
          travelMode: 'DRIVING'
        }}
        callback={directionsCallback}
      />
      {directionsResponse && (
        <DirectionsRenderer options={{ ...rendererOptions, directions: directionsResponse }} />
      )}

      <MarkerF
        position={origin}
        icon={markerIcon}
      />
    </>
  );
});


function MapComponent({ routeCoordinates }) {
  console.log('Map Component is Rendering');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    mapIds: [import.meta.env.VITE_MAP_ID],
  });

  // const [directionsResponse, setDirectionsResponse] = useState(null);
  const mapRef = useRef(null);

  const mapOptions = React.useMemo(() => ({
    mapId: import.meta.env.VITE_MAP_ID,
    disableDefaultUI: true,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: true,
  }), []);

  const onLoad = useCallback(map => {
    mapRef.current = map; // Assign map instance to ref
    if (!routeCoordinates || routeCoordinates.length === 0) {
      return; // If there are no routes, do nothing.
    }

    const bounds = new window.google.maps.LatLngBounds();
    routeCoordinates.forEach(route => {
      if (route.path && route.path.length > 0) {
        route.path.forEach(coord => bounds.extend(coord));
      }
    });
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [routeCoordinates]);

  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    mapRef.current = null;
  }, []);

  // const directionsCallback = useCallback((response, status) => {
  //   if (status === 'OK') {
  //     setDirectionsResponse(response);
  //   } else {
  //     console.error(`Directions request failed due to ${status}`);
  //   }
  // }, []);

  // const origin = routeCoordinates.length > 0 ? routeCoordinates[0] : null;
  // const destination = routeCoordinates.length > 1 ? routeCoordinates[routeCoordinates.length - 1] : null;
  // const waypoints = routeCoordinates.length > 2 ? routeCoordinates.slice(1, -1).map(coord => ({
  //   location: coord,
  //   stopover: true
  // })) : [];

  if (loadError) {
    return <div>Error loading maps. Check your API key and billing settings in Google Cloud Console.</div>;
  }
  
  if (!isLoaded) {
    return (
      <div style={loaderContainerStyle}>
        <PuffLoader color="#0075FF" size={60} />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      options={mapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
     {routeCoordinates.map(route => (
        <SingleRoute
          key={route.id}
          path={route.path}
          color={route.color}
        />
      ))} 
    
    </GoogleMap>
  );
}

export default React.memo(MapComponent);