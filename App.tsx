import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle2, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2, Headset, Cpu, Triangle, ChevronLeft, ChevronRight, Pause, Play, Crown, Mail, Loader2, SkipForward, Sun, Moon, Store, Heart, Share2 } from 'lucide-react';
import { MarketGrowthChart, ROIChart } from './components/Charts';
import PacManGame from './components/PacManGame';
import { ContentProtection } from './components/ContentProtection';
import { TEAM, FEATURES, GALLERY_IMAGES } from './constants';
import { systemInstruction, generateFallbackResponse } from './services/geminiService';
import { GoogleGenAI, Chat } from "@google/genai";

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
            // Fewer particles in light mode for cleaner look
            const count = isMobile ? 12 : (theme === 'light' ? 30 : 35);
            for (let i = 0; i < count; i++) {
                particles.push({ 
                    x: Math.random() * canvas.width, 
                    y: Math.random() * canvas.height, 
                    vx: (Math.random() - 0.5) * (theme === 'light' ? 0.1 : 0.4), 
                    vy: (Math.random() - 0.5) * (theme === 'light' ? 0.1 : 0.4), 
                    size: Math.random() * 2 + 0.5 
                });
            }
        };

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (theme === 'dark') {
                // Dark Mode: Constellation Network
                const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
                gradient.addColorStop(0, '#050505'); gradient.addColorStop(1, '#000000');
                ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width, canvas.height);

                ctx.globalCompositeOperation = 'screen'; 
                ctx.beginPath(); 
                ctx.strokeStyle = 'rgba(56, 248, 168, 0.15)'; 
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
                ctx.fillStyle = '#38F8A8';
                ctx.beginPath();
                for (const p of particles) {
                    ctx.moveTo(p.x + p.size, p.y);
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); 
                }
                ctx.fill();

            } else {
                // Light Mode: Editorial Gray + Gold Accents
                ctx.fillStyle = '#F4F4F5'; 
                ctx.fillRect(0,0,canvas.width, canvas.height);
                
                // Draw static grid
                ctx.fillStyle = '#E4E4E7'; // Slightly darker gray for dots
                const spacing = 40;
                for(let x = 0; x < canvas.width; x += spacing) {
                    for(let y = 0; y < canvas.height; y += spacing) {
                        ctx.beginPath();
                        ctx.arc(x, y, 1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Gold Dust Particles
                ctx.fillStyle = '#D4AF37';
                ctx.globalAlpha = 0.4; 
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
            }

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

            // Theme Specific Styles
            ctx.lineWidth = theme === 'dark' ? 0.3 : 0.6;
            // Ancient Gold Lines for Light Mode
            ctx.strokeStyle = theme === 'dark' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(197, 160, 40, 0.2)'; 
            
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
                // Gold Nodes in Light Mode
                ctx.fillStyle = theme === 'dark' ? `rgba(255, 215, 0, ${p.scale * 0.8})` : `rgba(197, 160, 40, ${p.scale * 0.6})`;
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

// --- ICON COMPONENTS ---
// Simple SVG components for authentic branding
const BrandIcons = {
    Facebook: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.791 1.657-2.791 3.556v.416h4.133l-1.026 3.667h-3.107v7.98h-5.023z"/></svg>,
    Messenger: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.347 2 2 5.867 2 10.879c0 2.723 1.258 5.068 3.245 6.697V22l3.434-1.884c.159.043 1.157.197 1.321.197 5.653 0 10-3.867 10-8.879S17.653 2 12 2zm.892 10.428l-2.435-2.583-4.755 2.583 5.222-5.542 2.457 2.583 4.733-2.583-5.222 5.542z"/></svg>,
    Instagram: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
    TikTok: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12v8.76c0 5.29-5.43 7.31-8.65 5.75-2.67-1.35-3.69-4.89-2.28-7.55 1.09-2.02 3.19-3.05 5.43-2.91v4.2c-1.31-.27-2.73.57-2.99 1.88-.17.96.38 2.01 1.26 2.47 1.66.82 3.42-.64 3.15-2.36V0h-.01z"/></svg>,
    Airbnb: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.02 0C5.397 0 0 5.397 0 12.02c0 6.623 5.397 12.02 12.02 12.02 6.623 0 12.02-5.397 12.02-12.02C24.04 5.397 18.643 0 12.02 0zm6.816 14.51c-.13 1.95-1.928 3.51-3.67 3.51-2.126 0-3.328-1.745-3.328-1.745s-1.2 1.745-3.328 1.745c-1.742 0-3.54-1.56-3.67-3.51-.157-2.31 1.358-4.223 2.934-5.91C9.626 6.848 11.66 4.316 12 3.868c.34.448 2.374 2.98 4.228 4.732 1.576 1.687 3.091 3.6 2.934 5.91h-.326z"/></svg>,
    Shopee: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.38 7.38A3.66 3.66 0 0 0 16.5 6h-1.5v-.5a3 3 0 0 0-6 0V6H7.5c-1.21 0-2.3.56-3 1.45L2 19.5A2.99 2.99 0 0 0 5 23h14a2.99 2.99 0 0 0 3-3.5l-2.62-12.12zM11 5.5a1.5 1.5 0 0 1 3 0V6h-3v-.5zm.27 9.87c.6.21.92.35 1.05.47.1.09.18.25.18.41 0 .5-.4.8-1.04.8-.5 0-.91-.22-1.12-.55l-.83.56c.33.56.97.94 1.9.94 1.15 0 2.05-.62 2.05-1.7 0-.95-.65-1.42-1.52-1.74l-.62-.22c-.52-.19-.77-.32-.9-.42-.1-.08-.18-.21-.18-.38 0-.44.42-.7.97-.7.54 0 .9.23 1.13.56l.78-.62C12.75 11.23 12.12 11 11.5 11c-1.1 0-1.95.62-1.95 1.64 0 .9.6 1.36 1.45 1.67l.27.11V15.37z"/></svg>,
    Lazada: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>, // Using heart shape as requested by Lazada's common logo representation in minimal sets, or we can use a stylized 'L'
    Shopify: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21.56 12.15l-1.88-9.06a.75.75 0 0 0-.6-.58l-5.75-1.43a.75.75 0 0 0-.58.15l-4.18 3.65-4.1-1.03a.75.75 0 0 0-.9.46L2.44 12.15a4.5 4.5 0 0 0 2.45 5.38l6.75 2.7a.75.75 0 0 0 .56 0l7.25-2.7a4.5 4.5 0 0 0 2.11-5.38zM12 18.5l-5.25-2.1c-.2-.08-.35-.25-.4-.46l-1.5-6.03 2.5.63v.01l4.25 1.06 4.65-4.06 4.3 1.07-1.5 7.23c-.05.21-.2.38-.4.46L12 18.5z"/></svg>
};

const OrbitingAvatar = ({ theme }: { theme: 'dark' | 'light' }) => {
    // EASTER EGG STATE: Triple Tap Logic
    const [tapCount, setTapCount] = useState(0);
    const [playMusic, setPlayMusic] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (tapCount > 0 && tapCount < 3) {
            const timer = setTimeout(() => setTapCount(0), 1000); // Reset if too slow
            return () => clearTimeout(timer);
        }
    }, [tapCount]);

    const handleAvatarTap = (e: React.MouseEvent) => {
        // Prevent interfering with other interactions if needed, though simple tap is safe
        const newCount = tapCount + 1;
        setTapCount(newCount);
        if (newCount === 3) {
            if (playMusic) {
                // STOP Logic
                setPlayMusic(false);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            } else {
                // PLAY Logic - Must be inside event handler for browser permission
                setPlayMusic(true);
                if (audioRef.current) {
                    audioRef.current.volume = 0.5;
                    const playPromise = audioRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.error("Audio play failed (User interaction needed or source blocked):", error);
                        });
                    }
                }
            }
            setTapCount(0); // Reset for next time or keep playing
        }
    };

    // Config for planetary placement: angle in degrees, dist in % from center
    const PLATFORMS = [
        { id: 0, name: 'Facebook', color: '#1877F2', icon: <BrandIcons.Facebook />, angle: 270, dist: 48 }, // Top
        { id: 1, name: 'Messenger', color: '#00B2FF', icon: <BrandIcons.Messenger />, angle: 320, dist: 35 },
        { id: 2, name: 'Instagram', color: '#E1306C', icon: <BrandIcons.Instagram />, angle: 30, dist: 50 },
        { id: 3, name: 'TikTok', color: '#000000', icon: <BrandIcons.TikTok />, angle: 90, dist: 38 }, // Right
        { id: 4, name: 'Airbnb', color: '#FF5A5F', icon: <BrandIcons.Airbnb />, angle: 140, dist: 45 },
        { id: 5, name: 'Shopee', color: '#EE4D2D', icon: <BrandIcons.Shopee />, angle: 180, dist: 33 }, // Bottom
        { id: 6, name: 'Lazada', color: '#0f146d', icon: <BrandIcons.Lazada />, angle: 210, dist: 52 },
        { id: 7, name: 'Shopify', color: '#95BF47', icon: <BrandIcons.Shopify />, angle: 240, dist: 38 },
    ];

    // Constellation lines: [StartIndex, EndIndex]
    const CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], // Outer loop
        [1, 3], [5, 7], [0, 2], [4, 6] // Cross connections
    ];

    return (
        <div className="relative w-[340px] h-[340px] md:w-[480px] md:h-[480px] flex items-center justify-center">
            {/* Spinning Constellation Container - VERY SLOW SUBTLE ORBIT */}
            <div className="absolute inset-0 animate-[spin_120s_linear_infinite] pointer-events-none z-20">
                
                {/* SVG Lines Layer */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{ overflow: 'visible' }}>
                    {CONNECTIONS.map(([startIdx, endIdx], i) => {
                        const start = PLATFORMS[startIdx];
                        const end = PLATFORMS[endIdx];
                        
                        // Convert polar to cartesian (assuming 100x100 coordinate space for ease)
                        // Center is 50, 50. Radius is scaled.
                        const getPos = (p: typeof start) => ({
                            x: 50 + p.dist * Math.cos((p.angle * Math.PI) / 180),
                            y: 50 + p.dist * Math.sin((p.angle * Math.PI) / 180)
                        });

                        const p1 = getPos(start);
                        const p2 = getPos(end);

                        return (
                            <line 
                                key={i}
                                x1={`${p1.x}%`} y1={`${p1.y}%`}
                                x2={`${p2.x}%`} y2={`${p2.y}%`}
                                stroke={theme === 'dark' ? '#38F8A8' : '#C5A028'} 
                                strokeWidth="0.5"
                                strokeDasharray="4 4"
                            />
                        );
                    })}
                </svg>

                {/* Icons */}
                {PLATFORMS.map((platform, i) => {
                    const angleRad = (platform.angle * Math.PI) / 180;
                    const left = 50 + platform.dist * Math.cos(angleRad);
                    const top = 50 + platform.dist * Math.sin(angleRad);
                    
                    return (
                        <div 
                            key={i}
                            className="absolute flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:scale-125 hover:z-50 hover:border-transparent group/icon cursor-pointer shadow-lg pointer-events-auto"
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                transform: 'translate(-50%, -50%)', 
                                boxShadow: `0 0 15px -5px ${platform.color}40`
                            }}
                        >
                            {/* Counter-rotate to keep icons upright relative to screen */}
                            <div 
                                className="animate-[spin_120s_linear_infinite_reverse] w-full h-full flex items-center justify-center" 
                                style={{ 
                                    animationDuration: '120s',
                                    color: 'white'
                                }}
                            >
                                <div 
                                    className="transition-colors duration-300 group-hover/icon:text-[var(--hover-color)] drop-shadow-md"
                                    style={{ '--hover-color': platform.color } as React.CSSProperties}
                                >
                                    {platform.icon}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Glowing Orbital Rings (Static Visuals) */}
            <div className={`absolute inset-[18%] rounded-full border pointer-events-none ${theme === 'dark' ? 'border-[#38F8A8]/10' : 'border-[#C5A028]/10'}`}></div>
            <div className={`absolute inset-[32%] rounded-full border pointer-events-none ${theme === 'dark' ? 'border-[#38F8A8]/10' : 'border-[#C5A028]/10'}`}></div>
            <div className={`absolute inset-[46%] rounded-full border pointer-events-none ${theme === 'dark' ? 'border-[#38F8A8]/5' : 'border-[#C5A028]/5'}`}></div>

            {/* Main Avatar - Zoomed out to show head and shoulders */}
            <div 
                onClick={handleAvatarTap}
                className={`w-[55%] h-[55%] rounded-full overflow-hidden border-[3px] shadow-[0_0_60px_rgba(56,248,168,0.2)] bg-black relative z-10 group cursor-pointer pointer-events-auto ${theme === 'dark' ? 'border-[#38F8A8]' : 'border-[#0A0A0A] shadow-none'}`}
            >
                <img 
                    src="https://i.imgur.com/7JAu9YG.png" 
                    alt="Orin" 
                    className="w-full h-full object-cover object-top scale-100 translate-y-0 transition-transform duration-700 group-hover:scale-105" 
                />
            </div>

            {/* Audio Element - Persistent & Controlled via Ref. Using a highly reliable Google Storage URL. */}
            <audio ref={audioRef} loop preload="auto" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
                 <source src="https://archive.org/download/oiia_spinning_cat_meme/oiia_spinning_cat_meme.mp3" type="audio/mpeg" />
            </audio>

            {/* Audio Visualizer Indicator */}
            {playMusic && (
                 <div className="absolute top-0 right-0 p-4 z-40">
                    <div className="flex items-end gap-1 h-4">
                        <div className={`w-1 bg-[#38F8A8] animate-[bounce_0.6s_infinite] h-2`}></div>
                        <div className={`w-1 bg-[#38F8A8] animate-[bounce_0.8s_infinite] h-4`}></div>
                        <div className={`w-1 bg-[#38F8A8] animate-[bounce_0.5s_infinite] h-3`}></div>
                    </div>
                 </div>
            )}

            {/* Ticker Below */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30">
                <HeroTicker theme={theme} />
            </div>
        </div>
    );
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
        }, 30000); // CHANGED: 30 seconds transition
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
                            className="w-full h-full object-contain md:object-cover opacity-100 md:opacity-90 group-hover:opacity-75 transition-opacity duration-700 bg-black"
                            alt={item.caption}
                            loading="eager" 
                            decoding="async"
                        />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col items-start justify-end h-full pointer-events-none">
                        <div className={`transition-all duration-500 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#38F8A8] bg-[#38F8A8]/10 text-[#38F8A8] text-xs font-black uppercase tracking-widest mb-4 font-grotesk dark:border-[#38F8A8] dark:bg-[#38F8A8]/10 dark:text-[#38F8A8] border-[#C5A028] bg-[#C5A028]/10 text-[#C5A028]">
                                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : 'opacity-50'} bg-current`}></span>
                                {isPlaying ? 'Active Deployment' : 'Paused'}
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter font-grotesk leading-none">
                                {item.caption.toUpperCase()}
                            </h2>
                            <div className="max-w-xl border-l-4 border-[#38F8A8] dark:border-[#38F8A8] pl-6 border-[#C5A028]">
                                <p className="text-xl md:text-2xl text-gray-200 font-medium font-grotesk leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-8 right-8 flex gap-2">
                            {GALLERY_IMAGES.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-[#38F8A8] dark:bg-[#38F8A8] bg-[#C5A028]' : 'w-2 bg-white/20'}`}></div>
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

const HeroTicker = ({ theme }: { theme: 'dark' | 'light' }) => {
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
            <div className={`glass-card p-4 rounded-2xl flex items-center gap-4 border-l-4 backdrop-blur-xl w-full shadow-2xl ${theme === 'light' ? 'bg-white/95 border-[#C5A028]' : 'bg-[#111]/90 border-[#38F8A8]'}`}>
                 <img src={messages[idx].img} className={`w-12 h-12 rounded-full border-2 object-cover shrink-0 ${theme === 'light' ? 'border-gray-200' : 'border-[#38F8A8]/30'}`} alt="avatar" />
                 <div className="text-left flex-1 min-w-0">
                     <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider mb-0.5">{messages[idx].role}</p>
                     <p className="text-sm font-bold text-gray-900 dark:text-white italic leading-tight mb-1 whitespace-normal line-clamp-2">"{messages[idx].q}"</p>
                     <p className={`text-xs font-bold whitespace-normal leading-tight line-clamp-2 ${theme === 'light' ? 'text-[#C5A028]' : 'text-[#38F8A8]'}`}>Orin: {messages[idx].a}</p>
                 </div>
            </div>
        </div>
    );
};

const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);
    const [exiting, setExiting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Durations for each step in milliseconds
    const stepDurations = [1500, 1500, 1200, 1500, 2000];

    const advance = () => {
        if (exiting) return;
        if (step < 4) {
            setStep(s => s + 1);
        } else {
            finish();
        }
    };

    const finish = () => {
        if (exiting) return;
        setExiting(true);
        // Short delay for exit animation
        setTimeout(onComplete, 500);
    };

    const skip = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering advance
        onComplete();
    };

    useEffect(() => {
        // Clear previous timer when step changes
        if (timerRef.current) clearTimeout(timerRef.current);

        if (step < 4) {
             timerRef.current = setTimeout(() => {
                setStep(s => s + 1);
            }, stepDurations[step]);
        } else if (step === 4) {
            // Final step (reveal), wait then auto-finish
            timerRef.current = setTimeout(finish, stepDurations[step]);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [step]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div 
            onClick={advance}
            className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 cursor-pointer ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {/* Skip Button */}
            <button 
                onClick={skip}
                className="absolute top-8 right-8 z-[100000] text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest border border-white/10 hover:border-white px-4 py-2 rounded-full transition-colors"
            >
                Skip Intro
            </button>

            <div className="text-center px-4 relative pointer-events-none">
                
                {/* STEP 0: LOSING SALES? */}
                {step === 0 && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <h1 className="text-5xl md:text-8xl font-black text-red-500 font-grotesk tracking-tighter leading-none mb-2 glitch-text" data-text="TIRED OF">
                            TIRED OF
                        </h1>
                        <h1 className="text-5xl md:text-8xl font-black text-white font-grotesk tracking-tighter leading-none glitch-text" data-text="LOSING SALES?">
                            LOSING SALES?
                        </h1>
                    </div>
                )}

                {/* STEP 1: REPLYING AT 2AM? */}
                {step === 1 && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <h1 className="text-5xl md:text-8xl font-black text-white font-grotesk tracking-tighter leading-none mb-2">
                            REPLYING
                        </h1>
                        <h1 className="text-5xl md:text-8xl font-black text-red-500 font-grotesk tracking-tighter leading-none italic">
                            AT 2:00 AM?
                        </h1>
                    </div>
                )}

                {/* STEP 2: STOP. */}
                {step === 2 && (
                    <div className="animate-in fade-in zoom-in duration-100">
                        <h1 className="text-7xl md:text-9xl font-black text-white font-grotesk tracking-tighter leading-none border-b-8 border-red-500 inline-block">
                            STOP.
                        </h1>
                    </div>
                )}

                {/* STEP 3: AUTOMATE */}
                {step === 3 && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl md:text-7xl font-black text-gray-500 font-grotesk tracking-widest leading-none mb-4">
                            AUTOMATE
                        </h1>
                        <h1 className="text-5xl md:text-8xl font-black text-[#38F8A8] font-grotesk tracking-tighter leading-none text-stroke">
                            EVERYTHING.
                        </h1>
                    </div>
                )}

                {/* STEP 4: ORIN REVEAL */}
                {step === 4 && (
                    <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center">
                        <div className="w-24 h-24 relative mb-6">
                            <div className="absolute inset-0 border-4 border-[#38F8A8] border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-[#38F8A8]/30 border-b-transparent rounded-full animate-spin-reverse"></div>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[#38F8A8] text-xl font-grotesk tracking-tighter">ORIN</div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white font-grotesk tracking-tighter">
                            ORIN <span className="text-[#38F8A8]">AI</span>
                        </h1>
                        <p className="mt-4 font-mono text-gray-500 tracking-[0.5em] text-xs uppercase animate-pulse">
                            Neural Core Online
                        </p>
                    </div>
                )}
            </div>

            {/* Tap to Forward Hint */}
            <div className="absolute bottom-12 text-gray-600 text-[10px] font-mono uppercase tracking-[0.3em] animate-pulse pointer-events-none">
                Tap anywhere to fast forward
            </div>

            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
        </div>
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
                        <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}></span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-mono tracking-widest uppercase group-hover:text-black dark:group-hover:text-white transition-colors">STATUS: ONLINE 24/7</span>
                    </div>
                    
                    <h1 className="text-8xl xl:text-9xl font-black leading-[0.8] tracking-tighter mb-4 font-grotesk text-black dark:text-white">
                        MEET <br/>
                        <span className={`${theme === 'light' ? 'text-[#C5A028]' : 'text-[#38F8A8]'}`}>ORIN AI</span>
                    </h1>
                    
                    <h2 className="text-4xl text-transparent text-stroke font-black tracking-widest mb-8 uppercase" style={{ WebkitTextStrokeColor: theme === 'light' ? '#111' : 'rgba(255,255,255,0.8)' }}>
                        YOUR 24/7 EMPLOYEE
                    </h2>
                    
                    <div className="flex items-start gap-8 max-w-2xl">
                        <div className={`w-1 h-24 bg-gradient-to-b to-transparent ${theme === 'light' ? 'from-[#C5A028]' : 'from-[#38F8A8]'}`}></div>
                        <div>
                            <p className="text-2xl text-gray-800 dark:text-gray-300 font-medium leading-relaxed font-grotesk mb-8">
                                Orin is the <span className="text-black dark:text-white font-bold">Advanced Digital Employee</span> for Filipino Businesses. 
                                He handles sales, customer support, and operations 24/7.
                            </p>
                            <div className="flex gap-6">
                                <button 
                                    onClick={setChatOpen}
                                    className={`text-black font-black text-xl py-5 px-10 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(56,248,168,0.4)] flex items-center gap-3 font-grotesk border-2 border-transparent ${theme === 'light' ? 'bg-[#C5A028] shadow-[0_0_40px_rgba(197,160,40,0.4)]' : 'bg-[#38F8A8] hover:border-black'}`}
                                >
                                    HIRE ORIN <ArrowRight className="w-6 h-6" />
                                </button>
                                <button className="px-8 py-5 rounded-full border-2 border-black/10 dark:border-white/20 hover:border-black dark:hover:border-white hover:bg-transparent transition-all font-bold text-black dark:text-white font-grotesk tracking-wide uppercase text-sm">
                                    View Capabilities
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-span-5 flex flex-col items-center justify-center relative h-full min-h-[600px]">
                    <MouseTilt intensity={10}>
                         <div className="scale-110">
                             <OrbitingAvatar theme={theme} />
                         </div>
                    </MouseTilt>
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({ setChatOpen, theme }: { setChatOpen: () => void, theme: 'dark' | 'light' }) => {
    return (
        <div className="max-w-4xl mx-auto py-12 relative z-50">
            <MouseTilt intensity={5}>
                {/* 
                  Adaptive Card Container:
                  Dark Mode: Black & Neon Gold Gradient
                  Light Mode: "Ancient Alien Stone" Chip Aesthetic (Gray/Gold/Black)
                */}
                <div className={`relative group rounded-[3rem] p-[2px] transition-all duration-500 overflow-visible ${theme === 'dark' ? 'bg-gradient-to-b from-[#D4AF37] via-[#F7EF8A] to-[#D4AF37] shadow-[0_0_80px_-20px_rgba(212,175,55,0.4)]' : 'bg-gradient-to-b from-[#C5A028] via-[#E5E5E5] to-[#C5A028] shadow-[0_15px_50px_rgba(0,0,0,0.1)]'}`}>
                    
                    {/* Founder's Chip */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-max max-w-[90%]">
                        <div className="relative">
                            {/* Glowing Backlight for Chip */}
                            <div className={`absolute inset-0 blur-xl opacity-80 animate-pulse ${theme === 'dark' ? 'bg-[#D4AF37]' : 'bg-[#C5A028]/20'}`}></div>
                            
                            <div className={`px-5 py-2 md:px-8 md:py-3 border-b-2 border-x-2 rounded-b-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] font-grotesk flex items-center gap-2 md:gap-3 relative z-10 whitespace-nowrap ${theme === 'dark' ? 'bg-black border-[#D4AF37] text-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.6)]' : 'bg-[#EAEAEA] border-[#C5A028] text-black shadow-md'}`}>
                                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-ping ${theme === 'dark' ? 'bg-[#D4AF37]' : 'bg-[#C5A028]'}`}></div>
                                <Cpu className="w-3 h-3 md:w-4 md:h-4" /> 
                                FOUNDER'S CHIP — TESSERACT
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-[3rem] p-6 pt-12 md:p-12 relative h-full flex flex-col items-center text-center overflow-hidden ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F4F4F5] bg-opacity-90'}`}>
                        
                        {/* Background Textures */}
                        {theme === 'dark' && (
                            <>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_60%)] animate-spin-slow pointer-events-none"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none mix-blend-color-dodge"></div>
                            </>
                        )}
                        {theme === 'light' && (
                             /* Ancient Chip Texture: Noise + Subtle Circuit Overlay */
                             <>
                                <div className="absolute inset-0 bg-[#000] opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")" }}></div>
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMTBoODB2ODBoLTgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzVBMDI4IiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-40 pointer-events-none"></div>
                             </>
                        )}
                        
                        <div className="relative z-10 w-full max-w-3xl">
                            
                            {/* Header */}
                            <div className="flex flex-col items-center mb-6 mt-8 md:mt-4">
                                <h3 className={`text-xl md:text-2xl font-bold font-mono mb-2 tracking-[0.3em] uppercase drop-shadow-sm ${theme === 'dark' ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7EF8A] to-[#D4AF37]' : 'text-[#0A0A0A]'}`}>
                                    THE PREMIUM PASS
                                </h3>
                                <div className={`w-24 h-1 ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent' : 'bg-[#C5A028]'}`}></div>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-center justify-center mb-6 relative">
                                {theme === 'dark' && <div className="absolute inset-0 bg-[#D4AF37] blur-[60px] opacity-10 rounded-full"></div>}
                                <span className={`text-6xl md:text-9xl font-black font-grotesk tracking-tighter z-10 ${theme === 'dark' ? 'text-white drop-shadow-[0_0_25px_rgba(212,175,55,0.5)]' : 'text-[#0A0A0A]'}`}>
                                    ₱15,000
                                </span>
                                <span className={`text-sm md:text-base font-mono mt-4 tracking-[0.2em] uppercase border px-4 py-1 rounded-full ${theme === 'dark' ? 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10' : 'text-[#C5A028] border-[#C5A028]/30 bg-[#C5A028]/10'}`}>
                                    Monthly • Cancel Anytime
                                </span>
                            </div>
                            
                            <p className={`text-base md:text-lg mb-8 font-grotesk max-w-xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Less than 10% of a human employee's cost. <br/>
                                <span className={`${theme === 'dark' ? 'text-white' : 'text-black font-bold'}`}>Full automation architecture. Zero headaches.</span>
                            </p>
                            
                            {/* Features Grid - COMPACT */}
                            <div className={`grid md:grid-cols-2 gap-x-8 gap-y-3 text-left max-w-2xl mx-auto mb-12 p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-[#E5E5E5]'}`}>
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
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37]' : 'bg-[#C5A028]/10 border-[#C5A028]/30 group-hover:bg-[#C5A028] group-hover:border-[#C5A028]'}`}>
                                            <CheckCircle2 className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-[#D4AF37] group-hover:text-black' : 'text-[#C5A028] group-hover:text-white'}`} />
                                        </div>
                                        <span className={`text-sm md:text-base font-grotesk transition-colors tracking-wide ${theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* ISOLATED ACTION DECK - MASSIVE BUTTON */}
                            <div className="relative w-full flex flex-col items-center justify-center mt-2">
                                {theme === 'dark' && <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent blur-2xl opacity-50 pointer-events-none"></div>}
                                <button 
                                    onClick={setChatOpen}
                                    className={`relative z-[100] w-full md:w-auto font-black py-4 px-10 md:py-5 md:px-16 rounded-full text-xl md:text-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 font-grotesk uppercase tracking-widest mx-auto border-4 border-transparent group cursor-pointer ${theme === 'dark' ? 'bg-[#D4AF37] text-black shadow-[0_0_60px_rgba(212,175,55,0.6)] hover:bg-white hover:border-[#D4AF37]' : 'bg-[#C5A028] text-black hover:bg-black hover:text-[#C5A028] hover:border-[#C5A028] shadow-xl'}`}
                                >
                                    <span className="relative z-10">SECURE PASS</span>
                                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
                                </button>
                                <p className={`mt-8 text-[10px] font-mono uppercase tracking-[0.2em] relative z-10 ${theme === 'dark' ? 'text-[#D4AF37]/60' : 'text-gray-500'}`}>
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

const MobileHero = ({ setChatOpen, theme }: { setChatOpen: () => void, theme: 'dark' | 'light' }) => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-12 text-center">
            <div className="absolute inset-0 z-0 opacity-40">
                <TesseractCircuit isActive={true} theme={theme} />
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/5 backdrop-blur-md hover:border-[#38F8A8]/50 transition-colors cursor-default group">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}></span>
                    <span className="text-gray-600 dark:text-gray-300 text-[10px] font-mono tracking-widest uppercase group-hover:text-black dark:group-hover:text-white transition-colors">STATUS: ONLINE 24/7</span>
                </div>

                <div className="scale-75 origin-center -my-8">
                     <OrbitingAvatar theme={theme} />
                </div>

                <div className="mt-4">
                    <h1 className="text-6xl font-black leading-[0.8] tracking-tighter mb-2 font-grotesk text-black dark:text-white">
                        MEET <br/>
                        <span className={`${theme === 'light' ? 'text-[#C5A028]' : 'text-[#38F8A8]'}`}>ORIN AI</span>
                    </h1>
                    <h2 className="text-2xl text-transparent text-stroke font-black tracking-widest mb-4 uppercase" style={{ WebkitTextStrokeColor: theme === 'light' ? '#111' : 'rgba(255,255,255,0.8)' }}>
                        YOUR 24/7 EMPLOYEE
                    </h2>
                     <p className="text-lg text-gray-800 dark:text-gray-300 font-medium leading-relaxed font-grotesk max-w-xs mx-auto mb-6">
                        Orin is the <span className="text-black dark:text-white font-bold">Advanced Digital Employee</span> for Filipino Businesses. 
                        He handles sales, customer support, and operations 24/7.
                    </p>
                    
                     <button 
                        onClick={setChatOpen}
                        className={`text-black font-black text-lg py-4 px-8 rounded-full shadow-[0_0_20px_rgba(56,248,168,0.4)] flex items-center gap-2 font-grotesk mx-auto border-2 border-transparent ${theme === 'light' ? 'bg-[#C5A028] shadow-[0_0_20px_rgba(197,160,40,0.4)]' : 'bg-[#38F8A8]'}`}
                    >
                        HIRE ORIN <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

const HireForm = ({ onSuccess }: { onSuccess: (data: any) => void }) => {
    const [formData, setFormData] = useState({
        name: '',
        business: '',
        contact: '',
        aiType: 'Sales & Support'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        onSuccess(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-grotesk">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-500">Your Name</label>
                <input 
                    required
                    type="text" 
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#38F8A8] transition-colors text-black dark:text-white"
                    placeholder="Juan Dela Cruz"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-500">Business Name</label>
                <input 
                    required
                    type="text" 
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#38F8A8] transition-colors text-black dark:text-white"
                    placeholder="My Awesome Brand"
                    value={formData.business}
                    onChange={e => setFormData({...formData, business: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-500">Contact (Email or FB Link)</label>
                <input 
                    required
                    type="text" 
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#38F8A8] transition-colors text-black dark:text-white"
                    placeholder="juandelacruz@gmail.com"
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-500">AI Role Needed</label>
                <select 
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#38F8A8] transition-colors text-black dark:text-white appearance-none"
                    value={formData.aiType}
                    onChange={e => setFormData({...formData, aiType: e.target.value})}
                >
                    <option>Sales & Support (General)</option>
                    <option>Real Estate Agent</option>
                    <option>E-commerce Support</option>
                    <option>Booking/Reservation</option>
                </select>
            </div>
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#38F8A8] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#32d48f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> PROCESSING</> : 'SUBMIT APPLICATION'}
            </button>
            <p className="text-[10px] text-center text-gray-500 mt-2">
                By submitting, you agree to receive a proposal for the ₱15k/mo plan.
            </p>
        </form>
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

    // Ref for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (chatOpen && viewMode === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isThinking, chatOpen, viewMode]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
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

        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer csk-8mk6f68eddcexjh6w36k653vmhx8353rmy6h8y3hhfhr398c`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [{role: 'user', content: systemInstruction}, ...messages.map(m => ({role: m.role === 'user' ? 'user' : 'assistant', content: m.text})), {role: 'user', content: input}],
        max_tokens: 1024,
      }),
    });
    const data = await response.json();
    const replyText = data.choices[0].message.content;
    setMessages(p => [...p, {role: 'model', text: replyText}]);
    setIsThinking(false);    };

    return (
        <ContentProtection>
            {!introFinished && <IntroOverlay onComplete={() => setIntroFinished(true)} />}
            
            <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'text-white bg-[#020202]' : 'text-gray-900 bg-[#F4F4F5]'} overflow-x-hidden selection:bg-[#C5A028] selection:text-black ${!introFinished ? 'h-screen overflow-hidden' : ''}`}>
                <ParticleBackground theme={theme} />
                
                <nav className={`fixed top-0 w-full z-50 py-4 px-6 flex justify-between items-center backdrop-blur-xl border-b transition-all duration-300 ${theme === 'light' ? 'bg-[#F4F4F5]/80 border-gray-200' : 'bg-black/50 border-white/5'}`}>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
                        <div className={`w-10 h-10 rounded-full border overflow-hidden bg-black relative group ${theme === 'light' ? 'border-gray-300' : 'border-white/20'}`}>
                            <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110 transition-transform duration-500 group-hover:scale-125" alt="ORIN Logo" loading="lazy" />
                        </div>
                        <span className="font-black text-xl tracking-tighter font-grotesk text-gray-900 dark:text-white">ORIN AI</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400 font-mono items-center">
                        <a href="#features" className="hover:text-black dark:hover:text-[#38F8A8] transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-black dark:hover:text-[#38F8A8] transition-colors">Pricing</a>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={toggleTheme} className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button onClick={handleHireClick} className="hidden md:flex bg-black dark:bg-white/10 border border-black/10 dark:border-white/10 px-6 py-2 rounded-full text-xs font-bold text-white hover:bg-[#38F8A8] dark:hover:bg-[#38F8A8] hover:text-black transition-all hover:border-black">
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
                    <div className={`py-6 text-black overflow-hidden border-y-4 mb-8 md:mb-12 relative z-10 ${theme === 'light' ? 'bg-[#C5A028] border-black' : 'bg-[#38F8A8] border-black'}`}>
                        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl md:text-4xl font-black italic tracking-tighter font-grotesk">
                            <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                             <span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span><span>AUTOMATE NOW</span><span>•</span><span>PREMIUM SAAS</span><span>•</span><span>24/7 SUPPORT</span><span>•</span>
                        </div>
                    </div>

                    <section className="py-8 md:py-16 px-4 max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <ParallaxElement speed={0.2} rotation={5}>
                                <MouseTilt>
                                    <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden gpu-accel bg-white/60 dark:bg-black/60 shadow-xl">
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
                                    <div className={`glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border relative overflow-hidden gpu-accel mt-8 md:mt-0 shadow-xl ${theme === 'light' ? 'bg-white border-[#C5A028]/30' : 'bg-white/60 dark:bg-black/60 border-[#38F8A8]/30'}`}>
                                        <div className={`absolute bottom-0 left-0 w-64 h-64 blur-[80px] rounded-full ${theme === 'light' ? 'bg-[#C5A028]/20' : 'bg-[#38F8A8]/20'}`}></div>
                                        <h3 className={`text-3xl md:text-4xl font-black mb-6 font-grotesk ${theme === 'light' ? 'text-[#C5A028]' : 'text-[#059669] dark:text-[#38F8A8]'}`}>THE UPGRADE.</h3>
                                        <ul className="space-y-6 text-lg md:text-xl text-gray-900 dark:text-white font-grotesk">
                                            <li className="flex items-center gap-4"><CheckCircle2 className={`w-6 h-6 md:w-8 md:h-8 ${theme === 'light' ? 'text-[#C5A028]' : 'text-[#38F8A8]'}`} /> Auto-Replies in 1 Second</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className={`w-6 h-6 md:w-8 md:h-8 ${theme === 'light' ? 'text-[#C5A028]' : 'text-[#38F8A8]'}`} /> Closes Sales While You Sleep</li>
                                            <li className="flex items-center gap-4"><CheckCircle2 className={`w-6 h-6 md:w-8 md:h-8 ${theme === 'light' ? 'text-[#C5A028]' : 'text-[#38F8A8]'}`} /> ₱15,000 Monthly (Premium)</li>
                                        </ul>
                                    </div>
                                </MouseTilt>
                            </ParallaxElement>
                        </div>
                    </section>

                    <section id="features" className="py-8 md:py-12 px-4 max-w-7xl mx-auto">
                        <h2 className="text-4xl md:text-8xl font-black text-center mb-8 tracking-tighter font-grotesk text-gray-900 dark:text-white">
                            BUILT FOR<br/><span className={`${theme === 'light' ? 'text-[#C5A028]' : 'text-[#059669] dark:text-[#38F8A8]'}`}>EVERYONE.</span>
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
                        <PricingCard setChatOpen={handleHireClick} theme={theme} />
                    </section>
                    
                    <section className="py-8 px-4"> 
                        <div className="max-w-6xl mx-auto text-center mb-10"> 
                            <h2 className="text-3xl md:text-5xl font-black mb-4 font-grotesk text-gray-900 dark:text-white">MEET THE MINDS</h2>
                            <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">The architects behind the intelligence.</p>
                        </div>
                        
                        {/* 
                          UPDATED: Mobile Horizontal Scroll Layout 
                          - Uses 'flex' and 'overflow-x-auto' on mobile
                          - Uses 'grid' on desktop
                          - 'snap-x' for carousel effect
                        */}
                        <div className="max-w-6xl mx-auto flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 pb-8 md:pb-0 px-4 md:px-0 -mx-4 md:mx-auto no-scrollbar">
                            {TEAM.map((member, i) => (
                                <div 
                                    key={i} 
                                    className="min-w-[280px] w-[85vw] md:w-auto md:min-w-0 snap-center flex-shrink-0 md:flex-shrink first:pl-4 last:pr-4 md:first:pl-0 md:last:pr-0"
                                    onMouseEnter={() => setHoveredMember(i)}
                                    onMouseLeave={() => setHoveredMember(null)}
                                >
                                    <MouseTilt intensity={5}>
                                        <div className={`glass-card p-6 rounded-[2.5rem] text-center group h-full flex flex-col items-center transition-all duration-500 hover:bg-gray-50 dark:hover:bg-[#111] ${member.name === 'Marvin' ? 'border-2 border-transparent' : ''} ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/60 dark:bg-black/80 border-gray-200 dark:border-white/10'}`}>
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

                <div className={`py-6 text-black overflow-hidden border-y-4 relative z-10 ${theme === 'light' ? 'bg-[#C5A028] border-black' : 'bg-[#38F8A8] border-black'}`}>
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

                <div className={`fixed bottom-8 right-4 md:right-8 z-50 transition-all duration-500 ${showFloat ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <button 
                        onClick={handleHireClick}
                        className={`font-black py-3 px-6 md:py-4 md:px-8 rounded-full shadow-[0_0_30px_rgba(56,248,168,0.4)] hover:scale-105 transition-transform flex items-center gap-2 font-grotesk text-sm md:text-base border border-black ${theme === 'light' ? 'bg-[#C5A028] text-black' : 'bg-[#38F8A8] text-black'}`}
                    >
                        HIRE ORIN <MessageCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className={`fixed bottom-0 right-0 z-[70] transition-all duration-500 transform ${chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'} w-full md:w-[360px] md:bottom-0 md:right-8`}>
                    <div className="w-full h-[85dvh] md:h-[500px] glass-card rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden border border-[#38F8A8]/30 shadow-2xl bg-white dark:bg-black">
                        <div className={`p-3 border-b flex justify-between items-center cursor-pointer ${theme === 'light' ? 'bg-[#F4F4F5] border-gray-200' : 'bg-[#38F8A8]/10 border-white/10'}`} onClick={() => setChatOpen(false)}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full border overflow-hidden bg-black relative ${theme === 'light' ? 'border-black' : 'border-[#38F8A8]'}`}>
                                    <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="Orin" loading="lazy" />
                                    <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black animate-pulse ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm font-grotesk">ORIN AI</h3>
                                    <p className={`text-[9px] uppercase tracking-wider font-mono ${theme === 'light' ? 'text-[#C5A028]' : 'text-[#059669] dark:text-[#38F8A8]'}`}>Active Now</p>
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
                                                    ? `${theme === 'light' ? 'bg-[#C5A028] text-black font-bold' : 'bg-[#38F8A8] text-black font-bold'} chat-bubble-user font-grotesk`
                                                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 chat-bubble-bot border border-gray-200 dark:border-white/5 font-grotesk'
                                            }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}></div>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-bounce delay-100 ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}></div>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-bounce delay-200 ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={sendChat} className={`p-3 border-t backdrop-blur-md ${theme === 'light' ? 'border-gray-200 bg-white/80' : 'border-white/10 bg-black/80'}`}>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask questions..." 
                                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#38F8A8] transition-colors placeholder:text-gray-500 font-mono text-xs"
                                        />
                                        <button type="submit" className={`absolute right-1.5 top-1.5 p-1.5 rounded-full text-black hover:scale-105 transition-transform ${theme === 'light' ? 'bg-[#C5A028]' : 'bg-[#38F8A8]'}`}>
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