import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './LanguageContext';
import SmoothScroll from './SmoothScroll';
import ScrollToTop from './ScrollToTop';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Y.R. Ma | Advanced Materials & Quantum Devices',
  description: 'Personal website of Prof. Y.R. Ma, Vice President of Fo Guang University, specializing in Advanced Materials and Quantum Devices.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${mono.variable}`}>
      <body suppressHydrationWarning className="bg-[#080C16] text-slate-300 font-sans antialiased selection:bg-amber-500/30">
        {/* Subtle noise texture overlay for premium material feel */}
        <div 
          className="fixed inset-0 opacity-[0.02] pointer-events-none z-50 mix-blend-overlay" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        ></div>
        <SmoothScroll>
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <ScrollToTop />
        </SmoothScroll>
      </body>
    </html>
  );
}
