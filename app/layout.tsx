import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import { getSiteUrl } from '@/lib/site-url';

const siteUrl = getSiteUrl();

/** 全站 Google Fonts 統一串流網址（取代偶發拋錯的 next/font/google 編譯期抓檔，確保 CI 與跨平台 100% 穩定） */
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '馬遠榮副校長 | Prof. Yuan-Ron Ma — 佛光大學個人學術網站',
  description:
    '馬遠榮副校長（Prof. Yuan-Ron Ma）學術研究專頁，涵蓋一維金屬氧化物奈米材料、二維鐵磁材料、電致變色、超級電容器與量子元件等研究成果與著作目錄。',
  openGraph: {
    title: '馬遠榮副校長 | Prof. Yuan-Ron Ma — 佛光大學個人學術網站',
    description:
      '展示馬遠榮副校長的學術履歷、研究成果、發行著作以及相關專業經歷。',
    type: 'website',
    locale: 'zh_TW',
    alternateLocale: ['en_US'],
    url: `${siteUrl}/`,
    siteName: '馬遠榮副校長學術網站',
    images: [
      {
        url: '/profile.jpg',
        alt: 'Prof. Yuan-Ron Ma (馬遠榮副校長)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '馬遠榮副校長 | Prof. Yuan-Ron Ma — 佛光大學個人學術網站',
    description:
      '展示馬遠榮副校長的學術履歷、研究成果、發行著作以及相關專業經歷。',
    images: ['/profile.jpg'],
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Yuan-Ron Ma',
  alternateName: ['馬遠榮', 'Prof. Y.R. Ma'],
  jobTitle: 'Vice President & Chair Professor',
  affiliation: [
    {
      '@type': 'CollegeOrUniversity',
      name: 'Fo Guang University',
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'National Dong Hwa University',
    },
  ],
  email: 'mailto:yrma@gm.fgu.edu.tw',
  url: siteUrl,
  image: `${siteUrl}/profile.jpg`,
  knowsAbout: [
    '1D Nanomaterials',
    '2D Ferromagnetic Materials',
    'Electrochromism',
    'Supercapacitors',
    'Quantum Computing Materials',
  ],
};

/** 首次繪製前同步套用記憶之晝／夜主題（預設晝讀白版），徹底杜絕 SSR 閃爍 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('ma-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* 統一以 Google Fonts CSS 串流載入中英權威字體全字重，杜絕新細明體退化與 Next 15 next/font 偶發建置失敗 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className="bg-[var(--app-bg)] font-sans text-[var(--app-body)] antialiased selection:bg-[var(--app-accent)]/20 selection:text-[var(--app-ink)]">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
