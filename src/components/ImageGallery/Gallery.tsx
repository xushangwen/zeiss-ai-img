import { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { getImage } from '../../utils/imageStorage';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Select } from '../ui/Select';
import type { GalleryImageMeta } from '../../types';

// 带有图片数据的完整图片类型
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
  const handleDownload = (image: GalleryImageWithData) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `zeiss-${image.id}.png`;
    link.click();
  };

  // 批量下载
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

  // 删除图片
  const handleDelete = async (id: string) => {
    await removeFromGallery(id);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
    setDeleteConfirm(null);
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

  // 点击图片查看详情
  const handleImageClick = (meta: GalleryImageMeta) => {
    const url = loadedImages.get(meta.id);
    if (url) {
      setSelectedImage({ ...meta, url });
    }
  };

  if (isLoading && gallery.length > 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center text-text-secondary">
          <i className="ri-loader-4-line animate-spin text-3xl mb-2"></i>
          <p className="text-sm">加载图片中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">图库</h2>
          <p className="text-sm text-text-secondary mt-1">
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
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
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
                className="group bg-bg-card rounded-card overflow-hidden border border-border hover:border-accent/50 transition-colors cursor-pointer relative"
                onClick={() => handleImageClick(meta)}
              >
                <div className="aspect-square overflow-hidden bg-bg-primary">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      <i className="ri-image-line text-2xl"></i>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-text-secondary truncate">
                    {getTaskName(meta.taskId)}
                  </p>
                  <p className="text-xs text-text-secondary font-mono">
                    {formatTime(meta.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(meta.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-error/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                >
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
          <i className="ri-image-line text-5xl mb-3"></i>
          <p className="text-sm">暂无图片</p>
          <p className="text-xs mt-1">生成的图片会自动保存到这里</p>
        </div>
      )}

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
                onClick={() => setDeleteConfirm(selectedImage.id)}
                className="w-10 h-10 bg-bg-card/80 rounded-full flex items-center justify-center text-text-primary hover:bg-error transition-colors"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 bg-bg-card/80 rounded-full flex items-center justify-center text-text-primary hover:bg-bg-card transition-colors"
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
                <span>比例: {selectedImage.aspectRatio || '1:1'}</span>
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