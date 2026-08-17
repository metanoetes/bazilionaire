import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bazilionaire — read the map, follow the Lion',
  description:
    'A free, open-source Bazi (八字) learning center. The chart is a map; Christ is the way. 善人不为命所缚 — the good are not bound by fate.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
