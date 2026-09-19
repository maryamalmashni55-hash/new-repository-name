import React from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Minus, 
  RotateCcw, 
  Circle, 
  Tag, 
  HelpCircle,
  Gauge
} from 'lucide-react';
import { spaceAudio } from '../utils/audioSynthesizer';

interface ControlsBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  orbitSpeed: number;
  onChangeSpeed: (delta: number) => void;
  onSetSpeed: (speed: number) => void;
  onResetCamera: () => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  isExplorationMode: boolean;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPlaying,
  onTogglePlay,
  orbitSpeed,
  onChangeSpeed,
  onSetSpeed,
  onResetCamera,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  isExplorationMode,
}) => {
  return (
    <div 
      id="controls-bar-container"
      className={`fixed bottom-4 left-0 right-0 z-30 transition-all duration-500 pointer-events-none select-none flex flex-col items-center gap-2 px-4 ${
        isExplorationMode ? 'opacity-0 hover:opacity-100 pointer-events-auto' : 'opacity-100'
      }`}
    >
      {/* Educational disclaimer tooltip/badge */}
      <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 border border-slate-800/80 backdrop-blur-md text-[11px] text-slate-400">
        <HelpCircle className="w-3 h-3 text-cyan-400" />
        <span>ملاحظة تعليمية: عُدّلت مقاييس المسافات والأحجام في المشهد لضمان وضوح رؤية الكواكب</span>
      </div>

      {/* Main Controls Deck */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 p-2 rounded-2xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-xl shadow-2xl">
        
        {/* Play / Pause Toggle */}
        <button
          id="toggle-play-btn"
          onClick={() => {
            spaceAudio.playClick();
            onTogglePlay();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isPlaying
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          }`}
          title={isPlaying ? 'إيقاف حركة المدارات مؤقتاً' : 'تشغيل حركة المدارات'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>إيقاف الحركة</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>تشغيل الحركة</span>
            </>
          )}
        </button>

        <div className="w-px h-5 bg-slate-800 hidden sm:block" />

        {/* Speed Adjustment Controls: [-] [Speed Multiplier] [+] */}
        <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800">
          <button
            id="decrease-speed-btn"
            onClick={() => {
              spaceAudio.playClick();
              onChangeSpeed(-0.5);
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="تقليل سرعة المدار"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 px-2 text-xs font-mono-num font-medium text-cyan-300 min-w-[52px] justify-center">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>{orbitSpeed.toFixed(1)}x</span>
          </div>

          <button
            id="increase-speed-btn"
            onClick={() => {
              spaceAudio.playClick();
              onChangeSpeed(0.5);
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="زيادة سرعة المدار"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preset Speed Pills */}
        <div className="hidden md:flex items-center gap-1">
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => {
                spaceAudio.playClick();
                onSetSpeed(s);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono-num transition-all cursor-pointer ${
                orbitSpeed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-800 hidden sm:block" />

        {/* Orbit Lines Toggle */}
        <button
          id="toggle-orbits-btn"
          onClick={() => {
            spaceAudio.playClick();
            onToggleOrbits();
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            showOrbits
              ? 'bg-slate-800 text-cyan-300 border border-cyan-800/50'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
          title="إظهار / إخفاء خطوط المدارات"
        >
          <Circle className="w-3 h-3" />
          <span className="hidden sm:inline">المدارات</span>
        </button>

        {/* Planet Labels Toggle */}
        <button
          id="toggle-labels-btn"
          onClick={() => {
            spaceAudio.playClick();
            onToggleLabels();
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            showLabels
              ? 'bg-slate-800 text-cyan-300 border border-cyan-800/50'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
          title="إظهار / إخفاء أسماء الكواكب"
        >
          <Tag className="w-3 h-3" />
          <span className="hidden sm:inline">الأسماء</span>
        </button>

        {/* Reset Camera View Button */}
        <button
          id="reset-camera-btn"
          onClick={() => {
            spaceAudio.playClick();
            onResetCamera();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          title="إعادة ضبط زاوية الكاميرا للمشهد العام"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">إعادة ضبط الرؤية</span>
        </button>

      </div>
    </div>
  );
};
