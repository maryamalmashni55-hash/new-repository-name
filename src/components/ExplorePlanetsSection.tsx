import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Orbit } from 'lucide-react';
import { CelestialBody } from '../types';
import { spaceAudio } from '../utils/audioSynthesizer';

interface ExplorePlanetsSectionProps {
  planets: CelestialBody[];
  selectedPlanet: CelestialBody | null;
  onSelectPlanet: (planet: CelestialBody) => void;
  onClose?: () => void;
}

export const ExplorePlanetsSection: React.FC<ExplorePlanetsSectionProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet,
  onClose,
}) => {
  // Filter 8 planets (excluding Sun for the primary 8 cards deck, plus Sun as an honored special card)
  const eightPlanets = planets.filter((p) => p.id !== 'sun');
  const sun = planets.find((p) => p.id === 'sun');

  const handleExplore = (planet: CelestialBody) => {
    spaceAudio.playClick();
    spaceAudio.playWhoosh();
    onSelectPlanet(planet);
    if (onClose) onClose();
  };

  return (
    <div id="explore-planets-section" className="w-full max-w-7xl mx-auto px-4 py-8 select-none">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs mb-2">
            <Orbit className="w-3.5 h-3.5 text-cyan-400" />
            <span>كتالوج الأجرام الكونية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            استكشف كواكب المجموعة الشمسية
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            اختر أي كوكب لبدء الاقتراب السينمائي واستعراض أسراره وخصائصه الفيزيائية
          </p>
        </div>

        {sun && (
          <button
            id="explore-sun-btn"
            onClick={() => handleExplore(sun)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer group"
          >
            <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] group-hover:scale-110 transition-transform" />
            <span>استكشف الشمس (المركز)</span>
          </button>
        )}
      </div>

      {/* Grid of 8 Planet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {eightPlanets.map((planet, index) => {
          const isSelected = selectedPlanet?.id === planet.id;

          return (
            <motion.div
              key={planet.id}
              id={`planet-card-${planet.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border backdrop-blur-xl transition-all ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700 shadow-lg'
              }`}
            >
              {/* Top Meta info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono-num text-slate-400 uppercase tracking-wider">
                    {planet.nameEn}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {planet.typeAr}
                  </span>
                </div>

                {/* 3D-styled Visual Representation of the Planet */}
                <div className="h-28 my-3 flex items-center justify-center relative">
                  {/* Subtle orbital glow */}
                  <div
                    className="absolute w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: planet.color }}
                  />

                  {/* Spherical Representation with directional lighting gradient */}
                  <div className="relative flex items-center justify-center">
                    {/* Ring for Saturn & Uranus */}
                    {planet.hasRings && (
                      <div
                        className="absolute rounded-full border opacity-70 pointer-events-none"
                        style={{
                          width: planet.id === 'saturn' ? '120px' : '90px',
                          height: planet.id === 'saturn' ? '38px' : '26px',
                          borderColor: planet.ringColor || '#e2e8f0',
                          borderWidth: planet.id === 'saturn' ? '4px' : '2px',
                          transform: 'rotate(-25deg)',
                        }}
                      />
                    )}

                    <div
                      className="rounded-full shadow-inner relative transition-transform duration-500 group-hover:scale-105"
                      style={{
                        width: `${Math.max(48, Math.min(84, planet.size * 10))}px`,
                        height: `${Math.max(48, Math.min(84, planet.size * 10))}px`,
                        background: `radial-gradient(circle at 30% 30%, ${planet.color}, #090d16 95%)`,
                        boxShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 15px ${planet.color}33`,
                      }}
                    />
                  </div>
                </div>

                {/* Title & Short Info */}
                <h3 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                  <span>{planet.nameAr}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {planet.symbol}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
                  {planet.shortInfoAr}
                </p>
              </div>

              {/* Card Footer: Explore Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono-num">
                  {planet.moonsCount > 0 ? `${planet.moonsCount} قمر` : 'بدون أقمار'}
                </span>

                <button
                  id={`explore-btn-${planet.id}`}
                  onClick={() => handleExplore(planet)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-600/90 border border-slate-700/80 hover:border-cyan-400 text-xs text-slate-200 hover:text-white font-medium transition-all cursor-pointer shadow-sm"
                >
                  <span>استكشف</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
