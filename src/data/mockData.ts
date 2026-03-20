export const mockHistory = [
  { id: 1, foodName: 'Idli', rating: 'good' as const, date: 'Today, 8:30 AM', reason: 'Soft and low-acid, gentle on stomach lining.', tip: 'Best eaten with sambar for added nutrients.' },
  { id: 2, foodName: 'Coffee', rating: 'poor' as const, date: 'Today, 9:00 AM', reason: 'Increases acid production, worsens ulcer pain.', tip: 'Switch to ginger tea as a morning drink.' },
  { id: 3, foodName: 'Curd Rice', rating: 'good' as const, date: 'Yesterday, 1:00 PM', reason: 'Probiotic-rich and cooling for inflamed gut.', tip: 'Add cucumber for extra gut-soothing effect.' },
  { id: 4, foodName: 'Biryani', rating: 'moderate' as const, date: 'Yesterday, 2:30 PM', reason: 'Spicy and oily — eat a small portion only.', tip: 'Follow with buttermilk to ease digestion.' },
  { id: 5, foodName: 'Banana', rating: 'good' as const, date: '2 days ago', reason: 'Natural antacid, coats stomach lining.', tip: 'Have one before meals for best protection.' },
  { id: 6, foodName: 'Samosa', rating: 'poor' as const, date: '2 days ago', reason: 'Deep fried and heavy — irritates stomach.', tip: 'Try baked alternatives for a safer snack.' },
  { id: 7, foodName: 'Oats', rating: 'good' as const, date: '3 days ago', reason: 'High fiber, absorbs excess stomach acid.', tip: 'Add banana slices for extra gut benefits.' },
  { id: 8, foodName: 'Pizza', rating: 'poor' as const, date: '3 days ago', reason: 'Cheese and sauce increase acid reflux risk.', tip: 'If craving, try a plain cheese toast instead.' },
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
