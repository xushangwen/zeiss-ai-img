import { useStore } from '../../stores/useStore';
import { TaskCard } from './TaskCard';
import { partNames } from '../../data/zeissRequirements';
import type { TaskPart } from '../../types';

export function TaskList() {
  const { tasks, currentTaskId, setCurrentTask } = useStore();

  // 按 Part 分组
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.part]) {
      acc[task.part] = [];
    }
    acc[task.part].push(task);
    return acc;
  }, {} as Record<TaskPart, typeof tasks>);

  const partOrder: TaskPart[] = [
    'pupil-distance',
    'fitting-height',
    'vertex-distance',
    'pantoscopic-tilt',
    'face-form-angle',
  ];

  return (
    <div className="w-72 bg-bg-card border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <i className="ri-list-check text-accent"></i>
          任务清单
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          共 {tasks.length} 个任务
        </p>
      </div>

      <div className="p-3 space-y-4">
        {partOrder.map((part) => {
          const partTasks = groupedTasks[part];
          if (!partTasks) return null;

          const completedCount = partTasks.filter(
            (t) => t.status === 'completed'
          ).length;

          return (
            <div key={part}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {partNames[part]}
                </h4>
                <span className="text-xs text-text-secondary font-mono">
                  {completedCount}/{partTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {partTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isSelected={task.id === currentTaskId}
                    onClick={() => setCurrentTask(task.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
