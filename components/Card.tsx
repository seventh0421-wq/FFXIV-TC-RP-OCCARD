
import React, { forwardRef } from 'react';
import { CharacterInfo, Traits, Orientation, FrameStyle, ImageTransform } from '../types';

interface CardProps {
  info: CharacterInfo;
  traits: Traits;
  visibleTraits: Set<string>;
  orientation: Orientation;
  style: FrameStyle;
  image: string | null;
  transform: ImageTransform;
  id?: string;
  imagePosition?: 'left' | 'right';
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ info, traits, visibleTraits, orientation, style, image, transform, id, imagePosition = 'left' }, ref) => {
  const isPortrait = orientation === 'portrait';
  const fontScale = (info.cardFontSize || 100) / 100;
  
  const borderColor = info.customBorderColor || style.borderColor;
  const bgStart = info.customBgStart || style.bgStart;
  const bgEnd = info.customBgEnd || style.bgEnd;
  const textColor = info.customTextColor || style.textColor;
  const accentColor = info.customAccentColor || style.accentColor;
  const borderStyle = info.customBorderStyle || 'solid';
  const borderWidth = info.customBorderWidth !== undefined ? info.customBorderWidth : 4;

  const containerStyle: React.CSSProperties = {
    width: isPortrait ? '450px' : '800px',
    height: isPortrait ? '800px' : '450px',
    background: `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`,
    border: `${borderWidth}px ${borderStyle} ${borderColor}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 0 30px ${borderColor}33`,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: info.selectedFont || 'inherit'
  };

  const isImageRight = !isPortrait && imagePosition === 'right';

  const imageContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: isPortrait ? 0 : (isImageRight ? '65%' : 0),
    width: isPortrait ? '100%' : '35%',
    height: isPortrait ? '40%' : '100%',
    overflow: 'hidden',
    borderBottom: isPortrait ? `1px solid ${borderColor}44` : 'none',
    borderRight: (!isPortrait && !isImageRight) ? `1px solid ${borderColor}44` : 'none',
    borderLeft: (!isPortrait && isImageRight) ? `1px solid ${borderColor}44` : 'none',
    backgroundColor: '#000'
  };

  const contentContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: isPortrait ? '40%' : 0,
    left: isPortrait ? 0 : (isImageRight ? 0 : '35%'),
    width: isPortrait ? '100%' : '65%',
    height: isPortrait ? '60%' : '100%',
    padding: '1.5rem',
    paddingBottom: '2.5rem', 
    overflowY: 'auto',
    color: textColor,
    display: 'flex',
    flexDirection: 'column',
    gap: `${0.8 * fontScale}rem`,
    scrollbarWidth: 'none',
  };

  const TraitBar = ({ label, value, left, right }: { label: string, value: number, left: string, right: string }) => {
    const steps = [0, 25, 50, 75, 100];
    
    return (
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="flex justify-between items-center">
          <span style={{ fontSize: `${8.5 * fontScale}px` }} className="font-bold uppercase tracking-widest opacity-40 leading-none">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: `${10 * fontScale}px` }} className="opacity-70 flex-shrink-0 text-right min-w-[3.5rem] leading-none uppercase">{left}</span>
          <div className="flex gap-1.5 items-center justify-center flex-1">
            {steps.map((step) => (
              <div 
                key={step}
                className={`w-2 h-2 transition-all duration-300 ${
                  value === step 
                    ? 'scale-125 shadow-[0_0_10px_rgba(255,255,255,0.7)] opacity-100' 
                    : 'opacity-10'
                }`}
                style={{ backgroundColor: value === step ? accentColor : 'currentColor', borderRadius: '1px' }}
              />
            ))}
          </div>
          <span style={{ fontSize: `${10 * fontScale}px` }} className="opacity-70 flex-shrink-0 text-left min-w-[3.5rem] leading-none uppercase">{right}</span>
        </div>
      </div>
    );
  };

  const textStrokeStyle = (color: string) => ({
    textShadow: `1px 1px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(0,0,0,0.8), 1px -1px 0px rgba(0,0,0,0.8), -1px 1px 0px rgba(0,0,0,0.8), 0 0 8px ${color}66`
  });

  return (
    <div id={id} ref={ref} style={containerStyle} className="select-none">
      <style>{`
        .card-content-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-20">
         <div className="w-8 h-[1px] bg-white"></div>
         <div className="w-4 h-[1px] bg-white self-end"></div>
      </div>

      <div style={imageContainerStyle}>
        {image ? (
          <img
            src={image}
            alt="角色圖片"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
              transformOrigin: 'center center'
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950">
             <span className="text-3xl mb-2 opacity-20 text-white">影像缺失</span>
             <p className="text-[10px] font-mono tracking-widest uppercase opacity-40 text-center px-4 text-white">等待傳輸影像數據...</p>
          </div>
        )}
        
        {/* 文字疊加層 */}
        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex flex-col gap-0.5">
            {info.motto && (
              <p className="text-[11px] italic font-light tracking-wider opacity-90 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-1 mb-1 border-l-2 border-white/30 pl-2">
                &ldquo;{info.motto}&rdquo;
              </p>
            )}
            <h1 className="text-2xl font-bold tracking-[0.05em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase truncate text-white">
              {info.name || '未登錄個體'}
            </h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
               <p className="text-[10px] opacity-80 tracking-widest font-mono truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {info.server || '未知節點'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div style={contentContainerStyle} className="card-content-scroll">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-white/5 pb-3 font-mono" style={{ fontSize: `${10 * fontScale}px` }}>
          {[
            { label: '種族', val: info.race },
            { label: '性別', val: info.gender },
            { label: '職業', val: info.job },
            { label: '年紀', val: info.age },
            { label: '身高', val: info.height },
            { label: '性向', val: info.orientation },
            { label: '出生', val: info.birthplace }
          ].map(item => item.val && (
            <div key={item.label} className="flex gap-2">
              <span className="opacity-30 font-bold whitespace-nowrap">{item.label}:</span>
              <span className="truncate">{item.val}</span>
            </div>
          ))}
        </div>

        {info.personality && (
          <div className="space-y-1">
            <h3 style={{ fontSize: `${9.5 * fontScale}px` }} className="font-bold uppercase tracking-widest opacity-40 tech-font">性格描述 //</h3>
            <p style={{ fontSize: `${12.5 * fontScale}px` }} className="leading-snug italic opacity-85">{info.personality}</p>
          </div>
        )}

        {info.background && (
          <div className="space-y-1">
            <h3 style={{ fontSize: `${9.5 * fontScale}px` }} className="font-bold uppercase tracking-widest opacity-40 tech-font">背景故事 //</h3>
            <p style={{ fontSize: `${12 * fontScale}px` }} className="leading-snug opacity-75 border-l border-white/10 pl-3">{info.background}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {info.likes && (
             <div className="space-y-1 group">
                <h3 
                  style={{ fontSize: `${9.5 * fontScale}px`, ...textStrokeStyle('#10b981') }} 
                  className="font-bold uppercase tracking-widest text-emerald-400 tech-font"
                >
                  喜好事物+
                </h3>
                <p 
                  style={{ fontSize: `${11.5 * fontScale}px`, borderLeft: '2px solid rgba(16, 185, 129, 0.4)' }} 
                  className="leading-tight line-clamp-2 pl-2 text-white/90"
                >
                  {info.likes}
                </p>
             </div>
          )}
          {info.dislikes && (
             <div className="space-y-1 group">
                <h3 
                  style={{ fontSize: `${9.5 * fontScale}px`, ...textStrokeStyle('#f43f5e') }} 
                  className="font-bold uppercase tracking-widest text-rose-400 tech-font"
                >
                  厭惡事物-
                </h3>
                <p 
                  style={{ fontSize: `${11.5 * fontScale}px`, borderLeft: '2px solid rgba(244, 63, 94, 0.4)' }} 
                  className="leading-tight line-clamp-2 pl-2 text-white/90"
                >
                  {info.dislikes}
                </p>
             </div>
          )}
        </div>

        <div className="mt-auto pt-5 border-t border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
            {visibleTraits.has('muscles') && <TraitBar label="肌肉密度 MUSCLE" value={traits.muscles} left="纖細" right="健壯" />}
            {visibleTraits.has('temperature') && <TraitBar label="核心體溫 TEMP" value={traits.temperature} left="低" right="高" />}
            {visibleTraits.has('voiceVolume') && <TraitBar label="發聲強度 VOICE" value={traits.voiceVolume} left="小" right="大" />}
            {visibleTraits.has('sensitivity') && <TraitBar label="感性指標 SENSE" value={traits.sensitivity} left="冷" right="熱" />}
            {visibleTraits.has('appetite') && <TraitBar label="進食習慣 APPETITE" value={traits.appetite} left="小" right="大" />}
            {visibleTraits.has('alcoholTolerance') && <TraitBar label="耐酒精性 ALCOHOL" value={traits.alcoholTolerance} left="差" right="佳" />}
            {visibleTraits.has('athleticism') && <TraitBar label="運動神經 PHYSICAL" value={traits.athleticism} left="弱" right="強" />}
            {visibleTraits.has('combatRange') && <TraitBar label="戰鬥距離 RANGE" value={traits.combatRange} left="遠" right="近" />}
            {visibleTraits.has('combatPref') && <TraitBar label="戰鬥傾向 PREF" value={traits.combatPref} left="避" right="享" />}
          </div>
        </div>
      </div>

      <div className="absolute bottom-1 right-3 pointer-events-none opacity-40 text-[7px] font-sans tracking-tight" style={{ color: textColor }}>
        (C) SQUARE ENIX CO., LTD. All Rights Reserved.
      </div>

      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: accentColor }} />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: accentColor }} />
    </div>
  );
});

export default Card;
