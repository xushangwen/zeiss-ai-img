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
    <div className="w-72 bg-bg-card/50 border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <i className="ri-list-check text-accent text-xs"></i>
          </div>
          任务清单
        </h3>
        <p className="text-[12px] text-text-tertiary mt-1.5 pl-8">
          共 {tasks.length} 个任务
        </p>
      </div>

      <div className="p-3 space-y-5">
        {partOrder.map((part) => {
          const partTasks = groupedTasks[part];
          if (!partTasks) return null;

          const completedCount = partTasks.filter(
            (t) => t.status === 'completed'
          ).length;

          return (
            <div key={part} className="animate-fade-in">
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest">
                  {partNames[part]}
                </h4>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-8 bg-bg-primary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / partTasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {completedCount}/{partTasks.length}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
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
