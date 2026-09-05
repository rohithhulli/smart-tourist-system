import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, Calendar, Clock, Compass, Route, Star, ArrowLeft,
  ChevronRight, Sparkles, Image as ImageIcon, Heart, Share2,
  Navigation, IndianRupee, Layers, Info, CheckCircle2, AlertCircle,
  ExternalLink, X, Utensils, Hotel, ShoppingBag, Landmark,
  Trees, Sun, Moon, Plane, Train, Bus, Car, ChevronDown, Award, Users, Check
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import SmartImage from '../components/SmartImage';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import MapView from '../components/MapView';
import { getDestinationBySlug, getDestinationPlaces, getDestinationEvents, getDestinationGallery, getDestinationReviews } from '../services/destinations';
import { getNearbyServices } from '../services/nearby';
import { getRecommendations } from '../services/recommendations';

export default function DestinationDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updatePlanner, openPlaceOnMap } = useTrip();

  const [destination, setDestination] = useState(null);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [addedPlaces, setAddedPlaces] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  const sectionRefs = {
    overview: useRef(null),
    places: useRef(null),
    things_to_do: useRef(null),
    food: useRef(null),
    hotels: useRef(null),
    restaurants: useRef(null),
    how_to_reach: useRef(null),
    map: useRef(null),
    events: useRef(null),
    gallery: useRef(null),
    ai_suggestions: useRef(null),
    faq: useRef(null),
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const dest = await getDestinationBySlug(slug);
        if (!dest) {
          if (isMounted) setError('Destination not found.');
          return;
        }

        if (isMounted) setDestination(dest);

        // Fetch dependent data in parallel
        const [placesData, eventsData, galleryData, reviewsData] = await Promise.all([
          getDestinationPlaces(slug).catch(() => []),
          getDestinationEvents(slug).catch(() => []),
          getDestinationGallery(slug).catch(() => []),
          getDestinationReviews(slug).catch(() => []),
        ]);

        if (isMounted) {
          setPlaces(placesData);
          setEvents(eventsData);
          setGallery(galleryData);
          setReviews(reviewsData);
        }

        // Fetch live nearby hotels & restaurants within 80km
        if (dest.latitude && dest.longitude) {
          getNearbyServices(dest.latitude, dest.longitude, 'hotels', 80)
            .then((res) => isMounted && setHotels(res.slice(0, 6)))
            .catch(() => {});

          getNearbyServices(dest.latitude, dest.longitude, 'restaurants', 80)
            .then((res) => isMounted && setRestaurants(res.slice(0, 6)))
            .catch(() => {});

          // Fetch ML recommendations for this destination
          getRecommendations({
            start_location: 'Bengaluru',
            destination: dest.name,
            budget: 15000,
            duration_days: 3,
            travelers: 2,
            traveler_type: 'solo',
            interests: ['Heritage', 'Culture', 'Sightseeing'],
          })
            .then((res) => isMounted && setAiRecs(res.recommendations || []))
            .catch(() => {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load destination information.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
    return () => { isMounted = false; };
  }, [slug]);

  const scrollToSection = (key) => {
    setActiveSection(key);
    const el = sectionRefs[key]?.current;
    if (el) {
      const yOffset = -80; // account for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${destination?.name} – ExploreIndiaAI`;
    const text = `Explore ${destination?.name} on ExploreIndiaAI: ${destination?.short_description}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handlePlanTripToDestination = () => {
    if (!destination) return;
    updatePlanner({
      destination: destination.name,
      stops: places.slice(0, 3).map((p) => p.name),
    });
    navigate('/plan-trip');
  };

  const handleAddPlaceToTrip = (place, e) => {
    e.stopPropagation();
    updatePlanner((prev) => {
      const exists = (prev.selectedPlaces || []).some((p) => (p.id || p.place_id) === (place.id || place.place_id));
      const nextList = exists
        ? prev.selectedPlaces
        : [...(prev.selectedPlaces || []), place];
      return { ...prev, selectedPlaces: nextList };
    });
    setAddedPlaces((prev) => ({ ...prev, [place.id || place.place_id]: true }));
    setTimeout(() => {
      setAddedPlaces((prev) => ({ ...prev, [place.id || place.place_id]: false }));
    }, 2500);
  };

  // Map markers: Destination center + places
  const mapItems = useMemo(() => {
    const items = [];
    if (destination?.latitude && destination?.longitude) {
      items.push({
        id: `dest-${destination.slug}`,
        name: destination.name,
        category: 'Destination',
        lat: destination.latitude,
        lng: destination.longitude,
        rating: destination.rating,
        image: destination.hero_image,
      });
    }
    places.forEach((p) => {
      if (p.latitude && p.longitude) {
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
        });
      }
    });
    return items;
  }, [destination, places]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Discovering regional heritage, attractions and routes..." />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState
          title="Destination Not Found"
          message={error || "We couldn't locate this destination in our catalog."}
          actionLabel="View All Destinations"
          onAction={() => navigate('/destinations')}
        />
      </div>
    );
  }

  const whyVisitItems = destination.why_visit || [];
  const thingsToDo = destination.things_to_do || [];
  const localFood = destination.local_food || [];
  const shoppingList = destination.shopping || [];
  const cultureFestivals = destination.culture_festivals || [];
  const howToReach = destination.how_to_reach || {};
  const bestTime = destination.best_time_details || {};
  const travelTips = destination.travel_tips || [];
  const faqs = destination.faqs || [];
  const nearbyDestinations = destination.nearby_destinations || [];

  return (
    <div className="bg-ink-950 text-cream min-h-screen">
      {/* Toast Alert for Share */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-safari-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-up">
          <Check className="w-4 h-4" /> Link copied to clipboard!
        </div>
      )}

      {/* ===================== HERO SECTION ===================== */}
      <div className="relative h-[65vh] min-h-[440px] max-h-[620px] w-full overflow-hidden bg-ink-900">
        <SmartImage
          src={destination.hero_image}
          alt={destination.name}
          className="w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/25" />

        {/* Top Breadcrumb */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-950/70 hover:bg-ink-900 border border-white/15 text-xs text-cream/80 hover:text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Destinations</span>
          </Link>
        </div>

        {/* Hero Bottom Meta & Actions */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl animate-fade-up">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-safari-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                {destination.category || 'Historic Region'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-cream/90 text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-safari-400" />
                {destination.district ? `${destination.district}, ` : ''}{destination.state}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-ink-950 text-xs font-black backdrop-blur-md flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-ink-950" />
                {destination.rating || 4.9}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-cream/90 text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center gap-1">
                <Clock className="w-3 h-3 text-safari-300" />
                {destination.suggested_duration || '3 Days / 2 Nights'}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight leading-none uppercase">
              {destination.name}
            </h1>
            <p className="font-display italic text-lg sm:text-xl text-safari-300/90 font-medium">
              {destination.tagline}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 animate-fade-up">
            <button
              onClick={() => setIsSaved(!isSaved)}
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
              onClick={handlePlanTripToDestination}
              className="px-5 py-3 rounded-2xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-xl shadow-safari-900/50 flex items-center gap-2"
            >
              <Route className="w-4 h-4" />
              <span>Add to Trip</span>
            </button>

            <button
              onClick={() => scrollToSection('map')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-safari-300" />
              <span>View Map</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md"
              title="Share destination"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== STICKY SECTION NAVIGATION ===================== */}
      <div className="sticky top-16 z-30 bg-ink-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'places', label: `Places (${places.length})` },
            { id: 'things_to_do', label: 'Things to Do' },
            { id: 'food', label: 'Food & Dining' },
            { id: 'hotels', label: 'Hotels' },
            { id: 'how_to_reach', label: 'How to Reach' },
            { id: 'map', label: 'Interactive Map' },
            { id: 'events', label: 'Events' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'ai_suggestions', label: 'AI Suggestions' },
            { id: 'faq', label: 'FAQ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-safari-600 text-white shadow-md shadow-safari-900/40'
                  : 'text-cream/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== MAIN CONTENT CONTAINER ===================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16">
        {/* SECTION: OVERVIEW / ABOUT */}
        <section ref={sectionRefs.overview} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider">
                <Info className="w-4 h-4" /> About {destination.name}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
                {destination.short_description}
              </h2>
              <p className="text-sm sm:text-base text-cream/75 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Travel Essentials Card */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 h-fit">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-safari-400" /> Travel Essentials
              </h3>
              <div className="divide-y divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50">State</span>
                  <span className="font-semibold text-white">{destination.state}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50">District</span>
                  <span className="font-semibold text-white">{destination.district || 'Heritage Region'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50">Best Season</span>
                  <span className="font-semibold text-safari-300">{destination.best_time || 'Oct – Mar'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50">Attractions Registered</span>
                  <span className="font-semibold text-white">{places.length} Places</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-cream/50">Recommended Stay</span>
                  <span className="font-semibold text-white">{destination.suggested_duration}</span>
                </div>
              </div>

              <button
                onClick={handlePlanTripToDestination}
                className="w-full py-2.5 rounded-xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/30 flex items-center justify-center gap-2 mt-2"
              >
                <Route className="w-3.5 h-3.5" />
                <span>Build Itinerary for {destination.name}</span>
              </button>
            </div>
          </div>

          {/* WHY VISIT CARDS */}
          {whyVisitItems.length > 0 && (
            <div className="pt-6">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Why Visit {destination.name}?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {whyVisitItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-safari-500/40 hover:bg-white/[0.04] transition-all space-y-2 group"
                  >
                    <span className="inline-block px-2 py-0.5 rounded-md bg-safari-500/10 border border-safari-500/20 text-[10px] font-bold text-safari-300 uppercase">
                      {item.tag}
                    </span>
                    <h4 className="font-display font-semibold text-sm text-white group-hover:text-safari-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-cream/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY & HERITAGE CHRONICLE */}
          {destination.history && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 border border-white/10 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sunset-400 text-xs font-bold uppercase tracking-wider">
                  <Landmark className="w-4 h-4" /> Historical Chronicle
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Centuries of Art, Royalty &amp; Legacy
                </h3>
                <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                  {destination.history}
                </p>
              </div>
              <div className="w-full md:w-72 h-44 rounded-2xl overflow-hidden bg-ink-800 shrink-0 border border-white/10">
                <SmartImage
                  src={destination.hero_image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </section>

        {/* ===================== SECTION: POPULAR & ALL PLACES ===================== */}
        <section ref={sectionRefs.places} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" /> Sightseeing &amp; Landmarks
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Tourist Places in {destination.name}
              </h2>
              <p className="text-xs text-cream/60 mt-1">
                Click any attraction card to view its complete photo gallery, history, opening hours, and entry details.
              </p>
            </div>
            <span className="text-xs text-safari-300 font-semibold bg-safari-900/30 border border-safari-500/20 px-3 py-1 rounded-full w-fit">
              {places.length} Attractions Mapped
            </span>
          </div>

          {places.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10">
              <p className="text-sm text-cream/60">No tourist places currently listed for this destination.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {places.map((place) => {
                const placeSlug = place.slug || place.id;
                const isAdded = Boolean(addedPlaces[place.id || place.place_id]);

                return (
                  <div
                    key={place.id}
                    onClick={() => navigate(`/places/${placeSlug}`)}
                    className="group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/30"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-44 bg-ink-900 overflow-hidden">
                        <SmartImage
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none" />

                        {place.category && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-ink-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-cream/90">
                            {place.category}
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

                    {/* Card Actions */}
                    <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-white/5 mt-2">
                      <span className="text-[11px] font-medium text-safari-300">
                        {place.estimated_cost != null && Number(place.estimated_cost) > 0
                          ? `₹${Number(place.estimated_cost)}`
                          : 'Free Entry'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleAddPlaceToTrip(place, e)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isAdded
                              ? 'bg-safari-500 text-ink-950'
                              : 'bg-white/5 hover:bg-safari-600 hover:text-white text-cream/70 border border-white/10'
                          }`}
                        >
                          {isAdded ? <Check className="w-3 h-3" /> : '+'}
                          <span>{isAdded ? 'Added' : 'Trip'}</span>
                        </button>

                        <span className="text-xs font-semibold text-safari-300 group-hover:text-white transition-colors">
                          View &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================== SECTION: THINGS TO DO ===================== */}
        {thingsToDo.length > 0 && (
          <section ref={sectionRefs.things_to_do} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Experiences &amp; Activities
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Top Things to Do in {destination.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {thingsToDo.map((act, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-safari-500/40 hover:bg-white/[0.04] transition-all space-y-2 group"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-safari-600/20 text-safari-300 text-[10px] font-bold uppercase">
                    {act.badge}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-safari-300 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-cream/65 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== SECTION: LOCAL FOOD & SHOPPING ===================== */}
        <section ref={sectionRefs.food} className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Utensils className="w-4 h-4" /> Culinary Delights &amp; Bazaars
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Taste &amp; Shop {destination.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Local Food */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" /> Signature Dishes
              </h3>
              <div className="space-y-3">
                {localFood.map((dish, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display text-base font-semibold text-white">{dish.name}</h4>
                      <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md font-semibold">
                        {dish.origin}
                      </span>
                    </div>
                    <p className="text-xs text-cream/60">{dish.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopping & Crafts */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-safari-400" /> Famous Markets &amp; Souvenirs
              </h3>
              <div className="space-y-3">
                {shoppingList.map((shop, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display text-base font-semibold text-white">{shop.name}</h4>
                      <span className="text-[10px] text-safari-300 bg-safari-500/10 px-2 py-0.5 rounded-md font-semibold">
                        {shop.type}
                      </span>
                    </div>
                    <p className="text-xs text-cream/60">{shop.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION: HOTELS & RESTAURANTS (REAL NEARBY 80 KM) ===================== */}
        <section ref={sectionRefs.hotels} className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Hotel className="w-4 h-4" /> Stays &amp; Dining (Within 80 km)
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Where to Stay &amp; Dine
            </h2>
            <p className="text-xs text-cream/60 mt-1">
              Live accommodations and restaurants mapped within the 80 km regional vicinity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hotels */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Hotel className="w-4 h-4 text-safari-400" /> Recommended Stays
              </h3>
              {hotels.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-cream/50 text-center">
                  Scanning live hotels within 80 km radius...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {hotels.map((h, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{h.name}</h4>
                        <p className="text-xs text-cream/50">{h.category || 'Hotel / Resort'}</p>
                      </div>
                      {h.distance_km != null && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-safari-600/20 text-safari-300 border border-safari-500/20 shrink-0">
                          {h.distance_km} km away
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Restaurants */}
            <div ref={sectionRefs.restaurants} className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" /> Popular Restaurants &amp; Cafes
              </h3>
              {restaurants.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-cream/50 text-center">
                  Scanning dining spots within 80 km radius...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {restaurants.map((r, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{r.name}</h4>
                        <p className="text-xs text-cream/50">{r.category || 'Restaurant / Cafe'}</p>
                      </div>
                      {r.distance_km != null && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
                          {r.distance_km} km away
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================== SECTION: HOW TO REACH ===================== */}
        <section ref={sectionRefs.how_to_reach} className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Navigation className="w-4 h-4" /> Transit &amp; Access
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              How to Reach {destination.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Plane className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Air</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.air || 'Connected via nearest domestic & international airports.'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-400">
                <Train className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Railway</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.railway || 'Regular express and passenger trains from major cities.'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bus className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Bus</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.bus || 'State KSRTC AC sleeper and interstate private coaches.'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sunset-500/10 border border-sunset-500/20 flex items-center justify-center text-sunset-400">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white">By Road</h4>
              <p className="text-xs text-cream/65 leading-relaxed">{howToReach.road || 'National and state expressways with scenic highways.'}</p>
            </div>
          </div>

          {/* Best Time & Tips Strip */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-display font-bold text-base text-white mb-2 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Best Time to Visit
              </h4>
              <p className="text-xs text-cream/70 leading-relaxed mb-2">
                <strong className="text-white">Optimal Season:</strong> {bestTime.months || destination.best_time}
              </p>
              <p className="text-xs text-cream/60 leading-relaxed">
                {bestTime.weather}
              </p>
            </div>

            <div>
              <h4 className="font-display font-bold text-base text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-safari-400" /> Visitor Tips
              </h4>
              <ul className="text-xs text-cream/70 space-y-1.5 list-disc pl-4">
                {travelTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===================== SECTION: INTERACTIVE MAP ===================== */}
        <section ref={sectionRefs.map} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" /> Interactive Geography
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Explore {destination.name} on the Map
              </h2>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-safari-300 hover:text-white transition-colors"
            >
              Open Full Screen Map &rarr;
            </button>
          </div>

          <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <MapView
              places={mapItems}
              selectedPlace={mapItems[0]}
              onPlaceSelect={(p) => {
                if (p.slug) navigate(`/places/${p.slug}`);
              }}
            />
          </div>
        </section>

        {/* ===================== SECTION: EVENTS ===================== */}
        {events.length > 0 && (
          <section ref={sectionRefs.events} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sunset-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" /> Cultural Calendar
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Upcoming Events &amp; Festivals
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] flex flex-col justify-between"
                >
                  <div>
                    {ev.image_url && (
                      <div className="h-44 bg-ink-900 overflow-hidden">
                        <SmartImage src={ev.image_url} alt={ev.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-sunset-500/10 border border-sunset-500/20 text-sunset-300 text-[10px] font-bold uppercase">
                        {ev.date}
                      </span>
                      <h3 className="font-display text-lg font-bold text-white">{ev.name}</h3>
                      <p className="text-xs text-cream/65 leading-relaxed">{ev.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== SECTION: GALLERY & LIGHTBOX ===================== */}
        {gallery.length > 0 && (
          <section ref={sectionRefs.gallery} className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ImageIcon className="w-4 h-4" /> Photo Gallery
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Visual Impressions of {destination.name}
                </h2>
              </div>
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
                    alt={img.caption || destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-ink-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-xs text-white font-medium line-clamp-2">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Lightbox Modal */}
        {activeGalleryImg && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveGalleryImg(null)}
          >
            <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActiveGalleryImg(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={activeGalleryImg.image_url}
                alt={activeGalleryImg.caption || 'Destination'}
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

        {/* ===================== SECTION: AI TRAVEL SUGGESTIONS (ML ENGINE) ===================== */}
        {aiRecs.length > 0 && (
          <section ref={sectionRefs.ai_suggestions} className="space-y-6 pt-4">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Smart Recommendations
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                AI Curated Itinerary Picks for {destination.name}
              </h2>
              <p className="text-xs text-cream/60 mt-1">
                Generated dynamically by the ExploreIndiaAI recommendation engine based on traveler ratings and connectivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {aiRecs.slice(0, 3).map((rec, idx) => {
                const p = rec.place || rec;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(`/places/${p.slug || p.id}`)}
                    className="group cursor-pointer rounded-3xl overflow-hidden border border-safari-500/30 bg-safari-950/15 p-5 space-y-3 hover:border-safari-400 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded-md bg-safari-500/20 text-safari-300 text-[10px] font-bold uppercase">
                          {p.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.rating}
                        </span>
                      </div>
                      <h4 className="font-display font-semibold text-base text-white group-hover:text-safari-300 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs text-cream/70 line-clamp-2">
                        {rec.match_reason || p.description}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-safari-400 flex items-center gap-1">
                      <span>Explore Place</span> &rarr;
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===================== SECTION: NEARBY DESTINATIONS ===================== */}
        {nearbyDestinations.length > 0 && (
          <section className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" /> Next Stops on the Circuit
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Nearby Destinations to Combine
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {nearbyDestinations.map((dest, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/destinations/${dest.slug}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all hover:-translate-y-1"
                >
                  <div className="h-36 bg-ink-900 overflow-hidden relative">
                    <SmartImage src={dest.hero_image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white">{dest.name}</span>
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-ink-950/80 text-safari-300 border border-white/15">
                      {dest.distance_km} km
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between text-xs text-cream/60">
                    <span>{dest.category}</span>
                    <span className="font-semibold text-safari-300 group-hover:text-white">View &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== SECTION: FAQ ===================== */}
        {faqs.length > 0 && (
          <section ref={sectionRefs.faq} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-safari-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Info className="w-4 h-4" /> Common Questions
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Frequently Asked Questions about {destination.name}
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
