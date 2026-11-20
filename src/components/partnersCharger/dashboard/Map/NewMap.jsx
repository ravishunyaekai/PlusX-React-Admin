import React, { useMemo, useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import PublicChargerIcon from "../../../../assets/images/DashboardCardIcons/Total Public Chargers.svg";
import Cancel from "../../../../assets/images/Cancel.svg";
import style from "./Map.module.css";

const UAE_DEFAULT_CENTER = { lat: 25.2048, lng: 55.2708 };
const googleMapApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
/** Same map ID as the main admin dashboard (required for AdvancedMarker). */
const MAP_ID = "1";

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const stationPosition = (station) => {
    const loc = station?.location;
    const lat = toNumber(loc?.lat ?? station?.latitude);
    const lng = toNumber(loc?.lng ?? station?.longitude);
    if (lat == null || lng == null) return null;
    return { lat, lng };
};

/** Slight offset when multiple stations share the same coordinates. */
const withOverlapOffset = (stations) => {
    const seen = {};
    return stations.map((station) => {
        const base = stationPosition(station);
        if (!base) return { station, position: null };

        const key = `${base.lat.toFixed(6)},${base.lng.toFixed(6)}`;
        const index = seen[key] ?? 0;
        seen[key] = index + 1;

        const position = {
            lat : base.lat + index * 0.00025,
            lng : base.lng + index * 0.00025,
        };
        return { station, position };
    });
};

const averageCenter = (positions) => {
    if (!positions.length) return UAE_DEFAULT_CENTER;
    const sum = positions.reduce(
        (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
        { lat: 0, lng: 0 }
    );
    return {
        lat : sum.lat / positions.length,
        lng : sum.lng / positions.length,
    };
};

function MapComponent({ stations = [] }) {
    const [hoveredStation, setHoveredStation] = useState(null);

    const markerItems = useMemo(() => {
        return withOverlapOffset(stations).filter((item) => item.position);
    }, [stations]);

    const mapCenter = useMemo(
        () => averageCenter(markerItems.map((item) => item.position)),
        [markerItems]
    );

    const mapZoom = markerItems.length === 0 ? 12 : markerItems.length === 1 ? 14 : 11;

    return (
        <div className={style.map}>
            <div className={style.mapContainer}>
                {hoveredStation && (
                    <div className={style.hoverTooltip}>
                        <img
                            src={Cancel}
                            alt="Close"
                            className={style.closeIcon}
                            onClick={() => setHoveredStation(null)}
                        />
                        <p>Station: {hoveredStation.station_name}</p>
                        <p>ID: {hoveredStation.station_id}</p>
                        <p>City: {hoveredStation.city || "—"}</p>
                        <p>Status: {hoveredStation.admin_status || "—"}</p>
                        <p>Chargers: {hoveredStation.charger_count ?? 0}</p>
                    </div>
                )}
                <APIProvider apiKey={googleMapApiKey}>
                    <Map
                        key={`${mapCenter.lat}-${mapCenter.lng}-${markerItems.length}`}
                        defaultZoom={mapZoom}
                        defaultCenter={mapCenter}
                        mapId={MAP_ID}
                        className={style.mapResponsive}
                        gestureHandling="greedy"
                    >
                        {markerItems.length === 0 && (
                            <AdvancedMarker position={UAE_DEFAULT_CENTER} />
                        )}

                        {markerItems.map(({ station, position }) => (
                            <AdvancedMarker
                                key={station.station_id ?? station.key}
                                position={position}
                                onClick={() => setHoveredStation(station)}
                                className={style.makerSection}
                            >
                                <img
                                    src={PublicChargerIcon}
                                    alt=""
                                    className={style.customIcon}
                                    style={{ width: "48px", height: "48px" }}
                                />
                            </AdvancedMarker>
                        ))}
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
}

export default MapComponent;