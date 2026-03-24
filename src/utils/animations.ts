export const staggerDelay = (index: number, base = 100) => ({
  animationDelay: `${index * base}ms`,
  animationFillMode: 'both' as const,
  opacity: 0,
});
