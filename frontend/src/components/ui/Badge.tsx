type BadgeVariant = 'profit' | 'loss' | 'neutral' | 'info' | 'warning' | 'active' | 'inactive';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  profit: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300',
  loss: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300',
  inactive: 'bg-gray-50 text-gray-500 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400'
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs'
};

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
