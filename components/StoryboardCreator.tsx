
import React, { useState, useRef } from 'react';
import { 
  Film, Send, Loader2, Download, RefreshCw, ChevronLeft, 
  Trash2, Edit3, Plus, ArrowUp, ArrowDown, Check, 
  FileJson, Layout, Maximize2, Sparkles, Filter, 
  Monitor, Palette, Camera, Zap
} from 'lucide-react';
import { parseScriptToScenes, generateStoryboardPanel } from '../services/geminiService';
import { StoryboardScene } from '../types';

interface StoryboardCreatorProps {
  onBack: () => void;
}

const STORYBOARD_STYLES = [
  { id: 'cinematic', label: 'Cinematic', prompt: 'Professional cinematic movie still, 35mm film, high dynamic range, editorial lighting' },
  { id: 'noir', label: 'Film Noir', prompt: 'Dramatic black and white film noir, high contrast, moody shadows, classic detective aesthetic' },
  { id: 'anime', label: 'Anime Concept', prompt: 'Studio Ghibli style anime concept art, vibrant watercolors, expressive hand-drawn detail' },
  { id: 'sketch', label: 'Pencil Sketch', prompt: 'Rough storyboard pencil sketch, charcoal textures, artistic hand-drawn lines, conceptual' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Futuristic cyberpunk neon aesthetic, night city lights, high-tech textures, synthwave colors' },
  { id: 'painting', label: 'Oil Painting', prompt: 'Classical oil painting style, thick brushstrokes, rich textures, dramatic renaissance lighting' },
];

const StoryboardCreator: React.FC<StoryboardCreatorProps> = ({ onBack }) => {
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(STORYBOARD_STYLES[0]);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState({ script: '', prompt: '' });

  const handleGenerateAll = async () => {
    if (!script.trim()) return;
    
    setIsParsing(true);
    setScenes([]);
    try {
      const parsedScenes = await parseScriptToScenes(script);
      const initializedScenes: StoryboardScene[] = parsedScenes.map((s, idx) => ({
        id: `scene-${Date.now()}-${idx}`,
        scriptText: s.scriptText,
        visualPrompt: s.visualPrompt,
        isGenerating: true
      }));
      setScenes(initializedScenes);
      setIsParsing(false);
      setIsGenerating(true);

      for (let i = 0; i < initializedScenes.length; i++) {
        await generateSinglePanel(i, initializedScenes[i].visualPrompt, initializedScenes);
      }
    } catch (error) {
      console.error("Storyboard generation error:", error);
      alert("Failed to process script. Please try again.");
    } finally {
      setIsParsing(false);
      setIsGenerating(false);
    }
  };

  const generateSinglePanel = async (index: number, visualPrompt: string, currentScenes: StoryboardScene[]) => {
    setScenes(prev => prev.map((s, idx) => idx === index ? { ...s, isGenerating: true } : s));
    try {
      const fullPrompt = `${selectedStyle.prompt}: ${visualPrompt}`;
      const base64 = await generateStoryboardPanel(fullPrompt);
      setScenes(prev => 
        prev.map((s, idx) => 
          idx === index ? { ...s, imageUrl: `data:image/jpeg;base64,${base64}`, isGenerating: false } : s
        )
      );
    } catch (err) {
      console.error(`Failed to generate scene ${index}:`, err);
      setScenes(prev => 
        prev.map((s, idx) => idx === index ? { ...s, isGenerating: false } : s)
      );
    }
  };

  const handleRegenerateScene = (id: string) => {
    const sceneIdx = scenes.findIndex(s => s.id === id);
    if (sceneIdx === -1) return;
    generateSinglePanel(sceneIdx, scenes[sceneIdx].visualPrompt, scenes);
  };

  const handleDeleteScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const newScenes = [...scenes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;
    [newScenes[index], newScenes[targetIndex]] = [newScenes[targetIndex], newScenes[index]];
    setScenes(newScenes);
  };

  const handleAddScene = () => {
    const newScene: StoryboardScene = {
      id: `scene-manual-${Date.now()}`,
      scriptText: 'New Scene Description',
      visualPrompt: 'Description for image generation...',
      isGenerating: false
    };
    setScenes([...scenes, newScene]);
  };

  const startEditing = (scene: StoryboardScene) => {
    setEditingSceneId(scene.id);
    setEditBuffer({ script: scene.scriptText, prompt: scene.visualPrompt });
  };

  const saveEdit = (id: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, scriptText: editBuffer.script, visualPrompt: editBuffer.prompt } : s));
    setEditingSceneId(null);
  };

  const downloadAll = () => {
    scenes.forEach((scene, idx) => {
      if (scene.imageUrl) {
        const link = document.createElement('a');
        link.href = scene.imageUrl;
        link.download = `storyboard-shot-${idx + 1}.jpg`;
        link.click();
      }
    });
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
          <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-nepalRed to-nepalBlue">STORYBOARD PRO</h2>
        </div>
        
        {scenes.length > 0 && (
          <div className="flex items-center gap-3">
            <button onClick={handleAddScene} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all border border-white/10 text-nepalBlue"><Plus size={16} /> Add Shot</button>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-nepalBlue to-indigo-600 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-nepalBlue/40 transition-all"><Download size={16} /> Export All</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR CONFIG */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Filter size={14} className="text-nepalRed" /> Visual Style</label>
              <div className="grid grid-cols-1 gap-2">
                {STORYBOARD_STYLES.map((style) => (
                  <button 
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${selectedStyle.id === style.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                  >
                    <span className={`text-xs font-bold ${selectedStyle.id === style.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{style.label}</span>
                    {selectedStyle.id === style.id && <Sparkles size={14} className="text-nepalRed animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"><Film size={14} className="text-nepalBlue" /> Input Script</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your screenplay or scene descriptions here..."
                className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-nepalRed/50 transition-all resize-none custom-scrollbar"
              />
              <button
                onClick={handleGenerateAll}
                disabled={isParsing || isGenerating || !script.trim()}
                className="w-full py-4 bg-gradient-to-br from-nepalRed via-red-600 to-nepalBlue rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isParsing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                {isParsing ? "AI Analyzing..." : "Generate Pro Sequence"}
              </button>
            </div>
          </div>
        </div>

        {/* STORYBOARD GRID */}
        <div className="lg:col-span-9 space-y-6">
          {scenes.length === 0 && !isParsing ? (
            <div className="h-[600px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-gray-700 space-y-6 bg-black/20">
              <div className="relative">
                <Layout size={80} strokeWidth={0.5} className="opacity-10" />
                <Sparkles size={24} className="absolute -top-2 -right-2 text-nepalRed/40 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold tracking-[0.3em] uppercase">Cinema Engine Idle</p>
                <p className="text-xs text-gray-600 max-w-xs">Transform your written vision into professional visual storyboards using Gemini AI.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {scenes.map((scene, idx) => (
                <div key={scene.id} className="group flex flex-col md:flex-row gap-6 p-1 rounded-[32px] hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                  
                  {/* Image Part */}
                  <div className="w-full md:w-[450px] aspect-video relative rounded-3xl overflow-hidden bg-black/60 shadow-2xl border border-white/5 ring-1 ring-white/10">
                    {scene.isGenerating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-md animate-in fade-in">
                        <RefreshCw className="animate-spin text-nepalRed mb-4" size={40} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Rendering Shot...</span>
                      </div>
                    )}
                    
                    {scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <Camera size={48} strokeWidth={0.5} className="text-white/5" />
                        <span className="text-[10px] font-bold text-white/10 tracking-widest uppercase">No Visual Data</span>
                      </div>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                      <button onClick={() => handleRegenerateScene(scene.id)} title="Regenerate Image" className="p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full hover:bg-nepalRed hover:text-white transition-all shadow-2xl"><RefreshCw size={16} /></button>
                      <button onClick={() => handleDeleteScene(scene.id)} title="Delete Shot" className="p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl"><Trash2 size={16} /></button>
                    </div>

                    <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <button onClick={() => handleMoveScene(idx, 'up')} disabled={idx === 0} className="p-2 bg-black/80 backdrop-blur-md rounded-lg hover:bg-white/10 disabled:opacity-0 transition-all border border-white/10"><ArrowUp size={14} /></button>
                       <button onClick={() => handleMoveScene(idx, 'down')} disabled={idx === scenes.length - 1} className="p-2 bg-black/80 backdrop-blur-md rounded-lg hover:bg-white/10 disabled:opacity-0 transition-all border border-white/10"><ArrowDown size={14} /></button>
                    </div>

                    <div className="absolute top-4 left-4 bg-nepalRed px-4 py-1.5 rounded-full text-[10px] font-black text-white z-20 shadow-lg border border-white/20 tracking-tighter">
                      SHOT #{idx + 1}
                    </div>
                  </div>

                  {/* Metadata Part */}
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
                    {editingSceneId === scene.id ? (
                      <div className="space-y-4 animate-in slide-in-from-right-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Script Segment</label>
                           <textarea 
                             value={editBuffer.script} 
                             onChange={(e) => setEditBuffer({...editBuffer, script: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-nepalBlue h-24 resize-none"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Visual Prompt Override</label>
                           <textarea 
                             value={editBuffer.prompt} 
                             onChange={(e) => setEditBuffer({...editBuffer, prompt: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-gray-400 focus:outline-none focus:border-nepalRed h-20 resize-none"
                           />
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => saveEdit(scene.id)} className="flex-1 py-2 bg-nepalBlue rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2"><Check size={14} /> Update Shot</button>
                           <button onClick={() => setEditingSceneId(null)} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-nepalBlue uppercase tracking-[0.3em]">Cinematic Excerpt</h4>
                            <button onClick={() => startEditing(scene)} className="p-2 text-gray-600 hover:text-white transition-colors rounded-lg hover:bg-white/5"><Edit3 size={14} /></button>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed font-serif italic border-l border-nepalRed/30 pl-4 py-1">"{scene.scriptText}"</p>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2 text-[9px] font-black text-nepalRed uppercase tracking-[0.3em] mb-2">
                             <Palette size={12} /> Artistic Direction
                           </div>
                           <p className="text-[11px] text-gray-500 leading-snug line-clamp-3 bg-white/5 p-4 rounded-2xl italic border border-white/5 group-hover:border-white/10 transition-colors">
                             {scene.visualPrompt}
                           </p>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              ))}
              
              <button 
                onClick={handleAddScene}
                className="w-full py-12 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-gray-600 hover:bg-white/5 hover:border-white/20 transition-all group"
              >
                <Plus size={40} className="mb-4 opacity-20 group-hover:opacity-100 group-hover:text-nepalBlue transition-all" />
                <span className="text-sm font-bold uppercase tracking-[0.4em]">Append Sequence Shot</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryboardCreator;
