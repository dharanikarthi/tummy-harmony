const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export interface NutrientInfo {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  reason: string;
}

export interface GutAnalysisResult {
  foodName: string;
  rating: 'good' | 'moderate' | 'poor';
  ratingScore: number;
  explanation: string;
  whyDetails: string[];
  alternatives: string[];
  tip: string;
  nutrients: NutrientInfo[];
  portionAdvice: string;
  avoidWith: string[];
}

function buildAnalysisPrompt(foodName: string, conditionContext: string): string {
  return `You are GutSense AI, an expert gut health nutritionist and gastroenterologist.

${conditionContext}

The user wants to eat: "${foodName}"

Analyze whether "${foodName}" is suitable for this user's specific gut conditions.
Respond ONLY with a valid JSON object. No markdown, no backticks, no extra text.

{
  "foodName": "${foodName}",
  "rating": "good" or "moderate" or "poor",
  "ratingScore": <number 1-10>,
  "explanation": "<2-3 sentences explaining why this food is good/moderate/poor for their SPECIFIC conditions. Mention the condition by name.>",
  "whyDetails": [
    "<specific reason 1 related to their condition>",
    "<specific reason 2>",
    "<specific reason 3>"
  ],
  "alternatives": [
    "<healthier alternative 1>",
    "<healthier alternative 2>",
    "<healthier alternative 3>"
  ],
  "tip": "<one practical tip specific to their condition>",
  "nutrients": [
    {
      "name": "<nutrient name>",
      "impact": "positive" or "negative" or "neutral",
      "reason": "<why this nutrient affects their condition>"
    }
  ],
  "portionAdvice": "<recommended portion size and frequency, e.g. '1 small bowl, max 2x per week' or 'Avoid completely'>",
  "avoidWith": [
    "<food or drink to avoid combining with this>",
    "<another combination to avoid>"
  ]
}

Rating guide:
- "good" (7-10): Safe and beneficial. Eat freely.
- "moderate" (4-6): Can eat with caution, small portions.
- "poor" (1-3): Should avoid. Likely to trigger symptoms.

Be specific to their exact conditions. Consider all conditions if multiple.`;
}

function parseJSON(raw: string): GutAnalysisResult | null {
  try {
    let cleaned = raw.trim();
    // Strip markdown code fences if present
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('gutAnalysis parse error:', e, '\nRaw:', raw);
    return null;
  }
}

const FALLBACK: GutAnalysisResult = {
  foodName: 'Unknown',
  rating: 'moderate',
  ratingScore: 5,
  explanation: 'Analysis temporarily unavailable. Please try again.',
  whyDetails: ['Could not complete analysis', 'Please check your connection and retry'],
  alternatives: ['Curd Rice', 'Idli', 'Oats'],
  tip: 'When in doubt, eat small portions and monitor your symptoms.',
  nutrients: [],
  portionAdvice: 'Moderate portions',
  avoidWith: [],
};

export async function analyzeGutHealth(
  foodName: string,
  conditionContext: string,
): Promise<GutAnalysisResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a gut health expert. Always respond with valid JSON only. No markdown, no backticks, no extra text.',
        },
        {
          role: 'user',
          content: buildAnalysisPrompt(foodName, conditionContext),
        },
      ],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error?.message || 'Groq API error');
  }

  const data = await response.json();
  const parsed = parseJSON(data.choices[0].message.content);
  return parsed ? { ...parsed, foodName } : { ...FALLBACK, foodName };
}

/* ── Meal Plan types & service ─────────────────────────────── */

export interface MealItem {
  name: string;
  description: string;
  gutScore: number;
  prepTime?: string;
  ingredients?: string[];
  whyGood: string;
}

export interface MealPlanDay {
  day: string;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack: MealItem;
  dailyTip: string;
  waterIntake: string;
}

export interface MealPlan {
  days: MealPlanDay[];
  weeklyTheme: string;
  generalAdvice: string;
  foodsToStockUp: string[];
  foodsToAvoid: string[];
  estimatedCalories: string;
}

export interface MealPreferences {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  spiceLevel: 'mild' | 'medium' | 'spicy';
  cuisinePreference: string;
}

export async function generateMealPlan(
  conditionContext: string,
  preferences: MealPreferences,
): Promise<MealPlan> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const prompt = `You are a clinical dietitian specializing in gut health for Indian patients.
${conditionContext}
User preferences:
- Vegetarian: ${preferences.vegetarian}
- Vegan: ${preferences.vegan}
- Gluten free: ${preferences.glutenFree}
- Dairy free: ${preferences.dairyFree}
- Spice level: ${preferences.spiceLevel}
- Cuisine preference: ${preferences.cuisinePreference}

Generate a complete 7-day gut-friendly meal plan. All meals must suit their gut condition.
Prefer Indian foods. Meals must be practical. Avoid trigger foods for their condition.
Each meal must have a gut score 1-10.

Respond ONLY with valid JSON. No markdown, no backticks.
{
  "weeklyTheme": "<one sentence theme>",
  "generalAdvice": "<2-3 sentences of advice>",
  "estimatedCalories": "<daily range e.g. 1800-2000 kcal>",
  "foodsToStockUp": ["<item1>","<item2>","<item3>","<item4>","<item5>"],
  "foodsToAvoid": ["<food1>","<food2>","<food3>"],
  "days": [
    {
      "day": "Monday",
      "breakfast": {"name":"<name>","description":"<1 sentence>","gutScore":<1-10>,"prepTime":"<e.g. 15 mins>","ingredients":["<i1>","<i2>"],"whyGood":"<why>"},
      "lunch":     {"name":"<name>","description":"<1 sentence>","gutScore":<1-10>,"prepTime":"<e.g. 20 mins>","ingredients":["<i1>","<i2>"],"whyGood":"<why>"},
      "dinner":    {"name":"<name>","description":"<1 sentence>","gutScore":<1-10>,"prepTime":"<e.g. 25 mins>","ingredients":["<i1>","<i2>"],"whyGood":"<why>"},
      "snack":     {"name":"<name>","description":"<1 sentence>","gutScore":<1-10>,"whyGood":"<why>"},
      "dailyTip": "<gut health tip>",
      "waterIntake": "<e.g. 8-10 glasses>"
    }
  ]
}
Include all 7 days: Monday Tuesday Wednesday Thursday Friday Saturday Sunday.`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a gut health dietitian. Respond with valid JSON only. No markdown or backticks.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error?.message || 'Groq API error');
  }

  const data = await response.json();
  const raw = data.choices[0].message.content || '{}';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned) as MealPlan;
  } catch (e) {
    console.error('MealPlan parse error:', e);
    throw new Error('Failed to generate meal plan. Please try again.');
  }
}
