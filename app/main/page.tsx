'use client';

import React, { useState, useMemo, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Publication,
  normalizePublicationsFromJson,
  publications as fallbackPublications,
} from '@/lib/publications';
import { computeFeaturedPublications } from '@/lib/publicationDisplay';
import { PAPERS_JSON_URL, readCachedPapers, writeCachedPapers } from '@/lib/papersCache';
import { useLanguage } from '../LanguageContext';
import { BottomSections } from './sections/BottomSections';
import { PublicationsSection } from './sections/PublicationsSection';
import { AboutSection } from './sections/AboutSection';
import { HeroStatsResearchSection } from './sections/HeroStatsResearchSection';
import { useRenderProfiler } from './sections/useRenderProfiler';
import { uiTokens } from './sections/uiTokens';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Magnet, 
  BatteryCharging, 
  Atom, 
  Contrast, 
  Network,
  Globe,
  X,
  Menu
} from 'lucide-react';

const dict = {
  en: {
    nav: { home: 'Home', about: 'About', research: 'Research', publications: 'Publications', contact: 'Contact' },
    hero: {
      role: 'Vice President, Chair Professor',
      title1: 'Advanced',
      title2: 'Materials',
      title3: '& Quantum',
      title4: 'Devices',
      desc: 'Exploring the frontiers of nanotechnology, specializing in one-dimensional metal-oxide nanostructures, electrochromism, and next-generation quantum device applications.',
      cta: 'View Publications'
    },
    stats: {
      pubs: 'Publications',
      citations: 'Citations',
      exp: 'Years Experience',
      scopusNote: '* Citation and publication data sourced from Scopus & ORCID',
      expValue: '30+'
    },
    research: {
      title: 'Research',
      subtitle: 'Areas',
      desc: 'Pushing the boundaries of physics and materials science',
      items: [
        { title: '1D Nanomaterials', desc: 'Synthesis and characterization of one-dimensional metal-oxide nanostructures, nanorods, and nanowires for advanced applications.', icon: Network },
        { title: '2D Magnetic Materials', desc: 'Investigating magnetic behaviors, spin dynamics, and spintronic applications in two-dimensional layered materials.', icon: Magnet },
        { title: 'Electrochromism', desc: 'Developing high-performance electrochromic smart windows and optical modulation devices for energy efficiency.', icon: Contrast },
        { title: 'Supercapacitors', desc: 'Researching advanced energy storage systems with high energy density, rapid charging, and long cycle life.', icon: BatteryCharging },
        { title: 'Quantum Computers', desc: 'Dedicated to the development of novel qubit materials and next-generation quantum computing architectures.', icon: Atom }
      ]
    },
    pubs: {
      title: 'Selected',
      subtitle: 'Works',
      desc: 'A curated list of recent high-impact research',
      filterBy: 'Filter by',
      filterAll: 'All publications',
      filterSelected: 'Selected / highlighted',
      filterYearGroup: 'By year',
      citations: 'Citations',
      journal: 'Journal',
      doi: 'Link / DOI',
      scholar: 'Google Scholar',
      link: 'Link',
      year: 'Year',
      corresponding: 'Corresponding Author (*)',
      coauthor: 'Co-author',
      abstract: 'Graphical Abstract',
      cover: 'Journal Cover',
      benchmark: 'International benchmark',
      keyFocus: 'Highlighted',
      general: 'Research paper',
      quantum: 'Quantum Mechanics',
      researchGate: 'ResearchGate',
      linkFallback: 'Open link',
      loadMore: 'Load more',
      loadingPublications: 'Loading publications',
      emptyPublications:
        'No publications match these filters. Try another year, switch to “All publications”, or clear “Selected / highlighted”.',
      featuredSpotlight: 'Featured spotlight',
      takeawayLabel: 'Research highlights',
      readAbstract: 'Read summary',
      collapseAbstract: 'Collapse',
      altmetricLink: 'Altmetric attention',
      allInFeaturedNote:
        'All matching items are already shown in the featured spotlight above. Switch filter to browse the full list.',
    },
    about: {
      title: 'Academic',
      subtitle: 'Journey',
      rolesEduTab: 'Roles & Education',
      leadership: 'Academic Leadership',
      leadershipDesc: 'Serving as the Vice President of Fo Guang University, fostering academic excellence, interdisciplinary research, and innovation in higher education.',
      roleLabel: 'Current Positions',
      roles: [
        'Vice President, Fo Guang University (2025/02/01~)',
        'Convener, Office of Sustainable Development, Fo Guang University (2025/06/12~)',
        'Director, Center for Social Practice and Sustainable Development, Fo Guang University (2025/08/01~)',
        'Dean of International and Cross-Strait Affairs, Fo Guang University (2025/06/01~)',
        'Chair Professor, Department of Applied Informatics, Fo Guang University (2025/02/01~)',
        'Distinguished Professor, Department of Physics, National Dong Hwa University (2021/08/01~)'
      ],
      eduLabel: 'Education',
      edu: [
        'Ph.D. in Physics and Astronomy, University of Nottingham, UK (1998)',
        'M.Sc. in Physics, University of Warwick, UK (1994)',
        'B.Sc. in Physics, Tamkang University, Taiwan (1988)'
      ],
      adminLabel: 'Administrative Experience',
      admin: [
        'Dean, College of Applied Technology and Design, Fo Guang University (2025/08/01~2025/10/31)',
        'Dean, College of Creativity and Technology, Fo Guang University (2025/02/01~2025/07/31)',
        'Vice President for Administration, National Dong Hwa University (2021/10/01~2023/09/30)',
        'Dean, Office of International Affairs, National Dong Hwa University (2018/08/01~2024/01)',
        'Acting Dean, College of Science and Engineering, National Dong Hwa University (2022/03~2023/04)',
        'Director, Preparatory Office of English Empowerment Academy, National Dong Hwa University (2021/10~2023/01)',
        'CEO, Office of Sustainable Development, National Dong Hwa University (2020/06~2022/04)',
        'Vice Dean, Office of International Affairs, National Dong Hwa University (2017/08~2018/07)',
        'Chair, Department of Physics, National Dong Hwa University (2015/08~2018/07)',
        'Director, Asian Academic Cooperation Center, National Dong Hwa University (2014/08~2015/07)',
        'Head, Promotion and Admission Division, Office of International Affairs, National Dong Hwa University (2012/08~2014/07)',
        'Head, Extracurricular Activities Division, Office of Student Affairs, National Dong Hwa University (2008/08~2009/01)',
        'Professor, Department of Physics, National Dong Hwa University (2007/08~2021/07)',
        'Associate Professor, Department of Physics, National Dong Hwa University (2003/08~2007/07)',
        'Assistant Professor, Department of Physics, National Dong Hwa University (1999/08~2003/07)'
      ],
      serviceLabel: 'Academic & Service Experience',
      service: [
        'Editorial Board Member, Nanomaterials, MDPI (2020/09~)',
        'Editor, Chinese Journal of Physics, Elsevier (2019/01~)',
        'Editorial Board Member, Sensors, MDPI (2019/01~)',
        'Editorial Board Member, Scientific Reports, Nature Publishing Group (2013/01~)',
        'Co-Convener, Executive Committee, 1st Division of Condensed Matter Physics, Physical Society of Taiwan (2022/08~2024/01)',
        'Executive Committee Member, 1st Division of Condensed Matter Physics, Physical Society of Taiwan (2022/02~2024/01)',
        'Planning and Promotion Committee Member, Center for Global Affairs and Science Engagement, MOST (2018/10~2021/12)',
        'Review Committee Member, Physics Discipline, Department of Natural Sciences, MOST (2017/01~2019/12)',
        'Board Member, Physical Society of Taiwan (2016/01~2018/12)',
        'Director, Office of International Affairs, Physical Society of Taiwan (2016/01~2018/12)',
        'Managing Editor, Chinese Journal of Physics, Elsevier (2015/08~2018/12)',
        'Board Member, Taiwan Information Storage Association (2009/11/10~2017/10/22)'
      ],
      awardsLabel: 'Honors & Awards',
      awards: [
        'NDHU Top Talent Academic Award (2016-2025)',
        'ESI Highly Cited Researcher (Top 1%) in Science and Engineering (2016~2022)',
        'NDHU Research Breakthrough Award (2021, Paper published in Advanced Materials)',
        'NDHU First-Class Academic Award (2021)',
        'GREEN Outstanding Research Achievement and Contribution Award, Asia Pacific Society for Materials Research (2019)',
        'Outstanding Teacher and Public Servant Award, Ministry of Education (2013)',
        'NDHU University-Level Outstanding Teacher (2007)',
        'NDHU Outstanding Research Award (2004~2015)'
      ]
    },
    impact: {
      title: 'Scientific',
      subtitle: 'Impact',
      ndhu: 'National Dong Hwa University',
      fgu: 'Fo Guang University',
      worldRank: 'World Rank',
      countryRank: 'Country Rank',
      uniRank: 'University Rank',
      hIndex: 'H-Index Metrics',
      total: 'Total',
      last5: 'Last 5 Years',
      ratio: 'Last 5 Years / Total',
      source: '* Data sourced from AD Scientific Index'
    },
    contact: {
      title: 'Get in',
      subtitle: 'Touch',
      labelEmail: 'Email',
      labelPhone: 'Phone',
      labelFax: 'Fax',
      email: 'yrma@mail.fgu.edu.tw',
      phone: '+886-3-9871000 ext. 11010',
      fax: '+886-3-9874815',
      vcard: 'Save Contact Info',
      vcardModal: {
        title: 'Save Contact',
        add: 'Add to Contacts',
        click: 'Click to download',
        downloadTooltip: 'Tap to download vCard',
      },
      footer: 'Copyright \u00A9 2026 Yuan-Ron Ma. All Rights Reserved.',
      developer: 'Developed by Yiting Chen',
    }
  },
  zh: {
    nav: { home: '首頁', about: '關於我', research: '研究領域', publications: '發表著作', contact: '聯絡資訊' },
    hero: {
      role: '副校長 / 講座教授',
      title1: '先進材料',
      title2: '與',
      title3: '量子元件',
      title4: '實驗室',
      desc: '探索奈米科技的尖端，專攻一維金屬氧化物奈米結構、電致變色技術以及次世代量子元件應用。',
      cta: '查看發表著作'
    },
    stats: {
      pubs: '發表論文',
      citations: '引用次數',
      exp: '年研究經驗',
      scopusNote: '* 引用與發表數據來源為 Scopus & ORCID',
      expValue: '30+'
    },
    research: {
      title: '專業',
      subtitle: '研究領域',
      desc: '突破物理與材料科學的界限',
      items: [
        { title: '一維奈米材料', desc: '專注於一維金屬氧化物奈米結構、奈米棒與奈米線的合成與特性研究，應用於先進光電元件。', icon: Network },
        { title: '二維磁性材料', desc: '探討二維層狀材料的磁性行為、自旋動力學與自旋電子學應用。', icon: Magnet },
        { title: '電致變色', desc: '開發高效能電致變色智慧窗與光學調變元件，致力於節能與智能玻璃技術。', icon: Contrast },
        { title: '超級電容器', desc: '研發具備高能量密度、快速充放電與長壽命的先進儲能系統與奈米電極材料。', icon: BatteryCharging },
        { title: '量子電腦', desc: '致力於新型量子位元材料開發與次世代量子計算架構之基礎物理研究。', icon: Atom }
      ]
    },
    pubs: {
      title: '精選',
      subtitle: '著作',
      desc: '近期高影響力之學術研究發表',
      filterBy: '篩選',
      filterAll: '全部著作',
      filterSelected: '精選／高引用',
      filterYearGroup: '依年份',
      citations: '引用次數',
      journal: '發表期刊',
      doi: '文獻連結 (Link / DOI)',
      scholar: 'Google Scholar',
      link: '相關連結',
      year: '發表年份',
      corresponding: '通訊作者 (*)',
      coauthor: '共同作者',
      abstract: '圖文摘要',
      cover: '期刊封面',
      benchmark: '國際標竿',
      keyFocus: '重點關注',
      general: '研究論文',
      quantum: '量子力學',
      researchGate: 'ResearchGate',
      linkFallback: '開啟連結',
      loadMore: '載入更多',
      loadingPublications: '載入著作中…',
      emptyPublications:
        '目前沒有符合此篩選條件的著作。請改選其他年份、改為「全部著作」，或關閉「精選／高引用」。',
      featuredSpotlight: '精選代表作',
      takeawayLabel: '研究亮點',
      readAbstract: '閱讀摘要',
      collapseAbstract: '收合',
      altmetricLink: 'Altmetric 關注度',
      allInFeaturedNote: '符合條件的項目皆已列於上方精選區，請切換篩選以瀏覽完整清單。',
    },
    about: {
      title: '學術',
      subtitle: '歷程',
      rolesEduTab: '現職與學歷',
      leadership: '學術領導',
      leadershipDesc: '擔任佛光大學副校長，致力於推動高等教育的學術卓越、跨領域研究與創新發展。',
      roleLabel: '現職',
      roles: [
        '佛光大學副校長 (2025/02/01~)',
        '佛光大學永續發展辦公室召集人 (2025/06/12~)',
        '佛光大學社會實踐與永續發展中心主任 (2025/08/01~)',
        '佛光大學國際暨兩岸事務處國際長 (2025/06/01~)',
        '佛光大學資訊應用學系講座教授 (2025/02/01~)',
        '國立東華大學物理學系特聘教授 (2021/08/01~)'
      ],
      eduLabel: '學歷',
      edu: [
        '英國諾丁翰大學物理學暨天文學博士 (1998)',
        '英國華威大學物理學碩士 (1994)',
        '淡江大學物理學學士 (1988)'
      ],
      adminLabel: '行政經歷',
      admin: [
        '佛光大學應用科技與設計學院院長 (2025/08/01~2025/10/31)',
        '佛光大學創意與科技學院院長 (2025/02/01~2025/07/31)',
        '國立東華大學行政副校長 (2021/10/01~2023/09/30)',
        '國立東華大學國際事務處處長 (2018/08/01~2024/01)',
        '國立東華大學理工學院代理院長 (2022/03~2023/04)',
        '國立東華大學英語培力研究院籌備處處長 (2021/10~2023/01)',
        '國立東華大學永續發展辦公室執行長 (2020/06~2022/04)',
        '國立東華大學國際事務處副處長 (2017/08~2018/07)',
        '國立東華大學物理學系主任 (2015/08~2018/07)',
        '國立東華大學亞洲學術合作中心主任 (2014/08~2015/07)',
        '國立東華大學國際事務處宣傳與招生組組長 (2012/08~2014/07)',
        '國立東華大學學生事務處課外活動組組長 (2008/08~2009/01)',
        '國立東華大學物理學系教授 (2007/08~2021/07)',
        '國立東華大學物理學系副教授 (2003/08~2007/07)',
        '國立東華大學物理學系助理教授 (1999/08~2003/07)'
      ],
      serviceLabel: '學術與服務經歷',
      service: [
        'MDPI 奈米材料編輯委員 (2020/09~)',
        '愛思唯爾華人物理期刊編輯 (2019/01~)',
        'MDPI 感應器編輯委員 (2019/01~)',
        '自然出版集團科學報導編輯委員 (2013/01~)',
        '台灣物理學會第一屆凝態物理學部執行委員會共同召集人 (2022/08~2024/01)',
        '台灣物理學會第一屆凝態物理學部執行委員 (2022/02~2024/01)',
        '科技部全球事務與科學發展中心規劃推動委員 (2018/10~2021/12)',
        '科技部自然司物理學門複審委員 (2017/01~2019/12)',
        '中華民國物理學會理事 (2016/01~2018/12)',
        '中華民國物理學會國際事務處處長 (2016/01~2018/12)',
        '愛思唯爾華人物理期刊編輯經理 (2015/08~2018/12)',
        '台灣資訊儲存協會理事 (2009/11/10~2017/10/22)'
      ],
      awardsLabel: '榮譽與獲獎',
      awards: [
        '東華頂尖人才學術獎勵 (2016-2025)',
        'ESI 科學與工程類 1% 高引用值 (2016~2022)',
        '東華研究突破獎 (2021，論文刊登於頂尖期刊 Advanced Materials)',
        '東華一等學術獎 (2021)',
        '亞太材料研究學會 GREEN 傑出研究成就與貢獻獎 (2019)',
        '教育部優良教師與公務人員獎 (2013)',
        '東華校級優良教師 (2007)',
        '東華研究優良獎勵 (2004~2015)'
      ]
    },
    impact: {
      title: '學術',
      subtitle: '影響力',
      ndhu: '國立東華大學',
      fgu: '佛光大學',
      worldRank: '世界排名',
      countryRank: '全國排名',
      uniRank: '全校排名',
      hIndex: 'H-Index 指標',
      total: '總計',
      last5: '近五年',
      ratio: '近五年 / 總計',
      source: '* 資料來源：AD Scientific Index'
    },
    contact: {
      title: '聯絡',
      subtitle: '方式',
      labelEmail: '電子郵件',
      labelPhone: '電話',
      labelFax: '傳真',
      email: 'yrma@mail.fgu.edu.tw',
      phone: '(03)9871000 分機 11010',
      fax: '(03)9874815',
      vcard: '儲存聯絡資訊',
      vcardModal: {
        title: '儲存聯絡資訊',
        add: '加入通訊錄',
        click: '點擊下載',
        downloadTooltip: '點擊下載電子名片',
      },
      footer: 'Copyright \u00A9 2026 馬遠榮 版權所有',
      developer: '陳奕廷 開發',
    }
  }
};

const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Ma;Yuan-Ron;;;
FN:Yuan-Ron Ma (馬遠榮)
TITLE:Vice President, Chair Professor
ORG:Fo Guang University
TEL;TYPE=WORK,VOICE:+886-3-9871000;ext=11010
TEL;TYPE=WORK,FAX:+886-3-9874815
EMAIL;TYPE=PREF,INTERNET:yrma@mail.fgu.edu.tw
END:VCARD`;

const PUB_PAGE_DESKTOP = 10;
const PUB_PAGE_MOBILE = 6;

export default function HomePage() {
  useRenderProfiler('MainPage');
  const { lang, setLang, isTransitioning } = useLanguage();
  const [pubFilter, setPubFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(PUB_PAGE_DESKTOP);
  const [publications, setPublications] = useState<Publication[]>(fallbackPublications);
  /** 與 SSR 一致先為 true；掛載後若有 session 快取則立刻還原並關閉 loader，避免 hydration 不一致 */
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const t = dict[lang];
  const isMobile = useIsMobile();

  React.useLayoutEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setVisibleCount(PUB_PAGE_MOBILE);
    }
  }, []);

  React.useLayoutEffect(() => {
    const cached = readCachedPapers();
    if (cached && cached.length > 0) {
      setPublications(cached);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(PAPERS_JSON_URL, { cache: 'default' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const parsedData = normalizePublicationsFromJson(data);

          writeCachedPapers(parsedData);
          startTransition(() => {
            setPublications(parsedData);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('Using fallback publications. Failed to fetch from GitHub:', err);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(publications.map((p) => String(p.year)))).sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [publications]);

  const filteredPublications = useMemo(() => {
    let result = [...publications];
    
    if (pubFilter === 'Selected') {
      result = result.filter((p) => p.citations >= 50);
    } else if (pubFilter !== 'All') {
      result = result.filter((p) => String(p.year) === pubFilter);
    }

    // Sort by corresponding author (is_star === '是') first, then year descending, then citations
    result.sort((a, b) => {
      // 1. Global priority: Corresponding author
      if (a.is_star === '是' && b.is_star !== '是') return -1;
      if (a.is_star !== '是' && b.is_star === '是') return 1;

      // 2. Secondary priority: Year descending
      if (b.year !== a.year) {
        return b.year - a.year;
      }

      // 3. Tertiary priority: Citations descending
      return b.citations - a.citations;
    });

    return result;
  }, [pubFilter, publications]);

  const featuredPublications = useMemo(
    () => computeFeaturedPublications(publications, 3),
    [publications]
  );
  const featuredDois = useMemo(
    () => new Set(featuredPublications.map((p) => p.doi)),
    [featuredPublications]
  );
  const publicationsRows = useMemo(() => {
    return filteredPublications.filter((p) => !featuredDois.has(p.doi));
  }, [filteredPublications, featuredDois]);

  const visiblePublications = useMemo(() => {
    return publicationsRows.slice(0, visibleCount);
  }, [publicationsRows, visibleCount]);

  const totalPubs = publications.length > 0 ? publications.length : '200+';
  const totalCitations = publications.length > 0 ? publications.reduce((sum, p) => sum + p.citations, 0) : '5000+';

  const handlePubFilterChange = React.useCallback((value: string) => {
    setPubFilter(value);
    setVisibleCount(isMobile ? PUB_PAGE_MOBILE : PUB_PAGE_DESKTOP);
  }, [isMobile]);

  const handleLoadMore = React.useCallback(() => {
    const step = isMobile ? PUB_PAGE_MOBILE : PUB_PAGE_DESKTOP;
    setVisibleCount((prev) => prev + step);
  }, [isMobile]);

  const handleDownloadVCard = () => {
    const blob = new Blob([vcardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Yuan-Ron_Ma.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050A18] bg-[radial-gradient(ellipse_120%_80%_at_50%_-18%,rgba(100,116,139,0.06),transparent_52%),radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.04),transparent_45%)] font-sans text-stone-400">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Background 1 */}
        <motion.div
          style={{ willChange: 'transform, opacity' }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.06 }
              : {
                  scale: [1, 1.1, 1],
                  opacity: [0.04, 0.06, 0.04],
                  rotate: [0, 60, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : { duration: 28, repeat: Infinity, ease: 'linear' }
          }
          className="absolute -left-[10%] -top-[20%] h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-slate-700/14 to-transparent blur-[80px] transform-gpu md:blur-[100px]"
        />
        {/* Background 2 */}
        <motion.div
          style={{ willChange: 'transform, opacity' }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.04 }
              : {
                  scale: [1, 1.25, 1],
                  opacity: [0.025, 0.045, 0.025],
                  x: [0, 60, 0],
                  y: [0, -30, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : { duration: 32, repeat: Infinity, ease: 'easeInOut' }
          }
          className="absolute -right-[20%] top-[40%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-tl from-[#5c4a32]/14 to-transparent blur-[120px] transform-gpu"
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.06] bg-[#050A18]/82 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex cursor-pointer items-center gap-2 font-display text-xl font-bold tracking-[0.25em] text-stone-100 transition-transform hover:scale-[1.02]">
            <span className="text-[#c4a77d]">Y.R.</span> MA
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden space-x-8 font-display text-xs uppercase tracking-[0.2em] text-stone-500 md:flex">
              <motion.a
                href="/"
                whileHover={{ y: -2, color: '#d4c4a8' }}
                className="group relative text-stone-400 transition-colors"
              >
                {t.nav.home}
                <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-[#b08d52]/80 transition-all duration-300 group-hover:w-full" />
              </motion.a>
              {['about', 'research', 'publications', 'contact'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  whileHover={{ y: -2, color: '#e8dcc4' }}
                  className="group relative transition-colors"
                >
                  {t.nav[item as keyof typeof t.nav]}
                  <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-[#b08d52]/70 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                animate={{
                  borderColor: isTransitioning ? 'rgba(196, 167, 125, 0.45)' : 'rgba(120, 113, 108, 0.35)',
                }}
                transition={{ duration: 0.28 }}
                className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono px-3 py-1.5 rounded-full ${uiTokens.buttonGhost}`}
              >
                <motion.span
                  className="inline-flex"
                  animate={{
                    rotate: isTransitioning ? [0, -14, 14, 0] : 0,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Globe className="h-3 w-3 text-[#a8906a]" />
                </motion.span>
                <span className="relative inline-flex min-h-[1em] min-w-[2.25rem] items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={lang}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute whitespace-nowrap"
                    >
                      {lang === 'en' ? '中文' : 'EN'}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.button>

              <button
                type="button"
                className="p-2 text-stone-400 transition-colors hover:text-[#d4c4a8] md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-white/[0.06] bg-[#050A18]/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col space-y-4 p-6 font-display text-xs uppercase tracking-[0.2em] text-stone-500">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 transition-colors hover:text-[#d4c4a8]"
                >
                  {t.nav.home}
                </Link>
                {['about', 'research', 'publications', 'contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2 transition-colors hover:text-[#e8dcc4]"
                  >
                    {t.nav[item as keyof typeof t.nav]}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <HeroStatsResearchSection
        heroText={t.hero}
        statsText={t.stats}
        researchText={t.research}
        totalPubs={totalPubs}
        totalCitations={totalCitations}
        isMobile={isMobile}
        prefersReducedMotion={prefersReducedMotion}
      />

      <PublicationsSection
        pubsText={t.pubs}
        lang={lang}
        pubFilter={pubFilter}
        uniqueYears={uniqueYears}
        isLoading={isLoading}
        featuredPublications={featuredPublications}
        visiblePublications={visiblePublications}
        filteredCount={filteredPublications.length}
        listRowCount={publicationsRows.length}
        listAllInFeatured={
          filteredPublications.length > 0 && publicationsRows.length === 0
        }
        isMobile={isMobile}
        prefersReducedMotion={prefersReducedMotion}
        onFilterChange={handlePubFilterChange}
        onLoadMore={handleLoadMore}
      />

      <AboutSection aboutText={t.about} lang={lang} />

      <BottomSections t={t} lang={lang} onDownloadVCard={handleDownloadVCard} />
    </main>
  );
}
