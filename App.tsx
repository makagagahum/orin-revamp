import React, { useState, useEffect, useRef } from 'react';
import { Menu, MessageCircle, X, ArrowRight, Zap, Send, Sparkles, CheckSquare, Facebook, Instagram, Twitter, ShoppingBag, Globe, TrendingUp, ShieldCheck, Clock, AlertCircle, Building2 } from 'lucide-react';
import { MarketGrowthChart, ROIChart } from './components/Charts';
import PacManGame from './components/PacManGame';
import { TEAM, FEATURES, GALLERY_IMAGES } from './constants';
import { GoogleGenAI } from "@google/genai";
import { systemInstruction } from './services/geminiService';

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
        
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        
        const createParticles = () => {
            particles = [];
            const count = Math.min(100, (canvas.width * canvas.height) / 15000);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    dx: (Math.random() - 0.5) * 0.5,
                    dy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1
                });
            }
        };
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(56, 248, 168, 0.5)';
            ctx.strokeStyle = 'rgba(56, 248, 168, 0.1)';
            
            particles.forEach((p, i) => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Connect particles
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        
        window.addEventListener('resize', () => { resize(); createParticles(); });
        resize(); createParticles(); animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
    <div className={`relative inline-block group ${className}`}>
        <span className="relative z-10">{text}</span>
        <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#38F8A8] opacity-0 group-hover:opacity-70 animate-glitch clip-path-polygon-1">{text}</span>
        <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#FF3366] opacity-0 group-hover:opacity-70 animate-glitch animation-delay-100 clip-path-polygon-2">{text}</span>
    </div>
);

const MouseTilt: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const handleMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        ref.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.02, 1.02, 1.02)`;
    };
    const handleLeave = () => {
        if (ref.current) ref.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
    };
    return (
        <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`transition-transform duration-200 ease-out ${className}`}>
            {children}
        </div>
    );
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
            
            const targetSkew = Math.max(Math.min(velocity * 0.1, 5), -5);
            currentSkew.current += (targetSkew - currentSkew.current) * 0.1;

            if (contentRef.current) {
                contentRef.current.style.transform = `skewY(${currentSkew.current}deg)`;
            }
            requestRef.current = requestAnimationFrame(update);
        }
        update();
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return <div ref={contentRef} className="will-change-transform relative z-10 transition-transform duration-100 ease-out">{children}</div>;
};

const ParallaxElement: React.FC<{ children: React.ReactNode; speed?: number; className?: string }> = ({ children, speed = 0.5, className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const y = window.scrollY * speed;
                ref.current.style.transform = `translateY(${y}px)`;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);
    return <div ref={ref} className={`will-change-transform ${className}`}>{children}</div>;
};

// --- APP COMPONENTS ---

const FloatingTicker = () => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    
    // Cute Cartoon Avatars
    const messages = [
        { role: "Online Seller", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", q: "Hm po? Automatic reply?", a: "Yes boss! 10k/mo lang." },
        { role: "Dropshipper", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", q: "Connect to Shopify?", a: "Integrated na!" },
        { role: "LGU Officer", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", q: "Pwede sa constituents?", a: "24/7 Public Service." },
    ];

    useEffect(() => {
        const i = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIdx(p => (p + 1) % messages.length);
                setVisible(true);
            }, 500);
        }, 4000);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="fixed bottom-24 right-4 z-40 hidden md:flex flex-col items-end pointer-events-none">
            {/* Customer Bubble */}
            <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} mb-2`}>
                <div className="glass-card text-white p-3 rounded-2xl rounded-tr-sm flex items-center gap-3 shadow-lg max-w-[250px]">
                    <img src={messages[idx].img} className="w-10 h-10 rounded-full bg-white/10" alt="avatar" />
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{messages[idx].role}</p>
                        <p className="text-sm font-medium leading-tight">{messages[idx].q}</p>
                    </div>
                </div>
            </div>
            
            {/* Orin Reply Bubble */}
            <div className={`transition-all duration-500 delay-200 transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                <div className="bg-[#38F8A8] text-[#0B1120] p-3 rounded-2xl rounded-br-sm flex items-center gap-3 shadow-[0_0_20px_rgba(56,248,168,0.4)] max-w-[250px]">
                     <div className="w-10 h-10 rounded-full bg-black overflow-hidden border-2 border-white/20">
                         <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="orin" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black/60 font-bold uppercase">ORIN AI</p>
                        <p className="text-sm font-bold leading-tight">{messages[idx].a}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [chatOpen, setChatOpen] = useState(false);
    const [gameOpen, setGameOpen] = useState(false);
    const [easterCount, setEasterCount] = useState(0);
    const [messages, setMessages] = useState([{role: 'model', text: 'Hello boss! Orin here. ₱10,000 monthly lang, integrated na sa lahat!'}]);
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
            setShowFloat(window.scrollY > 500);
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
        setMessages(p => [...p, {role: 'user', text: input}]);
        setInput('');
        setIsThinking(true);
        if (ai) {
             try {
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: input,
                  config: { systemInstruction: systemInstruction }
                });
                setMessages(p => [...p, {role: 'model', text: response.text || "Pasensya na boss, may glitch."}]);
             } catch(e) {
                 setMessages(p => [...p, {role: 'model', text: "Offline ako saglit boss."}]);
             }
        } else {
             await new Promise(r => setTimeout(r, 1000));
             setMessages(p => [...p, {role: 'model', text: "Set up mo muna API Key boss."}]);
        }
        setIsThinking(false);
    };

    return (
        <div className="min-h-screen text-[#E0E7FF] bg-[#0B1120] selection:bg-[#38F8A8] selection:text-[#0B1120] font-sans overflow-x-hidden">
            <ParticleBackground />
            
            {/* NAV */}
            <nav className="fixed top-0 w-full z-50 px-4 py-4 md:px-8">
                <div className="glass-card rounded-full px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">
                    <a href="#" onClick={handleLogoClick} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full border-2 border-[#38F8A8]/30 overflow-hidden group-hover:border-[#38F8A8] transition-colors relative">
                             <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="logo" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ORIN <span className="text-[#38F8A8]">AI</span></span>
                    </a>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#stats" className="hover:text-white transition-colors">Stats</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                </div>
            </nav>

            <VelocityScrollProvider>
                <header className="relative pt-40 pb-20 px-4 min-h-screen flex flex-col justify-center items-center text-center overflow-hidden">
                    <ParallaxElement speed={-0.2} className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#38F8A8]/30 bg-[#38F8A8]/10 text-[#38F8A8] text-sm font-bold mb-8 animate-pulse">
                            <Zap size={16} /> BATCH 1 ACCESS OPEN
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8 text-white">
                            <GlitchText text="AI EMPLOYEE" /><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38F8A8] to-[#2DD4BF]">REVOLUTION</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Stop replying manually. Hire Orin for ₱10k/mo. 
                            <br/><span className="text-[#38F8A8]">24/7 Sales, Support, & Ops.</span>
                        </p>
                        <button onClick={() => setChatOpen(true)} className="group relative px-8 py-4 bg-[#38F8A8] text-[#0B1120] rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(56,248,168,0.6)]">
                            <span className="relative z-10 flex items-center gap-2">HIRE ORIN <ArrowRight className="group-hover:translate-x-1 transition-transform"/></span>
                        </button>
                    </ParallaxElement>
                </header>
            </VelocityScrollProvider>

            {/* MARQUEE */}
            <div className="bg-[#38F8A8] text-[#0B1120] py-4 transform -rotate-1 relative z-20 shadow-[0_0_50px_rgba(56,248,168,0.3)]">
                <div className="animate-marquee whitespace-nowrap flex gap-8 font-black text-2xl uppercase tracking-widest">
                    {[1,2,3,4,5,6].map(i => (
                        <span key={i} className="flex items-center gap-4">
                            ALWAYS ONLINE <Zap size={24} className="fill-black"/> 
                            AUTO REPLY <MessageCircle size={24} className="fill-black"/>
                            10K MONTHLY <ShoppingBag size={24} className="fill-black"/>
                        </span>
                    ))}
                </div>
            </div>

            {/* STICKY SHOWCASE */}
            <section className="py-32 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                        <div>
                             <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">BUILT FOR <br/><span className="text-[#38F8A8]">GROWTH</span></h2>
                             <p className="text-xl text-gray-400">From Online Sellers to LGUs. Orin adapts to your sector.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {GALLERY_IMAGES.map((img, i) => (
                             <MouseTilt key={i} className="glass-card rounded-3xl overflow-hidden group relative aspect-[4/3]">
                                 <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-90"></div>
                                 <div className="absolute bottom-0 left-0 p-8">
                                     <h3 className="text-2xl font-bold mb-2">{img.caption}</h3>
                                     <div className="h-1 w-12 bg-[#38F8A8]"></div>
                                 </div>
                             </MouseTilt>
                         ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-32 px-4 bg-[#0B1120]/50 relative z-10">
                <div className="max-w-7xl mx-auto">
                     <h2 className="text-5xl font-black text-center mb-20"><span className="text-stroke">CORE</span> FEATURES</h2>
                     <div className="grid md:grid-cols-3 gap-8">
                         {FEATURES.map((f, i) => (
                             <MouseTilt key={i} className="glass-card p-8 rounded-3xl hover:bg-[#38F8A8]/5 transition-colors group">
                                 <div className="w-12 h-12 bg-[#38F8A8]/20 rounded-2xl flex items-center justify-center text-[#38F8A8] mb-6 group-hover:scale-110 transition-transform">
                                     <Zap />
                                 </div>
                                 <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                                 <p className="text-gray-400 leading-relaxed">{f.description}</p>
                             </MouseTilt>
                         ))}
                     </div>
                </div>
            </section>

            {/* STATS */}
            <section id="stats" className="py-32 px-4 relative z-10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
                    <div className="glass-card p-8 rounded-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold">Market Growth</h3>
                            <TrendingUp className="text-[#38F8A8]"/>
                        </div>
                        <MarketGrowthChart />
                    </div>
                    <div className="glass-card p-8 rounded-3xl">
                         <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold">ROI Index</h3>
                            <ShieldCheck className="text-[#38F8A8]"/>
                        </div>
                        <ROIChart />
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-32 px-4 relative z-10 flex justify-center text-center">
                <MouseTilt className="glass-card max-w-2xl w-full p-12 rounded-[3rem] border-2 border-[#38F8A8]/20 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#38F8A8] blur-[100px] opacity-20 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1 rounded-full bg-[#38F8A8]/20 text-[#38F8A8] font-bold text-sm mb-6">ALL-IN MONTHLY ACCESS</div>
                        <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4 text-glow">10K</h2>
                        <p className="text-xl text-gray-400 mb-8 font-medium">PHILIPPINE PESO / MONTH</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-left text-sm text-gray-300 mb-10 max-w-md mx-auto">
                            <div className="flex items-center gap-2"><CheckSquare size={16} className="text-[#38F8A8]"/> Auto-Reply (FB/IG/TikTok)</div>
                            <div className="flex items-center gap-2"><CheckSquare size={16} className="text-[#38F8A8]"/> 24/7 Availability</div>
                            <div className="flex items-center gap-2"><CheckSquare size={16} className="text-[#38F8A8]"/> Image Recognition</div>
                            <div className="flex items-center gap-2"><CheckSquare size={16} className="text-[#38F8A8]"/> Multilingual Support</div>
                        </div>
                        
                        <button onClick={() => setChatOpen(true)} className="w-full py-5 bg-[#38F8A8] text-[#0B1120] rounded-2xl font-black text-xl hover:bg-white transition-colors shadow-lg">
                            HIRE ORIN NOW
                        </button>
                    </div>
                </MouseTilt>
            </section>

            {/* TEAM */}
            <section className="py-32 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl font-black text-center mb-20">THE <span className="text-[#38F8A8]">ARCHITECTS</span></h2>
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                        {TEAM.map((m, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-32 h-32 mx-auto rounded-full border-2 border-[#38F8A8]/30 p-1 mb-4 relative overflow-hidden group-hover:border-[#38F8A8] transition-colors">
                                    <img src={m.image} className={`w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-300 ${m.name === 'Marvin' ? 'object-left' : 'object-center'}`} loading="lazy" />
                                </div>
                                <h3 className="font-bold text-lg text-white">{m.name}</h3>
                                <p className="text-[#38F8A8] text-xs font-bold uppercase mb-2">{m.role}</p>
                                {m.name === 'Marvin' && <a href={m.link} target="_blank" className="inline-block text-[10px] border border-white/20 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-colors">Portfolio</a>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/10 relative z-10 bg-[#0B1120]">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full border border-[#38F8A8]/30 overflow-hidden">
                             <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" alt="logo" />
                        </div>
                        <span className="font-bold text-lg">ORIN AI</span>
                    </div>
                    <div className="text-center md:text-right text-gray-500 text-sm">
                        <p>&copy; 2025 Organic Intelligence AI.</p>
                        <p>A Division of OASIS Inc.</p>
                    </div>
                    <div className="flex gap-4">
                        <Facebook className="text-gray-400 hover:text-[#38F8A8] cursor-pointer" size={20}/>
                        <Instagram className="text-gray-400 hover:text-[#38F8A8] cursor-pointer" size={20}/>
                        <Twitter className="text-gray-400 hover:text-[#38F8A8] cursor-pointer" size={20}/>
                    </div>
                </div>
            </footer>

            <FloatingTicker />

            {/* CHAT INTERFACE */}
            <div className={`fixed bottom-0 right-0 md:right-8 z-50 w-full md:w-[380px] transition-transform duration-300 ease-out ${chatOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}>
                <div className="bg-[#1A2035] border border-white/10 rounded-t-3xl shadow-2xl h-[600px] flex flex-col">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0B1120] rounded-t-3xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#38F8A8] flex items-center justify-center overflow-hidden">
                                <img src="https://i.imgur.com/7JAu9YG.png" className="w-full h-full object-cover object-top scale-110" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">ORIN AI</h3>
                                <p className="text-xs text-[#38F8A8] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38F8A8] animate-pulse"></span> Online</p>
                            </div>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.role==='user'?'bg-[#38F8A8] text-[#0B1120] rounded-br-none':'bg-white/10 text-white rounded-bl-none'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                         {isThinking && <div className="text-xs text-gray-500 ml-4">Orin is typing...</div>}
                    </div>
                    <form onSubmit={sendChat} className="p-4 border-t border-white/10 flex gap-2 bg-[#0B1120]">
                        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-[#38F8A8]" />
                        <button type="submit" disabled={!input} className="bg-[#38F8A8] text-[#0B1120] p-3 rounded-full hover:bg-[#2DD4BF] transition-colors"><Send size={18} /></button>
                    </form>
                </div>
            </div>

            {/* FLOATING HIRE BUTTON (Bottom Right, under ticker) */}
            <button
                onClick={() => setChatOpen(true)}
                className={`fixed bottom-6 right-6 z-50 bg-[#38F8A8] text-[#0B1120] px-6 py-3 rounded-full font-black text-lg shadow-[0_0_20px_rgba(56,248,168,0.5)] hover:scale-105 transition-all flex items-center gap-2 ${showFloat && !chatOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
            >
                Hire Orin <ArrowRight size={20} />
            </button>

            {gameOpen && <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"><PacManGame onClose={() => setGameOpen(false)} /></div>}
        </div>
    );
}