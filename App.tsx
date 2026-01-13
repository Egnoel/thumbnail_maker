
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppState, Project } from './types';
import { processThumbnailRequest } from './services/geminiService';
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
  CreditCard
} from 'lucide-react';

const STORAGE_KEY = 'thumbnail_pro_projects';
const DUMMY_USERNAME = "CreativeDev";
const PROFILE_IMAGE_URL = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    messages: [
      {
        id: '1',
        role: 'assistant',
        text: "Welcome to Thumbnail Pro. Upload a photo or describe a scene, and I'll craft a high-conversion 16:9 YouTube thumbnail. What's the video about?",
        timestamp: Date.now()
      }
    ],
    currentImage: null,
    history: [],
    historyIndex: -1,
    isLoading: false,
    error: null
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const isReplacingRef = useRef<boolean>(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isLoading]);

  const addToHistory = (newImageUrl: string) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newImageUrl);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        currentImage: newImageUrl
      };
    });
  };

  const replaceInHistory = (newImageUrl: string) => {
    setState(prev => {
      if (prev.historyIndex === -1) {
        return {
          ...prev,
          history: [newImageUrl],
          historyIndex: 0,
          currentImage: newImageUrl
        };
      }
      const newHistory = [...prev.history];
      newHistory[prev.historyIndex] = newImageUrl;
      return {
        ...prev,
        history: newHistory,
        currentImage: newImageUrl
      };
    });
  };

  const handleUndo = () => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      setState(prev => ({
        ...prev,
        historyIndex: newIndex,
        currentImage: prev.history[newIndex]
      }));
    }
  };

  const handleRedo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({
        ...prev,
        historyIndex: newIndex,
        currentImage: prev.history[newIndex]
      }));
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const activePrompt = customPrompt || input;
    if (!activePrompt.trim() && !state.currentImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: activePrompt || "Enhance current image",
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    const activeImageAtTimeOfRequest = state.currentImage;
    if (!customPrompt) setInput('');

    try {
      const result = await processThumbnailRequest(activePrompt || "Make this look viral and high contrast", activeImageAtTimeOfRequest);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: result.text,
        imageUrl: result.imageUrl,
        timestamp: Date.now()
      };

      setState(prev => {
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push(result.imageUrl);
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          history: newHistory,
          historyIndex: newHistory.length - 1,
          currentImage: result.imageUrl,
          isLoading: false
        };
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message
      }));
    }
  };

  const saveToLibrary = () => {
    if (!state.currentImage) return;
    const incrementNumber = state.historyIndex + 1;
    const newProject: Project = {
      id: Date.now().toString(),
      thumbnailUrl: state.currentImage,
      timestamp: Date.now(),
      name: `${DUMMY_USERNAME}-thumbnail-${incrementNumber}`
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject.name;
  };

  const loadProject = (project: Project) => {
    setState({
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: `Project "${project.name}" loaded successfully. Ready for more edits!`,
          timestamp: Date.now()
        }
      ],
      currentImage: project.thumbnailUrl,
      history: [project.thumbnailUrl],
      historyIndex: 0,
      isLoading: false,
      error: null
    });
    setShowProjects(false);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        if (isReplacingRef.current) {
          replaceInHistory(base64);
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              id: Date.now().toString(),
              role: 'assistant',
              text: "Current image replaced. Ready for new edits on this source!",
              timestamp: Date.now()
            }]
          }));
        } else {
          addToHistory(base64);
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              id: Date.now().toString(),
              role: 'assistant',
              text: "Image received. How should we transform this into a viral thumbnail?",
              timestamp: Date.now()
            }]
          }));
        }
        isReplacingRef.current = false;
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerReplace = () => {
    isReplacingRef.current = true;
    fileInputRef.current?.click();
  };

  const downloadImage = () => {
    if (!state.currentImage) return;
    const fileName = saveToLibrary();
    const link = document.createElement('a');
    link.href = state.currentImage;
    link.download = `${fileName}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#111] border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">THUMBNAIL <span className="text-red-600">PRO</span></h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Studio Active</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProjects(!showProjects)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-white/5 ${showProjects ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-300 hover:text-white'}`}
          >
            <FolderOpen className="w-4 h-4" />
            Projects Library ({projects.length})
          </button>

          <div className="hidden md:flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
            <button
              onClick={handleUndo}
              disabled={state.historyIndex <= 0}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all disabled:opacity-10"
              title="Undo Action"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/5 mx-1" />
            <button
              onClick={handleRedo}
              disabled={state.historyIndex >= state.history.length - 1}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all disabled:opacity-10"
              title="Redo Action"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            {state.currentImage && (
              <button 
                onClick={downloadImage}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-600/10"
              >
                <Download className="w-4 h-4" />
                Export 16:9
              </button>
            )}
            <button 
              onClick={() => { if(confirm('Reset current project?')) window.location.reload(); }}
              className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="New Project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Profile and Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-full transition-all border border-white/5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-lg">
                <img src={PROFILE_IMAGE_URL} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showSettings ? 'rotate-180' : ''}`} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 bg-gradient-to-br from-[#222] to-[#1a1a1a] border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                      <img src={PROFILE_IMAGE_URL} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-black text-white truncate">{DUMMY_USERNAME}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Pro Member</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                    <User className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                    Account Details
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                    <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                    Billing & Plan
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                    Studio Settings
                  </button>
                </div>
                <div className="p-2 border-t border-white/5">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group">
                    <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Projects Overlay */}
        {showProjects && (
          <div className="absolute inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-2xl flex flex-col p-8 lg:p-12 transition-all animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto w-full">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-red-600" />
                PROJECT LIBRARY
              </h2>
              <button 
                onClick={() => setShowProjects(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full scrollbar-hide pb-20">
              {projects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ImageIcon className="w-20 h-20 mb-6" />
                  <p className="text-xl font-bold">No saved projects yet</p>
                  <p className="text-sm mt-2">Projects are automatically saved when you export or click the save icon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {projects.map((project) => (
                    <div 
                      key={project.id}
                      onClick={() => loadProject(project)}
                      className="group relative aspect-video bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-600/20"
                    >
                      <img src={project.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={project.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-6 flex flex-col justify-end">
                        <h4 className="font-bold text-white text-lg truncate mb-1">{project.name}</h4>
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(project.timestamp).toLocaleDateString()} — {new Date(project.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => deleteProject(project.id, e)}
                          className="p-2.5 bg-black/80 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat / Sidebar Controls */}
        <div className="w-full max-w-md lg:max-w-lg flex flex-col bg-[#0f0f0f] border-r border-white/5">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
            {state.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`group relative max-w-[90%] rounded-2xl p-4 transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' 
                    : 'bg-[#1a1a1a] text-gray-200 border border-white/5'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  {msg.imageUrl && (
                    <div className="mt-3 relative group">
                      <img 
                        src={msg.imageUrl} 
                        alt="Thumbnail preview" 
                        className="rounded-lg border border-white/10 w-full aspect-video object-cover hover:brightness-110 transition-all cursor-pointer"
                        onClick={() => setState(prev => ({ ...prev, currentImage: msg.imageUrl! }))}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded text-white font-bold uppercase">Revision</span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-600 mt-2 px-1 uppercase tracking-tighter">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {state.isLoading && (
              <div className="flex flex-col items-start gap-2">
                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                    <Sparkles className="w-3 h-3 text-white absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Rendering Cinematic FX...</span>
                </div>
              </div>
            )}
            
            {state.error && (
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">!</div>
                {state.error}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Tools & Input */}
          <div className="p-4 bg-[#111] border-t border-white/5">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
              {[
                { label: '🔥 Viral Glow', prompt: 'Add intense cinematic lighting and a neon rim glow around the main subjects.' },
                { label: '🌌 Space FX', prompt: 'Replace the background with a vibrant, detailed space nebula with depth of field.' },
                { label: '✂️ Clear BG', prompt: 'Remove the existing background and replace it with a clean, high-contrast professional studio gradient.' },
                { label: '🤯 Shocked', prompt: 'Make the subjects in the image look extremely shocked and excited, wide-eyed and expressive.' }
              ].map((tool) => (
                <button
                  key={tool.label}
                  disabled={state.isLoading || !state.currentImage}
                  onClick={() => handleSend(tool.prompt)}
                  className="flex-shrink-0 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all disabled:opacity-30"
                >
                  {tool.label}
                </button>
              ))}
            </div>

            <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
              <button 
                onClick={() => { isReplacingRef.current = false; fileInputRef.current?.click(); }}
                disabled={state.isLoading}
                className="p-3 bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/5 rounded-xl transition-all disabled:opacity-50"
                title="Upload New Source"
              >
                <UploadCloud className="w-6 h-6" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask for an edit (e.g. 'put me in a jungle')..."
                  className="w-full bg-[#1a1a1a] text-white rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-red-600/50 border border-white/5 resize-none min-h-[54px] max-h-32 text-sm font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={state.isLoading || (!input.trim() && !state.currentImage)}
                  className="absolute right-2 bottom-2 p-2 bg-red-600 text-white rounded-xl disabled:opacity-20 transition-all hover:bg-red-500 shadow-lg shadow-red-600/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Preview Panel */}
        <div className="hidden lg:flex flex-1 flex-col bg-[#050505] p-8 overflow-y-auto relative">
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600" />
                Live Studio Canvas (16:9)
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={saveToLibrary}
                  disabled={!state.currentImage || state.isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all disabled:opacity-30"
                  title="Save snapshot to project library"
                >
                  <Save className="w-3 h-3" />
                  Snapshot
                </button>
                <button 
                  onClick={triggerReplace}
                  disabled={!state.currentImage || state.isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all disabled:opacity-30"
                  title="Replace current frame with a new image"
                >
                  <RefreshCw className="w-3 h-3" />
                  Replace Frame
                </button>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  <span>Res: 1024 x 576</span>
                  <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                  <span>Layers: {state.history.length}</span>
                </div>
              </div>
            </div>
            
            <div className={`relative aspect-video w-full bg-[#111] rounded-2xl border-2 ${state.isLoading ? 'border-red-600/50' : 'border-white/5'} overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] transition-all duration-700`}>
              {state.currentImage ? (
                <div className="w-full h-full relative group">
                  <img 
                    src={state.currentImage} 
                    alt="Current masterpiece" 
                    className={`w-full h-full object-cover transition-all duration-500 ${state.isLoading ? 'scale-105 blur-sm opacity-50' : 'scale-100 opacity-100'}`}
                  />
                  {!state.isLoading && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                      <div className="flex gap-4">
                        <button 
                          onClick={downloadImage}
                          className="bg-white text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl"
                        >
                          <Download className="w-4 h-4" /> Export Master
                        </button>
                        <button 
                          onClick={() => setShowFullPreview(true)}
                          className="bg-black/80 text-white border border-white/20 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl"
                        >
                          <Maximize2 className="w-4 h-4" /> Fullscreen
                        </button>
                      </div>
                    </div>
                  )}
                  {state.isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 animate-progress"></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 bg-[#1a1a1a] rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-xl">
                    <ImageIcon className="w-10 h-10 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Your Canvas is Ready</h3>
                  <p className="text-gray-500 text-sm max-w-xs mb-8 leading-relaxed font-medium">Upload a photo or enter a prompt to start building your next viral thumbnail.</p>
                  <button 
                    onClick={() => { isReplacingRef.current = false; fileInputRef.current?.click(); }}
                    className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl"
                  >
                    Select Source Image
                  </button>
                </div>
              )}
            </div>

            {/* Visual History Strip */}
            {state.history.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-3.5 h-3.5" />
                  Revision History
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                  {state.history.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setState(prev => ({ ...prev, currentImage: img, historyIndex: idx }))}
                      className={`relative flex-shrink-0 w-40 aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        state.historyIndex === idx ? 'border-red-600 scale-105 shadow-lg shadow-red-600/20' : 'border-white/5 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Version ${idx}`} />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-black px-1.5 py-0.5 rounded text-white border border-white/10 uppercase">
                        V{idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fullscreen Preview Modal */}
      {showFullPreview && state.currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 lg:p-20 backdrop-blur-xl transition-all animate-in fade-in zoom-in duration-300"
          onClick={() => setShowFullPreview(false)}
        >
          <div className="relative w-full max-w-7xl aspect-video bg-[#111] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.15)] border border-white/10">
            <img src={state.currentImage} className="w-full h-full object-contain" alt="Fullscreen preview" />
            <button 
              className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-md transition-all"
              onClick={() => setShowFullPreview(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
              <div>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Master Render</span>
                <h2 className="text-2xl font-black text-white tracking-tighter">{DUMMY_USERNAME}-thumbnail-{state.historyIndex + 1}.png</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); downloadImage(); }}
                className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-2xl hover:bg-red-500 transition-all"
              >
                Download Master
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default App;
