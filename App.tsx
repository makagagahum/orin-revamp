
import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckCircle2, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2 } from 'lucide-react';
import { MarketGrowthChart, ROIChart } from './components/Charts';
import PacManGame from './components/PacManGame';
import { ContentProtection } from './components/ContentProtection';
import { TEAM, FEATURES, GALLERY_IMAGES } from './constants';
import { GoogleGenAI } from "@google/genai";
import { systemInstruction, generateFallbackResponse } from './services/geminiService';

// --- VISUAL COMPONENTS ---

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let particles: any[] = [];
        let animationFrameId: number;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };
        const initParticles = () => {
            particles = [];
            const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 25000));
            for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 2 + 0.5 });
        };
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
            gradient.addColorStop(0, 'rgba(5,5,5,0)'); gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = gradient; ctx.fillRect(0,0,canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'screen'; ctx.beginPath(); ctx.strokeStyle = 'rgba(56, 248, 168, 0.15)'; ctx.lineWidth = 0.5;
            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    if ((p.x - p2.x)**2 + (p.y - p2.y)**2 < 15000) { ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); }
                }
            });
            ctx.stroke(); ctx.fillStyle = '#38F8A8';
            particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
            animationFrameId = requestAnimationFrame(draw);
        };
        window.addEventListener('resize', resize); resize(); draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none bg-[#020202]" />;
};

const VelocityScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let ticking = false;
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            if (rect.top < viewHeight + 100 && rect.bottom > -100) {
                const dist = (rect.top + rect.height / 2) - (viewHeight / 2);
                ref.current.style.transform = `translate3d(0, ${(dist * speed * -1).toFixed(2)}px, 0) rotateX(${((dist / viewHeight) * rotation).toFixed(2)}deg)`;
            }
            ticking = false;
        };
        const onScroll = () => { if (!ticking) { window.requestAnimationFrame(update); ticking = true; } };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [speed, rotation]);
    return <div ref={ref} style={{ perspective: '1000px' }}>{children}</div>;
};

const MouseTilt: React.FC<{ children: React.ReactNode; intensity?: number }> = ({ children, intensity = 15 }) => {
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
    return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="transition-transform duration-300 ease-out will-change-transform" style={{ transformStyle: 'preserve-3d' }}>{children}</div>;
};

const FloatingTicker = () => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const messages = [
        { role: "Online Seller", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", q: "Hm sis? Pwede auto-reply?", a: "Matic yan! ₱10k monthly lang." },
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
    return (
        <div className="fixed bottom-32 right-8 z-40 hidden md:flex flex-col gap-3 items-end pointer-events-none md:pointer-events-auto">
            <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="glass-card p-3 rounded-2xl rounded-br-sm flex items-center gap-3 border-r-4 border-[#38F8A8] max-w-[280px] flex-row-reverse text-right">
                    <img src={messages[idx].img} className="w-10 h-10 rounded-full bg-white/10 p-1" alt="avatar" />
                    <div><p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{messages[idx].role}</p><p className="text-sm font-bold text-white">"{messages[idx].q}"</p></div>
                </div>
            </div>
            <div className={`transition-all duration-500 delay-100 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="glass-card p-3 rounded-2xl rounded-tr-sm flex items-center gap-3 border-r-4 border-[#A855F7] mr-8 max-w-[280px] flex-row-reverse text-right">
                    <div className="w-10 h-10 rounded-full border border-[#38F8A8] overflow-hidden relative bg-black">
                         <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="orin" />
                    </div>
                    <div><p className="text-[10px] text-[#38F8A8] font-bold">ORIN AI ⚡</p><p className="text-sm font-bold text-white">{messages[idx].a}</p></div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [chatOpen, setChatOpen] = useState(false);
    const [gameOpen, setGameOpen] = useState(false);
    const [easterCount, setEasterCount] = useState(0);
    const [messages, setMessages] = useState([{role: 'model', text: 'Uy boss! Ako si ORIN AI. ₱10,000 monthly lang. Integrated sa FB, TikTok, at Shopee mo. G?'}]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [showFloat, setShowFloat] = useState(false);

    useEffect(() => {
        if(process.env.API_KEY) {
             const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
             setAi(client);
        }

        const handleScroll = () => {
            setShowFloat(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
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
                 // Fallback if API fails (e.g. quota limit)
                 const fallbackText = await generateFallbackResponse(input);
                 setMessages(p => [...p, {role: 'model', text: fallbackText}]);
             }
        } else {
             // Free Mode / Mock Response
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
                    <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-gray-400">
                        <a href="#features" className="hover:text-[#38F8A8] transition-colors">Features</a>
                        <a href="#stats" className="hover:text-[#38F8A8] transition-colors">Savings</a>
                    </div>
                    <a href="#" onClick={handleLogoClick} className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-transparent group-hover:border-[#38F8A8] transition-all duration-700 bg-black">
                             <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110 group-hover:rotate-[360deg] transition-transform duration-700" alt="logo" />
                        </div>
                        <span className="font-black text-2xl hidden md:block tracking-tighter">ORIN AI</span>
                    </a>
                    <div className="hidden md:flex gap-4">
                        <a href="#pricing" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#38F8A8] self-center transition-colors">Prices</a>
                    </div>
                </nav>

                <VelocityScrollProvider>
                    <section className="pt-40 pb-20 min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-4">
                        <ParallaxElement speed={-0.3}>
                            <div className="inline-block mb-6 px-5 py-2 rounded-full border border-[#38F8A8]/30 bg-[#38F8A8]/5 text-[#38F8A8] text-xs font-black tracking-[0.2em] uppercase">
                                Your 24/7 Staff
                            </div>
                            <h1 className="text-[4rem] md:text-[9rem] font-black tracking-tighter leading-[0.85] mb-6">
                                YOUR <span className="text-stroke">24/7</span> <br/>
                                <span className="text-[#38F8A8] animate-glitch inline-block">AI EMPLOYEE</span>
                            </h1>
                        </ParallaxElement>
                        <ParallaxElement speed={0.2}>
                            <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                                Humans get tired. AI doesn't. Stop replying at 2AM. <br/>
                                Let Orin handle inquiries and close sales while you sleep.
                            </p>
                        </ParallaxElement>
                        <div className="flex gap-4 justify-center">
                            <MouseTilt intensity={30}>
                                <a href="#pricing" onClick={() => setChatOpen(true)} className="bg-white text-black px-10 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform inline-flex items-center gap-2 hover:bg-[#38F8A8] shadow-[0_0_40px_rgba(255,255,255,0.3)] cursor-pointer">
                                    Hire Orin <ArrowRight size={20} />
                                </a>
                            </MouseTilt>
                        </div>
                    </section>
                </VelocityScrollProvider>

                {/* Marquee Banner */}
                <div className="py-20 bg-[#38F8A8] text-black border-y-8 border-black rotate-1 scale-105 z-20 relative overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="flex items-center gap-6">
                                <span className="text-6xl font-black uppercase italic">ALWAYS ONLINE</span>
                                <Sparkles size={40} className="animate-spin-slow" />
                                <span className="text-6xl font-black uppercase text-black">ALWAYS PRECISE</span>
                                <Sparkles size={40} className="animate-spin-slow" />
                                <span className="text-6xl font-black uppercase italic text-black/50">NO DOWNTIME</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Psychology */}
                <section className="py-32 container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-1 self-center">
                            <div className="flex items-center gap-2 text-purple-400 font-bold tracking-widest uppercase text-xs">
                                <TrendingUp size={16}/> The New Way to Work
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-6">
                                Stop <span className="text-gray-600">Doing It</span><br/> <span className="text-[#38F8A8]">Manually</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                You can't be online 24/7. Orin can. While you sleep, eat, or rest, Orin answers inquiries and closes sales for you.
                            </p>
                            <div className="flex flex-col gap-4">
                                 <div className="flex items-center gap-3"><Clock className="text-gray-500" /> <span className="text-gray-500">Human: Needs Sleep</span></div>
                                 <div className="flex items-center gap-3"><Zap className="text-[#38F8A8]" /> <span className="font-bold text-white">ORIN: 24/7 Awake</span></div>
                                 <div className="h-px bg-white/10 my-2"></div>
                                 <div className="flex items-center gap-3"><ShoppingBag className="text-[#38F8A8]" /> <span className="font-bold">Good for Online Sellers</span></div>
                                 <div className="flex items-center gap-3"><Building2 className="text-[#38F8A8]" /> <span className="font-bold">Great for Big Business</span></div>
                            </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {GALLERY_IMAGES.map((img, i) => (
                                <MouseTilt key={i} intensity={10}>
                                    <div className="relative h-72 rounded-3xl overflow-hidden group border border-white/10">
                                        <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity"></div>
                                        <div className="absolute bottom-6 left-6">
                                            <div className="text-[#38F8A8] text-xs font-black uppercase tracking-widest mb-1">Built For</div>
                                            <div className="text-2xl font-black uppercase drop-shadow-lg">{img.caption}</div>
                                        </div>
                                    </div>
                                </MouseTilt>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="features" className="py-32 container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">POWERFUL <span className="text-[#38F8A8]">FEATURES</span></h2>
                        </div>
                        {FEATURES.map((f, i) => (
                            <MouseTilt key={i}>
                                <div className="glass-card p-8 rounded-3xl h-full border border-white/10 hover:bg-white/5 transition-colors group">
                                    <div className="text-[#38F8A8] mb-4 group-hover:scale-110 transition-transform origin-left inline-block"><Zap size={32} /></div>
                                    <div className="text-white text-xl font-black uppercase mb-2">{f.title}</div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                                </div>
                            </MouseTilt>
                        ))}
                    </div>
                </section>

                <section id="stats" className="py-32 container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-20">
                        <div className="w-full md:w-1/3 self-center">
                            <h2 className="text-7xl font-black tracking-tighter mb-8">WHY IT <span className="text-stroke">MAKES SENSE</span></h2>
                            <p className="text-gray-400 text-xl">The math is simple. An employee costs ₱200k+/year. ORIN costs less and works more.</p>
                        </div>
                        <div className="w-full md:w-2/3 flex flex-col gap-12">
                            <MouseTilt>
                                <div className="glass-card p-8 rounded-[2rem] bg-black/40 border border-white/10">
                                    <h3 className="font-black text-white text-xl mb-6 uppercase tracking-widest flex items-center gap-2"><div className="w-3 h-3 bg-[#38F8A8] rounded-full animate-pulse"/> Business Growth</h3>
                                    <MarketGrowthChart />
                                </div>
                            </MouseTilt>
                            <MouseTilt>
                                <div className="glass-card p-8 rounded-[2rem] bg-black/40 border border-white/10">
                                    <h3 className="font-black text-white text-xl mb-6 uppercase tracking-widest flex items-center gap-2"><div className="w-3 h-3 bg-[#A855F7] rounded-full animate-pulse"/> Cost Savings</h3>
                                    <ROIChart />
                                </div>
                            </MouseTilt>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-32 text-center relative z-10">
                    <div className="max-w-xl mx-auto px-6">
                        <MouseTilt intensity={25}>
                            <div className="glass-card rounded-[3rem] p-12 border border-white/20 bg-black/80 relative overflow-hidden group hover:border-[#38F8A8]/50 transition-colors duration-500">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#38F8A8] to-transparent opacity-50"></div>
                                <div className="bg-[#38F8A8] text-black text-xs font-black px-4 py-1 rounded-full inline-block mb-8 uppercase tracking-widest">All-In Access</div>
                                <div className="flex justify-center items-baseline text-white mb-4">
                                    <span className="text-4xl font-bold text-gray-500 mr-2">₱</span>
                                    <span className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">10,000</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-8 uppercase tracking-widest font-mono">Monthly Subscription • Cancel Anytime</p>
                                <div className="space-y-3 mb-10 text-left max-w-xs mx-auto">
                                    <div className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 size={16} className="text-[#38F8A8]"/> <span>Setup in Minutes</span></div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 size={16} className="text-[#38F8A8]"/> <span>No Training Needed</span></div>
                                    <div className="flex items-center gap-3 text-sm text-white font-bold"><Globe size={16} className="text-[#38F8A8]"/> <span>Works With:</span></div>
                                    <div className="flex gap-4 justify-center py-2 text-gray-400">
                                        <Facebook size={20} className="hover:text-[#1877F2]"/>
                                        <Instagram size={20} className="hover:text-[#E4405F]"/>
                                        <ShoppingBag size={20} className="hover:text-[#96BF48]"/>
                                    </div>
                                </div>
                                <button onClick={() => setChatOpen(true)} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase hover:bg-[#38F8A8] hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">Start Now</button>
                                <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest">Secure & Reliable</p>
                            </div>
                        </MouseTilt>
                    </div>
                </section>

                <section className="py-32 container mx-auto px-6 relative z-10">
                    <h2 className="text-6xl font-black uppercase mb-12">The <span className="text-stroke">Team</span></h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {TEAM.map((m, i) => (
                            <MouseTilt key={i}>
                                <div className="group relative">
                                    <div className="aspect-[3/4] rounded-3xl bg-gray-900 relative overflow-hidden mb-4 border border-white/5">
                                        <img src={m.image} className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ${m.name === 'Marvin' ? 'object-left' : 'object-center'}`} loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
                                        <div className="absolute bottom-0 left-0 p-6 w-full">
                                            <div className="text-white font-black text-xl uppercase mb-1">{m.name}</div>
                                            <div className="text-[#38F8A8] text-[9px] font-mono uppercase tracking-widest leading-tight">{m.role}</div>
                                            {m.name === 'Marvin' && <a href={m.link} target="_blank" className="mt-4 inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] px-3 py-1 rounded hover:bg-[#38F8A8] hover:text-black transition-colors uppercase font-bold">View Portfolio</a>}
                                        </div>
                                    </div>
                                </div>
                            </MouseTilt>
                        ))}
                    </div>
                </section>

                <footer className="py-12 bg-black border-t border-white/10 text-center relative z-20">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full overflow-hidden relative bg-black">
                            <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="logo" />
                        </div>
                        <span className="font-black text-xl tracking-tighter">ORIN AI</span>
                    </div>
                    <div className="flex justify-center gap-6 mb-6 text-gray-500">
                        <a href="#" className="hover:text-[#38F8A8] transition-colors"><Facebook size={20} /></a>
                        <a href="#" className="hover:text-[#38F8A8] transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="hover:text-[#38F8A8] transition-colors"><Twitter size={20} /></a>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 text-sm font-black mb-1">Organic Intelligence AI</p>
                        <p className="text-gray-700 text-[10px] font-mono uppercase tracking-widest">&copy; 2025 OASIS Inc.</p>
                    </div>
                </footer>

                <FloatingTicker />

                <div className={`fixed bottom-0 right-0 md:right-8 z-50 w-full md:w-[380px] transition-transform duration-500 ease-out ${chatOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}>
                    <div className="bg-[#050505] border border-white/10 rounded-t-3xl shadow-2xl h-[600px] flex flex-col relative overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#101010] z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#38F8A8] p-0.5 overflow-hidden relative">
                                    <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110 bg-black" />
                                </div>
                                <div><div className="text-sm font-black">ORIN AI</div><div className="text-[10px] text-[#38F8A8] flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#38F8A8] rounded-full animate-pulse"/> ONLINE</div></div>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 scrollbar-thin scrollbar-thumb-gray-800">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                                    <div className={`px-5 py-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${m.role==='user'?'bg-[#38F8A8] text-black font-medium chat-bubble-user':'bg-[#181818] text-gray-200 border border-white/5 chat-bubble-bot'}`}>{m.text}</div>
                                </div>
                            ))}
                            {isThinking && <div className="flex gap-1 pl-4"><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"/><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"/><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"/></div>}
                        </div>
                        <form onSubmit={sendChat} className="p-4 bg-[#101010] border-t border-white/10 flex gap-2 z-10">
                            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-[#050505] border border-white/10 px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-[#38F8A8] transition-colors" />
                            <button type="submit" disabled={!input} className="bg-[#38F8A8] text-black p-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"><Send size={18} /></button>
                        </form>
                    </div>
                </div>

                {/* Right-Aligned Floating Hire Button */}
                <button
                    onClick={() => setChatOpen(true)}
                    className={`fixed bottom-8 right-8 z-50 bg-[#38F8A8] text-black px-12 py-4 rounded-full font-black text-lg uppercase tracking-widest shadow-[0_0_50px_rgba(56,248,168,0.5)] border-4 border-black transition-all duration-500 hover:scale-110 flex items-center gap-3 ${showFloat && !chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
                >
                    Hire Orin <MessageCircle size={24} className="animate-bounce"/>
                </button>
                {gameOpen && <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"><PacManGame onClose={() => setGameOpen(false)} /></div>}
            </div>
        </ContentProtection>
    );
}
