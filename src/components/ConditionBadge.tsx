import { useUser } from '@/context/UserContext';

const conditionColors: Record<string, string> = {
  'Peptic Ulcer': 'bg-moderate/15 text-moderate',
  'GERD': 'bg-moderate/15 text-moderate',
  'Gastritis': 'bg-moderate/15 text-moderate',
  'IBS': 'bg-poor/15 text-poor',
  "Crohn's Disease": 'bg-poor/15 text-poor',
  'Healthy': 'bg-good/15 text-good',
};

export default function ConditionBadge({ condition }: { condition?: string }) {
  const { gutCondition } = useUser();
  const c = condition || gutCondition;
  const color = conditionColors[c] || 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {c}
    </span>
  );
}
