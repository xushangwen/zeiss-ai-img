import type { VercelRequest, VercelResponse } from '@vercel/node';

// 比例对应的尺寸（Gemini 支持的尺寸）
const ASPECT_RATIO_SIZES: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
  '4:3': { width: 1152, height: 896 },
  '3:4': { width: 896, height: 1152 },
};

interface GenerateRequest {
  prompt: string;
  referenceImage?: string;
  aspectRatio?: string;
  count: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key 未配置' });
  }

  try {
    const { prompt, referenceImage, aspectRatio = '1:1', count } = req.body as GenerateRequest;

    if (!prompt) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    // 获取尺寸
    const size = ASPECT_RATIO_SIZES[aspectRatio] || ASPECT_RATIO_SIZES['1:1'];

    // 构建请求内容
    const contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];

    // 如果有参考图，添加到请求中
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (referenceImage) {
      // 从 base64 URL 中提取数据
      const base64Match = referenceImage.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        parts.push({
          inlineData: {
            mimeType: `image/${base64Match[1]}`,
            data: base64Match[2],
          },
        });
      }
    }

    // 添加提示词
    parts.push({
      text: `请根据以下描述生成一张专业的医疗说明图片：

${prompt}

要求：
- 图片尺寸：${size.width}x${size.height}
- 风格：专业医疗说明图，清晰的人物特写
- 背景：简洁的白色或浅灰色
- 光线：柔和自然
${referenceImage ? '- 人物外貌请参考上传的参考图，保持一致性' : ''}`,
    });

    contents.push({ role: 'user', parts });

    // 调用 Gemini API
    const images: string[] = [];

    for (let i = 0; i < count; i++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API 错误:', errorText);
        throw new Error(`Gemini API 调用失败: ${response.status}`);
      }

      const data = await response.json();

      // 提取生成的图片
      const candidates = data.candidates || [];
      for (const candidate of candidates) {
        const candidateParts = candidate.content?.parts || [];
        for (const part of candidateParts) {
          if (part.inlineData?.data) {
            images.push(part.inlineData.data);
          }
        }
      }
    }

    if (images.length === 0) {
      throw new Error('未能生成图片');
    }

    return res.status(200).json({
      images,
      prompt,
    });
  } catch (error) {
    console.error('生成错误:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: message });
  }
}
