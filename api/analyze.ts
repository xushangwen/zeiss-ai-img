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
        text: `请分析这张图片中的人物特征，并严格按照以下 JSON 格式返回，不要添加任何其他文字、解释或 markdown 代码块标记：

{
  "age": "估计年龄范围，如：25-30岁、中年、老年等",
  "gender": "性别：男/女",
  "appearance": "整体外貌描述，50字以内",
  "skinTone": "肤色描述，如：白皙、小麦色等",
  "hairStyle": "发型描述，如：短发、长发、白发等",
  "facialFeatures": "面部特征，如：圆脸、瓜子脸、浓眉等"
}

重要：只返回上述 JSON 对象，不要包含 \`\`\`json 标记或任何其他内容。`,
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
            maxOutputTokens: 2000,  // gemini-3-flash-preview 需要更多 token（包含思考过程）
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

    // 添加日志查看返回内容
    console.log('AI 返回的原始内容:', textContent);

    // 清理可能的 markdown 代码块标记
    let cleanedContent = textContent.trim();

    // 移除 ```json 和 ``` 标记
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    cleanedContent = cleanedContent.trim();

    // 尝试多种方式解析 JSON
    let personInfo: PersonInfo;

    // 方式1：尝试直接解析（如果返回的就是纯 JSON）
    try {
      personInfo = JSON.parse(cleanedContent);
      console.log('方式1成功：直接解析');
    } catch {
      // 方式2：使用正则提取 JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('无法找到 JSON 格式，返回内容:', textContent);
        throw new Error(`无法解析人物信息。AI 返回: ${textContent.slice(0, 200)}`);
      }
      try {
        personInfo = JSON.parse(jsonMatch[0]);
        console.log('方式2成功：正则提取');
      } catch (parseError) {
        console.error('JSON 解析失败:', parseError);
        console.error('提取的内容:', jsonMatch[0]);
        throw new Error(`JSON 解析失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
      }
    }

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
