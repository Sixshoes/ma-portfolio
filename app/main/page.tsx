'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Publication, publications as fallbackPublications } from '@/lib/publications';
import { 
  ExternalLink, 
  Magnet, 
  BatteryCharging, 
  Atom, 
  Contrast, 
  Network,
  Mail, 
  MapPin, 
  GraduationCap,
  Globe,
  Quote,
  Star,
  Phone,
  Download
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
      patents: 'Patents',
      scopusNote: '* Citation data sourced from Scopus',
      expValue: '30+',
      patentsValue: '15+'
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
      doi: 'DOI',
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
      vcard: 'Download vCard',
      footer: '© 2026 Yuan-Ron Ma (Y.R. Ma) • Advanced Materials & Quantum Devices'
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
      patents: '項專利',
      scopusNote: '* 引用數據來源為 Scopus',
      expValue: '30+',
      patentsValue: '15+'
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
      doi: '數位物件識別碼 (DOI)',
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
      vcard: '下載 vCard',
      footer: '© 2026 馬遠榮 (Yuan-Ron Ma) • 先進材料與量子元件實驗室'
    }
  }
};

export default function HomePage() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [pubFilter, setPubFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [publications, setPublications] = useState<Publication[]>(fallbackPublications);
  const t = dict[lang];

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
      })
      .catch(err => {
        console.warn('Using fallback publications. Failed to fetch from GitHub:', err);
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

  const getHighlightText = (citations: number) => {
    if (citations >= 100) return t.pubs.benchmark;
    if (citations >= 50) return t.pubs.keyFocus;
    return t.pubs.general;
  };

  const handleDownloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Ma;Yuan-Ron;;;
FN:Yuan-Ron Ma (馬遠榮)
TITLE:Vice President, Chair Professor
ORG:Fo Guang University
TEL;TYPE=WORK,VOICE:+886-3-9871000;ext=11010
EMAIL;TYPE=PREF,INTERNET:yrma@mail.fgu.edu.tw
URL:${window.location.origin}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Yuan-Ron_Ma.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderListItem = (text: string) => {
    const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
    if (match) {
      return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 border-b border-white/[0.02] last:border-0 group-hover:border-white/[0.05] transition-colors">
          <span className="text-slate-300 font-medium leading-relaxed">{match[1]}</span>
          <span className="text-[10px] font-mono text-slate-500 bg-white/[0.02] px-2 py-1 rounded whitespace-nowrap mt-1 sm:mt-0">{match[2]}</span>
        </div>
      );
    }
    return <div className="py-2 text-slate-300 leading-relaxed">{text}</div>;
  };

  return (
    <main className="min-h-screen bg-[#080C16] text-slate-300 font-sans overflow-x-hidden relative">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-teal-900/20 to-transparent blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.1, 0.05],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-amber-900/20 to-transparent blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 bg-[#080C16]/70 backdrop-blur-xl border-b border-white/[0.05]"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-display text-xl font-bold tracking-widest text-white flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
            <span className="text-amber-400">Y.R.</span> MA
          </div>
          <div className="flex items-center gap-8">
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
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-slate-300 hover:text-amber-400 transition-colors border border-white/10 px-3 py-1.5 rounded-full bg-white/[0.02]"
            >
              <Globe className="w-3 h-3" />
              {lang === 'en' ? '中文' : 'EN'}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[90vh] relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block border border-amber-500/20 bg-amber-500/5 text-amber-400/90 px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-8"
          >
            {t.hero.role}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-white"
          >
            <span className="font-display font-light text-amber-500/90 tracking-wide inline-block hover:scale-105 transition-transform origin-left">{t.hero.title1}</span> <br />
            <span className="font-display font-bold tracking-tight inline-block hover:scale-105 transition-transform origin-left">{t.hero.title2}</span> {t.hero.title3} <br />
            <span className="font-display font-light text-teal-400/80 inline-block hover:scale-105 transition-transform origin-left">{t.hero.title4}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-lg text-slate-400 max-w-md leading-relaxed mb-10 font-light"
          >
            {t.hero.desc}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex space-x-4"
          >
            <motion.a 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251,191,36,0.4)" }}
              whileTap={{ scale: 0.95 }}
              href="#publications" 
              className="bg-amber-400 text-[#080C16] px-8 py-4 rounded-full text-xs font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(251,191,36,0.15)] inline-block"
            >
              {t.hero.cta}
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative aspect-[4/5] w-full max-w-md mx-auto"
        >
          {/* High-tech Image Container */}
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-amber-500/20 rounded-3xl blur-3xl animate-pulse" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full bg-[#080C16] rounded-3xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center"
          >
            {/* Thematic Background: Graphene Hex Grid */}
            <div className="absolute inset-0 opacity-40">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hex" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                    <path d="M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hex)" />
              </svg>
            </div>
            
            {/* Abstract Quantum Nodes (Glowing Orbs) */}
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-teal-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Profile Image with Soft Gradient Blending */}
            <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl">
              <img 
                src="https://sixshoes.github.io/Ma-Research-Portal/profile.jpg" 
                alt="Prof. Y.R. Ma"
                className="w-full h-full object-cover object-top transition-all duration-1000 hover:scale-105"
                onError={(e) => {
                  // Fallback to a placeholder if the image fails to load
                  e.currentTarget.src = "https://picsum.photos/seed/profma/800/1000";
                }}
              />
              {/* Gradient overlays to blend the image into the dark background */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-[#080C16]/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080C16] via-transparent to-[#080C16] opacity-50 pointer-events-none" />
            </div>

            {/* High-Tech HUD Elements */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-teal-500/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-teal-500/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-teal-500/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-teal-500/50 rounded-br-lg" />
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"
              />
            </div>
          </motion.div>
          
          {/* Decorative Elements */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-6 top-1/4 w-12 h-12 border border-amber-500/30 rounded-full flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -left-6 bottom-1/4 w-16 h-16 border border-teal-500/30 rounded-full flex items-center justify-center"
          >
            <div className="w-1 h-1 bg-teal-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/[0.05] bg-white/[0.01] py-16 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="font-display font-light text-4xl md:text-5xl text-white mb-2">{totalPubs}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-amber-400/80">{t.stats.pubs}</div>
          </div>
          <div>
            <div className="font-display font-light text-4xl md:text-5xl text-white mb-2">{totalCitations}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-amber-400/80">{t.stats.citations}</div>
          </div>
          <div>
            <div className="font-display font-light text-4xl md:text-5xl text-white mb-2">{t.stats.expValue}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-amber-400/80">{t.stats.exp}</div>
          </div>
          <div>
            <div className="font-display font-light text-4xl md:text-5xl text-white mb-2">{t.stats.patentsValue}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-amber-400/80">{t.stats.patents}</div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-slate-500/80">{t.stats.scopusNote}</p>
        </div>
      </section>

      {/* Research Interests */}
      <section id="research" className="py-32 px-6 max-w-7xl mx-auto relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-end mb-20 relative z-10">
          <h2 className="text-5xl md:text-7xl text-white">
            <span className="font-display font-light text-amber-500/90 tracking-wide">{t.research.title}</span> <br />
            <span className="font-display font-bold tracking-tight">{t.research.subtitle}</span>
          </h2>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-teal-400/80 mt-4 md:mt-0 border border-teal-500/20 px-4 py-2 rounded-full bg-teal-500/5">
            {t.research.desc}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {t.research.items.map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-[#0B101E]/80 backdrop-blur-xl border border-white/[0.05] p-10 rounded-2xl hover:border-amber-500/30 hover:bg-[#0F1629] transition-all duration-500 group relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(251,191,36,0.1)]"
            >
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/[0.02] rounded-xl flex items-center justify-center mb-8 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors duration-500 border border-white/[0.05] group-hover:border-amber-500/20 group-hover:rotate-6">
                  <item.icon className="w-6 h-6 stroke-1" />
                </div>
                <h3 className="font-display text-2xl font-medium text-white mb-4 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Publications Section */}
      <section id="publications" className="py-32 bg-[#0B101E]/30 border-y border-white/[0.05] relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20">
            <h2 className="text-5xl md:text-7xl text-white mb-4">
              <span className="font-display font-light text-amber-500/90 tracking-wide">{t.pubs.title}</span> <br />
              <span className="font-display font-bold tracking-tight">{t.pubs.subtitle}</span>
            </h2>
            <p className="text-teal-400/80 font-mono uppercase text-[10px] tracking-[0.2em] mb-12">{t.pubs.desc}</p>
            
            {/* Filter UI */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Filter by:</span>
              <div className="relative">
                <select 
                  value={pubFilter}
                  onChange={(e) => {
                    setPubFilter(e.target.value);
                    setVisibleCount(10);
                  }}
                  className="appearance-none bg-[#0B101E]/80 border border-white/[0.1] text-slate-300 px-6 py-3 pr-12 rounded-full text-sm font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all cursor-pointer backdrop-blur-md"
                >
                  <option value="All">All Publications</option>
                  <option value="Selected">Selected / Highlighted</option>
                  <optgroup label="By Year">
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {visiblePublications.map((pub, i) => {
              // Fix: cover_url is actually the Graphical Abstract (ga1), file_img is the Journal Cover (X...)
              const abstractImg = pub.cover_url;
              const journalImg = pub.file_img;
              const hasAbstract = !!abstractImg;
              const hasJournal = !!journalImg;
              const isSameImg = abstractImg === journalImg;

              let mainImg = abstractImg;
              let mainLabel = t.pubs.abstract;
              let secondaryImg = (!isSameImg && hasJournal) ? journalImg : null;

              if (!hasAbstract && hasJournal) {
                mainImg = journalImg;
                mainLabel = t.pubs.cover;
              } else if (!hasAbstract && !hasJournal) {
                mainImg = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop";
                mainLabel = t.pubs.quantum;
              }

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="flex flex-col lg:flex-row gap-8 p-6 md:p-8 bg-[#0B101E]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl hover:border-amber-500/30 transition-all duration-500 group shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(251,191,36,0.1)]"
                >
                  {/* Visuals Column */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0">
                    <div className="relative w-full aspect-video bg-white rounded-xl border border-white/[0.05] p-2 flex items-center justify-center group/img overflow-hidden shadow-inner">
                      <img 
                        src={mainImg} 
                        alt={mainLabel} 
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-105" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to a fixed quantum mechanics related image
                          e.currentTarget.src = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop";
                          e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                        }}
                      />
                      <div className="absolute top-2 left-2 text-[10px] font-mono uppercase tracking-widest text-slate-800 bg-white/90 px-2 py-1 rounded border border-slate-200 backdrop-blur-md shadow-sm">
                        {mainLabel}
                      </div>
                    </div>
                    {secondaryImg && (
                      <div className="relative w-1/3 max-w-[120px] aspect-[3/4] bg-white rounded-xl border border-white/[0.05] p-1 flex items-center justify-center group/img overflow-hidden shadow-md">
                        <img 
                          src={secondaryImg} 
                          alt={t.pubs.cover} 
                          className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover/img:scale-105" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-1 left-1 text-[8px] font-mono uppercase tracking-widest text-slate-800 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 backdrop-blur-md">
                          {t.pubs.cover}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details Column */}
                  <div className="w-full lg:w-2/3 flex flex-col">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      {/* Highlight Badge */}
                      <span className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
                        {getHighlightText(pub.citations)}
                      </span>
                      
                      {/* Star Badge */}
                      {pub.is_star === '是' ? (
                        <span className="bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-mono text-teal-300 flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-teal-400/50" /> {t.pubs.corresponding}
                        </span>
                      ) : (
                        <span className="bg-white/[0.02] border border-white/[0.05] px-3 py-1 rounded-full text-xs font-mono text-slate-400">
                          {t.pubs.coauthor}
                        </span>
                      )}

                      {/* Year Badge */}
                      <span className="bg-white/[0.02] border border-white/[0.05] px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                        {t.pubs.year}: {pub.year}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl md:text-3xl text-slate-200 mb-6 group-hover:text-amber-400 transition-colors leading-snug">
                      {pub.title}
                    </h3>

                    <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-white/[0.05]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{t.pubs.journal}</div>
                          <div className="text-sm text-slate-300 font-medium">{pub.journal}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{t.pubs.citations}</div>
                          <div className="text-sm text-slate-300 flex items-center gap-2 font-mono">
                            <Quote className="w-3 h-3 text-teal-500/50"/> {pub.citations}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{t.pubs.doi}</div>
                          <a 
                            href={pub.doi} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-amber-400/80 hover:text-amber-400 flex items-center gap-2 break-all transition-colors"
                          >
                            {pub.doi} <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {visibleCount < filteredPublications.length && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-8 py-3 rounded-full border border-amber-500/30 text-amber-500 font-mono text-sm hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300 flex items-center gap-2"
              >
                {lang === 'zh' ? '載入更多' : 'Load More'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About / Leadership */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="aspect-square bg-[#0B101E] rounded-3xl overflow-hidden border border-white/[0.05] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
               <Image 
                src="https://picsum.photos/seed/university/1000/1000" 
                alt="Fo Guang University"
                fill
                className="object-cover opacity-50 mix-blend-luminosity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-12 -right-6 md:-right-12 bg-[#0B101E]/90 backdrop-blur-xl p-8 md:p-10 border border-amber-500/20 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] max-w-xs">
              <GraduationCap className="w-8 h-8 mb-4 text-amber-400 stroke-1" />
              <h4 className="font-display font-light text-xl text-white mb-3 tracking-wide">{t.about.leadership}</h4>
              <p className="text-sm leading-relaxed text-slate-400 font-light">
                {t.about.leadershipDesc}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-5xl md:text-7xl text-white mb-16">
              <span className="font-display font-light text-amber-500/90 tracking-wide">{t.about.title}</span> <br />
              <span className="font-display font-bold tracking-tight">{t.about.subtitle}</span>
            </h2>
            <div className="space-y-10">
              <div className="flex gap-6 group">
                <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-amber-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80 mb-4">{t.about.roleLabel}</div>
                  <div className="space-y-1">
                    {t.about.roles.map((role, idx) => (
                      <div key={idx}>{renderListItem(role)}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-blue-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400/80 mb-4">{t.about.eduLabel}</div>
                  <div className="space-y-1">
                    {t.about.edu.map((eduItem, idx) => (
                      <div key={idx}>{renderListItem(eduItem)}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-purple-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-400/80 mb-4">{t.about.adminLabel}</div>
                  <div className="space-y-1">
                    {t.about.admin.map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-emerald-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400/80 mb-4">{t.about.serviceLabel}</div>
                  <div className="space-y-1">
                    {t.about.service.map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-rose-400 transition-colors" />
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose-400/80 mb-4">{t.about.awardsLabel}</div>
                  <div className="space-y-1">
                    {t.about.awards.map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl text-white mb-6">
              <span className="font-display font-light text-amber-500/90 tracking-wide">{t.impact.title}</span> <br />
              <span className="font-display font-bold tracking-tight">{t.impact.subtitle}</span>
            </h2>
            <p className="text-xs font-mono text-slate-500/80 mt-4">{t.impact.source}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NDHU Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0B101E]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 hover:border-amber-500/30 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-8 h-8 text-amber-400 stroke-1" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white">{t.impact.ndhu}</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">Hualien, Taiwan</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-blue-400 stroke-1" />
                  </div>
                  <div className="text-2xl font-display font-bold text-white">49,442</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-red-400 stroke-1" />
                  </div>
                  <div className="text-2xl font-display font-bold text-white">225</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5 text-emerald-400 stroke-1" />
                  </div>
                  <div className="text-2xl font-display font-bold text-white">1</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6">
                <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-6 text-center">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-display font-bold text-amber-400">62</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-white">47</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-white">0.758</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FGU Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#0B101E]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 hover:border-purple-500/30 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-8 h-8 text-purple-400 stroke-1" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white">{t.impact.fgu}</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">Yilan County, Taiwan</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-blue-400 stroke-1" />
                  </div>
                  <div className="text-2xl font-display font-bold text-white">80,658</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5 text-red-400 stroke-1" />
                  </div>
                  <div className="text-2xl font-display font-bold text-white">423</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5 text-purple-400 stroke-1" />
                  </div>
                  <div className="text-2xl font-display font-bold text-white">2</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6">
                <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-6 text-center">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-display font-bold text-purple-400">52</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-white">38</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-white">0.731</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-[#0B101E]/50 border-t border-white/[0.05] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 text-center relative z-10"
        >
          <h2 className="text-5xl md:text-7xl text-white mb-16">
            <span className="font-display font-light text-amber-500/90 tracking-wide">{t.contact.title}</span> <br />
            <span className="font-display font-bold tracking-tight">{t.contact.subtitle}</span>
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 mb-16">
            <a href={`mailto:${t.contact.email}`} className="flex items-center gap-4 bg-white/[0.02] px-8 py-5 rounded-full border border-white/[0.05] hover:border-amber-500/30 hover:bg-white/[0.04] transition-all backdrop-blur-sm group">
              <Mail className="w-5 h-5 text-amber-400 stroke-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-display tracking-[0.1em] text-white">{t.contact.email}</span>
            </a>
            <a href={`tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-4 bg-white/[0.02] px-8 py-5 rounded-full border border-white/[0.05] hover:border-teal-500/30 hover:bg-white/[0.04] transition-all backdrop-blur-sm group">
              <Phone className="w-5 h-5 text-teal-400 stroke-1 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-display tracking-[0.1em] text-white">{t.contact.phone}</span>
            </a>
          </div>
          <div className="flex justify-center mb-24">
            <button 
              onClick={handleDownloadVCard}
              className="group relative flex items-center gap-3 bg-[#0B101E]/80 text-white px-8 py-4 rounded-full font-display tracking-widest text-sm uppercase border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all duration-500 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">{t.contact.vcard}</span>
            </button>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
            {t.contact.footer}
          </div>
        </motion.div>
      </section>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  );
}
