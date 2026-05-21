
import React from 'react';

interface TraitSelectorProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  leftLabel: string;
  rightLabel: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const TraitSelector: React.FC<TraitSelectorProps> = ({ label, value, onChange, leftLabel, rightLabel, isVisible, onToggleVisibility }) => {
  const steps = [0, 25, 50, 75, 100];

  return (
    <div className={`flex flex-col space-y-2 mb-4 group transition-opacity ${!isVisible ? 'opacity-40' : 'opacity-100'}`}>
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-400 tech-font tracking-widest">{label}</label>
        <button 
          onClick={onToggleVisibility}
          className={`text-[10px] px-2 py-0.5 border rounded-sm transition-all tech-font ${isVisible ? 'border-rose-900/50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'border-emerald-900/50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
        >
          {isVisible ? '隱藏 DELETE' : '顯示 RESTORE'}
        </button>
      </div>
      
      <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-slate-800 transition-colors group-hover:border-amber-900/50">
        <span className="text-[10px] w-14 text-right text-slate-600 tech-font leading-tight pr-1 uppercase">{leftLabel}</span>
        
        <div className="flex items-center justify-between flex-1 px-4 relative">
          {/* Connector Line with glow */}
          <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-slate-900 -translate-y-1/2 z-0"></div>
          
          {steps.map((step) => (
            <button
              key={step}
              onClick={() => onChange(step)}
              className={`relative z-10 w-2.5 h-2.5 transition-all duration-300 transform ${
                value === step 
                  ? 'bg-amber-400 scale-150 rotate-45 shadow-[0_0_12px_#fbbf24]' 
                  : 'bg-slate-800 hover:bg-slate-600'
              }`}
              title={`${step}%`}
            />
          ))}
        </div>
        
        <span className="text-[10px] w-14 text-left text-slate-600 tech-font leading-tight pl-1 uppercase">{rightLabel}</span>
      </div>
    </div>
  );
};

export default TraitSelector;
