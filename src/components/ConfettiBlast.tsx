import { useEffect, useState } from 'react';

const colors = [
  'hsl(var(--primary))',
  'hsl(var(--good))',
  'hsl(var(--moderate))',
  'hsl(var(--poor))',
  'hsl(174 84% 50%)',
];

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: 'square' | 'circle';
}

export default function ConfettiBlast() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const p: Piece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 1,
      duration: 2 + Math.random() * 2,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    }));
    setPieces(p);
    const t = setTimeout(() => setPieces([]), 4500);
    return () => clearTimeout(t);
  }, []);

  if (!pieces.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confettiFall"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
