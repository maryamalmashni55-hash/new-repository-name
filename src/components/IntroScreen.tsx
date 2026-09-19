import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, Compass, FastForward } from 'lucide-react';
import { spaceAudio } from '../utils/audioSynthesizer';

interface IntroScreenProps {
  onStartJourney: () => void;
  introProgress: number;
  setIntroProgress: React.Dispatch<React.SetStateAction<number>>;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartJourney,
  introProgress,
  setIntroProgress,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  // Simulated initial asset & scene preparation: "Preparing your journey..."
  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingStep(1), 700);
    const timer2 = setTimeout(() => setLoadingStep(2), 1400);
    const timer3 = setTimeout(() => {
      setIsLoading(false);
      spaceAudio.playWhoosh();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Drive Intro Progress animation once loading is complete
  useEffect(() => {
    if (isLoading) return;

    let startTime = performance.now();
    const duration = 7500; // 7.5s cinematic intro progression

    let animId: number;
    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      setIntroProgress(progress);

      if (progress < 1.0) {
        animId = requestAnimationFrame(updateProgress);
      }
    };

    animId = requestAnimationFrame(updateProgress);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isLoading, setIntroProgress]);

  const handleStart = () => {
    spaceAudio.playClick();
    spaceAudio.playWhoosh();
    onStartJourney();
  };

  const handleSkip = () => {
    setIntroProgress(1.0);
    handleStart();
  };

  return (
    <div id="intro-screen" className="fixed inset-0 z-50 pointer-events-auto flex flex-col items-center justify-between p-6 sm:p-12 select-none overflow-hidden">
      {/* 1. Initial Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="absolute inset-0 z-60 bg-[#02040a] flex flex-col items-center justify-center text-center px-4"
          >
            <div className="relative mb-8 flex items-center justify-center">
              {/* Outer orbital spin ring */}
              <div className="w-20 h-20 rounded-full border-t border-r border-cyan-400/80 animate-spin" style={{ animationDuration: '3s' }} />
              {/* Counter-rotating inner ring */}
              <div className="absolute w-12 h-12 rounded-full border-b border-l border-indigo-400/80 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              {/* Center pulsing sun point */}
              <div className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_16px_#fbbf24] animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-2xl font-light tracking-wide text-slate-200 mb-2">
              Preparing your journey...
            </h2>
            <p className="text-sm text-cyan-300/70 font-mono-num">
              {loadingStep === 0 && 'تهيئة المحاكاة الفضائية والنجوم...'}
              {loadingStep === 1 && 'حساب مدارات الكواكب وأسطحها...'}
              {loadingStep === 2 && 'ضبط الإضاءة الشمسية ومسار الكاميرا...'}
            </p>

            <div className="w-48 h-1 bg-slate-800/80 rounded-full mt-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                initial={{ width: '10%' }}
                animate={{ width: loadingStep === 0 ? '30%' : loadingStep === 1 ? '75%' : '100%' }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Minimal Bar during Cinematic Sequence */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full flex items-center justify-between max-w-5xl z-10"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-300/80 font-mono-num tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>SOLARIS // استكشاف الفضاء العميق</span>
          </div>

          <button
            id="intro-skip-btn"
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          >
            <span>تخطي العرض</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* 3. Central Cinematic Titles (Appears smoothly as camera approaches the solar system) */}
      {!isLoading && introProgress > 0.45 && (
        <motion.div
          id="intro-center-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center text-center max-w-2xl my-auto px-4 z-10"
        >
          {/* Ambient cosmic radial glow behind title */}
          <div 
            className="absolute w-[440px] sm:w-[560px] h-[360px] rounded-full bg-gradient-to-tr from-cyan-600/15 via-indigo-600/10 to-amber-500/10 blur-3xl pointer-events-none -z-10 animate-pulse" 
            style={{ animationDuration: '6s' }} 
          />

          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md text-cyan-300 text-xs sm:text-sm mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>تجربة سينمائية تفاعلية ثلاثية الأبعاد</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            رحلة عبر النظام الشمسي
          </h1>

          {/* Scientific Description */}
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl font-light leading-relaxed mb-6">
            انطلق في استكشاف كوني مهيب بين مدارات الكواكب، تعرّف على أسرار الشمس والعمالقة الغازية والجليدية، وعش تفاصيل الفضاء بمنظور علمي وفيزيائي ثلاثي الأبعاد.
          </p>

          {/* Project Honors / Credits Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 py-2.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.15)] mb-8 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">تصميم وتنفيذ:</span>
              <span className="font-calligraphy text-lg sm:text-xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)] tracking-wide">
                ميم
              </span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">الأستاذة المشرفة:</span>
              <span className="font-calligraphy text-lg sm:text-xl font-bold text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.7)] tracking-wide">
                أستاذة مريم
              </span>
            </div>
          </div>

          {/* Action Button: "ابدأ الرحلة 🚀" */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              id="start-journey-btn"
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-medium text-base sm:text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>ابدأ الرحلة</span>
              <Rocket className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Bottom Scientific Note */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-xs text-slate-500 text-center font-light z-10"
        >
          تمت محاكاة حركات المدارات والأجرام السماوية وفق مبادئ الميكانيكا المدارية
        </motion.div>
      )}
    </div>
  );
};
