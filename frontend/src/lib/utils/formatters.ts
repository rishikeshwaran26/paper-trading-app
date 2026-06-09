export function formatCurrency(value?: number | null): string {
  const v = value ?? 0;
  const abs = Math.abs(v);
  const formatted = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatSignedCurrency(value?: number | null): string {
  const v = value ?? 0;
  const sign = v >= 0 ? '+' : '';
  const abs = Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}₹${abs}`;
}

export function formatPercent(value?: number | null): string {
  const v = value ?? 0;
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatQuantity(value?: number | null): string {
  return (value ?? 0).toLocaleString('en-IN');
}
