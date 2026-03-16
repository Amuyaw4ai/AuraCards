/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { get, set } from 'idb-keyval';
import { 
  Sparkles, 
  Heart, 
  RefreshCw, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Image as ImageIcon,
  ImageDown,
  FileDown,
  FileText,
  Upload,
  X,
  Palette,
  Type,
  Maximize2,
  AlertCircle,
  Clock,
  Trash2,
  History,
  Copy,
  Check,
  Settings2,
  ChevronDown,
  ChevronUp,
  Layout,
  Sun,
  Moon,
  MoreVertical,
  Droplets,
  TreePine,
  Square,
  Share2,
  BookMarked,
  Search,
  BookmarkPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface CardData {
  occasion: keyof typeof OCCASIONS;
  recipient: string;
  age: string;
  yearsTogether: string;
  degree: string;
  babyName: string;
  coupleNames: string;
  achievement: string;
  event: string;
  examType: string;
  relationship: string;
  vibe: string;
  interests: string;
  imagePreferences: string;
  message: string;
  imageUrl: string;
  theme: 'classic' | 'modern' | 'playful' | 'elegant';
  palette: keyof typeof PALETTES;
  fontPair: keyof typeof FONT_PAIRS;
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: keyof typeof ASPECT_RATIOS;
  outputStyle: keyof typeof OUTPUT_STYLES;
  preserveLikeness: boolean;
  signature: string;
  isSelf: boolean;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  data: CardData;
  subjectImage: string | null;
}

interface SavedItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: number;
  data: CardData;
  subjectImage: string | null;
}

const OCCASIONS = {
  'Birthday': { icon: '🎂', label: 'Birthday', field: 'age', placeholder: 'e.g. 25', group: 'Milestones' },
  'Anniversary': { icon: '💍', label: 'Anniversary', field: 'yearsTogether', placeholder: 'e.g. 5 years', group: 'Milestones' },
  'Graduation': { icon: '🎓', label: 'Graduation', field: 'degree', placeholder: 'e.g. Computer Science', group: 'Milestones' },
  'Wedding': { icon: '🥂', label: 'Wedding', field: 'coupleNames', placeholder: 'e.g. Mark & Jane', group: 'Milestones' },
  'New Baby': { icon: '👶', label: 'New Baby', field: 'babyName', placeholder: 'e.g. Oliver', group: 'Milestones' },
  'Valentine\'s': { icon: '❤️', label: 'Valentine\'s', field: null, placeholder: '', group: 'Love & Romance' },
  'I Love You': { icon: '💌', label: 'I Love You', field: null, placeholder: '', group: 'Love & Romance' },
  'Mother\'s Day': { icon: '🌸', label: 'Mother\'s Day', field: null, placeholder: '', group: 'Holidays' },
  'Father\'s Day': { icon: '👔', label: 'Father\'s Day', field: null, placeholder: '', group: 'Holidays' },
  'Christmas': { icon: '🎄', label: 'Christmas', field: null, placeholder: '', group: 'Holidays' },
  'Thank You': { icon: '🙏', label: 'Thank You', field: null, placeholder: '', group: 'Appreciation & Support' },
  'Congratulations': { icon: '🎉', label: 'Congratulations', field: 'achievement', placeholder: 'e.g. New Job', group: 'Appreciation & Support' },
  'Best Wishes': { icon: '✨', label: 'Best Wishes', field: 'event', placeholder: 'e.g. New Job, Moving, Surgery', group: 'Appreciation & Support' },
  'Exam Wishes': { icon: '📚', label: 'Exam Wishes', field: 'examType', placeholder: 'e.g. Finals, Bar Exam', group: 'Appreciation & Support' },
};

const ASPECT_RATIOS = {
  '1:1': { label: 'Square', icon: '⬜', class: 'aspect-square' },
  '4:3': { label: 'Standard', icon: '📺', class: 'aspect-[4/3]' },
  '3:4': { label: 'Portrait', icon: '📱', class: 'aspect-[3/4]' },
  '16:9': { label: 'Widescreen', icon: '🎞️', class: 'aspect-video' },
  '9:16': { label: 'Story', icon: '🤳', class: 'aspect-[9/16]' },
};

const PALETTES = {
  'Champagne Gold': { bg: 'bg-[#fdfbf7]', text: 'text-[#2d2a26]', accent: 'text-[#d4af37]', border: 'border-[#d4af37]' },
  'Onyx & Gold': { bg: 'bg-[#1a1a1a]', text: 'text-[#f5f5f5]', accent: 'text-[#ffdf00]', border: 'border-[#ffdf00]' },
  'Rose Gold': { bg: 'bg-[#fffafb]', text: 'text-[#9f1239]', accent: 'text-[#e11d48]', border: 'border-[#fecdd3]' },
  'Emerald & Gold': { bg: 'bg-[#064e3b]', text: 'text-[#fefce8]', accent: 'text-[#ca8a04]', border: 'border-[#065f46]' },
  'Deep Indigo': { bg: 'bg-[#1e1b4b]', text: 'text-[#e0e7ff]', accent: 'text-[#818cf8]', border: 'border-[#3730a3]' },
  'Midnight & Neon': { bg: 'bg-[#0f172a]', text: 'text-[#f8fafc]', accent: 'text-[#38bdf8]', border: 'border-[#38bdf8]' },
  'Ocean Breeze': { bg: 'bg-[#f0f9ff]', text: 'text-[#0c4a6e]', accent: 'text-[#0284c7]', border: 'border-[#bae6fd]' },
  'Monochrome': { bg: 'bg-[#fafafa]', text: 'text-[#171717]', accent: 'text-[#525252]', border: 'border-[#d4d4d4]' },
  'Sunset Glow': { bg: 'bg-[#fff7ed]', text: 'text-[#7c2d12]', accent: 'text-[#ea580c]', border: 'border-[#fed7aa]' },
};

const FONT_PAIRS = {
  'Classic Serif': { display: 'font-display', body: 'font-serif' },
  'Modern Sans': { display: 'font-montserrat', body: 'font-sans' },
  'Playful Script': { display: 'font-script', body: 'font-baskerville' },
  'Elegant Baskerville': { display: 'font-baskerville', body: 'font-serif' },
};

const THEME_STYLES = {
  classic: "timeless, oil painting style, ornate details, rich textures",
  modern: "minimalist, vector art, flat design, clean lines, geometric",
  playful: "whimsical, watercolor, bright colors, hand-drawn, cheerful",
  elegant: "sophisticated, fine line art, gold foil accents, ethereal, soft lighting",
};

const OUTPUT_STYLES = {
  'Studio Ghibli': "Studio Ghibli style, hand-drawn anime, whimsical atmosphere, lush painted backgrounds, soft lighting, masterpiece animation aesthetic",
  'Photorealistic': "high-end photorealistic photography, natural lighting, 8k resolution, sharp focus, professional camera quality, realistic skin textures",
  '3D Render': "modern 3D CGI render, Pixar style, cinematic lighting, octane render, smooth surfaces, vibrant colors, high-quality character design",
  'Artistic Cartoon': "vibrant artistic cartoon, stylized, bold colors, expressive, high quality illustration",
  'Oil Painting': "classic oil painting, visible brushstrokes, rich textures, museum quality, masterpiece, Renaissance style",
  'Cyberpunk Neon': "cyberpunk aesthetic, neon lights, futuristic, high contrast, detailed digital art, synthwave colors",
  'Vector Art': "clean vector art, flat design, bold colors, minimalist, geometric shapes, modern illustration",
  'Watercolor': "soft watercolor painting, bleeding colors, paper texture, delicate brushstrokes, artistic, ethereal",
  'Digital Art': "high quality digital painting, concept art, detailed, atmospheric lighting, professional illustration",
  'Anime/Manga': "anime style, manga illustration, cel shaded, expressive characters, vibrant colors, dynamic composition",
};

const TEMPLATES = [
  {
    id: 'self-affirmation',
    name: 'Self-Affirmation Zen',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    description: 'Perfect for personal growth and LinkedIn posters.',
    settings: {
      occasion: 'Birthday' as const,
      isSelf: true,
      theme: 'elegant' as const,
      outputStyle: 'Photorealistic' as const,
      palette: 'Champagne Gold' as const,
      vibe: 'inspirational',
      interests: 'meditation, growth, success',
      imagePreferences: 'Golden hour lighting, serene atmosphere, professional look'
    }
  },
  {
    id: 'professional-milestone',
    name: 'Career Architect',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    description: 'Sleek, professional look for LinkedIn career updates.',
    settings: {
      occasion: 'Graduation' as const,
      isSelf: true,
      theme: 'modern' as const,
      outputStyle: 'Photorealistic' as const,
      palette: 'Onyx & Gold' as const,
      vibe: 'professional',
      interests: 'leadership, innovation, strategy',
      imagePreferences: 'Modern office background, sharp focus, corporate aesthetic'
    }
  },
  {
    id: 'cyber-birthday',
    name: 'Midnight Cyber',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    description: 'High-energy neon vibes for tech lovers.',
    settings: {
      occasion: 'Birthday' as const,
      isSelf: false,
      theme: 'modern' as const,
      outputStyle: 'Cyberpunk Neon' as const,
      palette: 'Onyx & Gold' as const,
      vibe: 'energetic',
      interests: 'gaming, coding, future',
      imagePreferences: 'Neon accents, holographic elements, sharp focus'
    }
  },
  {
    id: 'ghibli-love',
    name: 'Ghibli Whimsy',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    description: 'Soft, hand-painted romantic aesthetic.',
    settings: {
      occasion: 'I Love You' as const,
      isSelf: false,
      theme: 'playful' as const,
      outputStyle: 'Studio Ghibli' as const,
      palette: 'Rose Gold' as const,
      vibe: 'heartfelt',
      interests: 'nature, cozy afternoons, tea',
      imagePreferences: 'Lush greenery, soft sunlight, hand-painted feel'
    }
  },
  {
    id: 'best-wishes-sparkle',
    name: 'Golden Wishes',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=800',
    description: 'A bright, uplifting card for any upcoming event or new journey.',
    settings: {
      occasion: 'Best Wishes' as const,
      isSelf: false,
      theme: 'elegant' as const,
      outputStyle: 'Photorealistic' as const,
      palette: 'Champagne Gold' as const,
      vibe: 'uplifting',
      interests: 'new beginnings, success, happiness',
      imagePreferences: 'Bright, airy, golden hour lighting, subtle sparkles or bokeh'
    }
  },
  {
    id: 'pixar-pride',
    name: 'Pixar Pride',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=800',
    description: 'Clean, 3D rendered celebratory look.',
    settings: {
      occasion: 'Graduation' as const,
      isSelf: false,
      theme: 'modern' as const,
      outputStyle: '3D Render' as const,
      palette: 'Deep Indigo' as const,
      vibe: 'proud',
      interests: 'achievement, future, books',
      imagePreferences: 'Cinematic lighting, smooth surfaces, vibrant colors'
    }
  },
  {
    id: 'wedding-bliss',
    name: 'Eternal Wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    description: 'Elegant and timeless wedding celebration.',
    settings: {
      occasion: 'Wedding' as const,
      isSelf: false,
      theme: 'elegant' as const,
      outputStyle: 'Photorealistic' as const,
      palette: 'Champagne Gold' as const,
      vibe: 'romantic',
      interests: 'love, flowers, celebration',
      imagePreferences: 'Soft focus, floral arrangements, elegant lighting'
    }
  },
  {
    id: 'new-arrival',
    name: 'Baby Dream',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
    description: 'Soft and playful for the newest family member.',
    settings: {
      occasion: 'New Baby' as const,
      isSelf: false,
      theme: 'playful' as const,
      outputStyle: 'Artistic Cartoon' as const,
      palette: 'Deep Indigo' as const,
      vibe: 'cheerful',
      interests: 'toys, lullabies, clouds',
      imagePreferences: 'Pastel colors, soft textures, cute elements'
    }
  },
  {
    id: 'anniversary-gold',
    name: 'Golden Anniversary',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800',
    description: 'Rich and intimate for milestone anniversaries.',
    settings: {
      occasion: 'Anniversary' as const,
      isSelf: false,
      theme: 'classic' as const,
      outputStyle: 'Oil Painting' as const,
      palette: 'Emerald & Gold' as const,
      vibe: 'heartfelt',
      interests: 'memories, travel, fine dining',
      imagePreferences: 'Rich textures, warm candlelight, museum quality'
    }
  },
  {
    id: 'anniversary-modern',
    name: 'Modern Love',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    description: 'Sleek and contemporary anniversary celebration.',
    settings: {
      occasion: 'Anniversary' as const,
      isSelf: false,
      theme: 'modern' as const,
      outputStyle: 'Vector Art' as const,
      palette: 'Midnight & Neon' as const,
      vibe: 'fun',
      interests: 'city life, cocktails, modern art',
      imagePreferences: 'Minimalist, vibrant accents, clean lines'
    }
  },
  {
    id: 'new-baby-joy',
    name: 'Bundle of Joy',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800',
    description: 'Bright and cheerful baby announcement.',
    settings: {
      occasion: 'New Baby' as const,
      isSelf: false,
      theme: 'playful' as const,
      outputStyle: '3D Render' as const,
      palette: 'Ocean Breeze' as const,
      vibe: 'fun',
      interests: 'toys, balloons, sunshine',
      imagePreferences: 'Bright, cheerful, soft 3D lighting'
    }
  },
  {
    id: 'exam-wishes-focus',
    name: 'Laser Focus',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    description: 'Encouraging and focused for upcoming exams.',
    settings: {
      occasion: 'Exam Wishes' as const,
      isSelf: false,
      theme: 'modern' as const,
      outputStyle: 'Digital Art' as const,
      palette: 'Monochrome' as const,
      vibe: 'inspirational',
      interests: 'books, coffee, success',
      imagePreferences: 'Clean desk, warm light, motivational'
    }
  },
  {
    id: 'exam-wishes-luck',
    name: 'Good Luck Charm',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    description: 'A cheerful boost of luck for test day.',
    settings: {
      occasion: 'Exam Wishes' as const,
      isSelf: false,
      theme: 'playful' as const,
      outputStyle: 'Anime/Manga' as const,
      palette: 'Sunset Glow' as const,
      vibe: 'fun',
      interests: 'stars, clovers, victory',
      imagePreferences: 'Bright, energetic, supportive'
    }
  },
  {
    id: 'valentines-dream',
    name: 'Valentine Dream',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    description: 'Deep reds and artistic flair for Valentine\'s Day.',
    settings: {
      occasion: 'Valentine\'s' as const,
      isSelf: false,
      theme: 'elegant' as const,
      outputStyle: 'Photorealistic' as const,
      palette: 'Rose Gold' as const,
      vibe: 'romantic',
      interests: 'roses, chocolate, candlelit dinners',
      imagePreferences: 'Deep red tones, soft bokeh, romantic atmosphere'
    }
  },
  {
    id: 'gothic-romance',
    name: 'Gothic Romance',
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800',
    description: 'Dark, moody, and deeply emotional aesthetic.',
    settings: {
      occasion: 'I Love You' as const,
      isSelf: false,
      theme: 'classic' as const,
      outputStyle: 'Oil Painting' as const,
      palette: 'Onyx & Gold' as const,
      vibe: 'soulful',
      interests: 'poetry, old books, starlight',
      imagePreferences: 'Moody lighting, dramatic shadows, Victorian aesthetic'
    }
  },
  {
    id: 'minimalist-zen',
    name: 'Minimalist Zen',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-clean and modern for personal clarity.',
    settings: {
      occasion: 'Birthday' as const,
      isSelf: true,
      theme: 'modern' as const,
      outputStyle: 'Photorealistic' as const,
      palette: 'Champagne Gold' as const,
      vibe: 'peaceful',
      interests: 'simplicity, focus, nature',
      imagePreferences: 'Minimalist composition, soft natural light, clean space'
    }
  },
  {
    id: 'retro-pop',
    name: 'Retro Pop',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
    description: 'Vibrant 80s style for high-energy celebrations.',
    settings: {
      occasion: 'Birthday' as const,
      isSelf: false,
      theme: 'playful' as const,
      outputStyle: 'Artistic Cartoon' as const,
      palette: 'Deep Indigo' as const,
      vibe: 'energetic',
      interests: 'music, dancing, parties',
      imagePreferences: 'Vibrant colors, geometric patterns, retro aesthetic'
    }
  }
];

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function CustomDropdown({ value, options, onChange }: { value: string, options: { value: string, label: string, icon?: React.ReactNode, group?: string }[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  const hasGroups = options.some(o => o.group);
  const groupedOptions = hasGroups ? options.reduce((acc, option) => {
    const group = option.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, typeof options>) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-input rounded-2xl p-4 pr-12 text-base font-bold text-left flex items-center gap-3 transition-all hover:shadow-md"
      >
        {selectedOption.icon && <span className="text-xl">{selectedOption.icon}</span>}
        <span className="flex-1">{selectedOption.label}</span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500 dark:text-purple-400">
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800"
          >
            <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
              {hasGroups && groupedOptions ? (
                Object.entries(groupedOptions).map(([group, groupOptions], idx) => (
                  <div key={`${group}-${idx}`}>
                    <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 bg-stone-50/50 dark:bg-stone-800/50 sticky top-0 backdrop-blur-sm z-10">
                      {group}
                    </div>
                    {groupOptions.map((option, idx) => (
                      <button
                        key={`${option.value}-${idx}`}
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          value === option.value 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' 
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium'
                        }`}
                      >
                        {option.icon && <span className="text-xl">{option.icon}</span>}
                        {option.label}
                        {value === option.value && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                options.map((option, idx) => (
                  <button
                    key={`${option.value}-${idx}`}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      value === option.value 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' 
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium'
                    }`}
                  >
                    {option.icon && <span className="text-xl">{option.icon}</span>}
                    {option.label}
                    {value === option.value && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-500/10 dark:bg-rose-500/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[80px]"
      />
      
      {/* Subtle Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-indigo-500/30 dark:bg-purple-400/30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.1,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [formStep, setFormStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gathering aura...');
  const [subjectImage, setSubjectImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Gathering aura...',
      'Aligning chakras...',
      'Painting your masterpiece...',
      'Adding a touch of magic...',
      'Perfecting the colors...',
      'Almost there...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [library, setLibrary] = useState<SavedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('aura-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('aura-app-theme') || 'minimalist';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTemplates = () => {
    setShowTemplates(!showTemplates);
    setShowLibrary(false);
    setShowHistory(false);
    setShowThemeMenu(false);
  };

  const toggleLibrary = () => {
    setShowLibrary(!showLibrary);
    setShowTemplates(false);
    setShowHistory(false);
    setShowThemeMenu(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setShowTemplates(false);
    setShowLibrary(false);
    setShowThemeMenu(false);
  };

  const toggleThemeMenu = () => {
    setShowThemeMenu(!showThemeMenu);
    setShowTemplates(false);
    setShowLibrary(false);
    setShowHistory(false);
  };

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aura-dark-mode', isDarkMode.toString());
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-minimalist', 'theme-ocean', 'theme-forest', 'theme-sunset');
    // Add selected theme class
    document.documentElement.classList.add(`theme-${appTheme}`);
    localStorage.setItem('aura-app-theme', appTheme);
  }, [isDarkMode, appTheme]);
  
  const [cardData, setCardData] = useState<CardData>({
    occasion: 'Birthday',
    recipient: '',
    age: '',
    yearsTogether: '',
    degree: '',
    babyName: '',
    coupleNames: '',
    achievement: '',
    event: '',
    examType: '',
    relationship: '',
    vibe: 'heartfelt',
    interests: '',
    imagePreferences: '',
    message: '',
    imageUrl: '',
    theme: 'elegant',
    palette: 'Champagne Gold',
    fontPair: 'Classic Serif',
    imageSize: '1K',
    aspectRatio: '1:1',
    outputStyle: 'Photorealistic',
    preserveLikeness: true,
    signature: '',
    isSelf: false,
  });

  useEffect(() => {
    checkKey();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedHistory = await get('aura_history');
        if (savedHistory) setHistory(savedHistory);
        const savedLibrary = await get('aura_library');
        if (savedLibrary) setLibrary(savedLibrary);
      } catch (e) {
        console.error("Failed to load from IndexedDB:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      set('aura_history', history).catch(e => console.error("Failed to save history:", e));
    }
  }, [history, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      set('aura_library', library).catch(e => console.error("Failed to save library:", e));
    }
  }, [library, isLoaded]);

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const checkKey = async () => {
    try {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      console.error("Failed to check API key:", e);
      setHasKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      }
    } catch (e) {
      console.error("Failed to open key selection:", e);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubjectImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) processFile(file);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardData.imageUrl) return;
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, 1200]
      });

      // Add image
      const imgProps = pdf.getImageProperties(cardData.imageUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(cardData.imageUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Add text below image
      if (cardData.message) {
        pdf.setFontSize(16);
        const splitText = pdf.splitTextToSize(cardData.message, pdfWidth - 40);
        pdf.text(splitText, 20, pdfHeight + 40);
      }

      pdf.save(`aura-card-${cardData.recipient.toLowerCase() || 'download'}.pdf`);
    } catch (err) {
      console.error("PDF Download failed:", err);
      setErrorMessage("Failed to generate PDF. You can still download the image.");
    }
  };

  const handleDownload = async (urlToDownload?: string, filename?: string) => {
    const targetUrl = urlToDownload || cardData.imageUrl;
    if (!targetUrl) return;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `aura-card-${cardData.recipient.toLowerCase().replace(/\s+/g, '-') || 'birthday'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = filename || 'aura-card.png';
      link.click();
    }
  };

  const removeFromLibrary = (id: string) => {
    setLibrary(prev => prev.filter(item => item.id !== id));
  };

  const clearLibrary = () => {
    setLibrary([]);
  };

  const saveToLibrary = () => {
    if (!cardData.imageUrl) return;
    const newItem: SavedItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      title: `${cardData.theme} ${cardData.occasion}`,
      description: `A ${cardData.vibe} card for ${cardData.recipient}`,
      tags: [cardData.theme, cardData.occasion.toLowerCase(), cardData.outputStyle.split(' ')[0].toLowerCase()],
      createdAt: Date.now(),
      data: { ...cardData },
      subjectImage: subjectImage
    };
    setLibrary(prev => [newItem, ...prev]);
    setSavedToLibrary(true);
    setTimeout(() => setSavedToLibrary(false), 2000);
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setCardData(item.data);
    setSubjectImage(item.subjectImage);
    setView('preview');
    setShowHistory(false);
  };

  const copyMessage = () => {
    if (!cardData.message) return;
    navigator.clipboard.writeText(cardData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isSharing, setIsSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleNativeShare = async () => {
    if (!cardData.imageUrl) return;
    setIsSharing(true);
    try {
      const response = await fetch(cardData.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `aura-card-${cardData.recipient.toLowerCase() || 'share'}.png`, { type: blob.type });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Aura Birthday Card',
          text: cardData.message || 'Check out this birthday card I made!',
          files: [file],
        });
      } else {
        setErrorMessage("Native sharing is not supported on this device/browser.");
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardData.imageUrl) return;
    setIsSharing(true);
    try {
      const response = await fetch(cardData.imageUrl);
      const blob = await response.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } else {
        setErrorMessage("Copying images to clipboard is not supported on this browser.");
      }
    } catch (err) {
      console.error("Copy failed:", err);
      setErrorMessage("Failed to copy image. Try downloading it instead.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setCardData(prev => ({
      ...prev,
      ...template.settings
    }));
  };

  const generateCard = async () => {
    setLoading(true);
    // Clear previous image to show loading state if regenerating
    setCardData(prev => ({ ...prev, imageUrl: '' }));
    
    const withTimeout = (promise: Promise<any>, ms: number) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
      ]);
    };

    const withRetry = async (fn: () => Promise<any>, maxRetries = 5, initialDelay = 3000) => {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          return await fn();
        } catch (error: any) {
          const isRetryable = 
            error.status === 'UNAVAILABLE' || 
            error.code === 503 || 
            error.message?.toLowerCase().includes("503") || 
            error.message?.toLowerCase().includes("high demand") ||
            error.message?.toLowerCase().includes("temporary") ||
            error.message?.toLowerCase().includes("busy");
            
          if (isRetryable && retries < maxRetries - 1) {
            retries++;
            // Exponential backoff: 3s, 6s, 12s, 24s, 48s
            const delay = initialDelay * Math.pow(2, retries - 1);
            console.log(`Retrying API call (${retries}/${maxRetries}) due to high demand. Waiting ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }
      }
    };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      // Build context strings
      const occasion = cardData.occasion;
      const ageStr = cardData.age ? `turning ${cardData.age}` : '';
      const yearsStr = cardData.yearsTogether ? `celebrating ${cardData.yearsTogether}` : '';
      const degreeStr = cardData.degree ? `graduating with a degree in ${cardData.degree}` : '';
      const babyStr = cardData.babyName ? `named ${cardData.babyName}` : '';
      const coupleStr = cardData.coupleNames ? `for ${cardData.coupleNames}` : '';
      const achievementStr = cardData.achievement ? `for ${cardData.achievement}` : '';
      const eventStr = cardData.event ? `for ${cardData.event}` : '';
      const examStr = cardData.examType ? `for their ${cardData.examType}` : '';
      
      const relationshipStr = cardData.isSelf ? 'myself' : (cardData.relationship ? `my ${cardData.relationship}` : 'someone special');
      const interestsStr = cardData.interests ? `They love ${cardData.interests}.` : '';
      const recipientStr = cardData.isSelf ? 'me' : (cardData.recipient || 'a friend');
      const signatureStr = cardData.signature ? ` Also include a small signature text that says "${cardData.signature}" at the bottom or in a suitable corner.` : '';

      // 1. Generate Message
      const vibeDescription = cardData.vibe === 'professional' 
        ? 'professional, respectful, and sophisticated' 
        : cardData.vibe;

      let contextInfo = '';
      if (occasion === 'Birthday') contextInfo = ageStr;
      else if (occasion === 'Anniversary') contextInfo = yearsStr;
      else if (occasion === 'Graduation') contextInfo = degreeStr;
      else if (occasion === 'New Baby') contextInfo = babyStr;
      else if (occasion === 'Wedding') contextInfo = coupleStr;
      else if (occasion === 'Congratulations') contextInfo = achievementStr;
      else if (occasion === 'Best Wishes') contextInfo = eventStr;
      else if (occasion === 'Exam Wishes') contextInfo = examStr;

      const perspectiveInstruction = cardData.isSelf 
        ? "Write this as a self-affirmation or personal celebration message from a first-person perspective (using 'I', 'me', 'my'). It should be empowering and reflective." 
        : `Write this as a message for ${relationshipStr}, ${recipientStr}.`;

      const messageResponse = await withRetry(() => withTimeout(ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a short, ${vibeDescription} ${occasion} message. ${perspectiveInstruction} ${contextInfo} ${interestsStr} Keep it under 50 words. Do not use placeholders or square brackets.`,
      }), 30000));
      
      const message = messageResponse.text || `Happy ${occasion}!`;

      // 2. Generate Image with Nano Banana Pro
      const styleDesc = THEME_STYLES[cardData.theme];
      const outputStyleDesc = OUTPUT_STYLES[cardData.outputStyle];
      const userPrefs = cardData.imagePreferences ? `Include: ${cardData.imagePreferences}.` : '';
      
      let imagePrompt = `A high-quality, professional ${occasion} card illustration for ${recipientStr}. ${contextInfo} Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be beautiful and celebratory for the occasion of ${occasion}. Please include the text "Happy ${occasion} ${recipientStr}!" artistically integrated into the design.${signatureStr}`;
      
      if (cardData.isSelf) {
        imagePrompt = `A high-quality, professional ${occasion} personal poster or card for myself. ${contextInfo} Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be empowering, beautiful, and reflective of my personal journey. Include a powerful first-person quote or "Happy ${occasion} to Me!" integrated into the design.${signatureStr}`;
      }

      if (occasion === 'Valentine\'s') {
        imagePrompt = `A high-quality, professional Valentine's Day card illustration for ${recipientStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be romantic, intimate, and beautiful with symbols of love. Please include the text "Be My Valentine!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'I Love You') {
        imagePrompt = `A high-quality, professional "I Love You" card illustration for ${recipientStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be soulful, intimate, and deeply emotional. Please include the text "I Love You" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Graduation') {
        imagePrompt = `A high-quality, professional Graduation card illustration for ${recipientStr}. ${degreeStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be proud, celebratory, and look towards the future. Please include the text "Class of 2026" or "Congratulations!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Wedding') {
        imagePrompt = `A high-quality, professional Wedding card illustration for ${coupleStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be elegant, romantic, and celebratory of a new union. Please include the text "Congratulations on your Wedding!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'New Baby') {
        imagePrompt = `A high-quality, professional New Baby card illustration for ${babyStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be soft, whimsical, and celebratory of a new life. Please include the text "Welcome to the World!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Anniversary') {
        imagePrompt = `A high-quality, professional Anniversary card illustration for ${recipientStr}. ${yearsStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be romantic, reflective, and celebratory of lasting love. Please include the text "Happy Anniversary!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Mother\'s Day') {
        imagePrompt = `A high-quality, professional Mother's Day card illustration for ${recipientStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be warm, loving, and appreciative. Please include the text "Happy Mother's Day!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Father\'s Day') {
        imagePrompt = `A high-quality, professional Father's Day card illustration for ${recipientStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be warm, respectful, and celebratory. Please include the text "Happy Father's Day!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Christmas') {
        imagePrompt = `A high-quality, professional Christmas card illustration for ${recipientStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be festive, joyful, and magical. Please include the text "Merry Christmas!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Thank You') {
        imagePrompt = `A high-quality, professional Thank You card illustration for ${recipientStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be warm, appreciative, and sincere. Please include the text "Thank You!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Congratulations') {
        imagePrompt = `A high-quality, professional Congratulations card illustration for ${recipientStr}. ${achievementStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be celebratory, proud, and exciting. Please include the text "Congratulations!" artistically integrated into the design.${signatureStr}`;
      } else if (occasion === 'Exam Wishes') {
        imagePrompt = `A high-quality, professional Exam Wishes card illustration for ${recipientStr}. ${examStr}. Style: ${styleDesc} and ${outputStyleDesc}. ${interestsStr} ${userPrefs} The image should be encouraging, focused, and supportive. Please include the text "Good Luck!" artistically integrated into the design.${signatureStr}`;
      }

      if (subjectImage) {
        const likenessInstruction = cardData.preserveLikeness 
          ? "CRITICAL: Maintain the person's facial features and likeness EXACTLY as shown in the photo. Do not stylize or change their face. Keep it photorealistic for the person's face." 
          : "Render the person in a stylized, artistic way (like a cartoon or painting) while keeping recognizable features but matching the overall artistic style.";
          
        const subjectRef = cardData.isSelf ? 'myself' : 'the person';
        imagePrompt = `Create a stylized ${occasion} card illustration featuring ${subjectRef} in the attached photo. ${likenessInstruction} Style: ${styleDesc} and ${outputStyleDesc}. Surround them with elements related to ${occasion} and ${cardData.interests || 'celebration'}. ${userPrefs} Include text related to ${occasion} integrated into the art.${signatureStr}`;
      }

      const contents: any = {
        parts: [{ text: imagePrompt }]
      };
      
      if (subjectImage) {
        contents.parts.push({
          inlineData: {
            data: subjectImage.split(',')[1],
            mimeType: "image/png"
          }
        });
      }

      const imageResponse = await withRetry(() => withTimeout(ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: contents,
        config: {
          imageConfig: { 
            aspectRatio: cardData.aspectRatio,
            imageSize: cardData.imageSize
          }
        }
      }), 60000));

      let imageUrl = "";
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      setCardData(prev => ({ ...prev, message, imageUrl }));
      
      if (imageUrl) {
        const newHistoryItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          timestamp: Date.now(),
          title: `${cardData.theme} ${cardData.occasion} for ${cardData.recipient}`,
          data: { ...cardData, message, imageUrl },
          subjectImage: subjectImage
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Limit to 20 items to save space
      }

      setView('preview');
    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setErrorMessage("Please ensure you have selected a valid API key for Nano Banana Pro.");
      } else if (error.message?.includes("high demand") || error.code === 503 || error.message?.includes("Timeout")) {
        setErrorMessage("The AI model is currently very busy or taking too long. Please wait a moment and try again.");
      } else {
        setErrorMessage("Something went wrong while generating your masterpiece. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentPalette = PALETTES[cardData.palette];
  const currentFonts = FONT_PAIRS[cardData.fontPair];

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <BackgroundOrbs />
        <div className="max-w-md text-center space-y-6 glass-panel p-10 rounded-[32px]">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-3xl serif italic text-stone-900">API Key Required</h2>
          <p className="text-stone-600 leading-relaxed">
            To use the high-quality Nano Banana Pro model, you must select a paid API key from your Google Cloud project.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full py-4 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Select API Key
          </button>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">billing documentation</a> for more info.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8" onPaste={handlePaste}>
      <BackgroundOrbs />
      {/* History Sidebar */}
      <AnimatePresence>
        {showTemplates && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplates(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl glass-panel z-50 p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fff1f2] dark:bg-rose-900/50 rounded-xl">
                    <Palette className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                  </div>
                  <h2 className="text-2xl serif font-bold text-stone-900 dark:text-rose-50">Aura Templates</h2>
                </div>
                <button 
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-rose-900/50 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-stone-600 dark:text-rose-300/50" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {TEMPLATES.map((template, idx) => (
                  <div 
                    key={`${template.id}-${idx}`} 
                    className="group glass-panel rounded-[32px] overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => {
                      setCardData({ 
                        ...cardData, 
                        ...template.settings,
                        imageUrl: '',
                        message: ''
                      });
                      setShowTemplates(false);
                    }}
                  >
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img 
                        src={template.image} 
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                        <div className="text-white">
                          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                            {template.name}
                            {template.id === 'self-affirmation' && (
                              <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Featured</span>
                            )}
                          </h3>
                          <p className="text-white/80 text-sm leading-tight">{template.description}</p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 glass-panel px-4 py-2 rounded-full text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                        {template.settings.isSelf ? 'Self-Integration' : 'Gift Mode'}
                      </div>
                    </div>
                    <div className="p-6 flex items-center justify-between bg-white/30 dark:bg-rose-950/50">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 glass-input rounded-full text-[10px] uppercase font-bold text-stone-700 dark:text-rose-300/50">
                          {template.settings.outputStyle}
                        </span>
                        <span className="px-3 py-1 glass-input rounded-full text-[10px] uppercase font-bold text-stone-700 dark:text-rose-300/50">
                          {template.settings.theme}
                        </span>
                      </div>
                      <span className="text-rose-500 dark:text-rose-400 font-bold text-sm flex items-center gap-1">
                        Use this Style <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-stone-200/50 dark:border-stone-800/50 z-50 p-6 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100/50 dark:bg-rose-900/30 rounded-xl">
                    <History className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Session History</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-8">
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-full">
                    <Sparkles className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Your past sessions will appear here.<br/>Start your first reading!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {history.map((item, idx) => {
                      const isActive = cardData.recipient === item.data.recipient && cardData.message === item.data.message;
                      return (
                        <motion.div 
                          key={`${item.id}-${idx}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group relative rounded-2xl p-4 cursor-pointer transition-all ${isActive ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/50' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 border border-transparent'}`}
                          onClick={() => restoreFromHistory(item)}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${isActive ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100'}`}>
                                {item.title || `For ${item.data.recipient}`}
                              </p>
                              <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLibrary(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-stone-200/50 dark:border-stone-800/50 z-50 p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-xl">
                    <BookMarked className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Your Vault</h2>
                </div>
                <div className="flex items-center gap-2">
                  {library.length > 0 && (
                    <button
                      onClick={clearLibrary}
                      className="px-3 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button 
                    onClick={() => setShowLibrary(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                  </button>
                </div>
              </div>

              <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl pb-6 shrink-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="text"
                    placeholder="Search your saved cards and templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-100 dark:bg-stone-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-stone-200 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pb-8">
                {library.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-8">
                    <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-full">
                      <BookmarkPlus className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 font-medium">Your library is empty.<br/>Save a card to see it here!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {/* Render Saved Items */}
                      {library.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))).map((item, idx) => (
                        <motion.div 
                          key={`${item.id}-${idx}`}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group relative bg-white dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 dark:bg-stone-900">
                            {item.data.imageUrl ? (
                              <img 
                                src={item.data.imageUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-stone-300 dark:text-stone-700" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardData(item.data);
                                  setShowLibrary(false);
                                }}
                                className="p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-xl text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform shadow-sm"
                                title="Load Card"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromLibrary(item.id);
                                }}
                                className="p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-xl text-rose-600 dark:text-rose-400 hover:scale-110 transition-transform shadow-sm"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-1 truncate">{item.title}</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-4">{item.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <header className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 z-[100] flex justify-between items-center pointer-events-none">
        {/* Left: Library */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
          >
            <Layout className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Templates
          </button>
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
          >
            <BookMarked className="w-4 h-4 text-indigo-500 dark:text-purple-400" />
            Library
          </button>
        </div>

        {/* Right: Theme & History */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
              title="Workspace Theme"
            >
              <Palette className="w-4 h-4 text-rose-500" />
            </button>
            <AnimatePresence>
              {showThemeMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-48 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800 z-50 p-3"
                >
                  <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">Workspace Theme</div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => { setAppTheme('minimalist'); setShowThemeMenu(false); }}
                      className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'minimalist' ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'}`}
                      title="Minimalist"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setAppTheme('ocean'); setShowThemeMenu(false); }}
                      className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'ocean' ? 'bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-sky-500 dark:text-sky-400'}`}
                      title="Ocean Breeze"
                    >
                      <Droplets className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setAppTheme('forest'); setShowThemeMenu(false); }}
                      className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'forest' ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-emerald-500 dark:text-emerald-400'}`}
                      title="Forest Canopy"
                    >
                      <TreePine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setAppTheme('sunset'); setShowThemeMenu(false); }}
                      className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'sunset' ? 'bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-orange-500 dark:text-orange-400'}`}
                      title="Sunset Glow"
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
          >
            <History className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            History
          </button>
        </div>
      </header>

      {/* Header */}
      <div className="mb-8 text-center relative mt-16 md:mt-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2 cursor-pointer"
          onClick={() => {
            setView('form');
            setFormStep(1);
          }}
        >
          <Sparkles className="w-8 h-8 text-indigo-500 dark:text-purple-400" />
          <h1 className="text-5xl md:text-6xl serif font-light tracking-tight iridescent-text">AuraCards</h1>
        </motion.div>
        <p className="text-stone-700 dark:text-stone-400 text-xs uppercase tracking-[0.5em] font-bold">Nano Banana Pro Edition</p>
      </div>

      <main className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center min-h-[60vh] w-full glass-panel rounded-[40px] p-12"
            >
              <div className="relative w-40 h-40 mb-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-4 border-indigo-500 border-r-4 border-transparent opacity-50"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-b-4 border-rose-500 border-l-4 border-transparent opacity-50"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 blur-xl opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-indigo-500 dark:text-purple-400 animate-pulse" />
                </div>
              </div>
              
              <motion.h3 
                key={loadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500 dark:from-indigo-400 dark:to-rose-400 mb-6 text-center"
              >
                {loadingMessage}
              </motion.h3>
              
              <div className="flex flex-col items-center gap-3 text-stone-500 dark:text-stone-400">
                <p className="text-sm font-medium uppercase tracking-[0.2em] animate-pulse">Crafting your unique design</p>
                <div className="flex gap-2 mt-4">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 rounded-full bg-purple-500" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
              </div>
            </motion.div>
          ) : view === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-panel rounded-[40px] p-10 md:p-12 space-y-8"
            >
              {/* Stepper */}
              <div className="flex justify-between items-center mb-8 px-2 md:px-12">
                {[
                  { num: 1, label: 'Occasion' },
                  { num: 2, label: 'Details' },
                  { num: 3, label: 'Style' }
                ].map((s, i) => (
                  <div key={`${s.num}-${i}`} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${formStep >= s.num ? 'iridescent-bg text-white shadow-lg scale-110' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'}`}>
                        {s.num}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest absolute mt-14 ${formStep >= s.num ? 'text-indigo-600 dark:text-purple-400' : 'text-stone-400'}`}>{s.label}</span>
                    </div>
                    {i < 2 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${formStep > s.num ? 'iridescent-bg' : 'bg-stone-200 dark:bg-stone-800'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="min-h-[400px]">
              {formStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 pt-8"
                >
                  <div className="flex items-center gap-3 text-black dark:text-white mb-6">
                    <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                      <Sparkles className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl serif font-bold">What are we celebrating?</h2>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(
                      (Object.keys(OCCASIONS) as Array<keyof typeof OCCASIONS>).reduce((acc, occ) => {
                        const group = OCCASIONS[occ].group || 'Other';
                        if (!acc[group]) acc[group] = [];
                        acc[group].push({ key: occ, ...OCCASIONS[occ] });
                        return acc;
                      }, {} as Record<string, any[]>)
                    ).map(([group, items], idx) => (
                      <div key={`${group}-${idx}`} className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-1">
                          {group}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {items.map((item, idx) => {
                            const isSelected = cardData.occasion === item.key;
                            return (
                              <button
                                key={`${item.key}-${idx}`}
                                type="button"
                                onClick={() => setCardData({ ...cardData, occasion: item.key as keyof typeof OCCASIONS })}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 border-2 ${
                                  isSelected 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400 shadow-md scale-[1.02]' 
                                    : 'border-transparent bg-white/60 dark:bg-stone-800/60 hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm hover:scale-[1.02]'
                                }`}
                              >
                                <span className="text-3xl mb-2">{item.icon}</span>
                                <span className={`text-sm font-medium text-center ${isSelected ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-stone-700 dark:text-stone-300'}`}>
                                  {item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Templates Quick Select */}
                  <div className="pt-8">
                     <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400 mb-4">Or start with a curated Aura</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {TEMPLATES.map((t, idx) => (
                         <button
                           key={`${t.name}-${idx}`}
                           onClick={() => applyTemplate(t)}
                           className="text-left p-4 rounded-2xl border-2 border-transparent hover:border-indigo-500/30 glass-input transition-all group"
                         >
                           <div className="flex items-center justify-between mb-2">
                             <span className="font-bold text-sm text-black dark:text-white">{t.name}</span>
                             <span className="text-xs text-indigo-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Apply →</span>
                           </div>
                           <p className="text-xs text-stone-500 dark:text-stone-400">{t.description}</p>
                         </button>
                       ))}
                     </div>
                  </div>
                </motion.div>
              )}

              {formStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 pt-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-black dark:text-white">
                      <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                        <Heart className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                      </div>
                      <h2 className="text-2xl serif font-bold">Who is this for?</h2>
                    </div>
                    <div className="flex bg-white/50 dark:bg-stone-950/50 p-1 rounded-xl">
                      <button 
                        onClick={() => setCardData({...cardData, isSelf: false})}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!cardData.isSelf ? 'iridescent-bg shadow-sm text-white' : 'text-stone-600 dark:text-stone-500'}`}
                      >
                        Gift
                      </button>
                      <button 
                        onClick={() => setCardData({...cardData, isSelf: true})}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${cardData.isSelf ? 'iridescent-bg shadow-sm text-white' : 'text-stone-600 dark:text-stone-500'}`}
                      >
                        Self
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">
                        {cardData.isSelf ? 'My Name' : 'Name'}
                      </label>
                      <input 
                        type="text" 
                        value={cardData.recipient}
                        onChange={e => setCardData({...cardData, recipient: e.target.value})}
                        placeholder={cardData.isSelf ? 'Your Name' : 'e.g. Sarah'}
                        className="w-full glass-input rounded-2xl p-4 text-base outline-none"
                      />
                    </div>
                    
                    {OCCASIONS[cardData.occasion].field && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">
                          {OCCASIONS[cardData.occasion].label === 'Anniversary' ? 'Years' : 
                           OCCASIONS[cardData.occasion].label === 'Graduation' ? 'Degree' :
                           OCCASIONS[cardData.occasion].label === 'Wedding' ? 'Couple' :
                           OCCASIONS[cardData.occasion].label === 'New Baby' ? 'Baby Name' : 
                           OCCASIONS[cardData.occasion].label === 'Congratulations' ? 'Achievement' : 
                           OCCASIONS[cardData.occasion].label === 'Best Wishes' ? 'Event' : 'Age'}
                        </label>
                        <input 
                          type="text" 
                          value={cardData[OCCASIONS[cardData.occasion].field as keyof CardData] as string}
                          onChange={e => setCardData({...cardData, [OCCASIONS[cardData.occasion].field as string]: e.target.value})}
                          placeholder={OCCASIONS[cardData.occasion].placeholder}
                          className="w-full glass-input rounded-2xl p-4 text-base outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">
                        {cardData.isSelf ? 'My Focus' : 'Relation'}
                      </label>
                      <input 
                        type="text" 
                        value={cardData.relationship}
                        onChange={e => setCardData({...cardData, relationship: e.target.value})}
                        placeholder={cardData.isSelf ? 'e.g. Personal Growth' : 'e.g. Sister'}
                        className="w-full glass-input rounded-2xl p-4 text-base outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">
                        {cardData.isSelf ? 'Interests & Goals' : 'Interests'}
                      </label>
                      <input 
                        type="text"
                        value={cardData.interests}
                        onChange={e => setCardData({...cardData, interests: e.target.value})}
                        placeholder={cardData.isSelf ? 'e.g. meditation, fitness...' : 'e.g. hiking, coffee...'}
                        className="w-full glass-input rounded-2xl p-4 text-base outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-black dark:text-white">
                        <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                          <ImageIcon className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl serif font-bold">Subject Photo (Optional)</h2>
                      </div>
                      <div 
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group overflow-hidden ${
                          subjectImage ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-emerald-400 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        }`}
                      >
                        {subjectImage ? (
                          <>
                            <img src={subjectImage} alt="Subject" className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]">
                              <Check className="w-8 h-8 text-emerald-600 mb-1" />
                              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Photo Ready</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSubjectImage(null); }}
                                className="mt-2 p-1.5 bg-white rounded-lg text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Upload Reference</p>
                              <p className="text-[10px] text-emerald-400 font-medium">Drag & drop or click</p>
                            </div>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden" 
                          accept="image/*" 
                        />
                      </div>

                      {subjectImage && (
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setCardData({...cardData, preserveLikeness: !cardData.preserveLikeness})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                              cardData.preserveLikeness ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                cardData.preserveLikeness ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <div>
                            <p className="text-sm font-bold text-black dark:text-stone-200">Preserve Likeness</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">Keep facial features photorealistic</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {formStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 pt-8"
                >
                  <div className="flex items-center gap-3 text-black dark:text-white mb-6">
                    <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                      <Palette className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl serif font-bold">Design & Style</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">Vibe / Tone</label>
                      <CustomDropdown
                        value={cardData.vibe}
                        onChange={(val) => setCardData({ ...cardData, vibe: val })}
                        options={['heartfelt', 'funny', 'poetic', 'minimalist', 'professional'].map(v => ({
                          value: v,
                          label: v.charAt(0).toUpperCase() + v.slice(1)
                        }))}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">Typography</label>
                      <div className="grid gap-2">
                        {(Object.keys(FONT_PAIRS) as Array<keyof typeof FONT_PAIRS>).map((f, idx) => (
                          <button
                            key={`${f}-${idx}`}
                            onClick={() => setCardData({...cardData, fontPair: f})}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                              cardData.fontPair === f 
                              ? 'border-sky-500 bg-sky-100 dark:bg-sky-900/30 shadow-sm' 
                              : 'glass-input text-black dark:text-stone-200 hover:border-sky-300 dark:hover:border-sky-700'
                            }`}
                          >
                            <div className={`text-sm mb-0.5 ${FONT_PAIRS[f].display} text-black dark:text-rose-50`}>Happy Birthday</div>
                            <div className={`text-[10px] text-stone-500 dark:text-rose-300/50 ${FONT_PAIRS[f].body} uppercase tracking-widest`}>{f}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-stone-600 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-all group mx-auto"
                    >
                      <Settings2 className={`w-4 h-4 transition-transform duration-500 ${showAdvanced ? 'rotate-180 text-indigo-500 dark:text-purple-400' : ''}`} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                        {showAdvanced ? 'Hide Advanced Studio Settings' : 'Detailed Creative Controls'}
                      </span>
                      {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid md:grid-cols-2 gap-10 pt-6">
                          {/* Left Column: Visual Style */}
                          <div className="space-y-8">
                            <div className="space-y-6">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400 mb-3">Aspect Ratio</label>
                                <div className="grid grid-cols-5 gap-2">
                                  {(Object.keys(ASPECT_RATIOS) as Array<keyof typeof ASPECT_RATIOS>).map((ratio, idx) => (
                                    <button
                                      key={`${ratio}-${idx}`}
                                      onClick={() => setCardData({...cardData, aspectRatio: ratio})}
                                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                        cardData.aspectRatio === ratio 
                                        ? 'iridescent-bg text-white border-transparent shadow-md' 
                                        : 'glass-input text-black dark:text-stone-200 hover:border-stone-200 dark:hover:border-stone-800'
                                      }`}
                                      title={ASPECT_RATIOS[ratio].label}
                                    >
                                      <span className="text-lg">{ASPECT_RATIOS[ratio].icon}</span>
                                      <span className="text-[10px] font-bold">{ratio}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400 mb-3">Artistic Style</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {(Object.keys(OUTPUT_STYLES) as Array<keyof typeof OUTPUT_STYLES>).map((style, idx) => (
                                    <button
                                      key={`${style}-${idx}`}
                                      onClick={() => setCardData({...cardData, outputStyle: style})}
                                      className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-left ${
                                        cardData.outputStyle === style 
                                        ? 'iridescent-bg text-white border-transparent shadow-md' 
                                        : 'glass-input text-black dark:text-stone-200 hover:border-stone-200 dark:hover:border-stone-800'
                                      }`}
                                    >
                                      {style}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400 mb-3">Theme & Vibe</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {(['classic', 'modern', 'playful', 'elegant'] as const).map((t, idx) => (
                                    <button
                                      key={`${t}-${idx}`}
                                      onClick={() => setCardData({...cardData, theme: t})}
                                      className={`p-3 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                                        cardData.theme === t 
                                        ? 'iridescent-bg text-white border-transparent shadow-md' 
                                        : 'glass-input text-black dark:text-stone-200 hover:border-stone-200 dark:hover:border-stone-800'
                                      }`}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Other Settings */}
                          <div className="space-y-8">
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">Image Size</label>
                                  <div className="flex gap-1">
                                    {(['1K', '2K', '4K'] as const).map((size, idx) => (
                                      <button
                                        key={`${size}-${idx}`}
                                        onClick={() => setCardData({...cardData, imageSize: size})}
                                        className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                                          cardData.imageSize === size 
                                          ? 'iridescent-bg text-white border-transparent shadow-sm' 
                                          : 'glass-input text-black dark:text-stone-200'
                                        }`}
                                      >
                                        {size}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">Signature</label>
                                  <input 
                                    type="text" 
                                    value={cardData.signature}
                                    onChange={e => setCardData({...cardData, signature: e.target.value})}
                                    placeholder="e.g. From Prince"
                                    className="w-full glass-input rounded-xl p-3 text-sm outline-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">Custom Image Prompt Additions</label>
                                <textarea 
                                  value={cardData.imagePreferences}
                                  onChange={e => setCardData({...cardData, imagePreferences: e.target.value})}
                                  placeholder="e.g. include a golden retriever, sunset background, cinematic lighting..."
                                  className="w-full glass-input rounded-2xl p-4 h-24 resize-none text-sm outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              </div>

              {/* Navigation Buttons */}
              <div className="pt-10 flex gap-4">
                {formStep > 1 && (
                  <button
                    onClick={() => setFormStep(prev => prev - 1)}
                    className="px-6 py-4 rounded-[24px] font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                  >
                    Back
                  </button>
                )}
                
                {formStep < 3 ? (
                  <button
                    onClick={() => setFormStep(prev => prev + 1)}
                    className="flex-1 iridescent-bg rounded-[24px] py-4 flex items-center justify-center gap-4 hover:scale-[1.01] transition-all text-white font-bold text-lg group"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    disabled={loading || !cardData.recipient}
                    onClick={generateCard}
                    className="flex-1 iridescent-bg rounded-[24px] py-6 flex items-center justify-center gap-4 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white group"
                  >
                    <span className="text-xl font-bold tracking-wide">Generate Masterpiece</span>
                    <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center gap-8 w-full max-w-5xl"
            >
              {/* Top Navigation & Actions */}
              <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                <button
                  onClick={() => setView('form')}
                  className="group flex items-center gap-3 text-stone-600 dark:text-stone-500 hover:text-indigo-500 dark:hover:text-purple-400 transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
                >
                  <div className="p-2 glass-panel rounded-xl group-hover:shadow-md transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  Back to Studio
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={copyMessage}
                    className="flex items-center gap-2 px-6 py-3 glass-panel rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-stone-600 dark:text-stone-100 font-bold text-xs uppercase tracking-widest"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-indigo-500 dark:text-purple-400" />}
                    {copied ? 'Copied!' : 'Copy Message'}
                  </button>
                  <button
                    onClick={() => handleDownload()}
                    className="flex items-center gap-2 px-6 py-3 iridescent-bg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-white font-bold text-xs uppercase tracking-widest"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => handleDownloadPDF()}
                    className="flex items-center gap-2 px-6 py-3 glass-panel rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-stone-600 dark:text-stone-100 font-bold text-xs uppercase tracking-widest border border-indigo-200 dark:border-indigo-800"
                  >
                    <FileText className="w-4 h-4 text-indigo-500 dark:text-purple-400" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 glass-panel rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-stone-600 dark:text-stone-100 font-bold text-xs uppercase tracking-widest border border-indigo-200 dark:border-indigo-800"
                  >
                    <Share2 className="w-4 h-4 text-indigo-500 dark:text-purple-400" />
                    Share
                  </button>
                  <button
                    onClick={saveToLibrary}
                    className="flex items-center gap-2 px-6 py-3 glass-panel rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-stone-600 dark:text-stone-100 font-bold text-xs uppercase tracking-widest border border-indigo-200 dark:border-indigo-800"
                  >
                    {savedToLibrary ? <Check className="w-4 h-4 text-emerald-500" /> : <BookmarkPlus className="w-4 h-4 text-indigo-500 dark:text-purple-400" />}
                    {savedToLibrary ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Single Result: The Image */}
              <div className={`relative w-full ${ASPECT_RATIOS[cardData.aspectRatio].class} rounded-[48px] overflow-hidden glass-panel group border-[12px]`}>
                {cardData.imageUrl ? (
                  <>
                    <img 
                      src={cardData.imageUrl} 
                      alt="Generated Birthday Card" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Quick Actions (Hover Only) */}
                    <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleDownload()}
                        className="p-4 glass-panel text-indigo-500 dark:text-purple-400 rounded-2xl hover:scale-110 transition-all group"
                        title="Download PNG"
                      >
                        <ImageIcon className="w-6 h-6 group-hover:animate-bounce transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF()}
                        className="p-4 glass-panel text-indigo-500 dark:text-purple-400 rounded-2xl hover:scale-110 transition-all group"
                        title="Download PDF"
                      >
                        <FileText className="w-6 h-6 group-hover:animate-bounce transition-transform" />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-4 glass-panel text-indigo-500 dark:text-purple-400 rounded-2xl hover:scale-110 transition-all group"
                        title="Share Card"
                      >
                        <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      </button>
                      <button
                        onClick={saveToLibrary}
                        className="p-4 glass-panel text-indigo-500 dark:text-purple-400 rounded-2xl hover:scale-110 transition-all group"
                        title="Save to Library"
                      >
                        {savedToLibrary ? <Check className="w-6 h-6 text-emerald-500" /> : <BookmarkPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                      </button>
                      <button
                        onClick={copyMessage}
                        className="p-4 glass-panel text-indigo-500 dark:text-purple-400 rounded-2xl hover:scale-110 transition-all group"
                        title="Copy Message"
                      >
                        {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                      </button>
                    </div>

                  </>
                ) : (
                  <div className="w-full h-full bg-transparent flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="w-12 h-12 text-indigo-500 dark:text-purple-400 animate-spin" />
                    <p className="text-stone-600 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">{loadingMessage}</p>
                  </div>
                )}
              </div>

              {/* Message Display below */}
              <div className="text-center max-w-3xl space-y-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-8 bg-[#fff1f2] dark:bg-rose-900/30" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-300 dark:text-rose-700">The Message</span>
                  <div className="h-px w-8 bg-[#fff1f2] dark:bg-rose-900/30" />
                </div>
                <p className={`text-3xl md:text-4xl ${currentFonts.body} italic text-stone-800 dark:text-rose-100 leading-relaxed px-6`}>
                  "{cardData.message}"
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap justify-center gap-6 pb-12">
                <button
                  disabled={loading}
                  onClick={generateCard}
                  className="glass-panel text-stone-700 dark:text-stone-200 px-12 py-5 rounded-full flex items-center gap-3 hover:scale-105 transition-all font-bold shadow-sm hover:shadow-md"
                >
                  <RefreshCw className={`w-5 h-5 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
                  Try Another Version
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-panel z-50 p-8 rounded-[32px] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-stone-800 dark:text-rose-50">Share Your Card</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-8">
                Choose how you'd like to share your masterpiece. For instant sharing in messaging apps, copying the image works best!
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCopyImage}
                  disabled={isSharing}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                      {shareCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-800 dark:text-stone-200">Copy Image</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Paste directly into messages</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-indigo-500 transition-colors" />
                </button>

                {navigator.share && navigator.canShare && (
                  <button
                    onClick={handleNativeShare}
                    disabled={isSharing}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-stone-800 dark:text-stone-200">Share via Device</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Use native sharing options</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-rose-500 transition-colors" />
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDownload();
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-800 dark:text-stone-200">Download PNG</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Save to your device</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-sky-500 transition-colors" />
                </button>
                
                <button
                  onClick={() => {
                    handleDownloadPDF();
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-800 dark:text-stone-200">Download PDF</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Best for printing</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 text-stone-600 dark:text-stone-400 text-xs flex items-center gap-6 font-medium">
        <span>© 2024 AuraCards</span>
        <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
        <span>Nano Banana Pro Engine</span>
        <div className="w-1.5 h-1.5 rounded-full bg-sky-200" />
        <span>Ultra High Quality</span>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl shadow-2xl shadow-rose-500/20 font-medium"
          >
            <div className="p-1 bg-white/20 rounded-full">
              <X className="w-4 h-4" />
            </div>
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
