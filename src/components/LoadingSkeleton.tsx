export default function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded-2xl animate-pulse"
          style={{ width: `${90 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
