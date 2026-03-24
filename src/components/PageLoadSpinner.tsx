import { Leaf } from 'lucide-react';

export default function PageLoadSpinner() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 animate-fadeInUp">
      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 animate-heartbeat">
        <Leaf className="w-7 h-7 text-primary-foreground" />
      </div>
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
