'use client';

import { Menu, Search } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: hamburger + app name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white lg:hidden">
            {APP_NAME}
          </span>
        </div>

        {/* Center: search (desktop only) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right: portfolio value pill */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Portfolio</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">₹100,000</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">T</span>
          </div>
        </div>
      </div>
    </header>
  );
}
