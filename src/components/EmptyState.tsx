import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs animate-fadeInUp" style={{ animationDelay: '300ms', animationFillMode: 'both', opacity: 0 }}>
        {subtitle}
      </p>
      {action && (
        <div className="animate-popIn" style={{ animationDelay: '500ms', animationFillMode: 'both', opacity: 0 }}>
          {action}
        </div>
      )}
    </div>
  );
}
