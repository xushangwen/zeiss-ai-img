import { useStore } from '../../stores/useStore';
import { useGemini } from '../../hooks/useGemini';

export function ThumbnailGrid() {
  const {
    thumbnails,
    selectedThumbnailId,
    selectThumbnail,
    setThumbnails,
    currentPrompt,
    referenceImage,
    isGenerating,
    setIsGenerating,
    updateTaskStatus,
    currentTaskId,
  } = useStore();

  const { generateThumbnails, isLoading, error } = useGemini();

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) {
      alert('请先输入提示词');
      return;
    }

    setIsGenerating(true);
    if (currentTaskId) {
      updateTaskStatus(currentTaskId, 'generating');
    }

    try {
      const images = await generateThumbnails(
        currentPrompt,
        referenceImage || undefined,
        4
      );
      setThumbnails(images);
      selectThumbnail(null);
      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'reviewing');
      }
    } catch {
      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'pending');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const loading = isGenerating || isLoading;

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-image-line text-accent"></i>
          小图预览
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              生成中...
            </>
          ) : (
            <>
              <i className="ri-magic-line"></i>
              生成 4 张
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      {/* 缩略图网格 */}
      <div className="grid grid-cols-2 gap-3">
        {thumbnails.length > 0 ? (
          thumbnails.map((img) => (
            <button
              key={img.id}
              onClick={() => selectThumbnail(img.id)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedThumbnailId === img.id
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-transparent hover:border-accent/50'
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {selectedThumbnailId === img.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-sm"></i>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="col-span-2 h-48 flex flex-col items-center justify-center text-text-secondary">
            <i className="ri-image-add-line text-4xl mb-2"></i>
            <span className="text-sm">点击上方按钮生成预览图</span>
          </div>
        )}
      </div>

      {thumbnails.length > 0 && (
        <p className="mt-3 text-xs text-text-secondary text-center">
          点击选择满意的图片，然后生成大图
        </p>
      )}
    </div>
  );
}
