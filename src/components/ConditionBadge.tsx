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
  const raw = condition || gutCondition;
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((c) => {
        const color = conditionColors[c] || 'bg-muted text-muted-foreground';
        return (
          <span key={c} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            {c}
          </span>
        );
      })}
    </div>
  );
}
