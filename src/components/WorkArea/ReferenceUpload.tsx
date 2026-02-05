import { useCallback, useState } from 'react';
import { useStore } from '../../stores/useStore';

export function ReferenceUpload() {
  const { referenceImage, setReferenceImage } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setReferenceImage(base64);
      };
      reader.readAsDataURL(file);
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
          />
          <i className="ri-upload-cloud-line text-3xl text-text-secondary mb-2"></i>
          <span className="text-sm text-text-secondary">
            拖拽或点击上传参考图
          </span>
          <span className="text-xs text-text-secondary mt-1">
            用于保持人物相貌一致
          </span>
        </label>
      )}
    </div>
  );
}
