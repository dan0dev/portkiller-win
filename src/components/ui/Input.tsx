import { forwardRef, InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: 'search';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        {icon === 'search' && (
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        )}
        <input
          ref={ref}
          className={`w-full bg-white/5 border border-white/5 rounded-md py-1.5 text-sm
            ${icon ? 'pl-8 pr-3' : 'px-3'}
            focus:outline-none focus:border-white/20 placeholder-text-muted transition-colors ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
