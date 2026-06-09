interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export function Card({ children, title, subtitle, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className={title ? paddingStyles[padding] : paddingStyles[padding]}>
        {children}
      </div>
    </div>
  );
}
