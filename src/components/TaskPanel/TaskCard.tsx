import { useStore } from '../../stores/useStore';
import type { Task, TaskStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig: Record<TaskStatus, { color: string; bg: string; label: string; icon: string }> = {
  pending: { color: 'text-text-secondary', bg: 'bg-text-secondary/10', label: '待处理', icon: 'ri-time-line' },
  generating: { color: 'text-warning', bg: 'bg-warning/10', label: '生成中', icon: 'ri-loader-4-line animate-spin' },
  reviewing: { color: 'text-accent-light', bg: 'bg-accent/10', label: '待确认', icon: 'ri-eye-line' },
  completed: { color: 'text-success', bg: 'bg-success/10', label: '已完成', icon: 'ri-check-line' },
};

export function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  const status = statusConfig[task.status];
  const updateTaskStatus = useStore((state) => state.updateTaskStatus);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskStatus(task.id, newStatus);
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-btn transition-all duration-200 ${
        isSelected
          ? 'bg-accent/15 border border-accent/40 shadow-glow ring-1 ring-accent/20'
          : 'bg-bg-card/60 border border-transparent hover:border-border-light hover:bg-bg-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* 选中时左侧加蓝色竖条 */}
          <div className="flex items-center gap-2">
            {isSelected && (
              <div className="w-[3px] h-4 rounded-full bg-accent shrink-0" />
            )}
            <h4 className={`text-[14px] font-medium truncate ${
              isSelected ? 'text-text-primary' : 'text-text-primary'
            }`}>
              {task.title}
            </h4>
          </div>
          <p className="text-[12px] text-text-tertiary mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-5 h-5 rounded-md ${status.bg} flex items-center justify-center`}>
            <i className={`${status.icon} text-[10px] ${status.color}`}></i>
          </div>
          {/* 完成状态 checkbox */}
          <button
            onClick={handleCheckboxClick}
            className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all duration-200 ${
              task.status === 'completed'
                ? 'bg-success border-success'
                : 'border-border-light hover:border-success/50'
            }`}
            title={task.status === 'completed' ? '取消完成' : '标记为完成'}
          >
            {task.status === 'completed' && (
              <i className="ri-check-line text-white text-[10px]"></i>
            )}
          </button>
        </div>
      </div>
    </button>
  );
}
