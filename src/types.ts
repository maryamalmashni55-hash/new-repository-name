export type PlanetId = 
  | 'sun' 
  | 'mercury' 
  | 'venus' 
  | 'earth' 
  | 'mars' 
  | 'jupiter' 
  | 'saturn' 
  | 'uranus' 
  | 'neptune';

export interface PlanetLayer {
  id: string;
  nameAr: string;
  nameEn: string;
  depthOrThickness: string;
  temperature: string;
  composition: string;
  descriptionAr: string;
  color: string;
}

export interface QuizQuestion {
  id: string;
  planetId?: PlanetId;
  planetNameAr?: string;
  questionAr: string;
  optionsAr: string[];
  correctIndex: number;
  explanationAr: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CelestialBody {
  id: PlanetId;
  nameAr: string;
  nameEn: string;
  symbol: string;
  typeAr: string;
  shortInfoAr: string;
  distanceSun: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  moonsCount: number;
  avgTemp: string;
  funFacts: [string, string, string];
  diameterKm: string;
  gravity: string;
  color: string;
  atmosphere?: string;
  sonicSignatureAr?: string;
  internalLayers: PlanetLayer[];
  quizQuestions?: QuizQuestion[];
  // 3D parameters
  size: number;
  orbitRadius: number;
  orbitSpeed: number; // relative angular speed
  rotationSpeed: number; // axial spin
  tilt: number; // axial tilt in radians
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: string;
}

export type ViewMode = 'system' | 'explore_deck' | 'quiz' | 'students_corner';

export type StudentAttachmentType = 'image' | 'video' | 'pdf';

export interface StudentProject {
  id: string;
  studentName: string;
  title: string;
  description: string;
  planetRelated?: PlanetId | 'general';
  attachmentType: StudentAttachmentType;
  attachmentUrl: string; // Base64 data URL or external URL/Blob URL
  fileName?: string;
  fileSize?: string;
  createdAt: number;
  gradeOrClass?: string;
  likes: number;
  featured?: boolean;
}
