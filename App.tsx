import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle2, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2, Headset, Cpu, Triangle } from 'lucide-react';
import { MarketGrowthChart, ROIChart } from './components/Charts';
import PacManGame from './components/PacManGame';
import { ContentProtection } from './components/ContentProtection';
import { TEAM, FEATURES, GALLERY_IMAGES } from './constants';
import { GoogleGenAI } from "@google/genai";
import { systemInstruction, generateFallbackResponse } from './services/geminiService';

// --- UTILS ---
function useInView(options = { threshold: 0.3 }) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return [ref, isInView] as const;
}

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// --- VISUAL COMPONENTS ---

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;
        let particles: any[] = [];
        let animationFrameId: number;
        
        const initParticles = () => {
            particles = [];
            const count = isMobile ? 15 : 40;
            for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 2 + 0.5 });
        };

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
            gradient.addColorStop(0, '#050505'); gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'screen'; ctx.beginPath(); ctx.strokeStyle = 'rgba(56, 248, 168, 0.15)'; ctx.lineWidth = 0.5;
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    if (Math.abs(dx) < 120 && Math.abs(dy) < 120) {
                        if (dx*dx + dy*dy < 14400) { ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); }
                    }
                }
            }
            ctx.stroke(); 
            ctx.fillStyle = '#38F8A8';
            ctx.beginPath();
            for (const p of particles) {
                ctx.moveTo(p.x + p.size, p.y);
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); 
            }
            ctx.fill();
            animationFrameId = requestAnimationFrame(draw);
        };
        window.addEventListener('resize', resize); resize(); draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// --- TESSERACT CIRCUIT COMPONENT ---
const TesseractCircuit = ({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<{x: number, y: number, z: number, vx: number, vy: number}[]>([]);
    
    useEffect(() => {
        if (pointsRef.current.length === 0) {
            // OPTIMIZATION: Low point count for performance
            const pointCount = isMobile ? 20 : 40; 
            const spreadX = isMobile ? 200 : 500;
            const spreadY = isMobile ? 300 : 400;
            for(let i=0; i<pointCount; i++) {
                pointsRef.current.push({
                    x: Math.random() * (spreadX * 2) - spreadX,
                    y: Math.random() * (spreadY * 1.5) - (spreadY * 0.75),
                    z: Math.random() * 400 - 200,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15
                });
            }
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const draw = () => {
            if (!canvas) return;
            if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
                 animationId = requestAnimationFrame(draw);
                 return;
            }

            if(canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.lineWidth = 0.3; 
            // Deep Ancient Gold
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)'; 

            const projected = [];
            for(const p of pointsRef.current) {
                p.x += p.vx; p.y += p.vy;
                const limit = isMobile ? 200 : 500;
                if(Math.abs(p.x) > limit) p.vx *= -1;
                if(Math.abs(p.y) > limit * 0.75) p.vy *= -1;

                const scale = 500 / (500 + p.z); 
                projected.push({ 
                    x: p.x * scale + cx, 
                    y: p.y * scale + cy, 
                    scale 
                });
            }

            ctx.beginPath();
            for(let i=0; i<projected.length; i++) {
                for(let j=i+1; j<projected.length; j++) {
                    const dx = projected[i].x - projected[j].x;
                    const dy = projected[i].y - projected[j].y;
                    if(dx*dx + dy*dy < (isMobile ? 5000 : 15000)) { 
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                    }
                }
            }
            ctx.stroke();

            for(const p of projected) {
                ctx.beginPath();
                // Subtler Gold Nodes
                ctx.fillStyle = `rgba(212, 175, 55, ${p.scale * 0.6})`; 
                ctx.arc(p.x, p.y, 1.5 * p.scale, 0, Math.PI * 2);
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isActive]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen" style={{ width: '100%', height: '100%' }} />;
};

const VelocityScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isMobile) return <div className="relative z-10">{children}</div>;
    const contentRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);
    const currentSkew = useRef(0);
    const requestRef = useRef(0);
    useEffect(() => {
        const update = () => {
            const velocity = window.scrollY - lastScrollY.current;
            lastScrollY.current = window.scrollY;
            const targetSkew = Math.max(Math.min(velocity * 0.1, 3), -3);
            currentSkew.current += (targetSkew - currentSkew.current) * 0.1;
            if (Math.abs(currentSkew.current) < 0.01) currentSkew.current = 0;
            if (contentRef.current) contentRef.current.style.transform = `translate3d(0,0,0) skewY(${currentSkew.current.toFixed(3)}deg)`;
            requestRef.current = requestAnimationFrame(update);
        }
        update();
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
    return <div ref={contentRef} className="will-change-transform relative z-10 origin-center backface-hidden">{children}</div>;
};

const ParallaxElement: React.FC<{ speed?: number; rotation?: number; children: React.ReactNode }> = ({ speed = 0.5, rotation = 0, children }) => {
    if (isMobile) return <div className="w-full">{children}</div>;
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let ticking = false;
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            if (rect.top < viewHeight + 100 && rect.bottom > -100) {
                const dist = (rect.top + rect.height / 2) - (viewHeight / 2);
                const rot = isMobile ? 0 : ((dist / viewHeight) * rotation).toFixed(2);
                ref.current.style.transform = `translate3d(0, ${(dist * speed * -1).toFixed(2)}px, 0) rotateX(${rot}deg)`;
            }
            ticking = false;
        };
        const onScroll = () => { if (!ticking) { window.requestAnimationFrame(update); ticking = true; } };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [speed, rotation]);
    return <div ref={ref} className="gpu-accel" style={{ perspective: '1000px' }}>{children}</div>;
};

const MouseTilt: React.FC<{ children: React.ReactNode; intensity?: number }> = ({ children, intensity = 15 }) => {
    if (isMobile) return <div className="h-full w-full">{children}</div>;
    const ref = useRef<HTMLDivElement>(null);
    const onMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const rx = ((y - rect.height/2) / (rect.height/2)) * -intensity;
        const ry = ((x - rect.width/2) / (rect.width/2)) * intensity;
        ref.current.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    };
    const onLeave = () => { if (ref.current) ref.current.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)`; };
    return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="transition-transform duration-300 ease-out will-change-transform h-full w-full" style={{ transformStyle: 'preserve-3d' }}>{children}</div>;
};

// --- SINGLE DYNAMIC SHOWCASE CARD ---
const DynamicShowcase = () => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // Start fade out
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
                setFade(true); // Start fade in
            }, 500); // Wait for fade out
        }, 4000); // Change every 4s
        return () => clearInterval(interval);
    }, []);

    const item = GALLERY_IMAGES[index];

    return (
        <MouseTilt intensity={8}>
            <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl group">
                
                {/* Dynamic Image Background */}
                <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
                    <img 
                        src={item.urls[0]} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                        alt={item.caption}
                        loading="lazy"
                    />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col items-start justify-end h-full">
                    <div className={`transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#38F8A8] bg-[#38F8A8]/10 text-[#38F8A8] text-xs font-black uppercase tracking-widest mb-4 font-grotesk">
                            <span className="w-2 h-2 rounded-full bg-[#38F8A8] animate-pulse"></span>
                            Active Deployment
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter font-grotesk leading-none">
                            {item.caption.toUpperCase()}
                        </h2>
                        <div className="max-w-xl border-l-4 border-[#38F8A8] pl-6">
                            <p className="text-xl md:text-2xl text-gray-200 font-medium font-grotesk leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="absolute bottom-8 right-8 flex gap-2">
                        {GALLERY_IMAGES.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-[#38F8A8]' : 'w-2 bg-white/20'}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </MouseTilt>
    );
};

const FloatingTicker = ({ chatOpen }: { chatOpen: boolean }) => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const messages = [
        { role: "Online Seller", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", q: "Hm sis? Pwede auto-reply?", a: "Matic yan! One-time payment lang." },
        { role: "Dropshipper", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", q: "Can you manage orders?", a: "Yes! Connected to Shopify & TikTok." },
        { role: "LGU Officer", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", q: "Pwede sa constituents?", a: "Oo naman! 24/7 public service." },
        { role: "Hospital Staff", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow", q: "Can it triage patients?", a: "Yes, initial assessment ok!" }
    ];
    useEffect(() => {
        const i = setInterval(() => {
            setVisible(false);
            setTimeout(() => { setIdx(p => (p + 1) % messages.length); setVisible(true); }, 500);
        }, 4000);
        return () => clearInterval(i);
    }, []);

    if (chatOpen) return null;

    return (
        <div className={`fixed z-[60] flex flex-col gap-3 items-end pointer-events-none md:pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] bottom-32 right-4 md:right-8 origin-bottom-right scale-75 md:scale-100`}>
            <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="glass-card p-3 rounded-2xl rounded-br-sm flex items-center gap-3 border-r-4 border-[#38F8A8] max-w-[280px] flex-row-reverse text-right bg-black/80 backdrop-blur-md">
                    <img src={messages[idx].img} className="w-10 h-10 rounded-full bg-white/10 p-1" alt="avatar" />
                    <div><p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{messages[idx].role}</p><p className="text-sm font-bold text-white">"{messages[idx].q}"</p></div>
                </div>
            </div>
            <div className={`transition-all duration-500 delay-100 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="glass-card p-3 rounded-2xl rounded-tr-sm flex items-center gap-3 border-r-4 border-[#A855F7] mr-8 max-w-[280px] flex-row-reverse text-right bg-black/80 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full border border-[#38F8A8] overflow-hidden relative bg-black">
                         <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="orin" loading="lazy" />
                    </div>
                    <div><p className="text-[10px] text-[#38F8A8] font-bold">ORIN AI ⚡</p><p className="text-sm font-bold text-white">{messages[idx].a}</p></div>
                </div>
            </div>
        </div>
    );
};

// --- MOBILE HERO (Static, Instant, Compact) ---
const MobileHero = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    return (
        <div className="pt-24 pb-8 px-4 flex flex-col items-center justify-center text-center">
             <div className="mb-6 relative w-40 h-40">
                 <div className="absolute inset-[-10px] rounded-full border border-[#38F8A8]/30 animate-spin-slow"></div>
                 <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#38F8A8] relative bg-black shadow-[0_0_40px_rgba(56,248,168,0.4)]">
                    <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin Avatar" />
                 </div>
                 <div className="absolute bottom-0 right-0 bg-black border border-[#38F8A8] px-2 py-0.5 rounded-full text-[10px] text-[#38F8A8] font-bold">V9 ONLINE</div>
             </div>

             <h1 className="text-5xl font-black tracking-tighter font-grotesk text-white mb-2 leading-none">
                MEET <span className="text-[#38F8A8]">ORIN</span>
             </h1>
             <p className="text-sm text-gray-400 font-mono mb-6 max-w-xs">
                Your 24/7 AI Employee. <br/>Reads. Listens. Sells.
             </p>
             
             <button onClick={() => setChatOpen(true)} className="group relative px-8 py-3 bg-[#38F8A8] text-black font-black text-lg flex items-center gap-2 font-grotesk rounded-full shadow-[0_0_20px_rgba(56,248,168,0.4)]">
                 HIRE ORIN <MessageCircle className="w-5 h-5" />
             </button>
        </div>
    );
};

// --- DESKTOP HERO REVEAL (Sticky & Dramatic) ---
const HeroReveal = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollRange = 800; 
    const progress = Math.min(scrollY / scrollRange, 1);
    
    // Phase 1: Text Fade Out (Start immediately)
    const fadeOut = Math.max(1 - (progress * 3.33), 0); 
    
    // Phase 2: Face Fade In (Start early)
    const fadeIn = Math.min(Math.max((progress - 0.1) * 2, 0), 1);
    const scale = 0.8 + (fadeIn * 0.2); 

    return (
        <header className="relative h-[250vh]"> 
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
                
                {/* BACKGROUND ELEMENTS */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#38F8A8]/10 via-black to-black opacity-60"></div>

                {/* SCENE 1: THE PROMISE (TEXT) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 will-change-transform" 
                     style={{ opacity: fadeOut, transform: `scale(${1 + progress * 0.5}) blur(${progress * 20}px)`, pointerEvents: fadeOut <= 0.1 ? 'none' : 'auto', zIndex: 10 }}>
                     
                     <div className="mb-6 flex items-center gap-2 border border-[#38F8A8]/30 bg-[#38F8A8]/10 px-4 py-1 rounded-full animate-pulse">
                         <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38F8A8] opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38F8A8]"></span>
                         </span>
                         <span className="text-[#38F8A8] text-xs font-bold tracking-widest uppercase font-mono">System Online</span>
                     </div>
                     
                     <h1 className="text-[8vw] leading-[0.85] font-black text-center tracking-tighter mix-blend-screen animate-glitch font-grotesk">
                         YOUR NEW<br/>
                         <span className="text-stroke">EMPLOYEE</span><br/>
                         IS HERE.
                     </h1>
                     <p className="mt-8 text-sm text-gray-500 font-mono animate-bounce">SCROLL TO INITIALIZE ↓</p>
                </div>

                {/* SCENE 2: THE REVEAL (ORIN AVATAR) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center will-change-transform" 
                     style={{ opacity: fadeIn, transform: `scale(${scale})`, pointerEvents: fadeIn < 0.5 ? 'none' : 'auto', zIndex: 20 }}>
                     
                     <div className="relative w-96 h-96 mb-8">
                         {/* Spinning Rings */}
                         <div className="absolute inset-[-40px] rounded-full border border-[#38F8A8]/20 animate-spin-slow"></div>
                         <div className="absolute inset-[-20px] rounded-full border-2 border-[#D4AF37]/40 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>
                         
                         {/* Avatar Container */}
                         <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#38F8A8] relative bg-black shadow-[0_0_100px_rgba(56,248,168,0.4)]">
                            <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin Avatar" />
                         </div>
                     </div>

                     <h2 className="text-9xl font-black text-center tracking-tighter font-grotesk text-white drop-shadow-[0_0_30px_rgba(56,248,168,0.5)] animate-glitch">
                        ORIN AI
                     </h2>
                     <p className="mt-4 text-xl font-bold text-[#38F8A8] tracking-[0.3em] uppercase drop-shadow-md">
                        24/7. NEVER TIRED. ALWAYS SELLING.
                     </p>
                     
                     <button onClick={() => setChatOpen(true)} className="mt-12 group relative px-10 py-5 bg-[#38F8A8] text-black font-black text-xl hover:scale-110 transition-transform flex items-center gap-3 font-grotesk rounded-full shadow-[0_0_40px_rgba(56,248,168,0.6)]">
                         HIRE ORIN <MessageCircle className="w-6 h-6" />
                     </button>
                </div>
            </div>
        </header>
    );
};

// --- PRICING CARD (AMEX BLACK / ANCIENT ALIEN / MATTE) ---
const PricingCard = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
    
    return (
        <div ref={ref} className={`max-w-4xl mx-auto p-12 rounded-[1.5rem] text-center relative overflow-hidden group transition-all duration-1000 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} shadow-[0_20px_60px_rgba(0,0,0,0.8)]`}>
             
             {/* MATTE BLACK OBSIDIAN BACKGROUND */}
             <div className="absolute inset-0 bg-[#050505] z-0"></div>
             {/* Subtle Texture */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay z-0"></div>
             {/* Frosted Glass Effect */}
             <div className="absolute inset-0 backdrop-blur-3xl bg-white/5 z-0"></div>
             
             {/* SCATTERED TESSERACT (Deep Gold Nodes) */}
             <TesseractCircuit isActive={true} />

             {/* GOLD BORDER - REFINED */}
             <div className="absolute inset-0 rounded-[1.5rem] border border-[#D4AF37]/40 pointer-events-none z-10 shadow-[inset_0_0_30px_rgba(212,175,55,0.1)]"></div>
             
             {/* CONTENT - BRUTALIST TYPOGRAPHY */}
             <div className="relative z-20">
                 <div className="inline-flex items-center gap-3 bg-black text-[#D4AF37] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] mb-12 font-grotesk shadow-md border border-[#D4AF37]/50">
                     <Cpu className="w-3 h-3" /> Founder's Chip — Tesseract
                 </div>
                 
                 {/* MASSIVE PRICE - EMBOSSED MAGAZINE STYLE */}
                 <h2 className="text-[12vw] md:text-[8rem] font-black leading-[0.8] tracking-tighter font-grotesk text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5),-1px_-1px_0_rgba(255,255,255,0.2)]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.2)' }}>
                    ₱15,000
                 </h2>
                 
                 <p className="text-xl md:text-2xl font-bold text-gray-400 mt-4 font-grotesk tracking-wide uppercase">Monthly Subscription</p>
                 
                 <div className="my-10 h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
                 
                 {/* Features - Floating Dark Glass */}
                 <div className="bg-black/80 backdrop-blur-xl p-8 border border-white/10 inline-block text-left max-w-2xl mx-auto mb-10 shadow-2xl relative rounded-xl">
                     <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4 font-grotesk text-sm md:text-lg">
                         <li className="flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                             <span className="text-gray-200 font-bold">Lifetime 24/7 Tech Support</span>
                         </li>
                         <li className="flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                             <span className="text-gray-200 font-bold">Full FB/IG/TikTok Integration</span>
                         </li>
                         <li className="flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                             <span className="text-gray-200 font-bold">Voice Note & OCR Vision</span>
                         </li>
                         <li className="flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                             <span className="text-gray-200 font-bold">Custom Business Training</span>
                         </li>
                     </ul>
                 </div>
                 <div className="block"></div>
                 
                 <button onClick={() => setChatOpen(true)} className="w-full max-w-lg py-6 bg-[#D4AF37] text-black font-black text-2xl hover:scale-[1.01] transition-transform font-grotesk shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 mx-auto border border-white/20 uppercase tracking-tight rounded-xl">
                     HIRE ORIN <MessageCircle className="w-6 h-6" />
                 </button>
                 
                 <p className="mt-6 text-[10px] text-gray-500 font-mono tracking-widest uppercase font-bold">Serial No. 001-016 • Exclusive Batch</p>
             </div>
        </div>
    );
};

// --- ORIN'S AWAKENING INTRO (AI BOOT SEQUENCE) ---
const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);
    const [log, setLog] = useState<string[]>([]);

    useEffect(() => {
        // Phase 1: Boot Logs (0-4s)
        const bootLogs = [
            "INITIALIZING KERNEL...",
            "LOADING NEURAL PATHWAYS...",
            "CONNECTING TO GLOBAL NET...",
            "OPTIMIZING SALES PROTOCOLS...",
            "SYNCING LANGUAGE MODULES...",
            "SYSTEM READY."
        ];

        let delay = 0;
        bootLogs.forEach((text, i) => {
            delay += 400;
            setTimeout(() => setLog(prev => [...prev, text]), delay);
        });

        const sequence = [
            { t: 3000, s: 1 }, // ANALYSIS
            { t: 6000, s: 2 }, // AWAKENING
            { t: 9000, s: 3 }  // DONE
        ];

        let timeouts: ReturnType<typeof setTimeout>[] = [];
        sequence.forEach(({t, s}) => {
            timeouts.push(setTimeout(() => setStep(s), t));
        });
        
        timeouts.push(setTimeout(onComplete, 10000));

        return () => timeouts.forEach(clearTimeout);
    }, [onComplete]);

    if (step >= 3) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
            {/* Phase 1: Terminal Boot */}
            <div className={`absolute inset-0 p-8 flex flex-col justify-end pb-32 transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-0'}`}>
                {log.map((l, i) => (
                    <div key={i} className="text-[#38F8A8] text-xs md:text-sm mb-1">
                        <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> {l}
                    </div>
                ))}
                <div className="w-4 h-6 bg-[#38F8A8] animate-pulse mt-2"></div>
            </div>

            {/* Phase 2: Analysis */}
            <div className={`absolute transition-all duration-1000 ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-t-4 border-[#38F8A8] animate-spin mb-8"></div>
                    <h1 className="text-4xl md:text-6xl font-black font-grotesk tracking-tighter text-white">ANALYZING EFFICIENCY...</h1>
                    <p className="text-[#38F8A8] mt-4 font-mono">HUMAN LIMITS DETECTED.</p>
                </div>
            </div>

            {/* Phase 3: Awakening */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${step === 2 ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="relative w-64 h-64 md:w-96 md:h-96 mb-8 animate-float">
                     <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#D4AF37] relative bg-black shadow-[0_0_150px_#38F8A8]">
                        <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin" />
                     </div>
                 </div>
                 {/* AGGRESSIVE CHROMATIC GLITCH INTRO */}
                 <div className="relative group">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter font-grotesk leading-none relative z-10 mix-blend-difference text-center px-4">
                       YOUR NEW EMPLOYEE IS HERE
                    </h1>
                    <h1 className="absolute top-0 left-0 text-6xl md:text-8xl font-black text-red-500 tracking-tighter font-grotesk leading-none opacity-50 animate-glitch text-center px-4 w-full" style={{ animationDelay: '0.1s', marginLeft: '-2px' }}>
                       YOUR NEW EMPLOYEE IS HERE
                    </h1>
                    <h1 className="absolute top-0 left-0 text-6xl md:text-8xl font-black text-cyan-500 tracking-tighter font-grotesk leading-none opacity-50 animate-glitch text-center px-4 w-full" style={{ animationDelay: '-0.1s', marginLeft: '2px' }}>
                       YOUR NEW EMPLOYEE IS HERE
                    </h1>
                 </div>
            </div>
        </div>
    );
};

export default function App() {
    const [chatOpen, setChatOpen] = useState(false);
    const [gameOpen, setGameOpen] = useState(false);
    const [easterCount, setEasterCount] = useState(0);
    const [introFinished, setIntroFinished] = useState(false);
    
    const [messages, setMessages] = useState([
        {role: 'model', text: 'Hello! Ako nga pala si Orin 👋. Advanced AI Employee na parang tao kausap. ₱15k Monthly lang for Premium Access. Sulit diba? 🚀'},
        {role: 'model', text: 'Para ma-setup natin business mo, paki-fill up lang nito boss:\n\n1. Name:\n2. Business Name:\n3. Contact #:\n4. Anong klaseng AI Employee need mo?'}
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [showFloat, setShowFloat] = useState(false);

    useEffect(() => {
        if(typeof process !== 'undefined' && process.env && process.env.API_KEY) {
             const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
             setAi(client);
        }

        const handleScroll = () => {
            // Show float after hero (lower threshold for mobile)
            setShowFloat(window.scrollY > 400); 
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const newC = easterCount + 1;
        setEasterCount(newC);
        if(newC === 5) { setGameOpen(true); setEasterCount(0); }
    };

    const sendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!input) return;
        const userMsg = {role: 'user', text: input};
        setMessages(p => [...p, userMsg]);
        setInput('');
        setIsThinking(true);

        if (ai) {
             try {
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: input,
                  config: { systemInstruction: systemInstruction }
                });
                setMessages(p => [...p, {role: 'model', text: response.text || "Sorry boss, medyo loading ako ngayon."}]);
             } catch(e) {
                 const fallbackText = await generateFallbackResponse(input);
                 setMessages(p => [...p, {role: 'model', text: fallbackText}]);
             }
        } else {
             const fallbackText = await generateFallbackResponse(input);
             setMessages(p => [...p, {role: 'model', text: fallbackText}]);
        }
        setIsThinking(false);
    };

    return (
        <ContentProtection>
            {!introFinished && <IntroOverlay onComplete={() => setIntroFinished(true)} />}
            
            <div className={`min-h-screen text-white overflow-x-hidden selection:bg-[#38F8A8] selection:text-black ${!introFinished ? 'h-screen overflow-hidden' : ''}`}>
                <ParticleBackground />
                
                {/* Optimized Blurred Nav */}
                <nav className="fixed top-0 w-full z-50 py-4 px-6 flex justify-between items-center bg-black/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
                        <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-black relative group">
                            <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110 transition-transform duration-500 group-hover:scale-125" alt="ORIN Logo" loading="lazy" />
                        </div>
                        <span className="font-black text-xl tracking-tighter font-grotesk">ORIN AI</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400 font-mono">
                        <a href="#features" className="hover:text-[#38F8A8] transition-colors">Features</a>
                        <a href="#demo" className="hover:text-[#38F8A8] transition-colors">Demo</a>
                        <a href="#pricing" className="hover:text-[#38F8A8] transition-colors">Pricing</a>
                    </div>
                    <button onClick={() => setChatOpen(true)} className="hidden md:flex bg-white/10 border border-white/10 px-6 py-2 rounded-full text-xs font-bold hover:bg-[#38F8A8] hover:text-black transition-all">
                        HIRE ORIN
                    </button>
                </nav>

                {/* Conditional Hero: Static Mobile vs Sticky Desktop */}
                {isMobile ? (
                    <MobileHero setChatOpen={setChatOpen} />
                ) : (
                    <HeroReveal setChatOpen={setChatOpen} />
                )}

                <VelocityScrollProvider>
                    {/* Marquee */}
                    <div className="py-4 md:py-6 bg-[#38F8A8] text-black overflow-hidden rotate-[-2deg] scale-110 border-y-4 border-black mb-8 md:mb-12 relative z-10">
                        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl md:text-4xl font-black italic tracking-tighter font-grotesk">
                            <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                             <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                        </div>
                    </div>

                    {/* Sales Psychology Section */}
                    <section className="py-8 md:py-16 px-4 max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <ParallaxElement speed={0.2} rotation={5}>
                                <MouseTilt>
                                    <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden gpu-accel">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 blur-[80px] rounded-full"></div>
                                        <h3 className="text-3xl md:text-4xl font-black mb-6 font-grotesk">STOP DOING IT<br/>MANUALLY.</h3>
                                        <ul className="space-y-6 text-lg md:text-xl text-gray-300 font-grotesk">
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-6 h-6 md:w-8 md:h-8" /> You reply at 2AM (Tired)</li>
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-6 h-6 md:w-8 md:h-8" /> Leads ignored = Sales lost</li>
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-6 h-6 md:w-8 md:h-8" /> Hiring humans = ₱20k/mo cost</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>

                            <ParallaxElement speed={0.4} rotation={-5}>
                                <MouseTilt>
                                    <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-[#38F8A8]/30 relative overflow-hidden gpu-accel mt-8 md:mt-0">
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#38F8A8]/20 blur-[80px] rounded-full"></div>
                                        <h3 className="text-3xl md:text-4xl font-black mb-6 text-[#38F8A8] font-grotesk">THE UPGRADE.</h3>
                                        <ul className="space-y-6 text-lg md:text-xl text-white font-grotesk">
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-6 h-6 md:w-8 md:h-8" /> Auto-Replies in 1 Second</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-6 h-6 md:w-8 md:h-8" /> Closes Sales While You Sleep</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-6 h-6 md:w-8 md:h-8" /> ₱15k Monthly (Premium)</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>
                        </div>
                    </section>

                    {/* PRICING (Relocated HERE for better flow) */}
                    <section id="pricing" className="py-8 md:py-16 px-4 relative z-20">
                        <PricingCard setChatOpen={setChatOpen} />
                    </section>

                    {/* Stats */}
                    <section className="py-8 px-4">
                        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                             <div className="glass-card p-6 md:p-8 rounded-3xl">
                                 <h4 className="text-xl md:text-2xl font-bold mb-6 font-grotesk">Market Domination</h4>
                                 <MarketGrowthChart />
                             </div>
                             <div className="glass-card p-6 md:p-8 rounded-3xl">
                                 <h4 className="text-xl md:text-2xl font-bold mb-6 font-grotesk">ROI Potential (vs Hiring)</h4>
                                 <ROIChart />
                             </div>
                        </div>
                    </section>

                    {/* Gallery Grid */}
                    <section id="features" className="pt-8 pb-0 px-4 max-w-7xl mx-auto">
                        <h2 className="text-4xl md:text-8xl font-black text-center mb-8 tracking-tighter font-grotesk">
                            BUILT FOR<br/><span className="text-[#38F8A8]">EVERYONE.</span>
                        </h2>
                        
                        {/* Dynamic Single-Block Showcase */}
                        <div className="w-full">
                            <DynamicShowcase />
                        </div>
                    </section>
                    
                    {/* Team Section (COMPACTED) */}
                    <section className="pt-4 pb-8 px-4"> 
                        <div className="max-w-xl mx-auto text-center mb-4">
                            <h2 className="text-xl md:text-2xl font-black mb-1 font-grotesk uppercase">Meet The Minds</h2>
                            <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest">Architects of Intelligence</p>
                        </div>
                        <div className="max-w-xl mx-auto grid grid-cols-4 gap-2">
                            {TEAM.map((member, i) => (
                                <div key={i} className="group relative text-center">
                                    <div className="aspect-square rounded-full overflow-hidden mb-1 border border-white/10 bg-gray-900 grayscale group-hover:grayscale-0 transition-all duration-500 w-12 h-12 mx-auto">
                                        <img src={member.image} className={`w-full h-full object-cover ${member.name === 'Marvin' ? 'object-left' : 'object-center'}`} alt={member.name} loading="lazy" />
                                    </div>
                                    <h4 className="font-bold text-xs font-grotesk">{member.name}</h4>
                                    <p className="text-[7px] text-[#38F8A8] uppercase font-mono mt-0.5 leading-tight truncate">{member.role}</p>
                                    {member.name === 'Marvin' && (
                                        <a href={member.link} target="_blank" rel="noreferrer" className="mt-1 block text-[7px] bg-white text-black py-0.5 px-1 rounded font-bold hover:bg-[#38F8A8] transition-colors font-mono">
                                            HIRE
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </VelocityScrollProvider>

                {/* BOTTOM MARQUEE */}
                <div className="py-4 md:py-6 bg-[#38F8A8] text-black overflow-hidden scale-105 border-y-4 border-black relative z-10">
                    <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl md:text-4xl font-black italic tracking-tighter font-grotesk">
                        <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                         <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                    </div>
                </div>

                <footer className="py-8 text-center text-gray-600 text-sm relative z-10 bg-black font-mono">
                    <p className="mb-2">© 2025 Organic Intelligence AI • OASIS Inc.</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    </div>
                </footer>

                {/* --- FLOATING UI ELEMENTS --- */}

                <FloatingTicker chatOpen={chatOpen} />

                <div className={`fixed bottom-8 right-4 md:right-8 z-50 transition-all duration-500 ${showFloat ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <button 
                        onClick={() => setChatOpen(true)}
                        className="bg-[#38F8A8] text-black font-black py-3 px-6 md:py-4 md:px-8 rounded-full shadow-[0_0_30px_rgba(56,248,168,0.4)] hover:scale-105 transition-transform flex items-center gap-2 font-grotesk text-sm md:text-base"
                    >
                        HIRE ORIN <MessageCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Widget - Small FB Style */}
                <div className={`fixed bottom-0 right-0 z-[70] transition-all duration-500 transform ${chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'} w-full md:w-[320px] md:bottom-0 md:right-8`}>
                    <div className="w-full h-[85dvh] md:h-[450px] glass-card rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden border border-[#38F8A8]/30 shadow-2xl bg-black">
                        {/* Header */}
                        <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#38F8A8]/10 cursor-pointer" onClick={() => setChatOpen(false)}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border border-[#38F8A8] overflow-hidden bg-black relative">
                                    <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin" loading="lazy" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#38F8A8] rounded-full border border-black animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm font-grotesk">ORIN AI</h3>
                                    <p className="text-[9px] text-[#38F8A8] uppercase tracking-wider font-mono">Active Now</p>
                                </div>
                            </div>
                            <X className="w-4 h-4 text-gray-400 hover:text-white" />
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                                        m.role === 'user' 
                                            ? 'bg-[#38F8A8] text-black chat-bubble-user font-bold font-grotesk' 
                                            : 'bg-white/10 text-gray-200 chat-bubble-bot border border-white/5 font-grotesk'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={sendChat} className="p-3 border-t border-white/10 bg-black/80 backdrop-blur-md">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type details..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-white focus:outline-none focus:border-[#38F8A8] transition-colors placeholder:text-gray-500 font-mono text-xs"
                                />
                                <button type="submit" className="absolute right-1.5 top-1.5 p-1.5 bg-[#38F8A8] rounded-full text-black hover:scale-105 transition-transform">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-1.5">
                                <p className="text-[8px] text-gray-600 flex items-center justify-center gap-1 font-mono">
                                    <ShieldCheck className="w-2.5 h-2.5" /> Secured by O.A.S.I.S
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {gameOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-xl">
                        <PacManGame onClose={() => setGameOpen(false)} />
                    </div>
                )}
            </div>
        </ContentProtection>
    );
}