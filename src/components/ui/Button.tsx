import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth, children, disabled, ...props }, ref) => {
    let base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-accent hover:bg-accent-hover text-white shadow-sm",
      outline: "border-2 border-border bg-transparent hover:border-accent hover:bg-bg-card-secondary text-text-primary",
      ghost: "bg-transparent hover:bg-bg-input text-accent",
      danger: "bg-danger hover:bg-red-600 text-white shadow-sm"
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-[13px] rounded-lg",
      md: "px-5 py-2.5 text-[14px]",
      lg: "px-8 py-3.5 text-[16px]"
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
