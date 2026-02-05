import { useState, useCallback } from 'react';
import type { GenerateRequest, GenerateResponse, GeneratedImage } from '../types';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (request: GenerateRequest): Promise<GeneratedImage[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `生成失败: ${response.status}`);
        }

        const data: GenerateResponse = await response.json();

        // 转换为 GeneratedImage 格式
        const images: GeneratedImage[] = data.images.map((base64, index) => ({
          id: `img-${Date.now()}-${index}`,
          url: `data:image/png;base64,${base64}`,
          prompt: data.prompt,
          size: request.size,
          createdAt: Date.now(),
        }));

        return images;
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知错误';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 生成小图（测试用）
  const generateThumbnails = useCallback(
    async (
      prompt: string,
      referenceImage?: string,
      count = 4
    ): Promise<GeneratedImage[]> => {
      return generate({
        prompt,
        referenceImage,
        size: 'small',
        count,
      });
    },
    [generate]
  );

  // 生成大图（最终输出）
  const generateFinal = useCallback(
    async (
      prompt: string,
      referenceImage?: string
    ): Promise<GeneratedImage> => {
      const images = await generate({
        prompt,
        referenceImage,
        size: 'large',
        count: 1,
      });
      return images[0];
    },
    [generate]
  );

  return {
    generate,
    generateThumbnails,
    generateFinal,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
