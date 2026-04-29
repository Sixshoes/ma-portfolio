/**
 * Academic impact metrics - previously hardcoded in BottomSections.tsx.
 * Source: AD Scientific Index
 */

export type InstitutionImpact = {
  location: string;
  worldRank: string;
  countryRank: string;
  uniRank: string;
  hIndex: { total: string; last5: string; ratio: string };
};

export const impactData: Record<'ndhu' | 'fgu', InstitutionImpact> = {
  ndhu: {
    location: 'Hualien, Taiwan',
    worldRank: '49,442',
    countryRank: '225',
    uniRank: '1',
    hIndex: { total: '62', last5: '47', ratio: '0.758' },
  },
  fgu: {
    location: 'Yilan County, Taiwan',
    worldRank: '80,658',
    countryRank: '423',
    uniRank: '2',
    hIndex: { total: '52', last5: '38', ratio: '0.731' },
  },
};

export const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Ma;Yuan-Ron;;;
FN:Yuan-Ron Ma (???)
TITLE:Vice President, Chair Professor
ORG:Fo Guang University
TEL;TYPE=WORK,VOICE:+886-3-9871000;ext=11010
TEL;TYPE=WORK,FAX:+886-3-9874815
EMAIL;TYPE=PREF,INTERNET:yrma@gm.fgu.edu.tw
END:VCARD`;
