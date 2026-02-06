import { useStore } from '../../stores/useStore';

export function Header() {
  const { currentView, currentTaskId, tasks } = useStore();
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  const titles: Record<string, { label: string; icon: string }> = {
    workspace: { label: '生图工作区', icon: 'ri-brush-line' },
    gallery: { label: '图库', icon: 'ri-gallery-line' },
    templates: { label: '提示词模板', icon: 'ri-file-list-3-line' },
  };

  const current = titles[currentView];

  return (
    <header className="h-14 glass border-b border-border flex items-center justify-between px-6 relative">
      {/* 底部渐变光线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-text-secondary">
          <i className={`${current?.icon} text-base`}></i>
          <h2 className="text-sm font-medium text-text-primary">
            {current?.label}
          </h2>
        </div>
        {currentView === 'workspace' && currentTask && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-tertiary">/</span>
            <span className="text-accent/80 text-xs font-medium">{currentTask.partName}</span>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-primary text-xs">{currentTask.title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* API 状态指示 */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="font-mono text-text-tertiary">Gemini API</span>
        </div>
      </div>
    </header>
  );
}
