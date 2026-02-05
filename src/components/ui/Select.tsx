import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ label, value, options, onChange, placeholder = '请选择', className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full ${className}`} ref={ref}>
      {label && (
        <label className="text-xs text-text-secondary mb-2 block">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-left cursor-pointer transition-colors hover:border-accent/50 focus:outline-none focus:border-accent flex items-center justify-between gap-2"
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-secondary'}>
            {selectedOption?.label || placeholder}
          </span>
          <i className={`ri-arrow-down-s-line text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left transition-colors flex items-center gap-2 ${
                    option.value === value
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-text-primary hover:bg-bg-primary'
                  }`}
                >
                  {option.value === value && (
                    <i className="ri-check-line text-accent text-xs"></i>
                  )}
                  <span className={option.value === value ? '' : 'pl-5'}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
