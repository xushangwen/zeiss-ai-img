interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-text-secondary mb-2 block">{label}</label>
      )}
      <div className="relative">
        <select
          className={`w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary appearance-none cursor-pointer transition-colors hover:border-accent/50 focus:outline-none focus:border-accent ${className}`}
          {...props}
        >
          {children}
        </select>
        <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"></i>
      </div>
    </div>
  );
}
