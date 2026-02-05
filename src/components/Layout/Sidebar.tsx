import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import 'remixicon/fonts/remixicon.css';

export function Sidebar() {
  const { currentView, setCurrentView, tasks, resetAllData } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 统计任务状态
  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    generating: tasks.filter((t) => t.status === 'generating').length,
    reviewing: tasks.filter((t) => t.status === 'reviewing').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  const navItems = [
    {
      id: 'workspace' as const,
      icon: 'ri-brush-line',
      label: '生图工作区',
    },
    {
      id: 'gallery' as const,
      icon: 'ri-gallery-line',
      label: '图库',
    },
    {
      id: 'templates' as const,
      icon: 'ri-file-list-3-line',
      label: '提示词模板',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar bg-bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <i className="ri-eye-line text-accent"></i>
          蔡司 AI 生图
        </h1>
        <p className="text-xs text-text-secondary mt-1">配镜参数说明图生成工具</p>
      </div>

      {/* 导航 */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentView === item.id
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 任务统计 */}
      <div className="p-4 border-t border-border">
        <h3 className="text-xs text-text-secondary mb-3 uppercase tracking-wider">
          任务进度
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-bg-primary rounded-lg p-2 text-center">
            <div className="text-lg font-mono text-text-primary">{stats.pending}</div>
            <div className="text-xs text-text-secondary">待处理</div>
          </div>
          <div className="bg-bg-primary rounded-lg p-2 text-center">
            <div className="text-lg font-mono text-warning">{stats.generating}</div>
            <div className="text-xs text-text-secondary">生成中</div>
          </div>
          <div className="bg-bg-primary rounded-lg p-2 text-center">
            <div className="text-lg font-mono text-accent">{stats.reviewing}</div>
            <div className="text-xs text-text-secondary">待确认</div>
          </div>
          <div className="bg-bg-primary rounded-lg p-2 text-center">
            <div className="text-lg font-mono text-success">{stats.completed}</div>
            <div className="text-xs text-text-secondary">已完成</div>
          </div>
        </div>

        {/* 重置按钮 */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full mt-3 px-3 py-2 text-xs text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <i className="ri-refresh-line"></i>
          重置所有数据
        </button>
      </div>

      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <ConfirmDialog
          title="重置所有数据"
          message="确定要重置所有数据吗？这将清除所有图库图片和缓存数据。"
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </aside>
  );
}
