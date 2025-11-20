import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, ChevronDown, Sparkles, CheckCircle2, Layers, Cpu, Globe, ExternalLink, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { FEATURES, TEAM, GALLERY_IMAGES } from './constants';
import { generateResponse } from './services/geminiService';
import { MarketGrowthChart, RoiChart } from './components/Charts';
import PacManGame from './components/PacManGame';
import { ChatMessage } from './types';

// --- Particle Background (FullScreen) ---

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{x: number, y: number, vx: number, vy: number, size: number}> = [];
    let animationFrameId: number;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 9000));
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5, 
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient overlay for depth (Vignette)
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      gradient.addColorStop(0, 'rgba(5,5,5,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.8)'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 248, 168, 0.12)'; 
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Connect close particles
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let distSq = dx * dx + dy * dy;
          
          if (distSq < 15000) { 
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#38F8A8';
      for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none bg-[#020202]" />;
};

// --- Velocity Scroll Hook & Wrapper ---
// Distorts content based on scroll speed using physics-based Lerp for smoothness

const VelocityScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);
    const currentSkew = useRef(0);
    
    useEffect(() => {
        let rafId: number;
        
        const update = () => {
            const currentScrollY = window.scrollY;
            const velocity = currentScrollY - lastScrollY.current;
            lastScrollY.current = currentScrollY;
            
            // Calculate target skew based on velocity
            // Capped at 5 degrees to prevent excessive distortion
            const targetSkew = Math.max(Math.min(velocity * 0.1, 5), -5); 
            
            // Linear Interpolation (Lerp) for smooth transition
            // Moves 10% of the way to the target each frame
            currentSkew.current += (targetSkew - currentSkew.current) * 0.1;

            // Snap to 0 if very small to stop micro-jitters
            if (Math.abs(currentSkew.current) < 0.01) currentSkew.current = 0;
            
            if (contentRef.current) {
                contentRef.current.style.transform = `skewY(${currentSkew.current.toFixed(3)}deg)`;
                // No transition in CSS because we handle physics in JS
                contentRef.current.style.transition = 'none';
            }
            
            rafId = requestAnimationFrame(update);
        }
        update();
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <div ref={contentRef} className="will-change-transform relative z-10">
            {children}
        </div>
    )
}

// --- Parallax & 3D Components ---

const ParallaxElement: React.FC<{ speed?: number, rotation?: number, children: React.ReactNode, className?: string }> = ({ speed = 0.5, rotation = 0, children, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      // Only animate if roughly in view (performance)
      if (rect.top < viewHeight + 100 && rect.bottom > -100) {
          // Calculate relative to viewport center for stability
          const viewportCenter = viewHeight / 2;
          const elementCenter = rect.top + rect.height / 2;
          const distanceFromCenter = elementCenter - viewportCenter;
          
          const translateY = distanceFromCenter * speed * -1; 
          
          // Rotation based on position relative to center
          const rotateX = (distanceFromCenter / viewHeight) * rotation;
          
          ref.current.style.transform = `translate3d(0, ${translateY}px, 0) rotateX(${rotateX}deg)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, rotation]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`} style={{ perspective: '1000px' }}>
      {children}
    </div>
  );
};

const MouseTilt: React.FC<{ children: React.ReactNode, className?: string, intensity?: number }> = ({ children, className = "", intensity = 15 }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Invert rotation for "looking at" effect
        const rotateX = ((y - centerY) / centerY) * -intensity;
        const rotateY = ((x - centerX) / centerX) * intensity;

        ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
        if (!ref.current) return;
        ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    return (
        <div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
        </div>
    );
};

// --- Feature: Sticky Stack Showcase (Business Use Cases) ---

const StickyShowcase = () => {
    const useCases = [
        {
            title: "ONLINE SELLERS",
            desc: "Auto-reply sa 'Hm sis?' at 'Avail pa?'. Close deals while you sleep.",
            image: GALLERY_IMAGES[0].url,
            tags: ["Auto-Invoicing", "Inventory Check", "24/7 Sales"]
        },
        {
            title: "SERVICE BOOKING",
            desc: "Handle appointments for clinics, salons, and consultants instantly.",
            image: GALLERY_IMAGES[2].url,
            tags: ["Scheduling", "Reminders", "FAQ Support"]
        },
        {
            title: "CORPORATE BPO",
            desc: "Reduce support costs by 80%. Handle thousands of inquiries concurrently.",
            image: GALLERY_IMAGES[3].url,
            tags: ["Enterprise Grade", "Data Analytics", "Multi-Agent"]
        }
    ];

    // Reduced height from 250vh to 180vh to minimize gap to next section
    return (
        <div className="min-h-[180vh] relative" id="showcase">
             <div className="sticky top-0 h-screen flex flex-col md:flex-row overflow-hidden">
                 <div className="w-full md:w-1/2 flex items-center justify-center p-10 z-20 pointer-events-none">
                     <div className="text-left">
                         <div className="inline-block bg-primary text-black font-bold px-3 py-1 rounded-full mb-4 text-xs tracking-widest">REAL WORLD IMPACT</div>
                         <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6 mix-blend-difference">
                             POWER IN <br/> ACTION
                         </h2>
                         <p className="text-xl text-gray-400 max-w-md">
                             ORIN AI adapts to your specific business model. 
                             From E-commerce to Enterprise, we automate the grind.
                         </p>
                     </div>
                 </div>
                 
                 <div className="w-full md:w-1/2 relative h-full flex items-center justify-center perspective-1000">
                     {useCases.map((useCase, i) => (
                         // Increased speed slightly since scroll distance is shorter
                         <ParallaxElement key={i} speed={(i + 1) * 0.2} rotation={2}>
                             <div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[450px] md:w-[450px] md:h-[600px] glass-card rounded-3xl p-2 transition-all duration-500 hover:scale-105 hover:z-50"
                                style={{ 
                                    transform: `translate(-50%, -50%) rotate(${(i - 1) * 8}deg)`,
                                    zIndex: 10 - i 
                                }}
                             >
                                 <div className="w-full h-full rounded-2xl overflow-hidden relative group">
                                     <img src={useCase.image} alt={useCase.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
                                     
                                     <div className="absolute bottom-0 left-0 p-8 w-full">
                                         <h4 className="text-white font-black text-4xl uppercase mb-2 leading-none tracking-tighter">{useCase.title}</h4>
                                         <p className="text-gray-300 text-sm mb-4 border-l-2 border-primary pl-3">{useCase.desc}</p>
                                         <div className="flex flex-wrap gap-2">
                                            {useCase.tags.map((tag, ti) => (
                                                <span key={ti} className="text-[10px] font-mono uppercase border border-white/20 px-2 py-1 rounded text-gray-400">{tag}</span>
                                            ))}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </ParallaxElement>
                     ))}
                 </div>
             </div>
        </div>
    )
}

// --- Chat Ticker (Bottom Left, Floating Bubble Style) ---

const FloatingTicker = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    
    const MESSAGES = [
        { q: "Magkano to?", a: "One-time: ₱10,000 lang boss!" },
        { q: "Open 24/7?", a: "Yes po! Walang tulugan." },
        { q: "May discount?", a: "₱224k savings mo here!" },
        { q: "How to start?", a: "Click hire button lang!" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setMsgIndex(prev => (prev + 1) % MESSAGES.length);
                setVisible(true);
            }, 500);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-8 left-8 z-40 hidden md:flex flex-col gap-3 perspective-1000">
            <div className={`transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="glass-card p-4 rounded-2xl rounded-bl-sm flex items-center gap-3 max-w-[280px] border-l-4 border-primary shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/20 flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-xs text-white">Cust</div>
                    </div>
                    <div>
                         <p className="text-gray-400 text-xs mb-0.5">Customer Inquiry</p>
                         <p className="text-white font-bold text-sm leading-tight">"{MESSAGES[msgIndex].q}"</p>
                    </div>
                </div>
            </div>

             <div className={`transition-all duration-500 delay-200 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="glass-card p-4 rounded-2xl rounded-tl-sm flex items-center gap-3 max-w-[280px] border-l-4 border-secondary shadow-[0_10px_30px_rgba(0,0,0,0.5)] ml-8">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-primary flex-shrink-0">
                         <img src="https://i.imgur.com/7JAu9YG.png" alt="Orin" className="w-full h-full object-cover" />
                    </div>
                    <div>
                         <p className="text-primary text-xs mb-0.5 flex items-center gap-1">ORIN AI <Zap size={10} fill="currentColor" /></p>
                         <p className="text-white font-bold text-sm leading-tight">{MESSAGES[msgIndex].a}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main App ---

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Uy boss! Ako si ORIN AI. Ready ako sumagot sa mga customer mo! ₱10,000 lang ako forever.', timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    const history = chatMessages.map(m => `${m.role}: ${m.text}`);
    const responseText = await generateResponse(userMsg.text, history);
    
    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setChatMessages(prev => [...prev, modelMsg]);
    setIsThinking(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = easterEggCount + 1;
    setEasterEggCount(newCount);
    if (newCount === 5) {
      setShowGame(true);
      setEasterEggCount(0);
    }
  };

  return (
    <div className="min-h-screen text-textMain font-sans overflow-x-hidden selection:bg-primary selection:text-black">
      <ParticleBackground />
      
      {/* Game Modal */}
      {showGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <PacManGame onClose={() => setShowGame(false)} />
        </div>
      )}

      <FloatingTicker />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 glass border-b border-white/5' : 'py-8 bg-transparent'}`}>
        <div className="container mx-auto px-6 relative flex justify-between items-center">
          
          <div className="hidden md:flex items-center gap-8">
             <a href="#features" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors hover:scale-110 transform">Features</a>
             <a href="#stats" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors hover:scale-110 transform">Stats</a>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
            <a href="#" onClick={handleLogoClick} className="group relative flex items-center gap-2">
                <img 
                    src="https://i.imgur.com/7JAu9YG.png" 
                    alt="ORIN AI Logo" 
                    className="h-12 w-auto relative z-10 hover:rotate-[360deg] transition-transform duration-700 ease-in-out" 
                />
                <span className="font-black text-3xl tracking-tighter hidden md:block text-white mix-blend-difference">ORIN AI</span>
            </a>
          </div>

          <div className="hidden md:flex items-center justify-end gap-6">
            <a href="#pricing" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors hover:scale-110 transform">Pricing</a>
            <button onClick={() => setChatOpen(true)} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Hire Now
            </button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white z-50 ml-auto">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8">
            {['Features', 'Stats', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-6xl font-black text-white hover:text-primary hover:translate-x-4 transition-all tracking-tighter">{item}</a>
            ))}
        </div>
      )}

      {/* Wraps content in Velocity Scroll Distortion */}
      <VelocityScrollProvider>
        
        {/* Hero Section - Massive & Bold */}
        <section className="relative pt-48 pb-32 min-h-screen flex flex-col justify-center items-center z-10">
            <div className="container mx-auto px-6 text-center relative z-10">
                
                <ParallaxElement speed={-0.5} rotation={0.1}>
                    <h1 className="text-[5rem] md:text-[12rem] font-black tracking-tighter text-white leading-[0.8] mb-12 select-none mix-blend-difference">
                        AI <span className="text-stroke">EMPLOYEE</span> <br/>
                        <span className="text-primary animate-glitch inline-block">REVOLUTION</span>
                    </h1>
                </ParallaxElement>

                <ParallaxElement speed={-0.2}>
                    <div className="glass-card inline-flex items-center gap-4 px-8 py-4 rounded-full mb-12 border border-white/20">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                         </span>
                         <span className="font-mono text-sm md:text-base text-gray-300">SYSTEM ONLINE: <span className="text-white font-bold">READY TO SERVE</span></span>
                    </div>
                </ParallaxElement>

                <div className="flex justify-center gap-6 perspective-1000">
                    <MouseTilt intensity={30}>
                        <a href="#pricing" className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-black text-black bg-white rounded-full overflow-hidden transition-transform hover:scale-105">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary via-white to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative flex items-center gap-2 uppercase tracking-widest">Start Now <ArrowRight size={20} strokeWidth={3} /></span>
                        </a>
                    </MouseTilt>
                </div>
            </div>
            
            <div className="absolute bottom-10 w-full text-center">
                 <p className="text-xs font-mono text-gray-600 tracking-[0.5em] animate-pulse">SCROLL FOR PROOF</p>
            </div>
        </section>

        {/* Sticky Showcase Section (Replaced generic gallery with Use Cases) */}
        <StickyShowcase />

        {/* Marquee Divider */}
        <div className="py-12 bg-primary text-black border-y-8 border-black overflow-hidden rotate-2 scale-105 z-20 relative shadow-[0_0_100px_rgba(56,248,168,0.3)] my-10">
            <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6">
                        <span className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic">NO MORE EXCUSES</span>
                        <Sparkles size={60} className="text-black animate-spin-slow" />
                        <span className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white text-stroke">AUTOMATE NOW</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="py-32 container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-container">
                <div className="md:col-span-2">
                     <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-none">
                        TOTAL <br/> <span className="text-primary">UPGRADE.</span>
                    </h2>
                </div>
                {FEATURES.map((feature, idx) => {
                    const Icon = (LucideIcons as any)[feature.icon.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase()).replace(/^[a-z]/, (g: string) => g.toUpperCase())] || Zap;
                    return (
                        <MouseTilt key={idx} intensity={20} className="h-full">
                            <div className="glass-card rounded-3xl p-10 h-full flex flex-col justify-between group border border-white/10 hover:bg-white/5 transition-colors">
                                <Icon size={48} className="text-primary mb-6 group-hover:scale-125 transition-transform duration-300" />
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-2 uppercase">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        </MouseTilt>
                    );
                })}
            </div>
        </section>

        {/* Stats Section with Charts */}
        <section id="stats" className="py-32 relative z-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-20">
                    <div className="w-full md:w-1/3 sticky top-32 h-fit">
                        <ParallaxElement speed={0.1}>
                            <h2 className="text-7xl md:text-8xl font-black tracking-tighter mb-8">
                                DATA <br/><span className="text-stroke text-transparent">DRIVEN</span>
                            </h2>
                            <p className="text-xl text-gray-400 mb-8">
                                The numbers speak for themselves. Unprecedented ROI and customer satisfaction rates.
                            </p>
                            <div className="bg-surfaceHighlight rounded-2xl p-6 border-l-4 border-primary">
                                <p className="text-4xl font-black text-white mb-1">98%</p>
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Response Rate</p>
                            </div>
                        </ParallaxElement>
                    </div>
                    
                    <div className="w-full md:w-2/3 flex flex-col gap-12 perspective-1000">
                        <MouseTilt intensity={10}>
                            <div className="glass-card p-8 md:p-12 rounded-[3rem] border border-white/10 bg-black/40">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="font-black text-3xl text-white uppercase">Market Velocity</h3>
                                    <ExternalLink className="text-gray-500" />
                                </div>
                                <MarketGrowthChart />
                            </div>
                        </MouseTilt>
                        <MouseTilt intensity={10}>
                            <div className="glass-card p-8 md:p-12 rounded-[3rem] border border-white/10 bg-black/40">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="font-black text-3xl text-white uppercase">Efficiency ROI</h3>
                                    <Eye className="text-gray-500" />
                                </div>
                                <RoiChart />
                            </div>
                        </MouseTilt>
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing Section - Holographic */}
        <section id="pricing" className="py-40 relative z-10 overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

             <div className="container mx-auto px-6 relative z-10 text-center">
                 <ParallaxElement speed={-0.1}>
                     <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-12">
                        THE <span className="text-primary text-shadow-neon">MVP</span>
                     </h2>
                 </ParallaxElement>

                 <div className="max-w-xl mx-auto perspective-1000">
                    <MouseTilt intensity={25}>
                        <div className="glass-card rounded-[3rem] p-12 border border-white/20 bg-black/60 backdrop-blur-xl shadow-[0_0_60px_rgba(56,248,168,0.15)] relative overflow-hidden group">
                            {/* Shine Effect */}
                            <div className="absolute top-0 -left-[100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 group-hover:animate-[shine_1s_ease-in-out]"></div>

                            <div className="inline-block bg-primary text-black font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest mb-8">
                                Limited Offer
                            </div>

                            <div className="flex items-baseline justify-center text-white mb-4">
                                <span className="text-4xl font-bold text-gray-500 mr-2">₱</span>
                                <span className="text-9xl font-black tracking-tighter">10,000</span>
                            </div>
                            <p className="text-gray-400 font-medium mb-10 uppercase tracking-widest text-sm">Lifetime Access // One Time Payment</p>

                            <div className="space-y-4 mb-12 text-left max-w-xs mx-auto">
                                {['Full Access', 'No Monthly Fees', 'Priority Support', 'Instant Setup'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle2 size={20} className="text-primary" />
                                        <span className="font-bold">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setChatOpen(true)} className="w-full bg-white text-black py-6 rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-primary hover:scale-105 transition-all shadow-2xl">
                                Secure Slot
                            </button>
                            
                            <div className="mt-6 text-red-400 font-bold font-mono text-xs animate-pulse">
                                Only 9 Slots Remaining
                            </div>
                        </div>
                    </MouseTilt>
                 </div>
             </div>
        </section>

        {/* Team Section */}
        <section className="py-32 container mx-auto px-6 relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                 <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white">The <br/> <span className="text-stroke text-transparent">Architects</span></h2>
                 <p className="text-right text-gray-500 font-mono text-sm mt-8 md:mt-0">
                     MANILA <br/> 
                     OASIS HQ <br/>
                     EST. 2025
                 </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {TEAM.map((member, i) => (
                     <MouseTilt key={i} intensity={15}>
                         {/* Use a div container to handle the click differently for Marvin vs others if needed, 
                             but since Marvin has a specific button requirement, we'll render normally and conditionally add the button. */}
                         <div className="block group h-full">
                             <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-gray-900 relative mb-6">
                                 <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                                 <div className="absolute bottom-0 left-0 p-6">
                                     <h4 className="text-2xl font-black text-white uppercase leading-none mb-2">{member.name}</h4>
                                     <p className="text-xs font-mono text-primary uppercase">{member.role}</p>
                                     
                                     {/* Special Button for Marvin */}
                                     {member.name.includes('Marvin') && (
                                         <a href={member.link} target="_blank" rel="noreferrer" className="mt-4 inline-block bg-white text-black text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-primary transition-colors">
                                             Hire Marvin
                                         </a>
                                     )}
                                 </div>
                             </div>
                         </div>
                     </MouseTilt>
                 ))}
             </div>
        </section>

      </VelocityScrollProvider>

      {/* Footer */}
      <footer className="py-12 bg-[#050505] relative z-20">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="font-black text-3xl tracking-tighter text-white">ORIN AI</div>
              <div className="flex gap-6">
                   <LucideIcons.Facebook className="text-gray-500 hover:text-primary cursor-pointer transition-colors" />
                   <LucideIcons.Instagram className="text-gray-500 hover:text-primary cursor-pointer transition-colors" />
                   <LucideIcons.Twitter className="text-gray-500 hover:text-primary cursor-pointer transition-colors" />
              </div>
              <p className="text-gray-600 font-mono text-xs">&copy; 2025 ORIN AI. ALL RIGHTS RESERVED.</p>
          </div>
      </footer>

      {/* Chat Widget */}
      <div className={`fixed bottom-0 right-0 md:right-8 z-50 w-full md:w-[380px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${chatOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}>
          <div className="bg-[#121212] border border-white/10 rounded-t-2xl shadow-2xl flex flex-col h-[80vh] md:h-[600px] md:rounded-2xl md:mb-6 overflow-hidden">
              {/* Header */}
              <div className="bg-surfaceHighlight p-4 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-3">
                      <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                              <img src="https://i.imgur.com/7JAu9YG.png" alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-[#121212]"></div>
                      </div>
                      <div>
                          <div className="font-bold text-white text-sm">ORIN AI</div>
                          <div className="text-xs text-textMuted">Replies instantly</div>
                      </div>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-white" /></button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0A0A]">
                  {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[80%] px-4 py-3 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-primary text-black font-bold chat-bubble-user' : 'bg-surfaceHighlight text-white chat-bubble-bot'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isThinking && (
                      <div className="flex justify-start">
                          <div className="bg-surfaceHighlight px-4 py-3 rounded-2xl chat-bubble-bot">
                              <div className="flex gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></div>
                                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-200"></div>
                              </div>
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleChatSubmit} className="p-4 bg-[#121212] border-t border-white/10 flex gap-2">
                  <input 
                      type="text" 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask ORIN AI anything..."
                      className="flex-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors font-sans text-sm rounded-xl"
                  />
                  <button type="submit" className="bg-primary text-black p-3 rounded-xl hover:bg-primaryDark transition-colors">
                      <Send size={20} />
                  </button>
              </form>
          </div>
      </div>

      {/* Floating Chat Button (Bottom Right) */}
      {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="fixed bottom-8 right-8 z-40 bg-primary text-black p-5 rounded-full shadow-[0_0_40px_rgba(56,248,168,0.4)] hover:scale-110 transition-transform duration-300 group border-4 border-black"
          >
              <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
          </button>
      )}

    </div>
  );
};

export default App;