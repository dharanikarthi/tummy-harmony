import { useState } from 'react';
import { useUser } from '@/context/UserContext';

const conditionColors: Record<string, string> = {
  'Peptic Ulcer':    'bg-moderate/15 text-moderate',
  'GERD':            'bg-moderate/15 text-moderate',
  'Gastritis':       'bg-moderate/15 text-moderate',
  'IBS':             'bg-poor/15 text-poor',
  "Crohn's Disease": 'bg-poor/15 text-poor',
  'Healthy':         'bg-good/15 text-good',
};

export default function ConditionBadge({ condition }: { condition?: string }) {
  const { gutCondition, allConditions } = useUser();
  const [showTooltip, setShowTooltip] = useState(false);

  const primary = condition || gutCondition;
  const all = allConditions?.length > 0 ? allConditions : (primary ? [primary] : []);

  if (!primary && all.length === 0) return null;

  const color = conditionColors[primary] || 'bg-muted text-muted-foreground';
  const extra = all.length - 1;

  return (
    <div className="relative inline-flex">
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-default ${color}`}
        onMouseEnter={() => extra > 0 && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {primary}
        {extra > 0 && (
          <span className="ml-0.5 bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
            +{extra}
          </span>
        )}
      </span>
      {showTooltip && extra > 0 && (
        <div className="absolute top-full left-0 mt-2 bg-gray-900 text-white text-xs rounded-xl p-3 whitespace-nowrap z-50 shadow-lg">
          {all.map((c) => <div key={c} className="py-0.5">{c}</div>)}
        </div>
      )}
    </div>
  );
}
