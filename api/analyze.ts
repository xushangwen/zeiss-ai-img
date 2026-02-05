import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AnalyzeRequest {
  image: string; // base64 图片
}

interface PersonInfo {
  age: string;
  gender: string;
  appearance: string;
  skinTone: string;
  hairStyle: string;
  facialFeatures: string;
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
    const { image } = req.body as AnalyzeRequest;

    if (!image) {
      return res.status(400).json({ error: '图片不能为空' });
    }

    // 从 base64 URL 中提取数据
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({ error: '图片格式无效' });
    }

    const parts = [
      {
        inlineData: {
          mimeType: `image/${base64Match[1]}`,
          data: base64Match[2],
        },
      },
      {
        text: `请分析这张图片中的人物，提取以下信息并以JSON格式返回：

{
  "age": "估计年龄范围，如：25-30岁、中年、老年等",
  "gender": "性别：男/女",
  "appearance": "整体外貌描述，50字以内",
  "skinTone": "肤色描述，如：白皙、小麦色等",
  "hairStyle": "发型描述，如：短发、长发、白发等",
  "facialFeatures": "面部特征，如：圆脸、瓜子脸、浓眉等"
}

只返回JSON，不要其他文字。`,
      },
    ];

    // 使用 gemini-3-flash-preview 模型分析图片（最新性价比模型）
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
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
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 尝试解析 JSON
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析人物信息');
    }

    const personInfo: PersonInfo = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      personInfo,
    });
  } catch (error) {
    console.error('分析错误:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: message });
  }
}
