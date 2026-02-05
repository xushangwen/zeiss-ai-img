import { useCallback, useState } from 'react';
import { useStore } from '../../stores/useStore';
import type { PersonInfo } from '../../types';

// 压缩图片（保持原始宽度，只压缩质量）
async function compressImage(file: File, maxSizeKB = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 保持原始尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // 尝试不同质量压缩
      let quality = 0.85;
      let result = canvas.toDataURL('image/jpeg', quality);

      // 如果还是太大，继续降低质量
      while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.3) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(result);
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

// 分析图片中的人物
async function analyzeImage(imageBase64: string): Promise<PersonInfo> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '分析失败');
  }

  const data = await response.json();
  return data.personInfo;
}

export function ReferenceUpload() {
  const {
    referenceImage,
    setReferenceImage,
    personInfo,
    setPersonInfo,
    isAnalyzing,
    setIsAnalyzing,
    addToast,
  } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        addToast('请上传图片文件', 'warning');
        return;
      }

      setIsCompressing(true);
      try {
        // 压缩图片
        const compressed = await compressImage(file, 800);
        setReferenceImage(compressed);

        // 自动分析图片
        setIsAnalyzing(true);
        try {
          const info = await analyzeImage(compressed);
          setPersonInfo(info);
        } catch (err) {
          console.error('图片分析失败:', err);
          // 分析失败不影响上传
        } finally {
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.error('图片压缩失败:', err);
        addToast('图片处理失败，请重试', 'error');
      } finally {
        setIsCompressing(false);
      }
    },
    [setReferenceImage, setPersonInfo, setIsAnalyzing, addToast]
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

  const handleClear = useCallback(() => {
    setReferenceImage(null);
    setPersonInfo(null);
  }, [setReferenceImage, setPersonInfo]);

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
        <i className="ri-user-line text-accent"></i>
        参考图（人物一致性）
      </h3>

      {referenceImage ? (
        <div className="space-y-3">
          <div className="relative group">
            <img
              src={referenceImage}
              alt="参考图"
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 w-8 h-8 bg-bg-primary/80 rounded-full flex items-center justify-center text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* 人物信息展示 */}
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <i className="ri-loader-4-line animate-spin"></i>
              <span>正在分析人物特征...</span>
            </div>
          ) : personInfo ? (
            <div className="bg-bg-primary rounded-lg p-3 text-xs space-y-1">
              <div className="text-text-secondary mb-2 flex items-center gap-1">
                <i className="ri-magic-line text-accent"></i>
                <span>AI 分析结果</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-text-secondary">年龄：</span>{personInfo.age}</div>
                <div><span className="text-text-secondary">性别：</span>{personInfo.gender}</div>
                <div><span className="text-text-secondary">肤色：</span>{personInfo.skinTone}</div>
                <div><span className="text-text-secondary">发型：</span>{personInfo.hairStyle}</div>
              </div>
              <div className="pt-1 border-t border-border mt-2">
                <span className="text-text-secondary">外貌：</span>
                {personInfo.appearance}
              </div>
            </div>
          ) : null}
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
              <span className="text-sm text-text-secondary">处理中...</span>
            </>
          ) : (
            <>
              <i className="ri-upload-cloud-line text-3xl text-text-secondary mb-2"></i>
              <span className="text-sm text-text-secondary">
                拖拽或点击上传参考图
              </span>
              <span className="text-xs text-text-secondary mt-1">
                上传后自动分析人物特征
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}