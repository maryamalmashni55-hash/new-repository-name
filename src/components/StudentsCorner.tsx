import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Heart, 
  Sparkles, 
  Search, 
  Filter, 
  X, 
  Plus, 
  CheckCircle2, 
  Share2, 
  Eye, 
  Download,
  AlertCircle,
  Award,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { StudentProject, StudentAttachmentType, PlanetId } from '../types';
import { CELESTIAL_BODIES } from '../data/planetsData';
import { INITIAL_STUDENT_PROJECTS } from '../data/studentProjectsData';
import { spaceAudio } from '../utils/audioSynthesizer';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'solar_system_student_projects_v2';

interface StudentsCornerProps {
  onClose: () => void;
  onExplorePlanet?: (planetId: PlanetId) => void;
}

export const StudentsCorner: React.FC<StudentsCornerProps> = ({
  onClose,
  onExplorePlanet,
}) => {
  // State for all projects
  const [projects, setProjects] = useState<StudentProject[]>(() => {
    try {
      // Clear legacy storage containing sample mock data
      localStorage.removeItem('solar_system_student_projects_v1');
      localStorage.removeItem('cosmic_student_projects_v1');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out mock IDs if any remained
          return parsed.filter((p: StudentProject) => !p.id.startsWith('proj-'));
        }
      }
    } catch (e) {
      console.warn('Failed to load student projects from storage', e);
    }
    return INITIAL_STUDENT_PROJECTS;
  });

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [projects]);

  // Delete project
  const handleDeleteProject = (projectId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    spaceAudio.playClick();
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (previewProject?.id === projectId) {
      setPreviewProject(null);
    }
  };

  // View & Filtering
  const [activeTab, setActiveTab] = useState<'gallery' | 'wall'>('gallery'); // Gallery (cards) or Wall (pinboard style)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<StudentAttachmentType | 'all'>('all');
  const [filterPlanet, setFilterPlanet] = useState<string>('all');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState<StudentProject | null>(null);

  // Form states for adding a new project
  const [studentName, setStudentName] = useState('');
  const [gradeOrClass, setGradeOrClass] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [planetRelated, setPlanetRelated] = useState<PlanetId | 'general'>('general');
  const [attachmentType, setAttachmentType] = useState<StudentAttachmentType>('image');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track liked projects in this session
  const [likedProjectIds, setLikedProjectIds] = useState<Set<string>>(new Set());

  // Handle file selection (Images, PDF, Video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect type
    const mime = file.type;
    let detectedType: StudentAttachmentType = 'image';
    if (mime.startsWith('image/')) {
      detectedType = 'image';
    } else if (mime.startsWith('video/')) {
      detectedType = 'video';
    } else if (mime === 'application/pdf' || file.name.endsWith('.pdf')) {
      detectedType = 'pdf';
    } else {
      setFormError('يرجى اختيار ملف صالح: صورة (JPG, PNG, GIF, WEBP) أو فيديو (MP4, WEBM) أو مستند PDF.');
      return;
    }

    setAttachmentType(detectedType);
    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);
    setFormError('');

    // Warn if file is too large for localStorage (> 4MB for Base64)
    if (file.size > 8 * 1024 * 1024) {
      setFormError('حجم الملف كبير جداً (أقصى حد مستحسن هو 8 ميجابايت للمعاينة المباشرة).');
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setFormError('حدث خطأ أثناء قراءة الملف. يرجى تجربة ملف آخر.');
    };
    reader.readAsDataURL(file);
  };

  // Submit new project
  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setFormError('يرجى كتابة اسم الطالبة.');
      return;
    }
    if (!title.trim()) {
      setFormError('يرجى كتابة عنوان العمل.');
      return;
    }
    if (!description.trim()) {
      setFormError('يرجى كتابة نبذة توضيحية عن العمل.');
      return;
    }
    if (!fileDataUrl) {
      setFormError('يرجى إرفاق ملف للعمل (صورة أو فيديو أو PDF).');
      return;
    }

    setIsSubmitting(true);
    spaceAudio.playCorrect();

    const newProject: StudentProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentName: studentName.trim(),
      gradeOrClass: gradeOrClass.trim() || 'طالبة مبدعة',
      title: title.trim(),
      description: description.trim(),
      planetRelated,
      attachmentType,
      attachmentUrl: fileDataUrl,
      fileName: fileName || (attachmentType === 'image' ? 'artwork.png' : attachmentType === 'video' ? 'project.mp4' : 'document.pdf'),
      fileSize: fileSize || '1.0 MB',
      createdAt: Date.now(),
      likes: 1,
      featured: false,
    };

    setTimeout(() => {
      setProjects((prev) => [newProject, ...prev]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset after a brief animation
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSubmitSuccess(false);
        setStudentName('');
        setGradeOrClass('');
        setTitle('');
        setDescription('');
        setFileDataUrl('');
        setFileName('');
        setFileSize('');
        setFormError('');
      }, 1200);
    }, 400);
  };

  // Like project
  const handleToggleLike = (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    spaceAudio.playClick();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const isLiked = likedProjectIds.has(projectId);
          return {
            ...p,
            likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
          };
        }
        return p;
      })
    );
    setLikedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  // Filtered projects
  const filteredProjects = projects.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || item.attachmentType === filterType;
    const matchesPlanet =
      filterPlanet === 'all' || item.planetRelated === filterPlanet;

    return matchesSearch && matchesType && matchesPlanet;
  });

  const getPlanetName = (planetId?: PlanetId | 'general') => {
    if (!planetId || planetId === 'general') return 'موضوع عام / الفضاء';
    const found = CELESTIAL_BODIES.find((b) => b.id === planetId);
    return found ? found.nameAr : planetId;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-14 sm:pt-8 pb-16 select-none text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm mb-3">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>إبداعات وأبحاث الطالبات الفلكية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>معرض الفضاء</span>
            <span className="text-sm font-normal text-slate-400 hidden sm:inline">
              (مشاريع وأبحاث الطالبات)
            </span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            مساحة مخصصة لعرض إبداعات وأبحاث الطالبات في علوم الفضاء والنظام الشمسي. يمكنك تصفح الأعمال، رفع فيديو، ملف PDF، أو صورة ولوحة فنية مع تسجيل اسمك ونبذة عن عملك.
          </p>
        </div>

        {/* Action Button: Add Project */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="upload-student-work-btn"
            onClick={() => {
              spaceAudio.playClick();
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-medium text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عمل جديد للطالبة</span>
          </button>
        </div>
      </div>

      {/* Filter and View Switcher Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-slate-800/80 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحثي عن اسم الطالبة، موضوع البحث، أو العنوان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-950/80 border border-slate-750 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                spaceAudio.playClick();
                setFilterType('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({projects.length})
            </button>
            <button
              onClick={() => {
                spaceAudio.playClick();
                setFilterType('image');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'image'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>صور</span>
            </button>
            <button
              onClick={() => {
                spaceAudio.playClick();
                setFilterType('video');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'video'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>فيديو</span>
            </button>
            <button
              onClick={() => {
                spaceAudio.playClick();
                setFilterType('pdf');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'pdf'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>مستندات</span>
            </button>
          </div>

          {/* Planet Select Filter */}
          <select
            value={filterPlanet}
            onChange={(e) => setFilterPlanet(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">كل الكواكب والموضوعات</option>
            {CELESTIAL_BODIES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameAr}
              </option>
            ))}
          </select>

          {/* Layout Mode Switcher (المعرض vs لوحة الحائط التفاعلية) */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                spaceAudio.playClick();
                setActiveTab('gallery');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض المعرض المنظم"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>المعرض</span>
            </button>
            <button
              onClick={() => {
                spaceAudio.playClick();
                setActiveTab('wall');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'wall'
                  ? 'bg-slate-800 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="لوحة الإعلانات الفلكية التفاعلية"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>لوحة الإبداع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Gallery or Wall */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center mb-4 text-cyan-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {projects.length === 0 ? 'معرض الفضاء فارغ حالياً' : 'لا توجد أعمال مطابقة للبحث'}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
            {projects.length === 0
              ? 'تم تفريغ المعرض وهو جاهز الآن لاستقبال أعمال ومشاركات الطالبات. اضغطي على زر «إضافة عمل جديد للطالبة» لرفع أول فيديو أو صورة أو مستند.'
              : 'لم نجد أي مشروع يطابق المعايير المحددة. جربي تصفية مختلفة أو البحث باسم آخر.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterPlanet('all');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عمل جديد للطالبة</span>
          </button>
        </div>
      ) : activeTab === 'gallery' ? (
        /* 1. GALLERY VIEW (Grid of Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const isLiked = likedProjectIds.has(proj.id);
            return (
              <motion.div
                key={proj.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1"
              >
                {/* Media Thumbnail / Preview Area */}
                <div 
                  onClick={() => {
                    spaceAudio.playClick();
                    setPreviewProject(proj);
                  }}
                  className="relative w-full h-48 bg-slate-950 overflow-hidden cursor-pointer"
                >
                  {proj.attachmentType === 'image' && (
                    <img
                      src={proj.attachmentUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  {proj.attachmentType === 'video' && (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
                      <video
                        src={proj.attachmentUrl}
                        className="w-full h-full object-cover opacity-60"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <VideoIcon className="w-6 h-6 text-white mr-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  {proj.attachmentType === 'pdf' && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-2 text-amber-400 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7" />
                      </div>
                      <span className="text-xs text-amber-300 font-mono-num bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        مستند دراسي PDF
                      </span>
                    </div>
                  )}

                  {/* Badges on top */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-medium text-cyan-300">
                      {getPlanetName(proj.planetRelated)}
                    </span>
                    {proj.featured && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-bold shadow-md">
                        <Award className="w-3 h-3" />
                        <span>مميز</span>
                      </span>
                    )}
                  </div>

                  {/* Type badge on bottom right */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] text-slate-300 flex items-center gap-1 border border-slate-800">
                    {proj.attachmentType === 'image' && (
                      <>
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                        <span>صورة</span>
                      </>
                    )}
                    {proj.attachmentType === 'video' && (
                      <>
                        <VideoIcon className="w-3 h-3 text-emerald-400" />
                        <span>فيديو</span>
                      </>
                    )}
                    {proj.attachmentType === 'pdf' && (
                      <>
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>ملف PDF</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Student Info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {proj.studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide">
                            {proj.studentName}
                          </h4>
                          {proj.gradeOrClass && (
                            <span className="text-[11px] text-slate-400 block -mt-0.5">
                              {proj.gradeOrClass}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Like button */}
                      <button
                        onClick={(e) => handleToggleLike(proj.id, e)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-slate-700/60'
                        }`}
                        title="إعجاب بالعمل"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span className="font-mono-num">{proj.likes}</span>
                      </button>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setPreviewProject(proj)}
                      className="text-base font-bold text-white mb-2 leading-snug hover:text-cyan-300 transition-colors cursor-pointer line-clamp-2"
                    >
                      {proj.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500">
                      {new Date(proj.createdAt).toLocaleDateString('ar-SA')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="حذف العمل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          spaceAudio.playClick();
                          setPreviewProject(proj);
                        }}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                      >
                        <span>عرض العمل</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* 2. WALL VIEW (Interactive Pinboard / Bulletin Board) */
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 border border-slate-800 p-4 sm:p-8 overflow-hidden min-h-[500px]">
          {/* Subtle cosmic background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>لوحة الشرف والإبداع الفلكي</span>
              </h3>
              <p className="text-xs text-slate-400">
                بطاقات إبداعية منوعة تبرز مواهب الطالبات وإنجازاتهن في أبحاث الفضاء والكون.
              </p>
            </div>
            <span className="text-xs text-cyan-300 font-mono-num bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
              إجمالي الأعمال: {filteredProjects.length}
            </span>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filteredProjects.map((proj, idx) => {
              const isLiked = likedProjectIds.has(proj.id);
              // Slight aesthetic variations
              const pinColors = ['border-cyan-500/40', 'border-indigo-500/40', 'border-amber-500/40', 'border-rose-500/40', 'border-emerald-500/40'];
              const borderColor = pinColors[idx % pinColors.length];

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    spaceAudio.playClick();
                    setPreviewProject(proj);
                  }}
                  className={`break-inside-avoid relative rounded-2xl bg-slate-900/90 border ${borderColor} p-4 sm:p-5 backdrop-blur-md cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]`}
                >
                  {/* Decorative Pin header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold text-cyan-200">
                        {proj.studentName}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {getPlanetName(proj.planetRelated)}
                    </span>
                  </div>

                  {/* Thumbnail if Image */}
                  {proj.attachmentType === 'image' && (
                    <div className="mb-3 rounded-xl overflow-hidden max-h-48 border border-slate-800">
                      <img
                        src={proj.attachmentUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Video indication */}
                  {proj.attachmentType === 'video' && (
                    <div className="mb-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                        <VideoIcon className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="text-white font-medium">مقطع مرئي مرفق</p>
                        <p className="text-indigo-300 text-[10px]">{proj.fileName}</p>
                      </div>
                    </div>
                  )}

                  {/* PDF indication */}
                  {proj.attachmentType === 'pdf' && (
                    <div className="mb-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="text-white font-medium">مستند وبحث PDF</p>
                        <p className="text-amber-300 text-[10px]">{proj.fileName}</p>
                      </div>
                    </div>
                  )}

                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                    {proj.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    {proj.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>{proj.gradeOrClass || 'طالبة'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="حذف العمل"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleToggleLike(proj.id, e)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer ${
                          isLiked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500' : ''}`} />
                        <span>{proj.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. UPLOAD NEW PROJECT MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl my-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-8 text-right overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-xs mb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>إضافة عمل جديد للطالبة</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  شاركي إبداعك الفلكي في المعرض
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  أرفقي بحثك، رسمتك، أو الفيديو التوضيحي ليتم عرضه على لوحة الشرف أمام زميلاتك ومعلماتك.
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    بارك الله في جهودك يا مبدعة!
                  </h4>
                  <p className="text-slate-300 text-sm">
                    تمت إضافة عملك بنجاح إلى معرض الفضاء.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitProject} className="space-y-4">
                  {/* Error Notification */}
                  {formError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Student Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      اسم الطالبة <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: منيرة فيصل الأحمدي"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-750 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  {/* Grade / Class */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      الصف الدراسي / المسار (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الصف الثاني الثانوي - شعبة 3"
                      value={gradeOrClass}
                      onChange={(e) => setGradeOrClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-750 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  {/* Work Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      عنوان العمل أو البحث <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: استكشاف أسرار كوكب الزهرة والغلاف الجوي السام"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-750 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  {/* Planet / Subject Association */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      مرتبط بأي جرم سماوي؟
                    </label>
                    <select
                      value={planetRelated}
                      onChange={(e) => setPlanetRelated(e.target.value as PlanetId | 'general')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-750 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                    >
                      <option value="general">موضوع فلكي عام / الفضاء الخارجي</option>
                      {CELESTIAL_BODIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Work Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      نبذة وشرح موجز عن العمل <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="اكتبي ملخصاً لأهم الأفكار، النتائج العلمية، أو الفكرة الفنية للعمل..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-750 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                    />
                  </div>

                  {/* File Upload Zone (Supports: Image, Video, PDF) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      إرفاق الملف (صورة، فيديو، أو ملف PDF) <span className="text-cyan-400">*</span>
                    </label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*,application/pdf"
                      className="hidden"
                    />

                    {fileDataUrl ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center shrink-0 text-cyan-400 border border-cyan-800">
                            {attachmentType === 'image' && <ImageIcon className="w-5 h-5" />}
                            {attachmentType === 'video' && <VideoIcon className="w-5 h-5" />}
                            {attachmentType === 'pdf' && <FileText className="w-5 h-5" />}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{fileName || 'ملف مرفق'}</p>
                            <p className="text-[11px] text-slate-400">
                              {attachmentType === 'image' ? 'صورة' : attachmentType === 'video' ? 'مقطع فيديو' : 'مستند PDF'} • {fileSize}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFileDataUrl('');
                            setFileName('');
                            setFileSize('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="حذف الملف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group p-6 rounded-2xl border-2 border-dashed border-slate-750 hover:border-cyan-500/70 bg-slate-950/60 hover:bg-slate-950 cursor-pointer flex flex-col items-center justify-center text-center transition-all"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-200">
                          انقري هنا لاختيار ملف من جهازك
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          يدعم الصور (JPG, PNG, WebP)، الفيديوهات (MP4)، ومستندات (PDF)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'جارٍ النشر...' : 'نشر العمل في الركن'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. PREVIEW MODAL (Detailed Inspection with Download/Share) */}
      <AnimatePresence>
        {previewProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] my-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-right"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {previewProject.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {previewProject.studentName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {previewProject.gradeOrClass || 'طالبة مبدعة'} • {getPlanetName(previewProject.planetRelated)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteProject(previewProject.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer"
                    title="حذف هذا العمل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف العمل</span>
                  </button>

                  <button
                    onClick={() => handleToggleLike(previewProject.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      likedProjectIds.has(previewProject.id)
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedProjectIds.has(previewProject.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{previewProject.likes}</span>
                  </button>

                  <button
                    onClick={() => setPreviewProject(null)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Media Renderer */}
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[500px]">
                  {previewProject.attachmentType === 'image' && (
                    <img
                      src={previewProject.attachmentUrl}
                      alt={previewProject.title}
                      className="max-h-[480px] w-auto max-w-full object-contain mx-auto"
                    />
                  )}

                  {previewProject.attachmentType === 'video' && (
                    <video
                      src={previewProject.attachmentUrl}
                      controls
                      autoPlay
                      className="max-h-[480px] w-full"
                    />
                  )}

                  {previewProject.attachmentType === 'pdf' && (
                    <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-400">
                        <FileText className="w-10 h-10" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {previewProject.fileName || 'ملف البحث بصيغة PDF'}
                      </h4>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6">
                        يمكنك الاطلاع على مستند البحث والتقرير العلمي المرفق من قبل الطالبة أو تحميله.
                      </p>
                      <a
                        href={previewProject.attachmentUrl}
                        download={previewProject.fileName || 'research.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>فتح / تحميل ملف PDF ({previewProject.fileSize || 'PDF'})</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {previewProject.title}
                  </h2>
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4">
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {previewProject.description}
                    </p>
                  </div>
                </div>

                {/* Exploration prompt if linked to a planet */}
                {previewProject.planetRelated && previewProject.planetRelated !== 'general' && onExplorePlanet && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs sm:text-sm text-cyan-200">
                        هذا العمل مخصص لكوكب <strong>{getPlanetName(previewProject.planetRelated)}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onExplorePlanet(previewProject.planetRelated as PlanetId);
                        setPreviewProject(null);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all cursor-pointer"
                    >
                      <span>الانتقال للكوكب في الفضاء</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
