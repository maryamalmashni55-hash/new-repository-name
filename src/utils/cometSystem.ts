import * as THREE from 'three';
import { CometEventData } from '../types';
import { spaceAudio } from './audioSynthesizer';

export interface CometPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  ionTailColor: THREE.Color;
  dustTailColor: THREE.Color;
  comaColor: THREE.Color;
  speedKmS: string;
  sizeMultiplier: number;
}

export const COMET_PRESETS: CometPreset[] = [
  {
    id: 'halley',
    nameAr: 'مذنب هالي (1P/Halley)',
    nameEn: "Halley's Comet",
    descriptionAr: 'أشهر مذنب دوري في التاريخ، يتميز بذيل أيوني فيروزي متوهج وهالة غازية باهرة.',
    ionTailColor: new THREE.Color(0x38bdf8),
    dustTailColor: new THREE.Color(0xe0f2fe),
    comaColor: new THREE.Color(0x06b6d4),
    speedKmS: '54.5',
    sizeMultiplier: 1.1,
  },
  {
    id: 'neowise',
    nameAr: 'مذنب نيوايز (C/2020 F3)',
    nameEn: 'Comet NEOWISE',
    descriptionAr: 'مذنب مذهل شوهد عام 2020 بوضوح بالعين المجردة مع ذيلين منفصلين: غباري ذهبي وأيوني أزرق.',
    ionTailColor: new THREE.Color(0x0284c7),
    dustTailColor: new THREE.Color(0xfbbf24),
    comaColor: new THREE.Color(0x38bdf8),
    speedKmS: '64.8',
    sizeMultiplier: 1.25,
  },
  {
    id: 'hale-bopp',
    nameAr: 'مذنب هيل-بوب (C/1995 O1)',
    nameEn: 'Comet Hale-Bopp',
    descriptionAr: 'أحد ألمع مذنبات القرن العشرين، استمر مرئياً لأشهر بذيلين أسطوريين فائقَي التوهج.',
    ionTailColor: new THREE.Color(0x60a5fa),
    dustTailColor: new THREE.Color(0xfef08a),
    comaColor: new THREE.Color(0x93c5fd),
    speedKmS: '72.3',
    sizeMultiplier: 1.35,
  },
  {
    id: 'nishimura',
    nameAr: 'مذنب نيشيمورا (C/2023 P1)',
    nameEn: 'Comet Nishimura',
    descriptionAr: 'مذنب ذو وهج زمردي أخضر نادر ناتج عن جزيئات الكربون الثنائي (C2) مع ذيل غازي ناعم.',
    ionTailColor: new THREE.Color(0x34d399),
    dustTailColor: new THREE.Color(0x818cf8),
    comaColor: new THREE.Color(0x10b981),
    speedKmS: '68.0',
    sizeMultiplier: 1.15,
  },
  {
    id: 'tsuchinshan-atlas',
    nameAr: 'مذنب تسوشينشان-أطلس (C/2023 A3)',
    nameEn: 'Comet Tsuchinshan-ATLAS',
    descriptionAr: 'مذنب ساحر عابر من سحابة أورت، يتألق بذيل غباري ممتد لملايين الكيلومترات في الفضاء.',
    ionTailColor: new THREE.Color(0x38bdf8),
    dustTailColor: new THREE.Color(0xf59e0b),
    comaColor: new THREE.Color(0xfcd34d),
    speedKmS: '78.2',
    sizeMultiplier: 1.3,
  },
  {
    id: 'encke',
    nameAr: 'مذنب إنسكي (2P/Encke)',
    nameEn: 'Comet Encke',
    descriptionAr: 'صاحب أقصر دورة مدارية لمذنب معروف (3.3 سنوات)، يمر بلمعان فضي بلوري خاطف.',
    ionTailColor: new THREE.Color(0xa5b4fc),
    dustTailColor: new THREE.Color(0xf1f5f9),
    comaColor: new THREE.Color(0xc7d2fe),
    speedKmS: '46.7',
    sizeMultiplier: 0.95,
  },
];

// Helper to create circular radial glow texture for the coma and tail embers
let cachedComaTexture: THREE.CanvasTexture | null = null;
function getComaGlowTexture(): THREE.CanvasTexture {
  if (cachedComaTexture) return cachedComaTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.5, 'rgba(220, 240, 255, 0.4)');
  grad.addColorStop(0.8, 'rgba(180, 220, 255, 0.1)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  cachedComaTexture = new THREE.CanvasTexture(canvas);
  return cachedComaTexture;
}

// Particle pool for comet dust trail
interface TrailParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

/**
 * Single Active Comet in 3D Space
 */
export class ActiveComet {
  public id: string;
  public preset: CometPreset;
  public group: THREE.Group;
  public isFinished: boolean = false;

  private scene: THREE.Scene;
  private curve: THREE.CatmullRomCurve3;
  private progress: number = 0; // 0.0 to 1.0
  private speed: number; // rate per second

  // 3D Visual Components
  private nucleusMesh: THREE.Mesh;
  private comaSprite: THREE.Sprite;
  private outerComaSprite: THREE.Sprite;
  private pointLight: THREE.PointLight;

  // Tail Ribbon (Ion Tail)
  private ionTailMesh: THREE.Mesh;
  private ionTailGeometry: THREE.BufferGeometry;
  private ionTailPositions: Float32Array;
  private ionTailColors: Float32Array;
  private ionTailSegments: number = 28;

  // Tail Ribbon (Dust Tail)
  private dustTailMesh: THREE.Mesh;
  private dustTailGeometry: THREE.BufferGeometry;
  private dustTailPositions: Float32Array;
  private dustTailColors: Float32Array;
  private dustTailSegments: number = 24;

  // Dust Particle Trail System
  private particles: TrailParticle[] = [];
  private particlePoints: THREE.Points;
  private particleGeometry: THREE.BufferGeometry;
  private particlePositionsArray: Float32Array;
  private particleColorsArray: Float32Array;
  private maxParticles: number = 400;

  // History trail for curving inertia
  private historyPoints: THREE.Vector3[] = [];
  private maxHistory: number = 30;

  constructor(scene: THREE.Scene, preset: CometPreset) {
    this.id = `comet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.preset = preset;
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);

    // Dynamic flight duration between 12 and 18 seconds
    const duration = 12 + Math.random() * 6;
    this.speed = 1 / duration;

    // Build realistic hyperbolic passing trajectory
    this.curve = this.generateHyperbolicTrajectory();

    // 1. Nucleus (Solid ice/rock core)
    const nucleusGeom = new THREE.SphereGeometry(1.4 * preset.sizeMultiplier, 16, 16);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: preset.comaColor,
      emissiveIntensity: 0.8,
      roughness: 0.8,
    });
    this.nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat);
    this.group.add(this.nucleusMesh);

    // 2. Coma Halo Sprites (Inner intense core + Outer atmospheric cloud)
    const glowTex = getComaGlowTexture();

    const innerComaMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.comaSprite = new THREE.Sprite(innerComaMat);
    this.comaSprite.scale.set(16 * preset.sizeMultiplier, 16 * preset.sizeMultiplier, 1);
    this.group.add(this.comaSprite);

    const outerComaMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: preset.comaColor,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.outerComaSprite = new THREE.Sprite(outerComaMat);
    this.outerComaSprite.scale.set(36 * preset.sizeMultiplier, 36 * preset.sizeMultiplier, 1);
    this.group.add(this.outerComaSprite);

    // 3. Dynamic Point Light on Comet Head
    this.pointLight = new THREE.PointLight(preset.comaColor, 2.2, 160, 1.2);
    this.group.add(this.pointLight);

    // 4. Ion Tail (Narrow, intense straight ribbon driven by solar wind)
    const ionSegs = this.ionTailSegments;
    this.ionTailPositions = new Float32Array(ionSegs * 2 * 3);
    this.ionTailColors = new Float32Array(ionSegs * 2 * 3);
    this.ionTailGeometry = new THREE.BufferGeometry();
    this.ionTailGeometry.setAttribute('position', new THREE.BufferAttribute(this.ionTailPositions, 3));
    this.ionTailGeometry.setAttribute('color', new THREE.BufferAttribute(this.ionTailColors, 3));

    const ionIndices: number[] = [];
    for (let i = 0; i < ionSegs - 1; i++) {
      const topL = i * 2;
      const topR = i * 2 + 1;
      const botL = (i + 1) * 2;
      const botR = (i + 1) * 2 + 1;
      ionIndices.push(topL, botL, topR);
      ionIndices.push(topR, botL, botR);
    }
    this.ionTailGeometry.setIndex(ionIndices);

    const ionMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.ionTailMesh = new THREE.Mesh(this.ionTailGeometry, ionMat);
    this.scene.add(this.ionTailMesh);

    // 5. Dust Tail (Wider, curved fan-like ribbon slightly trailing orbital track)
    const dustSegs = this.dustTailSegments;
    this.dustTailPositions = new Float32Array(dustSegs * 2 * 3);
    this.dustTailColors = new Float32Array(dustSegs * 2 * 3);
    this.dustTailGeometry = new THREE.BufferGeometry();
    this.dustTailGeometry.setAttribute('position', new THREE.BufferAttribute(this.dustTailPositions, 3));
    this.dustTailGeometry.setAttribute('color', new THREE.BufferAttribute(this.dustTailColors, 3));

    const dustIndices: number[] = [];
    for (let i = 0; i < dustSegs - 1; i++) {
      const topL = i * 2;
      const topR = i * 2 + 1;
      const botL = (i + 1) * 2;
      const botR = (i + 1) * 2 + 1;
      dustIndices.push(topL, botL, topR);
      dustIndices.push(topR, botL, botR);
    }
    this.dustTailGeometry.setIndex(dustIndices);

    const dustMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.dustTailMesh = new THREE.Mesh(this.dustTailGeometry, dustMat);
    this.scene.add(this.dustTailMesh);

    // 6. Dust Particle Cloud
    this.particlePositionsArray = new Float32Array(this.maxParticles * 3);
    this.particleColorsArray = new Float32Array(this.maxParticles * 3);
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositionsArray, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.particleColorsArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 3.5 * preset.sizeMultiplier,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.particlePoints = new THREE.Points(this.particleGeometry, particleMat);
    this.scene.add(this.particlePoints);

    // Initialize position
    const initialPos = this.curve.getPointAt(0);
    this.group.position.copy(initialPos);
    this.historyPoints.push(initialPos.clone());
  }

  /**
   * Generates a 3D curved flyby traversing the solar system with perihelion near the Sun
   */
  private generateHyperbolicTrajectory(): THREE.CatmullRomCurve3 {
    // Random inclination angle and entrance orientation
    const enterAngle = Math.random() * Math.PI * 2;
    const enterDist = 650 + Math.random() * 250;
    const enterY = (Math.random() - 0.5) * 350;

    const start = new THREE.Vector3(
      enterDist * Math.cos(enterAngle),
      enterY,
      enterDist * Math.sin(enterAngle)
    );

    // Perihelion (closest point to Sun: 0, 0, 0)
    // Distance between 65 and 140 units (near inner planets)
    const perihelionDist = 70 + Math.random() * 70;
    const perihelionAngle = enterAngle + Math.PI * 0.7 + (Math.random() - 0.5) * 0.5;
    const perihelionY = (Math.random() - 0.5) * 60; // passes near or through orbital plane

    const perihelion = new THREE.Vector3(
      perihelionDist * Math.cos(perihelionAngle),
      perihelionY,
      perihelionDist * Math.sin(perihelionAngle)
    );

    // Midway approach point
    const mid1 = new THREE.Vector3().lerpVectors(start, perihelion, 0.5).add(
      new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60)
    );

    // Exit point on opposite side of solar system
    const exitAngle = perihelionAngle + Math.PI * 0.65 + (Math.random() - 0.5) * 0.4;
    const exitDist = 700 + Math.random() * 280;
    const exitY = (Math.random() - 0.5) * 400;

    const end = new THREE.Vector3(
      exitDist * Math.cos(exitAngle),
      exitY,
      exitDist * Math.sin(exitAngle)
    );

    // Midway exit point
    const mid2 = new THREE.Vector3().lerpVectors(perihelion, end, 0.5).add(
      new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60)
    );

    return new THREE.CatmullRomCurve3([start, mid1, perihelion, mid2, end], false, 'centripetal');
  }

  /**
   * Main simulation step
   */
  public update(delta: number, sunPos: THREE.Vector3, camera: THREE.Camera) {
    if (this.isFinished) return;

    // Keplerian-like speed profile: moves faster near perihelion (middle of trajectory)
    // t close to 0.5 -> speed boosted by ~1.7x
    const distToCenter = this.group.position.length();
    const speedFactor = 0.8 + Math.max(0, 1.4 - (distToCenter / 450));
    this.progress += this.speed * delta * speedFactor;

    if (this.progress >= 1.0) {
      this.isFinished = true;
      return;
    }

    // Evaluate current 3D position
    const currentPos = this.curve.getPointAt(Math.min(0.999, Math.max(0.001, this.progress)));
    this.group.position.copy(currentPos);

    // Track history for tail curve
    this.historyPoints.unshift(currentPos.clone());
    if (this.historyPoints.length > this.maxHistory) {
      this.historyPoints.pop();
    }

    // Velocity vector (comet motion direction)
    const tangent = this.curve.getTangentAt(Math.min(0.999, Math.max(0.001, this.progress))).normalize();

    // Solar wind vector: strictly away from the Sun (Sun at sunPos or 0,0,0)
    const awayFromSun = new THREE.Vector3().subVectors(currentPos, sunPos).normalize();

    // Distance to Sun dictates coma brightness & tail length (sublimation!)
    const solarProximity = Math.max(0.2, Math.min(1.0, 1.0 - (distToCenter - 70) / 450));

    // Dynamic Coma Sizing & Light
    const comaScale = (24 + solarProximity * 22) * this.preset.sizeMultiplier;
    this.outerComaSprite.scale.set(comaScale, comaScale, 1);
    (this.outerComaSprite.material as THREE.SpriteMaterial).opacity = 0.4 + solarProximity * 0.5;
    this.pointLight.intensity = 1.0 + solarProximity * 2.2;

    // Camera facing vector for ribbon billboards
    const camDir = new THREE.Vector3().subVectors(camera.position, currentPos).normalize();

    // 1. UPDATE ION TAIL RIBBON (Points away from the Sun)
    const ionLength = (140 + solarProximity * 180) * this.preset.sizeMultiplier;
    const ionSegs = this.ionTailSegments;
    const ionSide = new THREE.Vector3().crossVectors(awayFromSun, camDir).normalize();

    const ionCol = this.preset.ionTailColor;
    for (let i = 0; i < ionSegs; i++) {
      const u = i / (ionSegs - 1);
      // Distance along tail
      const tailPoint = new THREE.Vector3().copy(currentPos).addScaledVector(awayFromSun, u * ionLength);
      // Slight atmospheric wave shimmer
      const wave = Math.sin(u * 12 + this.progress * 40) * (u * 3.5);
      tailPoint.addScaledVector(ionSide, wave);

      // Width expands slightly
      const width = (3.5 + u * 16) * this.preset.sizeMultiplier;
      const left = new THREE.Vector3().copy(tailPoint).addScaledVector(ionSide, -width * 0.5);
      const right = new THREE.Vector3().copy(tailPoint).addScaledVector(ionSide, width * 0.5);

      const vIdx = i * 2;
      this.ionTailPositions[vIdx * 3] = left.x;
      this.ionTailPositions[vIdx * 3 + 1] = left.y;
      this.ionTailPositions[vIdx * 3 + 2] = left.z;

      this.ionTailPositions[(vIdx + 1) * 3] = right.x;
      this.ionTailPositions[(vIdx + 1) * 3 + 1] = right.y;
      this.ionTailPositions[(vIdx + 1) * 3 + 2] = right.z;

      // Color and Alpha: starts brilliant at head, decays exponentially along tail
      const alpha = Math.pow(1.0 - u, 1.8) * (0.35 + solarProximity * 0.65);
      this.ionTailColors[vIdx * 3] = ionCol.r * alpha;
      this.ionTailColors[vIdx * 3 + 1] = ionCol.g * alpha;
      this.ionTailColors[vIdx * 3 + 2] = ionCol.b * alpha;

      this.ionTailColors[(vIdx + 1) * 3] = ionCol.r * alpha;
      this.ionTailColors[(vIdx + 1) * 3 + 1] = ionCol.g * alpha;
      this.ionTailColors[(vIdx + 1) * 3 + 2] = ionCol.b * alpha;
    }
    this.ionTailGeometry.attributes.position.needsUpdate = true;
    this.ionTailGeometry.attributes.color.needsUpdate = true;

    // 2. UPDATE DUST TAIL RIBBON (Curved by inertia along orbital track)
    const dustLength = (110 + solarProximity * 140) * this.preset.sizeMultiplier;
    const dustSegs = this.dustTailSegments;
    // Dust tail vector blends solar repulsion with retrograde orbital motion
    const retrograde = new THREE.Vector3().copy(tangent).negate();
    const dustDir = new THREE.Vector3().lerpVectors(awayFromSun, retrograde, 0.42).normalize();
    const dustSide = new THREE.Vector3().crossVectors(dustDir, camDir).normalize();
    const dustCol = this.preset.dustTailColor;

    for (let i = 0; i < dustSegs; i++) {
      const u = i / (dustSegs - 1);
      const tailPoint = new THREE.Vector3().copy(currentPos).addScaledVector(dustDir, u * dustLength);
      // Fan out curvature
      const curveOffset = Math.pow(u, 1.5) * 14;
      tailPoint.addScaledVector(retrograde, curveOffset);

      const width = (5 + u * 28) * this.preset.sizeMultiplier;
      const left = new THREE.Vector3().copy(tailPoint).addScaledVector(dustSide, -width * 0.5);
      const right = new THREE.Vector3().copy(tailPoint).addScaledVector(dustSide, width * 0.5);

      const vIdx = i * 2;
      this.dustTailPositions[vIdx * 3] = left.x;
      this.dustTailPositions[vIdx * 3 + 1] = left.y;
      this.dustTailPositions[vIdx * 3 + 2] = left.z;

      this.dustTailPositions[(vIdx + 1) * 3] = right.x;
      this.dustTailPositions[(vIdx + 1) * 3 + 1] = right.y;
      this.dustTailPositions[(vIdx + 1) * 3 + 2] = right.z;

      const alpha = Math.pow(1.0 - u, 1.6) * (0.28 + solarProximity * 0.55);
      this.dustTailColors[vIdx * 3] = dustCol.r * alpha;
      this.dustTailColors[vIdx * 3 + 1] = dustCol.g * alpha;
      this.dustTailColors[vIdx * 3 + 2] = dustCol.b * alpha;

      this.dustTailColors[(vIdx + 1) * 3] = dustCol.r * alpha;
      this.dustTailColors[(vIdx + 1) * 3 + 1] = dustCol.g * alpha;
      this.dustTailColors[(vIdx + 1) * 3 + 2] = dustCol.b * alpha;
    }
    this.dustTailGeometry.attributes.position.needsUpdate = true;
    this.dustTailGeometry.attributes.color.needsUpdate = true;

    // 3. SPAWN & UPDATE TRAILING STARDUST EMBERS
    // Spawn 2 to 4 particles each frame near head
    const spawnCount = Math.floor(2 + solarProximity * 3);
    for (let s = 0; s < spawnCount; s++) {
      if (this.particles.length < this.maxParticles) {
        const vel = new THREE.Vector3()
          .copy(retrograde)
          .multiplyScalar(8 + Math.random() * 14)
          .add(awayFromSun.clone().multiplyScalar(4 + Math.random() * 10))
          .add(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6));

        this.particles.push({
          position: currentPos.clone().add(
            new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
          ),
          velocity: vel,
          color: Math.random() > 0.4 ? this.preset.dustTailColor : this.preset.ionTailColor,
          size: (3.0 + Math.random() * 4.5) * this.preset.sizeMultiplier,
          life: 0,
          maxLife: 1.8 + Math.random() * 2.2,
        });
      }
    }

    // Advance particles
    let activePCount = 0;
    for (let pIdx = this.particles.length - 1; pIdx >= 0; pIdx--) {
      const p = this.particles[pIdx];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.particles.splice(pIdx, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, delta);
      // Slight solar radiation push
      p.velocity.addScaledVector(awayFromSun, delta * 3.5);

      const lifeRatio = 1.0 - p.life / p.maxLife;
      const alpha = Math.sin(lifeRatio * Math.PI) * 0.85;

      this.particlePositionsArray[activePCount * 3] = p.position.x;
      this.particlePositionsArray[activePCount * 3 + 1] = p.position.y;
      this.particlePositionsArray[activePCount * 3 + 2] = p.position.z;

      this.particleColorsArray[activePCount * 3] = p.color.r * alpha;
      this.particleColorsArray[activePCount * 3 + 1] = p.color.g * alpha;
      this.particleColorsArray[activePCount * 3 + 2] = p.color.b * alpha;

      activePCount++;
    }

    // Zero out unused particle buffer slots
    for (let i = activePCount; i < this.maxParticles; i++) {
      this.particlePositionsArray[i * 3] = 0;
      this.particlePositionsArray[i * 3 + 1] = 0;
      this.particlePositionsArray[i * 3 + 2] = 0;
      this.particleColorsArray[i * 3] = 0;
      this.particleColorsArray[i * 3 + 1] = 0;
      this.particleColorsArray[i * 3 + 2] = 0;
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;
  }

  /**
   * Proper disposal of WebGL resources
   */
  public dispose() {
    this.scene.remove(this.group);
    this.scene.remove(this.ionTailMesh);
    this.scene.remove(this.dustTailMesh);
    this.scene.remove(this.particlePoints);

    this.nucleusMesh.geometry.dispose();
    (this.nucleusMesh.material as THREE.Material).dispose();

    (this.comaSprite.material as THREE.Material).dispose();
    (this.outerComaSprite.material as THREE.Material).dispose();

    this.ionTailGeometry.dispose();
    (this.ionTailMesh.material as THREE.Material).dispose();

    this.dustTailGeometry.dispose();
    (this.dustTailMesh.material as THREE.Material).dispose();

    this.particleGeometry.dispose();
    (this.particlePoints.material as THREE.Material).dispose();
  }
}

/**
 * Global Manager for passing comets in the 3D scene
 */
export class CometSystemManager {
  private scene: THREE.Scene;
  private activeComets: ActiveComet[] = [];
  private timeUntilNextSpawn: number;
  private maxConcurrentComets: number = 2;
  private onCometSpawnedCallback?: (event: CometEventData) => void;

  constructor(scene: THREE.Scene, onCometSpawned?: (event: CometEventData) => void) {
    this.scene = scene;
    this.onCometSpawnedCallback = onCometSpawned;
    // Initial spawn shortly after start (between 4 and 9 seconds)
    this.timeUntilNextSpawn = 5 + Math.random() * 4;
  }

  public setCallback(callback?: (event: CometEventData) => void) {
    this.onCometSpawnedCallback = callback;
  }

  /**
   * Manually trigger a comet or let the system spawn one
   */
  public spawnComet(presetId?: string): CometPreset {
    let preset: CometPreset;
    if (presetId) {
      preset = COMET_PRESETS.find((p) => p.id === presetId) || COMET_PRESETS[0];
    } else {
      preset = COMET_PRESETS[Math.floor(Math.random() * COMET_PRESETS.length)];
    }

    const comet = new ActiveComet(this.scene, preset);
    this.activeComets.push(comet);

    // Play cosmic whoosh / shimmer chime
    spaceAudio.playCometPass();

    // Notify UI listener
    if (this.onCometSpawnedCallback) {
      this.onCometSpawnedCallback({
        id: comet.id,
        nameAr: preset.nameAr,
        descriptionAr: preset.descriptionAr,
        color: `#${preset.comaColor.getHexString()}`,
        speedKmS: preset.speedKmS,
      });
    }

    return preset;
  }

  /**
   * Simulation loop tick
   */
  public update(delta: number, sunPos: THREE.Vector3, camera: THREE.Camera) {
    // 1. Advance timer for next periodic random spawn
    this.timeUntilNextSpawn -= delta;
    if (this.timeUntilNextSpawn <= 0) {
      if (this.activeComets.length < this.maxConcurrentComets) {
        this.spawnComet();
      }
      // Schedule next random comet in 10 to 22 seconds
      this.timeUntilNextSpawn = 11 + Math.random() * 11;
    }

    // 2. Update each active comet
    for (let i = this.activeComets.length - 1; i >= 0; i--) {
      const comet = this.activeComets[i];
      comet.update(delta, sunPos, camera);

      if (comet.isFinished) {
        comet.dispose();
        this.activeComets.splice(i, 1);
      }
    }
  }

  public getActiveCount(): number {
    return this.activeComets.length;
  }

  public dispose() {
    this.activeComets.forEach((c) => c.dispose());
    this.activeComets = [];
  }
}
