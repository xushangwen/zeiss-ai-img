import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';
import { zeissTasks, defaultTemplates } from '../data/zeissRequirements';

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
      currentPrompt: '',
      thumbnails: [],
      selectedThumbnailId: null,
      isGenerating: false,

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

      setCurrentPrompt: (prompt) => {
        set({ currentPrompt: prompt });
        // 同步更新当前任务的 prompt
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
        // 同步更新当前任务的 thumbnails
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

      addToGallery: (image) =>
        set((state) => ({
          gallery: [image, ...state.gallery],
        })),

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
        gallery: state.gallery,
      }),
    }
  )
);
