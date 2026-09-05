import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Clock, Star, Utensils, Compass, X, Navigation,
  LocateFixed, RefreshCw, AlertTriangle, BedDouble, Hospital,
  TrainFront, Banknote, Fuel, Landmark, ArrowRight, Eye,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTrip } from '../context/TripContext';
import { normalizePlace, formatDistance } from '../utils/places';
import SmartImage from '../components/SmartImage';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PlaceDetailsModal from '../components/PlaceDetailsModal';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Places' },
  { id: 'Temple', label: 'Temples' },
  { id: 'Heritage', label: 'Heritage' },
  { id: 'Monument', label: 'Monuments' },
  { id: 'Nature', label: 'Nature' },
  { id: 'Waterfall', label: 'Waterfalls' },
  { id: 'Wildlife', label: 'Wildlife' },
  { id: 'Beach', label: 'Beaches' },
  { id: 'Food', label: 'Food' },
  { id: 'Shopping', label: 'Shopping' },
  { id: 'Trekking', label: 'Trekking' },
];

const SERVICE_TABS = [
  { id: 'hotels', label: 'Hotels', icon: BedDouble },
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'hospitals', label: 'Hospitals', icon: Hospital },
  { id: 'transport', label: 'Transport', icon: TrainFront },
  { id: 'atms', label: 'ATMs', icon: Banknote },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
];

const RADIUS_KM = 80;
const USER_LOCATION_LABEL = 'Live GPS';

export default function NearbyPlaces() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTripData } = useTrip();

  const [places, setPlaces] = useState([]);
  const initialCategory = useMemo(() => {
    const wanted = location.state?.category;
    if (!wanted) return 'all';
    const match = CATEGORY_TABS.find((t) => t.id.toLowerCase() === String(wanted).toLowerCase());
    return match ? match.id : 'all';
  }, [location.state]);

  const [activeTab, setActiveTab] = useState(initialCategory);
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
  }, []);

  useEffect(() => {
    if (userCoords) {
      loadNearbyPlaces(userCoords.lat, userCoords.lng, activeTab);
    }
  }, [userCoords, activeTab]);

  useEffect(() => {
    if (userCoords && serviceTab !== 'off') {
      loadNearbyServices(userCoords.lat, userCoords.lng, serviceTab);
    }
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
      setLocationStatus(`Live Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    };

    const handleError = (err) => {
      console.warn('GPS unavailable:', err);
      // Fallback to Bengaluru coordinates for smooth demo experience
      const fallback = { lat: 12.9716, lng: 77.5946 };
      setUserCoords(fallback);
      setGpsDenied(true);
      setLocationStatus('GPS permission not granted. Defaulting to Bengaluru.');
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
    const params = { lat, lng, radius: RADIUS_KM };
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
      setFetchError('Place data temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyServices = async (lat, lng, category) => {
    setServicesLoading(true);
    setServicesError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/nearby/services`, {
        params: { lat, lng, category, radius: RADIUS_KM },
        timeout: 15000,
      });
      const data = res.data && res.data.data ? res.data.data : [];
      setServices(data);
    } catch (err) {
      console.error('Services API unreachable:', err.message);
      setServices([]);
      setServicesError('Live services temporarily unavailable. Please try again later.');
    } finally {
      setServicesLoading(false);
    }
  };

  const withinRangePlaces = useMemo(
    () =>
      places
        .filter((p) => p.distance_km != null && p.distance_km <= RADIUS_KM)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header (Phase 2E Requirement) */}
      <PageHeader
        eyebrow="Location-Based Discovery"
        title="Discover What's Near You"
        subtitle="Uncover heritage spots, scenic spots and local essentials within 30 km of your current position."
      >
        <button
          type="button"
          onClick={detectGpsLocation}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-cream transition-all"
        >
          <LocateFixed className="w-4 h-4 text-safari-400" />
          <span>Refresh GPS</span>
        </button>
      </PageHeader>

      {/* Info Status Banner (Location & 30 km Radius) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-safari-600/20 border border-safari-500/30 flex items-center justify-center text-safari-300 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase tracking-wider">Current Location</p>
            <p className="text-sm font-semibold text-white mt-0.5">{locationStatus}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-safari-500/10 border border-safari-500/30 text-safari-300 font-bold">
            Radius: {RADIUS_KM} km
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-cream/70 font-semibold">
            {withinRangePlaces.length} places found
          </span>
        </div>
      </div>

      {/* Category Filters Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Place Categories</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORY_TABS.map((tab) => {
            const active = activeTab.toLowerCase() === tab.id.toLowerCase();
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setServiceTab('off');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  active && serviceTab === 'off'
                    ? 'bg-safari-600 text-white shadow-md shadow-safari-900/30'
                    : 'bg-white/5 hover:bg-white/10 text-cream/70 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Local Travel Services (Hotels, Food, Transport, ATMs, etc.) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cream/50">
          Nearby Travel Essentials
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = serviceTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setServiceTab(active ? 'off' : tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  active
                    ? 'bg-sunset-600 text-white shadow-md shadow-sunset-900/30'
                    : 'bg-white/5 hover:bg-white/10 text-cream/70 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* SERVICE RESULTS (IF SERVICE TAB ACTIVE)                          */}
      {/* ================================================================ */}
      {serviceTab !== 'off' && (
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-white capitalize">
              Nearby {serviceTab} ({services.length})
            </h3>
            <button
              type="button"
              onClick={() => setServiceTab('off')}
              className="text-xs text-cream/50 hover:text-white"
            >
              Close Services
            </button>
          </div>

          {servicesLoading ? (
            <LoadingState
              message={`Locating nearby ${serviceTab}...`}
              subtitle={`Scanning live points of interest within ${RADIUS_KM} km`}
            />
          ) : servicesError ? (
            <ErrorState message={servicesError} onRetry={() => loadNearbyServices(userCoords.lat, userCoords.lng, serviceTab)} />
          ) : services.length === 0 ? (
            <EmptyState
              title={`No ${serviceTab} found`}
              description={`No live ${serviceTab} mapped within ${RADIUS_KM} km of your coordinates.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 18).map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between hover:border-safari-400/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sunset-400 font-bold uppercase tracking-wider text-[10px]">
                        {serviceTab}
                      </span>
                      {srv.distance_km != null && (
                        <span className="text-safari-300 font-semibold text-[11px]">
                          {formatDistance(srv.distance_km)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-semibold text-sm text-white line-clamp-1">{srv.name}</h4>
                    {srv.address && <p className="text-xs text-cream/50 line-clamp-1">{srv.address}</p>}
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                    {srv.phone ? (
                      <span className="text-xs text-cream/70 font-medium">{srv.phone}</span>
                    ) : (
                      <span className="text-xs text-cream/40">In range</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleViewOnMap(srv)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-safari-300 hover:text-safari-200"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================================================================ */}
      {/* PLACES RESULTS (PHASE 2E CARDS: Image, Place, Category, Distance, View on Map) */}
      {/* ================================================================ */}
      {serviceTab === 'off' && (
        <section className="space-y-6">
          {loading ? (
            <LoadingState
              message="Finding nearby places..."
              subtitle={`Scanning attractions within ${RADIUS_KM} km of your location`}
            />
          ) : fetchError && fetchError !== 'EMPTY' ? (
            <ErrorState
              message={fetchError}
              onRetry={() => loadNearbyPlaces(userCoords?.lat, userCoords?.lng, activeTab)}
            />
          ) : withinRangePlaces.length === 0 ? (
            <EmptyState
              title="No places found within 80 km"
              description="No attractions currently registered in this 80 km radius. Try switching category filters or explore all destinations."
              actionLabel="Explore All Destinations"
              onAction={() => navigate('/destinations')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {withinRangePlaces.map((place) => {
                const placeSlug = place.slug || place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => navigate(`/places/${placeSlug}`)}
                    className="group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
                  >
                    <div>
                      {/* Card Image */}
                      <div className="relative h-44 bg-ink-900 overflow-hidden">
                        {place.image ? (
                          <SmartImage
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-safari-400 bg-safari-500/10">
                            <MapPin className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none" />

                        {/* Category Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-ink-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-cream/90">
                          {place.category}
                        </span>

                        {/* Distance Badge */}
                        {place.distance_km != null && (
                          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-safari-600/90 text-white text-xs font-bold shadow-md">
                            {formatDistance(place.distance_km)}
                          </span>
                        )}

                        {place.rating && (
                          <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-ink-950 text-xs font-black shadow-sm">
                            <Star className="w-3 h-3 fill-ink-950" /> {place.rating}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-1.5">
                        <h3 className="font-display font-semibold text-base text-white group-hover:text-safari-300 transition-colors line-clamp-1">
                          {place.name}
                        </h3>
                        <p className="text-xs text-cream/55 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-safari-400 shrink-0" />
                          <span className="truncate">{place.city}{place.state ? `, ${place.state}` : ''}</span>
                        </p>
                        {place.description && (
                          <p className="text-xs text-cream/65 line-clamp-2 mt-2 leading-relaxed">
                            {place.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/places/${placeSlug}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-cream text-center transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOnMap(place);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/30 flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>View on Map</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Place Details Modal */}
      {selectedPlace && (
        <PlaceDetailsModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onAddToTrip={() => handleViewOnMap(selectedPlace)}
        />
      )}
    </div>
  );
}
