import * as THREE from 'three';
import { PlanetId } from '../types';

// Cache generated textures to avoid rebuilding
const textureCache = new Map<string, THREE.CanvasTexture>();

export function createPlanetTexture(id: PlanetId): THREE.CanvasTexture {
  if (textureCache.has(id)) {
    return textureCache.get(id)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  const w = canvas.width;
  const h = canvas.height;

  switch (id) {
    case 'sun': {
      // Fiery plasma surface with vibrant turbulent noise and flares
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#ffcc00');
      gradient.addColorStop(0.5, '#ff6600');
      gradient.addColorStop(1, '#ff3300');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Solar flare spots & granules
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rad = 2 + Math.random() * 14;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, rad);
        glow.addColorStop(0, 'rgba(255, 255, 220, 0.85)');
        glow.addColorStop(0.4, 'rgba(255, 180, 40, 0.4)');
        glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Solar sunspots
      for (let i = 0; i < 18; i++) {
        const x = Math.random() * w;
        const y = h * 0.25 + Math.random() * h * 0.5;
        const rad = 3 + Math.random() * 8;
        ctx.fillStyle = 'rgba(70, 10, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mercury': {
      // Rocky cratered gray-ochre surface
      ctx.fillStyle = '#655e58';
      ctx.fillRect(0, 0, w, h);

      // Rocky variegation
      for (let i = 0; i < 1200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 4;
        ctx.fillStyle = Math.random() > 0.5 ? '#807770' : '#453f3b';
        ctx.fillRect(x, y, r, r);
      }

      // Distinct impact craters
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 4 + Math.random() * 16;
        ctx.strokeStyle = 'rgba(210, 200, 190, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner crater shadow
        ctx.fillStyle = 'rgba(40, 35, 30, 0.35)';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'venus': {
      // Dense swirling sulfuric acid clouds, warm golden yellow hues
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#cda158');
      grad.addColorStop(0.3, '#dfb974');
      grad.addColorStop(0.5, '#e9c88e');
      grad.addColorStop(0.7, '#d3a95d');
      grad.addColorStop(1, '#b58c42');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric cloud bands & turbulence
      for (let y = 0; y < h; y += 4) {
        const alpha = 0.08 + Math.sin(y * 0.04) * 0.05;
        ctx.fillStyle = `rgba(255, 245, 210, ${alpha})`;
        ctx.fillRect(0, y, w, 3);
      }

      // Swirl patterns
      for (let i = 0; i < 30; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        ctx.strokeStyle = 'rgba(255, 230, 180, 0.2)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 60 + Math.random() * 80, 15 + Math.random() * 20, Math.PI / 12, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'earth': {
      // Deep blue ocean baseline
      ctx.fillStyle = '#0f3869';
      ctx.fillRect(0, 0, w, h);

      // Shallow coastal turquoise shelves
      ctx.fillStyle = '#155e82';
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * w;
        const y = h * 0.2 + Math.random() * h * 0.6;
        ctx.beginPath();
        ctx.ellipse(x, y, 40 + Math.random() * 80, 20 + Math.random() * 40, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      // Continents (green, brown, savannah)
      const continentColors = ['#2e7d32', '#388e3c', '#558b2f', '#795548', '#8d6e63', '#a1887f'];
      for (let c = 0; c < 28; c++) {
        const cx = (c * (w / 14)) % w + (Math.random() * 40 - 20);
        const cy = h * 0.2 + Math.random() * h * 0.6;
        const rw = 50 + Math.random() * 110;
        const rh = 30 + Math.random() * 70;

        ctx.fillStyle = continentColors[c % continentColors.length];
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner land detail
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy, rw * 0.5, rh * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Polar ice caps (North & South)
      ctx.fillStyle = '#f8fafc';
      // North pole
      ctx.fillRect(0, 0, w, h * 0.08);
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.arc(i, h * 0.08, 12 + Math.sin(i * 0.05) * 8, 0, Math.PI);
        ctx.fill();
      }
      // South pole
      ctx.fillRect(0, h * 0.92, w, h * 0.08);
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.arc(i, h * 0.92, 14 + Math.sin(i * 0.06) * 9, Math.PI, 0);
        ctx.fill();
      }

      // Swirling white weather clouds
      for (let i = 0; i < 45; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 70 + Math.random() * 90, 8 + Math.random() * 15, -0.2 + Math.random() * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mars': {
      // Red-orange iron oxide terrain
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#c2410c');
      grad.addColorStop(0.5, '#9a3412');
      grad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Dark basaltic volcanic plains (Syrtis Major)
      ctx.fillStyle = 'rgba(67, 20, 7, 0.6)';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = h * 0.3 + Math.random() * h * 0.4;
        ctx.beginPath();
        ctx.ellipse(x, y, 40 + Math.random() * 80, 20 + Math.random() * 40, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      // Valles Marineris canyon streak
      ctx.strokeStyle = 'rgba(45, 12, 4, 0.8)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.52);
      ctx.bezierCurveTo(w * 0.35, h * 0.54, w * 0.45, h * 0.5, w * 0.6, h * 0.53);
      ctx.stroke();

      // White polar CO2 ice caps
      ctx.fillStyle = 'rgba(254, 242, 242, 0.9)';
      ctx.fillRect(0, 0, w, h * 0.05);
      ctx.fillRect(0, h * 0.95, w, h * 0.05);
      break;
    }

    case 'jupiter': {
      // Gas giant cloud bands: cream, caramel, rust, deep amber
      const bands = [
        '#e0c4a4', '#b37746', '#e7d3be', '#8f4f2c', '#d19f6a', 
        '#6d381c', '#cfaf87', '#9c5d32', '#dcc1a3', '#b17441'
      ];
      const bandHeight = h / bands.length;
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * bandHeight, w, bandHeight + 1);
      }

      // Turbulent ripple waves between bands
      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = Math.sin(y * 0.1) > 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, y, w, 4);
      }

      // Great Red Spot storm vortex
      const grsX = w * 0.62;
      const grsY = h * 0.62;
      const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, 45);
      grsGrad.addColorStop(0, '#be123c');
      grsGrad.addColorStop(0.5, '#ea580c');
      grsGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = grsGrad;
      ctx.beginPath();
      ctx.ellipse(grsX, grsY, 55, 30, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // White storms & swirls
      for (let i = 0; i < 25; i++) {
        const sx = Math.random() * w;
        const sy = h * 0.3 + Math.random() * h * 0.4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 8 + Math.random() * 12, 3 + Math.random() * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'saturn': {
      // Golden creamy atmospheric bands
      const bands = ['#d8b884', '#e8d2a7', '#cba76f', '#edd8b4', '#d2ae77', '#f4e5c7', '#c59d64'];
      const bandHeight = h / bands.length;
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * bandHeight, w, bandHeight + 1);
      }

      // Soft haze
      for (let y = 0; y < h; y += 6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, y, w, 2);
      }
      break;
    }

    case 'uranus': {
      // Featureless, serene cyan-aquamarine methane ice mantle
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#5eead4');
      grad.addColorStop(0.3, '#2dd4bf');
      grad.addColorStop(0.7, '#0d9488');
      grad.addColorStop(1, '#0f766e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric streaks
      for (let y = 0; y < h; y += 12) {
        ctx.fillStyle = 'rgba(204, 251, 241, 0.07)';
        ctx.fillRect(0, y, w, 4);
      }
      break;
    }

    case 'neptune': {
      // Deep majestic azure with supersonic methane cloud streaks
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(0.4, '#2563eb');
      grad.addColorStop(0.7, '#1e40af');
      grad.addColorStop(1, '#172554');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Great Dark Spot (oval storm)
      const dsX = w * 0.4;
      const dsY = h * 0.45;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.beginPath();
      ctx.ellipse(dsX, dsY, 40, 22, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // High-altitude white methane cirrus streaks
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = h * 0.2 + Math.random() * h * 0.6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.ellipse(x, y, 40 + Math.random() * 60, 2 + Math.random() * 3, 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(id, texture);

  return texture;
}

// Procedural texture for Saturn & Uranus rings
export function createRingTexture(planetId: 'saturn' | 'uranus'): THREE.CanvasTexture {
  const cacheKey = `ring_${planetId}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  if (planetId === 'saturn') {
    // Rich concentric bands with Cassini division gap
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0.0, 'rgba(220, 195, 155, 0.2)');
    grad.addColorStop(0.15, 'rgba(240, 215, 175, 0.85)'); // Ring C
    grad.addColorStop(0.45, 'rgba(215, 185, 140, 0.95)'); // Ring B (brightest)
    grad.addColorStop(0.55, 'rgba(20, 15, 10, 0.05)');    // Cassini Division gap!
    grad.addColorStop(0.60, 'rgba(230, 205, 165, 0.75)'); // Ring A
    grad.addColorStop(0.90, 'rgba(180, 155, 120, 0.6)');
    grad.addColorStop(1.0, 'rgba(140, 120, 95, 0.0)');    // outer edge fade
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Uranus faint cyan dust ring
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0.0, 'rgba(153, 246, 228, 0)');
    grad.addColorStop(0.4, 'rgba(153, 246, 228, 0.5)');
    grad.addColorStop(0.7, 'rgba(94, 234, 212, 0.6)');
    grad.addColorStop(1.0, 'rgba(45, 212, 191, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

// Generates a smooth circular glowing sprite texture for stardust particles
export function createParticleGlowTexture(): THREE.CanvasTexture {
  const cacheKey = '__stardust_particle_glow__';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const center = 64;
  const radius = 64;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.2, 'rgba(235, 248, 255, 0.85)');
  gradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.35)');
  gradient.addColorStop(0.8, 'rgba(56, 189, 248, 0.08)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(cacheKey, texture);
  return texture;
}

// Generates an expansive, ethereal deep-space nebula volumetric glow cloud
export function createNebulaGlowTexture(innerRgb: string, outerRgb: string): THREE.CanvasTexture {
  const cacheKey = `__nebula_${innerRgb}_${outerRgb}__`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const center = 256;
  const radius = 256;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  gradient.addColorStop(0.0, `rgba(${innerRgb}, 0.75)`);
  gradient.addColorStop(0.3, `rgba(${innerRgb}, 0.4)`);
  gradient.addColorStop(0.65, `rgba(${outerRgb}, 0.15)`);
  gradient.addColorStop(0.85, `rgba(${outerRgb}, 0.04)`);
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add subtle cosmic cloud wisps
  for (let i = 0; i < 40; i++) {
    const rx = center + (Math.random() - 0.5) * 200;
    const ry = center + (Math.random() - 0.5) * 200;
    const rSize = 30 + Math.random() * 80;
    const cloud = ctx.createRadialGradient(rx, ry, 0, rx, ry, rSize);
    cloud.addColorStop(0, `rgba(${innerRgb}, 0.12)`);
    cloud.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(cacheKey, texture);
  return texture;
}
