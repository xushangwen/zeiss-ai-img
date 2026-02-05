import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GenerateRequest {
  personDescription?: string;  // 从参考图分析的人物描述
  taskDescription?: string;     // 任务描述
  customPrompt?: string;        // 自定义提示词（优先级最高）
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
    const { personDescription, taskDescription, customPrompt, referenceImage, aspectRatio = '1:1', count } = req.body as GenerateRequest;

    // 如果提供了自定义提示词，直接使用；否则自动整合
    const prompt = customPrompt || buildPrompt(personDescription, taskDescription, !!referenceImage);

    if (!prompt) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

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
        console.log('参考图已添加，类型:', base64Match[1]);
      } else {
        console.warn('参考图格式无效，跳过');
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
        // 返回更详细的错误信息
        return res.status(response.status).json({
          error: `Gemini API 调用失败: ${response.status}`,
          details: errorText
        });
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
function buildPrompt(personDescription: string | undefined, taskDescription: string | undefined, hasReference: boolean): string {
  if (!taskDescription) {
    return '';
  }

  let prompt = 'Generate a photorealistic medical illustration photograph.\n\n';

  if (personDescription) {
    prompt += `人物特征：${personDescription}\n\n`;
  }

  prompt += `场景要求：${taskDescription}\n\n`;

  prompt += `技术要求：
- 真实照片级摄影（photorealistic photography），禁止插画、卡通、手绘等非写实风格
- 白色或浅灰色简洁背景，柔和自然光线
- 人物半身构图，头部必须完整显示在画面内（包括头顶和额头），头部占画面高度不超过60%，居中偏上
- 眼镜正确佩戴在脸上，不悬空、不穿透皮肤
- 手部动作须符合物理逻辑，手指不能穿过镜片或其他物体，手部的肤质、骨骼粗细须与人物的性别和年龄一致
- 禁止出现任何文字、标签或水印`;

  if (hasReference) {
    prompt += '\n- 人物外貌严格参考上传的参考图，保持高度一致性';
  }

  return prompt;
}
