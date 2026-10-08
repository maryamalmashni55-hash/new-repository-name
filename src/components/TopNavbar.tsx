import React, { useState } from 'react';
import { 
  Orbit, 
  Layers, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Sparkles,
  Rocket,
  X,
  Award,
  GraduationCap
} from 'lucide-react';
import { ViewMode } from '../types';
import { spaceAudio } from '../utils/audioSynthesizer';
import { motion, AnimatePresence } from 'motion/react';

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
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  return (
    <>
      <header 
        id="top-navbar" 
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 select-none ${
          isExplorationMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3.5">
          {/* Main Card Container */}
          <div className="p-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            
            {/* Top Bar Row (Mobile: split into brand + actions; Desktop: left side) */}
            <div className="flex items-center justify-between gap-2">
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0">
                  <Orbit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" style={{ animationDuration: '16s' }} />
                </div>
                <div>
                  <h1 className="text-xs sm:text-base font-bold text-white tracking-wide whitespace-nowrap">
                    النظام الشمسي
                  </h1>
                </div>
              </div>

              {/* Mobile Actions: Credits, Audio, Exploration, Replay (Shown in top row on mobile) */}
              <div className="flex items-center gap-1 sm:hidden">
                {/* Project Honors / Credits Badge Button on Mobile */}
                <button
                  id="mobile-credits-btn"
                  onClick={() => {
                    spaceAudio.playClick();
                    setShowCreditsModal(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-all cursor-pointer shadow-sm"
                  title="فريق العمل والإشراف"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="font-medium text-xs text-slate-200">إشراف وتصميم</span>
                </button>

                {/* Sound Toggle */}
                <button
                  id="mobile-toggle-audio-btn"
                  onClick={onToggleAudio}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                {/* Exploration Mode Button */}
                <button
                  id="mobile-toggle-explore-mode-btn"
                  onClick={() => {
                    spaceAudio.playClick();
                    onToggleExplorationMode();
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 transition-all cursor-pointer"
                  title="وضع الاستكشاف السينمائي"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Replay Intro */}
                <button
                  id="mobile-replay-intro-btn"
                  onClick={() => {
                    spaceAudio.playClick();
                    onReplayIntro();
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="إعادة العرض التقديمي"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs: "مشهد الفضاء" & "الكواكب" & "معرض الفضاء" & "تحدي الأسئلة" - Fits all screens directly without scrolling */}
            <div className="grid grid-cols-4 sm:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium w-full sm:w-auto gap-1">
              <button
                id="nav-system-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onSetViewMode('system');
                }}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                  viewMode === 'system'
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Orbit className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs">المشهد</span>
              </button>

              <button
                id="nav-explore-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onSetViewMode('explore_deck');
                }}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                  viewMode === 'explore_deck'
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs">الكواكب</span>
              </button>

              <button
                id="nav-students-corner-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onSetViewMode('students_corner');
                }}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                  viewMode === 'students_corner'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md font-semibold ring-1 ring-cyan-400/40'
                    : 'text-cyan-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="معرض الفضاء: مشاريع وأبحاث الطالبات"
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
                <span className="text-[11px] sm:text-xs font-bold">معرض الفضاء</span>
              </button>

              <button
                id="nav-quiz-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onSetViewMode('quiz');
                }}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                  viewMode === 'quiz'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm font-semibold'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/60'
                }`}
                title="تحدي الأسئلة التفاعلية واختبار الفهم"
              >
                <Rocket className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs">الأسئلة</span>
              </button>
            </div>

            {/* Desktop Right Action Icons: Credits, Exploration Mode, Audio, Replay Intro */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Project Credits for Desktop - Clean Standard Font */}
              <button
                id="desktop-credits-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  setShowCreditsModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
                title="عرض بطاقة الإشراف والتصميم"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-normal">
                  <span>تصميم: <strong className="text-white font-medium">ميم</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>إشراف: <strong className="text-white font-medium">أ. مريم</strong></span>
                </div>
              </button>

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
                    <span>إنهاء وضع الاستكشاف</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>وضع الاستكشاف</span>
                  </>
                )}
              </button>

              {/* Ambient Cosmic Audio Toggle */}
              <button
                id="toggle-audio-btn"
                onClick={onToggleAudio}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
                title={isMuted ? 'تشغيل الصوت الفضائي المحيطي' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
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

      {/* Honors / Credits Modal */}
      <AnimatePresence>
        {showCreditsModal && (
          <motion.div
            key="credits-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowCreditsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-28 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowCreditsModal(false)}
                className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                مشروع رحلة عبر النظام الشمسي
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                تجربة علمية وسينمائية ثلاثية الأبعاد لمحاكاة أجرام الفضاء العميق
              </p>

              {/* Honors Badges */}
              <div className="space-y-3.5 mb-6 text-right">
                {/* Designer Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-300">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">التصميم والتنفيذ</div>
                      <div className="text-lg font-bold text-white">
                        ميم
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    تصميم
                  </span>
                </div>

                {/* Supervisor Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-300">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">إشراف المعلمة</div>
                      <div className="text-lg font-bold text-white">
                        أستاذة مريم
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                    إشراف
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCreditsModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-cyan-950/50"
              >
                متابعة الاستكشاف الفضائي
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
