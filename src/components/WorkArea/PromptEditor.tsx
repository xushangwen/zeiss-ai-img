import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import type { PromptTemplate } from '../../types';

export function PromptEditor() {
  const {
    currentPrompt,
    setCurrentPrompt,
    templates,
    currentTaskId,
    tasks,
  } = useStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const currentTask = tasks.find((t) => t.id === currentTaskId);

  // 筛选相关模板
  const relevantTemplates = templates.filter(
    (t) => t.category === 'general' || t.category === currentTask?.part
  );

  const applyTemplate = (template: PromptTemplate) => {
    setCurrentPrompt(template.content);
    setShowTemplates(false);
  };

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-edit-line text-accent"></i>
          提示词
        </h3>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
        >
          <i className="ri-file-list-line"></i>
          模板
        </button>
      </div>

      {/* 模板选择下拉 */}
      {showTemplates && (
        <div className="mb-3 p-2 bg-bg-primary rounded-lg border border-border">
          <div className="text-xs text-text-secondary mb-2">选择模板</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {relevantTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="w-full text-left px-2 py-1.5 text-sm text-text-primary hover:bg-bg-hover rounded transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 任务描述提示 */}
      {currentTask && (
        <div className="mb-3 p-2 bg-accent/10 rounded-lg text-xs text-text-secondary">
          <span className="text-accent font-medium">任务要求：</span>
          {currentTask.description}
        </div>
      )}

      {/* 提示词输入 */}
      <textarea
        value={currentPrompt}
        onChange={(e) => setCurrentPrompt(e.target.value)}
        placeholder="输入图片生成提示词..."
        className="w-full h-32 bg-bg-primary border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-accent"
      />

      {/* 变量提示 */}
      <div className="mt-2 text-xs text-text-secondary">
        <span className="text-accent">提示：</span>
        使用 {'{变量名}'} 格式插入变量，如 {'{人物描述}'} {'{表情}'}
      </div>
    </div>
  );
}
