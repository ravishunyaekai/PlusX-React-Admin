import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import style from "./Map.module.css";

const center = {
  lat: 25.2048,
  lng: 55.2708,
};

function MapComponent({ coordinates }) {
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  if (!isLoaded) return <div>Loading...</div>;

  const mapCenter = coordinates?.lat && coordinates?.lng ? coordinates : center;

  return (
    <div className={style.map}>
      <div className={`${style.mapContainer}`}>
        <GoogleMap mapContainerClassName={style.mapResponsive} 
        center={mapCenter}
        zoom={12}
        >
           {/* {coordinates && coordinates.lat && coordinates.lng && ( */}
            <Marker position={mapCenter} />
          {/* )} */}
        </GoogleMap>
      </div>
    </div>
  );
}

export default MapComponent;
