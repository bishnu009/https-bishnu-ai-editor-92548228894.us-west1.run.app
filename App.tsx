
import React, { useState, useEffect, useRef } from 'react';
import HeroBackground from './components/HeroBackground';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import Logo from './components/Logo';
import StoryboardCreator from './components/StoryboardCreator';
import LogoCreator from './components/LogoCreator';
import PdfCompressor from './components/PdfCompressor';
import { ToolItem, ToolType, Layer } from './types';
import { 
  BG_STUDIO_PRESETS, SKY_PRESETS, AI_EXPAND_TOOLS, AVATAR_STYLES, 
  COLOR_PRESETS, ID_PRESETS, STICKER_PRESETS, AI_FILTERS, OUTFIT_CATEGORIES,
  BLEND_CATEGORIES, FONT_OPTIONS, HAIRSTYLES, HAIR_COLORS, BEARD_STYLES,
  GLASSES_STYLES, CAP_STYLES, CLOTH_STYLES, DRESS_STYLES, CHILD_DRESS_STYLES,
  FRAME_STYLES, UPSCALE_PRESETS, SHAPE_CATEGORIES, generateFilters, OUTFIT_STYLES
} from './src/constants';
import { editImageWithGemini, parseScriptToScenes, generateStoryboardPanel, generateTextSuggestions } from './services/geminiService';
import { 
  Sparkles, Download, X, Film, Zap, Layers, Image as ImageIcon, 
  Palette, Aperture, Sun, Undo2, Redo2, SlidersHorizontal, 
  Mail, ChevronDown, Save, ToggleLeft, ToggleRight, 
  CheckCircle2, AlertCircle, FileDown, UserSquare, Shirt, 
  Glasses, Globe, Check, Wand2, Moon, CloudSun, Camera, 
  Briefcase, CircleDashed, Droplets, Clock, Activity, 
  Brush, ScanFace, Eraser, Crown, UserCircle2, Gamepad2, 
  Contact, Shapes, Type, Heart, Cat, Flower, Maximize2, 
  RectangleHorizontal, CreditCard, Bird, Fish, PawPrint, 
  Smile, AlignCenter, Baseline, Sticker, User, Sparkle,
  ZapOff, Ghost, Filter, Edit3, Plus, UserCircle, Play,
  LayoutTemplate, Star, Baby, Frame, Zap as TrendIcon,
  Gift, GraduationCap, Ghost as HalloweenIcon, Snowflake,
  Palmtree, Gem, Coffee, PartyPopper, Landmark, Scissors,
  CloudLightning, Waves, Wind, Mountain, Flame, Zap as Lightning,
  Dna, Cpu, Microscope, Atom, Compass, MapPin, Search, Music,
  Infinity, Terminal, Rocket, Bot, Shield, Key, Lock, Umbrella, FileText,
  Instagram, Smartphone, Video, CameraOff, Clapperboard, Monitor,
  Image as PhotoIcon, Cloud, Settings, Share2, Loader2, Info
} from 'lucide-react';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'hub' | 'editor' | 'storyboard' | 'logo' | 'pdf'>('hub');
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  
  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true); // Assume success as per guidelines
    }
  };
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isManualEditing, setIsManualEditing] = useState<boolean>(false);
  const [autoCropRatio, setAutoCropRatio] = useState<number | null>(null);
  
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  // Advanced Dialogs
  const [activeDialog, setActiveDialog] = useState<'tool-config' | 'color-grade' | 'upscale' | 'id_photo' | 'hair-studio' | 'avatar' | 'text-editor' | 'frames' | 'outfit-studio' | 'ai-blend' | 'ai-filter' | 'bg-studio' | 'sticker-library' | 'ai-expand' | 'logo-creator' | null>(null);
  const [pendingTool, setPendingTool] = useState<ToolItem | null>(null);
  const [customUpscalePrompt, setCustomUpscalePrompt] = useState<string>('');

  // State for AI Filter
  const [filterTab, setFilterTab] = useState<string>('Trending');

  // State for BG Studio
  const [bgTab, setBgTab] = useState<'remove' | 'replace' | 'blur' | 'color' | 'studio' | 'sky' | 'adjust'>('remove');
  const [bgPrompt, setBgPrompt] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // ID Photo Maker States

  // AI Blend State
  const [blendTab, setBlendTab] = useState<string>('Atmospheric');

  // ID Photo Studio State
  const [idPhotoTab, setIdPhotoTab] = useState<'shape' | 'maker' | 'text' | 'sticker'>('maker');
  const [shapeCategory, setShapeCategory] = useState<string>('basic');
  const [passportBg, setPassportBg] = useState<string>('white'); 

  // Style Studio State
  const [hairTab, setHairTab] = useState<'style' | 'color' | 'glasses' | 'beard' | 'cloths' | 'dresses' | 'caps' | 'child'>('style');
  
  // Outfit Studio State
  const [outfitTab, setOutfitTab] = useState<'snip' | 'trend' | 'holiday' | 'formal' | 'costume' | 'winter' | 'vacation' | 'wedding' | 'casual' | 'party' | 'traditional'>('trend');

  // Text Editor State
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textFontFamily, setTextFontFamily] = useState('Inter, sans-serif');
  const [textSize, setTextSize] = useState(40);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textTab, setTextTab] = useState<'style' | 'ai' | 'stickers'>('style');
  const [aiTextPrompt, setAiTextPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Movable Layers State
  const [layers, setLayers] = useState<Layer[]>([]);

  // Undo/Redo - History Stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Export & Auto Save
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAutoSave, setIsAutoSave] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile Manual Save Fallback
  const [isManualSaveOpen, setIsManualSaveOpen] = useState(false);
  const [manualSaveUrl, setManualSaveUrl] = useState<string | null>(null);

  // Handle file upload

  // Handle file upload
  const handleUpload = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      alert("File is too large. Max 100MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImage(result);
      setOriginalImage(result);
      const initialHistory = [result];
      setHistory(initialHistory);
      setHistoryIndex(0);
      setAppMode('editor');
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateHistory = (newImage: string, skipAutoSave = false) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setImage(newImage);
    setLayers([]); 

    if (isAutoSave && !skipAutoSave) {
        setTimeout(() => handleShareOrSave(newImage, 'png', 'download', true), 500);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setImage(history[prevIndex]);
      setLayers([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setImage(history[nextIndex]);
      setLayers([]);
    }
  };

  const handleClear = () => {
    setImage(null);
    setOriginalImage(null);
    setHistory([]);
    setHistoryIndex(-1);
    setLayers([]);
    setIsCropping(false);
    setIsManualEditing(false);
    setSelectedTool(null);
    setActiveDialog(null);
    setAutoCropRatio(null);
    setAppMode('hub');
  };

  const convertImageToFormat = async (imgSrc: string, format: 'png' | 'jpeg'): Promise<Blob | null> => {
    try {
      const response = await fetch(imgSrc);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              if (!ctx) { resolve(null); return; }
              if (format === 'jpeg') {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
              ctx.drawImage(img, 0, 0);
              layers.forEach(layer => {
                ctx.save();
                const x = (layer.x / 100) * canvas.width;
                const y = (layer.y / 100) * canvas.height;
                const scaledSize = (layer.size / 500) * canvas.height; 
                ctx.translate(x, y);
                ctx.rotate((layer.rotation * Math.PI) / 180);
                ctx.fillStyle = layer.color || '#ffffff';
                ctx.font = `bold ${scaledSize}px ${layer.fontFamily || 'Inter, sans-serif'}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = scaledSize / 5;
                ctx.shadowOffsetY = scaledSize / 10;
                ctx.fillText(layer.content, 0, 0);
                ctx.restore();
              });
              const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
              const quality = format === 'jpeg' ? 0.9 : 1.0;
              canvas.toBlob((blob) => { resolve(blob); }, mimeType, quality);
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
          };
          img.src = objectUrl;
      });
    } catch (e) {
      console.error("Blob conversion error:", e);
      return null;
    }
  };

  const handleApplyLayers = async () => {
    if (!image || layers.length === 0) return;
    setIsProcessing(true);
    setProcessingMessage('Flattening Layers...');
    const blob = await convertImageToFormat(image, 'png');
    if (blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateHistory(reader.result as string);
        setIsProcessing(false);
        setProcessingMessage('');
        showToast("Layers Applied!");
      };
      reader.readAsDataURL(blob);
    } else {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleShareOrSave = async (imgSrc: string, format: 'png' | 'jpeg', action: 'email' | 'download', silent = false) => {
    if (!imgSrc) return;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const blob = await convertImageToFormat(imgSrc, format);
    if (!blob) {
        if (!silent) alert("Failed to prepare image.");
        return;
    }
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    const filename = `bishnu-ai-edited-${Date.now()}.${extension}`;
    if (action === 'email') {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
             try {
                if (!silent) showToast("Opening Share Sheet...");
                await navigator.share({ files: [file], title: 'Bishnu AI Photo', text: 'Check out this photo I edited with Bishnu AI!' });
                return;
             } catch (error) { if ((error as Error).name !== 'AbortError') console.error("Share failed:", error); else return; }
        }
        window.location.href = "mailto:?subject=Bishnu AI Edit&body=Check out this photo I edited with Bishnu AI!";
        if (!silent) showToast("Opening Share...");
        return;
    }
    if (isMobile && action === 'download') {
        const url = URL.createObjectURL(blob);
        setManualSaveUrl(url);
        setIsManualSaveOpen(true);
        if (!silent) showToast("Opening Manual Save...");
        return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (action === 'download' && !silent) showToast("Downloading...");
  };

  const addLayer = (type: 'text' | 'sticker', content: string, color?: string, fontFamily?: string, textAlign: 'left' | 'center' | 'right' = 'center', isBold: boolean = false, isItalic: boolean = false) => {
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: 50,
      y: 50,
      size: type === 'sticker' ? 80 : textSize,
      color: color || textColor,
      fontFamily: fontFamily || textFontFamily,
      rotation: 0,
      textAlign,
      isBold,
      isItalic
    };
    setLayers([...layers, newLayer]);
    setActiveDialog(null);
    showToast(`${type === 'text' ? 'Text' : 'Sticker'} added!`);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  const handleIdMakerGenerate = (preset: { label: string; ratio: number; prompt: string; icon: React.ReactNode }) => {
    const fullPrompt = `Create a professional ID photo. ${preset.prompt}. Replace background with pure ${passportBg}. Ensure neutral lighting, face centered, no shadows.`;
    executeAiEdit(
      { type: ToolType.ID_PHOTO, description: `Generating ${preset.label}...`, prompt: fullPrompt, icon: preset.icon }, 
      fullPrompt,
      preset.ratio
    );
  };

  const handleAiAction = (actionType: string, extraPrompt: string = "") => {
     setActiveDialog(null);
     
     if (actionType === 'ai_filter') {
        const prompt = `Apply a professional AI neural filter to this image. Effect details: ${extraPrompt}. Ensure the final output maintains the subject's identity while dramatically enhancing the visual style and quality according to the instruction. Cinematic lighting and high-end texture reproduction.`;
        executeAiEdit({ type: ToolType.AI_FILTER, description: `Applying Neural Filter...`, prompt: "", icon: null }, prompt);
        return;
     }

     if (actionType === 'ai_blend') {
        const prompt = `Perform a neural artistic blend on this image. Apply the following aesthetic fusion: ${extraPrompt}. Maintain the core identity and silhouette of the subject while re-imagining textures, lighting, and environment in a professional high-fidelity cinematic style.`;
        executeAiEdit({ type: ToolType.AI_BLEND, description: `Blending Neural Features...`, prompt: "", icon: null }, prompt);
        return;
     }

     if (actionType === 'hairstyle') {
         const prompt = `Change the subject's hairstyle to ${extraPrompt}. Keep face, expression, and skin tone exactly the same. Realistic, high definition.`;
         executeAiEdit({ type: ToolType.HAIRSTYLE, description: `Applying ${extraPrompt} Hairstyle...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'hair_color') {
         const prompt = `Change the subject's hair color to ${extraPrompt}. Keep the hair texture, style, and the rest of the image exactly the same. Realistic lighting.`;
         executeAiEdit({ type: ToolType.HAIR_COLOR, description: `Changing Hair Color to ${extraPrompt}...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'beard') {
         const prompt = `Add ${extraPrompt} to the subject. Keep the hairstyle and facial features the same. Integrate the beard naturally into the face with realistic texture and lighting.`;
         executeAiEdit({ type: ToolType.HAIRSTYLE, description: `Applying ${extraPrompt} Beard...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'glasses') {
         const prompt = `Add ${extraPrompt} to the subject. Keep facial features, hairstyle, and the rest of the image exactly the same. Realistic lighting and reflections on lenses.`;
         executeAiEdit({ type: ToolType.HAIRSTYLE, description: `Adding ${extraPrompt}...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'caps') {
         const prompt = `Add a ${extraPrompt} to the subject's head. Integrate it naturally with the hair and head shape. Ensure realistic lighting and textures. Heritage style if applicable.`;
         executeAiEdit({ type: ToolType.HAIRSTYLE, description: `Adding ${extraPrompt}...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'cloths' || actionType === 'dresses' || actionType === 'child' || actionType === 'outfit' || actionType === 'snip_trick') {
         const prompt = `Change the subject's clothing or apply structural garment modification to: ${extraPrompt}. Match the person's pose and body shape perfectly. Ensure the lighting and textures look realistic and integrated with the rest of the image. High resolution fashion photography quality.`;
         executeAiEdit({ type: ToolType.HAIRSTYLE, description: `Processing Trick...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'avatar') {
         const prompt = `Transform the subject of this photo into a ${extraPrompt} avatar. Keep facial features recognizable. High resolution, detailed background.`;
         executeAiEdit({ type: ToolType.AVATAR, description: `Generating Avatar...`, prompt: "", icon: null }, prompt);
         return;
     }

     if (actionType === 'id_shape') {
        const prompt = `Composite this image creatively inside the shape of a ${extraPrompt}. Use the shape as a frame or mask.`;
        executeAiEdit({ type: ToolType.ID_PHOTO, description: `Creating ${extraPrompt} Shape...`, prompt: "", icon: null }, prompt);
        return;
     }

     if (actionType === 'frame') {
        const prompt = `Add a beautiful, high-quality decorative photo frame around this image: ${extraPrompt}. Ensure the original content is centered and the frame looks professional.`;
        executeAiEdit({ type: ToolType.FRAME, description: `Adding Frame...`, prompt: "", icon: null }, prompt);
        return;
     }

     if (actionType === 'color_grade') {
        executeAiEdit({ type: ToolType.COLOR_GRADE, description: `Color Grading...`, prompt: extraPrompt, icon: null }, extraPrompt);
        return;
     }

     if (actionType === 'upscale') {
        executeAiEdit({ type: ToolType.AI, description: `Upscaling Image...`, prompt: extraPrompt, icon: null }, extraPrompt);
        return;
     }

     const tool = pendingTool || { type: ToolType.ID_PHOTO, description: "Generating...", prompt: "", icon: null };
     executeAiEdit(tool, extraPrompt);
  };

  const executeAiEdit = async (tool: ToolItem | { type: ToolType, description: string, prompt: string, icon: any }, overridePrompt: string = "", postProcessRatio?: number | null) => {
    if (!image) return;
    setIsProcessing(true);
    setProcessingMessage(tool.description);

    try {
      const prompt = overridePrompt || tool.prompt;
      const editedBase64 = await editImageWithGemini(image, prompt);
      const finalImage = `data:image/jpeg;base64,${editedBase64}`;
      updateHistory(finalImage);
      showToast("Edit Applied!");
      if (postProcessRatio !== undefined && postProcessRatio !== null) {
          setAutoCropRatio(postProcessRatio);
          setIsCropping(true);
      }
    } catch (error: any) {
      console.error(error);
      alert("Failed to process image: " + (error.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
      setSelectedTool(null);
      setPendingTool(null);
    }
  };

  const executeBgAction = async (action: 'remove' | 'replace' | 'blur' | 'color', customPrompt?: string) => {
    if (!image) return;
    setIsProcessing(true);
    setActiveDialog(null);
    
    let prompt = "";
    let message = "";
    
    switch(action) {
      case 'remove':
        prompt = "Remove the background cleanly, leaving only the main subject on a transparent or solid white background.";
        message = "Removing background...";
        break;
      case 'replace':
        prompt = `Replace the background with: ${customPrompt || bgPrompt}. Maintain the subject exactly.`;
        message = "Replacing background...";
        break;
      case 'blur':
        prompt = "Apply a professional shallow depth-of-field bokeh blur to the background. Keep the subject sharp.";
        message = "Applying bokeh blur...";
        break;
      case 'color':
        prompt = `Replace the background with a solid ${bgColor} color. Maintain the subject exactly.`;
        message = "Applying background color...";
        break;
    }
    
    setProcessingMessage(message);
    
    try {
      const result = await editImageWithGemini(image, prompt);
      const finalImage = result.startsWith('data:') ? result : `data:image/jpeg;base64,${result}`;
      updateHistory(finalImage);
      showToast("Background updated!");
    } catch (error) {
      console.error("BG Action Error:", error);
      showToast("Failed to update background.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const applyTool = (tool: ToolItem) => {
    if (tool.type === ToolType.CROP) {
      setIsCropping(true);
      setSelectedTool(tool.type);
      return;
    }
    
    if (tool.type === ToolType.TEXT) {
      setEditingLayerId(null);
      setTextValue('');
      setTextColor('#ffffff');
      setTextFontFamily('Inter, sans-serif');
      setTextSize(40);
      setActiveDialog('text-editor');
      return;
    }
    
    setPendingTool(tool);
    if (tool.type === ToolType.AI_FILTER) {
      setFilterTab('Trending');
      setActiveDialog('ai-filter');
    }
    else if (tool.type === ToolType.AI_EXPAND) {
      setActiveDialog('ai-expand');
    }
    else if (tool.type === ToolType.AI_BLEND) {
      setBlendTab('Atmospheric');
      setActiveDialog('ai-blend');
    }
    else if (tool.type === ToolType.COLOR_GRADE) setActiveDialog('color-grade');
    else if (tool.type === ToolType.AI) setActiveDialog('upscale');
    else if (tool.type === ToolType.ID_PHOTO) setActiveDialog('id_photo');
    else if (tool.type === ToolType.FRAME) setActiveDialog('frames');
    else if (tool.type === ToolType.OUTFIT) {
      setOutfitTab('snip');
      setActiveDialog('outfit-studio');
    }
    else if (tool.type === ToolType.HAIRSTYLE) {
      setHairTab('style');
      setActiveDialog('hair-studio');
    }
    else if (tool.type === ToolType.AVATAR) setActiveDialog('avatar');
    else if (tool.type === ToolType.STICKER) setActiveDialog('sticker-library');
    else if (tool.type === ToolType.BG_REMOVE) {
      setBgTab('remove');
      setActiveDialog('bg-studio');
    }
    else if (tool.type === ToolType.LOGO_CREATOR) {
      setActiveDialog('logo-creator');
    }
    else {
      executeAiEdit(tool);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setIsCropping(false);
    setAutoCropRatio(null);
    setSelectedTool(null);
    updateHistory(croppedImage);
  };

  const handleAiTextSuggestion = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProcessingMessage("AI is thinking...");
    try {
      const suggestions = await generateTextSuggestions(image, aiTextPrompt);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("AI Text Suggestion Error:", error);
      showToast("AI failed to suggest text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    setTextValue(suggestion);
    setTextTab('style');
  };

  const handleEditLayer = (layer: Layer) => {
    if (layer.type === 'text') {
      setEditingLayerId(layer.id);
      setTextValue(layer.content);
      setTextColor(layer.color || '#ffffff');
      setTextFontFamily(layer.fontFamily || 'Inter, sans-serif');
      setTextSize(layer.size);
      setTextAlign(layer.textAlign || 'center');
      setIsBold(layer.isBold || false);
      setIsItalic(layer.isItalic || false);
      setActiveDialog('text-editor');
    }
  };

  const saveTextLayer = () => {
    if (editingLayerId) {
      updateLayer(editingLayerId, {
        content: textValue,
        color: textColor,
        fontFamily: textFontFamily,
        size: textSize,
        textAlign,
        isBold,
        isItalic
      });
      showToast("Text Updated!");
    } else {
      addLayer('text', textValue, textColor, textFontFamily, textAlign, isBold, isItalic);
    }
    setActiveDialog(null);
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
          <Key size={48} />
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">API Key Required</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            To use the advanced Gemini 3.1 Pro models for image generation and editing, you must select a paid API key from your Google Cloud project.
          </p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-500 text-left space-y-2">
            <p className="font-bold text-gray-300 flex items-center gap-2"><Info size={14} /> Important Note:</p>
            <p>Please ensure your project has billing enabled. You can manage your keys and billing at the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Gemini API Billing Documentation</a>.</p>
          </div>
        </div>
        <button 
          onClick={handleConnectKey}
          className="px-12 py-4 bg-emerald-500 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-glow-emerald hover:scale-105 transition-all flex items-center gap-3"
        >
          <Zap size={18} /> Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden flex flex-col font-sans selection:bg-nepalRed/30">
      <HeroBackground />

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300">
         <div className="flex items-center gap-3">
             <div 
               className="w-8 h-8 rounded-lg bg-gradient-to-tr from-nepalRed/20 to-nepalBlue/20 flex items-center justify-center shadow-[0_0_15px_rgba(220,20,60,0.3)] border border-white/10 cursor-pointer"
               onClick={() => handleClear()}
              >
               <Logo size={24} className="drop-shadow-lg" />
             </div>
             <div><h1 className="text-lg font-bold tracking-tight text-white/90">Bishnu AI</h1></div>
         </div>

         {appMode === 'editor' && image && (
           <div className="flex items-center gap-2">
             {layers.length > 0 && (
               <button onClick={handleApplyLayers} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-xs font-bold mr-2 text-nepalRed shadow-glow"><Layers size={14} /> Apply Layers</button>
             )}
             <button onClick={handleUndo} disabled={historyIndex <= 0 || isProcessing} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" title="Undo"><Undo2 size={18} /></button>
             <button onClick={handleRedo} disabled={historyIndex >= history.length - 1 || isProcessing} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" title="Redo"><Redo2 size={18} /></button>
             <div className="h-6 w-px bg-white/10 mx-1" />
             <div className="relative">
                <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-nepalBlue to-indigo-600 font-medium text-sm shadow-lg hover:shadow-nepalBlue/40 transition-all active:scale-95"><Download size={16} /><span className="hidden sm:inline">Export</span><ChevronDown size={14} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} /></button>
                {isExportMenuOpen && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)} />
                     <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-2xl border border-white/10 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleShareOrSave(image!, 'png', 'email')} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors"><Share2 size={16} className="text-blue-400" /> Share via App</button>
                        <button onClick={() => handleShareOrSave(image!, 'png', 'download')} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors"><ImageIcon size={16} className="text-green-400" /> Download PNG</button>
                        <button onClick={() => handleShareOrSave(image!, 'jpeg', 'download')} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors"><FileDown size={16} className="text-yellow-400" /> Download JPEG</button>
                        <div className="h-px bg-white/10 w-full" />
                        <button 
                          onClick={() => {
                            setIsExportMenuOpen(false);
                            setAppMode('hub');
                            setImage(null);
                            setOriginalImage(null);
                            setLayers([]);
                            setHistory([]);
                            setHistoryIndex(-1);
                          }} 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors text-red-400"
                        >
                          <Globe size={16} /> Return to Home
                        </button>
                     </div>
                   </>
                )}
             </div>
           </div>
         )}
      </header>

      <main className="flex-1 relative flex flex-col h-full pt-14">
        {appMode === 'hub' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 animate-in zoom-in duration-1000">
            <div className="text-center space-y-6 flex flex-col items-center">
               <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" alt="Nepal Flag" className="h-32 md:h-48 mb-2 drop-shadow-[0_0_50px_rgba(220,20,60,0.6)] animate-pulse-slow filter brightness-110" />
               <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">BISHNU AI</h1>
               <p className="text-sm md:text-lg text-gray-400 uppercase tracking-[0.5em] font-light mt-2 border-t border-white/10 pt-6 w-full text-center max-w-2xl">The Future of Cinematic Intelligence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <div 
                onClick={() => setAppMode('editor')}
                className="glass-panel group relative p-10 rounded-3xl border border-white/10 hover:border-nepalRed/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center text-center space-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-nepalRed/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <ImageIcon size={64} strokeWidth={1} className="text-nepalRed group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-widest uppercase">Photo Editor</h3>
                <p className="text-xs text-gray-500 tracking-wider">Advanced AI transformations, color grading, and studio tools.</p>
              </div>

              <div 
                onClick={() => setAppMode('storyboard')}
                className="glass-panel group relative p-10 rounded-3xl border border-white/10 hover:border-nepalBlue/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center text-center space-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-nepalBlue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Film size={64} strokeWidth={1} className="text-nepalBlue group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-widest uppercase">Storyboard</h3>
                <p className="text-xs text-gray-500 tracking-wider">Turn movie scripts into high-quality visual sequences automatically.</p>
              </div>

              <div 
                onClick={() => setAppMode('logo')}
                className="glass-panel group relative p-10 rounded-3xl border border-white/10 hover:border-yellow-500/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center text-center space-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Zap size={64} strokeWidth={1} className="text-yellow-500 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-widest uppercase">Logo Creator</h3>
                <p className="text-xs text-gray-500 tracking-wider">Generate professional, high-quality logos for your brand using AI.</p>
              </div>

              <div 
                onClick={() => setAppMode('pdf')}
                className="glass-panel group relative p-10 rounded-3xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center text-center space-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <FileText size={64} strokeWidth={1} className="text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-widest uppercase">PDF Compressor</h3>
                <p className="text-xs text-gray-500 tracking-wider">Optimize and compress PDF files while maintaining professional quality.</p>
              </div>
            </div>
          </div>
        )}

        {appMode === 'editor' && (
          <>
            <Canvas 
              image={image}
              originalImage={originalImage}
              isProcessing={isProcessing}
              isCropping={isCropping}
              isManualEditing={false}
              initialAspectRatio={autoCropRatio}
              layers={layers}
              onUpload={handleUpload}
              onClear={handleClear}
              onCropComplete={handleCropComplete}
              onCropCancel={() => { setIsCropping(false); setAutoCropRatio(null); }}
              onManualSave={() => {}}
              onManualCancel={() => {}}
              onUpdateLayer={updateLayer}
              onRemoveLayer={removeLayer}
              onEditLayer={handleEditLayer}
              processingMessage={processingMessage}
            />
            {!isCropping && <Toolbar onSelectTool={applyTool} disabled={!image || isProcessing} selectedTool={selectedTool}/>}
          </>
        )}

        {appMode === 'storyboard' && (
          <StoryboardCreator onBack={() => setAppMode('hub')} />
        )}

        {appMode === 'logo' && (
          <LogoCreator 
            onBack={() => setAppMode('hub')} 
            onUseInEditor={(logoImg) => {
              setImage(logoImg);
              setOriginalImage(logoImg);
              setHistory([logoImg]);
              setHistoryIndex(0);
              setAppMode('editor');
            }}
          />
        )}

        {appMode === 'pdf' && (
          <PdfCompressor onBack={() => setAppMode('hub')} />
        )}
      </main>

      {/* --- BG STUDIO DIALOG --- */}
      {activeDialog === 'bg-studio' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
           <div className="w-full max-w-2xl glass-panel rounded-3xl p-0 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Scissors className="text-nepalRed"/> Background Studio
                </h3>
                <button onClick={() => setActiveDialog(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="flex border-b border-white/10 bg-black/20">
                {[
                  { id: 'remove', label: 'Remove', icon: <Eraser size={14}/> },
                  { id: 'replace', label: 'Replace', icon: <Wand2 size={14}/> },
                  { id: 'blur', label: 'Blur', icon: <Droplets size={14}/> },
                  { id: 'color', label: 'Color', icon: <Palette size={14}/> },
                  { id: 'studio', label: 'Studio', icon: <Camera size={14}/> },
                  { id: 'sky', label: 'Sky', icon: <Cloud size={14}/> },
                  { id: 'adjust', label: 'Adjust', icon: <Settings size={14}/> }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setBgTab(tab.id as any)}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${bgTab === tab.id ? 'bg-white/10 text-white border-b-2 border-nepalRed' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {bgTab === 'remove' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-nepalRed/20 flex items-center justify-center text-nepalRed mx-auto mb-4">
                      <Eraser size={40}/>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">Clean Background Removal</h4>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">AI will precisely detect the subject and remove the entire background, making it transparent.</p>
                    </div>
                    <button 
                      onClick={() => executeBgAction('remove')}
                      className="px-8 py-3 bg-nepalRed hover:bg-nepalRed/80 rounded-xl font-bold transition-all shadow-glow"
                    >
                      Remove Now
                    </button>
                  </div>
                )}

                {bgTab === 'replace' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Describe New Background</label>
                      <textarea 
                        value={bgPrompt} 
                        onChange={(e) => setBgPrompt(e.target.value)} 
                        placeholder="e.g. A futuristic space station with earth in the window..." 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-nepalBlue transition-all min-h-[120px] resize-none" 
                      />
                    </div>
                    <button 
                      onClick={() => executeBgAction('replace')}
                      disabled={!bgPrompt.trim()}
                      className="w-full py-4 bg-nepalBlue hover:bg-nepalBlue/80 rounded-2xl font-bold transition-all disabled:opacity-50"
                    >
                      Generate & Replace
                    </button>
                  </div>
                )}

                {bgTab === 'blur' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                      <Droplets size={40}/>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">Professional Bokeh Blur</h4>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">Apply a realistic shallow depth-of-field effect to make your subject pop from the background.</p>
                    </div>
                    <button 
                      onClick={() => executeBgAction('blur')}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
                    >
                      Apply Blur
                    </button>
                  </div>
                )}

                {bgTab === 'color' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Background Color</label>
                      <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4">
                        <input 
                          type="color" 
                          value={bgColor} 
                          onChange={(e) => setBgColor(e.target.value)} 
                          className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-none p-0" 
                        />
                        <div className="flex-1 grid grid-cols-5 gap-2">
                          {['#ffffff', '#f3f4f6', '#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'].map(c => (
                            <button 
                              key={c} 
                              onClick={() => setBgColor(c)}
                              className={`w-full aspect-square rounded-lg border border-white/10 transition-transform hover:scale-110 ${bgColor === c ? 'ring-2 ring-nepalBlue ring-offset-2 ring-offset-black' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => executeBgAction('color')}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold border border-white/10 transition-all"
                    >
                      Set Solid Color
                    </button>
                  </div>
                )}

                {bgTab === 'studio' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-3">
                      {BG_STUDIO_PRESETS.map((preset) => (
                        <button 
                          key={preset.id} 
                          onClick={() => { setBgPrompt(preset.prompt); executeBgAction('replace', preset.prompt); }}
                          className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalBlue/50 rounded-2xl transition-all group text-left"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                          <div>
                            <span className="block text-sm font-bold text-white">{preset.label}</span>
                            <span className="block text-[8px] uppercase text-gray-500">Studio Backdrop</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {bgTab === 'sky' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-3">
                      {SKY_PRESETS.map((preset) => (
                        <button 
                          key={preset.id} 
                          onClick={() => { setBgPrompt(preset.prompt); executeBgAction('replace', `replace the sky with ${preset.prompt}`); }}
                          className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalRed/50 rounded-2xl transition-all group text-left"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                          <div>
                            <span className="block text-sm font-bold text-white">{preset.label}</span>
                            <span className="block text-[8px] uppercase text-gray-500">Sky Replacement</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {bgTab === 'adjust' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => executeBgAction('replace', 'make the background black and white while keeping the subject in color')}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">🌓</span>
                          <span className="text-sm font-bold text-white">B&W Background</span>
                        </div>
                        <Sparkles size={16} className="text-nepalRed" />
                      </button>
                      <button 
                        onClick={() => executeBgAction('replace', 'make the background much brighter and more vibrant')}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">🔆</span>
                          <span className="text-sm font-bold text-white">Brighten Background</span>
                        </div>
                        <Sparkles size={16} className="text-nepalBlue" />
                      </button>
                      <button 
                        onClick={() => executeBgAction('replace', 'make the background dark and cinematic with deep shadows')}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">🌑</span>
                          <span className="text-sm font-bold text-white">Darken Background</span>
                        </div>
                        <Sparkles size={16} className="text-purple-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* --- AI EXPAND STUDIO DIALOG --- */}
      {activeDialog === 'ai-expand' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-4xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-hidden flex flex-col">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20}/></button>
              
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4 p-6">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter"><Wand2 className="text-fuchsia-400"/> AI Expand Studio</h3></div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {AI_EXPAND_TOOLS.map((tool) => (
                      <button 
                        key={tool.id} 
                        onClick={() => {
                          if (tool.action === 'bg_remove') {
                            setBgTab('remove');
                            setActiveDialog('bg-studio');
                          } else if (tool.action === 'ai_filter') {
                            setFilterTab('Trending');
                            setActiveDialog('ai-filter');
                          } else if (tool.action === 'id_photo') {
                            setActiveDialog('id_photo');
                          } else if (tool.action === 'upscale') {
                            setActiveDialog('upscale');
                          } else if (tool.action === 'ai_expand') {
                            setIsCropping(true);
                            setSelectedTool(ToolType.CROP);
                            setActiveDialog(null);
                          } else if (tool.action === 'direct_edit' && tool.prompt) {
                            executeAiEdit({ type: ToolType.AI, description: tool.label, prompt: tool.prompt, icon: tool.icon }, tool.prompt);
                            setActiveDialog(null);
                          }
                        }} 
                        className={`flex items-start gap-4 p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-fuchsia-400/50 rounded-2xl transition-all group text-left`}
                      >
                        <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-500">
                          {tool.icon}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">{tool.label}</span>
                          <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
              </div>
              <div className="p-4 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                Advanced Neural Expansion & Modification Suite
              </div>
           </div>
        </div>
      )}

      {/* --- AI FILTER DIALOG --- */}
      {activeDialog === 'ai-filter' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-6xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-hidden flex flex-col">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20}/></button>
              
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4 p-6">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2 tracking-tighter uppercase"><Filter className="text-nepalRed"/> AI Filter Studio</h3></div>
                  <div className="flex bg-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide max-w-full gap-1">
                      {Object.keys(AI_FILTERS).map((cat) => (
                        <button 
                          key={cat}
                          onClick={() => setFilterTab(cat)} 
                          className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTab === cat ? 'bg-nepalRed text-white shadow-[0_0_15px_rgba(220,20,60,0.4)]' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-bottom-4">
                    {(AI_FILTERS[filterTab] || []).map((item, idx) => (
                      <button 
                        key={`${item.label}-${idx}`} 
                        onClick={() => handleAiAction('ai_filter', item.value)} 
                        className={`flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalRed/50 rounded-xl transition-all group relative overflow-hidden h-full`}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform z-10 duration-500 drop-shadow-lg">{item.emoji}</span>
                        <div className="flex flex-col gap-0.5 items-center z-10 text-center">
                          <span className="text-[10px] uppercase font-black text-gray-200 leading-tight group-hover:text-white transition-colors tracking-tight">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
              </div>
              <div className="p-4 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                Hundreds of Advanced Neural Modalities Available
              </div>
           </div>
        </div>
      )}

      {/* --- STICKER LIBRARY DIALOG --- */}
      {activeDialog === 'sticker-library' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-4xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[80vh] overflow-hidden flex flex-col">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20}/></button>
              
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4 p-6">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter"><Sticker className="text-pink-400"/> Sticker Library</h3></div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {(STICKER_PRESETS || []).map((sticker) => (
                      <button 
                        key={sticker.label} 
                        onClick={() => {
                          addLayer('sticker', sticker.icon);
                          setActiveDialog(null);
                        }} 
                        className={`flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-400/50 rounded-xl transition-all group aspect-square`}
                      >
                        <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{sticker.icon}</span>
                        <span className="text-[8px] uppercase font-black text-gray-400 group-hover:text-white transition-colors">{sticker.label}</span>
                      </button>
                    ))}
                  </div>
              </div>
              <div className="p-4 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                Select a sticker to overlay on your masterpiece
              </div>
           </div>
        </div>
      )}
      {activeDialog === 'ai-blend' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-6xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-hidden flex flex-col">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20}/></button>
              
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4 p-6">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-nepalBlue"/> AI Neural Blend</h3></div>
                  <div className="flex bg-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide max-w-full gap-1">
                      {Object.keys(BLEND_CATEGORIES).map((cat) => (
                        <button 
                          key={cat}
                          onClick={() => setBlendTab(cat)} 
                          className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${blendTab === cat ? 'bg-white text-black' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-4">
                    {(BLEND_CATEGORIES[blendTab] || []).map((item) => (
                      <button 
                        key={item.label} 
                        onClick={() => handleAiAction('ai_blend', item.value)} 
                        className={`flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalBlue/50 rounded-xl transition-all group relative overflow-hidden h-full`}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform z-10 duration-500">{item.icon}</span>
                        <div className="flex flex-col gap-0.5 items-center z-10 text-center">
                          <span className="text-[10px] uppercase font-black text-gray-200 leading-tight group-hover:text-white transition-colors">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
              </div>
              <div className="p-4 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                100+ Professional Neural Modalities Available
              </div>
           </div>
        </div>
      )}

      {/* --- TEXT EDITOR DIALOG --- */}
      {activeDialog === 'text-editor' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
           <div className="w-full max-w-2xl glass-panel rounded-3xl p-0 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Type className="text-nepalBlue"/> {editingLayerId ? 'Edit Text' : 'Text Studio'}
                </h3>
                <button onClick={() => setActiveDialog(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="flex border-b border-white/10 bg-black/20">
                {[
                  { id: 'style', label: 'Style', icon: <Palette size={14}/> },
                  { id: 'ai', label: 'AI Suggestions', icon: <Wand2 size={14}/> },
                  { id: 'stickers', label: 'Stickers', icon: <Sticker size={14}/> }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setTextTab(tab.id as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${textTab === tab.id ? 'bg-white/10 text-white border-b-2 border-nepalRed' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {textTab === 'style' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                        <span>Content</span>
                        <span className="text-nepalBlue">{textValue.length} chars</span>
                      </label>
                      <textarea 
                        value={textValue} 
                        onChange={(e) => setTextValue(e.target.value)} 
                        placeholder="Type something amazing..." 
                        autoFocus 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-nepalBlue transition-all min-h-[100px] resize-none text-lg font-medium" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Typography</label>
                        <select 
                          value={textFontFamily} 
                          onChange={(e) => setTextFontFamily(e.target.value)} 
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-nepalBlue appearance-none"
                        >
                          {FONT_OPTIONS.map(font => <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Color Palette</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-2 h-[46px]">
                           <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-full rounded-lg cursor-pointer bg-transparent border-none p-0" />
                           <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                             {['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
                               <button key={c} onClick={() => setTextColor(c)} className={`w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 ${textColor === c ? 'ring-2 ring-nepalBlue ring-offset-2 ring-offset-black' : ''}`} style={{ backgroundColor: c }} />
                             ))}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Text Size</label>
                          <span className="text-xs font-mono text-nepalRed">{textSize}px</span>
                        </div>
                        <input type="range" min="10" max="300" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-nepalRed" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alignment & Style</label>
                        <div className="flex gap-2">
                          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                            {(['left', 'center', 'right'] as const).map(align => (
                              <button 
                                key={align}
                                onClick={() => setTextAlign(align)}
                                className={`p-2 rounded-lg transition-all ${textAlign === align ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                              >
                                {align === 'left' && <AlignCenter className="rotate-[-90deg]" size={16}/>}
                                {align === 'center' && <AlignCenter size={16}/>}
                                {align === 'right' && <AlignCenter className="rotate-[90deg]" size={16}/>}
                              </button>
                            ))}
                          </div>
                          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                            <button 
                              onClick={() => setIsBold(!isBold)}
                              className={`p-2 px-3 rounded-lg transition-all font-bold ${isBold ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >B</button>
                            <button 
                              onClick={() => setIsItalic(!isItalic)}
                              className={`p-2 px-3 rounded-lg transition-all italic font-serif ${isItalic ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >I</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {textTab === 'ai' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-gradient-to-br from-nepalBlue/10 to-purple-500/10 p-6 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-nepalBlue/20 flex items-center justify-center text-nepalBlue animate-pulse">
                          <Wand2 size={20}/>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">AI Copywriter</h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Generate catchy text for your image</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">What's the vibe?</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={aiTextPrompt} 
                            onChange={(e) => setAiTextPrompt(e.target.value)} 
                            placeholder="e.g. Summer sale, Birthday wish, Travel quote..." 
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-nepalBlue transition-all" 
                          />
                          <button 
                            onClick={handleAiTextSuggestion}
                            disabled={isProcessing}
                            className="px-4 bg-nepalBlue hover:bg-nepalBlue/80 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                          >
                            {isProcessing ? <CircleDashed className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                          </button>
                        </div>
                      </div>
                    </div>

                    {aiSuggestions.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Suggestions</label>
                        <div className="grid grid-cols-1 gap-2">
                          {aiSuggestions.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleApplySuggestion(s)}
                              className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalBlue/30 rounded-xl transition-all group flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-200 group-hover:text-white">{s}</span>
                              <Plus size={14} className="text-nepalBlue opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isProcessing && aiSuggestions.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40">
                        <Type size={48} className="text-gray-600"/>
                        <p className="text-xs uppercase tracking-[0.2em]">Enter a prompt above to get AI suggestions</p>
                      </div>
                    )}
                  </div>
                )}

                {textTab === 'stickers' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {STICKER_PRESETS.map((sticker) => (
                        <button 
                          key={sticker.label} 
                          onClick={() => { addLayer('sticker', sticker.icon); setActiveDialog(null); }}
                          className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalRed/50 rounded-2xl transition-all group"
                        >
                          <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{sticker.icon}</span>
                          <span className="text-[8px] uppercase font-black text-gray-500 group-hover:text-white transition-colors">{sticker.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="p-6 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">More stickers coming soon in the next update</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5">
                <button 
                  onClick={saveTextLayer} 
                  disabled={!textValue.trim() && textTab !== 'stickers'} 
                  className="w-full py-4 bg-gradient-to-r from-nepalBlue to-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,56,147,0.5)] transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingLayerId ? <CheckCircle2 size={20}/> : <Plus size={20}/>}
                  <span className="uppercase tracking-widest text-sm">{editingLayerId ? 'Update Layer' : 'Add to Canvas'}</span>
                </button>
              </div>
           </div>
        </div>
      )}

      {/* --- OUTFIT STUDIO DIALOG --- */}
      {activeDialog === 'outfit-studio' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-hidden flex flex-col">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20}/></button>
              
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4 p-6">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2"><Shirt className="text-nepalBlue"/> Outfit Studio</h3></div>
                  <div className="flex bg-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide max-w-full gap-1">
                      {[
                        { id: 'snip', icon: <Scissors size={12}/>, label: 'Snip Trick' },
                        { id: 'trend', icon: <TrendIcon size={12}/>, label: 'Trend' },
                        { id: 'holiday', icon: <Gift size={12}/>, label: 'Holiday' },
                        { id: 'formal', icon: <GraduationCap size={12}/>, label: 'Formal' },
                        { id: 'costume', icon: <HalloweenIcon size={12}/>, label: 'Costume' },
                        { id: 'winter', icon: <Snowflake size={12}/>, label: 'Winter' },
                        { id: 'vacation', icon: <Palmtree size={12}/>, label: 'Vacation' },
                        { id: 'wedding', icon: <Gem size={12}/>, label: 'Wedding' },
                        { id: 'casual', icon: <Coffee size={12}/>, label: 'Casual' },
                        { id: 'party', icon: <PartyPopper size={12}/>, label: 'Party' },
                        { id: 'traditional', icon: <Landmark size={12}/>, label: 'Traditional' },
                      ].map((tab) => (
                        <button 
                          key={tab.id}
                          onClick={() => setOutfitTab(tab.id as any)} 
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${outfitTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                          {tab.icon} {tab.label}
                        </button>
                      ))}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-4">
                    {(OUTFIT_STYLES[outfitTab as keyof typeof OUTFIT_STYLES] || []).map((item) => (
                      <button 
                        key={item.label} 
                        onClick={() => handleAiAction(outfitTab === 'snip' ? 'snip_trick' : 'outfit', item.value)} 
                        className={`flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalBlue/50 rounded-xl transition-all group relative overflow-hidden h-full`}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform z-10 duration-500">{item.emoji}</span>
                        <div className="flex flex-col gap-0.5 items-center z-10 text-center">
                          <span className="text-[10px] uppercase font-black text-gray-200 leading-tight group-hover:text-white transition-colors">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* --- PHOTO FRAME DIALOG --- */}
      {activeDialog === 'frames' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-4xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20"><X size={20}/></button>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Frame className="text-pink-400"/> Artistic Frame Studio</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar p-1">
                {FRAME_STYLES.map((frame) => (
                  <button 
                    key={frame.label} 
                    onClick={() => handleAiAction('frame', frame.value)} 
                    className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/50 rounded-2xl transition-all group relative overflow-hidden"
                  >
                    {frame.premium && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_#FACC15] animate-pulse"></div>}
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{frame.emoji}</span>
                    <div className="flex flex-col items-center">
                       <span className="text-[9px] font-black uppercase text-gray-400 text-center leading-tight group-hover:text-white transition-colors">{frame.label}</span>
                       {frame.heritage && <span className="text-[7px] font-black text-nepalRed uppercase tracking-widest mt-0.5 opacity-80">Heritage</span>}
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* --- STYLE STUDIO DIALOG --- */}
      {activeDialog === 'hair-studio' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-hidden flex flex-col">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20}/></button>
              
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4 p-6">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2"><Crown className="text-yellow-400"/> Style Studio</h3></div>
                  <div className="flex bg-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide max-w-full gap-1">
                      <button onClick={() => setHairTab('style')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'style' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-gray-200'}`}>Hair</button>
                      <button onClick={() => setHairTab('color')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'color' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-gray-200'}`}>Color</button>
                      <button onClick={() => setHairTab('beard')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'beard' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400'}`}>Beard</button>
                      <button onClick={() => setHairTab('glasses')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'glasses' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400'}`}>Glasses</button>
                      <button onClick={() => setHairTab('caps')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'caps' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400'}`}>Caps</button>
                      <button onClick={() => setHairTab('cloths')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'cloths' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400'}`}>Cloths</button>
                      <button onClick={() => setHairTab('dresses')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'dresses' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400'}`}>Dresses</button>
                      <button onClick={() => setHairTab('child')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${hairTab === 'child' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 flex items-center gap-1'} flex items-center gap-1`}>
                        <Baby size={12} /> Kids
                      </button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                {hairTab === 'style' && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 animate-in slide-in-from-left-4">
                    {HAIRSTYLES.map((hair) => (<button key={hair.label} onClick={() => handleAiAction('hairstyle', hair.value)} className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">{hair.emoji}</span><span className="text-[10px] uppercase font-bold text-gray-400 text-center">{hair.label}</span></button>))}
                  </div>
                )}

                {hairTab === 'color' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-in slide-in-from-right-4">
                    {HAIR_COLORS.map((item) => (<button key={item.label} onClick={() => handleAiAction('hair_color', item.value)} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all group"><div className="w-10 h-10 rounded-full border border-white/20 group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: item.color }} /><span className="text-[10px] uppercase font-bold text-gray-400 text-center">{item.label}</span></button>))}
                  </div>
                )}

                {hairTab === 'beard' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-in slide-in-from-top-4">
                    {BEARD_STYLES.map((item) => (<button key={item.label} onClick={() => handleAiAction('beard', item.value)} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/50 rounded-xl transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span><span className="text-[10px] uppercase font-bold text-gray-400 text-center">{item.label}</span></button>))}
                  </div>
                )}

                {hairTab === 'glasses' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-in slide-in-from-bottom-4">
                    {GLASSES_STYLES.map((item) => (<button key={item.label} onClick={() => handleAiAction('glasses', item.value)} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 rounded-xl transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span><span className="text-[10px] uppercase font-bold text-gray-400 text-center">{item.label}</span></button>))}
                  </div>
                )}

                {hairTab === 'caps' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-in slide-in-from-left-4">
                    {CAP_STYLES.map((item) => (
                      <button key={item.label} onClick={() => handleAiAction('caps', item.value)} className={`flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalRed/50 rounded-xl transition-all group relative overflow-hidden`}>
                        {item.heritage && (
                          <div className="absolute top-1 right-1 flex gap-1">
                            {item.premium && (
                              <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_#FACC15] animate-pulse"></div>
                            )}
                            <div className="w-2 h-2 bg-nepalRed rounded-full shadow-[0_0_8px_#DC143C]"></div>
                          </div>
                        )}
                        <span className="text-4xl group-hover:scale-110 transition-transform z-10 duration-500">{item.emoji}</span>
                        <div className="flex flex-col gap-0.5 items-center z-10">
                          <span className="text-[9px] uppercase font-black text-gray-400 text-center leading-tight group-hover:text-white transition-colors">{item.label}</span>
                          {item.heritage && <span className="text-[7px] font-black text-nepalRed uppercase tracking-widest mt-0.5 opacity-80">Heritage</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {hairTab === 'cloths' && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-in slide-in-from-right-4">
                    {CLOTH_STYLES.map((item) => (
                      <button key={item.label} onClick={() => handleAiAction('cloths', item.value)} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalRed/50 rounded-xl transition-all group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 text-center leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {hairTab === 'dresses' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4">
                    {DRESS_STYLES.map((item) => (
                      <button key={item.label} onClick={() => handleAiAction('dresses', item.value)} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/50 rounded-xl transition-all group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-black text-white text-center leading-tight">{item.label}</span>
                          <span className="text-[8px] uppercase font-bold text-gray-500 text-center opacity-70">Heritage Edition</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {hairTab === 'child' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-in slide-in-from-bottom-4">
                    {CHILD_DRESS_STYLES.map((item) => (
                      <button key={item.label} onClick={() => handleAiAction('child', item.value)} className={`flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-400/50 rounded-xl transition-all group relative overflow-hidden`}>
                        {item.heritage && (
                          <div className="absolute top-1 right-1 flex gap-1">
                            <div className="w-2 h-2 bg-nepalRed rounded-full shadow-[0_0_8px_#DC143C]"></div>
                          </div>
                        )}
                        <span className="text-4xl group-hover:scale-110 transition-transform z-10 duration-500">{item.emoji}</span>
                        <div className="flex flex-col gap-0.5 items-center z-10">
                          <span className="text-[9px] uppercase font-black text-gray-200 text-center leading-tight group-hover:text-white transition-colors">{item.label}</span>
                          {item.heritage && <span className="text-[7px] font-black text-nepalRed uppercase tracking-widest opacity-80">Heritage</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* --- AVATAR DIALOG --- */}
      {activeDialog === 'avatar' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><UserCircle2 className="text-purple-400"/> AI Avatar Generator</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {AVATAR_STYLES.map((style) => (<button key={style.id} onClick={() => handleAiAction('avatar', style.prompt)} className="flex flex-col items-center gap-3 p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 rounded-2xl transition-all group"><div className="group-hover:scale-110 transition-transform">{style.icon}</div><span className="text-xs font-bold uppercase tracking-wider">{style.label}</span></button>))}
              </div>
           </div>
        </div>
      )}

      {/* --- COLOR GRADE DIALOG --- */}
      {activeDialog === 'color-grade' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Palette className="text-blue-400"/> Cinematic Presets</h3>
              <div className="space-y-3">
                {COLOR_PRESETS.map((grade) => (<button key={grade.label} onClick={() => handleAiAction('color_grade', grade.prompt)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group"><span className="font-bold text-gray-300 group-hover:text-white">{grade.label}</span><Filter size={16} className="text-gray-500 group-hover:text-blue-400"/></button>))}
              </div>
           </div>
        </div>
      )}

      {/* --- AI UPSCALE / ENHANCE DIALOG --- */}
      {activeDialog === 'upscale' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Maximize2 className="text-green-400"/> Super Resolution</h3>
              <div className="space-y-4">
                {UPSCALE_PRESETS.map((preset) => (<button key={preset.label} onClick={() => handleAiAction('upscale', preset.prompt)} className="w-full flex flex-col items-start gap-1 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-left"><span className="font-bold text-white">{preset.label}</span><span className="text-[10px] text-gray-500 uppercase tracking-wide">Deep Learning Reconstruction</span></button>))}
                <div className="relative pt-4">
                  <input type="text" value={customUpscalePrompt} onChange={(e) => setCustomUpscalePrompt(e.target.value)} placeholder="Custom enhancement instruction..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-green-500 transition-all"/>
                  <button onClick={() => handleAiAction('upscale', customUpscalePrompt)} className="absolute right-3 top-[calc(1rem+4px)] p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"><Sparkle size={16}/></button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* --- ID PHOTO STUDIO DIALOG --- */}
      {activeDialog === 'id_photo' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setActiveDialog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4 flex-wrap">
                  <div className="flex-1 min-w-[150px]"><h3 className="text-xl font-bold flex items-center gap-2"><Contact className="text-nepalBlue"/> ID Photo Studio</h3></div>
                  <div className="flex bg-white/5 rounded-lg p-1 overflow-x-auto max-w-full scrollbar-hide">
                      <button onClick={() => setIdPhotoTab('maker')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${idPhotoTab === 'maker' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>ID Maker</button>
                      <button onClick={() => setIdPhotoTab('shape')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${idPhotoTab === 'shape' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Shapes</button>
                      <button onClick={() => setIdPhotoTab('sticker')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${idPhotoTab === 'sticker' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Stickers</button>
                  </div>
              </div>
              {idPhotoTab === 'maker' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ID_PRESETS.map((preset) => (<button key={preset.label} onClick={() => handleIdMakerGenerate(preset)} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-nepalBlue/50 rounded-xl transition-all group"><div className="p-2 rounded-full bg-white/5 group-hover:scale-110 transition-transform text-nepalBlue">{preset.icon}</div><span className="text-sm font-bold text-gray-200">{preset.label}</span></button>))}
                      </div>
                  </div>
              )}
              {idPhotoTab === 'shape' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5">
                          {Object.keys(SHAPE_CATEGORIES).map((cat) => (<button key={cat} onClick={() => setShapeCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${shapeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>{cat}</button>))}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                          {(SHAPE_CATEGORIES[shapeCategory] || []).map((shape) => (<button key={shape} onClick={() => handleAiAction("id_shape", shape)} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/50 transition-all text-xs font-medium text-center">{shape}</button>))}
                      </div>
                  </div>
              )}
              {idPhotoTab === 'sticker' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {STICKER_PRESETS.map((sticker) => (<button key={sticker.label} onClick={() => addLayer('sticker', sticker.icon)} className="aspect-square flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 group transition-all"><span className="text-2xl group-hover:scale-125 transition-transform">{sticker.icon}</span></button>))}
                      </div>
                  </div>
              )}
           </div>
        </div>
      )}

      {/* --- LOGO CREATOR DIALOG --- */}
      {activeDialog === 'logo-creator' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl overflow-y-auto custom-scrollbar">
          <div className="min-h-screen flex flex-col">
            <LogoCreator 
              onBack={() => setActiveDialog(null)} 
              onUseInEditor={(logoImg) => {
                setImage(logoImg);
                setOriginalImage(logoImg);
                setHistory([logoImg]);
                setHistoryIndex(0);
                setActiveDialog(null);
              }}
            />
          </div>
        </div>
      )}

      {/* --- MANUAL SAVE MODAL (MOBILE) --- */}
      {isManualSaveOpen && manualSaveUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl border border-white/10 relative text-center">
            <button 
              onClick={() => {
                if (manualSaveUrl.startsWith('blob:')) URL.revokeObjectURL(manualSaveUrl);
                setIsManualSaveOpen(false);
                setManualSaveUrl(null);
              }} 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20}/>
            </button>
            
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Ready to Save!</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Long-press the image below and select <span className="text-white font-bold">"Save Image"</span>.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6">
              <img 
                src={manualSaveUrl} 
                alt="Bishnu AI Edit" 
                title="Bishnu AI Edit"
                draggable="true"
                className="w-full h-auto block"
                style={{ 
                  WebkitTouchCallout: 'default',
                  userSelect: 'auto',
                  WebkitUserSelect: 'auto',
                  touchAction: 'auto'
                } as any}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 pointer-events-none">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Long Press to Save</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href={manualSaveUrl}
                download={`bishnu-ai-${Date.now()}.png`}
                className="w-full py-4 bg-nepalBlue text-white font-black rounded-xl uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={18} /> Direct Download
              </a>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    if (manualSaveUrl.startsWith('blob:')) URL.revokeObjectURL(manualSaveUrl);
                    setIsManualSaveOpen(false);
                    setManualSaveUrl(null);
                    setAppMode('hub');
                    setImage(null);
                    setOriginalImage(null);
                    setLayers([]);
                    setHistory([]);
                    setHistoryIndex(-1);
                  }}
                  className="py-4 bg-white text-black font-black rounded-xl uppercase tracking-[0.1em] text-[10px] hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Globe size={14} /> Home
                </button>
                <button 
                  onClick={() => {
                    if (manualSaveUrl.startsWith('blob:')) URL.revokeObjectURL(manualSaveUrl);
                    setIsManualSaveOpen(false);
                    setManualSaveUrl(null);
                  }}
                  className="py-4 bg-white/10 text-white font-bold rounded-xl uppercase tracking-[0.1em] text-[10px] hover:bg-white/20 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST --- */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
           <CheckCircle2 size={18} className="text-green-400" />
           <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
