import { useEffect, useState } from 'react';

interface Props {
  rating: 'good' | 'moderate' | 'poor';
}

const ratingConfig = {
  poor: { angle: -70, label: 'AVOID THIS FOOD', colorClass: 'text-poor' },
  moderate: { angle: 0, label: 'EAT IN MODERATION', colorClass: 'text-moderate' },
  good: { angle: 70, label: 'GREAT CHOICE!', colorClass: 'text-good' },
};

export default function DangerMeter({ rating }: Props) {
  const [animatedAngle, setAnimatedAngle] = useState(-90);
  const [arcVisible, setArcVisible] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);

  const config = ratingConfig[rating];

  useEffect(() => {
    const t1 = setTimeout(() => setArcVisible(true), 50);
    const t2 = setTimeout(() => setAnimatedAngle(config.angle), 200);
    const t3 = setTimeout(() => setLabelVisible(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [config.angle]);

  // Arc math: center (100,100), radius 80, semi-circle from 180deg to 0deg
  const r = 80;
  const cx = 100;
  const cy = 100;

  const arcPath = (startDeg: number, endDeg: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const fullArcLength = Math.PI * r; // ~251
  const zoneLength = fullArcLength / 3;

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d={arcPath(180, 0)}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={16}
          strokeLinecap="round"
        />

        {/* Poor zone (left third: 180 to 120) */}
        <path
          d={arcPath(180, 120)}
          fill="none"
          stroke="hsl(var(--poor))"
          strokeWidth={16}
          strokeLinecap="butt"
          strokeDasharray={`${zoneLength} ${fullArcLength}`}
          strokeDashoffset={arcVisible ? 0 : zoneLength}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />

        {/* Moderate zone (middle: 120 to 60) */}
        <path
          d={arcPath(120, 60)}
          fill="none"
          stroke="hsl(var(--moderate))"
          strokeWidth={16}
          strokeLinecap="butt"
          strokeDasharray={`${zoneLength} ${fullArcLength}`}
          strokeDashoffset={arcVisible ? 0 : zoneLength}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out 0.15s' }}
        />

        {/* Good zone (right: 60 to 0) */}
        <path
          d={arcPath(60, 0)}
          fill="none"
          stroke="hsl(var(--good))"
          strokeWidth={16}
          strokeLinecap="butt"
          strokeDasharray={`${zoneLength} ${fullArcLength}`}
          strokeDashoffset={arcVisible ? 0 : zoneLength}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out 0.3s' }}
        />

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${animatedAngle}deg)`,
            transformOrigin: '100px 100px',
            transition: 'transform 1s ease-out',
          }}
        >
          <line
            x1={100}
            y1={100}
            x2={100}
            y2={30}
            stroke="hsl(var(--foreground))"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>

        {/* Center pivot */}
        <circle cx={100} cy={100} r={5} fill="hsl(var(--foreground))" />

        {/* Labels */}
        <text x={18} y={115} className="fill-poor text-[8px] font-medium">Avoid</text>
        <text x={82} y={18} className="fill-moderate text-[8px] font-medium">Moderate</text>
        <text x={160} y={115} className="fill-good text-[8px] font-medium">Good</text>
      </svg>

      <p
        className={`text-xl font-bold mt-1 transition-opacity duration-400 ${config.colorClass} ${labelVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {config.label}
      </p>
    </div>
  );
}
