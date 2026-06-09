import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'profit' | 'loss';
  className?: string;
}

export function StatCard({ label, value, change, changeLabel, icon, loading, variant = 'default', className = '' }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const changeColors = {
    profit: 'text-emerald-600 dark:text-emerald-400',
    loss: 'text-red-600 dark:text-red-400',
    default: isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
  };

  const valueColors = {
    profit: 'text-emerald-600 dark:text-emerald-400',
    loss: 'text-red-600 dark:text-red-400',
    default: 'text-gray-900 dark:text-white'
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>

      {loading ? (
        <div className="mt-2 h-8 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      ) : (
        <p className={`mt-2 text-2xl font-bold tracking-tight ${valueColors[variant]}`}>
          {value}
        </p>
      )}

      {change !== undefined && (
        <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${changeColors[variant]}`}>
          {loading ? (
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : (
            <>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : isNegative ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              <span>{Math.abs(change).toFixed(2)}%</span>
              {changeLabel && <span className="text-gray-400 dark:text-gray-500">&middot; {changeLabel}</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
