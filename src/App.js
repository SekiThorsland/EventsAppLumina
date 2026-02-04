import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Music, 
  Code, 
  Palette, 
  Trophy, 
  ArrowRight, 
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  Mail,
  User,
  Send,
  Clock,
  Zap,
  Flame,
  Plus,
  Trash2,
  Settings,
  Lock,
  Loader2,
  Database,
  Filter,
  Heart,
  Search,
  Share2,
  CalendarPlus,
  CheckCircle,
  AlertCircle,
  Mic2,
  Users,
  ListMusic
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query
} from 'firebase/firestore';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyCKzwU2mU9BIP0SZqRtXRkTzwLN5uUTLJw",
  authDomain: "eventslumina.firebaseapp.com",
  projectId: "eventslumina",
  storageBucket: "eventslumina.firebasestorage.app",
  messagingSenderId: "703320205451",
  appId: "1:703320205451:web:df78470c6b5bf00f9dcc8e",
  measurementId: "G-GFB53TGP3F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Constants ---

const CATEGORIES = [
  { id: 'all', label: 'All Vibes', icon: Sparkles },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'sports', label: 'Action', icon: Trophy },
];

const INITIAL_EVENTS = [
  {
    title: "Belgrade Beer Fest",
    date: "15-08-2024",
    endDate: "18-08-2024",
    time: "18:00",
    location: "Ušće Park",
    city: "Belgrade",
    price: "Free",
    category: "music",
    featured: true,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    description: "Experience the best of beer and music at one of the biggest festivals in Southeast Europe.",
    highlights: ["Over 50 breweries", "Fun Park", "Silent Disco"],
    dailySchedule: [
      { day: "Day 1 (Aug 15)", guests: ["Van Gogh", "Riblja Čorba"] },
      { day: "Day 2 (Aug 16)", guests: ["S.A.R.S.", "Who See", "Sunshine"] },
      { day: "Day 3 (Aug 17)", guests: ["Bajaga i Instruktori", "Neverne Bebe"] },
      { day: "Day 4 (Aug 18)", guests: ["Love Hunters", "Ortodox Celts"] }
    ]
  },
  {
    title: "EXIT Festival",
    date: "10-07-2024",
    endDate: "14-07-2024",
    time: "20:00",
    location: "Petrovaradin Fortress",
    city: "Novi Sad",
    price: "$120",
    category: "music",
    featured: true,
    image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2070&auto=format&fit=crop",
    description: "Join music lovers from around the world at the award-winning summer music festival.",
    highlights: ["Dance Arena", "Sunrise Views", "Camping Village"],
    dailySchedule: [
      { day: "Day 1", guests: ["The Prodigy", "Viagra Boys"] },
      { day: "Day 2", guests: ["Skrillex", "Epica"] },
      { day: "Day 3", guests: ["Alessesso", "Sofi Tukker"] },
      { day: "Day 4", guests: ["Wu-Tang Clan", "Dimitri Vegas & Like Mike"] }
    ]
  },
  {
    title: "Belgrade Design Week",
    date: "05-10-2024",
    time: "10:00",
    location: "Dorćol Platz",
    city: "Belgrade",
    price: "$35",
    category: "art",
    featured: true,
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop",
    description: "A showcase of cutting-edge design, innovation, and creative thinking in the heart of Belgrade.",
    guests: ["Karim Rashid", "Bjarke Ingels"],
    highlights: ["Interactive Workshops", "Pop-up Galleries"]
  }
];

// --- Helpers ---

// Robustly parses dates, handling both YYYY-MM-DD and DD-MM-YYYY
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Handle DD-MM-YYYY format specifically
  if (typeof dateStr === 'string') {
    // Check for DD-MM-YYYY (or DD/MM/YYYY)
    const match = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (match) {
      // Month is 0-indexed in JS Date (0 = Jan, 11 = Dec)
      return new Date(match[3], match[2] - 1, match[1]);
    }
  }
  
  // Fallback to standard ISO format
  return new Date(dateStr);
};

// Formats date string for display
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // If it's already in DD-MM-YYYY format, return it as is
  if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) return dateStr;
  
  try {
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0'); 
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  } catch (e) {
    return dateStr;
  }
};

const formatDateRange = (startStr, endStr) => {
  const start = formatDate(startStr);
  if (!endStr) return start;
  
  const end = formatDate(endStr);
  const startParts = start.split('-');
  const endParts = end.split('-');
  
  // If same year
  if (startParts[2] === endParts[2]) {
     // If same month
     if (startParts[1] === endParts[1]) {
       return `${startParts[0]} - ${endParts[0]}.${startParts[1]}.${startParts[2]}`;
     }
     return `${startParts[0]}.${startParts[1]} - ${endParts[0]}.${endParts[1]}.${endParts[2]}`;
  }
  return `${start} - ${end}`;
};

// Helper to handle both Array and String inputs from DB
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return data.split(',').map(item => item.trim());
  return [];
};

// --- Components ---

const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const { current } = domRef;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-500 cubic-bezier(0.17, 0.55, 0.55, 1) ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Navbar = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navStyle, setNavStyle] = useState({
    backgroundColor: 'rgba(0, 0, 0, 0)',
    paddingTop: '24px',
    paddingBottom: '24px',
    borderColor: 'transparent',
    boxShadow: 'none',
    backdropFilter: 'blur(0px)'
  });

  const navLinkClass = (page) => `cursor-pointer transition-all duration-300 ${currentPage === page ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-slate-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(167,139,250,0.8)]'}`;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const start = 20; 
      const end = 150; 
      
      let progress = 0;
      if (scrollY > start) {
        progress = Math.min(1, (scrollY - start) / (end - start));
      }

      setNavStyle({
        backgroundColor: `rgba(0, 0, 0, ${progress * 0.8})`,
        paddingTop: `${24 - (8 * progress)}px`,
        paddingBottom: `${24 - (8 * progress)}px`,
        borderColor: `rgba(255, 255, 255, ${progress * 0.1})`,
        boxShadow: `0 0 30px rgba(139, 92, 246, ${progress * 0.15})`,
        backdropFilter: `blur(${progress * 12}px)`,
        WebkitBackdropFilter: `blur(${progress * 12}px)`
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className="fixed w-full z-50 border-b"
      style={navStyle}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
            <div className="relative w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10">
              <Zap className="text-fuchsia-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-indigo-400 tracking-tight">
            EVENTS IN SERBIA
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <span onClick={() => onNavigate('home')} className={navLinkClass('home')}>Home</span>
          <span onClick={() => onNavigate('events')} className={navLinkClass('events')}>Events</span>
          <span onClick={() => onNavigate('contact')} className={navLinkClass('contact')}>Contact</span>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white hover:text-fuchsia-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 animate-fade-in shadow-2xl z-50">
          <span onClick={() => {onNavigate('home'); setIsOpen(false)}} className="text-white text-lg font-bold hover:text-fuchsia-400 py-2 cursor-pointer border-b border-white/5">Home</span>
          <span onClick={() => {onNavigate('events'); setIsOpen(false)}} className="text-white text-lg font-bold hover:text-fuchsia-400 py-2 cursor-pointer border-b border-white/5">Events</span>
          <span onClick={() => {onNavigate('contact'); setIsOpen(false)}} className="text-white text-lg font-bold hover:text-fuchsia-400 py-2 cursor-pointer border-b border-white/5">Contact</span>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-16">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/30 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <div className="group cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] animate-fade-in-up">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500"></span>
          </span>
          <span className="text-white text-sm font-bold tracking-widest uppercase">The Future is Now</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter animate-fade-in-up mix-blend-screen">
          IGNITE YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 animate-gradient-x">SENSES</span>
        </h1>
        
        <p className="text-slate-300 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up font-light">
          Don't just watch. <span className="text-white font-bold">Experience.</span> Access the most exclusive festivals, underground summits, and avant-garde exhibitions in Serbia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up w-full max-w-lg mx-auto">
          <button 
            onClick={() => onNavigate('events')}
            className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(192,38,211,0.5)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group border border-white/10"
          >
            Find Your Vibe
            <Flame className="w-5 h-5 group-hover:text-yellow-300 transition-colors animate-pulse" />
          </button>
          <button 
            onClick={() => onNavigate('events')}
            className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border border-white/20 text-white font-bold text-lg hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            View Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ event, onClick, isFavorite, onToggleFavorite }) => {
  // Fallback for extraction if 'city' is missing from DB
  const locationStr = event.location || '';
  const displayCity = event.city || (locationStr.includes(',') ? locationStr.split(',').pop().trim() : 'Unknown');
  const displayLocation = event.city ? locationStr : (locationStr.split(',')[0].trim() || 'Location TBD');
  
  // Use the helper to parse date safely
  const dateObj = parseDate(event.date);
  const monthName = dateObj.toLocaleString('default', { month: 'short' });
  const dayNumber = dateObj.getDate();

  return (
    <div 
      onClick={() => onClick(event)}
      style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
      className="group relative bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden hover:border-fuchsia-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(192,38,211,0.15)] h-full flex flex-col cursor-pointer transform hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80" />
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 group-hover:border-fuchsia-500/30 transition-colors">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
            {event.category}
          </span>
        </div>

        {/* Heart / Favorite Button */}
        <button 
          onClick={(e) => onToggleFavorite(e, event.id)}
          className="absolute top-4 left-4 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group/heart"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-fuchsia-500 text-fuchsia-500' : 'text-white group-hover/heart:text-fuchsia-400'}`} 
          />
        </button>

      </div>

      {/* Content */}
      <div className="p-8 relative z-20 -mt-20 flex flex-col flex-grow">
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[70px] text-center group-hover:bg-fuchsia-900/20 group-hover:border-fuchsia-500/30 transition-all h-fit">
            <span className="text-xs text-fuchsia-400 font-bold uppercase mb-1">{monthName}</span>
            <span className="text-2xl font-black text-white">{dayNumber}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-fuchsia-300 transition-colors">{event.title}</h3>
            
            {/* New City/Location Layout */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MapPin className="w-4 h-4 text-fuchsia-500" />
                {displayCity}
              </div>
              <div className="text-slate-400 text-xs ml-6">
                {displayLocation}
              </div>
            </div>

          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed flex-grow border-l-2 border-white/10 pl-4 group-hover:border-fuchsia-500/50 transition-colors">
          {event.description}
        </p>
      </div>
    </div>
  );
};

const EventDetailPage = ({ event, onBack, isFavorite, onToggleFavorite, events = [], onNavigate }) => {
  if (!event) return null;

  // Determine section labels based on category
  const guestLabel = {
    music: 'Lineup',
    tech: 'Speakers',
    art: 'Featured Artists',
    sports: 'Competitors',
    all: 'Special Guests'
  }[event.category] || 'Special Guests';

  // SAFEGUARDS for Arrays, and fallback to parsing strings
  const guests = ensureArray(event.guests || event.lineup || event.speakers);
  
  // PARSE DAILY SCHEDULE ROBUSTLY
  let dailySchedule = [];
  if (Array.isArray(event.dailySchedule)) {
      dailySchedule = event.dailySchedule;
  } else if (event.dailySchedule && typeof event.dailySchedule === 'object') {
      // Handle Object/Map case from Firestore (e.g. { "Day 1": ["A", "B"], "Day 2": ["C"] })
      // OR { "0": {day: "Day 1", guests: []} }
      dailySchedule = Object.keys(event.dailySchedule).map(key => {
          const value = event.dailySchedule[key];
          // Check if the value looks like a schedule item object {day:..., guests:...}
          if (value.guests) {
              return value; 
          }
          // Otherwise assume key is the day name and value is the guests (array or string)
          return { day: key, guests: value };
      });
      // Optional: Sort by key to maintain day order if keys are sortable
      dailySchedule.sort((a, b) => a.day.localeCompare(b.day));
  }
  
  // Custom highlights or defaults
  const highlights = event.highlights && ensureArray(event.highlights).length > 0 
    ? ensureArray(event.highlights) 
    : [
      "Exclusive access to VIP zones",
      "Backstage opportunities",
      "Meet & Greet sessions"
    ];

  const relatedEvents = events
    .filter(e => e.category === event.category && e.id !== event.id)
    .slice(0, 3);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Events in Serbia!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Link copied to clipboard!");
    }
  };

  const handleAddToCalendar = () => {
    const startDate = parseDate(event.date);
    const isoDate = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${isoDate}/${isoDate}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black animate-fade-in pb-20">
      {/* Immersive Hero */}
      <div className="relative min-h-[70vh] w-full overflow-hidden flex flex-col justify-between">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-10" />
            <img src={event.image} alt={event.title} className="w-full h-full object-cover animate-pulse-slow" style={{ animationDuration: '20s' }} />
        </div>

        {/* Navigation (Top) */}
        <div className="relative z-50 px-6 pt-28 flex justify-between container mx-auto">
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-fuchsia-600 hover:text-white transition-all border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold">Back to Vibes</span>
          </button>

          <div className="flex gap-3">
             <button 
              onClick={handleAddToCalendar}
              className="group hidden sm:flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-indigo-600 transition-all border border-white/10"
            >
              <CalendarPlus className="w-5 h-5" />
              <span className="font-bold">Add to Calendar</span>
            </button>
             <button 
              onClick={(e) => onToggleFavorite(e, event.id)}
              className="group flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-white/10 transition-all border border-white/10"
            >
              <Heart 
                className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-fuchsia-500 text-fuchsia-500' : 'text-white'}`} 
              />
              <span className="font-bold">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Content (Bottom) */}
        <div className="relative z-20 pb-20 pt-32 bg-gradient-to-t from-black via-black/90 to-transparent mt-auto">
          <div className="container mx-auto px-6">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="max-w-4xl">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/30 backdrop-blur-sm mb-6 w-fit animate-fade-in-up">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-fuchsia-300 text-sm font-bold tracking-widest uppercase">{event.category}</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none tracking-tight animate-fade-in-up delay-100">{event.title}</h1>
                 <div className="flex flex-wrap gap-8 text-slate-300 animate-fade-in-up delay-200">
                   <div className="flex items-center gap-3">
                     <Calendar className="w-6 h-6 text-fuchsia-500" />
                     {/* Updated Date Format Display */}
                     <span className="text-lg font-medium">{formatDateRange(event.date, event.endDate)}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <Clock className="w-6 h-6 text-fuchsia-500" />
                     <span className="text-lg font-medium">{event.time}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <MapPin className="w-6 h-6 text-fuchsia-500" />
                     <span className="text-lg font-medium">{event.location}, {event.city || ''}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <ScrollReveal>
             <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-fuchsia-500 pl-6">THE EXPERIENCE</h2>
             <div className="prose prose-invert prose-lg max-w-none">
               <p className="text-slate-300 text-xl leading-relaxed mb-8 font-light">
                 {event.description}
               </p>
               
               {/* Dynamic Highlights Section */}
               {highlights.length > 0 && (
                <div className="my-12 p-8 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-3xl border border-white/5">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-400" /> Event Highlights
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-4 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                        </div>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
               )}
               
               {/* Daily Schedule Section (New) */}
               {dailySchedule.length > 0 && (
                 <div className="my-12">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                     <ListMusic className="w-6 h-6 text-fuchsia-400" /> Schedule
                   </h3>
                   <div className="space-y-6">
                     {dailySchedule.map((day, idx) => (
                       <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                         <h4 className="text-lg font-bold text-fuchsia-400 mb-3">{day.day || `Day ${idx + 1}`}</h4>
                         <div className="flex flex-wrap gap-3">
                            {ensureArray(day.guests).map((guest, gIdx) => (
                              <span key={gIdx} className="text-slate-300 text-sm font-medium bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                {guest}
                              </span>
                            ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Dynamic Guests/Lineup Section (Fallback if no daily schedule) */}
               {guests.length > 0 && dailySchedule.length === 0 && (
                 <div className="my-12">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                     <Mic2 className="w-6 h-6 text-fuchsia-400" /> {guestLabel}
                   </h3>
                   <div className="flex flex-wrap gap-4">
                     {guests.map((guest, idx) => (
                       <span key={idx} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                         {guest}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
             </div>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <ScrollReveal delay={200}>
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 sticky top-32">
              <h3 className="text-xl font-bold text-white mb-6">Event Details</h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                   <User className="w-5 h-5 text-slate-500 mt-1" />
                   <div>
                     <p className="text-slate-400 text-sm font-bold uppercase">Organizer</p>
                     <p className="text-white font-medium">{event.organizer || 'Events in Serbia'}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <Ticket className="w-5 h-5 text-slate-500 mt-1" />
                   <div>
                     <p className="text-slate-400 text-sm font-bold uppercase">Capacity</p>
                     <p className="text-white font-medium">{event.capacity || 'Limited (500 Left)'}</p>
                   </div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                 <p className="text-slate-500 text-sm mb-4 text-center">Share this event</p>
                 <div className="flex justify-center gap-4">
                   <button onClick={handleShare} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors flex items-center gap-2">
                     <Share2 className="w-4 h-4" /> Share
                   </button>
                   <button onClick={handleAddToCalendar} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors flex items-center gap-2">
                     <CalendarPlus className="w-4 h-4" /> Add to Cal
                   </button>
                 </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      
      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
         <div className="container mx-auto px-6 mt-32">
           <ScrollReveal>
             <h2 className="text-3xl font-black text-white mb-10">YOU MIGHT ALSO LIKE</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {relatedEvents.map((relatedEvent, idx) => (
                 <EventCard 
                   key={relatedEvent.id || idx}
                   event={relatedEvent}
                   onClick={() => onNavigate('event-detail', relatedEvent)}
                   isFavorite={false} 
                   onToggleFavorite={() => {}}
                 />
               ))}
             </div>
           </ScrollReveal>
         </div>
      )}

    </div>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-32 relative overflow-hidden" id="contact">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-indigo-900/20 via-black to-black -z-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <ScrollReveal delay={100}>
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-600 to-orange-500 flex items-center justify-center shadow-lg shadow-fuchsia-900/50">
                  <Mail className="text-white w-6 h-6" />
                </div>
                <span className="text-fuchsia-400 font-bold tracking-widest uppercase text-sm">Get in Touch</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                LET'S MAKE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-orange-400">MAGIC HAPPEN</span>
              </h2>
              <p className="text-slate-400 mb-10 text-xl leading-relaxed">
                Got a crazy idea for an event? Want to partner with the best? Or just want to say hi? We're listening.
              </p>
              
              <div className="space-y-6">
                <div className="group flex items-center gap-6 text-slate-300 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-fuchsia-600/20 group-hover:text-fuchsia-400 transition-all">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase mb-1">Email Us</p>
                    <p className="text-xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">hello@eventsinserbia.rs</p>
                  </div>
                </div>
                <div className="group flex items-center gap-6 text-slate-300 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-fuchsia-600/20 group-hover:text-fuchsia-400 transition-all">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase mb-1">HQ</p>
                    <p className="text-xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">100 Future Way, Tech City</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-orange-600 rounded-3xl blur-2xl opacity-20 animate-pulse-slow"></div>
              <form className="relative bg-black/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl" onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Your Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Cyber Punk" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Email Address</label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="punk@future.com" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Message</label>
                    <textarea 
                      rows="4"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Let's build the future..." 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all resize-none placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <button 
                    disabled={status === 'sending'}
                    className={`w-full py-5 rounded-xl text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group ${
                      status === 'success' ? 'bg-green-600' :
                      status === 'error' ? 'bg-red-600' :
                      'bg-gradient-to-r from-violet-600 to-fuchsia-600'
                    }`}
                  >
                    {status === 'sending' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : status === 'success' ? (
                      <>Sent! <CheckCircle className="w-5 h-5" /></>
                    ) : status === 'error' ? (
                      <>Failed <AlertCircle className="w-5 h-5" /></>
                    ) : (
                      <>Send It <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
};

const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-black border-t border-white/10 pt-24 pb-12 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-fuchsia-900/20 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-5">
            <div 
              className="flex items-center gap-3 mb-8 cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-fuchsia-400 transition-colors duration-300">
                <Zap className="text-black w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">EVENTS IN SERBIA</span>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-8">
              We don't just host events. We curate moments that define a generation. Join the movement.
            </p>
            <div className="flex gap-4">
               {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                 <div key={social} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer">
                   <span className="text-xs">{social[0]}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-white font-bold mb-8 uppercase tracking-wider text-sm">Discover</h4>
            <ul className="space-y-4 text-slate-400">
              <li><span onClick={() => onNavigate('events')} className="hover:text-fuchsia-400 transition-colors cursor-pointer block">All Events</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Concerts</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Conferences</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Festivals</span></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-8 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 text-slate-400">
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">About Us</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Careers</span></li>
              <li><span onClick={() => onNavigate('contact')} className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Contact</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Press</span></li>
            </ul>
          </div>
          
           <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-8 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-4 text-slate-400">
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Privacy</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Terms</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">© 2024 Events in Serbia. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-slate-500 text-sm">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Data State
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [user, setUser] = useState(null);

  // Search & Favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('events_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('events_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, eventId) => {
    e.stopPropagation(); // Prevent card click
    setFavorites(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  // --- Auth & Data Effects ---

  useEffect(() => {
    // 1. Initialize Auth
    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();

    // 2. Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // 3. Data Listener (Only runs when user is authenticated)
    if (!user) return;

    // Simplified to root collection 'events'
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef);

    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const loadedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client-side sort by date (newest first), utilizing the parseDate helper to handle DD-MM-YYYY correctly
      loadedEvents.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      
      setEvents(loadedEvents);
      setIsLoadingEvents(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      if (error.code === 'permission-denied') {
        console.warn("Check your Firestore Security Rules. You might need to allow read/write access.");
      }
      setIsLoadingEvents(false);
    });

    return () => unsubscribeData();
  }, [user]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Handlers ---

  const handleNavigate = (page, event = null) => {
    window.scrollTo(0, 0);
    if (page === 'event-detail' && event) {
      setSelectedEvent(event);
    }
    setCurrentPage(page);
  };

  // Seed Data function (Optional - for first time run if needed, but not exposed in UI)
  const seedData = async () => {
    if (events.length === 0 && !isLoadingEvents && user) {
      // Simplified to root collection 'events'
      const eventsRef = collection(db, 'events');
      for (const ev of INITIAL_EVENTS) {
        await addDoc(eventsRef, ev);
      }
    }
  };

  // --- Derived State ---

  const cityData = useMemo(() => {
    const stats = { 'all': 0 };
    events.forEach(event => {
      stats['all']++;
      // Check for explicit city field first, fallback to location extraction
      const city = event.city ? event.city : (event.location ? event.location.split(',').pop().trim() : 'Unknown');
      stats[city] = (stats[city] || 0) + 1;
    });
    
    // Sort cities alphabetically, keeping 'all' first
    return Object.entries(stats)
      .sort((a, b) => {
        if (a[0] === 'all') return -1;
        if (b[0] === 'all') return 1;
        return a[0].localeCompare(b[0]);
      })
      .map(([name, count]) => ({ name, count, id: name }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      
      let matchesCity = true;
      if (selectedCity !== 'all') {
         // Consistent extraction logic
         const eventCity = event.city ? event.city : (event.location ? event.location.split(',').pop().trim() : '');
         matchesCity = eventCity === selectedCity;
      }
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = event.title.toLowerCase().includes(searchLower) || 
                            event.description.toLowerCase().includes(searchLower);

      const matchesFavorites = showFavoritesOnly ? favorites.includes(event.id) : true;

      return matchesCategory && matchesCity && matchesSearch && matchesFavorites;
    });
  }, [events, selectedCategory, selectedCity, searchQuery, showFavoritesOnly, favorites]);

  // Content Renderer
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <section className="py-32 container mx-auto px-6 bg-black relative">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-900/20 blur-[100px] -z-10" />
              
              <ScrollReveal>
                <div className="flex items-end justify-between mb-16">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">TRENDING <span className="text-fuchsia-500">NOW</span></h2>
                    <p className="text-slate-400 text-lg">Don't miss out on the season's hottest tickets.</p>
                  </div>
                  <button 
                    onClick={() => handleNavigate('events')}
                    className="hidden md:flex items-center gap-2 text-white font-bold hover:text-fuchsia-400 transition-colors text-lg group"
                  >
                    View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </ScrollReveal>
              
              {isLoadingEvents ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                  {events.filter(e => e.featured).slice(0, 3).map((event, index) => (
                    <ScrollReveal key={event.id} delay={index * 50} className="h-full">
                       <EventCard 
                          event={event} 
                          onClick={(e) => handleNavigate('event-detail', e)} 
                          isFavorite={favorites.includes(event.id)}
                          onToggleFavorite={toggleFavorite}
                       />
                    </ScrollReveal>
                  ))}
                  {events.length === 0 && (
                     <div className="col-span-full text-center py-10">
                       <p className="text-slate-500">No events yet. Check back soon.</p>
                       <button onClick={seedData} className="mt-4 text-xs text-slate-700 hover:text-white">Load Demo Data</button>
                     </div>
                  )}
                </div>
              )}

              <ScrollReveal>
                <button 
                  onClick={() => handleNavigate('events')}
                  className="md:hidden w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5"
                >
                  View All Events
                </button>
              </ScrollReveal>
            </section>
            <ContactSection />
          </>
        );

      case 'events':
        return (
          <div className="pt-32 pb-24 container mx-auto px-6 min-h-screen bg-black">
            <ScrollReveal>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">ALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">EVENTS</span></h1>
              <p className="text-slate-400 text-xl mb-16 max-w-2xl font-light">
                Your gateway to the extraordinary. Filter by vibe, pick your poison, and get ready for the night of your life.
              </p>
            </ScrollReveal>
            
            {/* Search Bar & Favorites Filter */}
            <ScrollReveal delay={50}>
               <div className="flex flex-col md:flex-row gap-4 mb-8">
                 <div className="relative flex-grow">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input 
                      type="text" 
                      placeholder="Search events..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                   />
                 </div>
                 <button 
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center gap-2 px-6 py-4 rounded-xl border font-bold transition-all ${showFavoritesOnly ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                 >
                   <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                   <span>{showFavoritesOnly ? 'Saved Events' : 'My Favorites'}</span>
                 </button>
               </div>
            </ScrollReveal>

            {/* Filters Container */}
            <div className="mb-16 space-y-8">
              {/* Category Filter */}
              <ScrollReveal delay={100}>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter by Vibe
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`
                            px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 border shadow-lg hover:scale-105 active:scale-95
                            ${isActive 
                              ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-fuchsia-900/50' 
                              : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>

              {/* City Filter (New) */}
              <ScrollReveal delay={150}>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Filter by Location
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {cityData.map((city) => {
                      const isActive = selectedCity === city.id;
                      return (
                        <button
                          key={city.id}
                          onClick={() => setSelectedCity(city.id)}
                          className={`
                            px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border shadow-lg hover:scale-105 active:scale-95
                            ${isActive 
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/50' 
                              : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white'
                            }
                          `}
                        >
                          {city.name === 'all' ? 'All Cities' : city.name}
                          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                            {city.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {isLoadingEvents ? (
               <div className="flex justify-center py-20">
                 <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map((event, index) => (
                  <ScrollReveal key={event.id} delay={index * 50} className="h-full">
                    <EventCard 
                      event={event} 
                      onClick={(e) => handleNavigate('event-detail', e)}
                      isFavorite={favorites.includes(event.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}

            {!isLoadingEvents && filteredEvents.length === 0 && (
              <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">It's quiet... too quiet.</h3>
                <p className="text-slate-500 text-lg">No events found matching your criteria.</p>
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedCity('all');
                      setSearchQuery('');
                      setShowFavoritesOnly(false);
                    }}
                    className="text-fuchsia-400 font-bold hover:text-fuchsia-300 transition-colors uppercase tracking-widest text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'event-detail':
        return (
          <EventDetailPage 
             event={selectedEvent} 
             onBack={() => handleNavigate('events')} 
             isFavorite={favorites.includes(selectedEvent.id)}
             onToggleFavorite={toggleFavorite}
             events={events} // Pass full list for "Related Events"
             onNavigate={handleNavigate}
          />
        );

      case 'contact':
        return (
          <div className="pt-20 bg-black min-h-screen">
            <ContactSection />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-fuchsia-500 selection:text-white text-slate-200">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
      />
      
      <main>
        {renderContent()}
      </main>

      <Footer onNavigate={handleNavigate} />
      
      {/* Global Styles for Animations */}
      <style>{`
        html, body {
          background-color: #000;
          margin: 0;
          padding: 0;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; 
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
