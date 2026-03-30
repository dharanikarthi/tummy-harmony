export const mockHistory = [
  { id: 1, foodName: 'Idli', rating: 'good' as const, date: 'Today, 8:30 AM', reason: 'Soft and low-acid, gentle on stomach lining.', tip: 'Best eaten with sambar for added nutrients.' },
  { id: 2, foodName: 'Coffee', rating: 'poor' as const, date: 'Today, 9:00 AM', reason: 'Increases acid production, worsens ulcer pain.', tip: 'Switch to ginger tea as a morning drink.' },
  { id: 3, foodName: 'Curd Rice', rating: 'good' as const, date: 'Yesterday, 1:00 PM', reason: 'Probiotic-rich and cooling for inflamed gut.', tip: 'Add cucumber for extra gut-soothing effect.' },
  { id: 4, foodName: 'Biryani', rating: 'moderate' as const, date: 'Yesterday, 2:30 PM', reason: 'Spicy and oily — eat a small portion only.', tip: 'Follow with buttermilk to ease digestion.' },
  { id: 5, foodName: 'Banana', rating: 'good' as const, date: '2 days ago', reason: 'Natural antacid, coats stomach lining.', tip: 'Have one before meals for best protection.' },
  { id: 6, foodName: 'Samosa', rating: 'poor' as const, date: '2 days ago', reason: 'Deep fried and heavy — irritates stomach.', tip: 'Try baked alternatives for a safer snack.' },
  { id: 7, foodName: 'Oats', rating: 'good' as const, date: '3 days ago', reason: 'High fiber, absorbs excess stomach acid.', tip: 'Add banana slices for extra gut benefits.' },
  { id: 8, foodName: 'Pizza', rating: 'poor' as const, date: '3 days ago', reason: 'Cheese and sauce increase acid reflux risk.', tip: 'If craving, try a plain cheese toast instead.' },
  { id: 9, foodName: 'Dosa', rating: 'moderate' as const, date: '4 days ago', reason: 'Fermented batter may cause bloating for some.', tip: 'Opt for plain dosa over masala dosa.' },
  { id: 10, foodName: 'Khichdi', rating: 'good' as const, date: '4 days ago', reason: 'Light and easy to digest, soothes the gut.', tip: 'Add a spoon of ghee for better absorption.' },
  { id: 11, foodName: 'Chai', rating: 'moderate' as const, date: '5 days ago', reason: 'Caffeine and milk can trigger acid reflux.', tip: 'Try herbal tea or limit to one cup daily.' },
  { id: 12, foodName: 'Poha', rating: 'good' as const, date: '5 days ago', reason: 'Flattened rice is light and easy on the stomach.', tip: 'Add peanuts for protein and squeeze lemon.' },
];

export const weekData = [
  { day: 'Mon', good: 3, moderate: 1, poor: 0 },
  { day: 'Tue', good: 2, moderate: 2, poor: 1 },
  { day: 'Wed', good: 4, moderate: 0, poor: 0 },
  { day: 'Thu', good: 1, moderate: 3, poor: 2 },
  { day: 'Fri', good: 3, moderate: 1, poor: 1 },
  { day: 'Sat', good: 2, moderate: 2, poor: 0 },
  { day: 'Sun', good: 5, moderate: 0, poor: 0 },
];

export const monthlyTrend = [
  { week: 'Week 1', score: 5.2 },
  { week: 'Week 2', score: 6.1 },
  { week: 'Week 3', score: 6.8 },
  { week: 'Week 4', score: 7.4 },
];

export const nutrientData = [
  { name: 'Fiber', value: 72, color: 'hsl(var(--good))' },
  { name: 'Protein', value: 58, color: 'hsl(var(--primary))' },
  { name: 'Probiotics', value: 85, color: 'hsl(var(--moderate))' },
  { name: 'Vitamins', value: 64, color: 'hsl(var(--good))' },
];

export const mealTimeData = [
  { time: 'Breakfast', good: 8, moderate: 2, poor: 1 },
  { time: 'Lunch', good: 5, moderate: 4, poor: 2 },
  { time: 'Snacks', good: 3, moderate: 3, poor: 4 },
  { time: 'Dinner', good: 6, moderate: 3, poor: 1 },
];

export const gutScoreHistory = [
  { date: 'Mon', score: 6 },
  { date: 'Tue', score: 5 },
  { date: 'Wed', score: 8 },
  { date: 'Thu', score: 4 },
  { date: 'Fri', score: 7 },
  { date: 'Sat', score: 6 },
  { date: 'Sun', score: 9 },
];
