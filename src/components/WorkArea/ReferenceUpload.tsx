import { useCallback, useState } from 'react';
import { useStore } from '../../stores/useStore';

// 压缩图片到指定大小
async function compressImage(file: File, maxSizeKB = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 计算缩放比例，最大边不超过 800px
      const maxDim = 800;
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // 尝试不同质量压缩
      let quality = 0.8;
      let result = canvas.toDataURL('image/jpeg', quality);

      // 如果还是太大，继续降低质量
      while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(result);
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

export function ReferenceUpload() {
  const { referenceImage, setReferenceImage } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }

      setIsCompressing(true);
      try {
        // 压缩图片
        const compressed = await compressImage(file, 500);
        setReferenceImage(compressed);
      } catch (err) {
        console.error('图片压缩失败:', err);
        alert('图片处理失败，请重试');
      } finally {
        setIsCompressing(false);
      }
    },
    [setReferenceImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
        <i className="ri-user-line text-accent"></i>
        参考图（人物一致性）
      </h3>

      {referenceImage ? (
        <div className="relative group">
          <img
            src={referenceImage}
            alt="参考图"
            className="w-full h-40 object-cover rounded-lg"
          />
          <button
            onClick={() => setReferenceImage(null)}
            className="absolute top-2 right-2 w-8 h-8 bg-bg-primary/80 rounded-full flex items-center justify-center text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`block w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center ${
            isDragging
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={isCompressing}
          />
          {isCompressing ? (
            <>
              <i className="ri-loader-4-line text-3xl text-accent mb-2 animate-spin"></i>
              <span className="text-sm text-text-secondary">压缩中...</span>
            </>
          ) : (
            <>
              <i className="ri-upload-cloud-line text-3xl text-text-secondary mb-2"></i>
              <span className="text-sm text-text-secondary">
                拖拽或点击上传参考图
              </span>
              <span className="text-xs text-text-secondary mt-1">
                图片会自动压缩
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
