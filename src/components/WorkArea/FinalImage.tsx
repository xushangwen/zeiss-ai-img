import { useState } from 'react';
import { useStore } from '../../stores/useStore';

// 比例对应的尺寸显示
const ASPECT_RATIO_SIZES: Record<string, string> = {
  '1:1': '1024×1024',
  '16:9': '1344×768',
  '9:16': '768×1344',
  '4:3': '1152×896',
  '3:4': '896×1152',
};

export function FinalImage() {
  const {
    selectedThumbnailId,
    thumbnails,
    addToGallery,
    updateTaskStatus,
    currentTaskId,
    tasks,
    aspectRatio,
  } = useStore();

  const [isSaving, setIsSaving] = useState(false);

  const selectedImage = thumbnails.find((t) => t.id === selectedThumbnailId);
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  const handleDownload = () => {
    if (!selectedImage) return;

    const link = document.createElement('a');
    link.href = selectedImage.url;
    link.download = `zeiss-${currentTask?.title || 'image'}-${Date.now()}.png`;
    link.click();
  };

  const handleSaveToGallery = async () => {
    if (!selectedImage || isSaving) return;

    setIsSaving(true);
    try {
      const imageWithTask = {
        ...selectedImage,
        taskId: currentTaskId || undefined,
      };
      await addToGallery(imageWithTask);

      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'completed');
      }

      alert('已保存到图库');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-image-2-line text-accent"></i>
          选中图片
        </h3>
        {selectedImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToGallery}
              disabled={isSaving}
              className="px-3 py-1.5 bg-success hover:bg-success/80 disabled:opacity-50 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  保存中...
                </>
              ) : (
                <>
                  <i className="ri-save-line"></i>
                  保存到图库
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="ri-download-line"></i>
              下载
            </button>
          </div>
        )}
      </div>

      {/* 图片展示区 */}
      <div className="aspect-video bg-bg-primary rounded-lg overflow-hidden flex items-center justify-center">
        {selectedImage ? (
          <img
            src={selectedImage.url}
            alt="选中的图片"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center text-text-secondary">
            <i className="ri-image-2-line text-5xl mb-2"></i>
            <p className="text-sm">请在左侧点击选择一张图片</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="mt-3 text-xs text-text-secondary">
          <span>尺寸: {ASPECT_RATIO_SIZES[aspectRatio] || '1024×1024'}</span>
          <span className="mx-2">|</span>
          <span>比例: {aspectRatio}</span>
        </div>
      )}
    </div>
  );
}