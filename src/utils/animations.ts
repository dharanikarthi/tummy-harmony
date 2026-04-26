export const staggerDelay = (index: number, base = 100): React.CSSProperties => ({
  animationDelay: `${index * base}ms`,
});
