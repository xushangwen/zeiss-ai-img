import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, GeneratedImage, GalleryImageMeta } from '../types';
import { zeissTasks, defaultTemplates } from '../data/zeissRequirements';
import { saveImage, deleteImage, initImageDB } from '../utils/imageStorage';

// 初始化 IndexedDB
initImageDB().catch(console.error);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 当前视图
      currentView: 'workspace',

      // 任务（使用默认数据，但状态会持久化）
      tasks: zeissTasks,
      currentTaskId: null,
      taskStates: {},  // 持久化的任务状态

      // 模板（使用默认数据）
      templates: defaultTemplates,

      // 图库（只存储元数据）
      gallery: [],

      // 工作区状态（临时数据，不持久化）
      referenceImage: null,
      personInfo: null,
      currentPrompt: '',
      finalPrompt: '',
      useCustomPrompt: false,
      selectedTemplateId: null,
      thumbnails: [],
      selectedThumbnailId: null,
      isGenerating: false,
      isAnalyzing: false,
      aspectRatio: '1:1',

      // Toast 通知
      toasts: [],

      // === Actions ===

      setCurrentView: (view) => set({ currentView: view }),

      setCurrentTask: (taskId) => {
        set({
          currentTaskId: taskId,
          // 切换任务时清空当前生成的图片
          thumbnails: [],
          selectedThumbnailId: null,
        });
      },

      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
          taskStates: { ...state.taskStates, [taskId]: status },
        })),

      setReferenceImage: (image) => set({ referenceImage: image }),

      setPersonInfo: (info) => set({ personInfo: info }),

      clearReferenceImage: () =>
        set({ referenceImage: null, personInfo: null }),

      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

      setFinalPrompt: (prompt) => set({ finalPrompt: prompt }),

      setUseCustomPrompt: (value) => set({ useCustomPrompt: value }),

      setSelectedTemplate: (id) => set({ selectedTemplateId: id }),

      // 设置生成的图片（只在内存中，不持久化）
      setThumbnails: (images) => set({ thumbnails: images }),

      selectThumbnail: (id) => set({ selectedThumbnailId: id }),

      setIsGenerating: (value) => set({ isGenerating: value }),

      setIsAnalyzing: (value) => set({ isAnalyzing: value }),

      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

      // 保存到图库（图片数据存 IndexedDB，元数据存 store）
      addToGallery: async (image: GeneratedImage) => {
        try {
          // 保存图片数据到 IndexedDB
          await saveImage(image.id, image.url);

          // 只在 store 中保存元数据
          const meta: GalleryImageMeta = {
            id: image.id,
            prompt: image.prompt,
            aspectRatio: image.aspectRatio,
            createdAt: image.createdAt,
            taskId: image.taskId,
          };

          set((state) => ({
            gallery: [meta, ...state.gallery],
          }));
        } catch (error) {
          console.error('保存到图库失败:', error);
          throw error;
        }
      },

      // 从图库删除
      removeFromGallery: async (id: string) => {
        try {
          await deleteImage(id);
          set((state) => ({
            gallery: state.gallery.filter((img) => img.id !== id),
          }));
        } catch (error) {
          console.error('删除图片失败:', error);
        }
      },

      saveTemplate: (template) =>
        set((state) => {
          const newTemplate = {
            ...template,
            id: `template-${Date.now()}`,
          };
          return { templates: [...state.templates, newTemplate] };
        }),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      // 重置所有数据（清除 localStorage 和 IndexedDB）
      resetAllData: () => {
        // 清除 localStorage
        localStorage.removeItem('zeiss-ai-storage');

        // 清除 IndexedDB
        indexedDB.deleteDatabase('zeiss-ai-images');

        // 重置状态
        set({
          currentView: 'workspace',
          tasks: zeissTasks,
          currentTaskId: null,
          taskStates: {},
          templates: defaultTemplates,
          gallery: [],
          referenceImage: null,
          personInfo: null,
          currentPrompt: '',
          finalPrompt: '',
          useCustomPrompt: false,
          selectedTemplateId: null,
          thumbnails: [],
          selectedThumbnailId: null,
          isGenerating: false,
          isAnalyzing: false,
          aspectRatio: '1:1',
          toasts: [],
        });

        // 刷新页面以确保完全重置
        window.location.reload();
      },

      // Toast 通知方法
      addToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { id, type, message, duration }],
        }));
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },
    }),
    {
      name: 'zeiss-ai-storage',
      // 只持久化必要的小量数据
      partialize: (state) => ({
        gallery: state.gallery,
        aspectRatio: state.aspectRatio,
        taskStates: state.taskStates,  // 持久化任务状态
        templates: state.templates,  // 持久化模板
      }),
      // 从持久化数据恢复后，合并任务状态
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 将持久化的状态应用到任务上
          state.tasks = state.tasks.map((task) => ({
            ...task,
            status: state.taskStates[task.id] || task.status,
          }));
        }
      },
    }
  )
);
