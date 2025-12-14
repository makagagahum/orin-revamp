import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle } from 'lucide-react';
import { MarketingChart, ROIChart } from './components/Charts';
import { ContentProtection } from './components/ContentProtection';
import PacManGame from './components/PacManGame';
import { TEAM, FEATURES, GALLERY_IMAGES } from './constants';
import { systemInstruction } from './services/geminiService';

function useInView(options = { threshold: 0.1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return [ref, isInView] as const;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

// --- VISUAL COMPONENTS ---

const LegalModal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-[#0a0e27] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-400">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-sm text-gray-300">{children}</div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [ref, isInView] = useInView();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/cerebras-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          systemPrompt: systemInstruction,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.reply || 'I encountered an error processing your message.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1428] text-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-green-500/20 bg-[#0a0e27]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="text-2xl font-black text-green-400">orin.work</div>
          <nav className={`${isMobile ? (isMobileMenuOpen ? 'flex' : 'hidden') : 'flex'} ${isMobile ? 'absolute top-16 left-0 right-0 flex-col bg-[#0a0e27] p-4' : ''} gap-6`}>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-green-400 transition">
              Home
            </a>
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-green-400 transition">
              Features
            </a>
            <a href="#team" className="text-sm font-medium text-gray-300 hover:text-green-400 transition">
              Team
            </a>
          </nav>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-green-400">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* CHAT SECTION */}
      <section className="relative mt-16 flex h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Main Chat */}
        <div className="flex flex-1 flex-col bg-gradient-to-b from-[#0f1428]/50 to-[#1a1f3a]/50 md:border-r md:border-green-500/20">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 border-2 border-green-500/50">
                      <Sparkles className="text-green-400" size={48} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-green-400 mb-2">Meet ORIN AI</h2>
                  <p className="text-gray-400 max-w-md">Your Advanced Digital Employee for Filipino Businesses</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md lg:max-w-lg ${
                      msg.role === 'user'
                        ? 'bg-green-500/20 border border-green-500/50 text-green-100'
                        : 'bg-[#1a1f3a] border border-green-500/20 text-gray-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-[#1a1f3a] border border-green-500/20 px-4 py-2 text-gray-400">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-green-500/20 bg-[#0f1428]/50 p-4 md:p-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask ORIN anything..."
                className="flex-1 rounded-lg bg-[#1a1f3a] border border-green-500/30 px-4 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-green-500/80 hover:bg-green-500 disabled:bg-gray-600 px-4 py-2 text-white font-medium transition flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {!isMobile && (
          <div className="hidden md:flex w-80 flex-col bg-[#0f1428]/30 border-l border-green-500/20 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Status */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-green-400 font-semibold">
                  <CheckCircle size={16} />
                  STATUS: ONLINE 24/7
                </div>
                <p className="text-sm text-gray-400">ORIN is actively monitoring and ready to assist</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-green-400">CAPABILITIES</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Sales Support & Customer Management</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Operations & Workflow Automation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Real-time Business Intelligence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* LEGAL MODALS */}
      {showLegal === 'privacy' && (
        <LegalModal title="Privacy Policy" onClose={() => setShowLegal(null)}>
          <p>Your privacy is important. We do not collect personal data beyond what is necessary for service delivery.</p>
        </LegalModal>
      )}
      {showLegal === 'terms' && (
        <LegalModal title="Terms of Service" onClose={() => setShowLegal(null)}>
          <p>By using ORIN AI, you agree to our terms of service and responsible use policy.</p>
        </LegalModal>
      )}
    </div>
  );
}