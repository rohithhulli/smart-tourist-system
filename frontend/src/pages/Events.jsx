import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Route, ArrowRight, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SmartImage from '../components/SmartImage';

const EVENTS = [
  {
    name: 'Mysuru Dasara 2026',
    date: '18–28 Oct 2026',
    location: 'Mysuru',
    category: 'Royal Festival',
    desc: 'The famed 10-day celebration featuring illuminated palace displays, cultural dance pageants and the magnificent Jumboo Savari procession.',
    img: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80',
    venue: 'Mysuru Palace & Chamundi Hills',
  },
  {
    name: 'Hampi Heritage Conclave',
    date: '3–6 Nov 2026',
    location: 'Hampi',
    category: 'Culture & Arts',
    desc: 'A vibrant gathering of classical music, sound & light shows against the monolithic boulder ruins of the Vijayanagara Empire.',
    img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    venue: 'Virupaksha Temple Complex',
  },
  {
    name: 'Coorg Coffee Festival',
    date: '21–23 Dec 2026',
    location: 'Madikeri, Kodagu',
    category: 'Food & Harvest',
    desc: 'Celebrating winter coffee harvesting with plantation walks, artisanal roasts, Kodava folk cuisine and tribal music.',
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    venue: 'Madikeri Estates',
  },
  {
    name: 'Gokarna Beach & Yoga Retreat',
    date: '14–17 Jan 2027',
    location: 'Gokarna',
    category: 'Wellness & Nature',
    desc: 'Sunrise yoga sessions on Om Beach, Ayurvedic wellness workshops and peaceful sunset meditation along the cliffs.',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    venue: 'Om Beach Shoreline',
  },
  {
    name: 'Kambala Buffalo Race',
    date: '10–12 Feb 2027',
    location: 'Mangaluru / Udupi',
    category: 'Folk Sport',
    desc: 'Thrilling traditional paddy field buffalo racing representing the agrarian spirit and coastal folklore of Tulunadu.',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    venue: 'Coastal Coastal Tracks',
  },
  {
    name: 'Pattadakal Dance Festival',
    date: '27–29 Jan 2027',
    location: 'Pattadakal, Badami',
    category: 'Classical Dance',
    desc: 'National classical dancers performing Bharatanatyam, Kathak and Kuchipudi against 7th-century Chalukya stone temples.',
    img: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80',
    venue: 'Mallikarjuna Temple Enclosure',
  },
];

export default function Events() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <PageHeader
        eyebrow="Cultural Calendar"
        title="Festivals &amp; Events"
        subtitle="Time your travels around Karnataka's most vibrant celebrations, heritage conclaves and seasons."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Plan Around Events</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EVENTS.map((event) => (
          <div
            key={event.name}
            className="group rounded-3xl overflow-hidden border border-white/10 hover:border-sunset-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/30"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-ink-900">
                <SmartImage
                  src={event.img}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />

                <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-sunset-500 text-ink-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  {event.category}
                </span>

                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 text-xs font-semibold text-sunset-300">
                  <CalendarDays className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="font-display font-semibold text-xl text-white group-hover:text-sunset-200 transition-colors">
                  {event.name}
                </h3>
                <p className="text-xs text-cream/55 flex items-center gap-1.5 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-sunset-400 shrink-0" />
                  <span>{event.location} · {event.venue}</span>
                </p>
                <p className="text-xs text-cream/70 leading-relaxed min-h-[48px]">
                  {event.desc}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/nearby', { state: { category: 'all' } })}
                className="text-xs font-semibold text-cream/60 hover:text-white transition-colors"
              >
                Explore City
              </button>

              <button
                type="button"
                onClick={() => navigate('/plan-trip')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sunset-500/20 hover:bg-sunset-500 text-sunset-300 hover:text-ink-950 border border-sunset-500/40 text-xs font-bold transition-all"
              >
                <span>Plan Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
