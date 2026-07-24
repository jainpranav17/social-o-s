import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Sparkles, Loader2, RefreshCw, Mic, Plus, FileText, Image, Video, Settings, Key, Eye, EyeOff, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import { askChatbot } from "@/lib/chat.functions";
import { toast } from "sonner";

interface AttachedFile {
  name: string;
  type: string;
  size: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  files?: AttachedFile[];
}

export function Chatbot() {
  const ask = useServerFn(askChatbot);
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your SocialOS AI Assistant. ☕⚡ How can I help you manage your social platforms, write captions, or schedule posts today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [lovableKey, setLovableKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [showLovableKey, setShowLovableKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatbot_muted") === "true";
    }
    return false;
  });
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);

  const playSpeech = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setActiveSpeechIndex((current) => current === index ? null : current);
      };
      utterance.onerror = () => {
        setActiveSpeechIndex((current) => current === index ? null : current);
      };
      setActiveSpeechIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeechIndex(null);
    }
  };

  useEffect(() => {
    const savedLovableKey = localStorage.getItem("lovable_api_key") || "";
    const savedOpenaiKey = localStorage.getItem("openai_api_key") || "";
    setLovableKey(savedLovableKey);
    setOpenaiKey(savedOpenaiKey);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newAttached = files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    setAttachedFiles((prev) => [...prev, ...newAttached]);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please allow microphone permissions.");
        } else {
          toast.error("Error recognizing speech. Try again.");
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          setInputValue("");
          handleSend(transcript);
        }
      };
    }
  }, [messages, attachedFiles, isMuted]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = { 
      role: "user", 
      content: text,
      files: attachedFiles.length > 0 ? attachedFiles : undefined
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // Send only roles and contents mapped correctly
      const chatHistory = updatedMessages.map((m) => {
        let content = m.content;
        if (m.files && m.files.length > 0) {
          const filesStr = m.files.map(f => `[Attached File: ${f.name} (type: ${f.type})]`).join("\n");
          content = `${filesStr}\n${content}`;
        }
        return {
          role: m.role,
          content: content,
        };
      });
      const userApiKey = localStorage.getItem("lovable_api_key") || undefined;
      const userOpenaiKey = localStorage.getItem("openai_api_key") || undefined;
      const res = await ask({
        data: {
          messages: chatHistory,
          apiKey: userApiKey,
          openaiApiKey: userOpenaiKey
        }
      });
      
      setMessages((prev) => {
        const nextMessages = [
          ...prev,
          { role: "assistant" as const, content: res.reply },
        ];
        const newMsgIdx = nextMessages.length - 1;

        if (!isMuted && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(res.reply);
          utterance.onend = () => {
            setActiveSpeechIndex((current) => current === newMsgIdx ? null : current);
          };
          utterance.onerror = () => {
            setActiveSpeechIndex((current) => current === newMsgIdx ? null : current);
          };
          setActiveSpeechIndex(newMsgIdx);
          window.speechSynthesis.speak(utterance);
        }
        return nextMessages;
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to connect to assistant.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that request. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm your SocialOS AI Assistant. How can I help you manage your social platforms, write captions, or schedule posts today?",
      },
    ]);
    stopSpeech();
  };

  const suggestions = [
    "How do I schedule a post?",
    "Brainstorm caption ideas for tech launch",
    "What platforms are supported?",
  ];

  return (
    <div
      className={isMaximized && isOpen ? "fixed inset-0 z-50 font-sans flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8" : "fixed bottom-6 right-6 z-50 font-sans"}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsMaximized(false);
        }
      }}
    >
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMaximized(true);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-elegant hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative group"
          style={{ background: "var(--gradient-primary)" }}
          aria-label="Open AI assistant"
        >
          <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={
            isMaximized
              ? "flex w-[95vw] md:w-[90vw] max-w-5xl h-[85vh] md:h-[80vh] flex-col rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 overflow-hidden"
              : "flex h-[520px] w-[360px] flex-col rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 animate-fade-in md:w-[380px] overflow-hidden"
          }
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">SocialOS AI Assistant</div>
                <div className="flex items-center gap-1.5 text-[10px] opacity-90">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Online
                </div>
              </div>
            </div>
             <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  localStorage.setItem("chatbot_muted", String(newMuted));
                  if (newMuted && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="rounded-lg p-1.5 hover:bg-white/10 text-white/90 hover:text-white transition cursor-pointer"
                title={isMuted ? "Unmute narration" : "Mute narration"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`rounded-lg p-1.5 transition cursor-pointer ${
                  showSettings ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/90 hover:text-white"
                }`}
                title="API Key Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              {!showSettings && (
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 hover:bg-white/10 text-white/90 hover:text-white transition cursor-pointer"
                  title="Reset conversation"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="rounded-lg p-1.5 hover:bg-white/10 text-white/90 hover:text-white transition cursor-pointer"
                title={isMaximized ? "Minimize chat" : "Maximize chat"}
              >
                {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMaximized(false);
                  stopSpeech();
                }}
                className="rounded-lg p-1.5 hover:bg-white/10 text-white/90 hover:text-white transition cursor-pointer"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Settings or Chat View */}
          {showSettings ? (
            <div className="flex-1 flex flex-col p-5 bg-card overflow-y-auto font-sans">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <Key className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">API Settings</h3>
              </div>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Configure your API keys below to activate premium AI capabilities. Keys are stored locally in your browser.
              </p>

              <div className="space-y-4 flex-1">
                {/* Lovable API Key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Lovable API Key
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showLovableKey ? "text" : "password"}
                      value={lovableKey}
                      onChange={(e) => setLovableKey(e.target.value)}
                      placeholder="lovable_..."
                      className="w-full rounded-lg border border-border bg-background pl-3 pr-10 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLovableKey(!showLovableKey)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      {showLovableKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 leading-normal">
                    Powers the Web Assistant and AI Caption Studio. Get your key from the Lovable console.
                  </p>
                </div>

                {/* OpenAI API Key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    OpenAI API Key
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showOpenaiKey ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full rounded-lg border border-border bg-background pl-3 pr-10 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      {showOpenaiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 leading-normal">
                    Used by the Python RAG chatbot backend CLI. Save here or add to your local `.env` file.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-border flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("lovable_api_key", lovableKey.trim());
                    localStorage.setItem("openai_api_key", openaiKey.trim());
                    toast.success("API keys updated successfully!");
                    setShowSettings(false);
                  }}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer text-center"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Save Keys
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const savedLovableKey = localStorage.getItem("lovable_api_key") || "";
                    const savedOpenaiKey = localStorage.getItem("openai_api_key") || "";
                    setLovableKey(savedLovableKey);
                    setOpenaiKey(savedOpenaiKey);
                    setShowSettings(false);
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 max-w-[85%] ${
                      m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div>
                      <div
                        className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed group/msg ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none border border-border pr-10"
                        }`}
                      >
                        {/* Render attached files previews if any */}
                        {m.files && m.files.length > 0 && (
                          <div className="mb-2 space-y-1">
                            {m.files.map((file, fileIdx) => {
                              const isImage = file.type.startsWith("image/");
                              const isVideo = file.type.startsWith("video/");
                              let FileIcon = FileText;
                              if (isImage) FileIcon = Image;
                              else if (isVideo) FileIcon = Video;
                              
                              return (
                                <div key={fileIdx} className="flex items-center gap-2 rounded-lg bg-black/10 dark:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">
                                  <FileIcon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate max-w-[150px]" title={file.name}>{file.name}</span>
                                  <span className="opacity-70 text-[10px]">({(file.size / 1024).toFixed(0)} KB)</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {m.content}

                        {/* Play/Stop Audio button for assistant message */}
                        {m.role === "assistant" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeSpeechIndex === idx) {
                                stopSpeech();
                              } else {
                                playSpeech(m.content, idx);
                              }
                            }}
                            className={`absolute right-2.5 top-2.5 p-1 rounded-md bg-background/50 hover:bg-background border border-border text-muted-foreground hover:text-foreground transition cursor-pointer ${
                              activeSpeechIndex === idx ? "opacity-100" : "opacity-0 group-hover/msg:opacity-100 focus:opacity-100"
                            }`}
                            title={activeSpeechIndex === idx ? "Stop audio" : "Begin audio"}
                          >
                            {activeSpeechIndex === idx ? (
                              <VolumeX className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Typing Loader */}
                {isLoading && (
                  <div className="flex gap-2.5 max-w-[80%] mr-auto">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center rounded-2xl bg-muted border border-border px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-xs text-muted-foreground font-medium">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions */}
              {messages.length === 1 && !isLoading && (
                <div className="px-4 py-2 bg-muted/30 border-t border-border space-y-1.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested queries</div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="text-[11px] bg-card hover:bg-muted text-foreground border border-border rounded-full px-2.5 py-1 text-left transition cursor-pointer font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Files Preview Bar */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/20 border-t border-border max-h-24 overflow-y-auto">
                  {attachedFiles.map((file, fileIdx) => {
                    const isImage = file.type.startsWith("image/");
                    const isVideo = file.type.startsWith("video/");
                    let FileIcon = FileText;
                    if (isImage) FileIcon = Image;
                    else if (isVideo) FileIcon = Video;
                    
                    return (
                      <div key={fileIdx} className="flex items-center gap-1.5 bg-card border border-border px-2 py-1 rounded-full text-xs text-foreground pr-1">
                        <FileIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachedFile(fileIdx)}
                          className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Input field area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="flex items-center gap-2 border-t border-border p-3 bg-card"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground transition active:scale-95 cursor-pointer"
                  title="Attach files, photos, or videos"
                  disabled={isLoading}
                >
                  <Plus className="h-4.5 w-4.5" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask anything about SocialOS..."}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition active:scale-95 cursor-pointer ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse border-red-500" 
                      : "bg-background text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                  }`}
                  title={isListening ? "Stop listening" : "Speak to assistant"}
                  disabled={isLoading}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
