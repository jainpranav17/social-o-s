import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Sparkles, Loader2, RefreshCw, Mic } from "lucide-react";
import { askChatbot } from "@/lib/chat.functions";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chatbot() {
  const ask = useServerFn(askChatbot);
  const [isOpen, setIsOpen] = useState(false);
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
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
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
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send only roles and contents mapped correctly
      const chatHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await ask({ data: { messages: chatHistory } });
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
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
  };

  const suggestions = [
    "How do I schedule a post?",
    "Brainstorm caption ideas for tech launch",
    "What platforms are supported?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
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
        <div className="flex h-[520px] w-[360px] flex-col rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 animate-fade-in md:w-[380px] overflow-hidden">
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
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="rounded-lg p-1.5 hover:bg-white/10 transition cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/10 transition cursor-pointer"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

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
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    {m.content}
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

          {/* Input field area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex items-center gap-2 border-t border-border p-3 bg-card"
          >
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
              disabled={!inputValue.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
