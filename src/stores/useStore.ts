import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, GeneratedImage, GalleryImageMeta } from '../types';
import { zeissTasks, defaultTemplates } from '../data/zeissRequirements';
import { saveImage, deleteImage } from '../utils/imageStorage';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentView: 'workspace',
      tasks: zeissTasks,
      currentTaskId: null,
      templates: defaultTemplates,
      gallery: [],
      referenceImage: null,
      personInfo: null,
      currentPrompt: '',
      thumbnails: [],
      selectedThumbnailId: null,
      isGenerating: false,
      isAnalyzing: false,
      aspectRatio: '1:1',

      // Actions
      setCurrentView: (view) => set({ currentView: view }),

      setCurrentTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set({
          currentTaskId: taskId,
          currentPrompt: task?.prompt || '',
          thumbnails: task?.thumbnails || [],
          selectedThumbnailId: null,
        });
      },

      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
        })),

      setReferenceImage: (image) => set({ referenceImage: image }),

      setPersonInfo: (info) => set({ personInfo: info }),

      // 清除参考图和人物信息
      clearReferenceImage: () =>
        set({ referenceImage: null, personInfo: null }),

      setCurrentPrompt: (prompt) => {
        set({ currentPrompt: prompt });
        const { currentTaskId, tasks } = get();
        if (currentTaskId) {
          set({
            tasks: tasks.map((t) =>
              t.id === currentTaskId ? { ...t, prompt } : t
            ),
          });
        }
      },

      setThumbnails: (images) => {
        set({ thumbnails: images });
        const { currentTaskId, tasks } = get();
        if (currentTaskId) {
          set({
            tasks: tasks.map((t) =>
              t.id === currentTaskId ? { ...t, thumbnails: images } : t
            ),
          });
        }
      },

      selectThumbnail: (id) => set({ selectedThumbnailId: id }),

      setIsGenerating: (value) => set({ isGenerating: value }),

      setIsAnalyzing: (value) => set({ isAnalyzing: value }),

      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

      // 保存到图库（图片数据存 IndexedDB，元数据存 store）
      addToGallery: async (image: GeneratedImage) => {
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
      },

      // 从图库删除
      removeFromGallery: async (id: string) => {
        await deleteImage(id);
        set((state) => ({
          gallery: state.gallery.filter((img) => img.id !== id),
        }));
      },

      saveTemplate: (template) =>
        set((state) => {
          const exists = state.templates.find((t) => t.id === template.id);
          if (exists) {
            return {
              templates: state.templates.map((t) =>
                t.id === template.id ? template : t
              ),
            };
          }
          return { templates: [...state.templates, template] };
        }),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'zeiss-ai-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        templates: state.templates,
        gallery: state.gallery, // 现在只存元数据，不会超出 localStorage 限制
        aspectRatio: state.aspectRatio,
      }),
    }
  )
);
