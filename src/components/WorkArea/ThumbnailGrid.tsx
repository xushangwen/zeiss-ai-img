import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { useGemini } from '../../hooks/useGemini';
import type { AspectRatio } from '../../types';

// 比例选项
const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '1:1', label: '1:1', icon: 'ri-checkbox-blank-line' },
  { value: '16:9', label: '16:9', icon: 'ri-landscape-line' },
  { value: '9:16', label: '9:16', icon: 'ri-smartphone-line' },
  { value: '4:3', label: '4:3', icon: 'ri-tablet-line' },
  { value: '3:4', label: '3:4', icon: 'ri-file-line' },
];

export function ThumbnailGrid() {
  const {
    thumbnails,
    selectedThumbnailId,
    selectThumbnail,
    setThumbnails,
    referenceImage,
    personInfo,
    isGenerating,
    setIsGenerating,
    updateTaskStatus,
    currentTaskId,
    tasks,
    aspectRatio,
    setAspectRatio,
    useCustomPrompt,
    finalPrompt,
    addToast,
  } = useStore();

  const { generateImages, generateWithCustomPrompt, isLoading, error } = useGemini();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const taskDescription = currentTask?.description || '';

  const handleGenerate = async () => {
    if (!currentTaskId && !useCustomPrompt) {
      addToast('请先选择一个任务或使用自定义提示词', 'warning');
      return;
    }

    if (useCustomPrompt && !finalPrompt.trim()) {
      addToast('提示词不能为空', 'warning');
      return;
    }

    setIsGenerating(true);
    if (currentTaskId) {
      updateTaskStatus(currentTaskId, 'generating');
    }

    try {
      let images;

      if (useCustomPrompt) {
        images = await generateWithCustomPrompt(
          finalPrompt,
          referenceImage || undefined,
          aspectRatio,
          1
        );
      } else {
        images = await generateImages(
          taskDescription,
          personInfo,
          referenceImage || undefined,
          aspectRatio,
          1
        );
      }

      setThumbnails([...thumbnails, ...images]);
      selectThumbnail(null);
      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'reviewing');
      }
    } catch {
      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'pending');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `zeiss-${currentTask?.title || 'image'}-${index + 1}-${Date.now()}.png`;
    link.click();
  };

  const loading = isGenerating || isLoading;

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <i className="ri-image-line text-accent text-xs"></i>
          </div>
          图片生成
        </h3>
        <div className="flex gap-1.5">
          {thumbnails.length > 0 && (
            <button
              onClick={() => setThumbnails([])}
              disabled={loading}
              className="px-3 py-1.5 bg-bg-primary hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200 border border-transparent hover:border-border-light"
            >
              <i className="ri-delete-bin-line text-[12px]"></i>
              清空
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading || (!currentTaskId && !useCustomPrompt)}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs rounded-btn flex items-center gap-2 transition-all duration-200 shadow-glow hover:shadow-glow-strong"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm"></i>
                生成中...
              </>
            ) : (
              <>
                <i className="ri-magic-line text-sm"></i>
                {useCustomPrompt ? '用模板生图' : '生成图片'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 比例选择 */}
      <div className="mb-3">
        <div className="flex gap-1.5 flex-wrap">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => setAspectRatio(ratio.value)}
              className={`px-3 py-1.5 text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200 ${
                aspectRatio === ratio.value
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-bg-primary text-text-tertiary hover:text-text-secondary border border-transparent hover:border-border-light'
              }`}
            >
              <i className={`${ratio.icon} text-[12px]`}></i>
              <span className="font-mono">{ratio.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 当前任务描述预览 */}
      {currentTask && !useCustomPrompt && (
        <div className="mb-3 p-2.5 bg-bg-primary rounded-xl text-xs text-text-secondary border border-border">
          <span className="text-text-primary font-medium">{currentTask.title}：</span>
          {taskDescription.slice(0, 80)}...
        </div>
      )}

      {/* 自定义提示词模式提示 */}
      {useCustomPrompt && (
        <div className="mb-3 p-2.5 bg-accent/5 border border-accent/20 rounded-xl text-xs text-accent flex items-center gap-2">
          <i className="ri-magic-line"></i>
          <span>使用自定义提示词模式，参考图仅作为图片参考</span>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2.5 bg-error/5 border border-error/20 rounded-xl text-sm text-error">
          {error}
        </div>
      )}

      {/* 图片网格 */}
      <div className="grid grid-cols-3 gap-2">
        {thumbnails.length > 0 ? (
          thumbnails.map((img, index) => (
            <div
              key={img.id}
              className={`relative group rounded-xl overflow-hidden border transition-all duration-200 ${
                selectedThumbnailId === img.id
                  ? 'border-accent/50 shadow-glow'
                  : 'border-border hover:border-border-light'
              }`}
            >
              <button
                onClick={() => selectThumbnail(img.id)}
                className="w-full"
              >
                <img src={img.url} alt="" className="block w-full object-cover aspect-square" />
              </button>
              {selectedThumbnailId === img.id && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-accent rounded-md flex items-center justify-center shadow-glow">
                  <i className="ri-check-line text-white text-[10px]"></i>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-bg-primary/90 to-transparent flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <button
                  onClick={() => setPreviewImage(img.url)}
                  className="flex-1 py-1 glass text-text-primary text-xs rounded-md flex items-center justify-center hover:bg-bg-elevated/80"
                >
                  <i className="ri-zoom-in-line text-[12px]"></i>
                </button>
                <button
                  onClick={() => handleDownload(img.url, index)}
                  className="flex-1 py-1 bg-accent/80 text-white text-xs rounded-md flex items-center justify-center hover:bg-accent"
                >
                  <i className="ri-download-line text-[12px]"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 h-32 flex flex-col items-center justify-center text-text-tertiary">
            <div className="w-12 h-12 rounded-xl bg-bg-primary flex items-center justify-center mb-3">
              <i className="ri-image-add-line text-xl"></i>
            </div>
            <span className="text-xs">
              {useCustomPrompt
                ? '点击生成按钮使用自定义提示词生图'
                : currentTaskId
                ? '点击生成按钮'
                : '请先选择任务'}
            </span>
          </div>
        )}
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-scale-in">
            <img
              src={previewImage}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 glass rounded-xl flex items-center justify-center text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}