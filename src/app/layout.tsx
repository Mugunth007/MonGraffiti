import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MON Graffiti - Multiplayer Map Art Canvas',
  description: 'Draw graffiti, pin it to Google Maps in real-time, and explore artworks from artists around the world on Monad Testnet.',
  keywords: ['Graffiti', 'Monad', 'Google Maps', 'Supabase', 'Multiplayer Canvas', 'Drawing App'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} font-sans bg-[#09090e] text-gray-100 antialiased overflow-hidden min-h-screen w-screen m-0 p-0`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
