
import React, { useState } from 'react';
import { 
  ChevronLeft, Zap, Loader2, Download, RefreshCw, 
  Sparkles, Palette, Type, Layout, Shield, Star,
  Check, Edit3, Image as ImageIcon, Monitor, 
  Smartphone, Briefcase, Shirt, Eye
} from 'lucide-react';
import { generateLogo } from '../services/geminiService';

interface LogoCreatorProps {
  onBack: () => void;
  onUseInEditor: (image: string) => void;
}

const LOGO_STYLES = [
  { id: 'minimalist', label: 'Minimalist', prompt: 'Clean minimalist vector logo, flat design, simple geometric shapes' },
  { id: '3d', label: '3D Modern', prompt: 'Modern 3D logo design, depth, gradients, sleek glossy finish' },
  { id: 'vintage', label: 'Vintage', prompt: 'Classic vintage retro logo, distressed texture, old-school typography' },
  { id: 'abstract', label: 'Abstract', prompt: 'Creative abstract logo, fluid shapes, artistic conceptual design' },
  { id: 'luxury', label: 'Luxury', prompt: 'Elegant luxury brand logo, gold accents, sophisticated serif style' },
  { id: 'tech', label: 'Tech/Futuristic', prompt: 'High-tech futuristic logo, neon accents, circuit patterns, digital aesthetic' },
  { id: 'mascot', label: 'Mascot', prompt: 'Friendly mascot character logo, bold colors, expressive illustration' },
  { id: 'handwritten', label: 'Handwritten', prompt: 'Organic handwritten signature logo, brush strokes, personal touch' },
];

const LOGO_TYPES = [
  { id: 'icon', label: 'Icon Only', prompt: 'Iconic symbol only, no text' },
  { id: 'wordmark', label: 'Wordmark', prompt: 'Typography-based logo, brand name as the main focus' },
  { id: 'combination', label: 'Combination', prompt: 'Symbol and text integrated together' },
  { id: 'emblem', label: 'Emblem', prompt: 'Badge style logo, text inside a shape' },
];

const COLOR_PALETTES = [
  { id: 'monochrome', label: 'Monochrome', colors: ['#000000', '#FFFFFF'], prompt: 'Black and white, high contrast' },
  { id: 'ocean', label: 'Ocean Blue', colors: ['#0077B6', '#90E0EF'], prompt: 'Deep blues and teals' },
  { id: 'sunset', label: 'Sunset Glow', colors: ['#FF4D00', '#FFB700'], prompt: 'Vibrant oranges and yellows' },
  { id: 'forest', label: 'Forest Green', colors: ['#2D6A4F', '#95D5B2'], prompt: 'Natural greens and earth tones' },
  { id: 'royal', label: 'Royal Gold', colors: ['#D4AF37', '#1A1A1A'], prompt: 'Gold and deep black' },
  { id: 'neon', label: 'Cyber Neon', colors: ['#FF00FF', '#00FFFF'], prompt: 'Neon pink and cyan' },
];

const TYPOGRAPHY_STYLES = [
  { id: 'sans', label: 'Modern Sans', prompt: 'Clean, geometric sans-serif font' },
  { id: 'serif', label: 'Classic Serif', prompt: 'Elegant, traditional serif font with terminals' },
  { id: 'slab', label: 'Bold Slab', prompt: 'Strong, blocky slab-serif font' },
  { id: 'script', label: 'Elegant Script', prompt: 'Fluid, handwritten cursive script' },
  { id: 'display', label: 'Bold Display', prompt: 'Unique, high-impact display font' },
];

const LogoCreator: React.FC<LogoCreatorProps> = ({ onBack, onUseInEditor }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(LOGO_STYLES[0]);
  const [selectedType, setSelectedType] = useState(LOGO_TYPES[2]);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [selectedTypography, setSelectedTypography] = useState(TYPOGRAPHY_STYLES[0]);
  const [activeView, setActiveView] = useState<'logo' | 'mockup'>('logo');
  const [mockupType, setMockupType] = useState<'business-card' | 'tshirt' | 'mobile' | 'website'>('business-card');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setActiveView('logo');
    try {
      const base64 = await generateLogo(
        prompt, 
        selectedStyle.prompt, 
        selectedPalette.prompt, 
        selectedTypography.prompt, 
        selectedType.prompt
      );
      setGeneratedLogo(`data:image/png;base64,${base64}`);
    } catch (error) {
      console.error("Logo generation error:", error);
      alert("Failed to generate logo. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = () => {
    if (!generatedLogo) return;
    const link = document.createElement('a');
    link.href = generatedLogo;
    link.download = `bishnu-ai-logo-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div className="flex flex-col gap-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest w-fit"
          >
            <ChevronLeft size={16} /> Back to Hub
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 uppercase">Logo Creator Pro</h2>
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] font-black text-yellow-500 tracking-widest uppercase">Elite Edition</div>
          </div>
        </div>
        
        {generatedLogo && (
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
            <button 
              onClick={() => setActiveView('logo')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'logo' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Logo View
            </button>
            <button 
              onClick={() => setActiveView('mockup')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'mockup' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Brand Mockups
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR CONFIG */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-8">
            {/* Logo Type */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Layout size={14} className="text-blue-400" /> Logo Composition</label>
              <div className="grid grid-cols-2 gap-2">
                {LOGO_TYPES.map((type) => (
                  <button 
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center group ${selectedType.id === type.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedType.id === type.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Style */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Palette size={14} className="text-yellow-500" /> Aesthetic Style</label>
              <div className="grid grid-cols-2 gap-2">
                {LOGO_STYLES.map((style) => (
                  <button 
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center group ${selectedStyle.id === style.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedStyle.id === style.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Sparkles size={14} className="text-purple-400" /> Brand Palette</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <button 
                    key={palette.id}
                    onClick={() => setSelectedPalette(palette)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${selectedPalette.id === palette.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex gap-0.5">
                      {palette.colors.map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[8px] font-bold uppercase text-gray-400">{palette.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Type size={14} className="text-emerald-400" /> Typography</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPOGRAPHY_STYLES.map((font) => (
                  <button 
                    key={font.id}
                    onClick={() => setSelectedTypography(font)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center group ${selectedTypography.id === font.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedTypography.id === font.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Edit3 size={14} className="text-orange-500" /> Brand Vision</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your brand's core values and symbols..."
                className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-yellow-500/50 transition-all resize-none custom-scrollbar"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                {isGenerating ? "AI Branding..." : "Generate Identity"}
              </button>
            </div>
          </div>
        </div>

        {/* LOGO DISPLAY */}
        <div className="lg:col-span-8 space-y-6">
          {activeView === 'logo' ? (
            <div className="glass-panel rounded-[40px] border border-white/10 bg-black/40 overflow-hidden relative aspect-square flex items-center justify-center shadow-2xl">
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-md animate-in fade-in">
                  <RefreshCw className="animate-spin text-yellow-500 mb-4" size={48} />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Crafting Brand Identity...</span>
                </div>
              )}
              
              {generatedLogo ? (
                <div className="w-full h-full relative group">
                  <img src={generatedLogo} alt="Generated Logo" className="w-full h-full object-contain p-12" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                     <button 
                       onClick={downloadLogo}
                       className="p-4 bg-white text-black rounded-full hover:scale-110 transition-all shadow-2xl"
                       title="Download Logo"
                     >
                       <Download size={24} />
                     </button>
                     <button 
                       onClick={() => onUseInEditor(generatedLogo)}
                       className="p-4 bg-yellow-500 text-white rounded-full hover:scale-110 transition-all shadow-2xl"
                       title="Edit in Photo Editor"
                     >
                       <Edit3 size={24} />
                     </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-700 space-y-6">
                  <div className="relative">
                    <Star size={100} strokeWidth={0.5} className="opacity-10" />
                    <Sparkles size={32} className="absolute -top-2 -right-2 text-yellow-500/40 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold tracking-[0.3em] uppercase">Design Engine Ready</p>
                    <p className="text-xs text-gray-600 max-w-xs">Configure your brand parameters and generate a professional identity.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'business-card', label: 'Business Card', icon: <Briefcase size={18}/> },
                  { id: 'tshirt', label: 'Apparel', icon: <Shirt size={18}/> },
                  { id: 'mobile', label: 'Mobile App', icon: <Smartphone size={18}/> },
                  { id: 'website', label: 'Website', icon: <Monitor size={18}/> },
                ].map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => setMockupType(m.id as any)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${mockupType === m.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    {m.icon}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="glass-panel rounded-[40px] border border-white/10 bg-white/5 aspect-video relative overflow-hidden flex items-center justify-center group">
                {/* Mockup Rendering Logic */}
                {mockupType === 'business-card' && (
                  <div className="w-[500px] h-[280px] bg-white rounded-lg shadow-2xl flex items-center justify-center p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-full opacity-50" />
                    <img src={generatedLogo!} alt="Logo on Card" className="w-32 h-32 object-contain relative z-10" />
                    <div className="absolute bottom-8 left-8 space-y-1 text-black text-left">
                      <div className="w-24 h-2 bg-gray-200 rounded" />
                      <div className="w-16 h-1.5 bg-gray-100 rounded" />
                    </div>
                  </div>
                )}

                {mockupType === 'tshirt' && (
                  <div className="relative flex items-center justify-center">
                    <Shirt size={300} strokeWidth={0.5} className="text-white/20" />
                    <div className="absolute top-[35%] flex items-center justify-center">
                      <img src={generatedLogo!} alt="Logo on Shirt" className="w-24 h-24 object-contain opacity-80 mix-blend-overlay" />
                    </div>
                  </div>
                )}

                {mockupType === 'mobile' && (
                  <div className="w-[200px] h-[400px] bg-black rounded-[40px] border-[6px] border-gray-800 shadow-2xl flex flex-col items-center p-6 space-y-8">
                    <div className="w-12 h-1 bg-gray-800 rounded-full mb-4" />
                    <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center p-4">
                      <img src={generatedLogo!} alt="App Icon" className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="w-full h-2 bg-white/5 rounded" />
                      <div className="w-2/3 h-2 bg-white/5 rounded" />
                    </div>
                  </div>
                )}

                {mockupType === 'website' && (
                  <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="h-8 bg-gray-100 flex items-center px-4 gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <img src={generatedLogo!} alt="Site Logo" className="h-8 w-auto object-contain" />
                      <div className="flex gap-4">
                        <div className="w-12 h-2 bg-gray-100 rounded" />
                        <div className="w-12 h-2 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="p-12 space-y-4">
                      <div className="w-1/2 h-8 bg-gray-50 rounded" />
                      <div className="w-full h-4 bg-gray-50 rounded" />
                      <div className="w-full h-4 bg-gray-50 rounded" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                    <Eye size={12} /> Real-world Preview
                  </div>
                </div>
              </div>
            </div>
          )}

          {generatedLogo && (
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                 onClick={downloadLogo}
                 className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
               >
                 <Download size={18} /> Download High-Res
               </button>
               <button 
                 onClick={() => onUseInEditor(generatedLogo)}
                 className="flex-1 py-4 bg-yellow-500 text-black font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-glow-yellow"
               >
                 <ImageIcon size={18} /> Open in Photo Editor
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoCreator;
