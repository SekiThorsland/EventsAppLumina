import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Send,
  Clock,
  Zap,
  Flame,
  Plus,
  Trash2,
  Settings,
  Lock,
  Loader2
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
    title: "Neon Horizon Festival",
    date: "2024-08-15",
    time: "18:00",
    location: "Cyber City Arena, Tokyo",
    price: "$120",
    category: "music",
    featured: true,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    description: "Experience the future of sound with the world's top electronic artists in an immersive neon landscape."
  },
  {
    title: "Future AI Summit",
    date: "2024-09-22",
    time: "09:00",
    location: "Moscone Center, SF",
    price: "$499",
    category: "tech",
    featured: true,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
    description: "Join industry leaders to discuss the next generation of artificial intelligence."
  },
  {
    title: "Abstract Realities",
    date: "2024-10-05",
    time: "10:00",
    location: "Modern Art Museum, NYC",
    price: "$35",
    category: "art",
    featured: true,
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop",
    description: "A breathtaking exhibition challenging perception through digital and physical mixed media."
  }
];

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
      className={`transition-all duration-700 cubic-bezier(0.17, 0.55, 0.55, 1) ${
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

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'lumina2024') {
      onLogin();
      onClose();
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Lock className="w-6 h-6 text-fuchsia-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Creator Access</h3>
          <p className="text-slate-400 text-sm mt-1">Enter password to manage events</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-center text-white focus:outline-none focus:border-fuchsia-500 transition-colors"
              placeholder="Enter Password"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs text-center mt-2">Incorrect password</p>}
          </div>

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

const AddEventModal = ({ isOpen, onClose, onAdd, isSaving }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'music',
    date: '',
    time: '',
    location: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      price: 'Free',
      featured: false
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Create New Event</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Event Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="e.g. Midnight Jazz"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500 appearance-none"
              >
                {CATEGORIES.slice(1).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Date</label>
              <input 
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Time</label>
              <input 
                required
                type="time" 
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Location</label>
              <input 
                required
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500"
                placeholder="City, Venue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Image URL</label>
            <input 
              type="text" 
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2">Description</label>
            <textarea 
              rows="3"
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-500 resize-none"
              placeholder="What's the vibe?"
            />
          </div>

          <button 
            disabled={isSaving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : 'Launch Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Navbar = ({ isScrolled, currentPage, onNavigate, isAdmin, onToggleAdmin, onAddEvent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClass = (page) => `cursor-pointer transition-all duration-300 ${currentPage === page ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-slate-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(167,139,250,0.8)]'}`;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 'bg-transparent py-6'}`}>
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
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-indigo-400 tracking-tight">
            LUMINA
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <span onClick={() => onNavigate('home')} className={navLinkClass('home')}>Home</span>
          <span onClick={() => onNavigate('events')} className={navLinkClass('events')}>Events</span>
          <span onClick={() => onNavigate('contact')} className={navLinkClass('contact')}>Contact</span>
          
          <div className="h-6 w-px bg-white/10 mx-2"></div>

          <button 
            onClick={onToggleAdmin}
            className={`flex items-center gap-2 transition-colors ${isAdmin ? 'text-fuchsia-400' : 'text-slate-400 hover:text-white'}`}
          >
            {isAdmin ? <Settings className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isAdmin ? 'Creator Mode On' : 'Creator Login'}</span>
          </button>

          {isAdmin && (
            <button 
              onClick={onAddEvent}
              className="p-2 rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-all shadow-[0_0_15px_rgba(192,38,211,0.5)]"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
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
          
          <button 
            onClick={() => {
              onToggleAdmin();
              setIsOpen(false);
            }}
            className="text-left text-slate-400 py-2 flex items-center gap-2"
          >
            {isAdmin ? <Settings className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isAdmin ? 'Disable Creator Mode' : 'Creator Login'}
          </button>

          {isAdmin && (
            <button 
              onClick={() => {
                onAddEvent();
                setIsOpen(false);
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Event
            </button>
          )}
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
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter animate-fade-in-up delay-100 mix-blend-screen">
          IGNITE YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 animate-gradient-x">SENSES</span>
        </h1>
        
        <p className="text-slate-300 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200 font-light">
          Don't just watch. <span className="text-white font-bold">Experience.</span> Access the world's most exclusive festivals, underground summits, and avant-garde exhibitions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300 w-full max-w-lg mx-auto">
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

const EventCard = ({ event, onClick, isAdmin, onDelete, isDeleting }) => {
  return (
    <div 
      onClick={() => onClick(event)}
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
        {event.featured && (
           <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full shadow-lg">
             <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
               <Sparkles className="w-3 h-3" /> Featured
             </span>
           </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 relative z-20 -mt-20 flex flex-col flex-grow">
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[70px] text-center group-hover:bg-fuchsia-900/20 group-hover:border-fuchsia-500/30 transition-all">
            <span className="text-xs text-fuchsia-400 font-bold uppercase mb-1">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
            <span className="text-2xl font-black text-white">{new Date(event.date).getDate()}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-fuchsia-300 transition-colors">{event.title}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm group-hover:text-slate-300">
              <MapPin className="w-4 h-4 text-fuchsia-500" />
              {event.location}
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed flex-grow border-l-2 border-white/10 pl-4 group-hover:border-fuchsia-500/50 transition-colors">
          {event.description}
        </p>

        {/* Delete Button (Only visible in admin mode) */}
        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {isDeleting ? 'Removing...' : 'Remove Event'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EventDetailPage = ({ event, onBack }) => {
  if (!event) return null;

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
        <div className="relative z-50 px-6 pt-28">
          <div className="container mx-auto">
            <button 
              onClick={onBack}
              className="group flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl text-white rounded-full hover:bg-fuchsia-600 hover:text-white transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-bold">Back to Vibes</span>
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
                     <span className="text-lg font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <Clock className="w-6 h-6 text-fuchsia-500" />
                     <span className="text-lg font-medium">{event.time}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <MapPin className="w-6 h-6 text-fuchsia-500" />
                     <span className="text-lg font-medium">{event.location}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <ScrollReveal>
             <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-fuchsia-500 pl-6">THE EXPERIENCE</h2>
             <div className="prose prose-invert prose-lg max-w-none">
               <p className="text-slate-300 text-xl leading-relaxed mb-8 font-light">
                 {event.description}
               </p>
               <p className="text-slate-400 leading-relaxed mb-8">
                 Prepare yourself for an event that transcends the ordinary. We have curated every second of this experience to ensure maximum impact. From the moment you step through the doors, you will be transported to a world where creativity knows no bounds.
               </p>
               
               <div className="my-12 p-8 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-3xl border border-white/5">
                 <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                   <Zap className="w-6 h-6 text-yellow-400" /> Highlights
                 </h3>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1,2,3,4].map(i => (
                     <li key={i} className="flex items-start gap-4 text-slate-300">
                       <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                         <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                       </div>
                       <span>Exclusive access to VIP zones and backstage areas.</span>
                     </li>
                   ))}
                 </ul>
               </div>
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
                     <p className="text-white font-medium">Lumina Originals</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <Ticket className="w-5 h-5 text-slate-500 mt-1" />
                   <div>
                     <p className="text-slate-400 text-sm font-bold uppercase">Capacity</p>
                     <p className="text-white font-medium">Limited (500 Left)</p>
                   </div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                 <p className="text-slate-500 text-sm mb-4 text-center">Share this event</p>
                 <div className="flex justify-center gap-4">
                   {['Twitter', 'Facebook', 'Copy Link'].map((social) => (
                     <button key={social} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors">
                       {social}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

const ContactSection = () => {
  return (
    <section className="py-32 relative overflow-hidden" id="contact">
      {/* Decorative BG */}
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
                    <p className="text-xl font-bold text-white group-hover:text-fuchsia-300 transition-colors">hello@lumina.events</p>
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
              <form className="relative bg-black/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl" onSubmit={(e) => e.preventDefault()}>
                <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Cyber Punk" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="punk@future.com" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-fuchsia-400 uppercase mb-2 tracking-wider">Message</label>
                    <textarea 
                      rows="4"
                      placeholder="Let's build the future..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-fuchsia-500 focus:bg-white/10 transition-all resize-none placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <button className="w-full py-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(192,38,211,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group">
                    Send It <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
              <span className="text-3xl font-black text-white tracking-tighter">LUMINA</span>
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
          <p className="text-slate-600 text-sm">© 2024 Lumina Events Inc. All rights reserved.</p>
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
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Data State
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);

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
      
      // Client-side sort by date (newest first)
      loadedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      
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
      setIsScrolled(window.scrollY > 50);
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

  const handleAddEvent = async (newEvent) => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Simplified to root collection 'events'
      const eventsRef = collection(db, 'events');
      await addDoc(eventsRef, newEvent);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to remove this event?")) return;
    
    setIsDeletingId(id);
    try {
      // Simplified to root collection 'events'
      const eventDoc = doc(db, 'events', id);
      await deleteDoc(eventDoc);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowLoginModal(true);
    }
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

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

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
                    <ScrollReveal key={event.id} delay={index * 150} className="h-full">
                       <EventCard 
                          event={event} 
                          onClick={(e) => handleNavigate('event-detail', e)} 
                          isAdmin={isAdmin}
                          onDelete={handleDeleteEvent}
                          isDeleting={isDeletingId === event.id}
                       />
                    </ScrollReveal>
                  ))}
                  {events.length === 0 && (
                     <div className="col-span-full text-center py-10">
                       <p className="text-slate-500">No events yet. {isAdmin ? 'Add one!' : 'Check back soon.'}</p>
                       {isAdmin && <button onClick={seedData} className="mt-4 text-xs text-slate-700 hover:text-white">Load Demo Data</button>}
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

            {/* Filter Pills */}
            <ScrollReveal delay={100}>
              <div className="flex flex-wrap gap-3 mb-16">
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
            </ScrollReveal>

            {isLoadingEvents ? (
               <div className="flex justify-center py-20">
                 <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map((event, index) => (
                  <ScrollReveal key={event.id} delay={index * 100} className="h-full">
                    <EventCard 
                      event={event} 
                      onClick={(e) => handleNavigate('event-detail', e)} 
                      isAdmin={isAdmin}
                      onDelete={handleDeleteEvent}
                      isDeleting={isDeletingId === event.id}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}

            {!isLoadingEvents && filteredEvents.length === 0 && (
              <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">It's quiet... too quiet.</h3>
                <p className="text-slate-500 text-lg">No events found in this category right now.</p>
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="mt-6 text-fuchsia-400 font-bold hover:text-fuchsia-300 transition-colors uppercase tracking-widest text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        );

      case 'event-detail':
        return <EventDetailPage event={selectedEvent} onBack={() => handleNavigate('events')} />;

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
        isScrolled={isScrolled} 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        onToggleAdmin={handleAdminToggle}
        onAddEvent={() => setShowAddModal(true)}
      />
      
      <main>
        {renderContent()}
      </main>

      <Footer onNavigate={handleNavigate} />
      
      <AddEventModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEvent}
        isSaving={isSaving}
      />

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => setIsAdmin(true)}
      />
      
      {/* Global Styles for Animations */}
      <style>{`
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
