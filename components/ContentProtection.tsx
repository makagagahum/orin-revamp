import React, { useEffect, useState } from 'react';

export const ContentProtection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

    useEffect(() => {
        // 1. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // 2. Block Common Shortcuts & 5. Screenshot Detection
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
                (e.ctrlKey && ['U', 'S', 'P'].includes(e.key.toUpperCase()))
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
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
        </div>
    );
};