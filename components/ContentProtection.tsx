import React, { useEffect, useState } from 'react';

export const ContentProtection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    
    // Anti-scraping Easter Egg State
    const [showScraperModal, setShowScraperModal] = useState(false);
    const [rightClickCount, setRightClickCount] = useState(0);
    const [copyAttemptCount, setCopyAttemptCount] = useState(0);

    // Reset counters periodically to ensure we only catch rapid attempts (every 5 seconds)
    useEffect(() => {
        const timer = setInterval(() => {
            setRightClickCount(prev => prev > 0 ? 0 : prev);
            setCopyAttemptCount(prev => prev > 0 ? 0 : prev);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // 1. Disable Right Click & Detect Spam
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setRightClickCount(prev => {
                const newCount = prev + 1;
                if (newCount >= 5) {
                    console.warn("Suspicious behavior detected: Rapid right-clicks");
                    setShowScraperModal(true);
                    return 0; // Reset to avoid double triggering
                }
                return newCount;
            });
            return false;
        };

        // 2. Block Common Shortcuts & 5. Screenshot Detection & Copy Spam
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
                (e.ctrlKey && ['U', 'S', 'P'].includes(e.key.toUpperCase()))
            ) {
                e.preventDefault();
                e.stopPropagation();
                
                // Weigh inspection attempts heavier
                setRightClickCount(prev => {
                    const newCount = prev + 2;
                    if (newCount >= 5) setShowScraperModal(true);
                    return newCount;
                });
                return false;
            }

            // Detect Copy Attempts (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                setCopyAttemptCount(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 5) {
                        console.warn("Suspicious behavior detected: Rapid copy attempts");
                        setShowScraperModal(true);
                        return 0;
                    }
                    return newCount;
                });
            }

            // Detect PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                // Obfuscate screen immediately
                document.body.style.filter = 'brightness(0)';
                // Clear clipboard
                navigator.clipboard.writeText('');
                // Restore after delay
                setTimeout(() => {
                    document.body.style.filter = 'none';
                    alert('Screenshots are disabled for security.');
                }, 300);
            }
        };

        // 6. Disable Drag and Drop
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // 3. Detect DevTools (Debugger Trap)
        // Optimization: Increased interval from 1000ms to 4000ms to reduce main thread blocking
        /*
        const devToolsCheck = setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if ((widthThreshold || heightThreshold) && (window as any).Firebug && (window as any).Firebug.chrome && (window as any).Firebug.chrome.isInitialized) {
                setIsDevToolsOpen(true);
            }
            
            // The "Debugger Trap" - Freezes the UI if inspection is attempted
            const before = new Date().getTime();
            // eslint-disable-next-line no-debugger
            debugger; 
            const after = new Date().getTime();
            if (after - before > 100) {
                // If execution paused (due to debugger), DevTools is likely open
                setIsDevToolsOpen(true);
            }
        }, 4000);
        */

        // Attach Listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDragStart);
        
        // Prevent selection via JS as fallback to CSS
        document.onselectstart = () => false;

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDragStart);
            document.onselectstart = null;
            // clearInterval(devToolsCheck);
        };
    }, []);

    if (isDevToolsOpen) {
        return (
            <div className="fixed inset-0 bg-black z-[99999] flex items-center justify-center text-center p-8 text-red-500 font-mono">
                <div>
                    <h1 className="text-4xl font-black mb-4">SECURITY ALERT</h1>
                    <p>Developer Tools access is restricted.</p>
                    <p className="text-sm mt-4 text-gray-500">Orin AI Protocol initiated.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-8 bg-red-500 text-black px-6 py-2 rounded font-bold hover:bg-red-400"
                    >
                        Reload Site
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            {children}
            
            {/* 7. Watermark Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden opacity-[0.03] flex flex-wrap content-start justify-start select-none mix-blend-overlay">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="w-64 h-32 flex items-center justify-center transform -rotate-45 text-white font-black text-xs whitespace-nowrap">
                        ORIN AI • PROTECTED
                    </div>
                ))}
            </div>
            
            {/* Flash Overlay for Screenshots */}
            <div id="screenshot-guard" className="fixed inset-0 bg-black opacity-0 pointer-events-none z-[10000] transition-opacity duration-200"></div>

            {/* Anti-Scraping Easter Egg Modal */}
            {showScraperModal && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300 px-4">
                    <div className="bg-[#111] border-2 border-[#38F8A8] p-8 md:p-12 rounded-[2rem] max-w-lg w-full text-center shadow-[0_0_100px_rgba(56,248,168,0.3)] relative overflow-hidden group">
                        
                        {/* Background Glitch Effect */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzOEY4QTgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIwVjIwek0xMCAxMGgyMHYyMEgxMFYxMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="text-7xl mb-6 animate-bounce">👀</div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-grotesk tracking-tighter drop-shadow-lg leading-none">
                                CAUGHT YOU<br/><span className="text-[#38F8A8]">RED-HANDED!</span>
                            </h2>
                            <p className="text-gray-300 mb-8 font-mono text-sm md:text-base leading-relaxed">
                                Trying to hack or scrape my site? <br/>
                                Why struggle with the code when you can just hire the architect? 😎
                            </p>
                            
                            <div className="flex flex-col gap-4">
                                <a 
                                    href="https://marvin.orin.work" 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#38F8A8] text-black font-black py-4 px-8 rounded-full hover:scale-105 transition-transform font-grotesk uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,248,168,0.5)] text-sm md:text-base"
                                >
                                    Take Me to Marvin's Portfolio 🚀
                                </a>
                                <button 
                                    onClick={() => {
                                        setShowScraperModal(false);
                                        setRightClickCount(0);
                                        setCopyAttemptCount(0);
                                    }}
                                    className="bg-white/5 border border-white/10 text-gray-400 font-bold py-3 px-6 rounded-full hover:bg-white/10 hover:text-white transition-all font-mono text-xs uppercase tracking-widest"
                                >
                                    I Promise to Behave 😇
                                </button>
                            </div>
                            
                            <div className="mt-8 text-[10px] text-gray-600 font-mono">
                                SECURITY PROTOCOL: DETECTED_RAPID_INTERACTION
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};