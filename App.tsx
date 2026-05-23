
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { toPng } from 'html-to-image';
import Card from './components/Card';
import TraitSelector from './components/SliderInput';
import { CharacterInfo, Traits, Orientation, ImageTransform, FrameStyle, BorderStyle } from './types';
import { FRAME_STYLES, JOBS, RACES, FONT_OPTIONS, BORDER_TYPES } from './constants';
import { improveDescription } from './services/geminiService';

const initialInfo: CharacterInfo = {
  name: '',
  motto: '',
  server: '',
  gender: '',
  race: '',
  age: '',
  height: '',
  orientation: '',
  job: '',
  personality: '',
  background: '',
  birthplace: '',
  likes: '',
  dislikes: '',
  selectedFont: FONT_OPTIONS[0].family,
  cardFontSize: 100, 
  customBorderColor: FRAME_STYLES[0].borderColor,
  customBgStart: FRAME_STYLES[0].bgStart,
  customBgEnd: FRAME_STYLES[0].bgEnd,
  customTextColor: FRAME_STYLES[0].textColor,
  customAccentColor: FRAME_STYLES[0].accentColor,
  customBorderStyle: 'solid',
  customBorderWidth: 4
};

const initialTraits: Traits = {
  muscles: 50,
  temperature: 50,
  voiceVolume: 50,
  voicePitch: 50,
  sensitivity: 50,
  appetite: 50,
  tableManners: 50,
  alcoholPref: 50,
  alcoholTolerance: 50,
  athleticism: 50,
  combatPref: 50,
  combatSkill: 50,
  combatRange: 50,
};

const initialTransform: ImageTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

const LIMITS = {
  personality: 120,
  background: 90 
};

const App: React.FC = () => {
  const [info, setInfo] = useState<CharacterInfo>(initialInfo);
  const [traits, setTraits] = useState<Traits>(initialTraits);
  const [visibleTraits, setVisibleTraits] = useState<Set<string>>(new Set(['muscles', 'sensitivity', 'athleticism', 'combatRange', 'combatPref']));
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [style, setStyle] = useState<FrameStyle>(FRAME_STYLES[0]);
  const [image, setImage] = useState<string | null>(null);
  const [transform, setTransform] = useState<ImageTransform>(initialTransform);
  const [isImproving, setIsImproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [showConsent, setShowConsent] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth - 48;
        const cardWidth = orientation === 'landscape' ? 800 : 450;
        if (containerWidth < cardWidth) {
          setPreviewScale(containerWidth / cardWidth);
        } else {
          setPreviewScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [orientation]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setTransform(initialTransform);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    const wrapper = cardRef.current.parentElement;
    const prevTransform = wrapper?.style.transform ?? '';
    if (wrapper) wrapper.style.transform = 'none';

    const scrollArea = cardRef.current.querySelector('.card-content-scroll') as HTMLElement;
    const prevScrollTop = scrollArea?.scrollTop ?? 0;
    if (scrollArea) {
      scrollArea.scrollTop = 0;
      scrollArea.style.overflowY = 'visible'; // ← 這行是新增的
    }

    await new Promise(r => setTimeout(r, 400));

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio * 2 || 4,  // 乘以 2 讓解析度翻倍
      });

      const link = document.createElement('a');
      link.download = `FF14_角色卡_${info.name || 'Export'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed using html-to-image:', error);
    } finally {
      if (wrapper) wrapper.style.transform = prevTransform;
      if (scrollArea) {
        scrollArea.style.overflowY = 'auto'; // ← 截完還原
        scrollArea.scrollTop = prevScrollTop;
      }
      setIsExporting(false);
    }
  };

  const updateInfo = (field: keyof CharacterInfo, value: any) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  const selectPresetStyle = (s: FrameStyle) => {
    setStyle(s);
    setInfo(prev => ({
      ...prev,
      customBorderColor: s.borderColor,
      customBgStart: s.bgStart,
      customBgEnd: s.bgEnd,
      customTextColor: s.textColor,
      customAccentColor: s.accentColor,
    }));
  };

  const updateTrait = (field: keyof Traits, value: number) => {
    setTraits(prev => ({ ...prev, [field]: value }));
    // 調整數值時自動開啟顯示
    if (!visibleTraits.has(field)) {
      const next = new Set(visibleTraits);
      next.add(field);
      setVisibleTraits(next);
    }
  };

  const toggleTraitVisibility = (field: string) => {
    const next = new Set(visibleTraits);
    if (next.has(field)) {
      next.delete(field);
    } else {
      next.add(field);
    }
    setVisibleTraits(next);
  };

  const handleImproveText = async (type: 'personality' | 'background') => {
    setIsImproving(true);
    const improved = await improveDescription(info[type], type);
    const limit = LIMITS[type];
    const finalResult = improved.length > limit ? improved.substring(0, limit) : improved;
    updateInfo(type, finalResult);
    setIsImproving(false);
  };

  const CharacterCounter = ({ current, max }: { current: number, max: number }) => {
    const isOver = current >= max;
    return (
      <div className={`text-[14px] text-right mt-1 font-mono ${isOver ? 'text-red-400' : 'text-white'}`}>
        [{current.toString().padStart(3, '0')} / {max}]
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 text-white">
      {/* 同意視窗 Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(0,242,255,0.3)] p-8 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 -rotate-45 translate-x-16 -translate-y-16"></div>
            <h2 className="text-2xl font-bold mb-6 tech-font text-cyan-400 border-b border-cyan-900 pb-2 tracking-[0.2em] flex items-center">
              <span className="mr-3">■</span> 使用注意事項 USAGE_NOTICE
            </h2>
            
            <div className="space-y-6 text-white leading-relaxed text-base">
              <div className="flex gap-4">
                <div className="text-cyan-500 font-bold tech-font mt-1">01</div>
                <div>
                  <h4 className="text-white font-bold mb-1">版權聲明</h4>
                  <p className="opacity-70">本工具為 FF14 粉絲自製，與官方無關。遊戲素材版權歸 (C) SQUARE ENIX 所有。</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-cyan-500 font-bold tech-font mt-1">02</div>
                <div>
                  <h4 className="text-white font-bold mb-1">隱私安全</h4>
                  <p className="opacity-70">所有圖片合成皆在您的裝置上完成，我們不會儲存您的任何照片或個資。</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-cyan-500 font-bold tech-font mt-1">03</div>
                <div>
                  <h4 className="text-white font-bold mb-1">圖片建議</h4>
                  <p className="opacity-70">若包含劇透內容，分享時請貼心標註。</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-cyan-500 font-bold tech-font mt-1">04</div>
                <div>
                  <h4 className="text-white font-bold mb-1">社群分享</h4>
                  <p className="opacity-70">歡迎將製作好的角色卡分享至社群媒體！</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[14px] text-white tech-font">
                作者：閻羅@奧汀
              </div>
              <button
                onClick={() => setShowConsent(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-10 py-3 tech-font font-bold transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-105 active:scale-95 text-[14px]"
              >
                我同意並進入系統
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 匯出中 Modal overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_50px_rgba(0,242,255,0.4)] p-8 rounded-lg relative overflow-hidden text-center">
            {/* Holographic scanner line animation */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,1)] animate-bounce"></div>
            
            {/* Spinning/pulsing element */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-900/30 border-t-cyan-400 animate-spin"></div>
              <span className="text-3xl animate-pulse">🔮</span>
            </div>

            <h3 className="text-xl font-bold mb-2 tech-font text-cyan-400 tracking-[0.2em] uppercase">角色卡下載中 EXPORTING...</h3>
            <p className="text-sm text-white mb-4">正在處理高畫質渲染與影像生成，請稍候。</p>
            
            <div className="space-y-2 text-left font-mono text-xs text-cyan-200 bg-black/60 p-4 rounded border border-cyan-950/50">
              <div className="flex justify-between">
                <span>[PROCESS_STATUS]</span>
                <span className="animate-pulse text-cyan-400">EXECUTING</span>
              </div>
              <div className="flex justify-between">
                <span>[RENDER_SCALE]</span>
                <span>2x RESOLUTION (HIGH POWER)</span>
              </div>
              <div className="flex justify-between">
                <span>[LAYER_COMP]</span>
                <span>MERGING HIGH-RES LAYERS</span>
              </div>
              <div className="mt-2 text-white/50 italic text-[10px]">※ 請勿關閉本頁面，下載作業即將在數秒內自動開始。</div>
            </div>
          </div>
        </div>
      )}

      {/* Tech Header */}
      <header className="bg-slate-900/80 border-b border-cyan-500/30 p-4 sticky top-0 z-50 backdrop-blur-md shadow-[0_0_20px_rgba(0,242,255,0.1)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 border-2 border-cyan-400 bg-cyan-950 rounded-lg flex items-center justify-center font-bold text-3xl text-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.4)] tech-font animate-pulse">
              Ξ
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest tech-font text-white">FFXIV TC RP CARD｜水晶名片</h1>
              <p className="text-[14px] text-cyan-500 font-mono tracking-tighter uppercase">正在初始化安全連接... v3.5.0</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="group relative px-10 py-3 overflow-hidden bg-transparent border border-cyan-400 text-cyan-400 rounded-sm font-bold tech-font hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(0,242,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-2">
               <span className="text-[14px]">下載角色卡 DATA_EXPORT</span>
            </span>
            <div className="absolute inset-0 bg-cyan-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0"></div>
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6 pb-20">
          
          <section className="bg-slate-900/60 rounded-lg p-6 border-l-4 border-cyan-500 shadow-xl backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 flex items-center text-cyan-400 tech-font tracking-widest uppercase border-b border-cyan-900/50 pb-2">
              <span className="mr-2">■</span> 系統配置 SYSTEM_CONFIG
            </h2>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['portrait', 'landscape'].map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o as any)}
                  className={`py-2 text-[14px] tech-font border transition-all ${orientation === o ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800/50 text-white border-slate-700 hover:border-cyan-700'}`}
                >
                  {o === 'portrait' ? '直式 PORTRAIT' : '橫式 LANDSCAPE'}
                </button>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] text-white tech-font uppercase">風格預設 PRESET_SKINS</label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAME_STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => selectPresetStyle(s)}
                      className={`p-3 rounded-sm text-[14px] tech-font border transition-all truncate ${style.id === s.id ? 'bg-slate-700 border-white text-white' : 'bg-slate-950/80 border-slate-800 text-white'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] text-white tech-font uppercase">卡片字體 CARD_FONT</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FONT_OPTIONS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => updateInfo('selectedFont', font.family)}
                      style={{ fontFamily: font.family }}
                      className={`p-2.5 text-[14px] border transition-all ${info.selectedFont === font.family ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-slate-950/80 border-slate-800 text-white'}`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-[14px] tech-font text-cyan-400/80 uppercase">進階外觀自訂 ADV_ADJUST</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[14px] text-white tech-font">邊框類型 BORDER_TYPE</label>
                    <select
                      value={info.customBorderStyle}
                      onChange={(e) => updateInfo('customBorderStyle', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[14px] text-white focus:border-cyan-500 outline-none tech-font"
                    >
                      {BORDER_TYPES.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[14px] text-white tech-font">邊框粗細 THICKNESS</label>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={info.customBorderWidth}
                      onChange={(e) => updateInfo('customBorderWidth', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[14px] text-white tech-font">卡片文字縮放 FONT_SCALE</label>
                    <span className="text-[14px] text-white font-mono">{info.cardFontSize}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={info.cardFontSize}
                    onChange={(e) => updateInfo('cardFontSize', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-y-3 pt-2">
                   {[
                     { field: 'customBorderColor', label: '邊框顏色 CLR' },
                     { field: 'customTextColor', label: '文字顏色 CLR' },
                     { field: 'customBgStart', label: '漸層起始 S' },
                     { field: 'customBgEnd', label: '漸層結束 E' },
                     { field: 'customAccentColor', label: '裝飾發光 CLR' },
                   ].map(item => (
                     <div key={item.field} className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={(info as any)[item.field]}
                          onChange={(e) => updateInfo(item.field as any, e.target.value)}
                          className="w-7 h-7 rounded-full bg-transparent border border-slate-700 cursor-pointer overflow-hidden"
                        />
                        <label className="text-[14px] text-white tech-font">{item.label}</label>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/60 rounded-lg p-6 border-l-4 border-purple-500 shadow-xl backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 flex items-center text-purple-400 tech-font tracking-widest uppercase border-b border-purple-900/50 pb-2">
              <span className="mr-2">■</span> 視覺輸入 VISUAL_INPUT
            </h2>
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-purple-900/50 bg-slate-950/50 p-10 cursor-pointer hover:border-purple-400 transition-all rounded-lg group">
                  <span className="text-4xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity">📷</span>
                  <span className="text-[14px] tech-font text-white uppercase font-bold tracking-widest">載入角色圖像 LOAD_IDENTITY</span>
                </label>
              </div>
              
              {image && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 mt-6 p-6 bg-slate-950/80 rounded border border-purple-900/30">
                  {[
                    { label: '縮放 ZOOM', field: 'scale', min: 0.1, max: 5, step: 0.1 },
                    { label: '旋轉 ANGLE', field: 'rotate', min: -180, max: 180, step: 1 },
                    { label: '位移 POS_X', field: 'x', min: -500, max: 500, step: 1 },
                    { label: '位移 POS_Y', field: 'y', min: -500, max: 500, step: 1 },
                  ].map(ctrl => (
                    <div key={ctrl.field} className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-[14px] text-white tech-font">{ctrl.label}</label>
                        <span className="text-[14px] text-white font-mono">{(transform as any)[ctrl.field]}</span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={(transform as any)[ctrl.field]}
                        onChange={(e) => setTransform(prev => ({ ...prev, [ctrl.field]: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900/60 rounded-lg p-6 border-l-4 border-emerald-500 shadow-xl backdrop-blur-sm">
            <h2 className="text-base font-bold mb-4 flex items-center text-emerald-400 tech-font tracking-widest uppercase border-b border-emerald-900/50 pb-2">
              <span className="mr-2">■</span> 核心數據 CORE_DATA
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: '角色姓名 NAME', field: 'name', placeholder: '輸入角色姓名' },
                { label: '角色格言 MOTTO', field: 'motto', placeholder: '輸入角色座右銘' },
                { label: '伺服器 SERVER', field: 'server', placeholder: '例如: Bahamut' },
                { label: '種族 RACE', field: 'race', type: 'select', options: RACES },
                { label: '職業 JOB', field: 'job', type: 'select', options: JOBS },
                { label: '性別 GENDER', field: 'gender', placeholder: '男 / 女' },
                { label: '歲數 AGE', field: 'age', placeholder: '歲數' },
                { label: '身高 HEIGHT', field: 'height', placeholder: 'cm' },
                { label: '性向 PATH', field: 'orientation', placeholder: '個人傾向' },
                { label: '出生地 BIRTH', field: 'birthplace', placeholder: '出生城市' },
              ].map(input => (
                <div key={input.field} className="space-y-1.5">
                  <label className="text-[14px] text-white tech-font">{input.label}</label>
                  {input.type === 'select' ? (
                    <select
                      value={(info as any)[input.field]}
                      onChange={(e) => updateInfo(input.field as any, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-[14px] text-white focus:border-emerald-500 outline-none font-mono"
                    >
                      <option value="">選擇 {input.label.split(' ')[0]}</option>
                      {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={input.placeholder}
                      value={(info as any)[input.field]}
                      onChange={(e) => updateInfo(input.field as any, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-[14px] text-white focus:border-emerald-500 outline-none font-mono placeholder:opacity-20"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[14px] text-white tech-font">性格描述 PERSONALITY</label>
                  <button 
                    onClick={() => handleImproveText('personality')}
                    disabled={isImproving || !info.personality}
                    className="text-[14px] tech-font bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded hover:bg-emerald-400 hover:text-black transition-all disabled:opacity-30"
                  >
                    {isImproving ? '同步中 SYNCING...' : 'AI 潤飾 ENHANCE'}
                  </button>
                </div>
                <textarea
                  placeholder="輸入角色的性格特徵..."
                  rows={4}
                  maxLength={LIMITS.personality}
                  value={info.personality}
                  onChange={(e) => updateInfo('personality', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-[14px] text-white focus:border-emerald-500 outline-none resize-none font-mono"
                />
                <CharacterCounter current={info.personality.length} max={LIMITS.personality} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[14px] text-white tech-font">背景故事 BACKGROUND</label>
                  <button 
                    onClick={() => handleImproveText('background')}
                    disabled={isImproving || !info.background}
                    className="text-[14px] tech-font bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded hover:bg-emerald-400 hover:text-black transition-all disabled:opacity-30"
                  >
                    {isImproving ? '同步中 SYNCING...' : 'AI 潤飾 ENHANCE'}
                  </button>
                </div>
                <textarea
                  placeholder="紀錄角色的過往經歷..."
                  rows={4}
                  maxLength={LIMITS.background}
                  value={info.background}
                  onChange={(e) => updateInfo('background', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-[14px] text-white focus:border-emerald-500 outline-none resize-none font-mono"
                />
                <CharacterCounter current={info.background.length} max={LIMITS.background} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[14px] text-white tech-font">喜歡的東西 LIKES</label>
                  <input
                    type="text"
                    value={info.likes}
                    onChange={(e) => updateInfo('likes', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-[14px] text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] text-white tech-font">討厭的東西 DISLIKES</label>
                  <input
                    type="text"
                    value={info.dislikes}
                    onChange={(e) => updateInfo('dislikes', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-[14px] text-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/60 rounded-lg p-6 border-l-4 border-amber-500 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col mb-4 border-b border-amber-900/50 pb-2">
              <div className="flex justify-between items-end">
                <h2 className="text-base font-bold flex items-center text-amber-400 tech-font tracking-widest uppercase">
                  <span className="mr-2">■</span> 特質分析 TRAIT_ANALYTICS
                </h2>
                <div className="text-[14px] font-mono px-3 py-1 rounded bg-slate-950 text-white">
                  {visibleTraits.size} 已顯示
                </div>
              </div>
              <p className="text-[14px] text-white/60 mt-3 italic">※ 您可以點擊刪除鈕隱藏不需要顯示的特質，中間值亦可正常顯示。</p>
            </div>
            
            <div className="space-y-2">
              {[
                { label: '體型肌肉度 MUSCLE', field: 'muscles', l: '纖細', r: '健壯' },
                { label: '體溫調節 CORE_TEMP', field: 'temperature', l: '較低', r: '較高' },
                { label: '說話音量 VOICE_VOL', field: 'voiceVolume', l: '小聲', r: '大聲' },
                { label: '感性程度 SENSITIVITY', field: 'sensitivity', l: '冷淡', r: '豐沛' },
                { label: '進食習慣 APPETITE', field: 'appetite', l: '小鳥胃', r: '大胃王' },
                { label: '酒量耐受 ALCOHOL', field: 'alcoholTolerance', l: '較差', r: '極佳' },
                { label: '運動神經 PHYSICAL', field: 'athleticism', l: '較弱', r: '卓越' },
                { label: '戰鬥距離 RANGE', field: 'combatRange', l: '遠程', r: '近戰' },
                { label: '戰鬥傾向 PREF', field: 'combatPref', l: '避戰', r: '享受' },
              ].map(t => (
                <TraitSelector 
                  key={t.field} 
                  label={t.label} 
                  value={(traits as any)[t.field]} 
                  onChange={(v) => updateTrait(t.field as any, v)} 
                  leftLabel={t.l} 
                  rightLabel={t.r}
                  isVisible={visibleTraits.has(t.field)}
                  onToggleVisibility={() => toggleTraitVisibility(t.field)}
                />
              ))}
            </div>
          </section>

        </div>

        {/* Card Preview Area */}
        <div className="lg:col-span-8 relative" ref={previewContainerRef}>
          <div className="sticky top-24 flex flex-col items-center w-full min-h-[600px] p-10 bg-slate-900/30 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="mb-8 w-full flex justify-between items-center border-b border-cyan-500/10 pb-4">
              <h3 className="text-cyan-500 text-[14px] tech-font tracking-[0.3em] uppercase">全像投影渲染中 VISUALIZING...</h3>
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse delay-75"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
              </div>
            </div>
            
            <div 
              style={{ 
                transform: `scale(${previewScale})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: orientation === 'landscape' ? '800px' : '450px',
                height: orientation === 'landscape' ? '450px' : '800px',
                overflow: 'visible',
              }}
              className="relative shadow-[0_0_100px_rgba(0,242,255,0.15)] group"
            >
              <div className="absolute -top-6 -left-6 w-16 h-16 border-t-2 border-l-2 border-cyan-400 z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-2 border-r-2 border-cyan-400 z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <Card 
                id="character-card-preview"
                info={info}
                traits={traits}
                visibleTraits={visibleTraits}
                orientation={orientation}
                style={style}
                image={image}
                transform={transform}
                ref={cardRef}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Decorative footer elements */}
      <footer className="fixed bottom-0 left-0 w-full p-3 bg-slate-900/80 border-t border-cyan-500/10 text-[14px] font-mono text-white flex justify-between z-50 tech-font">
         <div className="flex gap-6">
           <span>連線狀態: 最佳 OPTIMAL</span>
           <span>延遲: 14ms</span>
         </div>
         <div className="flex gap-6">
           <span>系統時間: {new Date().toLocaleString()}</span>
           <span>加密連線已啟動 SECURE</span>
         </div>
      </footer>
    </div>
  );
};

export default App;
