
import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Lasso, Square, Smartphone, Monitor, CreditCard, RectangleHorizontal, RectangleVertical, Image as ImageIcon, ZoomIn, ZoomOut, Maximize, Search, Check, Trash2, RotateCw, Edit3, Sparkles } from 'lucide-react';
import { Layer } from '../types';

interface CanvasProps {
  image: string | null;
  originalImage: string | null;
  isProcessing: boolean;
  isCropping: boolean;
  isManualEditing: boolean;
  initialAspectRatio?: number | null;
  layers: Layer[];
  onUpload: (file: File) => void;
  onClear: () => void;
  onCropComplete: (base64Image: string) => void;
  onCropCancel: () => void;
  onManualSave: (base64Image: string) => void;
  onManualCancel: () => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onRemoveLayer: (layerId: string) => void;
  onEditLayer?: (layer: Layer) => void;
  processingMessage?: string;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface RatioOption {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}

const RATIOS: RatioOption[] = [
  { label: 'Free', value: null, icon: <Lasso size={16} /> },
  { label: 'Original', value: 0, icon: <ImageIcon size={16} /> },
  { label: '1:1', value: 1, icon: <Square size={16} /> },
  { label: 'ID (35x45)', value: 35/45, icon: <CreditCard size={16} /> },
  { label: 'ID (2x2")', value: 1, icon: <CreditCard size={16} /> },
  { label: '16:9', value: 16/9, icon: <Monitor size={16} /> },
  { label: '9:16', value: 9/16, icon: <Smartphone size={16} /> },
  { label: '4:3', value: 4/3, icon: <RectangleHorizontal size={16} /> },
  { label: '3:4', value: 3/4, icon: <RectangleVertical size={16} /> },
];

const Canvas: React.FC<CanvasProps> = ({ 
  image, 
  originalImage,
  isProcessing, 
  isCropping,
  isManualEditing,
  initialAspectRatio,
  layers,
  onUpload, 
  onClear,
  onCropComplete,
  onCropCancel,
  onManualSave,
  onManualCancel,
  onUpdateLayer,
  onRemoveLayer,
  onEditLayer,
  processingMessage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isZoomControlsOpen, setIsZoomControlsOpen] = useState(false);
  const [pinchStartDist, setPinchStartDist] = useState<number>(0);
  const [startZoom, setStartZoom] = useState<number>(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [cropMode, setCropMode] = useState<'rect' | 'freehand'>('rect');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDraggingRect, setIsDraggingRect] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [imgDims, setImgDims] = useState<{ w: number, h: number } | null>(null);

  const freehandPointsString = React.useMemo(() => 
    freehandPoints.map(p => `${p.x},${p.y}`).join(' '), 
    [freehandPoints]
  );

  // Layer state
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [layerDragStart, setLayerDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isCropping || isManualEditing) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
    
    if (isCropping && imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      let w = naturalWidth * 0.8;
      let h = naturalHeight * 0.8;

      if (initialAspectRatio !== undefined && initialAspectRatio !== null) {
          const targetRatio = initialAspectRatio === 0 ? naturalWidth/naturalHeight : initialAspectRatio;
          const calculatedH = w / targetRatio;
          if (calculatedH <= naturalHeight * 0.9) { h = calculatedH; } 
          else { h = naturalHeight * 0.8; w = h * targetRatio; }
          setAspectRatio(initialAspectRatio);
      } else {
          setAspectRatio(null);
      }

      setCrop({
        x: (naturalWidth - w) / 2,
        y: (naturalHeight - h) / 2,
        width: w,
        height: h
      });
      setFreehandPoints([]);
      setCropMode('rect');
    }

    if (isManualEditing) {
      setAdjustments({ brightness: 100, contrast: 100, saturation: 100 });
    }
  }, [isCropping, isManualEditing, image, initialAspectRatio]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [image]);

  const getNaturalCoords = (e: React.PointerEvent) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 10));
  const handleZoomOut = () => setZoom(prev => { 
    const newZoom = Math.max(prev - 0.5, 0.2); 
    if (newZoom <= 1) setPan({ x: 0, y: 0 }); 
    return newZoom; 
  });
  const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (isCropping || isManualEditing || !image) return;
    const delta = -Math.sign(e.deltaY) * 0.2;
    setZoom(prev => {
      const newZoom = Math.max(0.2, Math.min(10, prev + delta));
      if (newZoom <= 1) setPan({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && !isCropping && !isManualEditing) {
      setIsPanning(false);
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setPinchStartDist(dist);
      setStartZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist > 0 && !isCropping && !isManualEditing) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scale = dist / pinchStartDist;
      const newZoom = Math.min(Math.max(startZoom * scale, 0.2), 10);
      setZoom(newZoom);
      if (newZoom <= 1) setPan({ x: 0, y: 0 });
    }
  };

  const handlePointerDownPan = (e: React.PointerEvent) => {
    if (isCropping || isManualEditing || activeLayerId || !image) return;
    if (zoom <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  
  const handlePointerMovePan = (e: React.PointerEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleLayerPointerDown = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    setActiveLayerId(layer.id);
    setIsDraggingLayer(true);
    setLayerDragStart({ x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleLayerPointerMove = (e: React.PointerEvent, layer: Layer) => {
    if (!isDraggingLayer || activeLayerId !== layer.id || !imgRef.current) return;
    e.stopPropagation();
    
    const rect = imgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - layerDragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - layerDragStart.y) / rect.height) * 100;

    onUpdateLayer(layer.id, {
      x: Math.max(0, Math.min(100, layer.x + dx)),
      y: Math.max(0, Math.min(100, layer.y + dy))
    });

    setLayerDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleLayerPointerUp = (e: React.PointerEvent) => {
    setIsDraggingLayer(false);
  };

  const applyAspectRatio = (ratio: number | null) => {
    if (!imgRef.current) return;
    setAspectRatio(ratio);
    setCropMode('rect');
    const { naturalWidth: nw, naturalHeight: nh } = imgRef.current;
    let targetRatio = ratio === 0 ? nw / nh : ratio;
    if (!targetRatio) return;
    let newW = crop.width;
    let newH = newW / targetRatio;
    if (newH > nh) { newH = nh * 0.9; newW = newH * targetRatio; }
    if (newW > nw) { newW = nw * 0.9; newH = newW / targetRatio; }
    setCrop(prev => ({ 
        ...prev, 
        width: newW, height: newH,
        x: Math.max(0, Math.min(nw - newW, prev.x)),
        y: Math.max(0, Math.min(nh - newH, prev.y))
    }));
  };

  const handlePointerDownRect = (e: React.PointerEvent, handle: string | null) => {
    if (!isCropping || cropMode !== 'rect') return;
    e.preventDefault(); e.stopPropagation();
    setIsDraggingRect(true); 
    setDragHandle(handle); 
    const pt = getNaturalCoords(e);
    setStartPos(pt); 
    setStartCrop({ ...crop });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveRect = (e: React.PointerEvent) => {
    if (!isCropping || !isDraggingRect || !imgRef.current || cropMode !== 'rect') return;
    e.preventDefault();
    const pt = getNaturalCoords(e);
    const dx = pt.x - startPos.x;
    const dy = pt.y - startPos.y;
    const { naturalWidth: nw, naturalHeight: nh } = imgRef.current;
    let newCrop = { ...startCrop };
    
    if (dragHandle === 'move') {
      newCrop.x = Math.max(0, Math.min(nw - newCrop.width, startCrop.x + dx));
      newCrop.y = Math.max(0, Math.min(nh - newCrop.height, startCrop.y + dy));
    } else if (dragHandle) {
       if (aspectRatio) {
         const activeRatio = aspectRatio === 0 ? (nw / nh) : aspectRatio;
         const deltaW = dragHandle.includes('w') ? -dx : dx;
         let finalW = Math.max(50, startCrop.width + deltaW);
         let finalH = finalW / activeRatio;
         if (newCrop.x + finalW > nw) finalW = nw - newCrop.x;
         if (newCrop.y + finalH > nh) finalH = nh - newCrop.y;
         finalH = finalW / activeRatio;
         newCrop.width = finalW; 
         newCrop.height = finalH;
         if (dragHandle.includes('w')) newCrop.x = startCrop.x + (startCrop.width - finalW);
         if (dragHandle.includes('n')) newCrop.y = startCrop.y + (startCrop.height - finalH);
       } else {
         if (dragHandle.includes('e')) newCrop.width = Math.max(20, Math.min(nw - startCrop.x, startCrop.width + dx));
         if (dragHandle.includes('w')) {
             const actualDx = Math.max(-startCrop.x, Math.min(startCrop.width - 20, dx));
             newCrop.x = startCrop.x + actualDx; newCrop.width = startCrop.width - actualDx; 
         }
         if (dragHandle.includes('s')) newCrop.height = Math.max(20, Math.min(nh - startCrop.y, startCrop.height + dy));
         if (dragHandle.includes('n')) {
             const actualDy = Math.max(-startCrop.y, Math.min(startCrop.height - 20, dy));
             newCrop.y = startCrop.y + actualDy; newCrop.height = startCrop.height - actualDy;
         }
       }
    }
    setCrop(newCrop);
  };

  const handlePointerDownFreehand = (e: React.PointerEvent) => {
    if (!isCropping || cropMode !== 'freehand' || !imgRef.current) return;
    e.preventDefault(); setIsDrawingFreehand(true);
    const pt = getNaturalCoords(e); setFreehandPoints([pt]);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveFreehand = (e: React.PointerEvent) => {
    if (!isCropping || !isDrawingFreehand || !imgRef.current) return;
    const pt = getNaturalCoords(e);
    setFreehandPoints(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
        // Only add point if it's far enough from the last one to reduce state updates and SVG complexity
        if (dist < 3) return prev;
      }
      return [...prev, pt];
    });
  };

  const handleGlobalPointerUp = (e: React.PointerEvent) => {
    setIsDraggingRect(false); setDragHandle(null); setIsDrawingFreehand(false); setIsPanning(false); setIsDraggingLayer(false);
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch(e){}
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!image) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const performCrop = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = image || '';
    img.onload = () => {
       if (cropMode === 'rect') {
         canvas.width = crop.width; canvas.height = crop.height;
         ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
       } else {
         if (freehandPoints.length < 3) return;
         let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
         freehandPoints.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
         canvas.width = maxX - minX; canvas.height = maxY - minY;
         ctx.beginPath();
         ctx.moveTo(freehandPoints[0].x - minX, freehandPoints[0].y - minY);
         for (let i = 1; i < freehandPoints.length; i++) ctx.lineTo(freehandPoints[i].x - minX, freehandPoints[i].y - minY);
         ctx.closePath(); ctx.clip(); ctx.drawImage(img, -minX, -minY);
       }
       onCropComplete(canvas.toDataURL('image/png'));
    };
  };

  const performManualSave = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image(); img.src = image || '';
    img.onload = () => {
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
      ctx.drawImage(img, 0, 0);
      onManualSave(canvas.toDataURL('image/png'));
    };
  };

  const imageSrc = image?.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
  const filterString = isManualEditing ? `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)` : 'none';

  return (
    <div 
      className={`relative w-full flex-1 flex flex-col items-center justify-center p-2 md:p-8 overflow-hidden bg-transparent perspective-1000 transition-all duration-300 ${isDraggingOver ? 'bg-white/5' : ''}`}
      onPointerMove={(e) => {
        if (isCropping) cropMode === 'rect' ? handlePointerMoveRect(e) : handlePointerMoveFreehand(e);
        else handlePointerMovePan(e);
      }}
      onPointerUp={handleGlobalPointerUp}
      onPointerLeave={handleGlobalPointerUp}
      onPointerDown={(e) => {
          if (isCropping && cropMode === 'freehand') handlePointerDownFreehand(e);
          else if (!activeLayerId) handlePointerDownPan(e);
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDoubleClick={() => { handleZoomReset(); setActiveLayerId(null); }}
      style={{ cursor: isCropping && cropMode === 'freehand' ? 'crosshair' : 'default', touchAction: 'none' }}
    >
      {!image && (
        <div className="flex flex-col items-center w-full max-w-xs gap-6 z-10 animate-in fade-in zoom-in duration-700 -mt-20">
          <div className="text-center space-y-2 flex flex-col items-center">
             <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" alt="Nepal Flag" className="h-20 md:h-32 mb-4 drop-shadow-[0_0_40px_rgba(220,20,60,0.5)] animate-pulse-slow filter brightness-110" />
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Bishnu AI</h1>
             <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.4em] font-light mt-1 border-t border-white/10 pt-3 w-full text-center">Future of Editing</p>
          </div>

          <div 
            className={`w-full py-8 px-6 glass-panel rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all duration-500 border-2 border-dashed ${isDraggingOver ? 'border-nepalBlue bg-nepalBlue/5 scale-105 shadow-[0_0_40px_rgba(0,56,147,0.3)]' : 'border-white/10 hover:border-nepalBlue/50'} group relative overflow-hidden shadow-2xl`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-nepalRed/20 via-transparent to-nepalBlue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-500 ring-1 ring-white/20 group-hover:ring-white/50 ${isDraggingOver ? 'scale-125 rotate-12 ring-nepalBlue bg-nepalBlue/20' : ''}`}>
                <Upload className={`w-6 h-6 ${isDraggingOver ? 'text-nepalBlue' : 'text-white/70 group-hover:text-white'} transition-colors relative z-10`} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white tracking-wide">{isDraggingOver ? 'Drop Image' : 'Drag & Drop'}</h3>
                <p className="text-white/30 text-[8px] tracking-widest uppercase font-black">{isDraggingOver ? 'Ready to Edit' : 'PNG, JPG, WEBP • Max 100MB'}</p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </div>
        </div>
      )}

      {image && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden pb-32">
          {/* Intense Colorful Background Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-60 blur-[120px] scale-150 transition-all duration-1000" style={{ backgroundImage: `url(${imageSrc})`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
           {!isCropping && !isManualEditing && (
              <button onClick={onClear} onPointerDown={(e) => e.stopPropagation()} title="Clear Image" className="absolute top-4 right-4 z-[60] p-3 glass-panel rounded-full hover:scale-110 transition-transform shadow-lg text-white hover:text-red-400 border border-white/10"><X size={20} /></button>
            )}
            {!isCropping && !isManualEditing && (
               <div className="absolute top-4 left-4 z-50 flex flex-col items-start gap-2" onPointerDown={(e) => e.stopPropagation()}>
                 <button onClick={() => setIsZoomControlsOpen(!isZoomControlsOpen)} className="p-3 rounded-full glass-panel text-white transition-all shadow-lg hover:bg-white/10 border border-white/10" title="Toggle Zoom Controls"><Search size={20} /></button>
                 {isZoomControlsOpen && (
                   <div className="flex flex-col gap-2 p-2 glass-panel rounded-2xl animate-in fade-in slide-in-from-left-4 border border-white/10">
                     <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Zoom In"><ZoomIn size={20} /></button>
                     <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Zoom Out"><ZoomOut size={20} /></button>
                     <button onClick={handleZoomReset} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Fit Screen"><Maximize size={20} /></button>
                   </div>
                 )}
               </div>
            )}
          <div 
            ref={containerRef} 
            className="relative z-10 group w-auto h-auto flex items-center justify-center max-w-full max-h-full"
            onClick={() => setActiveLayerId(null)}
          >
            <div className={`relative transition-transform duration-100 ease-out origin-center ${isProcessing ? 'opacity-80 blur-sm' : 'opacity-100'}`} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
                {imgDims && !isCropping && !isManualEditing && (
                  <>
                    {/* Width Indicator (Top) */}
                    <div className="absolute -top-16 left-0 w-full flex flex-col items-center pointer-events-none fade-in animate-in">
                       <div className="w-full border-b-[3px] border-nepalRed/40 relative h-4 flex justify-between">
                          <div className="w-1 h-4 bg-nepalRed/80 rounded-full shadow-[0_0_8px_#DC143C]"></div>
                          <div className="w-1 h-4 bg-nepalRed/80 rounded-full shadow-[0_0_8px_#DC143C]"></div>
                       </div>
                       <div className="bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-full text-[11px] text-white font-black mt-2 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] whitespace-nowrap tracking-wider flex items-center gap-2">
                          <span className="text-nepalRed">W:</span>
                          {Math.round(imgDims.w / 300 * 25.4)} mm <span className="text-white/30">|</span> {imgDims.w} px
                       </div>
                    </div>
                    {/* Height Indicator (Left) */}
                    <div className="absolute top-0 -left-16 h-full flex flex-row items-center pointer-events-none fade-in animate-in">
                       <div className="h-full border-r-[3px] border-nepalBlue/40 relative w-4 flex flex-col justify-between">
                          <div className="h-1 w-4 bg-nepalBlue/80 rounded-full shadow-[0_0_8px_#003893]"></div>
                          <div className="h-1 w-4 bg-nepalBlue/80 rounded-full shadow-[0_0_8px_#003893]"></div>
                       </div>
                       <div className="bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-full text-[11px] text-white font-black ml-4 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] whitespace-nowrap tracking-wider -rotate-90 origin-center absolute left-[-60px] flex items-center gap-2">
                          <span className="text-nepalBlue">H:</span>
                          {Math.round(imgDims.h / 300 * 25.4)} mm <span className="text-white/30">|</span> {imgDims.h} px
                       </div>
                    </div>
                  </>
                )}
                <img ref={imgRef} src={imageSrc} alt="Editing Canvas" className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.7)] ring-1 ring-white/10 select-none block" draggable={false} onLoad={(e) => setImgDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} style={{ filter: filterString, pointerEvents: 'none' }} />
                
                {/* Movable Layers */}
                {!isCropping && !isManualEditing && layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`absolute cursor-move select-none transition-shadow ${activeLayerId === layer.id ? 'z-[45] ring-2 ring-nepalRed ring-offset-2 ring-offset-black/50 rounded-lg shadow-2xl' : 'z-[40]'}`}
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      fontSize: `${layer.size}px`,
                      color: layer.color || '#ffffff',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                      fontFamily: layer.fontFamily || 'Inter, sans-serif',
                      textAlign: layer.textAlign || 'center',
                      fontWeight: layer.isBold ? 'bold' : 'normal',
                      fontStyle: layer.isItalic ? 'italic' : 'normal',
                    }}
                    onPointerDown={(e) => handleLayerPointerDown(e, layer)}
                    onPointerMove={(e) => handleLayerPointerMove(e, layer)}
                    onPointerUp={handleLayerPointerUp}
                  >
                    {layer.type === 'text' ? (
                      <div className="px-4 py-2 font-bold whitespace-nowrap">{layer.content}</div>
                    ) : (
                      <div className="leading-none drop-shadow-2xl filter brightness-110">{layer.content}</div>
                    )}

                    {activeLayerId === layer.id && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 py-2 rounded-full border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-200">
                        {layer.type === 'text' && onEditLayer && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEditLayer(layer); }}
                            className="p-1 hover:bg-white/10 rounded-full text-blue-400"
                            title="Edit Content"
                          ><Edit3 size={16} /></button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { size: Math.max(10, layer.size - 5) }); }}
                          className="p-1 hover:bg-white/10 rounded-full"
                        ><ZoomOut size={16} /></button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { size: layer.size + 5 }); }}
                          className="p-1 hover:bg-white/10 rounded-full"
                        ><ZoomIn size={16} /></button>
                        <div className="w-px h-4 bg-white/20" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { rotation: (layer.rotation + 15) % 360 }); }}
                          className="p-1 hover:bg-white/10 rounded-full"
                        ><RotateCw size={16} /></button>
                        <div className="w-px h-4 bg-white/20" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); setActiveLayerId(null); }}
                          className="p-1 hover:bg-white/10 rounded-full text-red-400"
                        ><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                ))}

                 {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm bg-black/20 rounded-lg">
                    <div className="w-20 h-20 border-4 border-nepalRed border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(220,20,60,0.4)]" />
                    <p className="mt-6 text-white font-bold tracking-widest animate-pulse uppercase text-sm drop-shadow-lg">{processingMessage || "Processing..."}</p>
                  </div>
                )}
                {isCropping && cropMode === 'rect' && imgRef.current && (
                     <div className="absolute border-2 border-white/50 pointer-events-none" style={{ left: `${(crop.x / imgRef.current.naturalWidth) * 100}%`, top: `${(crop.y / imgRef.current.naturalHeight) * 100}%`, width: `${(crop.width / imgRef.current.naturalWidth) * 100}%`, height: `${(crop.height / imgRef.current.naturalHeight) * 100}%`, boxShadow: '0 0 0 9999px rgba(0,0,0,0.8)' }}>
                         <div className="absolute top-0 left-0 w-4 h-4 bg-white border border-gray-500 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-nw-resize rounded-full shadow-lg" onPointerDown={(e) => handlePointerDownRect(e, 'nw')} />
                         <div className="absolute top-0 right-0 w-4 h-4 bg-white border border-gray-500 translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-ne-resize rounded-full shadow-lg" onPointerDown={(e) => handlePointerDownRect(e, 'ne')} />
                         <div className="absolute bottom-0 left-0 w-4 h-4 bg-white border border-gray-500 -translate-x-1/2 translate-y-1/2 pointer-events-auto cursor-sw-resize rounded-full shadow-lg" onPointerDown={(e) => handlePointerDownRect(e, 'sw')} />
                         <div className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-500 translate-x-1/2 translate-y-1/2 pointer-events-auto cursor-se-resize rounded-full shadow-lg" onPointerDown={(e) => handlePointerDownRect(e, 'se')} />
                         {!aspectRatio && (
                            <>
                              <div className="absolute top-0 left-1/2 w-4 h-4 bg-white border border-gray-500 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-n-resize rounded-full" onPointerDown={(e) => handlePointerDownRect(e, 'n')} />
                              <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white border border-gray-500 -translate-x-1/2 translate-y-1/2 pointer-events-auto cursor-s-resize rounded-full" onPointerDown={(e) => handlePointerDownRect(e, 's')} />
                              <div className="absolute top-1/2 left-0 w-4 h-4 bg-white border border-gray-500 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-w-resize rounded-full" onPointerDown={(e) => handlePointerDownRect(e, 'w')} />
                              <div className="absolute top-1/2 right-0 w-4 h-4 bg-white border border-gray-500 translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-e-resize rounded-full" onPointerDown={(e) => handlePointerDownRect(e, 'e')} />
                            </>
                         )}
                         <div className="absolute inset-0 cursor-move pointer-events-auto hover:bg-white/5 transition-colors" onPointerDown={(e) => handlePointerDownRect(e, 'move')} />
                     </div>
                )}
                {isCropping && cropMode === 'freehand' && imgRef.current && (
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 drop-shadow-lg" viewBox={`0 0 ${imgRef.current.naturalWidth} ${imgRef.current.naturalHeight}`} preserveAspectRatio="none">
                        <defs><mask id="freehand-mask"><rect x="0" y="0" width="100%" height="100%" fill="white" /><polygon points={freehandPointsString} fill="black" /></mask></defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#freehand-mask)" />
                        <polygon points={freehandPointsString} fill="none" stroke="white" strokeWidth={Math.max(2, imgRef.current.naturalWidth / 200)} strokeDasharray={`${Math.max(4, imgRef.current.naturalWidth / 100)}`} strokeLinecap="round" className="animate-pulse" />
                     </svg>
                )}
            </div>
            {isCropping && (
               <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex flex-col gap-4 z-50 animate-in slide-in-from-bottom-full duration-300" onPointerDown={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-4">
                    <button onClick={onCropCancel} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={performCrop} className="px-8 py-3 bg-gradient-to-r from-nepalBlue to-indigo-600 rounded-full text-sm font-bold shadow-lg hover:shadow-nepalBlue/50 transition-all hover:scale-105">Apply Crop</button>
                  </div>
                  <div className="w-full overflow-x-auto pb-2 scrollbar-hide"><div className="flex gap-2 mx-auto w-max px-4">
                        <button onClick={() => { setCropMode('freehand'); setFreehandPoints([]); setAspectRatio(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${cropMode === 'freehand' ? 'bg-nepalBlue border-nepalBlue shadow-[0_0_15px_rgba(0,56,147,0.5)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}> <Lasso size={14} /> Freehand </button>
                        {RATIOS.map((r, i) => (
                           <button key={i} onClick={() => applyAspectRatio(r.value)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${cropMode === 'rect' && aspectRatio === r.value ? 'bg-nepalBlue border-nepalBlue shadow-[0_0_15px_rgba(0,56,147,0.5)]' : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}> {r.icon} {r.label} </button>
                        ))}
                    </div></div>
               </div>
            )}
            {isManualEditing && (
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/90 backdrop-blur-2xl border-t border-white/10 flex flex-col gap-6 z-50 animate-in slide-in-from-bottom-10" onPointerDown={(e) => e.stopPropagation()}>
                 <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                    <div className="space-y-2 group">
                       <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors"><span>Brightness</span><span className="font-mono text-nepalRed">{adjustments.brightness}%</span></div>
                       <input type="range" min="50" max="150" value={adjustments.brightness} onChange={(e) => setAdjustments(p => ({...p, brightness: Number(e.target.value)}))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125" />
                    </div>
                    <div className="space-y-2 group">
                       <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors"><span>Contrast</span><span className="font-mono text-nepalRed">{adjustments.contrast}%</span></div>
                       <input type="range" min="50" max="150" value={adjustments.contrast} onChange={(e) => setAdjustments(p => ({...p, contrast: Number(e.target.value)}))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125" />
                    </div>
                    <div className="space-y-2 group">
                       <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors"><span>Saturation</span><span className="font-mono text-nepalRed">{adjustments.saturation}%</span></div>
                       <input type="range" min="0" max="200" value={adjustments.saturation} onChange={(e) => setAdjustments(p => ({...p, saturation: Number(e.target.value)}))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125" />
                    </div>
                 </div>
                 <div className="flex justify-center gap-4 mt-2">
                    <button onClick={onManualCancel} className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-colors"><X size={16} /> Cancel</button>
                    <button onClick={performManualSave} className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-nepalBlue to-indigo-600 rounded-full text-sm font-bold shadow-lg hover:scale-105 hover:shadow-nepalBlue/50 transition-all"><Check size={16} /> Apply Changes</button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
