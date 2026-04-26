const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const TEXT_MODEL = 'llama-3.3-70b-versatile';

const buildPrompt = (foodName: string, conditions: string[], userName: string) => {
  const condText = conditions.join(', ');
  return `You are GutSense, an expert gut health nutritionist AI.
User: ${userName}
Gut Conditions: ${condText}

Analyze this food for someone with ${condText}: "${foodName}"

Reply ONLY with this exact JSON, no markdown, no extra text:
{
  "food_name": "name of food",
  "food_identified": true,
  "rating": "good" or "moderate" or "poor",
  "rating_label": "GREAT CHOICE" or "EAT IN MODERATION" or "AVOID THIS",
  "explanation": "2-3 sentences why this food is good or bad specifically for ${condText}",
  "gut_score": number from 1 to 10,
  "alternatives": [
    {"name": "food 1", "reason": "why better for ${condText}"},
    {"name": "food 2", "reason": "why better for ${condText}"},
    {"name": "food 3", "reason": "why better for ${condText}"}
  ],
  "tip": "one practical tip for ${condText} about this food",
  "nutrients_to_watch": ["nutrient1", "nutrient2"],
  "best_time_to_eat": "morning" or "afternoon" or "evening" or "avoid"
}`;
};

const parseJSON = (raw: string) => {
  try {
    let cleaned = raw.trim();
    if (cleaned.includes('```')) {
      cleaned = cleaned.split('```')[1];
      if (cleaned.startsWith('json')) cleaned = cleaned.substring(4);
    }
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error('Parse error:', e);
    return null;
  }
};

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const analyzeByText = async (
  foodName: string,
  conditions: string[],
  userName: string,
) => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [{ role: 'user', content: buildPrompt(foodName, conditions, userName) }],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Groq API error');
  }

  const data = await response.json();
  return parseJSON(data.choices[0].message.content);
};

export const analyzeByImage = async (
  imageFile: File,
  conditions: string[],
  userName: string,
) => {
  const condText = conditions.join(', ');
  const base64 = await toBase64(imageFile);

  const imagePrompt = `You are GutSense, an expert gut health nutritionist AI.
User: ${userName}
Gut Conditions: ${condText}

Look at this food image carefully. Identify EXACTLY what food is shown — be specific (e.g. "Idli", "Biryani", "Coffee", "Pizza"). Then analyze it for someone with ${condText}.

Reply ONLY with this exact JSON, no markdown, no extra text:
{
  "food_name": "exact name of the food you see in the image",
  "food_identified": true or false,
  "confidence": "high" or "medium" or "low",
  "rating": "good" or "moderate" or "poor",
  "rating_label": "GREAT CHOICE" or "EAT IN MODERATION" or "AVOID THIS",
  "explanation": "2-3 sentences why this food is good or bad specifically for ${condText}",
  "gut_score": number from 1 to 10,
  "alternatives": [
    {"name": "food 1", "reason": "why better for ${condText}"},
    {"name": "food 2", "reason": "why better for ${condText}"},
    {"name": "food 3", "reason": "why better for ${condText}"}
  ],
  "tip": "one practical tip for ${condText} about this food",
  "nutrients_to_watch": ["nutrient1", "nutrient2"],
  "best_time_to_eat": "morning" or "afternoon" or "evening" or "avoid"
}

Always set food_name to the actual food name you identify, never leave it as a generic description.`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: imagePrompt },
            {
              type: 'image_url',
              image_url: { url: `data:${imageFile.type};base64,${base64}` },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Groq API error');
  }

  const data = await response.json();
  return parseJSON(data.choices[0].message.content);
};
