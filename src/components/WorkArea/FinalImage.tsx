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
    addToast,
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

      addToast('已保存到图库', 'success');
    } catch (error) {
      console.error('保存失败:', error);
      addToast('保存失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <i className="ri-image-2-line text-accent text-xs"></i>
          </div>
          选中图片
        </h3>
        {selectedImage && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveToGallery}
              disabled={isSaving}
              className="px-3 py-1.5 bg-success/15 hover:bg-success/25 disabled:opacity-40 text-success text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-[12px]"></i>
                  保存中...
                </>
              ) : (
                <>
                  <i className="ri-save-line text-[12px]"></i>
                  保存到图库
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200"
            >
              <i className="ri-download-line text-[12px]"></i>
              下载
            </button>
          </div>
        )}
      </div>

      {/* 图片展示区 */}
      <div className="aspect-video bg-bg-primary rounded-xl overflow-hidden flex items-center justify-center border border-border">
        {selectedImage ? (
          <img
            src={selectedImage.url}
            alt="选中的图片"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center text-text-tertiary">
            <div className="w-14 h-14 rounded-xl bg-bg-elevated flex items-center justify-center mx-auto mb-3">
              <i className="ri-image-2-line text-2xl"></i>
            </div>
            <p className="text-xs">请在左侧点击选择一张图片</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="mt-3 flex items-center gap-3 text-[12px] text-text-tertiary font-mono">
          <span className="px-2 py-0.5 bg-bg-primary rounded-md">
            {ASPECT_RATIO_SIZES[aspectRatio] || '1024×1024'}
          </span>
          <span className="px-2 py-0.5 bg-bg-primary rounded-md">
            {aspectRatio}
          </span>
        </div>
      )}
    </div>
  );
}