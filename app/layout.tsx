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
  title: 'Pet Rescue | 3D Puzzle Game & Pet Sanctuary',
  description: 'Play Pet Rescue - a fun 2D puzzle block matching game! Save cute pets, unlock power-ups, and customize your pet sanctuary lounge.',
  keywords: ['pet rescue', 'puzzle game', 'phaser game', 'browser game', 'match 3', 'stripe game shop'],
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
