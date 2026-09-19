import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COSMIC_QUIZ_QUESTIONS } from '../data/quizData';
import { QuizQuestion } from '../types';
import { spaceAudio } from '../utils/audioSynthesizer';
import { 
  Rocket, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Trophy, 
  ChevronLeft, 
  HelpCircle,
  Lightbulb,
  X,
  Compass
} from 'lucide-react';

interface CosmicQuizViewProps {
  onClose: () => void;
  onExplorePlanet?: (planetId: string) => void;
}

export const CosmicQuizView: React.FC<CosmicQuizViewProps> = ({ onClose, onExplorePlanet }) => {
  const [questions] = useState<QuizQuestion[]>(ALL_COSMIC_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; isCorrect: boolean; selected: number }[]>([]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    setIsSubmitted(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      spaceAudio.playCorrect();
      setScore((s) => s + 100 + streak * 20);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);
    } else {
      spaceAudio.playWrong();
      setStreak(0);
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, isCorrect, selected: idx }
    ]);
  };

  const handleNext = () => {
    spaceAudio.playClick();
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    spaceAudio.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setStreak(0);
    setUserAnswers([]);
    setIsFinished(false);
  };

  // Rank Calculation based on accuracy
  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  const getRank = () => {
    if (accuracy >= 90) {
      return {
        title: 'قائد الأسطول الكوني 🌟',
        desc: 'معلوماتك الفلكية خارقة وتضاهي كبار علماء فيزياء الفلك ورواد ناسا!',
        badgeColor: 'from-amber-400 to-yellow-600',
      };
    }
    if (accuracy >= 70) {
      return {
        title: 'ملاح فضائي متقدم 🚀',
        desc: 'لديك إلمام رائع بأسرار النظام الشمسي وطبقات الكواكب وعجائبها!',
        badgeColor: 'from-cyan-400 to-blue-600',
      };
    }
    if (accuracy >= 50) {
      return {
        title: 'مستكشف كواكب واعد 🪐',
        desc: 'بداية ممتازة في رحلة سبر أغوار الفضاء، يمكنك إعادة التحدي لترقية رتبتك!',
        badgeColor: 'from-indigo-400 to-purple-600',
      };
    }
    return {
      title: 'متدرب رواد الفضاء 🔭',
      desc: 'استكشف الكواكب أكثر من خلال محاكي النظام الشمسي ثلاثي الأبعاد ثم عاود الاختبار!',
      badgeColor: 'from-slate-400 to-slate-600',
    };
  };

  const rank = getRank();

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 text-slate-100 select-none pb-24">
      {/* Top Header Card */}
      <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>تحدي رواد الفضاء: أسئلة تفاعلية</span>
              <span className="text-[10px] font-mono-num px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 hidden sm:inline-block">
                QUIZ 3D
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              اختبر معلوماتك وفهمك لطبقات وأسرار المجموعة الشمسية
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            spaceAudio.playClick();
            onClose();
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
          title="إغلاق التحدي والعودة للفضاء"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isFinished ? (
        <div className="space-y-4">
          {/* Stats Bar (Score, Streak, Question Index) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            {/* Progress */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-400">السؤال</span>
              <span className="text-sm sm:text-base font-bold text-slate-100 font-mono-num">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-400">النقاط الكونية</span>
              <span className="text-sm sm:text-base font-bold text-cyan-400 font-mono-num flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{score}</span>
              </span>
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] text-slate-400">حماس الإجابات</span>
              <span className="text-sm sm:text-base font-bold text-amber-400 font-mono-num flex items-center gap-1">
                <Flame className={`w-4 h-4 ${streak > 1 ? 'animate-bounce text-orange-500' : 'text-slate-500'}`} />
                <span>{streak} متتالية</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Main Question Card */}
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-7 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-2xl space-y-6"
          >
            {/* Tag: Planet */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
                <Compass className="w-3 h-3" />
                <span>عن: {currentQ.planetNameAr || 'النظام الشمسي'}</span>
              </span>

              <span className="text-xs text-slate-400">
                اختر الإجابة الصحيحة
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.questionAr}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.optionsAr.map((opt, idx) => {
                let stateStyle = 'bg-slate-900/70 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700';
                let icon = null;

                if (isSubmitted) {
                  if (idx === currentQ.correctIndex) {
                    stateStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-100 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
                  } else if (idx === selectedOption) {
                    stateStyle = 'bg-rose-950/70 border-rose-500 text-rose-100';
                    icon = <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
                  } else {
                    stateStyle = 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-2xl border text-right text-sm sm:text-base flex items-center justify-between gap-3 transition-all cursor-pointer ${stateStyle} ${
                      isSubmitted ? 'cursor-default' : 'active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono-num text-slate-300 flex items-center justify-center flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Step */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-slate-800 space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>معلومة فلكية:</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {currentQ.explanationAr}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
                    >
                      <span>{currentIndex + 1 < totalQuestions ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        /* Results Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 text-center space-y-6 shadow-2xl"
        >
          {/* Rank Badge */}
          <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr ${rank.badgeColor} p-0.5 shadow-2xl`}>
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
              <Award className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-mono-num text-cyan-400 tracking-wider">
              رتبتك في أكاديمية رواد الفضاء
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {rank.title}
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              {rank.desc}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">الإجابات الصحيحة</span>
              <span className="text-xl font-bold text-emerald-400 font-mono-num">
                {correctCount} / {totalQuestions}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">نسبة الدقة</span>
              <span className="text-xl font-bold text-cyan-400 font-mono-num">
                {accuracy}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">إجمالي النقاط</span>
              <span className="text-xl font-bold text-amber-400 font-mono-num">
                {score}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">أعلى سلسلة متتالية</span>
              <span className="text-xl font-bold text-orange-400 font-mono-num">
                {highestStreak} 🔥
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs sm:text-sm transition-colors cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار الكوني</span>
            </button>

            <button
              onClick={() => {
                spaceAudio.playClick();
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              <span>العودة لاستكشاف الفضاء 3D</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
