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
    <div className="bg-bg-card rounded-card p-4 border border-border hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <i className="ri-file-text-line text-accent text-xs"></i>
          </div>
          提示词管理
        </h3>
        <div className="flex gap-1.5">
          {!isEditing ? (
            <>
              <button
                onClick={handlePreview}
                className="px-3 py-1.5 bg-bg-primary hover:bg-bg-elevated text-text-secondary text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200 border border-transparent hover:border-border-light"
              >
                <i className="ri-eye-line text-[12px]"></i>
                预览
              </button>
              {useCustomPrompt && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200"
                >
                  <i className="ri-edit-line text-[12px]"></i>
                  编辑
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-bg-primary hover:bg-bg-elevated text-text-secondary text-xs rounded-btn transition-all duration-200"
              >
                取消
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 bg-bg-primary hover:bg-bg-elevated text-text-secondary text-xs rounded-btn flex items-center gap-1.5 transition-all duration-200 border border-transparent hover:border-border-light"
              >
                <i className="ri-save-line text-[12px]"></i>
                存为模板
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-success/15 hover:bg-success/25 text-success text-xs rounded-btn transition-all duration-200"
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
            onChange={(value) => handleSelectTemplate(value)}
            placeholder="自动生成（默认）"
            options={[
              { value: '', label: '自动生成（默认）' },
              ...templates.map((template) => ({
                value: template.id,
                label: template.name,
              })),
            ]}
          />
        </div>
      )}

      {/* 提示词预览/编辑 */}
      {(isEditing || useCustomPrompt) && (
        <div className="space-y-2">
          <textarea
            value={finalPrompt}
            onChange={(e) => setFinalPrompt(e.target.value)}
            readOnly={!isEditing}
            className={`w-full h-64 px-3 py-2.5 bg-bg-primary border border-border rounded-xl text-xs text-text-primary font-mono leading-relaxed resize-none focus:outline-none focus:border-accent/50 focus:shadow-glow transition-all ${
              !isEditing ? 'cursor-default' : ''
            }`}
            placeholder="提示词内容"
          />
          <div className="text-[12px] text-text-tertiary font-mono">
            字符数：{finalPrompt.length}
          </div>
        </div>
      )}

      {/* 保存为模板对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-card rounded-card p-6 max-w-md w-full border border-border-light shadow-card-hover animate-scale-in">
            <h3 className="text-lg font-medium text-text-primary mb-4">保存为模板</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="输入模板名称"
              className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:shadow-glow mb-4 transition-all"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                }}
                className="px-4 py-2 bg-bg-primary hover:bg-bg-elevated text-text-secondary text-sm rounded-btn transition-all duration-200"
              >
                取消
              </button>
              <button
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-btn transition-all duration-200"
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