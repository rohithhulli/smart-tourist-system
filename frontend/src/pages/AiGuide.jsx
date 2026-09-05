import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Route, Compass, MapPin, CheckCircle, ArrowRight,
  Shield, Clock, IndianRupee, Heart, Send, Bot, MessageSquare
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import PageHeader from '../components/PageHeader';

const GUIDE_PILLARS = [
  {
    title: 'Content-Aware Recommendations',
    desc: 'Our engine matches your chosen travel style (Relaxed, Adventure, Cultural, etc.) against authentic descriptions, verified timings and visitor sentiment.',
    badge: 'Smart Matching',
  },
  {
    title: 'Route-Optimized Itineraries',
    desc: 'Stops are clustered geographically across your route to eliminate backtracking, ensuring balanced morning, afternoon and evening visiting hours.',
    badge: 'Efficient Travel',
  },
  {
    title: 'Transparent Budgeting',
    desc: 'Calculates real entry costs, transit distances and hotel estimations so you can travel without hidden surprises.',
    badge: 'Budget Control',
  },
];

const SUGGESTED_PLANS = [
  {
    title: 'Classic Royal & Heritage Trail',
    startLocation: 'Bengaluru',
    destination: 'Mysuru',
    route: 'Bengaluru ➔ Srirangapatna ➔ Mysuru ➔ Belur',
    duration: '3 Days',
    durationDays: 3,
    budget: '₹14,000',
    tags: ['Heritage', 'Palaces', 'Temples'],
  },
  {
    title: 'Western Ghats & Coffee Escapes',
    startLocation: 'Bengaluru',
    destination: 'Coorg',
    route: 'Bengaluru ➔ Hassan ➔ Chikkamagaluru ➔ Coorg',
    duration: '4 Days',
    durationDays: 4,
    budget: '₹18,000',
    tags: ['Nature', 'Waterfalls', 'Hill Escapes'],
  },
  {
    title: 'Coastal Pilgrimage & Sunset Shores',
    startLocation: 'Mangaluru',
    destination: 'Gokarna',
    route: 'Mangaluru ➔ Udupi ➔ Murudeshwar ➔ Gokarna',
    duration: '4 Days',
    durationDays: 4,
    budget: '₹16,000',
    tags: ['Beaches', 'Temples', 'Food'],
  },
];

const QUICK_TIPS = [
  {
    q: 'Best season for Jog Falls?',
    a: 'Monsoon season (July to September) offers peak water discharge when the four cascades plunge down 253 meters in full roar.',
  },
  {
    q: 'When is Mysore Palace illuminated?',
    a: 'Every Sunday and public holiday from 7:00 PM to 8:00 PM, illuminated with nearly 100,000 incandescent bulbs.',
  },
  {
    q: 'How to reach Hampi ruins?',
    a: 'Nearest railhead is Hospet (13 km away) with regular trains from Bengaluru and Hyderabad. Coracles ferry passengers across the Tungabhadra.',
  },
  {
    q: 'Authentic local cuisine to try?',
    a: 'Mysore Pak and Mylari Dosa in Mysuru, Pandi Curry in Coorg, Neer Dosa and Ghee Roast in coastal Udupi/Mangaluru.',
  },
];

export default function AiGuide() {
  const navigate = useNavigate();
  const { updatePlanner } = useTrip();
  const [selectedTip, setSelectedTip] = useState(null);

  const handleStartSuggested = (plan) => {
    updatePlanner({
      startLocation: plan.startLocation,
      destination: plan.destination,
      durationDays: plan.durationDays,
    });
    navigate('/plan-trip');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      <PageHeader
        eyebrow="Intelligent Travel Assistant"
        title="ExploreIndiaAI Guide"
        subtitle="How our AI travel engine plans authentic, frictionless journeys across India."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Start AI Planner</span>
        </button>
      </PageHeader>

      {/* Guide Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GUIDE_PILLARS.map((pillar, i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-3 hover:border-safari-400/30 transition-all shadow-lg shadow-black/20"
          >
            <span className="px-3 py-1 rounded-full bg-safari-500/10 border border-safari-500/30 text-safari-300 text-[10px] font-bold uppercase tracking-wider">
              {pillar.badge}
            </span>
            <h3 className="font-display font-semibold text-xl text-white mt-1">
              {pillar.title}
            </h3>
            <p className="text-xs text-cream/70 leading-relaxed">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Suggested Travel Circuits */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400">Pre-Configured Circuits</p>
          <h2 className="font-display text-2xl font-semibold text-white mt-1">Suggested Travel Routes</h2>
          <p className="text-xs text-cream/60 mt-1">One-click starting points for your upcoming journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUGGESTED_PLANS.map((plan, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 hover:border-safari-400/40 bg-white/[0.02] p-6 space-y-4 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg shadow-black/20"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-safari-300 font-bold">{plan.duration}</span>
                  <span className="text-sunset-300 font-bold">{plan.budget}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-white">
                  {plan.title}
                </h3>
                <p className="text-xs text-cream/60 flex items-center gap-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-safari-400 shrink-0" />
                  <span>{plan.route}</span>
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {plan.tags.map((tag, t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-cream/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartSuggested(plan)}
                className="w-full py-2.5 px-4 rounded-full bg-safari-600/20 hover:bg-safari-600 text-safari-300 hover:text-white border border-safari-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Customize in Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Travel Knowledge & Quick Insights */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400">Local Travel Intelligence</p>
          <h2 className="font-display text-2xl font-semibold text-white mt-1">Curated Travel Knowledge</h2>
          <p className="text-xs text-cream/60 mt-1">Verified tips from our regional travel graph.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 hover:border-safari-400/30 transition-colors"
            >
              <h4 className="font-display text-sm font-bold text-safari-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-safari-400" />
                {tip.q}
              </h4>
              <p className="text-xs text-cream/75 leading-relaxed">{tip.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
