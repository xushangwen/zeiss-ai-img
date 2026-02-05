// 任务状态
export type TaskStatus = 'pending' | 'generating' | 'reviewing' | 'completed';

// 任务分组
export type TaskPart =
  | 'pupil-distance'      // 瞳距偏差
  | 'fitting-height'      // 装配高度
  | 'vertex-distance'     // 镜眼距
  | 'pantoscopic-tilt'    // 倾斜角
  | 'face-form-angle';    // 镜面角

// 单个任务
export interface Task {
  id: string;
  part: TaskPart;
  partName: string;
  title: string;
  description: string;
  status: TaskStatus;
  thumbnails: GeneratedImage[];
  finalImage?: GeneratedImage;
  prompt?: string;
  referenceImage?: string;
}

// 生成的图片
export interface GeneratedImage {
  id: string;
  url: string;           // base64 或 URL
  prompt: string;
  size: 'small' | 'large';
  createdAt: number;
  taskId?: string;
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];   // 可替换变量列表
  category: TaskPart | 'general';
  isDefault?: boolean;
}

// API 请求
export interface GenerateRequest {
  prompt: string;
  referenceImage?: string;  // base64
  size: 'small' | 'large';
  count: number;
}

// API 响应
export interface GenerateResponse {
  images: string[];      // base64 数组
  prompt: string;
}

// 全局状态
export interface AppState {
  // 当前视图
  currentView: 'workspace' | 'gallery' | 'templates';

  // 任务相关
  tasks: Task[];
  currentTaskId: string | null;

  // 模板相关
  templates: PromptTemplate[];

  // 图库
  gallery: GeneratedImage[];

  // 工作区状态
  referenceImage: string | null;
  currentPrompt: string;
  thumbnails: GeneratedImage[];
  selectedThumbnailId: string | null;
  isGenerating: boolean;

  // Actions
  setCurrentView: (view: AppState['currentView']) => void;
  setCurrentTask: (taskId: string | null) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setReferenceImage: (image: string | null) => void;
  setCurrentPrompt: (prompt: string) => void;
  setThumbnails: (images: GeneratedImage[]) => void;
  selectThumbnail: (id: string | null) => void;
  setIsGenerating: (value: boolean) => void;
  addToGallery: (image: GeneratedImage) => void;
  saveTemplate: (template: PromptTemplate) => void;
  deleteTemplate: (id: string) => void;
}
