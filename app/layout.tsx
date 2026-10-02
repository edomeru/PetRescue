import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Pawtora | 3D Puzzle Game & Pet Sanctuary',
  description: 'Play Pawtora - a 3D puzzle and pet sanctuary game! Rescue cute pets, adopt and style them with accessories, and build your dream sanctuary.',
  keywords: ['pawtora', 'pet sanctuary', 'puzzle game', 'virtual pet', 'adopt pet', 'phaser game', 'browser game'],
  authors: [{ name: 'ALARTE EDMER DE JESUS' }, { name: 'Alarte Edmer D' }],
  creator: 'ALARTE EDMER DE JESUS',
  publisher: 'ALARTE EDMER DE JESUS',
  other: {
    'facebook-domain-verification': '5r5xkez9rf030lp7meynzqrtzmz1t1',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.className}>
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-slate-100 antialiased selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
