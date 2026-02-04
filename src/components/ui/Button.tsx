import { forwardRef, ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'danger' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', isLoading, children, className = '', disabled, onClick, type = 'button' }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus:outline-none disabled:opacity-40';

    const variants = {
      primary: 'bg-accent-blue/90 hover:bg-accent-blue text-white',
      danger: 'bg-accent-red/90 hover:bg-accent-red text-white',
      ghost: 'hover:bg-white/5 text-text-secondary',
      secondary: 'bg-white/5 hover:bg-white/10 text-text-primary',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
