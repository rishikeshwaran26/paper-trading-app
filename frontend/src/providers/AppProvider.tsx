'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryProvider>
  );
}
