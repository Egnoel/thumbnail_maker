
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppState } from './types';
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
  RefreshCw
} from 'lucide-react';

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
  
  const [input, setInput] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReplacingRef = useRef<boolean>(false);

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
        // Fallback to add if history is empty
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
    const link = document.createElement('a');
    link.href = state.currentImage;
    link.download = `yt-thumbnail-${Date.now()}.png`;
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
              onClick={() => { if(confirm('Reset Project?')) window.location.reload(); }}
              className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="New Project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
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
                          <Download className="w-4 h-4" /> Save Export
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
                <h2 className="text-2xl font-black text-white tracking-tighter">PROJECT_V{state.historyIndex + 1}_YT.PNG</h2>
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
