import { useStore } from '../../stores/useStore';

export function Header() {
  const { currentView, currentTaskId, tasks } = useStore();
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  const titles: Record<string, string> = {
    workspace: '生图工作区',
    gallery: '图库',
    templates: '提示词模板',
  };

  return (
    <header className="h-14 bg-bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-text-primary">
          {titles[currentView]}
        </h2>
        {currentView === 'workspace' && currentTask && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">/</span>
            <span className="text-accent">{currentTask.partName}</span>
            <span className="text-text-secondary">/</span>
            <span className="text-text-primary">{currentTask.title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* API 状态指示 */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          Gemini API
        </div>
      </div>
    </header>
  );
}
