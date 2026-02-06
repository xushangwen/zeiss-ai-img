import { useEffect } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: 'ri-checkbox-circle-line',
    error: 'ri-error-warning-line',
    info: 'ri-information-line',
    warning: 'ri-alert-line',
  };

  const colors = {
    success: 'border-success/30 text-success',
    error: 'border-error/30 text-error',
    info: 'border-accent/30 text-accent',
    warning: 'border-warning/30 text-warning',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border glass ${colors[type]} animate-slide-in-right shadow-card`}
    >
      <i className={`${icons[type]} text-lg`}></i>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <i className="ri-close-line text-sm"></i>
      </button>
    </div>
  );
}
