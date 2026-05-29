import '../globals.css';
import './marketing.css';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import type { Metadata } from 'next';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Flux Slate — Premium Curation & Digital Lookbooks for Wedding Stylists',
  description: 'Flux Slate transforms wedding decor inspiration into stunning digital lookbooks for luxury Indian wedding styling firms.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-obsidian text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
