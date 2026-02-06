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
        <label className="text-[10px] text-text-tertiary mb-1.5 block uppercase tracking-wider font-medium">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-left cursor-pointer transition-all duration-200 hover:border-border-light focus:outline-none focus:border-accent/50 focus:shadow-glow flex items-center justify-between gap-2"
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
            {selectedOption?.label || placeholder}
          </span>
          <i className={`ri-arrow-down-s-line text-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1.5 right-0 min-w-full w-max glass border border-border-light rounded-xl shadow-card-hover overflow-hidden animate-scale-in">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
                    option.value === value
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  {option.value === value && (
                    <i className="ri-check-line text-accent text-xs"></i>
                  )}
                  <span className={`whitespace-nowrap text-[13px] ${option.value === value ? '' : 'pl-5'}`}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
