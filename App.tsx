
import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle2, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2, Headset, Cpu } from 'lucide-react';
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
            if (entry.isIntersecting) {
                setIsInView(true);
            } else {
                setIsInView(false);
            }
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

// Check for mobile to optimize performance
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// --- VISUAL COMPONENTS ---

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
        if (!ctx) return;
        let particles: any[] = [];
        let animationFrameId: number;
        
        const initParticles = () => {
            particles = [];
            // PERFORMANCE: Drastically reduce particles on mobile to keep FPS high
            const count = isMobile ? 15 : 40;
            for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 2 + 0.5 });
        };

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw background manually since we turned alpha off for perf
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
            gradient.addColorStop(0, '#050505'); gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'screen'; ctx.beginPath(); ctx.strokeStyle = 'rgba(56, 248, 168, 0.15)'; ctx.lineWidth = 0.5;
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                // PERFORMANCE: Simplified distance check
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    // Pre-check square distance to avoid sqrt
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
    const pointsRef = useRef<{x: number, y: number, z: number}[]>([]);
    
    useEffect(() => {
        const pointCount = isMobile ? 20 : 40; // Less points on mobile
        const size = 150;
        for(let i=0; i<pointCount; i++) {
            pointsRef.current.push({
                x: (Math.random() - 0.5) * size * 2,
                y: (Math.random() - 0.5) * size * 2,
                z: (Math.random() - 0.5) * size * 2
            });
        }
    }, []);

    useEffect(() => {
        if (!isActive) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let angleX = 0;
        let angleY = 0;
        let animationId: number;

        const draw = () => {
            if (!canvas) return;
            // Cheap resize check
            if(canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            angleX += 0.005; angleY += 0.007;

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';

            const projected = [];
            for(const p of pointsRef.current) {
                let y = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
                let z = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
                let x = p.x;
                let x2 = x * Math.cos(angleY) - z * Math.sin(angleY);
                let z2 = x * Math.sin(angleY) + z * Math.cos(angleY);
                const scale = 400 / (400 + z2);
                projected.push({ x: x2 * scale + cx, y: y * scale + cy, scale });
            }

            ctx.beginPath();
            for(let i=0; i<projected.length; i++) {
                for(let j=i+1; j<projected.length; j++) {
                    const dx = projected[i].x - projected[j].x;
                    const dy = projected[i].y - projected[j].y;
                    if(dx*dx + dy*dy < 10000) {
                        ctx.moveTo(projected[i].x, projected[i].y);
                        ctx.lineTo(projected[j].x, projected[j].y);
                    }
                }
            }
            ctx.stroke();

            for(const p of projected) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(212, 175, 55, ${p.scale})`;
                ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isActive]);

    return <canvas ref={canvasRef} className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ width: '100%', height: '100%' }} />;
};

const VelocityScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // CRITICAL FIX: On mobile, skew transform causes massive jitter with sticky/fixed elements.
    // We disable the visual skew effect on mobile for "Blazing Fast" smooth scrolling.
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
    // FIX: Wonky scroll. On mobile, we reduce complexity.
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let ticking = false;
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            if (rect.top < viewHeight + 100 && rect.bottom > -100) {
                const dist = (rect.top + rect.height / 2) - (viewHeight / 2);
                // Reduce rotation on mobile to stop jitter
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
    // PERFORMANCE: Disable tilt on mobile. It conflicts with touch scrolling.
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

// --- Gallery Card with Scroll Trigger ---
const GalleryCard: React.FC<{ urls: string[], caption: string, description: string }> = ({ urls, caption, description }) => {
    const [current, setCurrent] = useState(0);
    const [ref, isInView] = useInView({ threshold: 0.2 });

    useEffect(() => {
        if (!isInView) return;
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % urls.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isInView, urls.length]);

    return (
        <MouseTilt intensity={10}>
            <div 
                ref={ref}
                className={`relative h-96 rounded-3xl overflow-hidden border border-white/10 bg-gray-900 transition-all duration-700 gpu-accel ${isInView ? 'shadow-[0_10px_40px_rgba(56,248,168,0.2)]' : ''}`}
            >
                {urls.map((src, i) => (
                     <img 
                        key={i}
                        src={src} 
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${i === current ? 'opacity-100 scale-105' : 'opacity-0 scale-100'} ${isInView ? 'grayscale-0' : 'grayscale'}`} 
                        loading="lazy" 
                        decoding="async"
                        alt={caption}
                    />
                ))}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity"></div>
                
                <div className={`absolute bottom-0 left-0 w-full p-8 z-10 transition-transform duration-700 ${isInView ? 'translate-y-0' : 'translate-y-[20px]'}`}>
                    <div className="text-[#38F8A8] text-xs font-black uppercase tracking-widest mb-2 font-grotesk">Built For</div>
                    <div className="text-3xl font-black uppercase drop-shadow-lg text-white mb-4 font-grotesk">{caption}</div>
                    
                    <div className={`overflow-hidden transition-all duration-700 ${isInView ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-sm font-medium text-gray-200 whitespace-pre-line leading-relaxed border-l-2 border-[#38F8A8] pl-3 font-mono">
                            {description}
                        </p>
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

// --- HERO REVEAL SECTION (Freestyle) ---
const HeroReveal = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 0 to 1 as you scroll first 300px
    const progress = Math.min(scrollY / 300, 1);
    const fadeOut = Math.max(1 - scrollY / 200, 0);
    const fadeIn = Math.min(Math.max((scrollY - 100) / 200, 0), 1);
    
    return (
        <header className="relative h-[85vh] flex flex-col items-center justify-center overflow-hidden">
            {/* Phase 1: The Initial Hook */}
            <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300" style={{ opacity: fadeOut, pointerEvents: fadeOut <= 0 ? 'none' : 'auto' }}>
                 <div className="mb-4 flex items-center gap-2 border border-[#38F8A8]/30 bg-[#38F8A8]/10 px-4 py-1 rounded-full">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38F8A8] opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38F8A8]"></span>
                     </span>
                     <span className="text-[#38F8A8] text-xs font-bold tracking-widest uppercase font-mono">Orin V9 Online</span>
                 </div>
                 
                 <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-black text-center tracking-tighter mix-blend-screen animate-glitch font-grotesk">
                     YOUR NEW<br/>
                     <span className="text-stroke">EMPLOYEE</span><br/>
                     IS HERE.
                 </h1>
                 <p className="mt-6 text-sm text-gray-500 font-mono animate-bounce">SCROLL TO MEET HIM ↓</p>
            </div>

            {/* Phase 2: The Reveal */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ opacity: fadeIn, pointerEvents: fadeIn < 0.5 ? 'none' : 'auto', transform: `translateY(${50 - fadeIn * 50}px)` }}>
                 <div className="relative w-40 h-40 md:w-64 md:h-64 mb-8">
                     {/* Glowing Ring */}
                     <div className="absolute inset-0 rounded-full border-2 border-[#38F8A8] animate-spin-slow" style={{ opacity: fadeIn }}></div>
                     <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#A855F7] animate-spin-slow" style={{ animationDirection: 'reverse', opacity: fadeIn }}></div>
                     
                     <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#38F8A8] relative bg-black shadow-[0_0_50px_rgba(56,248,168,0.5)]">
                        <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin Avatar" />
                     </div>
                 </div>

                 <h2 className="text-5xl md:text-7xl font-black text-center tracking-tighter font-grotesk text-white drop-shadow-lg">
                    MEET <span className="text-[#38F8A8]">ORIN AI</span>
                 </h2>
                 <p className="mt-4 text-xl text-gray-300 max-w-xl text-center font-grotesk px-4">
                    24/7 Sales. Multilingual Support. <br/> Zero Complaints.
                 </p>

                 <button onClick={() => setChatOpen(true)} className="mt-8 group relative px-8 py-4 bg-[#38F8A8] text-black font-black text-lg hover:scale-105 transition-transform flex items-center gap-2 font-grotesk rounded-full shadow-xl">
                     HIRE ORIN NOW <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </button>
                 <p className="mt-2 text-xs text-gray-500 font-mono uppercase">₱15,000 / Month • Premium SaaS</p>
            </div>
        </header>
    );
};

// --- PRICING CARD WITH SCROLL TRIGGER ---
const PricingCard = ({ setChatOpen }: { setChatOpen: (v: boolean) => void }) => {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    
    return (
        <div ref={ref} className={`max-w-3xl mx-auto glass-card p-12 rounded-[3rem] text-center border relative overflow-hidden group transition-all duration-1000 ${isInView ? 'border-[#D4AF37] shadow-[0_0_100px_rgba(212,175,55,0.4)] scale-[1.02]' : 'border-[#38F8A8]'}`}>
             {/* The TESSERACT 3D Animation - BEHIND text */}
             <TesseractCircuit isActive={isInView} />

             {/* Dark overlay to ensure text readability over the gold circuit */}
             <div className="absolute inset-0 bg-black/80 z-0"></div>

             {/* Border Glow */}
             <div className={`chip-border transition-opacity duration-1000 ${isInView ? 'opacity-100' : 'opacity-0'}`}></div>

             <div className="relative z-10">
                 <div className={`inline-flex items-center gap-2 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-colors duration-1000 mb-8 font-grotesk ${isInView ? 'bg-[#D4AF37]' : 'bg-[#38F8A8]'}`}>
                     <Cpu className="w-4 h-4" /> Founder's Chip - Tesseract
                 </div>
                 
                 <h2 className={`text-7xl md:text-9xl font-black mt-4 tracking-tighter font-grotesk transition-colors duration-1000 ${isInView ? 'text-[#D4AF37]' : ''}`}>₱15,000</h2>
                 <p className={`text-2xl font-medium mt-4 font-grotesk transition-colors duration-1000 ${isInView ? 'text-white' : 'text-gray-300'}`}>Monthly Subscription</p>
                 
                 <div className={`my-12 h-px bg-gradient-to-r from-transparent to-transparent transition-all duration-1000 ${isInView ? 'via-[#D4AF37]/50' : 'via-white/20'}`}></div>
                 
                 <ul className="text-left max-w-md mx-auto space-y-4 mb-12 font-grotesk">
                     <li className="flex items-center gap-3"><CheckCircle2 className={`transition-colors ${isInView ? 'text-[#D4AF37]' : 'text-[#38F8A8]'}`} /> Lifetime 24/7 Unlimited Tech Support</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className={`transition-colors ${isInView ? 'text-[#D4AF37]' : 'text-[#38F8A8]'}`} /> Full Facebook, IG, TikTok, Shopify Integration</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className={`transition-colors ${isInView ? 'text-[#D4AF37]' : 'text-[#38F8A8]'}`} /> Voice Note & Image Recognition</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className={`transition-colors ${isInView ? 'text-[#D4AF37]' : 'text-[#38F8A8]'}`} /> Custom Training for Your Business</li>
                 </ul>
                 
                 <button onClick={() => setChatOpen(true)} className={`w-full py-6 text-black font-black text-2xl transition-all rounded-xl font-grotesk shadow-lg ${isInView ? 'bg-white hover:bg-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.6)]' : 'bg-white hover:bg-[#38F8A8]'}`}>
                     HIRE ORIN NOW
                 </button>
                 
                 <p className="mt-6 text-sm text-gray-500 font-mono">Limited chip supply. Secure yours today.</p>
             </div>
        </div>
    );
};

export default function App() {
    const [chatOpen, setChatOpen] = useState(false);
    const [gameOpen, setGameOpen] = useState(false);
    const [easterCount, setEasterCount] = useState(0);
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
            setShowFloat(window.scrollY > 600);
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
            <div className="min-h-screen text-white overflow-x-hidden selection:bg-[#38F8A8] selection:text-black">
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

                <VelocityScrollProvider>
                    {/* Replaced old header with new Scroll Reveal Hero */}
                    <HeroReveal setChatOpen={setChatOpen} />

                    {/* Marquee - Reduced margin */}
                    <div className="py-6 bg-[#38F8A8] text-black overflow-hidden rotate-[-2deg] scale-110 border-y-4 border-black mb-12">
                        <div className="animate-marquee whitespace-nowrap flex gap-12 text-4xl font-black italic tracking-tighter font-grotesk">
                            <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                             <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                        </div>
                    </div>

                    {/* Sales Psychology Section - Reduced padding & fixed parallax on mobile */}
                    <section className="py-16 px-4 max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <ParallaxElement speed={0.2} rotation={5}>
                                <MouseTilt>
                                    <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden gpu-accel">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 blur-[80px] rounded-full"></div>
                                        <h3 className="text-4xl font-black mb-6 font-grotesk">STOP DOING IT<br/>MANUALLY.</h3>
                                        <ul className="space-y-6 text-xl text-gray-300 font-grotesk">
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-8 h-8" /> You reply at 2AM (Tired)</li>
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-8 h-8" /> Leads ignored = Sales lost</li>
                                            <li className="flex items-center gap-4"><X className="text-red-500 w-8 h-8" /> Hiring humans = ₱20k/mo cost</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>

                            <ParallaxElement speed={0.4} rotation={-5}>
                                <MouseTilt>
                                    <div className="glass-card p-12 rounded-[3rem] border border-[#38F8A8]/30 relative overflow-hidden gpu-accel">
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#38F8A8]/20 blur-[80px] rounded-full"></div>
                                        <h3 className="text-4xl font-black mb-6 text-[#38F8A8] font-grotesk">THE UPGRADE.</h3>
                                        <ul className="space-y-6 text-xl text-white font-grotesk">
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-8 h-8" /> Auto-Replies in 1 Second</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-8 h-8" /> Closes Sales While You Sleep</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className="text-[#38F8A8] w-8 h-8" /> ₱15k Monthly (Premium)</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>
                        </div>
                    </section>

                    {/* Stats - Reduced padding */}
                    <section className="py-12 px-4">
                        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                             <div className="glass-card p-8 rounded-3xl">
                                 <h4 className="text-2xl font-bold mb-6 font-grotesk">Market Domination</h4>
                                 <MarketGrowthChart />
                             </div>
                             <div className="glass-card p-8 rounded-3xl">
                                 <h4 className="text-2xl font-bold mb-6 font-grotesk">ROI Potential (vs Hiring)</h4>
                                 <ROIChart />
                             </div>
                        </div>
                    </section>

                    {/* Gallery Grid - Reduced padding */}
                    <section id="features" className="py-16 px-4 max-w-7xl mx-auto">
                        <h2 className="text-6xl md:text-8xl font-black text-center mb-12 tracking-tighter font-grotesk">
                            BUILT FOR<br/><span className="text-[#38F8A8]">EVERYONE.</span>
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {GALLERY_IMAGES.map((item, i) => (
                                <div key={i} className={i === 0 || i === 3 ? "lg:col-span-2" : ""}>
                                     <GalleryCard urls={item.urls} caption={item.caption} description={item.description} />
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* Team Section */}
                    <section className="py-16 px-4 border-t border-white/10">
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <h2 className="text-5xl font-black mb-6 font-grotesk">MEET THE MINDS</h2>
                            <p className="text-gray-400 font-mono">The architects behind the intelligence.</p>
                        </div>
                        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                            {TEAM.map((member, i) => (
                                <div key={i} className="group relative">
                                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-white/10 bg-gray-900 grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <img src={member.image} className={`w-full h-full object-cover ${member.name === 'Marvin' ? 'object-left' : 'object-center'}`} alt={member.name} loading="lazy" />
                                    </div>
                                    <h4 className="font-bold text-lg font-grotesk">{member.name}</h4>
                                    <p className="text-xs text-[#38F8A8] uppercase font-mono mt-1">{member.role}</p>
                                    {member.name === 'Marvin' && (
                                        <a href={member.link} target="_blank" rel="noreferrer" className="mt-3 block text-xs bg-white text-black py-1 px-3 rounded font-bold hover:bg-[#38F8A8] transition-colors font-mono">
                                            HIRE MARVIN
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Pricing with SCROLL TRIGGERED TESSERACT EFFECT */}
                    <section id="pricing" className="py-20 px-4 relative">
                        <PricingCard setChatOpen={setChatOpen} />
                    </section>
                </VelocityScrollProvider>

                <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 relative z-10 bg-black font-mono">
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
                        className="bg-[#38F8A8] text-black font-black py-4 px-8 rounded-full shadow-[0_0_30px_rgba(56,248,168,0.4)] hover:scale-105 transition-transform flex items-center gap-2 font-grotesk"
                    >
                        HIRE ORIN <MessageCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Widget - Small FB Style */}
                <div className={`fixed bottom-0 right-0 z-[70] transition-all duration-500 transform ${chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'} w-full md:w-[320px] md:bottom-0 md:right-8`}>
                    <div className="w-full h-[50dvh] md:h-[450px] glass-card rounded-t-2xl flex flex-col overflow-hidden border border-[#38F8A8]/30 shadow-2xl bg-black">
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
