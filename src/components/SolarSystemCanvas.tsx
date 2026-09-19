import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CelestialBody, PlanetId } from '../types';
import { 
  createPlanetTexture, 
  createRingTexture, 
  createParticleGlowTexture, 
  createNebulaGlowTexture 
} from '../utils/textureGenerator';
import { spaceAudio } from '../utils/audioSynthesizer';

interface SolarSystemCanvasProps {
  planets: CelestialBody[];
  selectedPlanet: CelestialBody | null;
  onSelectPlanet: (planet: CelestialBody) => void;
  isPlaying: boolean;
  orbitSpeedMultiplier: number;
  showOrbits: boolean;
  showLabels: boolean;
  isIntroActive: boolean;
  introProgress: number; // 0 to 1
  onIntroCameraReady?: () => void;
  isExplorationMode: boolean;
}

export const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({
  planets,
  selectedPlanet,
  onSelectPlanet,
  isPlaying,
  orbitSpeedMultiplier,
  showOrbits,
  showLabels,
  isIntroActive,
  introProgress,
  onIntroCameraReady,
  isExplorationMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Store 3D references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Mesh registries
  const planetMeshesRef = useRef<Map<PlanetId, {
    mesh: THREE.Mesh;
    pivot: THREE.Group;
    bodyData: CelestialBody;
    orbitAngle: number;
  }>>(new Map());

  const orbitLinesGroupRef = useRef<THREE.Group | null>(null);
  const labelsGroupRef = useRef<THREE.Group | null>(null);
  const warpStarsRef = useRef<THREE.LineSegments | null>(null);
  const backgroundStarsRef = useRef<THREE.Points | null>(null);
  const stardustPointsRef = useRef<THREE.Points | null>(null);
  const nebulaGlowGroupRef = useRef<THREE.Group | null>(null);
  const sunGlowMeshRef = useRef<THREE.Mesh | null>(null);
  const sunOuterGlowMeshRef = useRef<THREE.Mesh | null>(null);

  // Camera Target States for smooth lerp
  const cameraCurrentPos = useRef(new THREE.Vector3(0, 180, 260));
  const cameraTargetPos = useRef(new THREE.Vector3(0, 180, 260));
  const lookAtCurrent = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Interactive Drag & Zoom Controls
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraPolarAngle = useRef(0.65); // elevation
  const cameraAzimuthAngle = useRef(0.85); // rotation
  const cameraDistance = useRef(260);

  // Proximity sound detection reference
  const lastApproachedPlanetIdRef = useRef<PlanetId | null>(null);

  // 1. Initial Setup of Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 3000);
    camera.position.set(0, 180, 260);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with antialias and SRGB encoding
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Lighting ---
    // Subtle ambient light so unlit sides of planets remain softly visible
    const ambientLight = new THREE.AmbientLight(0x223344, 0.45);
    scene.add(ambientLight);

    // Sun Point Light: bright radiant illumination originating at center (0,0,0)
    const sunLight = new THREE.PointLight(0xfff7ed, 3.8, 1200, 0.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Subtle fill light from top-front
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x02040a, 0.25);
    scene.add(hemiLight);

    // --- Background Cosmic Starfield (Deep field) ---
    const starCount = 3500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xa5b4fc),
      new THREE.Color(0xfef08a),
      new THREE.Color(0x67e8f9),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 600 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    backgroundStarsRef.current = starField;

    // --- Cinematic Warp Speed Streaks for Intro Fly-Through ---
    const warpCount = 600;
    const warpPositions = new Float32Array(warpCount * 6);
    for (let i = 0; i < warpCount; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const z = -600 + Math.random() * 1200;
      const length = 40 + Math.random() * 80;

      // Start of streak
      warpPositions[i * 6] = x;
      warpPositions[i * 6 + 1] = y;
      warpPositions[i * 6 + 2] = z;

      // End of streak
      warpPositions[i * 6 + 3] = x;
      warpPositions[i * 6 + 4] = y;
      warpPositions[i * 6 + 5] = z + length;
    }
    const warpGeometry = new THREE.BufferGeometry();
    warpGeometry.setAttribute('position', new THREE.BufferAttribute(warpPositions, 3));
    const warpMaterial = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const warpLines = new THREE.LineSegments(warpGeometry, warpMaterial);
    scene.add(warpLines);
    warpStarsRef.current = warpLines;

    // --- Deep-Space Nebula Volumetric Glow Clouds (طبقة توهج سديمية عميقة لتعزيز العمق الفضائي) ---
    const nebulaGroup = new THREE.Group();
    scene.add(nebulaGroup);
    nebulaGlowGroupRef.current = nebulaGroup;

    const nebulaConfigs = [
      { inner: '14, 165, 233', outer: '2, 132, 199', x: 360, y: 140, z: -680, size: 900, rot: 0.35 },
      { inner: '124, 58, 237', outer: '79, 70, 229', x: -460, y: -90, z: -600, size: 1000, rot: -0.4 },
      { inner: '219, 39, 119', outer: '147, 51, 234', x: 420, y: -150, z: 540, size: 920, rot: 0.75 },
      { inner: '245, 158, 11', outer: '217, 119, 6', x: -340, y: 150, z: 620, size: 780, rot: -0.5 },
      { inner: '6, 182, 212', outer: '59, 130, 246', x: 0, y: -240, z: -780, size: 1150, rot: 0.15 },
      { inner: '99, 102, 241', outer: '67, 56, 202', x: -520, y: 220, z: -380, size: 850, rot: 0.85 },
    ];

    nebulaConfigs.forEach((cfg) => {
      const nebTex = createNebulaGlowTexture(cfg.inner, cfg.outer);
      const nebGeom = new THREE.PlaneGeometry(cfg.size, cfg.size);
      const nebMat = new THREE.MeshBasicMaterial({
        map: nebTex,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const nebMesh = new THREE.Mesh(nebGeom, nebMat);
      nebMesh.position.set(cfg.x, cfg.y, cfg.z);
      nebMesh.rotation.z = cfg.rot;
      nebMesh.lookAt(0, 0, 0);
      nebulaGroup.add(nebMesh);
    });

    // --- Floating Cosmic Star Dust Particles (جسيمات غبار النجوم الفضائية العائمة) ---
    const dustCount = 2600;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const dustPalette = [
      new THREE.Color(0x38bdf8), // Glowing cyan
      new THREE.Color(0x818cf8), // Ethereal indigo/violet
      new THREE.Color(0xfde047), // Stellar golden warmth
      new THREE.Color(0xffffff), // Radiant starlight
      new THREE.Color(0xc084fc), // Soft nebula lilac
      new THREE.Color(0x67e8f9), // Aquamarine stardust
    ];

    for (let i = 0; i < dustCount; i++) {
      // Disk-like distribution around solar system with gentle vertical scatter
      const r = 38 + Math.pow(Math.random(), 1.4) * 440;
      const theta = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (36 + r * 0.15);

      dustPositions[i * 3] = r * Math.cos(theta);
      dustPositions[i * 3 + 1] = height;
      dustPositions[i * 3 + 2] = r * Math.sin(theta);

      const col = dustPalette[Math.floor(Math.random() * dustPalette.length)];
      dustColors[i * 3] = col.r;
      dustColors[i * 3 + 1] = col.g;
      dustColors[i * 3 + 2] = col.b;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustTexture = createParticleGlowTexture();
    const dustMaterial = new THREE.PointsMaterial({
      size: 4.0,
      map: dustTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);
    stardustPointsRef.current = dustPoints;

    // --- Groups for Orbit Lines & Labels ---
    const orbitLinesGroup = new THREE.Group();
    scene.add(orbitLinesGroup);
    orbitLinesGroupRef.current = orbitLinesGroup;

    const labelsGroup = new THREE.Group();
    scene.add(labelsGroup);
    labelsGroupRef.current = labelsGroup;

    // --- Celestial Bodies Instantiation ---
    const sphereGeometryMap = new Map<number, THREE.SphereGeometry>();

    planets.forEach((body, index) => {
      // Geometry cache by size
      let geom = sphereGeometryMap.get(body.size);
      if (!geom) {
        geom = new THREE.SphereGeometry(body.size, 48, 48);
        sphereGeometryMap.set(body.size, geom);
      }

      const texture = createPlanetTexture(body.id);
      let material: THREE.Material;

      if (body.id === 'sun') {
        // Sun has self-illuminated emissive material
        material = new THREE.MeshBasicMaterial({
          map: texture,
          color: 0xffffff,
        });
      } else {
        // Planets react accurately to Sun's central light
        material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: body.id === 'earth' ? 0.6 : 0.8,
          metalness: 0.05,
        });
      }

      const planetMesh = new THREE.Mesh(geom, material);
      planetMesh.name = body.id;
      planetMesh.castShadow = true;
      planetMesh.receiveShadow = true;
      planetMesh.rotation.z = body.tilt;

      // Pivot group at (0,0,0) for orbital revolution
      const pivot = new THREE.Group();
      scene.add(pivot);

      // Position along X axis according to orbital radius
      planetMesh.position.set(body.orbitRadius, 0, 0);
      pivot.add(planetMesh);

      // Initial randomized or staggered orbit angle
      const initialAngle = (index / planets.length) * Math.PI * 2 + index * 0.4;
      pivot.rotation.y = initialAngle;

      // Sun special: Multi-layered glowing corona & cosmic radiant aura
      if (body.id === 'sun') {
        // Layer 1: Inner fiery corona
        const glowGeom = new THREE.SphereGeometry(body.size * 1.25, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xff7700,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
        });
        const glowMesh = new THREE.Mesh(glowGeom, glowMat);
        planetMesh.add(glowMesh);
        sunGlowMeshRef.current = glowMesh;

        // Layer 2: Outer diffuse solar aura
        const outerGlowGeom = new THREE.SphereGeometry(body.size * 1.85, 32, 32);
        const outerGlowMat = new THREE.MeshBasicMaterial({
          color: 0xffaa22,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
        });
        const outerGlowMesh = new THREE.Mesh(outerGlowGeom, outerGlowMat);
        planetMesh.add(outerGlowMesh);
        sunOuterGlowMeshRef.current = outerGlowMesh;

        // Layer 3: Planar solar radiant glow disc (in orbital plane)
        const solarDiscTex = createNebulaGlowTexture('255, 170, 50', '255, 80, 0');
        const solarDiscGeom = new THREE.PlaneGeometry(body.size * 7.5, body.size * 7.5);
        solarDiscGeom.rotateX(Math.PI / 2);
        const solarDiscMat = new THREE.MeshBasicMaterial({
          map: solarDiscTex,
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const solarDisc = new THREE.Mesh(solarDiscGeom, solarDiscMat);
        planetMesh.add(solarDisc);
      }

      // Saturn / Uranus Rings
      if (body.hasRings && body.ringInner && body.ringOuter) {
        const ringGeom = new THREE.RingGeometry(body.ringInner, body.ringOuter, 64);
        // Rotate ring to be parallel with planet equator
        ringGeom.rotateX(Math.PI / 2);
        const ringTex = createRingTexture(body.id as 'saturn' | 'uranus');

        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: body.id === 'saturn' ? 0.95 : 0.5,
          roughness: 0.8,
        });

        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        planetMesh.add(ringMesh);
      }

      // Create Orbital Path Ring (Line)
      if (body.orbitRadius > 0) {
        const segments = 128;
        const orbitCurvePoints = [];
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          orbitCurvePoints.push(
            new THREE.Vector3(Math.cos(theta) * body.orbitRadius, 0, Math.sin(theta) * body.orbitRadius)
          );
        }
        const orbitLineGeom = new THREE.BufferGeometry().setFromPoints(orbitCurvePoints);
        const orbitLineMat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
        });
        const orbitLine = new THREE.Line(orbitLineGeom, orbitLineMat);
        orbitLinesGroup.add(orbitLine);
      }

      planetMeshesRef.current.set(body.id, {
        mesh: planetMesh,
        pivot,
        bodyData: body,
        orbitAngle: initialAngle,
      });
    });

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [planets]);

  // 2. Update Orbit Lines visibility based on prop
  useEffect(() => {
    if (orbitLinesGroupRef.current) {
      orbitLinesGroupRef.current.visible = showOrbits;
    }
  }, [showOrbits]);

  // 3. Camera Position Target Computation based on selected planet or Intro state
  useEffect(() => {
    if (isIntroActive) {
      // Intro camera path:
      // Starts deep in distant space (-800 z, 60 y), flying forward through stars, then curving into overview
      return;
    }

    if (!selectedPlanet) {
      // Full Solar System Overview: majestic isometric diagonal view
      const targetDist = cameraDistance.current;
      const x = targetDist * Math.sin(cameraAzimuthAngle.current) * Math.cos(cameraPolarAngle.current);
      const y = targetDist * Math.sin(cameraPolarAngle.current);
      const z = targetDist * Math.cos(cameraAzimuthAngle.current) * Math.cos(cameraPolarAngle.current);

      cameraTargetPos.current.set(x, Math.max(y, 45), z);
      lookAtTarget.current.set(0, 0, 0);
    } else {
      // Focusing on a specific planet: camera moves closely to that planet's current world position
      const planetEntry = planetMeshesRef.current.get(selectedPlanet.id);
      if (planetEntry) {
        const worldPos = new THREE.Vector3();
        planetEntry.mesh.getWorldPosition(worldPos);

        const zoomDist = selectedPlanet.id === 'sun' ? 42 : selectedPlanet.size * 3.8 + 6;
        // Camera offset angled slightly above and to the side
        cameraTargetPos.current.set(
          worldPos.x + zoomDist * 0.7,
          worldPos.y + zoomDist * 0.45,
          worldPos.z + zoomDist * 0.7
        );
        lookAtTarget.current.copy(worldPos);
      }
    }
  }, [selectedPlanet, isIntroActive]);

  // 4. Main Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const camera = cameraRef.current;
      const scene = sceneRef.current;
      const renderer = rendererRef.current;

      if (!camera || !scene || !renderer) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // Background stars slow rotation for depth
      if (backgroundStarsRef.current) {
        backgroundStarsRef.current.rotation.y += 0.0001;
      }

      // Deep nebula glow subtle cosmic drift
      if (nebulaGlowGroupRef.current) {
        nebulaGlowGroupRef.current.rotation.y += 0.00007;
      }

      // Floating stardust particles gentle orbital rotation & luminescence shimmer
      if (stardustPointsRef.current) {
        stardustPointsRef.current.rotation.y += 0.00022;
        const dustMat = stardustPointsRef.current.material as THREE.PointsMaterial;
        dustMat.opacity = 0.78 + Math.sin(currentTime * 0.0016) * 0.12;
      }

      // Multi-layer Sun glow pulses
      if (sunGlowMeshRef.current) {
        const pulse = 1 + Math.sin(currentTime * 0.002) * 0.04;
        sunGlowMeshRef.current.scale.set(pulse, pulse, pulse);
      }
      if (sunOuterGlowMeshRef.current) {
        const pulseOuter = 1 + Math.cos(currentTime * 0.0014) * 0.06;
        sunOuterGlowMeshRef.current.scale.set(pulseOuter, pulseOuter, pulseOuter);
      }

      // A. Intro Camera Sequence handling
      if (isIntroActive) {
        // introProgress: 0.0 -> 1.0
        // Phase 1 (0 to 0.4): Fast warp speed travel through starfield with streaks
        // Phase 2 (0.4 to 0.8): Deceleration, Sun emerges, camera curves into orbit
        // Phase 3 (0.8 to 1.0): Camera glides smoothly to the ready start view
        const p = introProgress;

        if (warpStarsRef.current) {
          const mat = warpStarsRef.current.material as THREE.LineBasicMaterial;
          if (p < 0.45) {
            mat.opacity = THREE.MathUtils.lerp(0.0, 0.85, Math.sin(p / 0.45 * Math.PI));
            warpStarsRef.current.position.z += 18;
            if (warpStarsRef.current.position.z > 300) warpStarsRef.current.position.z = -300;
          } else {
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.0, 0.1);
          }
        }

        // Camera path during intro
        if (p < 0.5) {
          // Fast dive
          const t = p / 0.5;
          const startZ = 900;
          const endZ = 350;
          const camZ = THREE.MathUtils.lerp(startZ, endZ, t);
          cameraCurrentPos.current.set(Math.sin(t * 3) * 30, 20 + t * 40, camZ);
          lookAtCurrent.current.set(0, 0, 0);
        } else {
          // Curving approach towards solar system
          const t = (p - 0.5) / 0.5;
          const easeT = 0.5 - Math.cos(t * Math.PI) / 2;
          const x = THREE.MathUtils.lerp(30, 160, easeT);
          const y = THREE.MathUtils.lerp(60, 150, easeT);
          const z = THREE.MathUtils.lerp(350, 220, easeT);
          cameraCurrentPos.current.set(x, y, z);
          lookAtCurrent.current.set(0, 0, 0);
        }

        camera.position.copy(cameraCurrentPos.current);
        camera.lookAt(lookAtCurrent.current);

      } else {
        // B. Interactive Regular Scene Mode
        if (warpStarsRef.current) {
          (warpStarsRef.current.material as THREE.LineBasicMaterial).opacity = 0;
        }

        // Update planetary orbits and self-rotations
        planetMeshesRef.current.forEach(({ mesh, pivot, bodyData }, planetId) => {
          // Axial spin (always active)
          mesh.rotation.y += bodyData.rotationSpeed * (isPlaying ? orbitSpeedMultiplier : 0.4);

          // Orbital revolution
          if (bodyData.orbitRadius > 0 && isPlaying) {
            // If a planet is currently selected, slow down other planets slightly so camera tracking is comfortable
            const currentSpeedFactor = selectedPlanet ? 0.35 : 1.0;
            const angularStep = bodyData.orbitSpeed * orbitSpeedMultiplier * currentSpeedFactor * delta * 2.5;
            pivot.rotation.y += angularStep;
          }

          // If this planet is currently selected, keep camera tracked onto it
          if (selectedPlanet && selectedPlanet.id === planetId) {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);

            const zoomDist = selectedPlanet.id === 'sun' ? 42 : selectedPlanet.size * 3.8 + 6;
            cameraTargetPos.current.set(
              worldPos.x + zoomDist * 0.7,
              worldPos.y + zoomDist * 0.45,
              worldPos.z + zoomDist * 0.7
            );
            lookAtTarget.current.copy(worldPos);
          }
        });

        // Smooth Lerp Camera position & lookAt
        const lerpSpeed = selectedPlanet ? 0.06 : 0.05;
        cameraCurrentPos.current.lerp(cameraTargetPos.current, lerpSpeed);
        lookAtCurrent.current.lerp(lookAtTarget.current, lerpSpeed);

        camera.position.copy(cameraCurrentPos.current);
        camera.lookAt(lookAtCurrent.current);

        // Acoustic Proximity Detection: When freely navigating or zooming near a celestial body
        if (!selectedPlanet) {
          let nearestBody: CelestialBody | null = null;
          let minDistance = Infinity;

          planetMeshesRef.current.forEach(({ mesh, bodyData }) => {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            const dist = camera.position.distanceTo(worldPos);
            const proximityThreshold = bodyData.id === 'sun' ? 70 : bodyData.size * 5.2 + 22;
            if (dist < proximityThreshold && dist < minDistance) {
              minDistance = dist;
              nearestBody = bodyData;
            }
          });

          if (nearestBody) {
            const targetId = (nearestBody as CelestialBody).id;
            if (lastApproachedPlanetIdRef.current !== targetId) {
              lastApproachedPlanetIdRef.current = targetId;
              spaceAudio.playPlanetAmbience(targetId);
            }
          } else {
            if (lastApproachedPlanetIdRef.current !== null) {
              lastApproachedPlanetIdRef.current = null;
              spaceAudio.stopPlanetAmbience(0.9);
            }
          }
        } else {
          lastApproachedPlanetIdRef.current = selectedPlanet.id;
        }
      }

      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isIntroActive, introProgress, isPlaying, orbitSpeedMultiplier, selectedPlanet]);

  // 5. User Interaction: Pointer Down / Move / Up for Free Orbit Navigation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isIntroActive) return;
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || isIntroActive) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    if (!selectedPlanet) {
      // Orbiting around center (0,0,0)
      cameraAzimuthAngle.current -= deltaX * 0.005;
      cameraPolarAngle.current = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraPolarAngle.current + deltaY * 0.005));

      const targetDist = cameraDistance.current;
      const x = targetDist * Math.sin(cameraAzimuthAngle.current) * Math.cos(cameraPolarAngle.current);
      const y = targetDist * Math.sin(cameraPolarAngle.current);
      const z = targetDist * Math.cos(cameraAzimuthAngle.current) * Math.cos(cameraPolarAngle.current);

      cameraTargetPos.current.set(x, Math.max(y, 35), z);
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (isIntroActive) return;
    e.preventDefault();

    if (!selectedPlanet) {
      cameraDistance.current = Math.max(70, Math.min(500, cameraDistance.current + e.deltaY * 0.25));
      const targetDist = cameraDistance.current;
      const x = targetDist * Math.sin(cameraAzimuthAngle.current) * Math.cos(cameraPolarAngle.current);
      const y = targetDist * Math.sin(cameraPolarAngle.current);
      const z = targetDist * Math.cos(cameraAzimuthAngle.current) * Math.cos(cameraPolarAngle.current);
      cameraTargetPos.current.set(x, Math.max(y, 35), z);
    }
  };

  // Raycasting on Click: Select Planet in 3D
  const handleClick = (e: React.MouseEvent) => {
    if (isIntroActive) return;
    const container = containerRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    // Detect if this was a drag gesture
    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const meshes: THREE.Object3D[] = [];
    planetMeshesRef.current.forEach(({ mesh }) => {
      meshes.push(mesh);
    });

    const intersects = raycaster.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as THREE.Mesh;
      const planetId = clickedMesh.name as PlanetId;
      const planet = planets.find((p) => p.id === planetId);
      if (planet) {
        spaceAudio.playPlanetFocus(planet.id);
        spaceAudio.playPlanetAmbience(planet.id);
        onSelectPlanet(planet);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="solar-system-canvas-container"
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      {/* 3D Canvas will be appended here by Three.js */}

      {/* Floating 3D Planet Indicator Pill Labels if enabled and not in intro */}
      {!isIntroActive && showLabels && !selectedPlanet && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {planets.map((p) => {
            const entry = planetMeshesRef.current.get(p.id);
            if (!entry || !cameraRef.current || !containerRef.current) return null;

            const worldPos = new THREE.Vector3();
            entry.mesh.getWorldPosition(worldPos);

            // Project to 2D screen coordinate
            const projected = worldPos.clone().project(cameraRef.current);
            const isBehind = projected.z > 1;
            if (isBehind) return null;

            const x = (projected.x * 0.5 + 0.5) * containerRef.current.clientWidth;
            const y = (-projected.y * 0.5 + 0.5) * containerRef.current.clientHeight;

            return (
              <div
                key={p.id}
                id={`planet-label-${p.id}`}
                style={{
                  left: `${x}px`,
                  top: `${y - 28}px`,
                  transform: 'translate(-50%, -100%)',
                }}
                className="absolute flex flex-col items-center pointer-events-auto cursor-pointer group transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlanet(p);
                }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-700/60 backdrop-blur-md text-xs text-slate-200 shadow-lg group-hover:border-cyan-400/80 group-hover:text-cyan-200 group-hover:scale-105 transition-all">
                  <span
                    className="w-2 h-2 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-medium tracking-wide">{p.nameAr}</span>
                </div>
                {/* Subtle pin line pointing downwards */}
                <div className="w-px h-3 bg-gradient-to-b from-cyan-400/60 to-transparent" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
