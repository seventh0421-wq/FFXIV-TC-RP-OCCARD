
export type Orientation = 'portrait' | 'landscape';
export type BorderStyle = 'solid' | 'double' | 'dashed' | 'dotted';

export interface CharacterInfo {
  name: string;
  motto: string; // 新增：座右銘
  server: string;
  gender: string;
  race: string;
  age: string;
  height: string;
  orientation: string;
  job: string;
  personality: string;
  background: string;
  birthplace: string;
  likes: string;
  dislikes: string;
  selectedFont?: string;
  cardFontSize?: number; 
  
  // Custom Styles
  customBorderColor?: string;
  customBgStart?: string;
  customBgEnd?: string;
  customTextColor?: string;
  customAccentColor?: string;
  customBorderStyle?: BorderStyle;
  customBorderWidth?: number;
}

export interface Traits {
  muscles: number;
  temperature: number;
  voiceVolume: number;
  voicePitch: number;
  sensitivity: number;
  appetite: number;
  tableManners: number;
  alcoholPref: number;
  alcoholTolerance: number;
  athleticism: number;
  combatPref: number;
  combatSkill: number;
  combatRange: number;
}

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

export interface FrameStyle {
  id: string;
  name: string;
  borderColor: string;
  bgStart: string;
  bgEnd: string;
  accentColor: string;
  textColor: string;
}
