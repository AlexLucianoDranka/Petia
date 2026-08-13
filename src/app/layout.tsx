import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PwaInstallPrompt } from '@/components/navigation/PwaInstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#0f1f38',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Petia - Gestão Veterinária e Pet Shop',
  description: 'Sistema completo de gestão veterinária, prontuário digital, agenda e automações.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Petia',
  },
  icons: {
    icon: [
      { url: '/icons/petshop-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/petshop-icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/petshop-apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} min-h-screen bg-st-navy text-st-arctic antialiased selection:bg-st-electric selection:text-white`}>
        <PwaInstallPrompt />
        {children}
      </body>
    </html>
  );
}
