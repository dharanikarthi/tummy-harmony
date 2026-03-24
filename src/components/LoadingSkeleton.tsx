export default function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-2xl animate-shimmer"
          style={{
            width: `${90 - i * 15}%`,
            background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--border)) 50%, hsl(var(--muted)) 75%)',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}
