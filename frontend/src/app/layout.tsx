import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AppProvider } from '@/providers';
import { AppShell } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Paper Trading App',
  description: 'Personal swing trading paper trading application'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})()`
          }}
        />
      </head>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
