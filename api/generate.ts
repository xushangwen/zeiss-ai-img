import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GenerateRequest {
  personDescription?: string;  // 从参考图分析的人物描述
  taskDescription: string;     // 任务描述
  referenceImage?: string;
  aspectRatio?: string;
  count: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key 未配置' });
  }

  try {
    const { personDescription, taskDescription, referenceImage, aspectRatio = '1:1', count } = req.body as GenerateRequest;

    if (!taskDescription) {
      return res.status(400).json({ error: '任务描述不能为空' });
    }

    // 自动整合提示词
    const prompt = buildPrompt(personDescription, taskDescription, !!referenceImage);

    // 构建请求内容
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (referenceImage) {
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

    parts.push({ text: prompt });

    const contents = [{ role: 'user', parts }];
    const images: string[] = [];

    for (let i = 0; i < count; i++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: {
                imageSize: '2K',
                aspectRatio: aspectRatio,
              },
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

    return res.status(200).json({ images, prompt });
  } catch (error) {
    console.error('生成错误:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: message });
  }
}

// 自动整合提示词
function buildPrompt(personDescription: string | undefined, taskDescription: string, hasReference: boolean): string {
  let prompt = '';

  if (personDescription) {
    prompt += `人物特征：${personDescription}\n\n`;
  }

  prompt += `场景要求：${taskDescription}\n\n`;

  prompt += `图片要求：
- 专业医疗说明图风格
- 清晰的人物特写
- 简洁的白色或浅灰色背景
- 柔和自然的光线
- 图片中不要出现任何文字、标签或水印`;

  if (hasReference) {
    prompt += '\n- 人物外貌请严格参考上传的参考图，保持高度一致性';
  }

  return prompt;
}
