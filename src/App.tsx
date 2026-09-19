import React, { useState, useCallback, useEffect } from 'react';
import { CelestialBody, ViewMode } from './types';
import { CELESTIAL_BODIES } from './data/planetsData';
import { SolarSystemCanvas } from './components/SolarSystemCanvas';
import { IntroScreen } from './components/IntroScreen';
import { TopNavbar } from './components/TopNavbar';
import { ControlsBar } from './components/ControlsBar';
import { PlanetDetailsPanel } from './components/PlanetDetailsPanel';
import { ExplorePlanetsSection } from './components/ExplorePlanetsSection';
import { CosmicQuizView } from './components/CosmicQuizView';
import { spaceAudio } from './utils/audioSynthesizer';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, X } from 'lucide-react';

export default function App() {
  // Intro State
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [introProgress, setIntroProgress] = useState(0);

  // Application View & Selection States
  const [viewMode, setViewMode] = useState<ViewMode>('system');
  const [selectedPlanet, setSelectedPlanet] = useState<CelestialBody | null>(null);

  // Simulation Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Cinematic Exploration Mode (Full Screen Cinema)
  const [isExplorationMode, setIsExplorationMode] = useState(false);

  // Ambient Audio
  const [isMuted, setIsMuted] = useState(true);

  // Synchronize planetary ambient audio with selection state
  useEffect(() => {
    if (selectedPlanet) {
      spaceAudio.playPlanetAmbience(selectedPlanet.id);
    } else {
      spaceAudio.stopPlanetAmbience(0.8);
    }
  }, [selectedPlanet]);

  // Handlers
  const handleStartJourney = useCallback(() => {
    setIsIntroActive(false);
    spaceAudio.playWhoosh();
    if (!spaceAudio.getMuted()) {
      spaceAudio.startDrone();
    }
  }, []);

  const handleReplayIntro = useCallback(() => {
    setSelectedPlanet(null);
    spaceAudio.stopPlanetAmbience(0.5);
    setViewMode('system');
    setIsExplorationMode(false);
    setIntroProgress(0);
    setIsIntroActive(true);
  }, []);

  const handleSelectPlanet = useCallback((planet: CelestialBody) => {
    setSelectedPlanet(planet);
    setViewMode('system'); // Automatically switch to 3D scene to see the cinematic zoom
    spaceAudio.playPlanetFocus(planet.id);
    spaceAudio.playPlanetAmbience(planet.id);
  }, []);

  const handleClosePlanetDetails = useCallback(() => {
    setSelectedPlanet(null);
    spaceAudio.stopPlanetAmbience(0.8);
  }, []);

  const handleNextPlanet = useCallback(() => {
    if (!selectedPlanet) return;
    const currentIndex = CELESTIAL_BODIES.findIndex((p) => p.id === selectedPlanet.id);
    const nextIndex = (currentIndex + 1) % CELESTIAL_BODIES.length;
    const nextPlanet = CELESTIAL_BODIES[nextIndex];
    setSelectedPlanet(nextPlanet);
    spaceAudio.playPlanetFocus(nextPlanet.id);
    spaceAudio.playPlanetAmbience(nextPlanet.id);
  }, [selectedPlanet]);

  const handlePrevPlanet = useCallback(() => {
    if (!selectedPlanet) return;
    const currentIndex = CELESTIAL_BODIES.findIndex((p) => p.id === selectedPlanet.id);
    const prevIndex = (currentIndex - 1 + CELESTIAL_BODIES.length) % CELESTIAL_BODIES.length;
    const prevPlanet = CELESTIAL_BODIES[prevIndex];
    setSelectedPlanet(prevPlanet);
    spaceAudio.playPlanetFocus(prevPlanet.id);
    spaceAudio.playPlanetAmbience(prevPlanet.id);
  }, [selectedPlanet]);

  const handleChangeSpeed = useCallback((delta: number) => {
    setOrbitSpeed((prev) => Math.max(0.1, Math.min(10, +(prev + delta).toFixed(1))));
  }, []);

  const handleSetSpeed = useCallback((speed: number) => {
    setOrbitSpeed(speed);
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedPlanet(null);
    spaceAudio.stopPlanetAmbience(0.8);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const muted = spaceAudio.toggleMute();
    setIsMuted(muted);
    if (!muted && selectedPlanet) {
      spaceAudio.playPlanetAmbience(selectedPlanet.id);
    }
  }, [selectedPlanet]);

  return (
    <main id="app-root" className="relative w-screen h-screen overflow-hidden bg-[#02040a] text-slate-100 select-none">
      {/* 1. Fullscreen Three.js 3D Simulation Canvas */}
      <div className="absolute inset-0 z-0">
        <SolarSystemCanvas
          planets={CELESTIAL_BODIES}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={handleSelectPlanet}
          isPlaying={isPlaying}
          orbitSpeedMultiplier={orbitSpeed}
          showOrbits={showOrbits}
          showLabels={showLabels}
          isIntroActive={isIntroActive}
          introProgress={introProgress}
          isExplorationMode={isExplorationMode}
        />
      </div>

      {/* 2. Fullscreen Cinematic Intro Screen */}
      <AnimatePresence>
        {isIntroActive && (
          <IntroScreen
            onStartJourney={handleStartJourney}
            introProgress={introProgress}
            setIntroProgress={setIntroProgress}
          />
        )}
      </AnimatePresence>

      {/* 3. Main Experience UI (Visible after Intro) */}
      {!isIntroActive && (
        <>
          {/* Top Navigation Bar */}
          <TopNavbar
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            isExplorationMode={isExplorationMode}
            onToggleExplorationMode={() => setIsExplorationMode(!isExplorationMode)}
            isMuted={isMuted}
            onToggleAudio={handleToggleAudio}
            onReplayIntro={handleReplayIntro}
          />

          {/* If Exploration Mode is Active, provide a subtle floating exit button on top corner */}
          {isExplorationMode && (
            <button
              id="exit-explore-mode-float-btn"
              onClick={() => {
                spaceAudio.playClick();
                setIsExplorationMode(false);
              }}
              className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/60 text-xs text-cyan-300 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>إظهار عناصر التحكم</span>
            </button>
          )}

          {/* View Mode: "استكشف الكواكب" (Deck Overlay) */}
          <AnimatePresence>
            {viewMode === 'explore_deck' && !isExplorationMode && (
              <motion.div
                key="explore-deck-overlay"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 top-16 bottom-20 z-20 overflow-y-auto pointer-events-auto bg-slate-950/80 backdrop-blur-md"
              >
                <div className="relative">
                  <button
                    onClick={() => setViewMode('system')}
                    className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white cursor-pointer"
                    title="العودة لمشهد الفضاء"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <ExplorePlanetsSection
                    planets={CELESTIAL_BODIES}
                    selectedPlanet={selectedPlanet}
                    onSelectPlanet={handleSelectPlanet}
                    onClose={() => setViewMode('system')}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Mode: "تحدي الأسئلة التفاعلية" (Quiz Challenge Overlay) */}
          <AnimatePresence>
            {viewMode === 'quiz' && !isExplorationMode && (
              <motion.div
                key="quiz-challenge-overlay"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 top-16 bottom-20 z-20 overflow-y-auto pointer-events-auto bg-slate-950/85 backdrop-blur-md"
              >
                <CosmicQuizView
                  onClose={() => setViewMode('system')}
                  onExplorePlanet={(planetId) => {
                    const targetPlanet = CELESTIAL_BODIES.find((p) => p.id === planetId);
                    if (targetPlanet) {
                      setSelectedPlanet(targetPlanet);
                    }
                    setViewMode('system');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Planet Details Panel (when a planet is inspected and not in full quiz mode) */}
          {viewMode !== 'quiz' && (
            <PlanetDetailsPanel
              planet={selectedPlanet}
              onClose={handleClosePlanetDetails}
              onNextPlanet={handleNextPlanet}
              onPrevPlanet={handlePrevPlanet}
            />
          )}

          {/* Bottom Playback & Simulation Controls */}
          <ControlsBar
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            orbitSpeed={orbitSpeed}
            onChangeSpeed={handleChangeSpeed}
            onSetSpeed={handleSetSpeed}
            onResetCamera={handleResetCamera}
            showOrbits={showOrbits}
            onToggleOrbits={() => setShowOrbits(!showOrbits)}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            isExplorationMode={isExplorationMode}
          />
        </>
      )}
    </main>
  );
}
