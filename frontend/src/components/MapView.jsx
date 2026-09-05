import React, { useEffect, useImperativeHandle, useMemo, useRef, forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapController({ leafletMapRef, fitSignal, fitWaypoints }) {
  const map = useMap();

  useEffect(() => {
    leafletMapRef.current = map;
  }, [map, leafletMapRef]);

  useEffect(() => {
    if (fitSignal > 0 && fitWaypoints.length > 0) {
      const bounds = L.latLngBounds(fitWaypoints.map((w) => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [fitSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function createNumberedMarkerIcon(number, isStart, isEnd, isActive) {
  let bgColor = '#059669';
  let badgeText = `#${number}`;

  if (isStart) {
    bgColor = '#10b981';
    badgeText = 'START';
  } else if (isEnd) {
    bgColor = '#c96f4e';
    badgeText = 'END';
  }

  const activeClass = isActive
    ? 'box-shadow:0 0 0 3px rgba(16,185,129,.9), 0 8px 24px rgba(0,0,0,.6); transform:scale(1.12);'
    : 'box-shadow:0 4px 12px rgba(0,0,0,.45);';
  const ping = isActive
    ? '<span style="position:absolute;inset:-8px;border-radius:12px;background:rgba(16,185,129,.35);animation:smarttour-marker-ping 1.6s ease-out infinite;"></span>'
    : '';

  const html = `
    <div style="position:relative;">
      ${ping}
      <div style="position:relative;background:${bgColor};color:white;font-weight:800;font-size:11px;padding:3px 8px;border-radius:8px;border:2px solid #0d1a17;display:flex;align-items:center;gap:4px;white-space:nowrap;${activeClass}">
        <span>${badgeText}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [70, 34],
    iconAnchor: [35, 17],
  });
}

function createPlaceMarkerIcon() {
  const dot =
    '<div style="width:14px;height:14px;border-radius:9999px;background:#10b981;border:2.5px solid #0d1a17;box-shadow:0 2px 8px rgba(16,185,129,.7);"></div>';
  return L.divIcon({
    html: dot,
    className: 'custom-leaflet-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const MapView = forwardRef(function MapView(
  {
    waypoints = [],
    userCoords = null,
    height = '400px',
    selectedPlaces = [],
    activeStopName = null,
    onMarkerClick,
    fitSignal = 0,
  },
  ref
) {
  const [routeCoordinates, setRouteCoordinates] = React.useState([]);
  const [routeLoading, setRouteLoading] = React.useState(false);
  const leafletMapRef = useRef(null);
  const containerRef = useRef(null);

  const validWaypoints = useMemo(
    () => waypoints.filter((w) => w && w.lat != null && w.lng != null),
    [waypoints]
  );

  const validPlaces = useMemo(
    () => selectedPlaces.filter((p) => p && p.lat != null && p.lng != null),
    [selectedPlaces]
  );

  useEffect(() => {
    if (validWaypoints.length < 2) {
      setRouteCoordinates(validWaypoints.map((w) => [w.lat, w.lng]));
      return;
    }

    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const coordsStr = validWaypoints.map((w) => `${w.lng},${w.lat}`).join(';');
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteCoordinates(coords);
        } else {
          setRouteCoordinates(validWaypoints.map((w) => [w.lat, w.lng]));
        }
      } catch (error) {
        console.error('Error fetching actual road route:', error);
        setRouteCoordinates(validWaypoints.map((w) => [w.lat, w.lng]));
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [validWaypoints]);

  const fitToWaypoints = () => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (validWaypoints.length > 0) {
      const bounds = L.latLngBounds(validWaypoints.map((w) => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (validPlaces.length > 0) {
      const bounds = L.latLngBounds(validPlaces.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  };

  const centerOn = (lat, lng, zoom) => {
    const map = leafletMapRef.current;
    if (map) map.setView([lat, lng], zoom || map.getZoom());
  };

  useImperativeHandle(ref, () => ({
    fitToWaypoints,
    centerOn,
    getMap: () => leafletMapRef.current,
  }));

  const defaultCenter = userCoords
    ? [userCoords.lat, userCoords.lng]
    : validWaypoints.length > 0
    ? [validWaypoints[0].lat, validWaypoints[0].lng]
    : validPlaces.length > 0
    ? [validPlaces[0].lat, validPlaces[0].lng]
    : [13.0, 75.5];

  const zoomIn = () => leafletMapRef.current?.zoomIn();
  const zoomOut = () => leafletMapRef.current?.zoomOut();
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative z-0"
    >
      <style>{`@keyframes smarttour-marker-ping{0%{transform:scale(.8);opacity:.8}100%{transform:scale(1.7);opacity:0}}`}</style>

      <MapContainer
        center={defaultCenter}
        zoom={waypoints.length > 1 ? 8 : 11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController leafletMapRef={leafletMapRef} fitSignal={fitSignal} fitWaypoints={validWaypoints} />

        {userCoords && userCoords.lat != null && userCoords.lng != null && (
          <Marker position={[userCoords.lat, userCoords.lng]}>
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <p className="font-bold text-xs text-indigo-600">📍 Your Live GPS Location</p>
                <p className="text-[10px] text-slate-500">
                  {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {validWaypoints.map((waypoint, idx) => {
          const isStart = idx === 0;
          const isEnd = idx === validWaypoints.length - 1;
          const stopNum = waypoint.stop_number || idx + 1;
          const isActive =
            activeStopName &&
            String(waypoint.name).toLowerCase() === String(activeStopName).toLowerCase();

          return (
            <Marker
              key={`wp-${idx}-${waypoint.name}`}
              position={[waypoint.lat, waypoint.lng]}
              icon={createNumberedMarkerIcon(stopNum, isStart, isEnd, isActive)}
              eventHandlers={{ click: () => onMarkerClick?.(waypoint) }}
            >
              <Popup>
                <div className="text-slate-900 font-sans p-2 space-y-1 max-w-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                      Stop #{stopNum}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{waypoint.name}</h4>
                  </div>
                  {waypoint.description && (
                    <p className="text-[11px] text-slate-600">{waypoint.description}</p>
                  )}
                  {waypoint.distance_from_prev_km > 0 && (
                    <p className="text-[10px] text-indigo-600 font-semibold pt-0.5">
                      📍 {waypoint.distance_from_prev_km} km from previous stop
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400">Coords: {waypoint.lat}, {waypoint.lng}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {validPlaces.map((place, idx) => (
          <Marker
            key={`pl-${place.id || place.name}-${idx}`}
            position={[place.lat, place.lng]}
            icon={createPlaceMarkerIcon()}
            eventHandlers={{
              click: () =>
                onMarkerClick?.({ ...place, stop_number: null, source: 'selected' }),
            }}
          >
            <Popup>
              <div className="text-slate-900 font-sans p-2 space-y-1 max-w-xs">
                <p className="font-bold text-xs text-indigo-600">📍 Selected Place</p>
                <h4 className="font-bold text-sm text-slate-900">{place.name}</h4>
                {place.description && (
                  <p className="text-[11px] text-slate-600 line-clamp-2">{place.description}</p>
                )}
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 pt-1">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                    {place.category || 'Tourist'}
                  </span>
                  {place.rating ? <span>⭐ {place.rating}</span> : null}
                </div>
                {(place.slug || place.id) && (
                  <div className="pt-1 border-t border-slate-100">
                    <a
                      href={place.category === 'Destination' || place.isDestination ? `/destinations/${place.slug || place.id}` : `/places/${place.slug || place.id}`}
                      className="inline-block text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      {place.category === 'Destination' || place.isDestination ? 'Explore Destination →' : 'View Attraction Details →'}
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} color="#6366f1" weight={5} opacity={0.85} />
        )}
      </MapContainer>

      {routeLoading && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 text-xs text-slate-200 shadow-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> Loading route...
        </div>
      )}

      {/* Map Controls Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={zoomIn}
          className="w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-lg font-bold flex items-center justify-center hover:bg-slate-700 shadow-lg"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-lg font-bold flex items-center justify-center hover:bg-slate-700 shadow-lg"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={fitToWaypoints}
          className="w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-700 shadow-lg"
          aria-label="Fit route to view"
          title="Fit route to view"
        >
          ⌖
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-sm flex items-center justify-center hover:bg-slate-700 shadow-lg"
          aria-label="Toggle fullscreen"
          title="Toggle fullscreen"
        >
          ⛶
        </button>
      </div>
    </div>
  );
});

export default MapView;
