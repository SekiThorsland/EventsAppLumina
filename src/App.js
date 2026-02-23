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
  ListMusic,
  ShieldCheck,
  Shirt,
  Info
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
    category: "music",
    featured: true,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    description: "Experience the best of beer and music at one of the biggest festivals in Southeast Europe.",
    highlights: ["Over 50 breweries", "Fun Park", "Silent Disco"],
    organizer: "Belgrade Cultural Center",
    ageLimit: "All Ages",
    entryPolicy: "Free Entry",
    dailySchedule: [
      { day: "Day 1 (Aug 15)", guests: ["Van Gogh", "Riblja Čorba"] },
      { day: "Day 2 (Aug 16)", guests: ["S.A.R.S.", "Who See", "Sunshine"] },
      { day: "Day 3 (Aug 17)", guests: ["Bajaga i Instruktori", "Neverne Bebe"] },
      { day: "Day 4 (Aug 18)", guests: ["Love Hunters", "Ortodox Celts"] }
    ]
  }
];

// --- Helpers ---

const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'string') {
    const match = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (match) return new Date(match[3], match[2] - 1, match[1]);
  }
  return new Date(dateStr);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
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
  if (startParts[2] === endParts[2]) {
     if (startParts[1] === endParts[1]) return `${startParts[0]} - ${endParts[0]}.${startParts[1]}.${startParts[2]}`;
     return `${startParts[0]}.${startParts[1]} - ${endParts[0]}.${endParts[1]}.${endParts[2]}`;
  }
  return `${start} - ${end}`;
};

const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return data.split(',').map(item => item.trim());
  return [];
};

const shareEvent = async (event) => {
  const url = `${window.location.origin}${window.location.pathname}#event-${event.id}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: event.title,
        text: `Check out ${event.title} on Events in Serbia!`,
        url: url,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    const toast = document.createElement('div');
    toast.innerText = 'Link copied to clipboard!';
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-fuchsia-600 text-white px-6 py-3 rounded-full z-[100] shadow-2xl animate-fade-in-up font-bold text-sm';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
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
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);
  return (
    <div ref={domRef} className={`transition-all duration-500 cubic-bezier(0.17, 0.55, 0.55, 1) ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Navbar = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navStyle, setNavStyle] = useState({ backgroundColor: 'rgba(0, 0, 0, 0)', paddingTop: '24px', paddingBottom: '24px', borderColor: 'transparent', boxShadow: 'none', backdropFilter: 'blur(0px)' });
  const navLinkClass = (page) => `cursor-pointer transition-all duration-300 ${currentPage === page ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-slate-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(167,139,250,0.8)]'}`;
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(1, Math.max(0, (scrollY - 20) / 130));
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
    <nav className="fixed w-full z-50 border-b" style={navStyle}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
            <div className="relative w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10"><Zap className="text-fuchsia-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" /></div>
          </div>
          <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-indigo-400 tracking-tight uppercase">EVENTS IN SERBIA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <span onClick={() => onNavigate('home')} className={navLinkClass('home')}>Home</span>
          <span onClick={() => onNavigate('events')} className={navLinkClass('events')}>Events</span>
          <span onClick={() => onNavigate('contact')} className={navLinkClass('contact')}>Contact</span>
        </div>
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 animate-fade-in shadow-2xl z-50">
          <span onClick={() => {onNavigate('home'); setIsOpen(false)}} className="text-white text-lg font-bold py-2 cursor-pointer border-b border-white/5">Home</span>
          <span onClick={() => {onNavigate('events'); setIsOpen(false)}} className="text-white text-lg font-bold py-2 cursor-pointer border-b border-white/5">Events</span>
          <span onClick={() => {onNavigate('contact'); setIsOpen(false)}} className="text-white text-lg font-bold py-2 cursor-pointer border-b border-white/5">Contact</span>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-16">
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/30 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <div className="group cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] animate-fade-in-up">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500"></span></span>
          <span className="text-white text-sm font-bold tracking-widest uppercase">The Future is Now</span>
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter animate-fade-in-up mix-blend-screen">IGNITE YOUR <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 animate-gradient-x">SENSES</span></h1>
        <p className="text-slate-300 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up font-light">Don't just watch. <span className="text-white font-bold">Experience.</span> Access the world's most exclusive festivals, underground summits, and avant-garde exhibitions in Serbia.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up w-full max-w-lg mx-auto">
          <button onClick={() => onNavigate('events')} className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(192,38,211,0.5)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group border border-white/10">Find Your Vibe <Flame className="w-5 h-5 group-hover:text-yellow-300 transition-colors animate-pulse" /></button>
          <button onClick={() => onNavigate('events')} className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border border-white/20 text-white font-bold text-lg hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">View Calendar</button>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ event, onClick, isFavorite, onToggleFavorite }) => {
  const locationStr = event.location || '';
  const displayCity = event.city || (locationStr.includes(',') ? locationStr.split(',').pop().trim() : 'Unknown');
  const displayLocation = event.city ? locationStr : (locationStr.split(',')[0].trim() || 'Location TBD');
  const dateObj = parseDate(event.date);
  const monthName = dateObj.toLocaleString('default', { month: 'short' });
  const dayNumber = dateObj.getDate();

  return (
    <div onClick={() => onClick(event)} style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} className="group relative bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden hover:border-fuchsia-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(192,38,211,0.15)] h-full flex flex-col cursor-pointer transform hover:-translate-y-2">
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-60" />
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 group-hover:border-fuchsia-500/30 transition-colors">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">{event.category}</span>
        </div>
        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <button onClick={(e) => onToggleFavorite(e, event.id)} className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all shadow-lg"><Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-fuchsia-500 text-fuchsia-500' : 'text-white'}`} /></button>
          <button onClick={(e) => { e.stopPropagation(); shareEvent(event); }} className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all shadow-lg"><Share2 className="w-5 h-5 text-white" /></button>
        </div>
      </div>
      <div className="p-8 relative z-20 -mt-20 flex flex-col flex-grow">
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[70px] text-center group-hover:bg-fuchsia-900/20 group-hover:border-fuchsia-500/30 transition-all h-fit">
            <span className="text-xs text-fuchsia-400 font-bold uppercase mb-1">{monthName}</span>
            <span className="text-2xl font-black text-white">{dayNumber}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-fuchsia-300 transition-colors">{event.title}</h3>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MapPin className="w-4 h-4 text-fuchsia-500" />
                {displayCity}
              </div>
              <div className="text-slate-400 text-xs ml-6">{displayLocation}</div>
            </div>
          </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed flex-grow border-l-2 border-white/10 pl-4 group-hover:border-fuchsia-500/50 transition-colors">{event.description}</p>
      </div>
    </div>
  );
};

const EventDetailPage = ({ event, onBack, isFavorite, onToggleFavorite, events = [], onNavigate }) => {
  if (!event) return null;

  const guestLabel = { music: 'Lineup', tech: 'Speakers', art: 'Featured Artists', sports: 'Competitors', all: 'Special Guests' }[event.category] || 'Special Guests';
  const guests = ensureArray(event.guests || event.lineup || event.speakers);
  
  let dailySchedule = [];
  if (Array.isArray(event.dailySchedule)) {
      dailySchedule = event.dailySchedule;
  } else if (event.dailySchedule && typeof event.dailySchedule === 'object') {
      dailySchedule = Object.keys(event.dailySchedule).map(key => {
          const value = event.dailySchedule[key];
          return value.guests ? value : { day: key, guests: value };
      });
      dailySchedule.sort((a, b) => a.day.localeCompare(b.day));
  }
  
  const highlights = ensureArray(event.highlights);
  const relatedEvents = events.filter(e => e.category === event.category && e.id !== event.id).slice(0, 3);
  
  const dynamicDetails = [
    { key: 'organizer', label: 'Organizer', icon: User, default: 'Events in Serbia' },
    { key: 'ageLimit', label: 'Age Limit', icon: ShieldCheck },
    { key: 'entryPolicy', label: 'Entry Policy', icon: Ticket },
    { key: 'dressCode', label: 'Dress Code', icon: Shirt },
  ];

  return (
    <div className="min-h-screen bg-black animate-fade-in pb-20">
      <div className="relative min-h-[70vh] w-full overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-10" />
            <img src={event.image} alt={event.title} className="w-full h-full object-cover animate-pulse-slow" style={{ animationDuration: '20s' }} />
        </div>
        
        <div className="relative z-50 px-4 md:px-6 pt-24 md:pt-28 flex justify-between items-center container mx-auto">
          <button onClick={onBack} className="group flex items-center gap-1.5 md:gap-3 px-3 py-2 md:px-6 md:py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-fuchsia-600 border border-white/10 transition-all text-xs md:text-base">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline font-bold">Back to Vibes</span>
            <span className="sm:hidden font-bold">Back</span>
          </button>
          
          <div className="flex gap-2">
             <button onClick={() => shareEvent(event)} className="group flex items-center gap-2 p-2.5 md:px-5 md:py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-white/10 border border-white/10 transition-all" title="Share">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden lg:inline font-bold text-sm">Share</span>
            </button>
             <button onClick={() => {
                const start = parseDate(event.date);
                const isoDate = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
                window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${isoDate}/${isoDate}`, '_blank');
             }} className="group flex items-center gap-2 p-2.5 md:px-5 md:py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-indigo-600 border border-white/10 transition-all" title="Add to Calendar">
              <CalendarPlus className="w-4 h-4 md:w-5 md:h-5" /> 
              <span className="hidden lg:inline font-bold text-sm">Add to Calendar</span>
            </button>
             <button onClick={(e) => onToggleFavorite(e, event.id)} className="group flex items-center gap-2 p-2.5 md:px-5 md:py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-white/10 border border-white/10 transition-all" title="Save">
              <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isFavorite ? 'fill-fuchsia-500 text-fuchsia-500' : 'text-white'}`} />
              <span className="hidden lg:inline font-bold text-sm">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

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
             <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-fuchsia-500 pl-6 uppercase tracking-tight">THE EXPERIENCE</h2>
             <div className="prose prose-invert prose-lg max-w-none">
               <p className="text-slate-300 text-xl leading-relaxed mb-8 font-light">{event.description}</p>
               
               {highlights.length > 0 && (
                <div className="my-12 p-8 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-3xl border border-white/5">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 uppercase"><Zap className="w-6 h-6 text-yellow-400" /> Highlights</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-4 text-slate-300"><div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0 mt-1"><div className="w-2 h-2 rounded-full bg-fuchsia-500" /></div><span>{h}</span></li>
                    ))}
                  </ul>
                </div>
               )}
               
               {dailySchedule.length > 0 && (
                 <div className="my-12">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 uppercase"><ListMusic className="w-6 h-6 text-fuchsia-400" /> Schedule</h3>
                   <div className="space-y-6">
                     {dailySchedule.map((d, idx) => (
                       <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                         <h4 className="text-lg font-bold text-fuchsia-400 mb-3">{d.day || `Day ${idx + 1}`}</h4>
                         <div className="flex flex-wrap gap-3">{ensureArray(d.guests).map((g, gIdx) => (<span key={gIdx} className="text-slate-300 text-sm font-medium bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">{g}</span>))}</div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {guests.length > 0 && dailySchedule.length === 0 && (
                 <div className="my-12">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 uppercase"><Mic2 className="w-6 h-6 text-fuchsia-400" /> {guestLabel}</h3>
                   <div className="flex flex-wrap gap-4">{guests.map((g, idx) => (<span key={idx} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">{g}</span>))}</div>
                 </div>
               )}
             </div>
          </ScrollReveal>
        </div>
        
        <div className="lg:col-span-4 space-y-8">
          <ScrollReveal delay={200}>
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 sticky top-32">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Event Details</h3>
              <div className="space-y-6">
                 {dynamicDetails.map((field) => {
                   const value = event[field.key] || field.default;
                   if (!value) return null;
                   const Icon = field.icon;
                   return (<div key={field.key} className="flex items-start gap-4"><Icon className="w-5 h-5 text-slate-500 mt-1" /><div><p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{field.label}</p><p className="text-white font-medium">{value}</p></div></div>);
                 })}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5">
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 text-center">Ticket Status</p>
                 <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                    <span className="text-slate-400 text-sm">Admission</span>
                    <span className="text-white font-bold">{event.price || 'Contact'}</span>
                 </div>
                 <div className="flex flex-col gap-3">
                   <button onClick={() => shareEvent(event)} className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/5"><Share2 className="w-4 h-4" /> Share Experience</button>
                   <button onClick={() => {
                      const start = parseDate(event.date);
                      const isoDate = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
                      window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${isoDate}/${isoDate}`, '_blank');
                   }} className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"><CalendarPlus className="w-4 h-4" /> Add to Calendar</button>
                 </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      
      {relatedEvents.length > 0 && (
         <div className="container mx-auto px-6 mt-32">
           <ScrollReveal>
             <h2 className="text-3xl font-black text-white mb-10 uppercase tracking-tight">YOU MIGHT ALSO LIKE</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {relatedEvents.map((re, idx) => (
                 <EventCard key={re.id || idx} event={re} onClick={() => onNavigate('event-detail', re)} isFavorite={false} onToggleFavorite={() => {}} />
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
      await addDoc(collection(db, 'messages'), { ...formData, createdAt: new Date().toISOString() });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <section className="py-32 relative overflow-hidden" id="contact">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-indigo-900/20 via-black to-black -z-10" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <ScrollReveal delay={100}>
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-600 to-orange-500 flex items-center justify-center shadow-lg shadow-fuchsia-900/50"><Mail className="text-white w-6 h-6" /></div>
                <span className="text-fuchsia-400 font-bold tracking-widest uppercase text-sm">Get in Touch</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">LET'S MAKE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-orange-400 uppercase">MAGIC HAPPEN</span></h2>
              <p className="text-slate-400 mb-10 text-xl leading-relaxed">Got a crazy idea for an event? Want to partner with the best? Or just want to say hi? We're listening.</p>
              <div className="space-y-6">
                <div className="group flex items-center gap-6 text-slate-300 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-fuchsia-600/20 group-hover:text-fuchsia-400 transition-all"><Mail className="w-7 h-7" /></div>
                  <div><p className="text-sm text-slate-500 font-bold uppercase mb-1">Email Us</p><p className="text-xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">hello@eventsinserbia.rs</p></div>
                </div>
                <div className="group flex items-center gap-6 text-slate-300 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-fuchsia-600/20 group-hover:text-fuchsia-400 transition-all"><MapPin className="w-7 h-7" /></div>
                  <div><p className="text-sm text-slate-500 font-bold uppercase mb-1">HQ</p><p className="text-xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">100 Future Way, Tech City</p></div>
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
                  <div><label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Your Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Cyber Punk" required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium" /></div>
                  <div><label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="punk@future.com" required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium" /></div>
                  <div><label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Message</label><textarea rows="4" name="message" value={formData.message} onChange={handleChange} placeholder="Let's build the future..." required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all resize-none placeholder:text-slate-600 font-medium" /></div>
                  <button disabled={status === 'sending'} className={`w-full py-5 rounded-xl text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group ${status === 'success' ? 'bg-green-600' : status === 'error' ? 'bg-red-600' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'}`}>
                    {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : status === 'success' ? <>Sent! <CheckCircle className="w-5 h-5" /></> : status === 'error' ? <>Failed <AlertCircle className="w-5 h-5" /></> : <>Send It <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
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
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-fuchsia-900/20 blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={() => onNavigate('home')}>
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-fuchsia-400 transition-colors duration-300"><Zap className="text-black w-6 h-6" /></div>
              <span className="text-3xl font-black text-white tracking-tighter uppercase">LUMINA</span>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-8">We don't just host events. We curate moments that define a generation. Join the movement.</p>
            <div className="flex gap-4">
               {['Twitter', 'Instagram', 'LinkedIn'].map((s) => (<div key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"><span className="text-xs">{s[0]}</span></div>))}
            </div>
          </div>
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-white font-bold mb-8 uppercase tracking-wider text-sm">Discover</h4>
            <ul className="space-y-4 text-slate-400">
              <li><span onClick={() => onNavigate('events')} className="hover:text-fuchsia-400 transition-colors cursor-pointer block">All Events</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Concerts</span></li>
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Festivals</span></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-8 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 text-slate-400">
              <li><span className="hover:text-fuchsia-400 transition-colors cursor-pointer block">About Us</span></li>
              <li><span onClick={() => onNavigate('contact')} className="hover:text-fuchsia-400 transition-colors cursor-pointer block">Contact</span></li>
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
    e.stopPropagation(); 
    setFavorites(prev => prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]);
  };

  const handleNavigate = (page, event = null) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
    
    if (page === 'event-detail' && event) {
      setSelectedEvent(event);
      window.history.pushState(null, '', `#event-${event.id}`);
    } else if (page === 'events') {
      window.history.pushState(null, '', '#events');
    } else if (page === 'contact') {
      window.history.pushState(null, '', '#contact');
    } else {
      window.history.pushState(null, '', '#');
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#event-')) {
        const id = hash.replace('#event-', '');
        const ev = events.find(e => e.id === id);
        if (ev) {
          setSelectedEvent(ev);
          setCurrentPage('event-detail');
        }
      } else if (hash === '#events') {
        setCurrentPage('events');
      } else if (hash === '#contact') {
        setCurrentPage('contact');
      } else {
        setCurrentPage('home');
      }
    };

    if (!isLoadingEvents) {
      handleHashChange();
    }
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoadingEvents, events]);

  useEffect(() => {
    const initAuth = async () => { await signInAnonymously(auth); };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef);
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const loadedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loadedEvents.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      setEvents(loadedEvents);
      setIsLoadingEvents(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setIsLoadingEvents(false);
    });
    return () => unsubscribeData();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 150); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cityData = useMemo(() => {
    const stats = { 'all': 0 };
    events.forEach(event => {
      stats['all']++;
      const city = event.city ? event.city : (event.location ? event.location.split(',').pop().trim() : 'Unknown');
      stats[city] = (stats[city] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => {
        if (a[0] === 'all') return -1;
        if (b[0] === 'all') return 1;
        return a[0].localeCompare(b[0]);
      }).map(([name, count]) => ({ name, count, id: name }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      let matchesCity = true;
      if (selectedCity !== 'all') {
         const eventCity = event.city ? event.city : (event.location ? event.location.split(',').pop().trim() : '');
         matchesCity = eventCity === selectedCity;
      }
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = event.title.toLowerCase().includes(searchLower) || event.description.toLowerCase().includes(searchLower);
      const matchesFavorites = showFavoritesOnly ? favorites.includes(event.id) : true;
      return matchesCategory && matchesCity && matchesSearch && matchesFavorites;
    });
  }, [events, selectedCategory, selectedCity, searchQuery, showFavoritesOnly, favorites]);

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <section className="py-32 container mx-auto px-6 bg-black relative">
              <ScrollReveal>
                <div className="flex items-end justify-between mb-16">
                  <div><h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">TRENDING <span className="text-fuchsia-500">NOW</span></h2><p className="text-slate-400 text-lg">Top picks for the upcoming season.</p></div>
                  <button onClick={() => handleNavigate('events')} className="hidden md:flex items-center gap-2 text-white font-bold hover:text-fuchsia-400 transition-colors text-lg group">View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
                </div>
              </ScrollReveal>
              {isLoadingEvents ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                  {events.filter(e => e.featured).slice(0, 3).map((e, i) => (
                    <ScrollReveal key={e.id} delay={i * 50} className="h-full"><EventCard event={e} onClick={(ev) => handleNavigate('event-detail', ev)} isFavorite={favorites.includes(e.id)} onToggleFavorite={toggleFavorite} /></ScrollReveal>
                  ))}
                </div>
              )}
            </section>
            <ContactSection />
          </>
        );
      case 'events':
        return (
          <div className="pt-32 pb-24 container mx-auto px-6 min-h-screen bg-black">
            <ScrollReveal>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase">ALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">EVENTS</span></h1>
            </ScrollReveal>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
              </div>
              <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`flex items-center gap-2 px-6 py-4 rounded-xl border font-bold transition-all ${showFavoritesOnly ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-white' : ''}`} /><span>{showFavoritesOnly ? 'Saved Events' : 'My Favorites'}</span>
              </button>
            </div>
            <div className="mb-16 space-y-8">
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 border ${selectedCategory === cat.id ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-fuchsia-900/50' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white'}`}><cat.icon className="w-4 h-4" />{cat.label}</button>))}
              </div>
              <div className="flex flex-wrap gap-3">
                {cityData.map((city) => (<button key={city.id} onClick={() => setSelectedCity(city.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${selectedCity === city.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/50' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white'}`}>{city.name === 'all' ? 'All Cities' : city.name}<span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${selectedCity === city.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>{city.count}</span></button>))}
              </div>
            </div>
            {isLoadingEvents ? (<div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" /></div>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">{filteredEvents.map((event, index) => (<ScrollReveal key={event.id} delay={index * 50} className="h-full"><EventCard event={event} onClick={(e) => handleNavigate('event-detail', e)} isFavorite={favorites.includes(event.id)} onToggleFavorite={toggleFavorite} /></ScrollReveal>))}</div>
            )}
          </div>
        );

      case 'event-detail':
        return (<EventDetailPage event={selectedEvent} onBack={() => handleNavigate('events')} isFavorite={favorites.includes(selectedEvent.id)} onToggleFavorite={toggleFavorite} events={events} onNavigate={handleNavigate} />);

      case 'contact':
        return (<div className="pt-20 bg-black min-h-screen"><ContactSection /></div>);

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-fuchsia-500 selection:text-white text-slate-200">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>{renderContent()}</main>
      <Footer onNavigate={handleNavigate} />
      <style>{`
        html, body { background-color: #000; margin: 0; padding: 0; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-blob { animation: blob 7s infinite; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
