import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export const toast = {
  success: (msg: string) => addToastFn?.('success', msg),
  error:   (msg: string) => addToastFn?.('error', msg),
  info:    (msg: string) => addToastFn?.('info', msg),
  warning: (msg: string) => addToastFn?.('warning', msg),
};

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error:   <XCircle className="w-5 h-5 text-red-500" />,
  info:    <Info className="w-5 h-5 text-teal-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const borders = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  info:    'border-l-teal-500',
  warning: 'border-l-amber-500',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => { addToastFn = add; return () => { addToastFn = null; }; }, [add]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 bg-card border border-border border-l-4 ${borders[t.type]} rounded-xl px-4 py-3 shadow-lg min-w-[280px] max-w-sm animate-slide-up`}
        >
          {icons[t.type]}
          <p className="text-sm text-foreground flex-1">{t.message}</p>
          <button onClick={() => setToasts((x) => x.filter((i) => i.id !== t.id))} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
