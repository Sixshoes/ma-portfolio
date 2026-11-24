import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Newsreader, Noto_Serif_TC } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './LanguageContext';
import { getSiteUrl } from '@/lib/site-url';

const siteUrl = getSiteUrl();

const newsreader = Newsreader({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

const notoSerifTc = Noto_Serif_TC({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-tc',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${notoSerifTc.variable} ${inter.variable} ${mono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="bg-[var(--app-bg)] font-sans text-[var(--app-body)] antialiased selection:bg-[#1B365D]/15 selection:text-[#141413]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
