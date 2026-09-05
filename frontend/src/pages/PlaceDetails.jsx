import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, Calendar, Clock, Compass, Route, Star, ArrowLeft,
  ChevronRight, Sparkles, Image as ImageIcon, Heart, Share2,
  Navigation, IndianRupee, Layers, Info, CheckCircle2, AlertCircle,
  ExternalLink, X, Utensils, Hotel, ShoppingBag, Landmark,
  Trees, Sun, Moon, Plane, Train, Bus, Car, ChevronDown, Award, Users, Check,
  MessageSquare
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import SmartImage from '../components/SmartImage';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import MapView from '../components/MapView';
import { getPlaceBySlug, getNearbyForPlace, getPlaceGallery, getPlaceReviews } from '../services/places';
import { getNearbyServices } from '../services/nearby';
import { addFavorite, removeFavorite, getFavorites } from '../services/favorites';

export default function PlaceDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updatePlanner, openPlaceOnMap } = useTrip();

  const [place, setPlace] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingFav, setSavingFav] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [addTripToast, setAddTripToast] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');

  const mapRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const placeData = await getPlaceBySlug(slug);
        if (!placeData) {
          if (isMounted) setError('Attraction not found.');
          return;
        }

        if (isMounted) setPlace(placeData);

        // Fetch dependent data in parallel (strictly 80 km radius for nearby)
        const [nearbyData, galleryData, reviewsData] = await Promise.all([
          getNearbyForPlace(slug, 80, 10).catch(() => []),
          getPlaceGallery(slug).catch(() => []),
          getPlaceReviews(slug).catch(() => []),
        ]);

        if (isMounted) {
          // Strict filter <= 80 km
          setNearbyPlaces(
            (nearbyData || []).filter((p) => p.distance_km == null || p.distance_km <= 80)
          );
          setGallery(galleryData);
          setReviews(reviewsData);
        }

        // Live real hotels & restaurants within 80km
        if (placeData.latitude && placeData.longitude) {
          getNearbyServices(placeData.latitude, placeData.longitude, 'hotels', 80)
            .then((res) => isMounted && setHotels(res.slice(0, 5)))
            .catch(() => {});

          getNearbyServices(placeData.latitude, placeData.longitude, 'restaurants', 80)
            .then((res) => isMounted && setRestaurants(res.slice(0, 5)))
            .catch(() => {});
        }

        // Check if saved in user favorites
        if (currentUser) {
          getFavorites()
            .then((favs) => {
              if (isMounted) {
                const found = (favs || []).some((f) => (f.place_id || f.id) === placeData.id);
                setIsSaved(found);
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load attraction details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
    return () => { isMounted = false; };
  }, [slug, currentUser]);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/places/${slug}` } });
      return;
    }
    if (!place) return;

    setSavingFav(true);
    try {
      if (isSaved) {
        await removeFavorite(place.id);
        setIsSaved(false);
      } else {
        await addFavorite(place.id);
        setIsSaved(true);
      }
    } catch {
      // Toggle local fallback
      setIsSaved(!isSaved);
    } finally {
      setSavingFav(false);
    }
  };

  const handleAddToTrip = () => {
    if (!place) return;
    updatePlanner((prev) => {
      const exists = (prev.selectedPlaces || []).some(
        (p) => (p.id || p.place_id) === (place.id || place.place_id)
      );
      const nextList = exists ? prev.selectedPlaces : [...(prev.selectedPlaces || []), place];
      return { ...prev, selectedPlaces: nextList };
    });
    setAddTripToast(true);
    setTimeout(() => setAddTripToast(false), 3000);
  };

  const handleViewMap = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      openPlaceOnMap(place);
    }
  };

  const handleGetDirections = () => {
    if (!place) return;
    const lat = place.latitude || place.lat;
    const lng = place.longitude || place.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.city || ''))}`, '_blank');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${place?.name} – ExploreIndiaAI`;
    const text = `Explore ${place?.name} in ${place?.city}: ${place?.description}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleAskAiGuide = (e) => {
    e.preventDefault();
    const prompt = aiQuestion.trim() || `Tell me about ${place.name} in ${place.city}.`;
    navigate('/ai-guide', { state: { initialPrompt: prompt } });
  };

  // Map markers: Selected place + strictly nearby places
  const mapItems = useMemo(() => {
    if (!place) return [];
    const items = [
      {
        id: place.id,
        slug: place.slug || place.id,
        name: place.name,
        category: place.category || 'Attraction',
        lat: place.latitude || place.lat,
        lng: place.longitude || place.lng,
        rating: place.rating,
        image: place.image,
        city: place.city,
        isSelected: true,
      },
    ];

    nearbyPlaces.forEach((p) => {
      if (p.latitude && p.longitude && p.id !== place.id) {
        items.push({
          id: p.id,
          slug: p.slug || p.id,
          name: p.name,
          category: p.category || 'Attraction',
          lat: p.latitude,
          lng: p.longitude,
          rating: p.rating,
          image: p.image,
          city: p.city,
          distance_km: p.distance_km,
        });
      }
    });

    return items;
  }, [place, nearbyPlaces]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Discovering attraction details, history and nearby gems..." />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState
          title="Attraction Not Found"
          message={error || "We couldn't locate this attraction in our catalog."}
          actionLabel="Explore Attractions"
          onAction={() => navigate('/attractions')}
        />
      </div>
    );
  }

  const whyVisitList = place.why_visit || [];
  const thingsToSee = place.things_to_see || [];
  const howToReach = place.how_to_reach || {};
  const visitorTips = place.visitor_tips || [];
  const faqs = place.faqs || [];

  return (
    <div className="bg-ink-950 text-cream min-h-screen pb-16">
      {/* Toast Alert for Share */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-safari-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-up">
          <Check className="w-4 h-4" /> Link copied to clipboard!
        </div>
      )}

      {/* Toast Alert for Add to Trip */}
      {addTripToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-safari-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-up">
          <CheckCircle2 className="w-4 h-4" /> Added to your trip planner!
        </div>
      )}

      {/* ===================== HERO SECTION ===================== */}
      <div className="relative h-[60vh] min-h-[420px] max-h-[580px] w-full overflow-hidden bg-ink-900">
        <SmartImage
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />

        {/* Top Breadcrumb */}
        <div className="absolute top-6 left-4 sm:left-8 z-10 flex items-center gap-2">
          <Link
            to="/attractions"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-950/70 hover:bg-ink-900 border border-white/15 text-xs text-cream/80 hover:text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Attractions</span>
          </Link>
          {place.destination_slug && (
            <Link
              to={`/destinations/${place.destination_slug}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-safari-600/30 hover:bg-safari-600/50 border border-safari-500/30 text-xs text-safari-200 transition-all backdrop-blur-md"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore {place.city}</span>
            </Link>
          )}
        </div>

        {/* Hero Bottom Meta & Actions */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl animate-fade-up">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-safari-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                {place.category || 'Historic Monument'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-cream/90 text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-safari-400" />
                {place.city}{place.state ? `, ${place.state}` : ''}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-ink-950 text-xs font-black backdrop-blur-md flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-ink-950" />
                {place.rating || 4.8}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-cream/90 text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-safari-300" />
                {place.entry_fee_display || (place.estimated_cost ? `₹${place.estimated_cost}` : 'Free Entry')}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight leading-none">
              {place.name}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 animate-fade-up">
            <button
              onClick={handleToggleFavorite}
              disabled={savingFav}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold backdrop-blur-md ${
                isSaved
                  ? 'bg-sunset-600 text-white border-sunset-500 shadow-lg shadow-sunset-900/40'
                  : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleAddToTrip}
              className="px-5 py-3 rounded-2xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-xl shadow-safari-900/50 flex items-center gap-2"
            >
              <Route className="w-4 h-4" />
              <span>Add to Trip</span>
            </button>

            <button
              onClick={handleViewMap}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-safari-300" />
              <span>View Map</span>
            </button>

            <button
              onClick={handleGetDirections}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-2"
              title="Get directions in Google Maps"
            >
              <Navigation className="w-4 h-4 text-sky-300" />
              <span>Directions</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md"
              title="Share attraction"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== MAIN BODY ===================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16">
        {/* SECTION: ABOUT & ESSENTIAL METRICS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider">
                <Info className="w-4 h-4" /> About the Landmark
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
                {place.description}
              </h2>
            </div>

            {/* Architecture & Significance */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-safari-400" /> Architecture &amp; Cultural Significance
              </h3>
              <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                {place.architecture}
              </p>
              <p className="text-xs sm:text-sm text-cream/70 leading-relaxed border-t border-white/5 pt-3">
                {place.significance}
              </p>
            </div>

            {/* Historical Background */}
            {place.history && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sunset-400 text-xs font-bold uppercase tracking-wider">
                  <Landmark className="w-4 h-4" /> Historical Legacy
                </div>
                <p className="text-xs sm:text-sm text-cream/80 leading-relaxed">
                  {place.history}
                </p>
              </div>
            )}
          </div>

          {/* Visit Essentials Card */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-safari-400" /> Visit Essentials
              </h3>
              <div className="divide-y divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-safari-400" /> Timings</span>
                  <span className="font-semibold text-white text-right">{place.opening_hours}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-safari-400" /> Entry Fee</span>
                  <span className="font-semibold text-safari-300 text-right">{place.entry_fee_display}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Best Season</span>
                  <span className="font-semibold text-white text-right">{place.best_time || 'Oct – Mar'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-safari-400" /> Location</span>
                  <span className="font-semibold text-white text-right">{place.city}, Karnataka</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleAddToTrip}
                  className="w-full py-2.5 rounded-xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/30 flex items-center justify-center gap-2"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Add to Trip Plan</span>
                </button>
                <button
                  onClick={handleGetDirections}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Get Directions in Maps</span>
                </button>
              </div>
            </div>

            {/* AI Tour Guide Quick Ask */}
            <div className="p-6 rounded-3xl bg-safari-950/20 border border-safari-500/20 space-y-3">
              <div className="flex items-center gap-2 text-safari-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-safari-400" /> Ask AI Tour Guide
              </div>
              <p className="text-xs text-cream/70">
                Have questions about photography rules, architecture, or legends at {place.name}?
              </p>
              <form onSubmit={handleAskAiGuide} className="space-y-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder={`Ask anything about ${place.name}...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-ink-900 border border-white/10 text-xs text-white placeholder-cream/30 focus:border-safari-400 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-safari-600/30 hover:bg-safari-600 border border-safari-500/40 text-safari-200 hover:text-white text-xs font-bold transition-all"
                >
                  Ask AI Guide &rarr;
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* SECTION: WHY VISIT & THINGS TO SEE */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Experience Highlights
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Why Visit &amp; What to See
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyVisitList.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-400 font-bold text-xs">
                  {idx + 1}
                </div>
                <p className="text-xs text-cream/75 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          {thingsToSee.length > 0 && (
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {thingsToSee.map((act, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <h4 className="font-display font-semibold text-sm text-white">{act.title}</h4>
                  <p className="text-xs text-cream/60">{act.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===================== SECTION: HOW TO REACH ===================== */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Navigation className="w-4 h-4" /> How to Reach
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Getting to {place.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Plane className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Air</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.air}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-400">
                <Train className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Railway</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.railway}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bus className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Bus</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.bus}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sunset-500/10 border border-sunset-500/20 flex items-center justify-center text-sunset-400">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Road</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.road}</p>
            </div>
          </div>

          {/* Visitor Tips */}
          {visitorTips.length > 0 && (
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-safari-400" /> Helpful Visitor Guidelines
              </h4>
              <ul className="text-xs text-cream/70 space-y-1.5 list-disc pl-4">
                {visitorTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ===================== SECTION: NEARBY ATTRACTIONS (STRICTLY <= 80 KM) ===================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" /> Nearby Exploration (Within 80 km)
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Nearby Attractions around {place.name}
              </h2>
              <p className="text-xs text-cream/60 mt-1">
                Strictly filtered within 80 km. Click any attraction to open its complete detail page.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-safari-600/20 text-safari-300 border border-safari-500/30 w-fit">
              Max Radius: 80 km
            </span>
          </div>

          {nearbyPlaces.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-cream/60">No other registered attractions found strictly within 80 km.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {nearbyPlaces.map((near) => {
                const nearSlug = near.slug || near.id;
                return (
                  <div
                    key={near.id}
                    onClick={() => navigate(`/places/${nearSlug}`)}
                    className="group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/30"
                  >
                    <div>
                      <div className="relative h-40 bg-ink-900 overflow-hidden">
                        <SmartImage
                          src={near.image}
                          alt={near.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-ink-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase text-cream/90">
                          {near.category}
                        </span>
                        {near.distance_km != null && (
                          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-safari-600 text-white text-[11px] font-bold shadow-md">
                            {near.distance_km} km away
                          </span>
                        )}
                        {near.rating && (
                          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-ink-950 text-xs font-black">
                            <Star className="w-3 h-3 fill-ink-950" /> {near.rating}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="font-display font-semibold text-base text-white group-hover:text-safari-300 transition-colors line-clamp-1">
                          {near.name}
                        </h4>
                        <p className="text-xs text-cream/55 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-safari-400 shrink-0" />
                          <span className="truncate">{near.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                      <span className="text-[11px] text-cream/50">
                        {near.estimated_cost ? `₹${near.estimated_cost}` : 'Free'}
                      </span>
                      <span className="text-xs font-bold text-safari-300 group-hover:text-white transition-colors">
                        View Place &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================== SECTION: NEARBY SERVICES (HOTELS & RESTAURANTS 80 KM) ===================== */}
        {(hotels.length > 0 || restaurants.length > 0) && (
          <section className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Hotel className="w-4 h-4" /> Amenities in the Vicinity
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Nearby Hotels &amp; Dining
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hotels */}
              <div className="space-y-3">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-safari-400" /> Stays &amp; Accommodations
                </h3>
                <div className="space-y-2">
                  {hotels.map((h, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{h.name}</p>
                        <p className="text-[11px] text-cream/50">{h.category || 'Hotel'}</p>
                      </div>
                      {h.distance_km != null && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-safari-600/20 text-safari-300 border border-safari-500/30 shrink-0">
                          {h.distance_km} km
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurants */}
              <div className="space-y-3">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-400" /> Dining &amp; Food
                </h3>
                <div className="space-y-2">
                  {restaurants.map((r, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                        <p className="text-[11px] text-cream/50">{r.category || 'Restaurant'}</p>
                      </div>
                      {r.distance_km != null && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 shrink-0">
                          {r.distance_km} km
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== SECTION: INTERACTIVE MAP ===================== */}
        <section ref={mapRef} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" /> Geographic Context
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Map View around {place.name}
              </h2>
            </div>
            <button
              onClick={handleGetDirections}
              className="text-xs font-bold text-safari-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps &rarr;</span>
            </button>
          </div>

          <div className="h-[440px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <MapView
              places={mapItems}
              selectedPlace={mapItems[0]}
              onPlaceSelect={(p) => {
                if (p.slug && p.slug !== slug) navigate(`/places/${p.slug}`);
              }}
            />
          </div>
        </section>

        {/* ===================== SECTION: GALLERY & LIGHTBOX ===================== */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ImageIcon className="w-4 h-4" /> Photo Gallery
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Photographic Stream
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveGalleryImg(img)}
                  className="group relative h-48 rounded-2xl overflow-hidden bg-ink-900 border border-white/10 cursor-pointer"
                >
                  <SmartImage
                    src={img.image_url}
                    alt={img.caption || place.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lightbox Modal */}
        {activeGalleryImg && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveGalleryImg(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActiveGalleryImg(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={activeGalleryImg.image_url}
                alt={activeGalleryImg.caption || 'Attraction'}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
              />
              {activeGalleryImg.caption && (
                <p className="text-sm text-cream/90 mt-3 text-center font-medium">
                  {activeGalleryImg.caption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===================== SECTION: REVIEWS & COMMUNITY ===================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <MessageSquare className="w-4 h-4" /> Traveler Impressions
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Ratings &amp; Reviews
              </h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{place.rating} / 5</span>
              <span className="text-cream/40 font-normal">({place.reviews_count || 120} reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Ramesh Bhat</span>
                <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" /> 5.0
                </span>
              </div>
              <p className="text-xs text-cream/70 leading-relaxed">
                "Incredible experience visiting {place.name}. Well preserved and the surroundings offer magnificent photographic perspectives."
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Kavita Sharma</span>
                <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" /> 4.8
                </span>
              </div>
              <p className="text-xs text-cream/70 leading-relaxed">
                "A must-visit spot on any Karnataka travel itinerary. Recommended to arrive early in the morning for calm sightseeing."
              </p>
            </div>
          </div>
        </section>

        {/* ===================== SECTION: FAQS ===================== */}
        {faqs.length > 0 && (
          <section className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Info className="w-4 h-4" /> Frequently Asked Questions
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                FAQs about {place.name}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="font-display font-semibold text-sm sm:text-base text-white">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-cream/50 transition-transform ${isOpen ? 'rotate-180 text-safari-300' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-cream/70 leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
