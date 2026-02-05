import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import type { GeneratedImage } from '../../types';

export function Gallery() {
  const { gallery, tasks } = useStore();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // 获取任务名称
  const getTaskName = (taskId?: string) => {
    if (!taskId) return '未关联任务';
    const task = tasks.find((t) => t.id === taskId);
    return task ? `${task.partName} - ${task.title}` : '未知任务';
  };

  // 筛选图片
  const filteredGallery =
    filter === 'all'
      ? gallery
      : gallery.filter((img) => img.taskId === filter);

  // 下载图片
  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `zeiss-${image.id}.png`;
    link.click();
  };

  // 批量下载
  const handleBatchDownload = () => {
    filteredGallery.forEach((img, index) => {
      setTimeout(() => handleDownload(img), index * 200);
    });
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">图库</h2>
          <p className="text-sm text-text-secondary mt-1">
            共 {gallery.length} 张图片
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 筛选 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="all">全部图片</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.partName} - {task.title}
              </option>
            ))}
          </select>
          {/* 批量下载 */}
          {filteredGallery.length > 0 && (
            <button
              onClick={handleBatchDownload}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className="ri-download-line"></i>
              批量下载 ({filteredGallery.length})
            </button>
          )}
        </div>
      </div>

      {/* 图片网格 */}
      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGallery.map((image) => (
            <div
              key={image.id}
              className="group bg-bg-card rounded-card overflow-hidden border border-border hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-text-secondary truncate">
                  {getTaskName(image.taskId)}
                </p>
                <p className="text-xs text-text-secondary font-mono">
                  {formatTime(image.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
          <i className="ri-image-line text-5xl mb-3"></i>
          <p className="text-sm">暂无图片</p>
          <p className="text-xs mt-1">生成的图片会自动保存到这里</p>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownload(selectedImage)}
                className="w-10 h-10 bg-bg-card/80 rounded-full flex items-center justify-center text-text-primary hover:bg-accent transition-colors"
              >
                <i className="ri-download-line"></i>
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 bg-bg-card/80 rounded-full flex items-center justify-center text-text-primary hover:bg-error transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="mt-4 p-4 bg-bg-card rounded-lg">
              <p className="text-sm text-text-primary mb-2">
                {getTaskName(selectedImage.taskId)}
              </p>
              <p className="text-xs text-text-secondary line-clamp-2">
                {selectedImage.prompt}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                <span>尺寸: {selectedImage.size === 'large' ? '1024x1024' : '512x512'}</span>
                <span>{formatTime(selectedImage.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
