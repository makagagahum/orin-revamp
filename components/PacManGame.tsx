import React, { useEffect, useRef, useState } from 'react';

const PacManGame = ({ onClose }: { onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const TILE = 20;
        let frameId: number;
        let pacman = { x: 1, y: 1, dx: 0, dy: 0 };
        const map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,1,2,2,2,1,2,2,2,2,1],
            [1,2,1,1,2,1,2,1,2,1,2,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
            [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        const update = () => {
            ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    if (map[y][x] === 1) {
                        ctx.fillStyle = '#222'; ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
                        ctx.strokeStyle = '#38F8A8'; ctx.lineWidth = 1; ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
                    } else if (map[y][x] === 2) {
                        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x * TILE + 8, y * TILE + 8, 4, 4);
                    }
                }
            }
            const nextX = pacman.x + pacman.dx * 0.15;
            const nextY = pacman.y + pacman.dy * 0.15;
            const tileX = Math.round(nextX);
            const tileY = Math.round(nextY);
            if (map[tileY] && map[tileY][tileX] !== 1) {
                pacman.x = nextX; pacman.y = nextY;
                if (map[tileY][tileX] === 2) { map[tileY][tileX] = 0; setScore(s => s + 10); }
            }
            ctx.fillStyle = '#38F8A8'; ctx.beginPath();
            ctx.arc(pacman.x * TILE + TILE/2, pacman.y * TILE + TILE/2, 8, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.lineTo(pacman.x * TILE + TILE/2, pacman.y * TILE + TILE/2); ctx.fill();
            frameId = requestAnimationFrame(update);
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') { pacman.dx = 0; pacman.dy = -1; }
            if (e.key === 'ArrowDown') { pacman.dx = 0; pacman.dy = 1; }
            if (e.key === 'ArrowLeft') { pacman.dx = -1; pacman.dy = 0; }
            if (e.key === 'ArrowRight') { pacman.dx = 1; pacman.dy = 0; }
        };
        window.addEventListener('keydown', handleKey);
        update();
        return () => { window.removeEventListener('keydown', handleKey); cancelAnimationFrame(frameId); };
    }, []);

    return (
        <div className="bg-black border-2 border-[#38F8A8] p-6 rounded-xl max-w-md w-full relative shadow-[0_0_50px_rgba(56,248,168,0.3)]">
            <h3 className="text-[#38F8A8] font-black text-center text-xl mb-4 tracking-widest">ORIN PROTOCOL</h3>
            <div className="flex justify-center mb-4"><canvas ref={canvasRef} width={300} height={140} className="bg-zinc-900 rounded" /></div>
            <div className="text-center font-mono text-white mb-4">SCORE: {score}</div>
            <button onClick={onClose} className="w-full bg-white text-black font-bold py-2 hover:bg-[#38F8A8] transition-colors uppercase">Close Simulation</button>
        </div>
    );
};

export default PacManGame;
