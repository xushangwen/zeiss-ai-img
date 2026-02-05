import type { Task, TaskStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig: Record<TaskStatus, { color: string; label: string; icon: string }> = {
  pending: { color: 'text-text-secondary', label: '待处理', icon: 'ri-time-line' },
  generating: { color: 'text-warning', label: '生成中', icon: 'ri-loader-4-line animate-spin' },
  reviewing: { color: 'text-accent', label: '待确认', icon: 'ri-eye-line' },
  completed: { color: 'text-success', label: '已完成', icon: 'ri-check-line' },
};

export function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  const status = statusConfig[task.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-card transition-all ${
        isSelected
          ? 'bg-accent/20 border border-accent'
          : 'bg-bg-card border border-border hover:border-accent/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-text-primary truncate">
            {task.title}
          </h4>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
            {task.description}
          </p>
        </div>
        <div className={`flex items-center gap-1 text-xs ${status.color}`}>
          <i className={status.icon}></i>
        </div>
      </div>

      {/* 缩略图预览 */}
      {task.thumbnails.length > 0 && (
        <div className="flex gap-1 mt-2">
          {task.thumbnails.slice(0, 4).map((img) => (
            <div
              key={img.id}
              className="w-8 h-8 rounded bg-bg-primary overflow-hidden"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
