import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanetLayer } from '../types';
import { Thermometer, Layers, Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { spaceAudio } from '../utils/audioSynthesizer';

interface PlanetInteriorCutawayProps {
  planetNameAr: string;
  planetColor: string;
  layers: PlanetLayer[];
}

export const PlanetInteriorCutaway: React.FC<PlanetInteriorCutawayProps> = ({
  planetNameAr,
  planetColor,
  layers,
}) => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  if (!layers || layers.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400 text-xs">
        لا تتوفر بيانات الطبقات الداخلية لهذا الجرم حالياً.
      </div>
    );
  }

  const activeLayer = layers[selectedLayerIndex] || layers[0];
  const totalLayers = layers.length;

  return (
    <div className="space-y-4">
      {/* Visual Concentric Cutaway Section */}
      <div className="relative p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient background glow matching active layer */}
        <div
          className="absolute inset-0 opacity-25 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeLayer.color }}
        />

        <div className="text-center mb-3">
          <span className="text-[11px] font-mono-num uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>مقطع عرضي لطبقات {planetNameAr} الداخلية</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            اضغط على أي طبقة لاستكشاف خصائصها الجيولوجية وحرارتها
          </p>
        </div>

        {/* Concentric SVG Cutaway representation */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <svg viewBox="-110 -110 220 220" className="w-full h-full overflow-visible drop-shadow-lg">
            <defs>
              <filter id="layer-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Concentric rings ordered from outer to inner */}
            {layers.map((layer, idx) => {
              // Calculate radius from outer (e.g. 100) down to inner core (e.g. 24)
              const minRadius = 24;
              const maxRadius = 98;
              const step = (maxRadius - minRadius) / Math.max(1, totalLayers - 1);
              // Reverse so index 0 (core) is smallest radius, but render from outermost to innermost
              const layerRadius = minRadius + (totalLayers - 1 - idx) * step;
              const isSelected = selectedLayerIndex === idx;

              return (
                <g
                  key={layer.id}
                  onClick={() => {
                    spaceAudio.playClick();
                    setSelectedLayerIndex(idx);
                  }}
                  className="cursor-pointer transition-all duration-300 group"
                >
                  {/* Circle layer */}
                  <circle
                    cx="0"
                    cy="0"
                    r={layerRadius}
                    fill={layer.color}
                    fillOpacity={isSelected ? 0.95 : 0.45}
                    stroke={isSelected ? '#ffffff' : layer.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={isSelected ? undefined : '3, 2'}
                    className="transition-all duration-300 group-hover:fill-opacity-80"
                    filter={isSelected ? 'url(#layer-glow)' : undefined}
                  />

                  {/* Cutaway quadrant wedge to show cross-section */}
                  <path
                    d={`M 0 0 L ${layerRadius} 0 A ${layerRadius} ${layerRadius} 0 0 1 0 ${layerRadius} Z`}
                    fill="#ffffff"
                    fillOpacity={isSelected ? 0.2 : 0.08}
                  />
                </g>
              );
            })}

            {/* Central core marker point */}
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
          </svg>
        </div>

        {/* Layer Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 w-full">
          {layers.map((layer, idx) => {
            const isSelected = selectedLayerIndex === idx;
            return (
              <button
                key={layer.id}
                onClick={() => {
                  spaceAudio.playClick();
                  setSelectedLayerIndex(idx);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border border-cyan-400 text-white font-medium shadow-sm'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="truncate max-w-[120px]">{layer.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Layer Specifications Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3"
        >
          {/* Layer Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: activeLayer.color }}
                />
                <h4 className="text-base font-bold text-white tracking-wide">
                  {activeLayer.nameAr}
                </h4>
              </div>
              <span className="text-[11px] text-cyan-300 font-mono-num">
                {activeLayer.nameEn}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono-num">
              الطبقة {selectedLayerIndex + 1} من {totalLayers}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {activeLayer.descriptionAr}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            {/* Temperature */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-start gap-2">
              <Thermometer className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 block">درجة الحرارة</span>
                <span className="font-semibold text-slate-100 font-mono-num">
                  {activeLayer.temperature}
                </span>
              </div>
            </div>

            {/* Depth / Thickness */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-start gap-2">
              <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 block">السُمك / العمق</span>
                <span className="font-semibold text-slate-100 font-mono-num">
                  {activeLayer.depthOrThickness}
                </span>
              </div>
            </div>

            {/* Composition */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 col-span-1 sm:col-span-2 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-slate-400 block">التركيب الكيميائي والمادي</span>
                <span className="font-semibold text-slate-100">
                  {activeLayer.composition}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
