
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
  Redo2
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    messages: [
      {
        id: '1',
        role: 'assistant',
        text: "Hi! I'm your AI Thumbnail Pro. Upload an image or describe a scene, and I'll create a high-impact 16:9 YouTube thumbnail for you. What are we making today?",
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

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

  const handleSend = async () => {
    if (!input.trim() && !state.currentImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    const currentInput = input;
    const activeImageAtTimeOfRequest = state.currentImage;
    setInput('');

    try {
      const result = await processThumbnailRequest(currentInput || "enhance this for a youtube thumbnail", activeImageAtTimeOfRequest);
      
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
        addToHistory(base64);
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now().toString(),
            role: 'assistant',
            text: "Image uploaded! What changes should I make to turn this into a viral thumbnail?",
            timestamp: Date.now()
          }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!state.currentImage) return;
    const link = document.createElement('a');
    link.href = state.currentImage;
    link.download = `thumbnail-${Date.now()}.png`;
    link.click();
  };

  const resetEditor = () => {
    if (window.confirm('Reset everything?')) {
      setState({
        messages: [
          {
            id: '1',
            role: 'assistant',
            text: "Let's start fresh. What's your new video about?",
            timestamp: Date.now()
          }
        ],
        currentImage: null,
        history: [],
        historyIndex: -1,
        isLoading: false,
        error: null
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Thumbnail Pro AI</h1>
            <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Undo/Redo Controls */}
          <div className="flex items-center bg-[#2a2a2a] rounded-full px-1 py-1 gap-1 border border-gray-700">
            <button
              onClick={handleUndo}
              disabled={state.historyIndex <= 0}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={state.historyIndex >= state.history.length - 1}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-gray-700 mx-1" />

          <div className="flex gap-2">
            {state.currentImage && (
              <button 
                onClick={downloadImage}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            <button 
              onClick={resetEditor}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden lg:flex-row flex-col">
        {/* Left: Chat Side */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f] border-r border-gray-800">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {state.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-[#1a1a1a] text-gray-100 border border-gray-800'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Thumbnail iteration" 
                      className="mt-3 rounded-lg border border-gray-700 w-full aspect-video object-cover"
                    />
                  )}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {state.isLoading && (
              <div className="flex items-center gap-3 text-gray-400 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm italic">Designing your thumbnail...</span>
              </div>
            )}
            {state.error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                Error: {state.error}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#1a1a1a] border-t border-gray-800">
            <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all"
                title="Upload image"
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
                  placeholder="Describe your thumbnail or request changes..."
                  className="w-full bg-[#2a2a2a] text-white rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-red-600 border border-transparent resize-none min-h-[50px] max-h-32 text-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={state.isLoading || (!input.trim() && !state.currentImage)}
                  className="absolute right-2 bottom-2 p-2 bg-red-600 text-white rounded-xl disabled:opacity-50 disabled:bg-gray-700 transition-all hover:bg-red-500"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-gray-500 mt-2">
              Tip: "Undo" ({state.historyIndex >= 0 ? state.historyIndex + 1 : 0}/{state.history.length}) will revert your live preview image.
            </p>
          </div>
        </div>

        {/* Right: Preview Panel (Persistent) */}
        <div className="hidden lg:flex w-[450px] flex-col bg-[#111] border-l border-gray-800 p-6 overflow-y-auto">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Live Preview
          </h2>
          
          <div className="space-y-8">
            <div className="aspect-video w-full bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden shadow-2xl group relative">
              {state.currentImage ? (
                <>
                  <img 
                    src={state.currentImage} 
                    alt="Current thumbnail" 
                    className="w-full h-full object-cover transition-all duration-300"
                    key={state.currentImage.substring(0, 100)} // Force re-render/animation on image change
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={downloadImage}
                      className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg"
                    >
                      <Download className="w-4 h-4" /> Save Result
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <UploadCloud className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No image generated yet.</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-xs font-bold text-red-500 hover:text-red-400"
                  >
                    Upload base image
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Add Red Border', prompt: 'Add a thick bold red border around the thumbnail' },
                  { label: 'Space Background', prompt: 'Put the subject in a colorful space nebula background' },
                  { label: 'Glow Effect', prompt: 'Add a professional inner glow to the subjects' },
                  { label: 'Shocked Face', prompt: 'Make the expression look more shocked/excited' }
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      setInput(action.prompt);
                    }}
                    className="px-3 py-2 bg-[#222] hover:bg-gray-800 border border-gray-800 rounded-lg text-xs font-medium text-gray-300 transition-all text-left"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-600/5 border border-red-600/20 rounded-xl">
              <h4 className="text-xs font-bold text-red-600 mb-2">History Controls</h4>
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={handleUndo}
                  disabled={state.historyIndex <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#222] border border-gray-700 rounded-lg text-[10px] font-bold uppercase disabled:opacity-20"
                >
                  <Undo2 className="w-3 h-3" /> Undo
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={state.historyIndex >= state.history.length - 1}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#222] border border-gray-700 rounded-lg text-[10px] font-bold uppercase disabled:opacity-20"
                >
                   Redo <Redo2 className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">History State</span>
                  <span className="text-white font-mono">{state.historyIndex + 1} / {state.history.length}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Aspect Ratio</span>
                  <span className="text-white font-mono">16:9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
