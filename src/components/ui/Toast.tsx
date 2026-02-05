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
    success: 'bg-success/10 border-success text-success',
    error: 'bg-error/10 border-error text-error',
    info: 'bg-accent/10 border-accent text-accent',
    warning: 'bg-warning/10 border-warning text-warning',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${colors[type]} animate-slide-in-right`}
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
