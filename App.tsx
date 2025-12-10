import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle2, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2, Headset, Cpu, Triangle, ChevronLeft, ChevronRight, Pause, Play, Crown, Mail, Loader2, SkipForward, Sun, Moon } from 'lucide-react';
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

const LegalModal = ({ title, onClose, children }: { title: string, onClose: () => void, children?: React.ReactNode }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#0a0a0a] border border-[#38F8A8]/20 w-full max-w-3xl max-h-[85vh] rounded-3xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#050505]">
                    <h3 className="text-lg font-bold font-grotesk text-white tracking-widest uppercase flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#38F8A8]" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                        <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto font-mono text-sm text-gray-400 space-y-6 leading-relaxed">
                    {children}
                </div>
                <div className="p-4 border-t border-white/5 bg-[#050505] flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-[#38F8A8] hover:bg-[#38F8A8]/90 text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
                        Acknowledge & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ParticleBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
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
            
            // Theme-based background
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
            if (theme === 'dark') {
                gradient.addColorStop(0, '#050505'); gradient.addColorStop(1, '#000000');
            } else {
                gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(1, '#f1f5f9');
            }
            ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width, canvas.height);

            // Adjust blend mode and color for visibility
            ctx.globalCompositeOperation = theme === 'dark' ? 'screen' : 'source-over'; 
            ctx.beginPath(); 
            // Darker lines for light mode
            ctx.strokeStyle = theme === 'dark' ? 'rgba(56, 248, 168, 0.15)' : 'rgba(0, 0, 0, 0.15)'; 
            ctx.lineWidth = 0.5;
            
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
            ctx.fillStyle = theme === 'dark' ? '#38F8A8' : '#111111';
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
    }, [theme]);
    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none will-change-transform" />;
};

const TesseractCircuit = ({ isActive, theme }: { isActive: boolean, theme: 'dark' | 'light' }) => {
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

            ctx.lineWidth = theme === 'dark' ? 0.3 : 0.5;
            // High contrast technical drawing style for light mode
            ctx.strokeStyle = theme === 'dark' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.2)';
            
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
                ctx.fillStyle = theme === 'dark' ? `rgba(255, 215, 0, ${p.scale * 0.8})` : `rgba(0, 0, 0, ${p.scale * 0.5})`;
                ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isActive, theme]);

    return <canvas ref={canvasRef} className={`absolute inset-0 z-0 pointer-events-none ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-normal'}`} style={{ width: '100%', height: '100%' }} />;
};

const TypingGlitchText: React.FC<{ text: string, hoverText: string, isActive: boolean }> = ({ text, hoverText, isActive }) => {
    const [displayedText, setDisplayedText] = useState(text);
    const [fontFamily, setFontFamily] = useState("'Space Grotesk', sans-serif");
    const fonts = ["'Courier New', monospace", "'VT323', monospace", "'Press Start 2P', cursive", "'Space Mono', monospace"];
    
    useEffect(() => {
        if (!isActive) {
            setDisplayedText(text);
            setFontFamily("'Space Grotesk', sans-serif");
            return;
        }

        setDisplayedText("");
        let i = 0;
        const targetText = hoverText;
        const typingInterval = setInterval(() => {
            if (i <= targetText.length) {
                setDisplayedText(targetText.slice(0, i));
                setFontFamily(fonts[Math.floor(Math.random() * fonts.length)]);
                i++;
            } else {
                clearInterval(typingInterval);
                setFontFamily("'Space Grotesk', sans-serif");
            }
        }, 80);

        return () => clearInterval(typingInterval);
    }, [text, hoverText, isActive]);

    return (
        <div className="relative inline-block h-8 min-w-[120px] text-center whitespace-nowrap">
            <span 
                style={{ fontFamily: fontFamily }} 
                className={`font-bold text-2xl transition-all duration-100 ${isActive ? 'text-[#D4AF37] animate-glitch-skew' : 'text-gray-400 dark:group-hover:text-white group-hover:text-black'}`}
            >
                {displayedText}
            </span>
        </div>
    );
};

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
                        top: `${50 + Math.random() * 50}%`,
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

const DynamicShowcase = () => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [ref, isInView] = useInView({ threshold: 0.1 });
    const [tapFeedback, setTapFeedback] = useState<'left' | 'right' | 'pause' | null>(null);
    
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

    const handleTap = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width * 0.3) {
            setTapFeedback('left');
            setFade(false);
            setTimeout(() => {
                setIndex(prev => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
                setFade(true);
                setTapFeedback(null);
            }, 300);
        } 
        else if (x > width * 0.7) {
            setTapFeedback('right');
            setFade(false);
            setTimeout(() => {
                setIndex(prev => (prev + 1) % GALLERY_IMAGES.length);
                setFade(true);
                setTapFeedback(null);
            }, 300);
        } 
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
                    className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-2xl group content-visibility-auto cursor-pointer"
                >
                    {tapFeedback && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-ping">
                            {tapFeedback === 'left' && <ChevronLeft className="w-24 h-24 text-white opacity-50" />}
                            {tapFeedback === 'right' && <ChevronRight className="w-24 h-24 text-white opacity-50" />}
                            {tapFeedback === 'pause' && (isPlaying ? <Play className="w-24 h-24 text-white opacity-50" /> : <Pause className="w-24 h-24 text-white opacity-50" />)}
                        </div>
                    )}

                    <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
                        <img 
                            src={item.urls[0]} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                            alt={item.caption}
                            loading="eager" 
                            decoding="async"
                        />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

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
                        
                        <div className="absolute bottom-8 right-8 flex gap-2">
                            {GALLERY_IMAGES.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-[#38F8A8]' : 'w-2 bg-white/20'}`}></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </MouseTilt>
        </div>
    );
};

const HeroTicker = () => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const messages = [
        { role: "Online Seller", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", q: "Hm sis? Pwede auto-reply? 😩", a: "Matic yan! One-time payment lang. 🚀" },
        { role: "Dropshipper", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", q: "Can you manage orders? 📦", a: "Yes! Connected to Shopify & TikTok. 🔗" },
        { role: "LGU Officer", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", q: "Pwede sa constituents? 🏛️", a: "Oo naman! 24/7 public service. 🫡" },
        { role: "Hospital Staff", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", q: "Can it triage patients? 🏥", a: "Yes, initial assessment ok! ✅" }
    ];
    useEffect(() => {
        const i = setInterval(() => {
            setVisible(false);
            setTimeout(() => { setIdx(p => (p + 1) % messages.length); setVisible(true); }, 6000); 
        }, 6000); 
        return () => clearInterval(i);
    }, []);

    return (
        <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} w-full`}>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-l-4 border-[#38F8A8] bg-white/80 dark:bg-black/80 backdrop-blur-md w-full">
                 <img src={messages[idx].img} className="w-12 h-12 rounded-full border border-black/10 dark:border-white/20 object-cover shrink-0" alt="avatar" />
                 <div className="text-left flex-1 min-w-0">
                     <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider truncate">{messages[idx].role}</p>
                     <p className="text-sm font-bold text-gray-900 dark:text-white italic truncate">"{messages[idx].q}"</p>
                     <p className="text-xs text-[#059669] dark:text-[#38F8A8] mt-1 font-bold truncate">Orin: {messages[idx].a}</p>
                 </div>
            </div>
        </div>
    );
};

const HireForm = ({ onSuccess }: { onSuccess: (formData: any) => void }) => {
    const [form, setForm] = useState({ name: '', business: '', contact: '', aiType: 'Sales Agent' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        onSuccess(form);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-gray-50 dark:bg-black/90 text-gray-900 dark:text-white">
             <div className="text-center mb-6">
                 <div className="w-12 h-12 bg-[#38F8A8]/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#38F8A8]">
                     <Mail className="w-6 h-6 text-[#059669] dark:text-[#38F8A8]" />
                 </div>
                 <h3 className="text-xl font-black font-grotesk">HIRE ORIN</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Fill this to start your 3-day setup.</p>
             </div>
             
             <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                 <div>
                     <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Your Name</label>
                     <input required className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm focus:border-[#38F8A8] outline-none transition-colors" placeholder="e.g. Juan Cruz" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                 </div>
                 <div>
                     <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Business Name</label>
                     <input required className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm focus:border-[#38F8A8] outline-none transition-colors" placeholder="e.g. Cruz Trading" value={form.business} onChange={e => setForm({...form, business: e.target.value})} />
                 </div>
                 <div>
                     <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Contact Number</label>
                     <input required className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm focus:border-[#38F8A8] outline-none transition-colors" placeholder="0917..." value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
                 </div>
                 <div>
                     <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">AI Role Needed</label>
                     <select className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm focus:border-[#38F8A8] outline-none transition-colors" value={form.aiType} onChange={e => setForm({...form, aiType: e.target.value})}>
                         <option>Sales Agent</option>
                         <option>Customer Support</option>
                         <option>Appointment Setter</option>
                         <option>Real Estate Agent</option>
                     </select>
                 </div>
                 
                 <button 
                    type="submit" 
                    disabled={isLoading}
                    className="mt-4 bg-[#38F8A8] text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(56,248,168,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                 >
                     {isLoading ? (
                         <>SENDING... <Loader2 className="w-4 h-4 animate-spin" /></>
                     ) : (
                         <>SEND APPLICATION <Send className="w-4 h-4" /></>
                     )}
                 </button>
             </form>
             <p className="text-center text-[10px] text-gray-500 mt-4">Securely transmitted to Marvin Villanueva.</p>
        </div>
    );
};

const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const sequence = [
            { t: 2000, s: 1 }, 
            { t: 4000, s: 2 }, 
            { t: 6000, s: 3 }, 
            { t: 8000, s: 4 }, 
            { t: 10000, s: 5 } 
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
            <button 
                onClick={onComplete}
                className="absolute top-6 right-6 text-gray-600 hover:text-white text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-colors z-[10000]"
            >
                SKIP INTRO <SkipForward className="w-4 h-4" />
            </button>
            
            <h1 className={`absolute text-5xl md:text-8xl font-black text-red-600 tracking-tighter transition-all duration-500 ${step === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                DO YOU REPLY AT 2AM?
            </h1>

            <h1 className={`absolute text-5xl md:text-8xl font-black text-red-500 tracking-tighter transition-all duration-500 ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                LOSING SALES WHILE YOU SLEEP?
            </h1>

            <h1 className={`absolute text-5xl md:text-8xl font-black text-white tracking-tighter transition-all duration-500 ${step === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                STOP DOING IT MANUALLY.
            </h1>

            <h1 className={`absolute text-6xl md:text-9xl font-black text-[#38F8A8] tracking-tighter transition-all duration-500 ${step === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                MEET ORIN AI.
            </h1>

            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${step === 4 ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="relative group">
                    <h1 className="text-6xl md:text-9xl font-black text-transparent text-stroke tracking-tighter animate-pulse" data-text="YOUR NEW EMPLOYEE IS HERE">
                        YOUR NEW EMPLOYEE.
                    </h1>
                 </div>
            </div>
        </div>
    );
};

const MobileHero = ({ setChatOpen, theme }: { setChatOpen: () => void, theme: 'dark' | 'light' }) => {
    return (
        <section className="relative min-h-[95vh] flex flex-col justify-start px-4 pt-48 pb-10 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <TesseractCircuit isActive={true} theme={theme} />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
                
                <div className="relative w-[220px] h-[220px] mb-24">
                     <img src="https://i.imgur.com/7JAu9YG.png" alt="Orin" className="w-full h-full object-cover rounded-full border-2 border-[#38F8A8] shadow-[0_0_40px_rgba(56,248,168,0.3)] bg-black" />
                     <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[300px] z-20">
                         <HeroTicker />
                     </div>
                </div>

                <div className="inline-block px-3 py-1 mb-4 rounded-full border border-[#38F8A8] bg-[#38F8A8]/10 mt-4">
                    <span className="text-[#059669] dark:text-[#38F8A8] text-[10px] font-bold tracking-widest uppercase font-mono animate-pulse">● Online 24/7</span>
                </div>

                <h1 className="text-6xl font-black leading-[0.9] tracking-tighter mb-4 font-grotesk text-gray-900 dark:text-white">
                    MEET <span className="text-[#059669] dark:text-[#38F8A8]">ORIN AI</span>
                </h1>
                
                <h2 className="text-xl font-bold font-grotesk text-gray-500 dark:text-gray-300 tracking-widest uppercase mb-6">
                    YOUR 24/7 EMPLOYEE
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 font-grotesk max-w-[280px] leading-relaxed mx-auto">
                    Orin handles sales, support, and operations while you sleep.
                    <span className="text-black dark:text-white block mt-1 font-bold">No breaks. No complaints.</span>
                </p>
                
                <button 
                    onClick={setChatOpen}
                    className="w-full bg-[#38F8A8] text-black font-black py-4 rounded-xl text-lg hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(56,248,168,0.4)] flex items-center justify-center gap-2 font-grotesk"
                >
                    HIRE ORIN <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
};

const StableDesktopHero = ({ setChatOpen, theme }: { setChatOpen: () => void, theme: 'dark' | 'light' }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-48">
            <div className="absolute inset-0 z-0 opacity-60">
                <TesseractCircuit isActive={true} theme={theme} />
            </div>
            
            <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center h-full">
                <div className="col-span-7 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:border-[#38F8A8]/50 transition-colors cursor-default group w-fit">
                        <span className="w-2 h-2 rounded-full bg-[#38F8A8] animate-pulse"></span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-mono tracking-widest uppercase group-hover:text-black dark:group-hover:text-white transition-colors">STATUS: ONLINE 24/7</span>
                    </div>
                    
                    <h1 className="text-8xl xl:text-9xl font-black leading-[0.8] tracking-tighter mb-4 font-grotesk text-gray-900 dark:text-white">
                        MEET <br/>
                        <span className="text-[#059669] dark:text-[#38F8A8]">ORIN AI</span>
                    </h1>
                    
                    <h2 className="text-4xl text-transparent text-stroke font-black tracking-widest mb-8 uppercase" style={{ WebkitTextStrokeColor: theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }}>
                        YOUR 24/7 EMPLOYEE
                    </h2>
                    
                    <div className="flex items-start gap-8 max-w-2xl">
                        <div className="w-1 h-24 bg-gradient-to-b from-[#38F8A8] to-transparent"></div>
                        <div>
                            <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed font-grotesk mb-8">
                                Orin is the <span className="text-black dark:text-white font-bold">Advanced Digital Employee</span> for Filipino Businesses. 
                                He handles sales, customer support, and operations 24/7.
                            </p>
                            <div className="flex gap-6">
                                <button 
                                    onClick={setChatOpen}
                                    className="bg-[#38F8A8] text-black font-black text-xl py-5 px-10 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(56,248,168,0.4)] flex items-center gap-3 font-grotesk"
                                >
                                    HIRE ORIN <ArrowRight className="w-6 h-6" />
                                </button>
                                <button className="px-8 py-5 rounded-full border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-all font-bold text-gray-900 dark:text-white font-grotesk tracking-wide uppercase text-sm">
                                    View Capabilities
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-span-5 flex flex-col items-center justify-center relative h-full min-h-[600px]">
                    <MouseTilt intensity={10}>
                        <div className="relative w-[450px] h-[450px]">
                             <div className="absolute inset-[-40px] rounded-full border border-[#38F8A8]/20 animate-spin-slow pointer-events-none"></div>
                             <div className="absolute inset-[-20px] rounded-full border-2 border-[#D4AF37]/30 animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>

                             <img src="https://i.imgur.com/7JAu9YG.png" alt="Orin" className="w-full h-full object-cover rounded-full border-4 border-[#38F8A8] shadow-[0_0_50px_rgba(56,248,168,0.3)] bg-black relative z-10" />
                             
                             <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-sm z-20">
                                 <HeroTicker />
                             </div>
                        </div>
                    </MouseTilt>
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({ setChatOpen }: { setChatOpen: () => void }) => {
    return (
        <div className="max-w-4xl mx-auto py-12 relative z-50">
            <MouseTilt intensity={5}>
                {/* 
                  ULTRA PREMIUM CONTAINER 
                  - Ensures dark mode look even in light mode for "Exclusive Pass" feel 
                  - Deep black background with Gold Accents 
                */}
                <div className="relative group rounded-[3rem] p-[2px] bg-gradient-to-b from-[#D4AF37] via-[#F7EF8A] to-[#D4AF37] shadow-[0_0_80px_-20px_rgba(212,175,55,0.4)] overflow-visible transition-all duration-500 hover:shadow-[0_0_120px_-10px_rgba(212,175,55,0.6)]">
                    
                    {/* Founder's Chip - GLOWING INTENSELY */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                        <div className="relative">
                            {/* Glowing Backlight for Chip */}
                            <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-80 animate-pulse"></div>
                            
                            <div className="bg-black px-8 py-3 border-b-2 border-x-2 border-[#D4AF37] rounded-b-xl text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] font-grotesk flex items-center gap-3 relative z-10 shadow-[0_10px_30px_rgba(212,175,55,0.6)]">
                                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></div>
                                <Cpu className="w-4 h-4" /> 
                                FOUNDER'S CHIP — TESSERACT
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#050505] rounded-[3rem] p-6 md:p-12 relative h-full flex flex-col items-center text-center overflow-hidden">
                        
                        {/* Animated Background Rays */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_60%)] animate-spin-slow pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none mix-blend-color-dodge"></div>
                        
                        <div className="relative z-10 w-full max-w-3xl">
                            
                            {/* Header */}
                            <div className="flex flex-col items-center mb-6 mt-4">
                                <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7EF8A] to-[#D4AF37] font-mono mb-2 tracking-[0.3em] uppercase drop-shadow-sm">
                                    THE PREMIUM PASS
                                </h3>
                                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-[#D4AF37] blur-[60px] opacity-10 rounded-full"></div>
                                <span className="text-6xl md:text-9xl font-black text-white font-grotesk tracking-tighter drop-shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10">
                                    ₱15,000
                                </span>
                                <span className="text-sm md:text-base text-[#D4AF37] font-mono mt-4 tracking-[0.2em] uppercase border border-[#D4AF37]/30 px-4 py-1 rounded-full bg-[#D4AF37]/10">
                                    Monthly • Cancel Anytime
                                </span>
                            </div>
                            
                            <p className="text-gray-400 text-base md:text-lg mb-8 font-grotesk max-w-xl mx-auto leading-relaxed">
                                Less than 10% of a human employee's cost. <br/>
                                <span className="text-white">Full automation architecture. Zero headaches.</span>
                            </p>
                            
                            {/* Features Grid - COMPACT */}
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-left max-w-2xl mx-auto mb-12 bg-white/5 p-6 rounded-3xl border border-white/5">
                                {[
                                    "24/7 Availability (No Sleep)",
                                    "24/7 Technical Support",
                                    "Unlimited Conversations",
                                    "Dedicated Account Manager",
                                    "Facebook, Insta & TikTok",
                                    "Receipt Recognition (OCR)",
                                    "Voice Understanding",
                                    "Priority Server Access"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
                                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] group-hover:text-black transition-colors" />
                                        </div>
                                        <span className="text-sm md:text-base text-gray-300 font-grotesk group-hover:text-white transition-colors tracking-wide">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* ISOLATED ACTION DECK - MASSIVE BUTTON */}
                            <div className="relative w-full flex flex-col items-center justify-center mt-2">
                                <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent blur-2xl opacity-50 pointer-events-none"></div>
                                <button 
                                    onClick={setChatOpen}
                                    className="relative z-[100] w-full md:w-auto bg-[#D4AF37] text-black font-black py-4 px-10 md:py-5 md:px-16 rounded-full text-xl md:text-3xl hover:scale-105 transition-all duration-300 shadow-[0_0_60px_rgba(212,175,55,0.6)] flex items-center justify-center gap-3 font-grotesk uppercase tracking-widest mx-auto hover:bg-white border-4 border-transparent hover:border-[#D4AF37] group cursor-pointer"
                                >
                                    <span className="relative z-10">SECURE PASS</span>
                                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity"></div>
                                </button>
                                <p className="mt-8 text-[10px] text-[#D4AF37]/60 font-mono uppercase tracking-[0.2em] relative z-10">
                                    *Limited slots available for Q1 2025 • Priority Access
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </MouseTilt>
        </div>
    );
};

export default function App() {
    const isMobile = useIsMobile();
    const [chatOpen, setChatOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'chat' | 'form'>('chat');
    const [gameOpen, setGameOpen] = useState(false);
    const [easterCount, setEasterCount] = useState(0);
    const [introFinished, setIntroFinished] = useState(false);
    const [hoveredMember, setHoveredMember] = useState<number | null>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    
    // Legal Modals State
    const [showTos, setShowTos] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    
    const [messages, setMessages] = useState([
        {role: 'model', text: 'Hello! Ako nga pala si Orin 👋. Advanced AI Employee na parang tao kausap. ₱15,000 Monthly lang for Premium Access. Sulit diba? 🚀'},
        {role: 'model', text: 'Questions? Chat here. Ready to hire? Click the "Hire Application" button above!'}
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [showFloat, setShowFloat] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        if(typeof process !== 'undefined' && process.env && process.env.API_KEY) {
             const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const session = client.chats.create({
                 model: 'gemini-2.5-flash',
                 config: { systemInstruction: systemInstruction }
             });
             setChatSession(session);
        }

        const handleScroll = () => {
            setShowFloat(window.scrollY > 400); 
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const newC = easterCount + 1;
        setEasterCount(newC);
        if(newC === 5) { setGameOpen(true); setEasterCount(0); }
    };

    const handleHireClick = () => {
        setChatOpen(true);
        setViewMode('form');
    };

    const handleFormSuccess = (formData: any) => {
        setViewMode('chat');
        setMessages(prev => [
            ...prev,
            {role: 'user', text: `Submitted Application:\nName: ${formData.name}\nBusiness: ${formData.business}`},
            {role: 'model', text: `Application Received, ${formData.name}! 🚀\n\nI've forwarded your details to Marvin. While we process your ${formData.aiType} setup, feel free to ask me any questions about how I can help grow ${formData.business}.`}
        ]);
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
            
            <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'text-white bg-[#020202]' : 'text-gray-900 bg-gray-50'} overflow-x-hidden selection:bg-[#38F8A8] selection:text-black ${!introFinished ? 'h-screen overflow-hidden' : ''}`}>
                <ParticleBackground theme={theme} />
                
                <nav className="fixed top-0 w-full z-50 py-4 px-6 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-all duration-300">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
                        <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 overflow-hidden bg-black relative group">
                            <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110 transition-transform duration-500 group-hover:scale-125" alt="ORIN Logo" loading="lazy" />
                        </div>
                        <span className="font-black text-xl tracking-tighter font-grotesk text-gray-900 dark:text-white">ORIN AI</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400 font-mono items-center">
                        <a href="#features" className="hover:text-black dark:hover:text-[#38F8A8] transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-black dark:hover:text-[#38F8A8] transition-colors">Pricing</a>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={toggleTheme} className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button onClick={handleHireClick} className="hidden md:flex bg-black dark:bg-white/10 border border-black/10 dark:border-white/10 px-6 py-2 rounded-full text-xs font-bold text-white hover:bg-[#38F8A8] hover:text-black transition-all">
                            HIRE ORIN
                        </button>
                    </div>
                </nav>

                {isMobile ? (
                    <MobileHero setChatOpen={handleHireClick} theme={theme} />
                ) : (
                    <StableDesktopHero setChatOpen={handleHireClick} theme={theme} />
                )}

                <VelocityScrollProvider>
                    <div className="py-6 bg-[#38F8A8] text-black overflow-hidden border-y-4 border-black mb-8 md:mb-12 relative z-10">
                        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl md:text-4xl font-black italic tracking-tighter font-grotesk">
                            <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                             <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                        </div>
                    </div>

                    <section className="py-8 md:py-16 px-4 max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <ParallaxElement speed={0.2} rotation={5}>
                                <MouseTilt>
                                    <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden gpu-accel bg-white/60 dark:bg-black/60 border border-gray-200 dark:border-white/10 shadow-xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full"></div>
                                        <h3 className="text-3xl md:text-4xl font-black mb-6 font-grotesk text-gray-900 dark:text-white">STOP DOING IT<br/>MANUALLY.</h3>
                                        <ul className="space-y-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 font-grotesk">
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-6 h-6 md:w-8 md:h-8" /> You reply at 2AM (Tired)</li>
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-6 h-6 md:w-8 md:h-8" /> Leads ignored = Sales lost</li>
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-6 h-6 md:w-8 md:h-8" /> Hiring humans = ₱20k/mo cost</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>

                            <ParallaxElement speed={0.4} rotation={-5}>
                                <MouseTilt>
                                    <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-[#38F8A8]/30 relative overflow-hidden gpu-accel mt-8 md:mt-0 bg-white/60 dark:bg-black/60 shadow-xl">
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#38F8A8]/20 blur-[80px] rounded-full"></div>
                                        <h3 className="text-3xl md:text-4xl font-black mb-6 text-[#059669] dark:text-[#38F8A8] font-grotesk">THE UPGRADE.</h3>
                                        <ul className="space-y-6 text-lg md:text-xl text-gray-900 dark:text-white font-grotesk">
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-6 h-6 md:w-8 md:h-8" /> Auto-Replies in 1 Second</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-6 h-6 md:w-8 md:h-8" /> Closes Sales While You Sleep</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-6 h-6 md:w-8 md:h-8" /> ₱15,000 Monthly (Premium)</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>
                        </div>
                    </section>

                    <section id="features" className="py-8 md:py-12 px-4 max-w-7xl mx-auto">
                        <h2 className="text-4xl md:text-8xl font-black text-center mb-8 tracking-tighter font-grotesk text-gray-900 dark:text-white">
                            BUILT FOR<br/><span className="text-[#059669] dark:text-[#38F8A8]">EVERYONE.</span>
                        </h2>
                        <div className="w-full">
                            <DynamicShowcase />
                        </div>
                    </section>

                    <section className="py-8 md:py-12 px-4">
                        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                             <div className="glass-card p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-black/60 border border-gray-200 dark:border-white/10">
                                 <h4 className="text-xl md:text-2xl font-bold mb-6 font-grotesk text-gray-900 dark:text-white">Market Domination</h4>
                                 <MarketGrowthChart />
                             </div>
                             <div className="glass-card p-6 md:p-8 rounded-3xl bg-white/60 dark:bg-black/60 border border-gray-200 dark:border-white/10">
                                 <h4 className="text-xl md:text-2xl font-bold mb-6 font-grotesk text-gray-900 dark:text-white">ROI Potential (vs Hiring)</h4>
                                 <ROIChart />
                             </div>
                        </div>
                    </section>

                    <section id="pricing" className="py-8 md:py-16 px-4 relative z-20">
                        <PricingCard setChatOpen={handleHireClick} />
                    </section>
                    
                    <section className="py-8 px-4"> 
                        <div className="max-w-6xl mx-auto text-center mb-10"> 
                            <h2 className="text-3xl md:text-5xl font-black mb-4 font-grotesk text-gray-900 dark:text-white">MEET THE MINDS</h2>
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
                                        <div className={`glass-card p-6 rounded-[2.5rem] text-center group h-full flex flex-col items-center bg-white/60 dark:bg-black/80 transition-all duration-500 hover:bg-gray-100 dark:hover:bg-[#111] border border-gray-200 dark:border-white/10 ${member.name === 'Marvin' ? 'border-2 border-transparent' : ''}`}>
                                            <div className={`w-56 h-56 rounded-[2rem] overflow-hidden mb-6 bg-black relative transition-all duration-700 ${member.name === 'Marvin' ? '' : 'border border-gray-300 dark:border-white/5 group-hover:border-[#38F8A8]/50'}`}>
                                                <img 
                                                    src={member.image} 
                                                    className={`w-full h-full object-cover ${member.name === 'Marvin' ? 'object-left' : 'object-center'} transition-all duration-700 group-hover:scale-105 ${member.name === 'Marvin' ? 'opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:opacity-100' : 'opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} 
                                                    alt={member.name} 
                                                    loading="lazy" 
                                                />
                                                {member.name === 'Marvin' && (
                                                    <>
                                                        <div className="absolute inset-0 border-4 border-[#D4AF37] rounded-[2rem] group-hover:animate-electric pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><GoldParticleEmitter isActive={hoveredMember === i} /></div>
                                                    </>
                                                )}
                                                
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-20 transition-opacity duration-700"></div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mb-2 justify-center">
                                                <div className="relative">
                                                    <h4 className={`font-bold text-2xl font-grotesk ${member.name === 'Marvin' ? 'group-hover:text-[#D4AF37] text-gray-700 dark:text-gray-400' : 'text-gray-700 dark:text-gray-400 dark:group-hover:text-white group-hover:text-black'} transition-colors`}>
                                                        {member.name === 'Marvin' ? <TypingGlitchText text="Marvin" hoverText="Marvin Villanueva" isActive={hoveredMember === i} /> : member.name}
                                                    </h4>
                                                </div>
                                                {member.name === 'Marvin' && <Crown className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                                            </div>
                                            
                                            <p className="text-xs text-gray-500 dark:text-gray-600 uppercase font-mono tracking-widest mb-4 group-hover:text-[#059669] dark:group-hover:text-[#38F8A8] transition-colors">{member.role}</p>
                                            
                                            {member.name === 'Marvin' && (
                                                <a href={member.link} target="_blank" rel="noreferrer" className="mt-auto inline-block text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-[#D4AF37] py-2 px-4 rounded-full font-bold hover:scale-105 transition-all font-mono shadow-lg hover:shadow-[#D4AF37]/50 hover:shadow-lg">
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

                <div className="py-6 bg-[#38F8A8] text-black overflow-hidden border-y-4 border-black relative z-10">
                    <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl md:text-4xl font-black italic tracking-tighter font-grotesk">
                        <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                         <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                    </div>
                </div>

                <footer className="py-8 text-center text-gray-500 dark:text-gray-600 text-sm relative z-10 bg-white dark:bg-black font-mono border-t border-gray-200 dark:border-white/5">
                    <p className="mb-4 font-bold tracking-widest text-xs">© 2025 Organic Intelligence AI • OASIS Inc.</p>
                    <div className="flex justify-center gap-8">
                        <button onClick={() => setShowTos(true)} className="hover:text-black dark:hover:text-[#38F8A8] transition-colors uppercase text-xs tracking-widest border-b border-transparent hover:border-[#38F8A8]">Terms of Service</button>
                        <button onClick={() => setShowPrivacy(true)} className="hover:text-black dark:hover:text-[#38F8A8] transition-colors uppercase text-xs tracking-widest border-b border-transparent hover:border-[#38F8A8]">Privacy Policy</button>
                    </div>
                </footer>

                {showTos && (
                    <LegalModal title="Terms of Service" onClose={() => setShowTos(false)}>
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-white font-bold mb-1 text-base">ORIN AI - PREMIUM SUBSCRIPTION TERMS OF SERVICE</h4>
                                <p className="text-xs mb-6 text-gray-500">Last Updated: December 11, 2025</p>

                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">1. ACCEPTANCE OF TERMS</h5>
                                        <p>By subscribing to the "Orin AI Premium Plan" (hereinafter referred to as "the Service"), you (the "Client" or "User") agree to be bound by these Terms of Service. These terms govern your use of the Orin AI system and the accompanying technical support services.</p>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">2. DESCRIPTION OF SERVICE</h5>
                                        <p className="mb-2">Orin AI is a multimodal artificial intelligence agent designed to automate business processes.</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Scope:</strong> The Service includes the continuous operation, hosting, and maintenance of the Orin AI agent on the Client's specified platforms.</li>
                                            <li><strong className="text-gray-300">Premium Inclusions:</strong> This subscription tier includes priority processing, proactive system monitoring, and unlimited access to technical support.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">3. SUBSCRIPTION AND PRICING</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Monthly Subscription Fee:</strong> The Client agrees to pay a recurring monthly fee of PHP 15,000.00.</li>
                                            <li><strong className="text-gray-300">Billing Cycle:</strong> The fee will be billed automatically every 30 days from the date of the initial subscription activation.</li>
                                            <li><strong className="text-gray-300">Inclusions:</strong> The monthly fee covers the software license, server costs, and the Unlimited Technical Support package described in Section 4.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">4. UNLIMITED TECHNICAL SUPPORT (24/7)</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Coverage:</strong> The Client is entitled to unlimited technical support requests at no additional cost. This includes re-calibration of AI responses, troubleshooting integration issues, updating knowledge base information, and general system maintenance.</li>
                                            <li><strong className="text-gray-300">Availability:</strong> Support is available 24 hours a day, 7 days a week.</li>
                                            <li><strong className="text-gray-300">Response Time:</strong> Premium subscribers are granted priority status, ensuring expedited response times for all support tickets.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">5. CANCELLATION AND TERMINATION</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Cancel Anytime Policy:</strong> The Client may cancel their subscription at any time without penalty. There are no lock-in periods or long-term contracts.</li>
                                            <li><strong className="text-gray-300">Effect of Cancellation:</strong> Upon cancellation, the Service will remain active until the end of the current paid billing cycle. After the cycle ends, the Orin AI agent will be deactivated, and the Client will no longer be billed.</li>
                                            <li><strong className="text-gray-300">Data Retrieval:</strong> The Client is responsible for exporting any necessary data prior to the final deactivation date.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">6. AI LIMITATIONS AND LIABILITY</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Nature of AI:</strong> While Orin AI aims for high accuracy, the Client acknowledges that AI systems may occasionally produce errors. The Client retains responsibility for overseeing AI interactions.</li>
                                            <li><strong className="text-gray-300">Liability Cap:</strong> Orin AI's liability for any claims arising out of this agreement shall not exceed the amount paid by the Client during the one (1) month period immediately preceding the event giving rise to the claim.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">7. DATA PRIVACY AND CONFIDENTIALITY</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Compliance:</strong> We adhere to strict data privacy standards (GDPR/Data Privacy Act of 2012) to protect Client and customer information.</li>
                                            <li><strong className="text-gray-300">Confidentiality:</strong> All business data shared for the purpose of configuring and maintaining the AI is treated as strictly confidential.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">8. INTELLECTUAL PROPERTY</h5>
                                        <p>The Client is granted a revocable, non-exclusive license to use the Orin AI software while the subscription is active. All intellectual property rights regarding the software code and algorithms remain with the provider.</p>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">9. GOVERNING LAW</h5>
                                        <p>These Terms shall be governed by the laws of the Republic of the Philippines.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LegalModal>
                )}

                {showPrivacy && (
                    <LegalModal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-white font-bold mb-1 text-base">ORIN AI - DATA PRIVACY POLICY</h4>
                                <p className="text-xs mb-6 text-gray-500">Last Updated: December 11, 2025</p>

                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">1. INTRODUCTION</h5>
                                        <p>Orin AI ("We," "Us," or "Our") is committed to protecting the privacy and security of our Clients and their end-users. This Privacy Policy outlines how we collect, use, store, and protect data in the course of providing our AI automation services, in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines and applicable international standards such as GDPR and CCPA.</p>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">2. INFORMATION WE COLLECT</h5>
                                        <p className="mb-2">To provide our multimodal AI services, we may collect and process the following types of information:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Client Business Information:</strong> Contact details, billing information, and platform credentials (API keys) necessary for integration.</li>
                                            <li><strong className="text-gray-300">Interaction Data:</strong> Data generated during interactions with end-users, including text logs, voice recordings (for speech-to-text processing), and images (for computer vision analysis).</li>
                                            <li><strong className="text-gray-300">Integration Data:</strong> Information synced from connected third-party platforms (e.g., CRM, E-commerce, Messaging apps) as authorized by the Client.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">3. HOW WE USE YOUR INFORMATION</h5>
                                        <p className="mb-2">We use the collected data strictly for the following purposes:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Service Delivery:</strong> To automate responses, process orders, schedule appointments, and perform the functions of the Orin AI agent.</li>
                                            <li><strong className="text-gray-300">Technical Support:</strong> To troubleshoot issues and optimize system performance as part of your unlimited 24/7 support package.</li>
                                            <li><strong className="text-gray-300">System Improvement:</strong> To refine AI understanding and accuracy through machine learning algorithms. Note: Data used for training is anonymized and stripped of personally identifiable information (PII).</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">4. DATA SHARING AND DISCLOSURE</h5>
                                        <p className="mb-2">We do not sell your business data to third parties. Data is only shared in the following circumstances:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Authorized Integrations:</strong> Data is transferred to the third-party platforms you have explicitly connected (e.g., sending an order detail to your Shopify dashboard or a lead to your Salesforce CRM).</li>
                                            <li><strong className="text-gray-300">Legal Requirements:</strong> If required by law or in response to a valid legal process.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">5. DATA SECURITY MEASURES</h5>
                                        <p className="mb-2">We employ enterprise-grade security protocols to protect your data:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Encryption:</strong> All data is encrypted both in transit and at rest using industry-standard protocols.</li>
                                            <li><strong className="text-gray-300">Access Control:</strong> We utilize strict Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA) to ensure only authorized personnel can access administrative tools.</li>
                                            <li><strong className="text-gray-300">Monitoring:</strong> Real-time security monitoring and threat detection systems are active 24/7.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">6. DATA RETENTION AND DELETION</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Active Subscription:</strong> Data is retained for the duration of your active subscription to maintain conversation context and history.</li>
                                            <li><strong className="text-gray-300">Upon Cancellation:</strong> If you cancel your ₱15,000/month subscription, you have a grace period to export your data. After this period, automated deletion protocols are triggered to permanently remove Client data from our active servers in compliance with data retention policies.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">7. CLIENT AND USER RIGHTS</h5>
                                        <p className="mb-2">Under the Data Privacy Act, you have the right to:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong className="text-gray-300">Access:</strong> Request a copy of the personal data we hold about you.</li>
                                            <li><strong className="text-gray-300">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                                            <li><strong className="text-gray-300">Erasure:</strong> Request the deletion of your data, subject to our retention policies and legal obligations.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">8. CONTACT US</h5>
                                        <p className="mb-2">For any privacy-related concerns, data subject requests, or questions regarding this policy, please contact our Data Protection Officer:</p>
                                        <p className="text-gray-300">Name: Marvin</p>
                                        <p className="text-gray-300">Email: marvin@orin.work</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LegalModal>
                )}

                <div className={`fixed bottom-8 right-4 md:right-8 z-50 transition-all duration-500 ${showFloat ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <button 
                        onClick={handleHireClick}
                        className="bg-[#38F8A8] text-black font-black py-3 px-6 md:py-4 md:px-8 rounded-full shadow-[0_0_30px_rgba(56,248,168,0.4)] hover:scale-105 transition-transform flex items-center gap-2 font-grotesk text-sm md:text-base"
                    >
                        HIRE ORIN <MessageCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className={`fixed bottom-0 right-0 z-[70] transition-all duration-500 transform ${chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'} w-full md:w-[360px] md:bottom-0 md:right-8`}>
                    <div className="w-full h-[85dvh] md:h-[500px] glass-card rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden border border-[#38F8A8]/30 shadow-2xl bg-white dark:bg-black">
                        <div className="p-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-[#38F8A8]/10 cursor-pointer" onClick={() => setChatOpen(false)}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border border-[#38F8A8] overflow-hidden bg-black relative">
                                    <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin" loading="lazy" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#38F8A8] rounded-full border border-black animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm font-grotesk">ORIN AI</h3>
                                    <p className="text-[9px] text-[#059669] dark:text-[#38F8A8] uppercase tracking-wider font-mono">Active Now</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'chat' ? 'form' : 'chat'); }}
                                    className="text-[10px] bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 px-2 py-1 rounded text-gray-900 dark:text-white font-mono"
                                >
                                    {viewMode === 'chat' ? 'HIRE NOW' : 'CHAT'}
                                </button>
                                <X className="w-4 h-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" />
                            </div>
                        </div>

                        {viewMode === 'form' ? (
                            <div className="flex-1 overflow-y-auto scroll-smooth">
                                <HireForm onSuccess={handleFormSuccess} />
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                                                m.role === 'user' 
                                                    ? 'bg-[#38F8A8] text-black chat-bubble-user font-bold font-grotesk' 
                                                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 chat-bubble-bot border border-gray-200 dark:border-white/5 font-grotesk'
                                            }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                                <div className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-bounce delay-100"></div>
                                                <div className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={sendChat} className="p-3 border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask questions..." 
                                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#38F8A8] transition-colors placeholder:text-gray-500 font-mono text-xs"
                                        />
                                        <button type="submit" className="absolute right-1.5 top-1.5 p-1.5 bg-[#38F8A8] rounded-full text-black hover:scale-105 transition-transform">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-center mt-1.5">
                                        <p className="text-[8px] text-gray-500 flex items-center justify-center gap-1 font-mono">
                                            <ShieldCheck className="w-2.5 h-2.5" /> Secured by O.A.S.I.S
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
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