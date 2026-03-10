/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Heart, 
  RefreshCw, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Image as ImageIcon,
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
  Square
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
  data: CardData;
  subjectImage: string | null;
}

const OCCASIONS = {
  'Birthday': { icon: '🎂', label: 'Birthday', field: 'age', placeholder: 'e.g. 25' },
  'Anniversary': { icon: '💍', label: 'Anniversary', field: 'yearsTogether', placeholder: 'e.g. 5 years' },
  'Valentine\'s': { icon: '❤️', label: 'Valentine\'s', field: null, placeholder: '' },
  'I Love You': { icon: '💌', label: 'I Love You', field: null, placeholder: '' },
  'Graduation': { icon: '🎓', label: 'Graduation', field: 'degree', placeholder: 'e.g. Computer Science' },
  'Wedding': { icon: '🥂', label: 'Wedding', field: 'coupleNames', placeholder: 'e.g. Mark & Jane' },
  'New Baby': { icon: '👶', label: 'New Baby', field: 'babyName', placeholder: 'e.g. Oliver' },
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

function CustomDropdown({ value, options, onChange }: { value: string, options: { value: string, label: string, icon?: React.ReactNode }[], onChange: (val: string) => void }) {
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
              {options.map((option) => (
                <button
                  key={option.value}
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
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjectImage, setSubjectImage] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("LocalStorage access failed:", e);
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appTheme, setAppTheme] = useState('minimalist');
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-minimalist', 'theme-ocean', 'theme-forest', 'theme-sunset');
    // Add selected theme class
    document.documentElement.classList.add(`theme-${appTheme}`);
  }, [isDarkMode, appTheme]);
  
  const [cardData, setCardData] = useState<CardData>({
    occasion: 'Birthday',
    recipient: '',
    age: '',
    yearsTogether: '',
    degree: '',
    babyName: '',
    coupleNames: '',
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
    const saveToLocalStorage = (data: HistoryItem[]) => {
      try {
        localStorage.setItem('aura_history', JSON.stringify(data));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn("LocalStorage quota exceeded, reducing history size...");
          if (data.length > 1) {
            // Remove the oldest item and try again
            saveToLocalStorage(data.slice(0, -1));
          } else {
            // If even one item is too large, clear it
            localStorage.removeItem('aura_history');
          }
        } else {
          console.error("LocalStorage save failed:", e);
        }
      }
    };

    saveToLocalStorage(history);
  }, [history]);

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

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setCardData(item.data);
    setSubjectImage(item.subjectImage);
    setStep('preview');
    setShowHistory(false);
  };

  const copyMessage = () => {
    if (!cardData.message) return;
    navigator.clipboard.writeText(cardData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCard = async () => {
    setLoading(true);
    // Clear previous image to show loading state if regenerating
    setCardData(prev => ({ ...prev, imageUrl: '' }));
    
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

      const perspectiveInstruction = cardData.isSelf 
        ? "Write this as a self-affirmation or personal celebration message from a first-person perspective (using 'I', 'me', 'my'). It should be empowering and reflective." 
        : `Write this as a message for ${relationshipStr}, ${recipientStr}.`;

      const messageResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a short, ${vibeDescription} ${occasion} message. ${perspectiveInstruction} ${contextInfo} ${interestsStr} Keep it under 50 words. Do not use placeholders or square brackets.`,
      }));
      
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

      const imageResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: contents,
        config: {
          imageConfig: { 
            aspectRatio: cardData.aspectRatio,
            imageSize: cardData.imageSize
          }
        }
      }));

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
          data: { ...cardData, message, imageUrl },
          subjectImage: subjectImage
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Limit to 10 items to save space
      }

      setStep('preview');
    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("Please ensure you have selected a valid API key for Nano Banana Pro.");
      } else if (error.message?.includes("high demand") || error.code === 503) {
        alert("The AI model is currently very busy. Please wait a moment and try again.");
      } else {
        alert("Something went wrong while generating your masterpiece. Please try again.");
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8" onPaste={handlePaste}>
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
                {TEMPLATES.map((template) => (
                  <div 
                    key={template.id} 
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-panel z-50 p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                    <History className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h2 className="text-2xl serif font-bold text-stone-900 dark:text-rose-50">Your Gallery</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-rose-900/50 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-stone-600 dark:text-rose-300/50" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                  <div className="p-6 bg-white/50 dark:bg-rose-900/20 rounded-full">
                    <ImageIcon className="w-12 h-12 text-stone-300 dark:text-rose-800" />
                  </div>
                  <p className="text-stone-600 dark:text-rose-300/50 font-medium">Your creative history is empty.<br/>Generate your first card!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((item) => (
                    <div key={item.id} className="group glass-panel rounded-3xl overflow-hidden hover:shadow-md transition-all">
                      <div className="aspect-square relative">
                        <img 
                          src={item.data.imageUrl} 
                          alt={`Card for ${item.data.recipient}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={() => restoreFromHistory(item)}
                            className="p-3 glass-panel rounded-full text-indigo-600 dark:text-rose-100 hover:scale-110 transition-transform shadow-lg"
                            title="Restore & View"
                          >
                            <Maximize2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDownload(item.data.imageUrl, `aura-card-${item.data.recipient.toLowerCase()}.png`)}
                            className="p-3 glass-panel rounded-full text-rose-600 dark:text-rose-100 hover:scale-110 transition-transform shadow-lg"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-stone-800 dark:text-rose-50">For {item.data.recipient}</p>
                          <p className="text-[10px] text-stone-600 dark:text-rose-300/50 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeFromHistory(item.id)}
                          className="p-2 text-stone-600 dark:text-rose-800 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-8 text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Sparkles className="w-8 h-8 text-indigo-500 dark:text-purple-400" />
          <h1 className="text-5xl md:text-6xl serif font-light tracking-tight iridescent-text">AuraCards</h1>
        </motion.div>
        <p className="text-stone-700 dark:text-stone-400 text-xs uppercase tracking-[0.5em] font-bold">Nano Banana Pro Edition</p>

        {/* Menu Toggle */}
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[100]">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 glass-panel rounded-2xl hover:shadow-2xl hover:scale-110 transition-all group"
              title="Menu"
            >
              <MoreVertical className="w-6 h-6 text-indigo-500 dark:text-purple-400 group-hover:rotate-90 transition-transform" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-48 bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800 z-50"
                >
                  <div className="p-2 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setIsDarkMode(!isDarkMode);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-left group"
                    >
                      <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg group-hover:scale-110 transition-transform">
                        {isDarkMode ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                      </span>
                    </button>

                    <div className="px-3 py-2">
                      <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Workspace Theme</div>
                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={() => { setAppTheme('minimalist'); setShowMenu(false); }}
                          className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'minimalist' ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400'}`}
                          title="Minimalist"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setAppTheme('ocean'); setShowMenu(false); }}
                          className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'ocean' ? 'bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-sky-500 dark:text-sky-400'}`}
                          title="Ocean Breeze"
                        >
                          <Droplets className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setAppTheme('forest'); setShowMenu(false); }}
                          className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'forest' ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-emerald-500 dark:text-emerald-400'}`}
                          title="Forest Canopy"
                        >
                          <TreePine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setAppTheme('sunset'); setShowMenu(false); }}
                          className={`p-2 rounded-lg flex justify-center items-center transition-all ${appTheme === 'sunset' ? 'bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-orange-500 dark:text-orange-400'}`}
                          title="Sunset Glow"
                        >
                          <Sun className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />

                    <button
                      onClick={() => {
                        setShowTemplates(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-left group"
                    >
                      <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg group-hover:scale-110 transition-transform">
                        <Palette className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Templates</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowHistory(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-left group relative"
                    >
                      <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg group-hover:scale-110 transition-transform">
                        <History className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">History</span>
                      {history.length > 0 && (
                        <span className="absolute top-3 right-3 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-stone-900">
                          {history.length}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-panel rounded-[40px] p-10 md:p-12 space-y-12"
            >
              {/* Occasion Selector - Dropdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-black dark:text-white">
                    <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                      <Sparkles className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl serif font-bold">Occasion</h2>
                  </div>
                </div>
                <CustomDropdown
                  value={cardData.occasion}
                  onChange={(val) => setCardData({ ...cardData, occasion: val as keyof typeof OCCASIONS })}
                  options={(Object.keys(OCCASIONS) as Array<keyof typeof OCCASIONS>).map(occ => ({
                    value: occ,
                    label: OCCASIONS[occ].label,
                    icon: OCCASIONS[occ].icon
                  }))}
                />
              </div>

              {/* Recipient Details - Standard */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-black dark:text-white">
                    <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                      <Heart className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl serif font-bold">Details</h2>
                  </div>
                  <div className="flex bg-white/50 dark:bg-stone-950/50 p-1 rounded-xl">
                    <button 
                      onClick={() => setCardData({...cardData, isSelf: false})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!cardData.isSelf ? 'iridescent-bg shadow-sm text-white' : 'text-stone-600 dark:text-stone-500'}`}
                    >
                      Gift
                    </button>
                    <button 
                      onClick={() => setCardData({...cardData, isSelf: true})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${cardData.isSelf ? 'iridescent-bg shadow-sm text-white' : 'text-stone-600 dark:text-stone-500'}`}
                    >
                      Self
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                         OCCASIONS[cardData.occasion].label === 'New Baby' ? 'Baby Name' : 'Age'}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-black dark:text-white">
                      <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                      </div>
                      <h2 className="text-xl serif font-bold">Subject Photo</h2>
                    </div>
                    <div 
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group overflow-hidden ${
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
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-black dark:text-white">
                      <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                        <Type className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                      </div>
                      <h2 className="text-xl serif font-bold">Typography</h2>
                    </div>
                    <div className="grid gap-2">
                      {(Object.keys(FONT_PAIRS) as Array<keyof typeof FONT_PAIRS>).map(f => (
                        <button
                          key={f}
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
                        <div className="flex items-center gap-3 text-black dark:text-white">
                          <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                            <Palette className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                          </div>
                          <h2 className="text-xl serif font-bold">Visual Style</h2>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400 mb-3">Aspect Ratio</label>
                            <div className="grid grid-cols-5 gap-2">
                              {(Object.keys(ASPECT_RATIOS) as Array<keyof typeof ASPECT_RATIOS>).map(ratio => (
                                <button
                                  key={ratio}
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
                              {(Object.keys(OUTPUT_STYLES) as Array<keyof typeof OUTPUT_STYLES>).map(style => (
                                <button
                                  key={style}
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
                              {(['classic', 'modern', 'playful', 'elegant'] as const).map(t => (
                                <button
                                  key={t}
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
                        <div className="flex items-center gap-3 text-black dark:text-white">
                          <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl">
                            <Layout className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
                          </div>
                          <h2 className="text-xl serif font-bold">Output Settings</h2>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <label className="block text-xs font-bold uppercase tracking-widest text-black dark:text-stone-400">Image Size</label>
                              <div className="flex gap-1">
                                {(['1K', '2K', '4K'] as const).map(size => (
                                  <button
                                    key={size}
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

              <div className="pt-10">
                <button
                  disabled={loading || !cardData.recipient}
                  onClick={generateCard}
                  className="w-full iridescent-bg rounded-[24px] py-6 flex items-center justify-center gap-4 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xl font-bold">Nano Banana is painting...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xl font-bold tracking-wide">Generate Masterpiece</span>
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
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
                  onClick={() => setStep('form')}
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
                    <Download className="w-4 h-4" />
                    Download Card
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
                        title="Download Card"
                      >
                        <Download className="w-6 h-6 group-hover:animate-bounce transition-transform" />
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
                    <p className="text-stone-600 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">Developing your aura...</p>
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

      {/* Footer */}
      <footer className="mt-16 text-stone-600 dark:text-stone-400 text-xs flex items-center gap-6 font-medium">
        <span>© 2024 AuraCards</span>
        <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
        <span>Nano Banana Pro Engine</span>
        <div className="w-1.5 h-1.5 rounded-full bg-sky-200" />
        <span>Ultra High Quality</span>
      </footer>
    </div>
  );
}
