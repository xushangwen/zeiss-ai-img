import { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { Select } from '../ui/Select';

// 构建最终提示词（与 API 中的逻辑保持一致）
function buildFinalPrompt(
  personDescription: string | undefined,
  taskDescription: string | undefined,
  hasReference: boolean
): string {
  if (!taskDescription) {
    return '';
  }

  let prompt = '';

  // 核心摄影风格要求
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
    prompt += '\n- 重要：如果参考图中人物佩戴了眼镜，请在生成的图片中移除眼镜，展示未佩戴眼镜的状态（用于展示使用蔡司眼镜前的困扰）';
  }

  return prompt;
}

export function PromptEditor() {
  const {
    tasks,
    currentTaskId,
    personInfo,
    referenceImage,
    finalPrompt,
    setFinalPrompt,
    useCustomPrompt,
    setUseCustomPrompt,
    saveTemplate,
    templates,
    selectedTemplateId,
    setSelectedTemplate,
    addToast,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const currentTask = tasks.find((t) => t.id === currentTaskId);

  // 自动生成最终提示词
  useEffect(() => {
    if (!useCustomPrompt && currentTask) {
      const personDescription = personInfo
        ? `${personInfo.gender}，${personInfo.age}，${personInfo.skinTone}皮肤，${personInfo.hairStyle}，${personInfo.appearance}`
        : undefined;

      const prompt = buildFinalPrompt(
        personDescription,
        currentTask.description,
        !!referenceImage
      );

      setFinalPrompt(prompt);
    }
  }, [currentTask, personInfo, referenceImage, useCustomPrompt, setFinalPrompt]);

  const handlePreview = () => {
    setIsEditing(true);
    setUseCustomPrompt(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    setUseCustomPrompt(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUseCustomPrompt(false);
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      addToast('请输入模板名称', 'warning');
      return;
    }

    saveTemplate({
      name: templateName,
      content: finalPrompt,
      variables: [],
      category: currentTask?.part || 'general',
    });

    setShowSaveDialog(false);
    setTemplateName('');
    addToast('模板已保存', 'success');
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFinalPrompt(template.content);
      setSelectedTemplate(templateId);
      setUseCustomPrompt(true);
      setIsEditing(false);
    }
  };

  if (!currentTask) {
    return null;
  }

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-file-text-line text-accent"></i>
          提示词管理
        </h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handlePreview}
                className="px-3 py-1.5 bg-bg-primary hover:bg-border text-text-secondary text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <i className="ri-eye-line"></i>
                预览提示词
              </button>
              {useCustomPrompt && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <i className="ri-edit-line"></i>
                  编辑
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-bg-primary hover:bg-border text-text-secondary text-xs rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 bg-bg-primary hover:bg-border text-text-secondary text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <i className="ri-save-line"></i>
                存为模板
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-success hover:bg-success/90 text-white text-xs rounded-lg transition-colors"
              >
                保存修改
              </button>
            </>
          )}
        </div>
      </div>

      {/* 模板选择 */}
      {templates.length > 0 && !isEditing && (
        <div className="mb-3">
          <Select
            label="选择模板"
            value={selectedTemplateId || ''}
            onChange={(e) => handleSelectTemplate(e.target.value)}
          >
            <option value="">自动生成（默认）</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* 提示词预览/编辑 */}
      {(isEditing || useCustomPrompt) && (
        <div className="space-y-2">
          <textarea
            value={finalPrompt}
            onChange={(e) => setFinalPrompt(e.target.value)}
            readOnly={!isEditing}
            className={`w-full h-64 px-3 py-2 bg-bg-primary border border-border rounded-lg text-xs text-text-primary font-mono leading-relaxed resize-none focus:outline-none focus:border-accent ${
              !isEditing ? 'cursor-default' : ''
            }`}
            placeholder="提示词内容"
          />
          <div className="text-xs text-text-secondary">
            字符数：{finalPrompt.length}
          </div>
        </div>
      )}

      {/* 保存为模板对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-card p-6 max-w-md w-full border border-border">
            <h3 className="text-lg font-medium text-text-primary mb-4">保存为模板</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="输入模板名称"
              className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                }}
                className="px-4 py-2 bg-bg-primary hover:bg-border text-text-secondary text-sm rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
