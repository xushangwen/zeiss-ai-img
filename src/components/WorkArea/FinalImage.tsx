import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { useGemini } from '../../hooks/useGemini';
import type { GeneratedImage } from '../../types';

export function FinalImage() {
  const {
    selectedThumbnailId,
    thumbnails,
    currentPrompt,
    referenceImage,
    addToGallery,
    updateTaskStatus,
    currentTaskId,
    tasks,
  } = useStore();

  const { generateFinal, isLoading, error } = useGemini();
  const [finalImage, setFinalImage] = useState<GeneratedImage | null>(null);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);

  const selectedThumbnail = thumbnails.find((t) => t.id === selectedThumbnailId);
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  const handleGenerateFinal = async () => {
    if (!selectedThumbnail) {
      alert('请先选择一张小图');
      return;
    }

    setIsGeneratingFinal(true);

    try {
      // 使用选中小图的 prompt 生成大图
      const image = await generateFinal(
        selectedThumbnail.prompt || currentPrompt,
        referenceImage || undefined
      );
      image.taskId = currentTaskId || undefined;
      setFinalImage(image);
      addToGallery(image);

      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'completed');
      }
    } catch {
      // 错误已在 hook 中处理
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  const handleDownload = () => {
    if (!finalImage) return;

    const link = document.createElement('a');
    link.href = finalImage.url;
    link.download = `zeiss-${currentTask?.title || 'image'}-${Date.now()}.png`;
    link.click();
  };

  const loading = isGeneratingFinal || isLoading;

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-image-2-line text-accent"></i>
          大图生成
        </h3>
        <div className="flex items-center gap-2">
          {finalImage && (
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-success hover:bg-success/80 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="ri-download-line"></i>
              下载
            </button>
          )}
          <button
            onClick={handleGenerateFinal}
            disabled={loading || !selectedThumbnailId}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                生成中...
              </>
            ) : (
              <>
                <i className="ri-zoom-in-line"></i>
                生成大图
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      {/* 大图展示区 */}
      <div className="aspect-video bg-bg-primary rounded-lg overflow-hidden flex items-center justify-center">
        {finalImage ? (
          <img
            src={finalImage.url}
            alt="生成的大图"
            className="w-full h-full object-contain"
          />
        ) : selectedThumbnail ? (
          <div className="text-center text-text-secondary">
            <img
              src={selectedThumbnail.url}
              alt="选中的小图"
              className="w-32 h-32 object-cover rounded-lg mx-auto mb-3 opacity-50"
            />
            <p className="text-sm">已选择小图，点击"生成大图"</p>
          </div>
        ) : (
          <div className="text-center text-text-secondary">
            <i className="ri-image-2-line text-5xl mb-2"></i>
            <p className="text-sm">请先在左侧选择一张满意的小图</p>
          </div>
        )}
      </div>

      {finalImage && (
        <div className="mt-3 text-xs text-text-secondary">
          <span className="text-success">
            <i className="ri-check-circle-line mr-1"></i>
            生成完成
          </span>
          <span className="mx-2">|</span>
          <span>尺寸: 1024x1024</span>
          <span className="mx-2">|</span>
          <span>已保存到图库</span>
        </div>
      )}
    </div>
  );
}
