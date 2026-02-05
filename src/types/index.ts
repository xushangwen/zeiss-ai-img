// 任务状态
export type TaskStatus = 'pending' | 'generating' | 'reviewing' | 'completed';

// 人物信息（从参考图分析）
export interface PersonInfo {
  age: string;
  gender: string;
  appearance: string;
  skinTone: string;
  hairStyle: string;
  facialFeatures: string;
}

// 图片比例
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

// 任务分组
export type TaskPart =
  | 'pupil-distance'      // 瞳距偏差
  | 'fitting-height'      // 装配高度
  | 'vertex-distance'     // 镜眼距
  | 'pantoscopic-tilt'    // 倾斜角
  | 'face-form-angle';    // 镜面角

// 单个任务（简化版，不存储图片数据）
export interface Task {
  id: string;
  part: TaskPart;
  partName: string;
  title: string;
  description: string;
  status: TaskStatus;
}

// 生成的图片（临时数据，不持久化）
export interface GeneratedImage {
  id: string;
  url: string;           // base64
  prompt: string;
  aspectRatio?: AspectRatio;
  createdAt: number;
  taskId?: string;
}

// 图库中存储的图片元数据（图片数据在 IndexedDB）
export interface GalleryImageMeta {
  id: string;
  prompt: string;
  aspectRatio?: AspectRatio;
  createdAt: number;
  taskId?: string;
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: TaskPart | 'general';
  isDefault?: boolean;
}

// API 请求
export interface GenerateRequest {
  personDescription?: string;
  taskDescription: string;
  referenceImage?: string;
  aspectRatio?: AspectRatio;
  count: number;
}

// API 响应
export interface GenerateResponse {
  images: string[];
  prompt: string;
}

// 全局状态
export interface AppState {
  // 当前视图
  currentView: 'workspace' | 'gallery' | 'templates';

  // 任务相关（只存储基本信息，不存储图片）
  tasks: Task[];
  currentTaskId: string | null;

  // 模板相关
  templates: PromptTemplate[];

  // 图库（只存储元数据，图片数据在 IndexedDB）
  gallery: GalleryImageMeta[];

  // 工作区状态（临时数据，不持久化）
  referenceImage: string | null;
  personInfo: PersonInfo | null;
  currentPrompt: string;
  thumbnails: GeneratedImage[];
  selectedThumbnailId: string | null;
  isGenerating: boolean;
  isAnalyzing: boolean;
  aspectRatio: AspectRatio;

  // Actions
  setCurrentView: (view: AppState['currentView']) => void;
  setCurrentTask: (taskId: string | null) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setReferenceImage: (image: string | null) => void;
  setPersonInfo: (info: PersonInfo | null) => void;
  setCurrentPrompt: (prompt: string) => void;
  setThumbnails: (images: GeneratedImage[]) => void;
  selectThumbnail: (id: string | null) => void;
  setIsGenerating: (value: boolean) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  addToGallery: (image: GeneratedImage) => Promise<void>;
  removeFromGallery: (id: string) => Promise<void>;
  clearReferenceImage: () => void;
  saveTemplate: (template: PromptTemplate) => void;
  deleteTemplate: (id: string) => void;
  resetAllData: () => void;  // 重置所有数据
}
