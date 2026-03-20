import { useState, useEffect } from 'react';
import { Lightbulb, X, ArrowRight, Clock, Leaf, Wind, Smile, Moon, Star, ArrowUp, Sun, BookOpen, CheckCircle, Info, Activity, Droplets, AlertCircle, Flame } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const iconMap: Record<string, React.ElementType> = {
  Clock, Leaf, Wind, Smile, Moon, Star, ArrowUp, Sun, BookOpen, CheckCircle, Info, Activity, Droplets, AlertCircle, Flame, Shirt: Info, Fish: Droplets,
};

const tipsByCondition: Record<string, { tip: string; icon: string }[]> = {
  'Peptic Ulcer': [
    { tip: 'Eat smaller meals every 3-4 hours instead of 3 large meals to reduce acid buildup.', icon: 'Clock' },
    { tip: 'Cabbage juice has natural compounds that help heal stomach ulcers. Try half a cup daily.', icon: 'Leaf' },
    { tip: 'Stress worsens ulcer symptoms. Try 5 minutes of deep breathing before meals.', icon: 'Wind' },
    { tip: 'Chew your food slowly and thoroughly. It reduces the acid your stomach needs to produce.', icon: 'Smile' },
    { tip: 'Sleep on your left side to reduce nighttime acid reflux naturally.', icon: 'Moon' },
    { tip: 'Honey has antibacterial properties that may help fight H. pylori bacteria causing ulcers.', icon: 'Star' },
    { tip: 'Avoid eating within 2 hours of bedtime to give your stomach time to empty.', icon: 'Clock' },
  ],
  'GERD': [
    { tip: 'Elevate the head of your bed by 6-8 inches to prevent nighttime acid reflux.', icon: 'ArrowUp' },
    { tip: 'Wear loose clothing after meals — tight waistbands increase abdominal pressure and worsen GERD.', icon: 'Info' },
    { tip: 'Chewing sugar-free gum after meals stimulates saliva which neutralizes acid naturally.', icon: 'Smile' },
    { tip: 'Avoid lying down for at least 3 hours after eating.', icon: 'Clock' },
    { tip: 'Aloe vera juice (2-3 tablespoons) before meals can soothe the esophagus lining.', icon: 'Leaf' },
    { tip: 'Eat your largest meal at lunch, not dinner — your digestion is strongest midday.', icon: 'Sun' },
    { tip: 'Keep a food diary to identify your personal GERD triggers — they vary per person.', icon: 'BookOpen' },
  ],
  'IBS': [
    { tip: 'The low-FODMAP diet is clinically proven to reduce IBS symptoms in 75% of patients.', icon: 'CheckCircle' },
    { tip: 'Peppermint oil capsules taken before meals can significantly reduce IBS cramping.', icon: 'Leaf' },
    { tip: 'Eat at consistent times daily — your gut has its own clock and thrives on routine.', icon: 'Clock' },
    { tip: 'Soluble fiber (oats, bananas) is better for IBS than insoluble fiber (bran, raw vegetables).', icon: 'Info' },
    { tip: 'Stress is a major IBS trigger. Even a 10-minute walk after meals can reduce flare-ups.', icon: 'Activity' },
    { tip: 'Stay well hydrated — aim for 8 glasses of water daily to keep bowels moving smoothly.', icon: 'Droplets' },
    { tip: 'Probiotics (especially Lactobacillus) can reduce IBS bloating over 4-8 weeks of use.', icon: 'Star' },
  ],
  "Crohn's Disease": [
    { tip: 'During flare-ups, switch to liquid or soft foods to give your intestines a rest.', icon: 'Droplets' },
    { tip: 'Small frequent meals are much easier on inflamed intestines than large ones.', icon: 'Clock' },
    { tip: 'Track your symptoms in a journal — patterns help your doctor adjust treatment.', icon: 'BookOpen' },
    { tip: 'Vitamin D deficiency is very common in Crohn\'s patients. Ask your doctor to test your levels.', icon: 'Sun' },
    { tip: 'Omega-3 fatty acids (found in fish oil) have anti-inflammatory properties that may help Crohn\'s.', icon: 'Droplets' },
    { tip: 'Cooking vegetables until soft makes them much easier to digest during active Crohn\'s.', icon: 'Flame' },
    { tip: 'Avoid NSAIDs like ibuprofen — they can trigger Crohn\'s flare-ups. Use paracetamol instead.', icon: 'AlertCircle' },
  ],
  'Gastritis': [
    { tip: 'Manuka honey has proven antibacterial effects against H. pylori, a common gastritis cause.', icon: 'Star' },
    { tip: 'Avoid NSAIDs (ibuprofen, aspirin) — they are a leading cause of gastritis flare-ups.', icon: 'AlertCircle' },
    { tip: 'Ginger tea before meals can reduce gastritis inflammation and nausea naturally.', icon: 'Leaf' },
    { tip: 'Cold milk can temporarily neutralize stomach acid and soothe gastritis pain.', icon: 'Droplets' },
    { tip: 'Eat slowly and chew thoroughly — it reduces the digestive workload on an inflamed stomach.', icon: 'Clock' },
    { tip: 'Licorice root supplements (DGL form) can help protect and heal the stomach lining.', icon: 'Leaf' },
    { tip: 'Avoid eating spicy food on an empty stomach — always eat a bland snack first.', icon: 'AlertCircle' },
  ],
  'Healthy': [
    { tip: 'Eat a diverse range of plants — 30 different plant foods per week is the gut microbiome gold standard.', icon: 'Leaf' },
    { tip: 'Fermented foods (yogurt, kimchi, kefir) feed beneficial gut bacteria and improve immunity.', icon: 'Star' },
    { tip: 'Fiber is gut bacteria\'s favourite food. Aim for 25-35g daily from whole food sources.', icon: 'Activity' },
    { tip: 'Your gut microbiome affects your mood. A healthy gut produces 90% of your body\'s serotonin.', icon: 'Smile' },
    { tip: 'Exercise for 30 minutes daily — it increases gut microbiome diversity significantly.', icon: 'Activity' },
    { tip: 'Avoid unnecessary antibiotics — they wipe out beneficial gut bacteria for months.', icon: 'AlertCircle' },
    { tip: 'Intermittent fasting gives your gut time to clean itself through a process called autophagy.', icon: 'Clock' },
  ],
};

export default function DailyTipCard() {
  const { gutCondition } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);
  const [tipOffset, setTipOffset] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const todayStr = new Date().toDateString();

  useEffect(() => {
    const dismissed = localStorage.getItem('tipDismissedDate');
    if (dismissed === todayStr) setIsDismissed(true);
  }, [todayStr]);

  const condition = gutCondition === "I'm Healthy" ? 'Healthy' : gutCondition;
  const tips = tipsByCondition[condition] || tipsByCondition['Peptic Ulcer'];
  const dayIndex = Math.floor(Date.now() / 86400000) % tips.length;
  const currentTip = tips[(dayIndex + tipOffset) % tips.length];
  const TipIcon = iconMap[currentTip.icon] || Lightbulb;

  const handleDismiss = () => {
    localStorage.setItem('tipDismissedDate', todayStr);
    setIsDismissed(true);
  };

  const handleNext = () => {
    setFadeIn(false);
    setTimeout(() => {
      setTipOffset((o) => o + 1);
      setFadeIn(true);
    }, 200);
  };

  if (isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/10 to-good/10 border border-primary/20 rounded-2xl p-4 animate-slide-up">
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full" />
      <div className="flex items-start gap-3 pl-3">
        <div className="w-10 h-10 rounded-full bg-moderate/15 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Daily Tip</span>
            <span className="text-xs text-muted-foreground">{gutCondition}</span>
          </div>
          <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-start gap-2">
              <TipIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">{currentTip.tip}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={handleDismiss} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
          <button onClick={handleNext} className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
