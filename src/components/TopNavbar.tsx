import React from 'react';
import { 
  Orbit, 
  Layers, 
  HelpCircle,
  Maximize2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Sparkles,
  Rocket
} from 'lucide-react';
import { ViewMode } from '../types';
import { spaceAudio } from '../utils/audioSynthesizer';

interface TopNavbarProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  isExplorationMode: boolean;
  onToggleExplorationMode: () => void;
  isMuted: boolean;
  onToggleAudio: () => void;
  onReplayIntro: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  viewMode,
  onSetViewMode,
  isExplorationMode,
  onToggleExplorationMode,
  isMuted,
  onToggleAudio,
  onReplayIntro,
}) => {
  return (
    <header 
      id="top-navbar" 
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 select-none ${
        isExplorationMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-4 py-2.5 rounded-2xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Orbit className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '14s' }} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>النظام الشمسي</span>
                <span className="text-[10px] font-mono-num px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 hidden sm:inline-block">
                  3D INTERACTIVE
                </span>
              </h1>
            </div>
          </div>

          {/* Center Tabs: "مشهد الفضاء" & "استكشف الكواكب" & "تحدي الأسئلة" */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium">
            <button
              id="nav-system-btn"
              onClick={() => {
                spaceAudio.playClick();
                onSetViewMode('system');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'system'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشهد الفضاء</span>
              <span className="sm:hidden">الفضاء</span>
            </button>

            <button
              id="nav-explore-btn"
              onClick={() => {
                spaceAudio.playClick();
                onSetViewMode('explore_deck');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'explore_deck'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استكشف الكواكب</span>
              <span className="sm:hidden">الكواكب</span>
            </button>

            <button
              id="nav-quiz-btn"
              onClick={() => {
                spaceAudio.playClick();
                onSetViewMode('quiz');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'quiz'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm font-semibold'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
              title="تحدي الأسئلة التفاعلية واختبار الفهم"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>تحدي الأسئلة</span>
            </button>
          </div>

          {/* Right Action Icons: Exploration Mode, Audio, Replay Intro */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cinematic Exploration Mode Button */}
            <button
              id="toggle-explore-mode-btn"
              onClick={() => {
                spaceAudio.playClick();
                onToggleExplorationMode();
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isExplorationMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title="وضع الاستكشاف السينمائي (إخفاء الواجهة للتركيز على المشهد الفضائي)"
            >
              {isExplorationMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden sm:inline">إنهاء وضع الاستكشاف</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">وضع الاستكشاف</span>
                </>
              )}
            </button>

            {/* Ambient Cosmic Audio Toggle */}
            <button
              id="toggle-audio-btn"
              onClick={() => {
                onToggleAudio();
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'تشغيل الصوت الفضائي المحيطي' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Replay Intro */}
            <button
              id="replay-intro-btn"
              onClick={() => {
                spaceAudio.playClick();
                onReplayIntro();
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="إعادة المقدمة السينمائية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
