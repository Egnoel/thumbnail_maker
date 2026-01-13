
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppState, Project } from './types';
import { processThumbnailRequest, getThumbnailSuggestions } from './services/geminiService';
import { 
  Send, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2,
  UploadCloud,
  Undo2,
  Redo2,
  History,
  Zap,
  Layers,
  Maximize2,
  RefreshCw,
  FolderOpen,
  X,
  Clock,
  Save,
  Settings,
  User,
  LogOut,
  ChevronDown,
  CreditCard,
  ArrowRight,
  MousePointer2,
  Monitor,
  Flame,
  Wand2,
  Eye,
  Lock,
  Grid,
  Check,
  Eraser,
  Target,
  SquareDashedMousePointer,
  Sparkle
} from 'lucide-react';

const STORAGE_KEY = 'thumbnail_pro_projects';
const DUMMY_USERNAME = "CreativeDev";
const PROFILE_IMAGE_URL = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop";

type ExportFormat = 'image/png' | 'image/jpeg';
type ExportQuality = 'standard' | 'hd' | 'ultra';

interface ExportConfig {
  format: ExportFormat;
  quality: ExportQuality;
}

interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="absolute top-0 w-full px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">THUMBNAIL <span className="text-red-600">PRO</span></h1>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <button onClick={onStart} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest transition-all">
          Sign In
        </button>
      </header>

      <main className="relative z-10 container mx-auto px-6 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full mb-8 animate-bounce">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">New: 3.0 Pro Rendering</span>
        </div>
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
          VIRAL <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800">THUMBNAILS</span><br />
          IN SECONDS.
        </h2>
        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          Stop losing clicks. Transform your images into high-contrast, cinematic masterpieces designed to dominate the YouTube homepage using advanced Gemini AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <button onClick={onStart} className="group relative px-10 py-5 bg-red-600 hover:bg-red-500 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:-translate-y-1">
            <div className="flex items-center gap-3">
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          <button className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3">
            <Monitor className="w-5 h-5" />
            View Demo
          </button>
        </div>
      </main>
    </div>
  );
};

const ToolButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean 
}> = ({ icon, label, onClick, active, disabled }) => (
  <div className="relative group/tool">
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`p-3 backdrop-blur-md border border-white/10 rounded-xl text-white transition-all shadow-xl flex items-center justify-center ${
        active 
          ? 'bg-red-600 border-red-500 ring-2 ring-red-500/20' 
          : 'bg-black/40 hover:bg-white/10 hover:border-white/20'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {icon}
    </button>
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1a1a1a] text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 translate-x-2 group-hover/tool:opacity-100 group-hover/tool:translate-x-0 transition-all pointer-events-none border border-white/10 shadow-2xl z-50">
      {label}
      <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[6px] border-l-[#1a1a1a]" />
    </div>
  </div>
);

const EditorView: React.FC = () => {
  const [state, setState] = useState<AppState>({
    messages: [
      {
        id: '1',
        role: 'assistant',
        text: "Welcome to the Studio. Upload a photo or describe a scene, and I'll craft a high-conversion 16:9 YouTube thumbnail. What's the video about?",
        timestamp: Date.now()
      }
    ],
    currentImage: null,
    history: [],
    historyIndex: -1,
    isLoading: false,
    suggestions: [],
    isSuggesting: false,
    error: null
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ format: 'image/png', quality: 'standard' });
  const [input, setInput] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Region Selection State
  const [isRegionMode, setIsRegionMode] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [regionPrompt, setRegionPrompt] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isReplacingRef = useRef<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch (e) { console.error("Failed to parse projects", e); }
    }
    refreshSuggestions();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setShowSettings(false);
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [state.messages, state.isLoading, state.isSuggesting]);

  const refreshSuggestions = async (lastMsg?: string, forceImage?: string | null) => {
    setState(prev => ({ ...prev, isSuggesting: true }));
    try {
      const imageToAnalyze = forceImage !== undefined ? forceImage : state.currentImage;
      const suggestions = await getThumbnailSuggestions(lastMsg, imageToAnalyze);
      setState(prev => ({ ...prev, suggestions, isSuggesting: false }));
    } catch (err) {
      setState(prev => ({ ...prev, isSuggesting: false }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRegionMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setSelection({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
      active: true
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selection?.active || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setSelection(prev => prev ? {
      ...prev,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    } : null);
  };

  const handleMouseUp = () => {
    if (!selection || !selection.active) return;
    const w = Math.abs(selection.currentX - selection.startX);
    const h = Math.abs(selection.currentY - selection.startY);
    if (w < 10 || h < 10) {
      setSelection(null);
      return;
    }
    setSelection(prev => prev ? { ...prev, active: false } : null);
  };

  const resizeImage = (base64: string, width: number, height: number, mimeType: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(base64); return; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(mimeType, 0.92));
      };
      img.src = base64;
    });
  };

  const cropTo16x9 = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280; canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(base64); return; }
        const sourceAspect = img.width / img.height;
        const targetAspect = 16 / 9;
        let dw, dh, ox, oy;
        if (sourceAspect > targetAspect) {
          dh = img.height; dw = img.height * targetAspect; ox = (img.width - dw) / 2; oy = 0;
        } else {
          dw = img.width; dh = img.width / targetAspect; ox = 0; oy = (img.height - dh) / 2;
        }
        ctx.drawImage(img, ox, oy, dw, dh, 0, 0, 1280, 720);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64;
    });
  };

  const handleUndo = () => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      setState(prev => ({ ...prev, historyIndex: newIndex, currentImage: prev.history[newIndex] }));
      refreshSuggestions("User undo");
    }
  };

  const handleRedo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({ ...prev, historyIndex: newIndex, currentImage: prev.history[newIndex] }));
      refreshSuggestions("User redo");
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const activePrompt = customPrompt || input;
    if (!activePrompt.trim() && !state.currentImage) return;

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now().toString(), role: 'user', text: activePrompt || "Enhance image", timestamp: Date.now() }],
      isLoading: true,
      suggestions: [], 
      error: null
    }));
    
    const activeImageAtTimeOfRequest = state.currentImage;
    if (!customPrompt) setInput('');

    try {
      const result = await processThumbnailRequest(activePrompt || "Make this look viral", activeImageAtTimeOfRequest);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: result.text, imageUrl: result.imageUrl, timestamp: Date.now() };

      setState(prev => {
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push(result.imageUrl);
        return { ...prev, messages: [...prev.messages, assistantMessage], history: newHistory, historyIndex: newHistory.length - 1, currentImage: result.imageUrl, isLoading: false };
      });
      refreshSuggestions(activePrompt, result.imageUrl);
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  const handleRegionEditSubmit = async () => {
    if (!selection || !regionPrompt.trim() || !state.currentImage) return;
    const x = Math.min(selection.startX, selection.currentX);
    const y = Math.min(selection.startY, selection.currentY);
    
    // Convert canvas coords to relative percentages for prompt context
    const relX = (x / (canvasRef.current?.clientWidth || 1) * 100).toFixed(0);
    const relY = (y / (canvasRef.current?.clientHeight || 1) * 100).toFixed(0);
    
    const augmentedPrompt = `In the specific region located at approximately ${relX}% from the left and ${relY}% from the top, perform this edit: "${regionPrompt}". Ensure the result is cinematic and high-quality.`;
    
    setIsRegionMode(false);
    setSelection(null);
    setRegionPrompt('');
    handleSend(augmentedPrompt);
  };

  const handleRemoveBackground = () => {
    handleSend("Remove the background of this image and replace it with a clean, cinematic professional studio gradient background that matches the lighting of the subject.");
  };

  const saveToLibrary = () => {
    if (!state.currentImage) return;
    const newProject: Project = { id: Date.now().toString(), thumbnailUrl: state.currentImage, timestamp: Date.now(), name: `${DUMMY_USERNAME}-thumbnail-${state.historyIndex + 1}` };
    setProjects(prev => [newProject, ...prev]);
    return newProject.name;
  };

  const loadProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      currentImage: project.thumbnailUrl,
      history: [project.thumbnailUrl],
      historyIndex: 0,
      messages: [...prev.messages, { id: Date.now().toString(), role: 'assistant', text: `Loaded project: ${project.name}`, timestamp: Date.now() }]
    }));
    setShowProjects(false);
    refreshSuggestions("Project loaded", project.thumbnailUrl);
  };

  const triggerReplace = () => {
    isReplacingRef.current = true;
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = await cropTo16x9(reader.result as string);
        if (isReplacingRef.current) {
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, { id: Date.now().toString(), role: 'assistant', text: "Frame replaced.", timestamp: Date.now() }],
            history: prev.history.map((h, i) => i === prev.historyIndex ? base64 : h),
            currentImage: base64
          }));
        } else {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(base64);
          setState(prev => ({ 
            ...prev, 
            history: newHistory, 
            historyIndex: newHistory.length - 1, 
            currentImage: base64, 
            messages: [...prev.messages, { id: Date.now().toString(), role: 'assistant', text: "Image received and auto-cropped.", timestamp: Date.now() }] 
          }));
        }
        isReplacingRef.current = false;
        refreshSuggestions("Image uploaded", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAdvancedExport = async () => {
    if (!state.currentImage) return;
    let w = 1280, h = 720;
    if (exportConfig.quality === 'hd') { w = 1920; h = 1080; }
    else if (exportConfig.quality === 'ultra') { w = 3840; h = 2160; }
    const exportImage = await resizeImage(state.currentImage, w, h, exportConfig.format);
    const link = document.createElement('a');
    link.href = exportImage;
    link.download = `${saveToLibrary()}_${exportConfig.quality}.${exportConfig.format === 'image/png' ? 'png' : 'jpg'}`;
    link.click();
    setShowExportMenu(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 py-3 bg-[#111] border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">THUMBNAIL <span className="text-red-600">PRO</span></h1>
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span><p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Studio Active</p></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowProjects(!showProjects)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-white/5 ${showProjects ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-300 hover:text-white'}`}>
            <FolderOpen className="w-4 h-4" /> Library ({projects.length})
          </button>
          <div className="hidden md:flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
            <button onClick={handleUndo} disabled={state.historyIndex <= 0} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all disabled:opacity-10"><Undo2 className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-white/5 mx-1" />
            <button onClick={handleRedo} disabled={state.historyIndex >= state.history.length - 1} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all disabled:opacity-10"><Redo2 className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2 relative" ref={exportRef}>
            {state.currentImage && (
              <div className="flex items-stretch">
                <button onClick={performAdvancedExport} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-l-lg font-bold text-sm transition-all shadow-lg shadow-red-600/10 border-r border-white/10"><Download className="w-4 h-4" /> Export</button>
                <button onClick={() => setShowExportMenu(!showExportMenu)} className={`px-2 py-2 bg-red-600 hover:bg-red-500 text-white rounded-r-lg transition-all ${showExportMenu ? 'bg-red-700' : ''}`}><ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} /></button>
              </div>
            )}
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Resolution</p>
                  <div className="space-y-1">
                    {['standard', 'hd', 'ultra'].map((q) => (
                      <button key={q} onClick={() => setExportConfig({ ...exportConfig, quality: q as ExportQuality })} className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${exportConfig.quality === q ? 'bg-red-600/10 border border-red-600/20' : 'hover:bg-white/5'}`}>
                        <div className="text-left"><p className={`text-xs font-bold ${exportConfig.quality === q ? 'text-white' : 'text-gray-400'}`}>{q === 'ultra' ? 'Ultra 4K' : q.toUpperCase()}</p></div>
                        {exportConfig.quality === q && <Check className="w-3 h-3 text-red-500" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3"><button onClick={performAdvancedExport} className="w-full py-2.5 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Download</button></div>
              </div>
            )}
            <button onClick={() => { if(confirm('Reset?')) window.location.reload(); }} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {showProjects && (
          <div className="absolute inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-2xl flex flex-col p-8 lg:p-12 transition-all animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto w-full">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3"><FolderOpen className="w-8 h-8 text-red-600" /> PROJECT LIBRARY</h2>
              <button onClick={() => setShowProjects(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full scrollbar-hide pb-20">
              {projects.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-40 text-center"><ImageIcon className="w-20 h-20 mb-6 mx-auto" /><p className="text-xl font-bold">Your gallery is empty</p></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {projects.map((p) => (
                    <div key={p.id} onClick={() => loadProject(p)} className="group relative aspect-video bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 cursor-pointer transition-all hover:-translate-y-1 shadow-2xl">
                      <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={p.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent p-6 flex flex-col justify-end"><h4 className="font-bold text-white truncate">{p.name}</h4></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full max-w-md lg:max-w-lg flex flex-col bg-[#0f0f0f] border-r border-white/5">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
            {state.messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`group relative max-w-[90%] rounded-2xl p-4 transition-all ${msg.role === 'user' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'bg-[#1a1a1a] text-gray-200 border border-white/5'}`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  {msg.imageUrl && <div className="mt-3 relative group"><img src={msg.imageUrl} alt="preview" className="rounded-lg border border-white/10 w-full aspect-video object-cover hover:brightness-110 cursor-pointer" onClick={() => setState(prev => ({ ...prev, currentImage: msg.imageUrl! }))} /></div>}
                </div>
              </div>
            ))}
            {!state.isLoading && state.suggestions.length > 0 && (
              <div className="flex flex-col items-start gap-3 mt-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-1"><Wand2 className="w-3 h-3" /> Magic Edits</div>
                <div className="flex flex-wrap gap-2">
                  {state.suggestions.map((s, i) => (
                    <button key={i} disabled={state.isLoading} onClick={() => handleSend(s)} className="group px-4 py-2 bg-red-600/5 hover:bg-red-600/15 border border-red-500/20 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" /> {s} <ArrowRight className="w-3 h-3 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {state.isLoading && <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 flex items-center gap-3"><Loader2 className="w-5 h-5 text-red-600 animate-spin" /><span className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Rendering masterpiece...</span></div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-[#111] border-t border-white/5">
            <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
              <button onClick={() => { isReplacingRef.current = false; fileInputRef.current?.click(); }} disabled={state.isLoading} className="p-3 bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/5 rounded-xl transition-all shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <div className="flex-1 relative">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask for a cinematic edit..." className="w-full bg-[#1a1a1a] text-white rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none border border-white/5 resize-none min-h-[54px] max-h-32 text-sm shadow-sm" />
                <button onClick={() => handleSend()} disabled={state.isLoading || (!input.trim() && !state.currentImage)} className="absolute right-2 bottom-2 p-2 bg-red-600 text-white rounded-xl transition-all hover:bg-red-500 shadow-lg shadow-red-600/20"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 flex-col bg-[#050505] p-8 overflow-y-auto relative">
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2"><Layers className="w-4 h-4 text-red-600" /> Live Studio Canvas</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md"><Lock className="w-3 h-3 text-green-500" /><span className="text-[9px] font-black text-green-500 uppercase tracking-widest">16:9 LOCKED</span></div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setShowGrid(!showGrid)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showGrid ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 border border-white/5'}`}><Grid className="w-3 h-3" /> Rule of Thirds</button>
                <button onClick={saveToLibrary} disabled={!state.currentImage || state.isLoading} className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 rounded-lg transition-all"><Save className="w-3 h-3" /> Take Snapshot</button>
              </div>
            </div>
            
            <div 
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`group relative aspect-video w-full bg-[#111] rounded-2xl border-2 ${state.isLoading ? 'border-red-600/50' : 'border-white/5'} overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] transition-all duration-700 ${isRegionMode ? 'cursor-crosshair' : ''}`}
            >
              {state.currentImage ? (
                <div className="w-full h-full relative select-none">
                  <img src={state.currentImage} alt="canvas" className={`w-full h-full object-cover transition-all duration-500 pointer-events-none ${state.isLoading ? 'scale-105 blur-sm opacity-50' : 'scale-100 opacity-100'}`} />
                  
                  {/* Floating Tool Dock - Always accessible on current image */}
                  {!state.isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 transition-all opacity-0 group-hover:opacity-100 duration-300">
                      <ToolButton 
                        icon={<Eraser className="w-5 h-5" />} 
                        label="Remove Background" 
                        onClick={handleRemoveBackground}
                      />
                      <ToolButton 
                        icon={<SquareDashedMousePointer className="w-5 h-5" />} 
                        label="Edit Region" 
                        onClick={() => {
                          setIsRegionMode(!isRegionMode);
                          setSelection(null);
                        }}
                        active={isRegionMode}
                      />
                      <ToolButton 
                        icon={<Sparkle className="w-5 h-5" />} 
                        label="Auto Enhance" 
                        onClick={() => handleSend("Analyze this thumbnail and automatically enhance the lighting, contrast, and colors to make it look professional and viral.")}
                      />
                      <div className="h-px bg-white/10 mx-2" />
                      <ToolButton 
                        icon={<RefreshCw className="w-5 h-5" />} 
                        label="Replace Source" 
                        onClick={triggerReplace}
                      />
                      <ToolButton 
                        icon={<Maximize2 className="w-5 h-5" />} 
                        label="Full Preview" 
                        onClick={() => setShowFullPreview(true)}
                      />
                    </div>
                  )}

                  {/* Selection Overlay */}
                  {selection && (
                    <div 
                      className="absolute border-2 border-red-600 bg-red-600/10 pointer-events-none z-20 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                      style={{
                        left: Math.min(selection.startX, selection.currentX),
                        top: Math.min(selection.startY, selection.currentY),
                        width: Math.abs(selection.currentX - selection.startX),
                        height: Math.abs(selection.currentY - selection.startY)
                      }}
                    >
                      <div className="absolute -top-7 left-0 bg-red-600 text-[10px] font-black text-white px-2 py-1 rounded-t-lg uppercase tracking-widest shadow-lg">Target Area</div>
                    </div>
                  )}

                  {/* Region Prompt UI */}
                  {!isRegionMode && selection && !selection.active && (
                    <div 
                      className="absolute z-40 p-5 bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 w-80"
                      style={{
                        left: Math.max(10, Math.min(selection.startX, selection.currentX)),
                        top: Math.max(10, Math.min(selection.startY, selection.currentY) + Math.abs(selection.currentY - selection.startY) + 15)
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-red-500" />
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Region Action</p>
                      </div>
                      <div className="space-y-3">
                        <textarea 
                          autoFocus
                          value={regionPrompt}
                          onChange={(e) => setRegionPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleRegionEditSubmit();
                            }
                          }}
                          placeholder="e.g. 'Add a cinematic lens flare here'..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-600/50 resize-none h-20 placeholder:text-gray-600"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Press Enter to Apply</p>
                          <div className="flex gap-2">
                            <button onClick={() => setSelection(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                            <button onClick={handleRegionEditSubmit} disabled={!regionPrompt.trim()} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg shadow-red-600/20">Apply</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isRegionMode && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center pointer-events-none z-10 transition-all">
                      <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600 animate-pulse">
                          <Target className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-center">
                          <p className="px-6 py-2 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-2xl">Drag on Canvas to Select</p>
                          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Click icon again to cancel</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showGrid && !state.isLoading && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 animate-in fade-in duration-500">
                      {[...Array(9)].map((_, i) => <div key={i} className="border-r border-b border-white/10" />)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-[#1a1a1a] rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl group-hover:scale-105 transition-transform"><ImageIcon className="w-10 h-10 text-gray-700" /></div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">Your Masterpiece Awaits</h3>
                  <p className="text-sm text-gray-500 max-w-xs mb-8 font-medium leading-relaxed">Start with a photo or a description. We'll handle the viral aesthetics.</p>
                  <button onClick={() => { isReplacingRef.current = false; fileInputRef.current?.click(); }} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl hover:-translate-y-0.5">Select Source Image</button>
                </div>
              )}
            </div>

            {state.history.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><History className="w-3.5 h-3.5" /> Revision History</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{state.history.length} Version{state.history.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                  {state.history.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { 
                        setState(prev => ({ ...prev, currentImage: img, historyIndex: idx })); 
                        refreshSuggestions("Switched version", img); 
                      }} 
                      className={`relative flex-shrink-0 w-44 aspect-video rounded-2xl overflow-hidden border-2 transition-all ${
                        state.historyIndex === idx 
                          ? 'border-red-600 scale-105 shadow-2xl shadow-red-600/30' 
                          : 'border-white/5 opacity-40 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Version ${idx}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded">V{idx + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showFullPreview && state.currentImage && (
        <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center p-4 lg:p-20 backdrop-blur-3xl transition-all animate-in fade-in zoom-in duration-300" onClick={() => setShowFullPreview(false)}>
          <div className="relative w-full max-w-7xl aspect-video bg-[#050505] rounded-[2rem] overflow-hidden shadow-[0_0_120px_rgba(255,0,0,0.1)] border border-white/10">
            <img src={state.currentImage} className="w-full h-full object-contain" alt="Rendered Preview" />
            <button className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white backdrop-blur-md transition-all border border-white/10" onClick={() => setShowFullPreview(false)}><X className="w-6 h-6" /></button>
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Rendered Masterpiece</p>
                <h2 className="text-3xl font-black text-white tracking-tighter">Final Thumbnail Prototype</h2>
              </div>
              <button onClick={(e) => { e.stopPropagation(); performAdvancedExport(); }} className="bg-white text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-2xl hover:bg-gray-200 transition-all hover:scale-105">Export for YouTube</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress { animation: progress 2s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        ::selection { background-color: rgba(220, 38, 38, 0.3); color: white; }
      `}} />
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'editor'>('landing');
  return view === 'landing' ? <LandingPage onStart={() => setView('editor')} /> : <EditorView />;
};

export default App;
