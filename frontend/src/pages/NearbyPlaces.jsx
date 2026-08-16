import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Utensils, Compass, X, Image as ImageIcon, Navigation, Sparkles, LocateFixed, RefreshCw, AlertTriangle, Phone, CheckCircle, BedDouble, Hospital, TrainFront, Banknote, Fuel } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTrip } from '../context/TripContext';
import { normalizePlace, formatDistance } from '../utils/places';
import SmartImage from '../components/SmartImage';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Places', icon: Compass },
  { id: 'Temple', label: 'Temples', icon: MapPin },
  { id: 'Heritage', label: 'Heritage', icon: MapPin },
  { id: 'Monument', label: 'Monuments', icon: MapPin },
  { id: 'Nature', label: 'Nature', icon: MapPin },
  { id: 'Waterfall', label: 'Waterfalls', icon: MapPin },
  { id: 'Wildlife', label: 'Wildlife', icon: MapPin },
  { id: 'Beach', label: 'Beaches', icon: MapPin },
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'Shopping', label: 'Shopping', icon: Utensils },
  { id: 'Trekking', label: 'Trekking', icon: MapPin },
];

const SERVICE_TABS = [
  { id: 'hotels', label: 'Hotels', icon: BedDouble },
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'hospitals', label: 'Hospitals', icon: Hospital },
  { id: 'transport', label: 'Transport', icon: TrainFront },
  { id: 'atms', label: 'ATMs', icon: Banknote },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
];

const MAX_RADIUS_KM = 35;
const SERVICE_RADIUS_KM = 15;
const USER_LOCATION_LABEL = 'Live GPS';

export default function NearbyPlaces() {
  const navigate = useNavigate();
  const { setTripData } = useTrip();
  const [places, setPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Getting your live location...');
  const [serviceTab, setServiceTab] = useState('off');
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');

  useEffect(() => {
    detectGpsLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userCoords) {
      loadNearbyPlaces(userCoords.lat, userCoords.lng, activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, activeTab]);

  useEffect(() => {
    if (userCoords && serviceTab !== 'off') {
      loadNearbyServices(userCoords.lat, userCoords.lng, serviceTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, serviceTab]);

  const detectGpsLocation = () => {
    setLoading(true);
    setFetchError('');
    setGpsDenied(false);
    setLocationStatus('Getting your live location...');

    const handleSuccess = (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserCoords(coords);
      setGpsDenied(false);
      setLocationStatus(`Live GPS Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    };

    const handleError = (err) => {
      console.warn('GPS unavailable:', err);
      setGpsDenied(true);
      setLoading(false);
      setLocationStatus('Location permission is required to find places near you.');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 8000,
      });
    } else {
      handleError({ message: 'Geolocation not supported' });
    }
  };

  const loadNearbyPlaces = async (lat, lng, category) => {
    setLoading(true);
    setFetchError('');
    const params = { lat, lng, radius: MAX_RADIUS_KM };
    if (category && category !== 'all') params.category = category;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/places/`, { params, timeout: 6000 });
      const data = res.data && res.data.data ? res.data.data : [];
      setPlaces(data);
      if (data.length === 0) {
        setFetchError('EMPTY');
      }
    } catch (err) {
      console.error('Places API unreachable:', err.message);
      setPlaces([]);
      setFetchError('Place data temporarily unavailable. Please check the backend and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyServices = async (lat, lng, category) => {
    setServicesLoading(true);
    setServicesError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/nearby/services`, {
        params: { lat, lng, category, radius: SERVICE_RADIUS_KM },
        timeout: 15000,
      });
      const data = res.data && res.data.data ? res.data.data : [];
      setServices(data);
    } catch (err) {
      console.error('Services API unreachable:', err.message);
      setServices([]);
      setServicesError(
        err.response?.data?.detail || 'Live services temporarily unavailable. Please try again later.'
      );
    } finally {
      setServicesLoading(false);
    }
  };

  // Frontend safety check: strictly never show anything beyond 35 km.
  const withinRangePlaces = useMemo(
    () =>
      places
        .filter((p) => p.distance_km != null && p.distance_km <= MAX_RADIUS_KM)
        .sort((a, b) => a.distance_km - b.distance_km),
    [places]
  );

  const handleViewOnMap = (place) => {
    const normalized = normalizePlace(place);
    const waypoints = [];

    if (userCoords && userCoords.lat != null && userCoords.lng != null) {
      waypoints.push({
        name: USER_LOCATION_LABEL,
        stop_number: 1,
        lat: userCoords.lat,
        lng: userCoords.lng,
        description: 'Your current location',
      });
    }

    waypoints.push({
      name: normalized.name,
      stop_number: waypoints.length + 1,
      lat: normalized.lat,
      lng: normalized.lng,
      description: `${normalized.category} · ${formatDistance(place.distance_km)} from you`,
    });

    const data = {
      fromNearby: true,
      routeStops: [USER_LOCATION_LABEL, normalized.name],
      waypoints,
      selectedPlaces: [normalized],
      groupedRecommendations: [],
      itinerary: null,
      stats: null,
    };
    setTripData(data);
    navigate('/map');
  };

  const loadingText = userCoords ? 'Finding places within 35 km...' : 'Getting your live location...';

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" /> Location-based Explorer
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Nearby Places & Attractions</h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <LocateFixed className="w-3.5 h-3.5 text-indigo-400" />
            <span>{locationStatus}</span>
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3 h-3" /> Only showing places within {MAX_RADIUS_KM} km of your current location
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={detectGpsLocation}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold border border-indigo-500/30 transition-all shadow-sm"
            title="Re-detect current device live GPS coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh GPS</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 overflow-x-auto">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setServiceTab('off');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-emerald-500/20 overflow-x-auto">
            {SERVICE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = serviceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setServiceTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Live services streamed in real time from OpenStreetMap (no rating data available).
          </span>
        </div>
      </div>

      {/* GPS permission denied */}
      {serviceTab !== 'off' ? (
        servicesLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-300">
              Finding nearby {serviceTab} within {SERVICE_RADIUS_KM} km...
            </p>
          </div>
        ) : servicesError ? (
          <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
            <p className="font-semibold text-white text-base">{servicesError}</p>
            <button
              onClick={() => loadNearbyServices(userCoords.lat, userCoords.lng, serviceTab)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
            <Compass className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="font-semibold text-white text-base">
              No {serviceTab} found within {SERVICE_RADIUS_KM} km
            </p>
            <p className="text-xs text-slate-500">Try another category or a nearby location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const SIcon = SERVICE_TABS.find((t) => t.id === serviceTab)?.icon || Compass;
              return (
                <div
                  key={s.id || `${s.name}-${s.distance_km}`}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <SIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm line-clamp-1">{s.name}</h3>
                        <p className="text-[11px] text-slate-400 capitalize">{s.type || s.category_label}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                      {formatDistance(s.distance_km)} away
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-400 flex-1">
                    {s.address && (
                      <p className="flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s.address}
                      </p>
                    )}
                    {s.opening_hours && (
                      <p className="flex items-center gap-1.5 line-clamp-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s.opening_hours}
                      </p>
                    )}
                    {s.phone && (
                      <p className="flex items-center gap-1.5 line-clamp-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s.phone}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-md">
                      <CheckCircle className="w-3 h-3" /> Live from OpenStreetMap
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : gpsDenied ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
          <p className="font-semibold text-white text-base">
            Location permission is required to find places near you.
          </p>
          <p className="text-xs text-slate-500">
            Nearby Places only works with your current live GPS location. Please allow location access to continue.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={detectGpsLocation}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Enable Location
            </button>
            <button
              onClick={detectGpsLocation}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Refresh GPS
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">{loadingText}</p>
        </div>
      ) : fetchError ? (
        fetchError === 'EMPTY' ? (
          <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
            <MapPin className="w-10 h-10 mx-auto text-indigo-400" />
            <p className="font-semibold text-white text-base">No nearby tourist places found</p>
            <p className="text-xs text-slate-500">Try another location or refresh your GPS.</p>
            <button
              onClick={detectGpsLocation}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Refresh GPS
            </button>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
            <p className="font-semibold text-white text-base">{fetchError}</p>
            <button
              onClick={detectGpsLocation}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        )
      ) : withinRangePlaces.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <MapPin className="w-10 h-10 mx-auto text-indigo-400" />
          <p className="font-semibold text-white text-base">No nearby tourist places found</p>
          <p className="text-xs text-slate-500">Try another location or refresh your GPS.</p>
          <button
            onClick={() => {
              setActiveTab('all');
              detectGpsLocation();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {withinRangePlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => setSelectedPlace(place)}
              className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-800">
                  <SmartImage
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 capitalize">
                      {place.category}
                    </span>
                    {place.distance_km !== undefined && (
                      <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {formatDistance(place.distance_km)} away
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-amber-500/90 text-slate-950 text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{place.rating}</span>
                      {place.reviews_count != null && (
                        <span className="text-[10px] opacity-80 font-normal">({place.reviews_count})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {place.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    {place.city}, {place.state}
                  </p>

                  {place.open_time && (
                    <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{place.open_time} - {place.close_time}</span>
                      </div>
                    </div>
                  )}

                  {place.tags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {place.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewOnMap(place);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </button>
                <button className="w-full py-2 bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Details & History</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-64 bg-slate-800">
              <SmartImage
                src={selectedPlace.image}
                alt={selectedPlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-800 text-white p-2 rounded-full border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                    {selectedPlace.category}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-slate-950" /> {selectedPlace.rating}
                  </div>
                  {selectedPlace.distance_km !== undefined && (
                    <span className="bg-slate-800/90 border border-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {formatDistance(selectedPlace.distance_km)} away
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white">{selectedPlace.name}</h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {selectedPlace.city}, {selectedPlace.state}
                </p>
              </div>
            </div>

            <div className="p-6 pt-2 space-y-5 text-slate-300">
              <div className="flex items-center gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Opening & Closing Timings</p>
                  <p className="text-slate-400">{selectedPlace.open_time} to {selectedPlace.close_time}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Place History & Details
                </h4>
                <p className="text-xs leading-relaxed text-slate-300 bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                  {selectedPlace.history || selectedPlace.description}
                </p>
              </div>

              {selectedPlace.snapshots && selectedPlace.snapshots.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-400" /> Photo Snapshots Gallery
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPlace.snapshots.map((img, idx) => (
                      <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                        <SmartImage src={img} alt="snapshot" className="w-full h-full object-cover hover:scale-105 transition-transform" iconClassName="w-6 h-6" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + selectedPlace.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Navigation className="w-4 h-4" /> Open in Google Maps
                </a>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
