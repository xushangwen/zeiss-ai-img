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
function buildPrompt(personDescription: string | undefined, taskDescription: string, hasReference: boolean): string {
  let prompt = '';

  // 核心摄影风格要求（放在最前面，强调优先级）
  prompt += `摄影风格要求：
- 必须是真实照片级别的摄影作品（photorealistic photography）
- 专业医疗说明图风格
- 使用专业相机拍摄的效果
- 禁止任何插画、卡通、手绘、艺术化风格
- 禁止风格化处理

`;

  if (personDescription) {
    prompt += `人物特征：${personDescription}\n\n`;
  }

  prompt += `场景要求：${taskDescription}\n\n`;

  prompt += `技术要求：
- 清晰的人物特写，焦点准确
- 简洁的白色或浅灰色背景
- 柔和自然的光线，避免强烈阴影
- 图片中不要出现任何文字、标签或水印
- 人物动作和手部位置必须符合物理逻辑
- 如果涉及手部动作，手指不能穿过镜片或其他物体
- 眼镜必须正确佩戴在脸上，不能悬空或穿透皮肤`;

  if (hasReference) {
    prompt += '\n- 人物外貌请严格参考上传的参考图，保持高度一致性';
  }

  return prompt;
}
