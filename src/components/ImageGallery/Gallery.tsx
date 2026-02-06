import { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { getImage } from '../../utils/imageStorage';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Select } from '../ui/Select';
import type { GalleryImageMeta } from '../../types';

interface GalleryImageWithData extends GalleryImageMeta {
  url: string;
}

export function Gallery() {
  const { gallery, tasks, removeFromGallery } = useStore();
  const [selectedImage, setSelectedImage] = useState<GalleryImageWithData | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loadedImages, setLoadedImages] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 从 IndexedDB 加载图片数据
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      const newLoadedImages = new Map<string, string>();

      for (const meta of gallery) {
        try {
          const imageData = await getImage(meta.id);
          if (imageData) {
            newLoadedImages.set(meta.id, imageData);
          }
        } catch (error) {
          console.error(`加载图片 ${meta.id} 失败:`, error);
        }
      }

      setLoadedImages(newLoadedImages);
      setIsLoading(false);
    };

    loadImages();
  }, [gallery]);

  const getTaskName = (taskId?: string) => {
    if (!taskId) return '未关联任务';
    const task = tasks.find((t) => t.id === taskId);
    return task ? `${task.partName} - ${task.title}` : '未知任务';
  };

  const filteredGallery =
    filter === 'all'
      ? gallery
      : gallery.filter((img) => img.taskId === filter);

  const handleDownload = (image: GalleryImageWithData) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `zeiss-${image.id}.png`;
    link.click();
  };

  const handleBatchDownload = () => {
    filteredGallery.forEach((meta, index) => {
      const url = loadedImages.get(meta.id);
      if (url) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = url;
          link.download = `zeiss-${meta.id}.png`;
          link.click();
        }, index * 200);
      }
    });
  };

  const handleDelete = async (id: string) => {
    await removeFromGallery(id);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
    setDeleteConfirm(null);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageClick = (meta: GalleryImageMeta) => {
    const url = loadedImages.get(meta.id);
    if (url) {
      setSelectedImage({ ...meta, url });
    }
  };

  if (isLoading && gallery.length > 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center text-text-tertiary">
          <i className="ri-loader-4-line animate-spin text-3xl mb-3 text-accent"></i>
          <p className="text-sm">加载图片中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary font-display">图库</h2>
          <p className="text-xs text-text-tertiary mt-1 font-mono">
            共 {gallery.length} 张图片
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={filter}
            onChange={(value) => setFilter(value)}
            className="min-w-[200px]"
            placeholder="全部图片"
            options={[
              { value: 'all', label: '全部图片' },
              ...tasks.map((task) => ({
                value: task.id,
                label: `${task.partName} - ${task.title}`,
              })),
            ]}
          />
          {filteredGallery.length > 0 && (
            <button
              onClick={handleBatchDownload}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs rounded-btn flex items-center gap-2 transition-all duration-200 shadow-glow hover:shadow-glow-strong whitespace-nowrap shrink-0"
            >
              <i className="ri-download-line"></i>
              批量下载 ({filteredGallery.length})
            </button>
          )}
        </div>
      </div>

      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGallery.map((meta) => {
            const imageUrl = loadedImages.get(meta.id);
            return (
              <div
                key={meta.id}
                className="group bg-bg-card rounded-card overflow-hidden border border-border hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer relative"
                onClick={() => handleImageClick(meta)}
              >
                <div className="aspect-square overflow-hidden bg-bg-primary">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                      <i className="ri-image-line text-2xl"></i>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[12px] text-text-secondary truncate">
                    {getTaskName(meta.taskId)}
                  </p>
                  <p className="text-[10px] text-text-tertiary font-mono mt-0.5">
                    {formatTime(meta.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(meta.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 glass rounded-lg flex items-center justify-center text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-text-tertiary">
          <div className="w-16 h-16 rounded-2xl bg-bg-card flex items-center justify-center mb-4 border border-border">
            <i className="ri-image-line text-3xl"></i>
          </div>
          <p className="text-sm text-text-secondary">暂无图片</p>
          <p className="text-xs mt-1">生成的图片会自动保存到这里</p>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownload(selectedImage)}
                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-text-primary hover:bg-accent/20 hover:text-accent transition-all"
              >
                <i className="ri-download-line"></i>
              </button>
              <button
                onClick={() => setDeleteConfirm(selectedImage.id)}
                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-text-primary hover:bg-error/20 hover:text-error transition-all"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-text-primary hover:bg-bg-elevated transition-all"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="mt-4 p-4 glass rounded-xl border border-border">
              <p className="text-sm text-text-primary mb-2">
                {getTaskName(selectedImage.taskId)}
              </p>
              <p className="text-xs text-text-tertiary line-clamp-2">
                {selectedImage.prompt}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-text-tertiary font-mono">
                <span className="px-2 py-0.5 bg-bg-primary rounded-md">{selectedImage.aspectRatio || '1:1'}</span>
                <span>{formatTime(selectedImage.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <ConfirmDialog
          message="确定要删除这张图片吗？"
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}