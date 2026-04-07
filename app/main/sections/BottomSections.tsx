'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  UserPlus,
  Download,
} from 'lucide-react';

type BottomSectionsProps = {
  t: {
    impact: {
      title: string;
      subtitle: string;
      ndhu: string;
      fgu: string;
      worldRank: string;
      countryRank: string;
      uniRank: string;
      hIndex: string;
      total: string;
      last5: string;
      ratio: string;
      source: string;
    };
    contact: {
      title: string;
      subtitle: string;
      email: string;
      phone: string;
      fax: string;
      vcardModal: {
        add: string;
        click: string;
      };
      footer: string;
      developer: string;
    };
  };
  lang: 'en' | 'zh';
  onDownloadVCard: () => void;
};

function BottomSectionsComponent({ t, lang, onDownloadVCard }: BottomSectionsProps) {
  return (
    <>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0B101E]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 hover:border-amber-500/30 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
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

              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-10">
                <div className="text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-400 stroke-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-display font-bold text-white">49,442</div>
                  <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-red-400 stroke-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-display font-bold text-white">225</div>
                  <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 stroke-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-display font-bold text-white">1</div>
                  <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 md:p-6">
                <h4 className="text-xs md:text-sm font-mono uppercase tracking-widest text-slate-400 mb-6 text-center">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-amber-400">62</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">47</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">0.758</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#0B101E]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 hover:border-purple-500/30 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
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

              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-10">
                <div className="text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-400 stroke-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-display font-bold text-white">80,658</div>
                  <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-red-400 stroke-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-display font-bold text-white">423</div>
                  <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                    <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-purple-400 stroke-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-display font-bold text-white">2</div>
                  <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 md:p-6">
                <h4 className="text-xs md:text-sm font-mono uppercase tracking-widest text-slate-400 mb-6 text-center">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-purple-400">52</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">38</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">0.731</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-32 bg-gradient-to-b from-[#0B101E]/60 to-[#090E1A]/70 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 relative z-10"
        >
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-7xl text-white mb-6">
              <span className="font-display font-light text-amber-500/90 tracking-wide">{t.contact.title}</span> <br />
              <span className="font-display font-bold tracking-tight">{t.contact.subtitle}</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-teal-500 mx-auto rounded-full opacity-50"></div>
          </div>

          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <a href={`mailto:${t.contact.email}`} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                    <Mail className="w-5 h-5 text-amber-400 stroke-1" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Email</div>
                    <div className="text-lg text-slate-200 group-hover:text-amber-400 transition-colors">{t.contact.email}</div>
                  </div>
                </a>

                <a href={`tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300">
                    <Phone className="w-5 h-5 text-teal-400 stroke-1" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Phone</div>
                    <div className="text-lg text-slate-200 group-hover:text-teal-400 transition-colors">{t.contact.phone}</div>
                  </div>
                </a>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                    <Printer className="w-5 h-5 text-purple-400 stroke-1" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Fax</div>
                    <div className="text-lg text-slate-200 group-hover:text-purple-400 transition-colors">{t.contact.fax}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 border-t md:border-t-0 md:border-l border-white/[0.05]">
                <button
                  onClick={onDownloadVCard}
                  className="group relative w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-amber-500/10 to-teal-500/10 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(251,191,36,0.2)] hover:scale-105 hover:border-amber-500/30 transition-all duration-500"
                  title={lang === 'en' ? 'Tap to download' : '點擊下載'}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <UserPlus className="w-12 h-12 text-slate-300 group-hover:text-amber-400 transition-colors relative z-10" />
                </button>
                <div className="text-center">
                  <div className="text-sm font-display tracking-widest uppercase text-white mb-2">
                    {t.contact.vcardModal.add}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mx-auto">
                    <Download className="w-3 h-3" />
                    {t.contact.vcardModal.click}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="w-full py-8 mt-24 text-center border-t border-white/10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
              {t.contact.footer}
            </p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600">
              {t.contact.developer}
            </p>
          </footer>
        </motion.div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
