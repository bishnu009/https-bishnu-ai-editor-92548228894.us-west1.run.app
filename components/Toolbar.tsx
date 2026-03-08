
import React from 'react';
import { ToolType, ToolItem } from '../types';
import { Wand2, Scissors, Maximize2, Palette, Crop, Contact, Crown, UserCircle2, Type, Frame, Shirt, Sparkles, Filter, Sticker, Zap } from 'lucide-react';

interface ToolbarProps {
  onSelectTool: (tool: ToolItem) => void;
  disabled: boolean;
  selectedTool: ToolType | null;
}

const TOOLS: ToolItem[] = [
  { 
    type: ToolType.CROP, 
    icon: <Crop size={18} strokeWidth={2.5} />, 
    description: "Freehand crop tool.",
    prompt: "",
    color: "text-emerald-400",
    glowColor: "rgba(52, 211, 153, 0.5)"
  },
  {
    type: ToolType.AI_FILTER,
    icon: <Filter size={18} strokeWidth={2.5} />,
    description: "AI Neural Filters - Trending, Portraits & Styles.",
    prompt: "",
    color: "text-rose-400",
    glowColor: "rgba(251, 113, 133, 0.5)"
  },
  {
    type: ToolType.AI_EXPAND,
    icon: <Wand2 size={18} strokeWidth={2.5} />,
    description: "AI Expand Studio - Removal, Filters, ID Maker & More.",
    prompt: "",
    color: "text-fuchsia-400",
    glowColor: "rgba(192, 38, 211, 0.5)"
  },
  {
    type: ToolType.AI_BLEND,
    icon: <Sparkles size={18} strokeWidth={2.5} />,
    description: "AI Neural Blend - 100+ Professional effects.",
    prompt: "",
    color: "text-indigo-400",
    glowColor: "rgba(129, 140, 248, 0.5)"
  },
  {
    type: ToolType.ID_PHOTO, 
    icon: <Contact size={18} strokeWidth={2.5} />, 
    description: "ID Photo Studio & Shapes.",
    prompt: "Generate a professional ID photo or creative shape.",
    color: "text-sky-400",
    glowColor: "rgba(56, 189, 248, 0.5)"
  },
  {
    type: ToolType.OUTFIT,
    icon: <Shirt size={18} strokeWidth={2.5} />,
    description: "AI Outfit Studio.",
    prompt: "Change the person's outfit using AI presets.",
    color: "text-amber-400",
    glowColor: "rgba(251, 191, 36, 0.5)"
  },
  {
    type: ToolType.FRAME,
    icon: <Frame size={18} strokeWidth={2.5} />,
    description: "Artistic & Heritage Frames.",
    prompt: "Add a stylish photo frame to your image.",
    color: "text-purple-400",
    glowColor: "rgba(192, 132, 252, 0.5)"
  },
  { 
    type: ToolType.TEXT, 
    icon: <Type size={18} strokeWidth={2.5} />, 
    description: "Add & Edit Text.",
    prompt: "",
    color: "text-white",
    glowColor: "rgba(255, 255, 255, 0.3)"
  },
  { 
    type: ToolType.STICKER, 
    icon: <Sticker size={18} strokeWidth={2.5} />, 
    description: "Add Fun Stickers.",
    prompt: "",
    color: "text-pink-400",
    glowColor: "rgba(244, 114, 182, 0.5)"
  },
  { 
    type: ToolType.AVATAR, 
    icon: <UserCircle2 size={18} strokeWidth={2.5} />, 
    description: "Creative AI Avatars.",
    prompt: "Create an AI avatar.",
    color: "text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.5)"
  },
  { 
    type: ToolType.HAIRSTYLE, 
    icon: <Crown size={18} strokeWidth={2.5} />, 
    description: "Studio: Hair, Beard, Glasses & Cloths.",
    prompt: "Change hairstyle, color, beard, glasses or clothing.",
    color: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.5)"
  },
  { 
    type: ToolType.BG_REMOVE, 
    icon: <Scissors size={18} strokeWidth={2.5} />, 
    description: "Remove Background.",
    prompt: "Remove the background from this image cleanly.",
    color: "text-red-500",
    glowColor: "rgba(239, 68, 68, 0.5)"
  },
  { 
    type: ToolType.AI, 
    icon: <Maximize2 size={18} strokeWidth={2.5} />, 
    description: "AI Upscale & Clarity.",
    prompt: "Upscale this image using AI to increase resolution.",
    color: "text-lime-400",
    glowColor: "rgba(163, 230, 53, 0.5)"
  },
  { 
    type: ToolType.COLOR_GRADE, 
    icon: <Palette size={18} strokeWidth={2.5} />, 
    description: "Cinematic Color Grades.",
    prompt: "Color grade this image.",
    color: "text-teal-400",
    glowColor: "rgba(45, 212, 191, 0.5)"
  },
  { 
    type: ToolType.LOGO_CREATOR, 
    icon: <Zap size={18} strokeWidth={2.5} />, 
    description: "AI Logo Creator Studio.",
    prompt: "",
    color: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.5)"
  },
];

const Toolbar: React.FC<ToolbarProps> = ({ onSelectTool, disabled, selectedTool }) => {
  return (
    <div className="fixed bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-[98%] animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="relative group">
        {/* Glorious Animated Border Glow - More Vibrant */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-nepalRed via-indigo-400 via-white/40 via-purple-400 to-nepalBlue rounded-full opacity-50 group-hover:opacity-80 blur-[4px] transition-opacity duration-700 animate-pulse-slow"></div>
        
        <div className="relative rounded-full px-2 py-2 shadow-[0_30px_70px_rgba(0,0,0,0.95)] border border-white/25 bg-black/85 backdrop-blur-3xl flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide ring-1 ring-white/15">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none"></div>

            {TOOLS.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onSelectTool(tool)}
                disabled={disabled}
                className={`
                  group relative flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-500 min-w-[52px] md:min-w-[62px]
                  ${selectedTool === tool.type 
                    ? 'bg-white/15 ring-1 ring-white/30 scale-110 -translate-y-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
                    : 'hover:bg-white/10 active:scale-90'}
                  ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                `}
              >
                {/* Active Tool Aura */}
                {selectedTool === tool.type && (
                  <div className="absolute inset-0 rounded-2xl bg-white/5 blur-md animate-pulse"></div>
                )}

                <div 
                  className={`
                    mb-1 p-1.5 rounded-full transition-all duration-500 relative z-10
                    ${selectedTool === tool.type 
                      ? 'text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,1)]' 
                      : `${tool.color} group-hover:scale-125 group-hover:rotate-6`}
                  `}
                  style={{ 
                    filter: selectedTool !== tool.type ? `drop-shadow(0 0 12px ${tool.glowColor})` : 'none'
                  }}
                >
                  {React.cloneElement(tool.icon as React.ReactElement, { size: 18 })}
                </div>
                
                <span className={`
                  text-[8px] md:text-[9px] font-black tracking-[0.2em] whitespace-nowrap uppercase relative z-10
                  transition-all duration-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
                  ${selectedTool === tool.type 
                    ? 'text-white opacity-100 scale-105 brightness-125' 
                    : 'text-white/60 opacity-80 group-hover:text-white group-hover:opacity-100'}
                `}>
                  {tool.type.split('_').pop()}
                </span>

                {selectedTool === tool.type && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_20px_#fff] animate-bounce"></div>
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-b from-white to-transparent"></div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;