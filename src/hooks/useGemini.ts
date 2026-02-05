import { useState, useCallback } from 'react';
import type { GenerateRequest, GenerateResponse, GeneratedImage, AspectRatio, PersonInfo } from '../types';

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `生成失败: ${response.status}`);
        }

        const data: GenerateResponse = await response.json();

        const images: GeneratedImage[] = data.images.map((base64, index) => ({
          id: `img-${Date.now()}-${index}`,
          url: `data:image/png;base64,${base64}`,
          prompt: data.prompt,
          aspectRatio: request.aspectRatio,
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

  // 根据人物信息和任务描述自动生成图片
  const generateImages = useCallback(
    async (
      taskDescription: string,
      personInfo: PersonInfo | null,
      referenceImage?: string,
      aspectRatio: AspectRatio = '1:1',
      count = 2
    ): Promise<GeneratedImage[]> => {
      // 将人物信息转换为描述文本
      const personDescription = personInfo
        ? `${personInfo.gender}，${personInfo.age}，${personInfo.skinTone}皮肤，${personInfo.hairStyle}，${personInfo.appearance}`
        : undefined;

      return generate({
        personDescription,
        taskDescription,
        referenceImage,
        aspectRatio,
        count,
      });
    },
    [generate]
  );

  return {
    generate,
    generateImages,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
