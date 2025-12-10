import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Play, Loader2, Video, AlertCircle, Film, Sparkles } from 'lucide-react';

export const VideoPromo = () => {
    const [loading, setLoading] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const generateVideo = async () => {
        setError('');
        setLoading(true);
        setStatus('INITIALIZING VEO-3.1 NEURAL ENGINE...');

        try {
            // Veo models require a paid API key. We must check/request it.
            // @ts-ignore - window.aistudio is injected by the environment
            if (window.aistudio && window.aistudio.hasSelectedApiKey) {
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    setStatus('WAITING FOR API KEY AUTHORIZATION...');
                    // @ts-ignore
                    await window.aistudio.openSelectKey();
                }
            }

            // Instantiate client with the key (which might have just been selected)
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            setStatus('DREAMING UP CINEMATIC CONCEPT...');
            
            // Call the Veo model
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: 'Cinematic commercial for ORIN AI. A futuristic holographic AI assistant interface, glowing green neon data streams, dark cyberpunk office background. Text overlay "ORIN AI", "24/7 EMPLOYEE". High tech, glitch effects, professional 4k resolution, unreal engine 5 render style.',
                config: {
                    numberOfVideos: 1,
                    resolution: '1080p',
                    aspectRatio: '16:9'
                }
            });

            setStatus('RENDERING FRAMES (THIS TAKES ~60s)...');
            
            // Polling loop for the long-running operation
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({operation: operation});
                setStatus(prev => prev === 'RENDERING FRAMES (THIS TAKES ~60s)...' ? 'COMPILING NEURAL PATHWAYS...' : 'RENDERING FRAMES (THIS TAKES ~60s)...');
            }

            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const uri = operation.response.generatedVideos[0].video.uri;
                // Append API key to fetch the binary content
                const fetchUrl = `${uri}&key=${process.env.API_KEY}`;
                
                setStatus('DOWNLOADING FINAL ASSET...');
                const vidRes = await fetch(fetchUrl);
                const blob = await vidRes.blob();
                const blobUrl = URL.createObjectURL(blob);
                setVideoUri(blobUrl);
            } else {
                throw new Error("Video generation completed but no URI returned.");
            }

        } catch (e: any) {
            console.error(e);
            // Handle specific error for missing key
            // @ts-ignore
            if (e.message?.includes('Requested entity was not found') && window.aistudio) {
                 setStatus('API KEY INVALID. RETRYING...');
                 // @ts-ignore
                 await window.aistudio.openSelectKey();
                 setError("Please select a valid paid API key to generate video.");
            } else {
                 setError(e.message || "Neural Render Failed");
            }
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <section id="demo" className="py-20 px-4 max-w-7xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden border border-[#38F8A8]/30 bg-black shadow-[0_0_100px_rgba(56,248,168,0.1)]">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(56,248,168,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,248,168,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                <div className="relative z-10 grid md:grid-cols-2 gap-12 p-8 md:p-16 items-center">
                    
                    {/* Text Side */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38F8A8]/10 text-[#38F8A8] text-[10px] font-black uppercase tracking-widest border border-[#38F8A8]/20 mb-6 font-mono">
                            <Film className="w-3 h-3" /> Powered by Veo 3.1
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-grotesk tracking-tighter leading-none">
                            GENERATE <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38F8A8] to-emerald-500">NEURAL ADS.</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 font-grotesk leading-relaxed">
                            Need a promo video? Orin can dream one up in 60 seconds. 
                            Uses Google's cutting-edge <b>Veo</b> model to render 1080p cinematic footage on the fly.
                        </p>

                        {!videoUri && !loading && (
                            <button 
                                onClick={generateVideo}
                                className="group relative px-8 py-4 bg-white text-black font-black text-lg flex items-center gap-3 font-grotesk rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                            >
                                <Sparkles className="w-5 h-5 text-[#38F8A8]" /> GENERATE AD
                            </button>
                        )}

                        {loading && (
                            <div className="flex items-center gap-4 text-[#38F8A8] font-mono text-sm animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {status}
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-400 text-sm font-mono">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Video Side */}
                    <div className="relative aspect-video bg-black/50 rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center group">
                        {videoUri ? (
                            <video 
                                src={videoUri} 
                                controls 
                                autoPlay 
                                loop 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-[#38F8A8] transition-colors">
                                    <Video className="w-8 h-8 text-gray-500 group-hover:text-[#38F8A8] transition-colors" />
                                </div>
                                <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">
                                    {loading ? 'NEURAL ENGINE ACTIVE' : 'NO VIDEO GENERATED'}
                                </p>
                            </div>
                        )}

                        {/* Decor */}
                        <div className="absolute top-4 left-4 w-2 h-2 bg-[#38F8A8] rounded-full animate-pulse"></div>
                        <div className="absolute top-4 right-4 text-[10px] text-gray-600 font-mono">REC ●</div>
                    </div>
                </div>
            </div>
        </section>
    );
};