import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Serif_TC, Outfit, Playfair_Display } from 'next/font/google';
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const notoSerifTc = Noto_Serif_TC({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '馬遠榮副校長 | 佛光大學 個人學術網站',
  description: '展示馬遠榮副校長的學術履歷、研究成果、發行著作以及相關專業經歷。',
  openGraph: {
    title: '馬遠榮副校長 | 佛光大學 個人學術網站',
    description: '展示馬遠榮副校長的學術履歷、研究成果、發行著作以及相關專業經歷。',
    type: 'website',
    locale: 'zh_TW',
    url: 'https://ais-dev-2vkfnzcdenqunkr3e52tml-76665202037.asia-northeast1.run.app',
    siteName: '馬遠榮副校長學術網站',
  },
  twitter: {
    card: 'summary_large_image',
    title: '馬遠榮副校長 | 佛光大學 個人學術網站',
    description: '展示馬遠榮副校長的學術履歷、研究成果、發行著作以及相關專業經歷。',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${mono.variable} ${playfair.variable} ${notoSerifTc.variable}`}
    >
      <head>
        <link rel="dns-prefetch" href="https://sixshoes.github.io" />
        <link rel="preconnect" href="https://sixshoes.github.io" crossOrigin="anonymous" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[var(--app-bg)] text-stone-400 font-sans antialiased selection:bg-[#d4af37]/20 selection:text-stone-100"
      >
        {/* Subtle noise texture overlay for premium material feel - Removed for performance */}
        {/* <div 
          className="fixed inset-0 opacity-[0.02] pointer-events-none z-50 mix-blend-overlay" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        ></div> */}
        <SmoothScroll>
          <LanguageProvider>
            <>
              {children}
              <ScrollToTop />
            </>
          </LanguageProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
