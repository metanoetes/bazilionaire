import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Bazilionaire — read the map, follow Jesus Christ',
  description:
    'A free, open-source Bazi (八字 bā zì) learning center. The chart is a map; Christ is the way. 善人不为命所缚 (shàn rén bù wéi mìng suǒ fù) — the good are not bound by fate.',
};

/**
 * Runs before paint: dark is the default; a stored 'light' preference
 * (or nothing) resolves to the right theme with no flash of wrong theme.
 */
const themeInit = `(function(){try{var t=null;try{t=localStorage.getItem('bazilionaire.theme')}catch(e){}if(t!=='dark'&&t!=='light'){t='dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Navbar />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
