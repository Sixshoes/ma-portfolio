'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Publication, publications as fallbackPublications } from '@/lib/publications';
import { useLanguage } from '../LanguageContext';
import { BottomSections } from './sections/BottomSections';
import { PublicationsSection } from './sections/PublicationsSection';
import { AboutSection } from './sections/AboutSection';
import { HeroStatsResearchSection } from './sections/HeroStatsResearchSection';
import { useRenderProfiler } from './sections/useRenderProfiler';
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
      benchmark: '🔥 International Benchmark',
      keyFocus: '⭐ Key Focus',
      general: '📄 General Paper',
      quantum: 'Quantum Mechanics'
    },
    about: {
      title: 'Academic',
      subtitle: 'Journey',
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
      email: 'yrma@mail.fgu.edu.tw',
      phone: '+886-3-9871000 ext. 11010',
      fax: '+886-3-9874815',
      vcard: 'Save Contact Info',
      vcardModal: {
        title: 'Save Contact',
        add: 'Add to Contacts',
        click: 'Click to download'
      },
      footer: 'Copyright \u00A9 2026 Yuan-Ron Ma. All Rights Reserved.',
      developer: 'Developed by Yiting Chen'
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
      benchmark: '🔥 國際標竿',
      keyFocus: '⭐ 重點關注',
      general: '📄 一般論文',
      quantum: '量子力學'
    },
    about: {
      title: '學術',
      subtitle: '歷程',
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
      email: 'yrma@mail.fgu.edu.tw',
      phone: '(03)9871000 分機 11010',
      fax: '(03)9874815',
      vcard: '儲存聯絡資訊',
      vcardModal: {
        title: '儲存聯絡資訊',
        add: '加入通訊錄',
        click: '點擊下載'
      },
      footer: 'Copyright \u00A9 2026 馬遠榮 版權所有',
      developer: '陳奕廷 開發'
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

export default function HomePage() {
  useRenderProfiler('MainPage');
  const { lang, setLang } = useLanguage();
  const [pubFilter, setPubFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [publications, setPublications] = useState<Publication[]>(fallbackPublications);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPublications, setShowPublications] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const t = dict[lang];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setShowPublications(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    fetch('https://sixshoes.github.io/Ma-Research-Portal/papers.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPublications(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('Using fallback publications. Failed to fetch from GitHub:', err);
        setIsLoading(false);
      });
  }, []);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(publications.map(p => p.year))).sort((a, b) => Number(b) - Number(a));
  }, [publications]);

  const filteredPublications = useMemo(() => {
    let result = [...publications];
    
    if (pubFilter === 'Selected') {
      result = result.filter(p => Number(p.citations) >= 50);
    } else if (pubFilter !== 'All') {
      result = result.filter(p => p.year === pubFilter);
    }

    // Sort by corresponding author (is_star === '是') first, then year descending, then citations
    result.sort((a, b) => {
      // 1. Global priority: Corresponding author
      if (a.is_star === '是' && b.is_star !== '是') return -1;
      if (a.is_star !== '是' && b.is_star === '是') return 1;
      
      // 2. Secondary priority: Year descending
      if (Number(b.year) !== Number(a.year)) {
        return Number(b.year) - Number(a.year);
      }
      
      // 3. Tertiary priority: Citations descending
      return Number(b.citations) - Number(a.citations);
    });

    return result;
  }, [pubFilter, publications]);

  // Remove the useEffect that resets visibleCount
  const visiblePublications = useMemo(() => {
    return filteredPublications.slice(0, visibleCount);
  }, [filteredPublications, visibleCount]);

  const totalPubs = publications.length > 0 ? publications.length : '200+';
  const totalCitations = publications.length > 0 ? publications.reduce((sum, p) => sum + (p.citations || 0), 0) : '5000+';

  const handlePubFilterChange = React.useCallback((value: string) => {
    setPubFilter(value);
    setVisibleCount(10);
  }, []);

  const handleLoadMore = React.useCallback(() => {
    setVisibleCount((prev) => prev + 10);
  }, []);

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
    <main className="min-h-screen bg-[#080C16] text-slate-300 font-sans overflow-x-hidden relative bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.08),transparent_35%)]">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={prefersReducedMotion ? { opacity: 0.1 } : {
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
            rotate: [0, 60, 0]
          }}
          transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-teal-900/20 to-transparent blur-[80px] md:blur-[100px]"
        />
        <motion.div 
          animate={prefersReducedMotion ? { opacity: 0.06 } : { 
            scale: [1, 1.25, 1],
            opacity: [0.04, 0.08, 0.04],
            x: [0, 60, 0],
            y: [0, -30, 0]
          }}
          transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 32, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-amber-900/20 to-transparent blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 bg-[#080C16]/75 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-display text-xl font-bold tracking-[0.25em] text-white flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
            <span className="text-amber-400">Y.R.</span> MA
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex space-x-8 text-xs uppercase tracking-[0.2em] font-display text-slate-400">
              <motion.a 
                href="/" 
                whileHover={{ y: -2, color: '#2dd4bf' }}
                className="transition-colors relative group text-teal-500/80"
              >
                {t.nav.home}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
              {['about', 'research', 'publications', 'contact'].map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${item}`} 
                  whileHover={{ y: -2, color: '#fbbf24' }}
                  className="transition-colors relative group"
                >
                  {t.nav[item as keyof typeof t.nav]}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-slate-300 hover:text-amber-400 transition-colors border border-white/10 px-3 py-1.5 rounded-full bg-white/[0.02]"
              >
                <Globe className="w-3 h-3" />
                {lang === 'en' ? '中文' : 'EN'}
              </motion.button>

              <button 
                className="md:hidden p-2 text-slate-300 hover:text-amber-400 transition-colors"
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
              className="md:hidden bg-[#0B101E]/95 backdrop-blur-xl border-b border-white/[0.08] overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-4 text-xs uppercase tracking-[0.2em] font-display text-slate-400">
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-teal-400 transition-colors py-2"
                >
                  {t.nav.home}
                </Link>
                {['about', 'research', 'publications', 'contact'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item}`} 
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-amber-400 transition-colors py-2"
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
        showPublications={showPublications}
        isLoading={isLoading}
        visiblePublications={visiblePublications}
        filteredCount={filteredPublications.length}
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
