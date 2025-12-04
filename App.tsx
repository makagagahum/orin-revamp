import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle2, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2, Headset, Cpu, Triangle, ChevronLeft, ChevronRight, Pause, Play, Crown } from 'lucide-react';
import { MarketGrowthChart, ROIChart } from './components/Charts';
import PacManGame from './components/PacManGame';
import { ContentProtection } from './components/ContentProtection';
import { TEAM, FEATURES, GALLERY_IMAGES } from './constants';
import { GoogleGenAI, Chat } from "@google/genai";
import { systemInstruction, generateFallbackResponse } from './services/geminiService';

// --- UTILS ---
function useInView(options = { threshold: 0.1 }) {
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

// Robust Mobile Hook
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
            const isMobile = window.innerWidth < 768;
            const count = isMobile ? 12 : 35;
            for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 2 + 0.5 });
        };

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
            gradient.addColorStop(0, '#050505'); gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'screen'; ctx.beginPath(); ctx.strokeStyle = 'rgba(56, 248, 168, 0.15)'; ctx.lineWidth = 0.5;
            
            const isMobile = window.innerWidth < 768;
            const connectDistance = isMobile ? 80 : 120;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    if (Math.abs(dx) < connectDistance && Math.abs(dy) < connectDistance) {
                        if (dx*dx + dy*dy < (connectDistance * connectDistance)) { ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); }
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
    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none will-change-transform" />;
};

// --- TESSERACT CIRCUIT COMPONENT ---
const TesseractCircuit = ({ isActive }: { isActive: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<{x: number, y: number, z: number, vx: number, vy: number}[]>([]);
    
    useEffect(() => {
        if (pointsRef.current.length === 0) {
            const isMobile = window.innerWidth < 768;
            const pointCount = isMobile ? 15 : 40; 
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
        if (!isActive) return;

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
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)'; 
            
            const isMobile = window.innerWidth < 768;
            const limit = isMobile ? 200 : 500;
            const distLimit = isMobile ? 3000 : 15000;

            const projected = [];
            for(const p of pointsRef.current) {
                p.x += p.vx; p.y += p.vy;
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
                    if(dx*dx + dy*dy < distLimit) { 
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                    }
                }
            }
            ctx.stroke();

            for(const p of projected) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 215, 0, ${p.scale * 0.8})`; 
                ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isActive]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen" style={{ width: '100%', height: '100%' }} />;
};

// --- TYPING GLITCH TEXT COMPONENT (FOR MARVIN) ---
const TypingGlitchText: React.FC<{ text: string, hoverText: string, isActive: boolean }> = ({ text, hoverText, isActive }) => {
    const [displayedText, setDisplayedText] = useState(text);
    const [fontFamily, setFontFamily] = useState("'Space Grotesk', sans-serif");
    const fonts = ["'Courier New', monospace", "'VT323', monospace", "'Press Start 2P', cursive", "'Space Mono', monospace"];
    
    useEffect(() => {
        if (!isActive) {
            // Reset when not hovering
            setDisplayedText(text);
            setFontFamily("'Space Grotesk', sans-serif");
            return;
        }

        // Start typing effect on hover
        setDisplayedText("");
        let i = 0;
        const targetText = hoverText;
        const typingInterval = setInterval(() => {
            if (i <= targetText.length) {
                setDisplayedText(targetText.slice(0, i));
                // Randomly switch font during typing
                setFontFamily(fonts[Math.floor(Math.random() * fonts.length)]);
                i++;
            } else {
                clearInterval(typingInterval);
                setFontFamily("'Space Grotesk', sans-serif");
            }
        }, 80); // Fast typing speed

        return () => clearInterval(typingInterval);
    }, [text, hoverText, isActive]);

    return (
        <div className="relative inline-block h-8 min-w-[120px] text-center whitespace-nowrap">
            <span 
                style={{ fontFamily: fontFamily }} 
                className={`font-bold text-2xl transition-all duration-100 ${isActive ? 'text-[#D4AF37] animate-glitch-skew' : 'text-gray-400 group-hover:text-white'}`}
            >
                {displayedText}
            </span>
            {/* Removed Cursor as requested */}
        </div>
    );
};

// --- GOLD PARTICLE EMITTER (FOR BOSS MODE) ---
const GoldParticleEmitter: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    if (!isActive) return null;
    
    return (
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none z-20">
            {Array.from({ length: 20 }).map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-1 h-1 bg-[#D4AF37] rounded-full animate-float opacity-0"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${50 + Math.random() * 50}%`, // Start from bottom half
                        animationDuration: `${0.5 + Math.random()}s`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        boxShadow: '0 0 6px #D4AF37'
                    }}
                ></div>
            ))}
        </div>
    );
};

const VelocityScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isMobile = useIsMobile();
    // Hook calls must be unconditional
    const contentRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);
    const currentSkew = useRef(0);
    const requestRef = useRef(0);

    useEffect(() => {
        if (isMobile) return;
        
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
    }, [isMobile]);

    if (isMobile) return <div className="relative z-10">{children}</div>;
    
    return <div ref={contentRef} className="will-change-transform relative z-10 origin-center backface-hidden">{children}</div>;
};

const ParallaxElement: React.FC<{ speed?: number; rotation?: number; children: React.ReactNode }> = ({ speed = 0.5, rotation = 0, children }) => {
    const isMobile = useIsMobile();
    // Hook calls must be unconditional
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (isMobile) return;

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
    }, [speed, rotation, isMobile]);

    if (isMobile) return <div className="w-full">{children}</div>;
    return <div ref={ref} className="gpu-accel" style={{ perspective: '1000px' }}>{children}</div>;
};

const MouseTilt: React.FC<{ children: React.ReactNode; intensity?: number }> = ({ children, intensity = 15 }) => {
    const isMobile = useIsMobile();
    // Hook calls must be unconditional
    const ref = useRef<HTMLDivElement>(null);

    if (isMobile) return <div className="h-full w-full">{children}</div>;

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

// --- SINGLE DYNAMIC SHOWCASE CARD (INTERACTIVE) ---
const DynamicShowcase = () => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [ref, isInView] = useInView({ threshold: 0.1 });
    const [tapFeedback, setTapFeedback] = useState<'left' | 'right' | 'pause' | null>(null);
    
    // Auto-Play
    useEffect(() => {
        if (!isInView || !isPlaying) return;

        const interval = setInterval(() => {
            setFade(false); 
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
                setFade(true); 
            }, 500); 
        }, 6000); 
        return () => clearInterval(interval);
    }, [isInView, isPlaying]);

    // Tap Handling
    const handleTap = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Left 30% -> Previous
        if (x < width * 0.3) {
            setTapFeedback('left');
            setFade(false);
            setTimeout(() => {
                setIndex(prev => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
                setFade(true);
                setTapFeedback(null);
            }, 300);
        } 
        // Right 30% -> Next
        else if (x > width * 0.7) {
            setTapFeedback('right');
            setFade(false);
            setTimeout(() => {
                setIndex(prev => (prev + 1) % GALLERY_IMAGES.length);
                setFade(true);
                setTapFeedback(null);
            }, 300);
        } 
        // Center 40% -> Toggle Pause
        else {
            setIsPlaying(!isPlaying);
            setTapFeedback('pause');
            setTimeout(() => setTapFeedback(null), 600);
        }
    };

    const item = GALLERY_IMAGES[index];

    return (
        <div ref={ref} className="h-full w-full relative">
            <MouseTilt intensity={8}>
                <div 
                    onClick={handleTap}
                    className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl group content-visibility-auto cursor-pointer"
                >
                    
                    {/* Visual Feedback Overlay */}
                    {tapFeedback && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-ping">
                            {tapFeedback === 'left' && <ChevronLeft className="w-24 h-24 text-white opacity-50" />}
                            {tapFeedback === 'right' && <ChevronRight className="w-24 h-24 text-white opacity-50" />}
                            {tapFeedback === 'pause' && (isPlaying ? <Play className="w-24 h-24 text-white opacity-50" /> : <Pause className="w-24 h-24 text-white opacity-50" />)}
                        </div>
                    )}

                    {/* Dynamic Image Background */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
                        <img 
                            src={item.urls[0]} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                            alt={item.caption}
                            loading="eager" // Force eager load for smoother transitions
                            decoding="async"
                        />
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col items-start justify-end h-full pointer-events-none">
                        <div className={`transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#38F8A8] bg-[#38F8A8]/10 text-[#38F8A8] text-xs font-black uppercase tracking-widest mb-4 font-grotesk">
                                <span className={`w-2 h-2 rounded-full bg-[#38F8A8] ${isPlaying ? 'animate-pulse' : 'opacity-50'}`}></span>
                                {isPlaying ? 'Active Deployment' : 'Paused'}
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
                    
                    {/* Tap Hints (Fade in on hover/touch) */}
                    <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </MouseTilt>
        </div>
    );
};

const FloatingTicker = ({ chatOpen }: { chatOpen: boolean }) => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const messages = [
        { role: "Online Seller", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", q: "Hm sis? Pwede auto-reply? 😩", a: "Matic yan! One-time payment lang. 🚀" },
        { role: "Dropshipper", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", q: "Can you manage orders? 📦", a: "Yes! Connected to Shopify & TikTok. 🔗" },
        { role: "LGU Officer", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", q: "Pwede sa constituents? 🏛️", a: "Oo naman! 24/7 public service. 🫡" },
        { role: "Hospital Staff", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow", q: "Can it triage patients? 🏥", a: "Yes, initial assessment ok! ✅" }
    ];
    useEffect(() => {
        const i = setInterval(() => {
            setVisible(false);
            setTimeout(() => { setIdx(p => (p + 1) % messages.length); setVisible(true); }, 6000); 
        }, 6000); 
        return () => clearInterval(i);
    }, []);

    if (chatOpen) return null;

    return (
        <div className={`fixed z-[60] flex flex-col gap-3 items-end pointer-events-none md:pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] bottom-24 right-4 md:right-8 origin-bottom-right scale-65 md:scale-100`}>
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

// --- MOBILE HERO ---
const MobileHero = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    return (
        <div className="pt-24 pb-8 px-4 flex flex-col items-center justify-center text-center">
             <div className="mb-6 relative w-40 h-40">
                 <div className="absolute inset-[-10px] rounded-full border border-[#38F8A8]/30 animate-spin-slow"></div>
                 <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#38F8A8] relative bg-black shadow-[0_0_40px_rgba(56,248,168,0.4)]">
                    <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin Avatar" />
                 </div>
             </div>

             <h1 className="text-6xl font-black tracking-tighter font-grotesk text-white mb-2 leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                ORIN AI
             </h1>
             <p className="text-sm text-gray-400 font-mono mb-6 max-w-xs">
                Your 24/7 AI Employee. <br/>Reads. Listens. Sells.
             </p>
             
             {/* FIXED READABILITY: Solid White + Glow */}
             <div className="relative group mb-8">
                <h1 className="text-xl font-black text-white tracking-tighter font-grotesk leading-none relative z-10 text-center animate-pulse drop-shadow-lg">
                   YOUR NEW EMPLOYEE IS HERE
                </h1>
             </div>
             
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
                     
                     {/* FIXED READABILITY: Solid White + Strong Glow */}
                     <h1 className="text-[8vw] leading-[0.85] font-black text-center tracking-tighter font-grotesk text-white animate-pulse drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                         YOUR NEW<br/>
                         EMPLOYEE<br/>
                         IS HERE.
                     </h1>
                     <p className="mt-8 text-sm text-gray-500 font-mono animate-bounce">SCROLL TO INITIALIZE ↓</p>
                </div>

                {/* SCENE 2: THE REVEAL (ORIN AVATAR) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center will-change-transform" 
                     style={{ opacity: fadeIn, transform: `scale(${scale})`, pointerEvents: fadeIn < 0.5 ? 'none' : 'auto', zIndex: 20 }}>
                     
                     {/* MASSIVE BACKGROUND TEXT */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none mix-blend-overlay opacity-30 select-none">
                         <h1 className="text-[25vw] font-black text-white tracking-tighter leading-none opacity-20">ORIN</h1>
                     </div>

                     <div className="relative w-96 h-96 mb-8 z-10">
                         {/* Spinning Rings */}
                         <div className="absolute inset-[-40px] rounded-full border border-[#38F8A8]/20 animate-spin-slow"></div>
                         <div className="absolute inset-[-20px] rounded-full border-2 border-[#D4AF37]/40 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>
                         
                         {/* Avatar Container */}
                         <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#38F8A8] relative bg-black shadow-[0_0_100px_rgba(56,248,168,0.4)]">
                            <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin Avatar" />
                         </div>
                     </div>

                     <h2 className="text-9xl font-black text-center tracking-tighter font-grotesk text-white drop-shadow-[0_0_30px_rgba(56,248,168,0.5)] z-10">
                        ORIN AI
                     </h2>
                     <p className="mt-4 text-xl font-bold text-[#38F8A8] tracking-[0.3em] uppercase drop-shadow-md z-10">
                        24/7. NEVER TIRED. ALWAYS SELLING.
                     </p>
                     
                     {/* Persistent Text - Soft Breathe */}
                     <div className="relative group mt-8 z-10">
                        <h1 className="text-4xl font-black text-transparent text-stroke tracking-tighter font-grotesk leading-none relative z-10 text-center animate-pulse opacity-70">
                           YOUR NEW EMPLOYEE IS HERE
                        </h1>
                     </div>
                     
                     <button onClick={() => setChatOpen(true)} className="mt-12 group relative px-10 py-5 bg-[#38F8A8] text-black font-black text-xl hover:scale-110 transition-transform flex items-center gap-3 font-grotesk rounded-full shadow-[0_0_40px_rgba(56,248,168,0.6)] z-10">
                         HIRE ORIN <MessageCircle className="w-6 h-6" />
                     </button>
                </div>
            </div>
        </header>
    );
};

// --- PRICING CARD (EMBOSSED MAGAZINE STYLE) ---
const PricingCard = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
    
    return (
        <div ref={ref} className={`max-w-4xl mx-auto p-12 rounded-[1.5rem] text-center relative overflow-hidden group transition-all duration-1000 transform ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} shadow-[0_20px_60px_rgba(0,0,0,0.8)]`}>
             
             {/* GLOSSY OBSIDIAN BACKGROUND */}
             <div className="absolute inset-0 bg-[#050505] z-0"></div>
             {/* Reflective Sheen */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 z-0"></div>
             {/* Frosted Glass Effect */}
             <div className="absolute inset-0 backdrop-blur-2xl bg-white/5 z-0"></div>
             
             {/* SCATTERED TESSERACT (Bright Gold Nodes) */}
             <TesseractCircuit isActive={true} />

             {/* ELECTRIC GOLD BORDER */}
             <div className="absolute inset-0 rounded-[1.5rem] border-2 border-[#D4AF37] pointer-events-none z-10 animate-electric"></div>
             
             {/* CONTENT - BRUTALIST TYPOGRAPHY */}
             <div className="relative z-20">
                 <div className="inline-flex items-center gap-3 bg-black text-[#D4AF37] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] mb-12 font-grotesk shadow-md border border-[#D4AF37]/50 animate-electric" style={{animationDuration: '3s'}}>
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

// --- PAIN-POINT INTRO SEQUENCE (INSTANT LOAD) ---
const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // INSTANT START - No "Initializing" delay
        const sequence = [
            { t: 2000, s: 1 }, // "DO YOU REPLY AT 2AM?"
            { t: 4000, s: 2 }, // "LOSING SALES?"
            { t: 6000, s: 3 }, // "STOP DOING IT MANUALLY"
            { t: 8000, s: 4 }, // "MEET ORIN AI"
            { t: 10000, s: 5 } // DONE
        ];

        let timeouts: ReturnType<typeof setTimeout>[] = [];
        sequence.forEach(({t, s}) => {
            timeouts.push(setTimeout(() => setStep(s), t));
        });
        
        timeouts.push(setTimeout(onComplete, 11000));

        return () => timeouts.forEach(clearTimeout);
    }, [onComplete]);

    if (step >= 5) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-grotesk text-center px-4">
            
            {/* Step 0: Pain 1 */}
            <h1 className={`absolute text-5xl md:text-8xl font-black text-red-600 tracking-tighter transition-all duration-500 ${step === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                DO YOU REPLY AT 2AM?
            </h1>

            {/* Step 1: Pain 2 */}
            <h1 className={`absolute text-5xl md:text-8xl font-black text-red-500 tracking-tighter transition-all duration-500 ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                LOSING SALES WHILE YOU SLEEP?
            </h1>

            {/* Step 2: Pivot */}
            <h1 className={`absolute text-5xl md:text-8xl font-black text-white tracking-tighter transition-all duration-500 ${step === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                STOP DOING IT MANUALLY.
            </h1>

            {/* Step 3: MEET ORIN AI */}
            <h1 className={`absolute text-6xl md:text-9xl font-black text-[#38F8A8] tracking-tighter transition-all duration-500 ${step === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                MEET ORIN AI.
            </h1>

            {/* Step 4: Reveal Pre-Loader */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${step === 4 ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="relative group">
                    <h1 className="text-6xl md:text-9xl font-black text-transparent text-stroke tracking-tighter animate-pulse" data-text="YOUR NEW EMPLOYEE IS HERE">
                        YOUR NEW EMPLOYEE IS HERE
                    </h1>
                 </div>
            </div>
        </div>
    );
};

export default function App() {
    const isMobile = useIsMobile();
    const [chatOpen, setChatOpen] = useState(false);
    const [gameOpen, setGameOpen] = useState(false);
    const [easterCount, setEasterCount] = useState(0);
    const [introFinished, setIntroFinished] = useState(false);
    const [hoveredMember, setHoveredMember] = useState<number | null>(null); // Track hovered team member for Boss Mode
    
    const [messages, setMessages] = useState([
        {role: 'model', text: 'Hello! Ako nga pala si Orin 👋. Advanced AI Employee na parang tao kausap. ₱15k Monthly lang for Premium Access. Sulit diba? 🚀'},
        {role: 'model', text: 'Para ma-setup natin business mo, paki-fill up lang nito boss:\n\n1. Name:\n2. Business Name:\n3. Contact #:\n4. Anong klaseng AI Employee need mo?'}
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [showFloat, setShowFloat] = useState(false);

    useEffect(() => {
        if(typeof process !== 'undefined' && process.env && process.env.API_KEY) {
             const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
             // Initialize chat session with history capability
             const session = client.chats.create({
                 model: 'gemini-2.5-flash',
                 config: { systemInstruction: systemInstruction }
             });
             setChatSession(session);
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

        if (chatSession) {
             try {
                // Use Chat Session for memory
                const response = await chatSession.sendMessage({ message: input });
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
                    {/* Marquee - STRAIGHTENED */}
                    <div className="py-6 bg-[#38F8A8] text-black overflow-hidden border-y-4 border-black mb-8 md:mb-12 relative z-10">
                        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl md:text-4xl font-black italic tracking-tighter font-grotesk">
                            <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                             <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                        </div>
                    </div>

                    {/* Sales Psychology Section - MOVED UP AS REQUESTED (Pain -> Solution) */}
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

                    {/* Gallery Grid - PROOF (Moved Up) */}
                    <section id="features" className="py-8 md:py-12 px-4 max-w-7xl mx-auto">
                        <h2 className="text-4xl md:text-8xl font-black text-center mb-8 tracking-tighter font-grotesk">
                            BUILT FOR<br/><span className="text-[#38F8A8]">EVERYONE.</span>
                        </h2>
                        <div className="w-full">
                            <DynamicShowcase />
                        </div>
                    </section>

                    {/* Stats - LOGIC */}
                    <section className="py-8 md:py-12 px-4">
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

                    {/* PRICING (The CLIMAX - moved near bottom) */}
                    <section id="pricing" className="py-8 md:py-16 px-4 relative z-20">
                        <PricingCard setChatOpen={setChatOpen} />
                    </section>
                    
                    {/* Team Section (Modern Square & Boss Mode) */}
                    <section className="py-8 px-4"> 
                        <div className="max-w-6xl mx-auto text-center mb-10"> 
                            <h2 className="text-3xl md:text-5xl font-black mb-4 font-grotesk">MEET THE MINDS</h2>
                            <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">The architects behind the intelligence.</p>
                        </div>
                        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                            {TEAM.map((member, i) => (
                                <div 
                                    key={i} 
                                    onMouseEnter={() => setHoveredMember(i)}
                                    onMouseLeave={() => setHoveredMember(null)}
                                >
                                    <MouseTilt intensity={5}>
                                        <div className={`glass-card p-6 rounded-[2.5rem] text-center group h-full flex flex-col items-center bg-black/80 transition-all duration-500 hover:bg-[#111] ${member.name === 'Marvin' ? 'border-2 border-transparent' : ''}`}>
                                            {/* Modern Square Avatar (Squircle) */}
                                            <div className={`w-56 h-56 rounded-[2rem] overflow-hidden mb-6 bg-black relative transition-all duration-700 ${member.name === 'Marvin' ? '' : 'border border-white/5 group-hover:border-[#38F8A8]/50'}`}>
                                                <img 
                                                    src={member.image} 
                                                    className={`w-full h-full object-cover ${member.name === 'Marvin' ? 'object-left' : 'object-center'} transition-all duration-700 group-hover:scale-105 ${member.name === 'Marvin' ? 'opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:opacity-100' : 'opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} 
                                                    alt={member.name} 
                                                    loading="lazy" 
                                                />
                                                {/* Boss Mode Glow Animation for Marvin (On Hover) */}
                                                {member.name === 'Marvin' && (
                                                    <>
                                                        <div className="absolute inset-0 border-4 border-[#D4AF37] rounded-[2rem] group-hover:animate-electric pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><GoldParticleEmitter isActive={hoveredMember === i} /></div>
                                                    </>
                                                )}
                                                
                                                {/* Gradient Mask to fade into background */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-20 transition-opacity duration-700"></div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mb-2 justify-center">
                                                <div className="relative">
                                                    <h4 className={`font-bold text-2xl font-grotesk ${member.name === 'Marvin' ? 'group-hover:text-[#D4AF37] text-gray-400' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                                                        {member.name === 'Marvin' ? <TypingGlitchText text="Marvin" hoverText="Marvin Villanueva" isActive={hoveredMember === i} /> : member.name}
                                                    </h4>
                                                </div>
                                                {member.name === 'Marvin' && <Crown className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                                            </div>
                                            
                                            <p className="text-xs text-gray-600 uppercase font-mono tracking-widest mb-4 group-hover:text-[#38F8A8] transition-colors">{member.role}</p>
                                            
                                            {member.name === 'Marvin' && (
                                                <a href={member.link} target="_blank" rel="noreferrer" className="mt-auto inline-block text-xs bg-white text-black hover:bg-[#D4AF37] py-2 px-4 rounded-full font-bold hover:scale-105 transition-all font-mono shadow-lg hover:shadow-[#D4AF37]/50 hover:shadow-lg">
                                                    HIRE MARVIN
                                                </a>
                                            )}
                                        </div>
                                    </MouseTilt>
                                </div>
                            ))}
                        </div>
                    </section>
                </VelocityScrollProvider>

                {/* BOTTOM MARQUEE */}
                <div className="py-6 bg-[#38F8A8] text-black overflow-hidden border-y-4 border-black relative z-10">
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