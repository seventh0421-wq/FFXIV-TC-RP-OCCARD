
import { FrameStyle, BorderStyle } from './types';

export const FRAME_STYLES: FrameStyle[] = [
  {
    id: 'allagan-ultimate',
    name: '亞拉戈終極',
    borderColor: '#ff3131',
    bgStart: '#000000',
    bgEnd: '#1a0000',
    accentColor: '#ff0000',
    textColor: '#ffffff'
  },
  {
    id: 'cyber-neon',
    name: '數位霓虹',
    borderColor: '#00f2ff',
    bgStart: '#050505',
    bgEnd: '#001a1a',
    accentColor: '#00f2ff',
    textColor: '#ffffff'
  },
  {
    id: 'classic-gold',
    name: '經典金框',
    borderColor: '#d4af37',
    bgStart: '#1a1a1a',
    bgEnd: '#3a3a3a',
    accentColor: '#d4af37',
    textColor: '#ffffff'
  },
  {
    id: 'eorzea-blue',
    name: '艾歐澤亞藍',
    borderColor: '#3b82f6',
    bgStart: '#0f172a',
    bgEnd: '#1e3a8a',
    accentColor: '#60a5fa',
    textColor: '#ffffff'
  },
  {
    id: 'void-purple',
    name: '虛空深紫',
    borderColor: '#a855f7',
    bgStart: '#1e1b4b',
    bgEnd: '#4c1d95',
    accentColor: '#c084fc',
    textColor: '#ffffff'
  },
  {
    id: 'modern-minimalist',
    name: '現代極簡',
    borderColor: '#334155',
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    accentColor: '#94a3b8',
    textColor: '#f8fafc'
  }
];

export const BORDER_TYPES: { id: BorderStyle; name: string }[] = [
  { id: 'solid', name: '實線 Solid' },
  { id: 'double', name: '雙線 Double' },
  { id: 'dashed', name: '虛線 Dashed' },
  { id: 'dotted', name: '點點 Dotted' }
];

export const SERVERS = [
  '鳳凰',
  '伊弗利特',
  '利維坦',
  '迦樓羅',
  '巴哈姆特',
  '奧汀',
  '泰坦'
];

export const JOBS = [
  '騎士', '戰士', '暗黑騎士', '絕槍戰士',
  '白魔道士', '學者', '占星術師', '賢者',
  '武僧', '龍騎士', '忍者', '武士', '奪魂者', '毒蛇劍士',
  '吟遊詩人', '機工士', '舞者',
  '黑魔道士', '召喚師', '赤魔道士', '繪靈法師'
];

export const RACES = [
  '人族 (Hyur)', '精靈族 (Elezen)', '拉拉菲爾 (Lalafell)', '貓魅族 (Miqo\'te)',
  '魯加族 (Roegadyn)', '敖龍族 (Au Ra)', '維埃拉族 (Viera)', '硌獅族 (Hrothgar)'
];

export const FONT_OPTIONS = [
  { id: 'noto-sans', name: '預設黑體', family: "'Noto Sans TC', sans-serif" },
  { id: 'zen-old-mincho', name: 'Zen Old Mincho', family: "'Zen Old Mincho', serif" },
  { id: 'iansui', name: '芫荽 (Klee One)', family: "'Klee One', cursive" },
  { id: 'yusei-magic', name: 'Yusei Magic', family: "'Yusei Magic', sans-serif" },
  { id: 'songti', name: '史詩宋體', family: "'Noto Serif TC', serif" },
  { id: 'zcool', name: '趣味圓體', family: "'ZCOOL KuaiLe', cursive" }
];
