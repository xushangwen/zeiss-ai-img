import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { Select } from '../ui/Select';
import type { PromptTemplate, TaskPart } from '../../types';
import { partNames } from '../../data/zeissRequirements';

export function TemplateList() {
  const { templates, saveTemplate, deleteTemplate, addToast } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PromptTemplate>>({});

  const categories: Array<TaskPart | 'general'> = [
    'general',
    'pupil-distance',
    'fitting-height',
    'vertex-distance',
    'pantoscopic-tilt',
    'face-form-angle',
  ];

  const categoryNames: Record<string, string> = {
    general: '通用',
    ...partNames,
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingId(template.id);
    setEditForm(template);
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.content) {
      addToast('请填写模板名称和内容', 'warning');
      return;
    }

    const template: PromptTemplate = {
      id: editForm.id || `tpl-${Date.now()}`,
      name: editForm.name,
      content: editForm.content,
      variables: extractVariables(editForm.content),
      category: editForm.category || 'general',
      isDefault: editForm.isDefault,
    };

    saveTemplate(template);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({
      id: `tpl-${Date.now()}`,
      name: '',
      content: '',
      category: 'general',
    });
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(1, -1)))];
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary font-display">提示词模板</h2>
          <p className="text-xs text-text-tertiary mt-1">
            管理和编辑图片生成提示词模板
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs rounded-btn flex items-center gap-2 transition-all duration-200 shadow-glow hover:shadow-glow-strong"
        >
          <i className="ri-add-line"></i>
          新建模板
        </button>
      </div>

      {/* 编辑表单 */}
      {editingId && (
        <div className="mb-6 p-5 bg-bg-card rounded-card border border-border-light animate-slide-up">
          <h3 className="text-sm font-medium text-text-primary mb-4">
            {editingId === 'new' ? '新建模板' : '编辑模板'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-text-tertiary mb-1.5 uppercase tracking-wider">
                  模板名称
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:shadow-glow transition-all"
                  placeholder="输入模板名称"
                />
              </div>
              <div>
                <label className="block text-[12px] text-text-tertiary mb-1.5 uppercase tracking-wider">
                  分类
                </label>
                <Select
                  value={editForm.category || 'general'}
                  options={categories.map((cat) => ({
                    value: cat,
                    label: categoryNames[cat],
                  }))}
                  onChange={(value) =>
                    setEditForm({
                      ...editForm,
                      category: value as TaskPart | 'general',
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-text-tertiary mb-1.5 uppercase tracking-wider">
                模板内容
              </label>
              <textarea
                value={editForm.content || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                className="w-full h-32 px-3 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-text-primary resize-none focus:outline-none focus:border-accent/50 focus:shadow-glow transition-all font-mono"
                placeholder="输入提示词模板，使用 {变量名} 格式插入变量"
              />
            </div>
            {editForm.content && (
              <div className="text-[12px] text-text-tertiary">
                <span className="text-accent">检测到的变量：</span>
                {extractVariables(editForm.content).join(', ') || '无'}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-btn transition-all duration-200 text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-bg-card rounded-card p-4 border border-border hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-medium text-text-primary">
                  {template.name}
                </h4>
                <span className="text-[10px] text-accent font-mono uppercase tracking-wider">
                  {categoryNames[template.category]}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(template)}
                  className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-accent transition-colors rounded-md hover:bg-accent/10"
                >
                  <i className="ri-edit-line text-sm"></i>
                </button>
                {!template.isDefault && (
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-error transition-colors rounded-md hover:bg-error/10"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[12px] text-text-tertiary line-clamp-3 mb-3 leading-relaxed">
              {template.content}
            </p>
            {template.variables.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.variables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 bg-accent/8 text-accent text-[10px] rounded-md font-mono"
                  >
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}