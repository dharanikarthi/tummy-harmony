export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getPasswordStrength = (password: string) => {
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (password.length >= 8 && hasNumber && hasSpecial) strength = 'strong';
  else if (password.length >= 8 && hasNumber) strength = 'good';
  else if (password.length >= 6) strength = 'fair';
  return { hasLength, hasNumber, hasSpecial, strength };
};

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
};

export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue',  advice: 'Consider increasing caloric intake with gut-friendly foods.' };
  if (bmi < 25)   return { label: 'Healthy Weight', color: 'green', advice: 'Great! Maintain your current healthy eating habits.' };
  if (bmi < 30)   return { label: 'Overweight', color: 'amber', advice: 'Focus on gut-friendly foods that also support weight management.' };
  return           { label: 'Obese', color: 'rose',  advice: 'A gut-healthy diet can help with sustainable weight loss.' };
};
