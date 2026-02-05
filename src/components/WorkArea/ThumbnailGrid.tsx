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
  } = useStore();

  const { generateImages, isLoading, error } = useGemini();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 获取当前任务描述
  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const taskDescription = currentTask?.description || '';

  const handleGenerate = async () => {
    if (!taskDescription) {
      alert('请先选择一个任务');
      return;
    }

    setIsGenerating(true);
    if (currentTaskId) {
      updateTaskStatus(currentTaskId, 'generating');
    }

    try {
      const images = await generateImages(
        taskDescription,
        personInfo,
        referenceImage || undefined,
        aspectRatio,
        2  // 生成2张
      );
      setThumbnails(images);
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
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-image-line text-accent"></i>
          图片生成
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading || !currentTaskId}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              生成中...
            </>
          ) : (
            <>
              <i className="ri-magic-line"></i>
              生成 2 张
            </>
          )}
        </button>
      </div>

      {/* 比例选择 */}
      <div className="mb-3">
        <div className="flex gap-2 flex-wrap">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => setAspectRatio(ratio.value)}
              className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                aspectRatio === ratio.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-primary text-text-secondary hover:text-text-primary'
              }`}
            >
              <i className={ratio.icon}></i>
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* 当前任务描述预览 */}
      {currentTask && (
        <div className="mb-3 p-2 bg-bg-primary rounded-lg text-xs text-text-secondary">
          <span className="text-text-primary font-medium">{currentTask.title}：</span>
          {taskDescription.slice(0, 80)}...
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      {/* 图片网格 */}
      <div className="grid grid-cols-2 gap-3">
        {thumbnails.length > 0 ? (
          thumbnails.map((img, index) => (
            <div
              key={img.id}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                selectedThumbnailId === img.id
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-transparent hover:border-accent/50'
              }`}
            >
              <button
                onClick={() => selectThumbnail(img.id)}
                className="w-full aspect-square"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
              {selectedThumbnailId === img.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-sm"></i>
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setPreviewImage(img.url)}
                  className="flex-1 py-1.5 bg-bg-primary/90 text-text-primary text-xs rounded flex items-center justify-center gap-1 hover:bg-bg-primary"
                >
                  <i className="ri-zoom-in-line"></i>
                </button>
                <button
                  onClick={() => handleDownload(img.url, index)}
                  className="flex-1 py-1.5 bg-accent/90 text-white text-xs rounded flex items-center justify-center gap-1 hover:bg-accent"
                >
                  <i className="ri-download-line"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 h-48 flex flex-col items-center justify-center text-text-secondary">
            <i className="ri-image-add-line text-4xl mb-2"></i>
            <span className="text-sm">
              {currentTaskId ? '点击生成按钮' : '请先选择任务'}
            </span>
          </div>
        )}
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-bg-primary/80 rounded-full flex items-center justify-center text-text-primary hover:bg-bg-primary"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
