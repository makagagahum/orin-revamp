import React, { useEffect, useRef, useState } from 'react';
import { X, Trophy, RefreshCw, Copy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const LEVEL_CONFIGS = [
    { speed: 0.8, ghostSpeed: 0.6, name: "INITIATION" },
    { speed: 0.9, ghostSpeed: 0.75, name: "ACCELERATION" },
    { speed: 1.0, ghostSpeed: 0.85, name: "COORDINATION" },
    { speed: 1.1, ghostSpeed: 0.95, name: "HYPERDRIVE" },
    { speed: 1.2, ghostSpeed: 1.1, name: "INSANE MODE" }
];

// 1 = Wall, 0 = Dot, 2 = Power Pellet, 3 = Empty/Path
// Custom Map vaguely spelling ORIN
const MAP_LAYOUT = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,2,1,1], // Top
    [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1], // O R I N shape attempt
    [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,1],
    [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1],
    [1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,1,1], // Ghost house entry
    [1,1,1,1,0,1,1,1,3,3,3,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const GHOSTS = [
    { type: 'chatgpt', color: '#10a37f', name: 'GPT', startX: 9, startY: 8 },
    { type: 'claude', color: '#d97757', name: 'Claude', startX: 8, startY: 9 },
    { type: 'gemini', color: '#4285F4', name: 'Gemini', startX: 10, startY: 9 },
    { type: 'copilot', color: '#6f42c1', name: 'Copilot', startX: 9, startY: 9 }
];

export const PacManGame = ({ onClose }: { onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState<'playing' | 'gameover' | 'won'>('playing');
    const [debugMsg, setDebugMsg] = useState('');

    // Game State Refs
    const reqRef = useRef<number>(0);
    const pacmanRef = useRef({ x: 9, y: 15, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouthOpen: 0, mouthSpeed: 0.2, angle: 0 });
    const ghostsRef = useRef(GHOSTS.map(g => ({ ...g, x: g.startX, y: g.startY, dx: 0, dy: 0, mode: 'chase' as 'chase'|'scared', scaredTimer: 0 })));
    const mapRef = useRef<number[][]>(JSON.parse(JSON.stringify(MAP_LAYOUT)));
    const touchStartRef = useRef<{x: number, y: number} | null>(null);

    // Initial Setup
    useEffect(() => {
        resetLevel(1);
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    const resetLevel = (lvl: number) => {
        const grid = JSON.parse(JSON.stringify(MAP_LAYOUT));
        mapRef.current = grid;
        pacmanRef.current = { x: 9, y: 15, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouthOpen: 0, mouthSpeed: 0.2, angle: 0 };
        ghostsRef.current = GHOSTS.map(g => ({ ...g, x: g.startX, y: g.startY, dx: (Math.random() > 0.5 ? 1 : -1) * 0.05, dy: 0, mode: 'chase', scaredTimer: 0 }));
        setLevel(lvl);
        setGameState('playing');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const p = pacmanRef.current;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
        if (e.key === 'ArrowUp') { p.nextDx = 0; p.nextDy = -1; }
        if (e.key === 'ArrowDown') { p.nextDx = 0; p.nextDy = 1; }
        if (e.key === 'ArrowLeft') { p.nextDx = -1; p.nextDy = 0; }
        if (e.key === 'ArrowRight') { p.nextDx = 1; p.nextDy = 0; }
        if (e.key === 'Escape') onClose();
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!touchStartRef.current) return;
        e.preventDefault(); // Prevent scrolling
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;
        
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            const p = pacmanRef.current;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) { p.nextDx = 1; p.nextDy = 0; }
                else { p.nextDx = -1; p.nextDy = 0; }
            } else {
                if (dy > 0) { p.nextDx = 0; p.nextDy = 1; }
                else { p.nextDx = 0; p.nextDy = -1; }
            }
            touchStartRef.current = null; // Reset to prevent jitter
        }
    };

    const startGameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            // Loop control is handled by useEffect cleanup

            const TILE = canvas.width / 19;
            const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
            const speed = 0.12 * config.speed;
            
            ctx.fillStyle = '#020202';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Map
            let dotsRemaining = 0;
            for (let y = 0; y < mapRef.current.length; y++) {
                for (let x = 0; x < mapRef.current[y].length; x++) {
                    const tile = mapRef.current[y][x];
                    if (tile === 1) {
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
                        ctx.strokeStyle = '#38F8A8';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
                    } else if (tile === 0) {
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(x * TILE + TILE/2 - 2, y * TILE + TILE/2 - 2, 4, 4);
                        dotsRemaining++;
                    } else if (tile === 2) {
                        ctx.fillStyle = '#D4AF37';
                        ctx.beginPath();
                        ctx.arc(x * TILE + TILE/2, y * TILE + TILE/2, 6, 0, Math.PI * 2);
                        ctx.fill();
                        dotsRemaining++;
                    }
                }
            }

            // Check Win Condition
            if (dotsRemaining === 0) {
                if (level < 5) {
                    resetLevel(level + 1);
                    setDebugMsg(`LEVEL ${level + 1}`);
                } else {
                    setGameState('won');
                }
            }

            // 2. Update Pacman
            const p = pacmanRef.current;
            
            // Try to turn
            if (p.nextDx !== 0 || p.nextDy !== 0) {
                const nextTileX = Math.round(p.x + p.nextDx);
                const nextTileY = Math.round(p.y + p.nextDy);
                // Allow cornering margin
                const distToCenter = Math.sqrt(Math.pow(p.x - Math.round(p.x), 2) + Math.pow(p.y - Math.round(p.y), 2));
                
                if (distToCenter < 0.2 && mapRef.current[nextTileY] && mapRef.current[nextTileY][nextTileX] !== 1) {
                    p.x = Math.round(p.x);
                    p.y = Math.round(p.y);
                    p.dx = p.nextDx;
                    p.dy = p.nextDy;
                    p.nextDx = 0; p.nextDy = 0;
                    
                    // Update angle for drawing
                    if (p.dx === 1) p.angle = 0;
                    if (p.dx === -1) p.angle = Math.PI;
                    if (p.dy === -1) p.angle = -Math.PI/2;
                    if (p.dy === 1) p.angle = Math.PI/2;
                }
            }

            // Move
            const nextX = p.x + p.dx * speed;
            const nextY = p.y + p.dy * speed;
            
            // Check wall collision
            const checkTileX = Math.round(nextX + p.dx * 0.4);
            const checkTileY = Math.round(nextY + p.dy * 0.4);
            
            if (mapRef.current[checkTileY] && mapRef.current[checkTileY][checkTileX] !== 1) {
                p.x = nextX;
                p.y = nextY;
            } else {
                // Hit wall - align to grid
                p.x = Math.round(p.x);
                p.y = Math.round(p.y);
            }

            // Wrap around
            if (p.x < 0) p.x = 18;
            if (p.x > 18) p.x = 0;

            // Eat Dot
            const tileX = Math.round(p.x);
            const tileY = Math.round(p.y);
            if (mapRef.current[tileY] && mapRef.current[tileY][tileX] === 0) {
                mapRef.current[tileY][tileX] = 3;
                setScore(s => s + 10);
            }
            if (mapRef.current[tileY] && mapRef.current[tileY][tileX] === 2) {
                mapRef.current[tileY][tileX] = 3;
                setScore(s => s + 50);
                // Scare ghosts
                ghostsRef.current.forEach(g => { g.mode = 'scared'; g.scaredTimer = 500; });
            }

            // Draw Pacman (Avatar style)
            p.mouthOpen += p.mouthSpeed;
            if (p.mouthOpen > 0.25 || p.mouthOpen < 0) p.mouthSpeed = -p.mouthSpeed;
            
            ctx.save();
            ctx.translate(p.x * TILE + TILE/2, p.y * TILE + TILE/2);
            ctx.rotate(p.angle);
            
            // Yellow body
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, TILE/2 - 2, 0.2 * Math.PI * (p.mouthOpen * 4), 1.8 * Math.PI * (1 - p.mouthOpen/2));
            ctx.lineTo(0,0);
            ctx.fill();
            
            // Orin Eye (Black with green pupil)
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0, -TILE/4, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 3. Update Ghosts
            ghostsRef.current.forEach((g, i) => {
                if (g.scaredTimer > 0) g.scaredTimer--;
                if (g.scaredTimer === 0 && g.mode === 'scared') g.mode = 'chase';

                // Ghost Move Logic
                const gSpeed = (g.mode === 'scared' ? 0.05 : 0.08 * config.ghostSpeed);
                const gxInt = Math.round(g.x);
                const gyInt = Math.round(g.y);
                
                // Only change direction at center of tiles
                if (Math.abs(g.x - gxInt) < 0.1 && Math.abs(g.y - gyInt) < 0.1) {
                    g.x = gxInt; g.y = gyInt;
                    
                    // Determine Target
                    let tx = p.x;
                    let ty = p.y;
                    
                    if (g.mode === 'scared') {
                        tx = Math.random() * 19; ty = Math.random() * 21; // Random panic
                    } else if (level >= 5 && Math.random() < 0.01) {
                         // Teleport Logic (Insane Mode)
                         g.x = Math.floor(Math.random() * 19);
                         g.y = Math.floor(Math.random() * 19);
                         // Ensure not in wall
                         while(mapRef.current[Math.floor(g.y)][Math.floor(g.x)] === 1) {
                             g.x = Math.floor(Math.random() * 19);
                             g.y = Math.floor(Math.random() * 19);
                         }
                    } else {
                        // AI Personality
                        if (g.type === 'claude') { tx = p.x + p.dx * 4; ty = p.y + p.dy * 4; } // Ambush
                        if (g.type === 'gemini') { tx = p.x - p.dx * 2; ty = p.y - p.dy * 2; } // Flank (simplified)
                        if (g.type === 'copilot' && Math.random() > 0.7) { tx = Math.random() * 19; ty = Math.random() * 21; } // Erratic
                    }

                    // Get Valid Moves
                    const moves = [
                        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
                    ].filter(m => {
                        // Can't reverse immediately unless trapped
                        if (m.dx === -g.dx && m.dy === -g.dy) return false;
                        const ny = Math.round(g.y + m.dy);
                        const nx = Math.round(g.x + m.dx);
                        return mapRef.current[ny] && mapRef.current[ny][nx] !== 1;
                    });

                    // Sort moves by distance to target
                    if (moves.length > 0) {
                        moves.sort((a, b) => {
                            const d1 = Math.pow((g.x + a.dx) - tx, 2) + Math.pow((g.y + a.dy) - ty, 2);
                            const d2 = Math.pow((g.x + b.dx) - tx, 2) + Math.pow((g.y + b.dy) - ty, 2);
                            return d1 - d2;
                        });
                        g.dx = moves[0].dx;
                        g.dy = moves[0].dy;
                    } else {
                        // Dead end, reverse
                         g.dx = -g.dx; g.dy = -g.dy;
                    }
                }

                g.x += g.dx * gSpeed;
                g.y += g.dy * gSpeed;

                // Draw Ghost
                ctx.fillStyle = g.mode === 'scared' ? '#0000FF' : g.color;
                ctx.beginPath();
                const gx = g.x * TILE + TILE/2;
                const gy = g.y * TILE + TILE/2;
                ctx.arc(gx, gy - 2, TILE/2 - 2, Math.PI, 0);
                ctx.lineTo(gx + TILE/2 - 2, gy + TILE/2);
                ctx.lineTo(gx - TILE/2 + 2, gy + TILE/2);
                ctx.fill();
                
                // Eyes
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(gx - 4, gy - 4, 3, 0, Math.PI * 2);
                ctx.arc(gx + 4, gy - 4, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(gx - 4 + g.dx*2, gy - 4 + g.dy*2, 1.5, 0, Math.PI * 2);
                ctx.arc(gx + 4 + g.dx*2, gy - 4 + g.dy*2, 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Collision
                const dist = Math.sqrt(Math.pow(p.x - g.x, 2) + Math.pow(p.y - g.y, 2));
                if (dist < 0.6) {
                    if (g.mode === 'scared') {
                        // Eat Ghost
                        g.x = g.startX; g.y = g.startY; g.mode = 'chase';
                        setScore(s => s + 200);
                    } else {
                        // Die
                        setLives(l => {
                            if (l <= 1) {
                                setGameState('gameover');
                                return 0;
                            }
                            // Reset positions
                            pacmanRef.current.x = 9; pacmanRef.current.y = 15;
                            ghostsRef.current.forEach(gh => { gh.x = gh.startX; gh.y = gh.startY; });
                            return l - 1;
                        });
                    }
                }
            });

            reqRef.current = requestAnimationFrame(update);
        };
        
        reqRef.current = requestAnimationFrame(update);
    };

    // Effect to manage loop starting/stopping based on state
    useEffect(() => {
        if (gameState === 'playing') {
            startGameLoop();
        }
        return () => {
            cancelAnimationFrame(reqRef.current);
        };
    }, [gameState, level]);

    return (
        <div className="relative w-full max-w-lg mx-auto bg-black border-4 border-[#38F8A8] p-4 rounded-3xl shadow-[0_0_50px_rgba(56,248,168,0.5)] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 font-mono text-[#38F8A8]">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">SCORE</span>
                    <span className="text-xl font-bold">{score}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">LEVEL</span>
                    <span className="text-xl font-bold text-white">{LEVEL_CONFIGS[level-1].name}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">LIVES</span>
                    <div className="flex gap-1">
                        {Array.from({length: lives}).map((_,i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-yellow-400"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="relative aspect-[19/21] w-full bg-[#111] rounded-xl overflow-hidden border border-white/10">
                <canvas 
                    ref={canvasRef} 
                    width={380} 
                    height={420} 
                    className="w-full h-full object-contain"
                />
                
                {gameState === 'gameover' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm animate-in fade-in">
                        <h2 className="text-4xl font-black text-red-500 mb-2 font-grotesk">GAME OVER</h2>
                        <p className="text-gray-400 mb-6 font-mono text-sm">The AI Ghosts were too smart for you.</p>
                        <button onClick={() => resetLevel(1)} className="flex items-center gap-2 bg-[#38F8A8] text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform">
                            <RefreshCw className="w-5 h-5" /> TRY AGAIN
                        </button>
                    </div>
                )}
                
                {gameState === 'won' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-[#38F8A8]/20 flex flex-col items-center justify-center text-center p-4 backdrop-blur-md animate-in zoom-in duration-500">
                        <Trophy className="w-16 h-16 text-[#D4AF37] mb-4 animate-bounce" />
                        <h2 className="text-3xl font-black text-white mb-2 font-grotesk">LEGENDARY!</h2>
                        <p className="text-[#38F8A8] font-bold mb-4 font-grotesk tracking-widest">YOU CONQUERED ORIN'S MAZE</p>
                        
                        <div className="bg-white/10 border border-[#38F8A8] p-4 rounded-xl w-full max-w-xs mb-4">
                            <p className="text-xs text-gray-400 uppercase mb-1">Exclusive Reward</p>
                            <div className="flex items-center justify-between bg-black/50 p-2 rounded-lg">
                                <code className="text-[#D4AF37] font-mono text-xl font-bold">ORINAI420</code>
                                <button onClick={() => navigator.clipboard.writeText('ORINAI420')} className="p-2 hover:bg-white/10 rounded">
                                    <Copy className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <p className="text-xs text-[#38F8A8] mt-2">30% OFF YOUR SUBSCRIPTION</p>
                        </div>
                        
                        <button onClick={onClose} className="w-full max-w-xs bg-[#D4AF37] text-black font-black py-3 rounded-full hover:bg-white transition-colors">
                            CLAIM REWARD NOW
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Controls Hint */}
            <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <div className="flex gap-2">
                    <span className="hidden md:inline">ARROWS TO MOVE</span>
                    <span className="md:hidden">SWIPE TO MOVE</span>
                </div>
                <button onClick={onClose} className="text-white hover:text-red-500 flex items-center gap-1">
                    <X className="w-4 h-4" /> EXIT
                </button>
            </div>
            
            {/* D-Pad for easier mobile play (Optional but helpful) */}
            <div className="md:hidden grid grid-cols-3 gap-2 max-w-[150px] mx-auto mt-4 opacity-50">
                <div></div>
                <button onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}))} className="bg-white/10 p-2 rounded"><ArrowUp className="w-6 h-6 text-white" /></button>
                <div></div>
                <button onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}))} className="bg-white/10 p-2 rounded"><ArrowLeft className="w-6 h-6 text-white" /></button>
                <button onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))} className="bg-white/10 p-2 rounded"><ArrowDown className="w-6 h-6 text-white" /></button>
                <button onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}))} className="bg-white/10 p-2 rounded"><ArrowRight className="w-6 h-6 text-white" /></button>
            </div>
        </div>
    );
};

export default PacManGame;