import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Orbit, 
  RotateCcw, 
  Moon, 
  Thermometer, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  X,
  Layers,
  HelpCircle,
  BookOpen,
  Volume2,
  Radio,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { CelestialBody } from '../types';
import { spaceAudio } from '../utils/audioSynthesizer';
import { PlanetInteriorCutaway } from './PlanetInteriorCutaway';
import { PlanetKnowledgeCheck } from './PlanetKnowledgeCheck';

interface PlanetDetailsPanelProps {
  planet: CelestialBody | null;
  onClose: () => void;
  onNextPlanet: () => void;
  onPrevPlanet: () => void;
}

type PanelTab = 'overview' | 'interior' | 'quiz';

export const PlanetDetailsPanel: React.FC<PlanetDetailsPanelProps> = ({
  planet,
  onClose,
  onNextPlanet,
  onPrevPlanet,
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('overview');
  const [isMobileMinimized, setIsMobileMinimized] = useState(false);

  // Reset to overview whenever planet changes
  useEffect(() => {
    setActiveTab('overview');
  }, [planet?.id]);

  if (!planet) return null;

  // Minimized Mobile Quick Bar
  if (isMobileMinimized) {
    return (
      <div
        id="planet-details-minimized-mobile"
        className="fixed bottom-3 inset-x-3 sm:hidden z-40 p-2.5 rounded-2xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2 pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full shadow-md shrink-0" 
            style={{ backgroundColor: planet.color }} 
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-white">{planet.nameAr}</span>
            </div>
            <span className="text-[10px] text-slate-400">{planet.typeAr}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Sound */}
          <button
            onClick={() => {
              spaceAudio.playPlanetFocus(planet.id);
              spaceAudio.playPlanetAmbience(planet.id);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white"
            title="صوت الكوكب"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Prev / Next */}
          <button 
            onClick={() => {
              spaceAudio.playClick();
              onPrevPlanet();
            }} 
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            title="الكوكب السابق"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => {
              spaceAudio.playClick();
              onNextPlanet();
            }} 
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            title="الكوكب التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Expand Details */}
          <button
            onClick={() => {
              spaceAudio.playClick();
              setIsMobileMinimized(false);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold shadow-md cursor-pointer"
          >
            <span>التفاصيل</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button 
            onClick={() => {
              spaceAudio.playClick();
              onClose();
            }} 
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.aside
        id="planet-details-panel"
        key={planet.id}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-0 top-16 sm:top-20 sm:right-4 sm:bottom-20 sm:left-auto sm:w-[440px] max-w-full z-40 flex flex-col pointer-events-auto select-none"
      >
        <div className="flex-1 flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl bg-slate-950/95 sm:bg-slate-950/85 border-t sm:border border-cyan-500/30 sm:border-slate-700/70 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-slate-100">
          
          {/* Mobile Drag/Collapse Indicator */}
          <div 
            onClick={() => setIsMobileMinimized(true)}
            className="sm:hidden pt-2 pb-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900/40"
          >
            <div className="w-12 h-1 rounded-full bg-slate-600/80 mb-1" />
            <span className="text-[10px] text-cyan-400/80 font-medium">اسحب أو انقر للتصغير ورؤية الكوكب 🔭</span>
          </div>

          {/* Header Bar */}
          <div className="p-3 sm:p-5 border-b border-slate-800/80 flex items-start justify-between relative overflow-hidden">
            {/* Ambient colored top glow */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: planet.color }}
            />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: planet.color }}
                />
                <span className="text-xs text-slate-400">
                  {planet.symbol}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {planet.nameAr}
              </h2>
              <span className="inline-block mt-0.5 sm:mt-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                {planet.typeAr}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mobile minimize button */}
              <button
                onClick={() => {
                  spaceAudio.playClick();
                  setIsMobileMinimized(true);
                }}
                className="sm:hidden p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                title="تصغير لمشاهدة الكوكب"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                id="panel-close-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs Switcher: [نظرة عامة] / [داخلية الكوكب] / [فهمت!] */}
          <div className="px-4 pt-2.5 pb-1 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-1.5">
            <button
              onClick={() => {
                spaceAudio.playClick();
                setActiveTab('overview');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-800 border border-slate-700 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>نظرة عامة</span>
            </button>

            <button
              onClick={() => {
                spaceAudio.playClick();
                setActiveTab('interior');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'interior'
                  ? 'bg-slate-800 border border-slate-700 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>داخلية الكوكب</span>
            </button>

            <button
              onClick={() => {
                spaceAudio.playClick();
                setActiveTab('quiz');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>فهمت! (اختبار)</span>
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm">
            {activeTab === 'overview' && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-4"
              >
                {/* Quick Description */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60">
                  {planet.shortInfoAr}
                </p>

                {/* Planetary Acoustic Signature (البصمة الصوتية المحيطية) */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/30 border border-slate-800/80 shadow-inner">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        البصمة الصوتية المحيطية
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (spaceAudio.getMuted()) {
                          spaceAudio.toggleMute();
                        }
                        spaceAudio.playPlanetFocus(planet.id);
                        spaceAudio.playPlanetAmbience(planet.id);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-[11px] text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer"
                      title="استمع إلى التردد الصوتي المحيطي للكوكب"
                    >
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
                        <span className="w-0.5 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '450ms' }} />
                        <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '700ms' }} />
                        <span className="w-0.5 h-2.5 bg-cyan-200 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '500ms' }} />
                      </div>
                      <span>تشغيل الصوت</span>
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-light leading-relaxed flex items-start gap-1.5">
                    <span className="text-cyan-400 text-sm leading-none mt-0.5">◈</span>
                    <span>{planet.sonicSignatureAr || 'ترددات كهرومغناطيسية وتدفقات بلازمية مميزة'}</span>
                  </p>
                </div>

                {/* Call-to-action quick banner for interior & quiz */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      spaceAudio.playClick();
                      setActiveTab('interior');
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-right text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                      <Layers className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>داخلية الكوكب</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block leading-tight">
                      استكشف اللب والوشاح والطبقات
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      spaceAudio.playClick();
                      setActiveTab('quiz');
                    }}
                    className="p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-800/60 hover:border-cyan-400/60 text-right text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1">
                      <HelpCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>فهمت الكوكب!</span>
                    </div>
                    <span className="text-[11px] text-slate-300 block leading-tight">
                      اختبر استيعابك للمعلومات
                    </span>
                  </button>
                </div>

                {/* Scientific Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Distance from Sun */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>المسافة عن الشمس</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs sm:text-sm font-mono-num">
                      {planet.distanceSun}
                    </div>
                  </div>

                  {/* Orbital Period */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Orbit className="w-3.5 h-3.5 text-indigo-400" />
                      <span>دوران حول الشمس</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs sm:text-sm font-mono-num">
                      {planet.orbitalPeriod}
                    </div>
                  </div>

                  {/* Rotation Period (Day) */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>دوران حول النفس (اليوم)</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs sm:text-sm font-mono-num">
                      {planet.rotationPeriod}
                    </div>
                  </div>

                  {/* Moons Count */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Moon className="w-3.5 h-3.5 text-amber-400" />
                      <span>عدد الأقمار</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs sm:text-sm font-mono-num">
                      {planet.moonsCount} {planet.moonsCount === 1 ? 'قمر' : planet.moonsCount > 10 ? 'قمراً' : 'أقمار'}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 col-span-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                      <span>درجة الحرارة التقريبية</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs sm:text-sm font-mono-num">
                      {planet.avgTemp}
                    </div>
                  </div>
                </div>

                {/* 3 Distinctive Scientific Facts */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3 معلومات مميزة عنه</span>
                  </div>
                  <div className="space-y-2">
                    {planet.funFacts.map((fact, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/60 flex items-start gap-2.5"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-center font-mono-num mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'interior' && (
              <motion.div
                key="tab-interior"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <PlanetInteriorCutaway
                  planetNameAr={planet.nameAr}
                  planetColor={planet.color}
                  layers={planet.internalLayers}
                />
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="tab-quiz"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <PlanetKnowledgeCheck
                  planetNameAr={planet.nameAr}
                  questions={planet.quizQuestions}
                />
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-2">
            {/* Prev / Next Planet Tour Switchers */}
            <div className="flex items-center gap-1">
              <button
                id="prev-planet-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onPrevPlanet();
                }}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="الكوكب السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                id="next-planet-btn"
                onClick={() => {
                  spaceAudio.playClick();
                  onNextPlanet();
                }}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="الكوكب التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Return Button: "عودة للنظام الشمسي" */}
            <button
              id="return-to-system-btn"
              onClick={() => {
                spaceAudio.playWhoosh();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-cyan-950/50 transition-all cursor-pointer"
            >
              <span>عودة للنظام الشمسي</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
