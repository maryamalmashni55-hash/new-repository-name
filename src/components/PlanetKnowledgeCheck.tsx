import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, Lightbulb, ChevronLeft } from 'lucide-react';
import { spaceAudio } from '../utils/audioSynthesizer';

interface PlanetKnowledgeCheckProps {
  planetNameAr: string;
  questions?: QuizQuestion[];
}

export const PlanetKnowledgeCheck: React.FC<PlanetKnowledgeCheckProps> = ({
  planetNameAr,
  questions = [],
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-5 text-center text-slate-400 text-xs">
        جاري إعداد الأسئلة التفاعلية لهذا الجرم الفضائي...
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    if (idx === currentQ.correctIndex) {
      spaceAudio.playCorrect();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      spaceAudio.playWrong();
    }
  };

  const handleNextQuestion = () => {
    spaceAudio.playClick();
    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    spaceAudio.playClick();
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const isMastered = correctAnswersCount === questions.length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center space-y-4"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
          <Award className="w-7 h-7 text-amber-400" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {isMastered ? `رائع! فهمت أسرار ${planetNameAr} تماماً 🌟` : `نتيجة جيدة في استيعاب ${planetNameAr}`}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            أجبت بشكل صحيح على <span className="font-bold text-cyan-400 font-mono-num">{correctAnswersCount}</span> من أصل <span className="font-mono-num">{questions.length}</span> أسئلة.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          {isMastered
            ? '👏 استيعاب مذهل! لقد أثبتت فهمك الدقيق للمعلومات العلمية والطبقات الداخلية لهذا الكوكب.'
            : 'يمكنك مراجعة المعلومات وإعادة الاختبار لتأكيد فهمك الكامل.'}
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة اختبار الفهم</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with question progress */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <HelpCircle className="w-4 h-4" />
          <span>اختبر فهمك عن {planetNameAr}</span>
        </div>
        <span className="text-slate-400 font-mono-num">
          السؤال {currentQuestionIdx + 1} من {questions.length}
        </span>
      </div>

      {/* Question text */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
          {currentQ.questionAr}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {currentQ.optionsAr.map((option, idx) => {
          let btnStyle = 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800/80';
          let icon = null;

          if (isAnswerSubmitted) {
            if (idx === currentQ.correctIndex) {
              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium shadow-[0_0_12px_rgba(16,185,129,0.2)]';
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
            } else if (idx === selectedOption) {
              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
              icon = <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
            } else {
              btnStyle = 'bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswerSubmitted}
              className={`w-full p-3 rounded-xl border text-right text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle} ${
                isAnswerSubmitted ? 'cursor-default' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono-num text-slate-300 flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-snug">{option}</span>
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Explanation Box (Reveals upon answering) */}
      <AnimatePresence>
        {isAnswerSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 space-y-2 text-xs"
          >
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>تفسير علمي:</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {currentQ.explanationAr}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <span>{currentQuestionIdx + 1 < questions.length ? 'فهمت! السؤال التالي' : 'إنهاء الاختبار ومعاينة النتيجة'}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
