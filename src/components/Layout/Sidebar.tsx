import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ZeissLogo } from '../ui/ZeissLogo';
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

  const total = tasks.length;
  const completedPercent = total > 0 ? Math.round((stats.completed / total) * 100) : 0;

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  const navItems = [
    {
      id: 'workspace' as const,
      icon: 'ri-brush-line',
      label: '生图工作区',
      desc: '创建说明图',
    },
    {
      id: 'gallery' as const,
      icon: 'ri-gallery-line',
      label: '图库',
      desc: '管理已生成图片',
    },
    {
      id: 'templates' as const,
      icon: 'ri-file-list-3-line',
      label: '提示词模板',
      desc: '管理提示词',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar glass border-r border-border flex flex-col z-30 noise">
      {/* Logo 区域 */}
      <div className="p-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <ZeissLogo size={48} />
            {/* Logo 背景光晕 */}
            <div className="absolute -inset-2 bg-zeiss-blue/8 rounded-2xl blur-xl -z-10" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-text-primary tracking-tight font-display leading-tight">
              ZEISS AI
            </h1>
            <p className="text-[10px] text-text-tertiary tracking-wider uppercase mt-0.5">
              配镜参数说明图
            </p>
          </div>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 p-3 pt-4">
        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-medium px-3 mb-2">
          导航
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm transition-all duration-200 group relative ${
                  currentView === item.id
                    ? 'bg-accent/15 text-accent border border-accent/25'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent'
                }`}
              >
                {/* 选中左侧竖条 */}
                {currentView === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentView === item.id
                    ? 'bg-accent/20'
                    : 'bg-bg-primary group-hover:bg-bg-elevated'
                }`}>
                  <i className={`${item.icon} text-base`}></i>
                </div>
                <div className="text-left">
                  <div className="font-medium text-[14px] leading-tight">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${
                    currentView === item.id ? 'text-accent/60' : 'text-text-tertiary'
                  }`}>{item.desc}</div>
                </div>
                {currentView === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 任务进度 */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-medium">
            任务进度
          </p>
          <span className="text-xs font-mono text-accent font-medium">{completedPercent}%</span>
        </div>

        {/* 进度条 */}
        <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
            style={{ width: `${completedPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { value: stats.pending, label: '待处理', color: 'text-text-secondary' },
            { value: stats.generating, label: '生成中', color: 'text-warning' },
            { value: stats.reviewing, label: '待确认', color: 'text-accent-light' },
            { value: stats.completed, label: '已完成', color: 'text-success' },
          ].map((item) => (
            <div key={item.label} className="bg-bg-primary rounded-lg p-2 text-center">
              <div className={`text-base font-mono font-semibold ${item.color}`}>{item.value}</div>
              <div className="text-[9px] text-text-tertiary mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 重置按钮 */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full mt-3 px-3 py-2 text-xs text-text-tertiary hover:text-error hover:bg-error/8 rounded-btn transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <i className="ri-refresh-line text-[14px]"></i>
          重置数据
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