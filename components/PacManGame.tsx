import React, { useEffect, useRef, useState } from 'react';

interface PacManGameProps {
  onClose: () => void;
}

const PacManGame: React.FC<PacManGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver'>('ready');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game Constants
    const TILE_SIZE = 16;
    let animationFrameId: number;
    let powerPelletTimer: number;
    let powerPelletActive = false;

    // Asset Management
    const orinHeadAsset = new Image();
    orinHeadAsset.src = 'https://i.imgur.com/7JAu9YG.png';

    // Simplified Map
    const map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
        [1,3,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,2,1],
        [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,2,1],
        [1,3,2,1,2,2,2,2,1,1,2,2,2,2,1,2,1,3,1],
        [1,1,2,1,2,1,1,2,1,1,2,1,1,2,1,2,1,1,1],
        [1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    class Pacman {
      x: number; y: number; dx: number; dy: number; nextDx: number; nextDy: number;
      constructor(x: number, y: number) { this.x = x; this.y = y; this.dx = 0; this.dy = 0; this.nextDx = 0; this.nextDy = 0; }
      draw() { 
          if(orinHeadAsset.complete) {
            ctx?.drawImage(orinHeadAsset, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE); 
          } else {
            if(ctx) {
                ctx.fillStyle = '#00FF94';
                ctx.beginPath(); ctx.arc(this.x * TILE_SIZE + 8, this.y * TILE_SIZE + 8, 7, 0, Math.PI*2); ctx.fill();
            }
          }
      }
      update() {
        const isAtGridCenter = (Math.abs(this.x % 1) < 0.1) && (Math.abs(this.y % 1) < 0.1);
        if (isAtGridCenter) {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            if (this.canMove(this.nextDx, this.nextDy)) {
                this.dx = this.nextDx; this.dy = this.nextDy;
            } else if (!this.canMove(this.dx, this.dy)) {
                this.dx = 0; this.dy = 0;
            }
        }
        this.x += this.dx * 0.15;
        this.y += this.dy * 0.15;
        
        // Tunnel
        if(this.x < 0) this.x = map[0].length - 1;
        if(this.x >= map[0].length) this.x = 0;

        // Eat
        const tx = Math.round(this.x), ty = Math.round(this.y);
        if (map[ty] && map[ty][tx] === 2) { map[ty][tx] = 0; setScore(s => s + 10); }
        if (map[ty] && map[ty][tx] === 3) { map[ty][tx] = 0; setScore(s => s + 50); activatePower(); }
      }
      canMove(dx: number, dy: number) {
         const nx = Math.round(this.x + dx), ny = Math.round(this.y + dy);
         return map[ny] && map[ny][nx] !== 1;
      }
    }

    const activatePower = () => {
        powerPelletActive = true;
        clearTimeout(powerPelletTimer);
        powerPelletTimer = window.setTimeout(() => { powerPelletActive = false; }, 8000);
    }

    class Ghost {
        x: number; y: number; color: string;
        constructor(x: number, y: number, color: string) { this.x = x; this.y = y; this.color = color; }
        draw() {
            if(!ctx) return;
            ctx.fillStyle = powerPelletActive ? '#3b82f6' : this.color;
            ctx.beginPath(); ctx.arc(this.x * TILE_SIZE + 8, this.y * TILE_SIZE + 8, 7, 0, Math.PI*2); ctx.fill();
        }
        update(target: Pacman) {
            // Very Simple AI
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            if(Math.random() < 0.05) {
                if(Math.abs(dx) > Math.abs(dy)) { this.x += Math.sign(dx) * 0.05; } else { this.y += Math.sign(dy) * 0.05; }
            }
        }
    }

    const pacman = new Pacman(1, 1);
    const ghosts = [new Ghost(9, 8, '#ef4444'), new Ghost(8, 8, '#f9a8d4')];

    const loop = () => {
        if (!ctx) return;
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Map
        for(let y=0; y<map.length; y++) {
            for(let x=0; x<map[y].length; x++) {
                if(map[y][x] === 1) { ctx.fillStyle = '#333'; ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE); }
                if(map[y][x] === 2) { ctx.fillStyle = '#fbbf24'; ctx.fillRect(x*TILE_SIZE + 6, y*TILE_SIZE + 6, 4, 4); }
                if(map[y][x] === 3) { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x*TILE_SIZE+8, y*TILE_SIZE+8, 6, 0, Math.PI*2); ctx.fill(); }
            }
        }

        pacman.update();
        pacman.draw();
        ghosts.forEach(g => { g.update(pacman); g.draw(); });

        // Collision
        ghosts.forEach(g => {
            const dist = Math.hypot(pacman.x - g.x, pacman.y - g.y);
            if(dist < 1) {
                if(powerPelletActive) {
                    g.x = 9; g.y = 8; setScore(s => s + 200);
                } else {
                    setGameState('gameOver');
                    cancelAnimationFrame(animationFrameId);
                }
            }
        });

        if(gameState === 'playing') animationFrameId = requestAnimationFrame(loop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if(e.key === 'ArrowUp') { pacman.nextDx = 0; pacman.nextDy = -1; }
        if(e.key === 'ArrowDown') { pacman.nextDx = 0; pacman.nextDy = 1; }
        if(e.key === 'ArrowLeft') { pacman.nextDx = -1; pacman.nextDy = 0; }
        if(e.key === 'ArrowRight') { pacman.nextDx = 1; pacman.nextDy = 0; }
    };

    window.addEventListener('keydown', handleKeyDown);
    setGameState('playing');
    loop();

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        cancelAnimationFrame(animationFrameId);
        clearTimeout(powerPelletTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative z-50 bg-black border-2 border-primary rounded-none p-4 shadow-[0_0_50px_rgba(34,197,94,0.5)] scale-125">
       <h3 className="text-center text-primary font-black mb-2 text-xl font-mono tracking-widest">ORIN-MAN</h3>
       <div className="text-white text-center mb-2 font-mono">SCORE: {score}</div>
       <canvas ref={canvasRef} width={304} height={256} className="bg-zinc-900 border border-white/10" />
       {gameState === 'gameOver' && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/90 flex-col">
               <p className="text-red-500 font-black text-4xl mb-4 animate-pulse">GAME OVER</p>
               <button onClick={onClose} className="bg-white text-black px-6 py-2 font-bold hover:bg-primary transition-colors uppercase">Close</button>
           </div>
       )}
       <button onClick={onClose} className="absolute -top-8 -right-8 text-white hover:text-red-500 font-black text-2xl transition-colors">CLOSE [X]</button>
       <p className="text-center text-zinc-500 text-xs mt-4 font-mono">ARROWS TO MOVE</p>
    </div>
  );
};

export default PacManGame;