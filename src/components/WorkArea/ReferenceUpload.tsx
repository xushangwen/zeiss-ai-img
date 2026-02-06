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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      let quality = 0.85;
      let result = canvas.toDataURL('image/jpeg', quality);

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
        const compressed = await compressImage(file, 800);
        setReferenceImage(compressed);

        setIsAnalyzing(true);
        try {
          const info = await analyzeImage(compressed);
          setPersonInfo(info);
        } catch (err) {
          console.error('图片分析失败:', err);
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
    <div className="bg-bg-card rounded-card p-4 border border-border hover:border-border-light transition-colors">
      <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
          <i className="ri-user-line text-accent text-xs"></i>
        </div>
        参考图（人物一致性）
      </h3>

      {referenceImage ? (
        <div className="space-y-3">
          <div className="relative group rounded-xl overflow-hidden">
            <img
              src={referenceImage}
              alt="参考图"
              className="w-full max-h-60 object-contain bg-bg-primary"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 w-8 h-8 glass rounded-lg flex items-center justify-center text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* 人物信息展示 */}
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary p-3 bg-bg-primary rounded-xl">
              <i className="ri-loader-4-line animate-spin text-accent"></i>
              <span>正在分析人物特征...</span>
            </div>
          ) : personInfo ? (
            <div className="bg-bg-primary rounded-xl p-3 text-xs space-y-2">
              <div className="text-text-tertiary flex items-center gap-1.5">
                <i className="ri-magic-line text-accent text-sm"></i>
                <span className="text-[10px] uppercase tracking-wider font-medium">AI 分析结果</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-text-secondary"><span className="text-text-tertiary">年龄：</span>{personInfo.age}</div>
                <div className="text-text-secondary"><span className="text-text-tertiary">性别：</span>{personInfo.gender}</div>
                <div className="text-text-secondary"><span className="text-text-tertiary">肤色：</span>{personInfo.skinTone}</div>
                <div className="text-text-secondary"><span className="text-text-tertiary">发型：</span>{personInfo.hairStyle}</div>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-text-tertiary">外貌：</span>
                <span className="text-text-secondary">{personInfo.appearance}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`block w-full h-40 border border-dashed rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
            isDragging
              ? 'border-accent bg-accent/5 shadow-glow'
              : 'border-border-light hover:border-accent/40 hover:bg-bg-hover/30'
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
              <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center mb-3">
                <i className="ri-upload-cloud-line text-xl text-text-tertiary"></i>
              </div>
              <span className="text-sm text-text-secondary">
                拖拽或点击上传参考图
              </span>
              <span className="text-[12px] text-text-tertiary mt-1">
                上传后自动分析人物特征
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}