export const APP_NAME = 'Paper Trading';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Watchlist', href: '/watchlist', icon: 'Eye' },
  { label: 'Portfolio', href: '/portfolio', icon: 'PieChart' },
  { label: 'Positions', href: '/positions', icon: 'Briefcase' },
  { label: 'Trade Journal', href: '/journal', icon: 'BookOpen' },
  { label: 'Alerts', href: '/alerts', icon: 'Bell' },
  { label: 'Settings', href: '/settings', icon: 'Settings' }
] as const;

export const MOBILE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Watchlist', href: '/watchlist', icon: 'Eye' },
  { label: 'Portfolio', href: '/portfolio', icon: 'PieChart' },
  { label: 'Positions', href: '/positions', icon: 'Briefcase' },
  { label: 'Settings', href: '/settings', icon: 'Settings' }
] as const;

export const TRADE_TYPES = { BUY: 'BUY', SELL: 'SELL' } as const;
export const ALERT_DIRECTIONS = ['ABOVE', 'BELOW'] as const;
export const MOOD_OPTIONS = [
  { value: 'BULLISH', label: 'Bullish' },
  { value: 'BEARISH', label: 'Bearish' },
  { value: 'NEUTRAL', label: 'Neutral' }
] as const;
