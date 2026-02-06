import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { TaskList } from './components/TaskPanel/TaskList';
import { ReferenceUpload } from './components/WorkArea/ReferenceUpload';
import { PromptEditor } from './components/WorkArea/PromptEditor';
import { ThumbnailGrid } from './components/WorkArea/ThumbnailGrid';
import { FinalImage } from './components/WorkArea/FinalImage';
import { TemplateList } from './components/TemplateManager/TemplateList';
import { Gallery } from './components/ImageGallery/Gallery';
import { ToastContainer } from './components/ui/ToastContainer';
import { ZeissLogo } from './components/ui/ZeissLogo';
import { useStore } from './stores/useStore';
import 'remixicon/fonts/remixicon.css';

function App() {
  const { currentView, currentTaskId, toasts, removeToast } = useStore();

  return (
    <div className="h-full flex">
      {/* 左侧导航 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 ml-sidebar flex flex-col">
        <Header />

        <main className="flex-1 overflow-hidden">
          {currentView === 'workspace' && (
            <div className="h-full flex">
              {/* 任务列表 */}
              <TaskList />

              {/* 工作区 */}
              <div className="flex-1 p-6 overflow-y-auto">
                {currentTaskId ? (
                  <div className="grid grid-cols-2 gap-5 h-full animate-fade-in">
                    {/* 左列：参考图 + 提示词编辑 */}
                    <div className="flex flex-col gap-4">
                      <ReferenceUpload />
                      <PromptEditor />
                    </div>

                    {/* 右列：图片生成 + 选中图片展示 */}
                    <div className="flex flex-col gap-4">
                      <ThumbnailGrid />
                      <FinalImage />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                    {/* 空状态 - 品牌感设计 */}
                    <div className="relative mb-8">
                      <div className="w-28 h-28 rounded-3xl bg-bg-card border border-border flex items-center justify-center">
                        <ZeissLogo size={56} />
                      </div>
                      {/* 装饰光效 */}
                      <div className="absolute -inset-4 bg-zeiss-blue/8 rounded-[2rem] blur-2xl -z-10"></div>
                    </div>
                    <p className="text-base text-text-secondary font-medium mb-2">选择任务开始创作</p>
                    <p className="text-xs text-text-tertiary">从左侧任务清单中选择一个任务</p>
                    <div className="flex items-center gap-2 mt-6 text-[12px] text-text-tertiary">
                      <div className="w-8 h-px bg-border"></div>
                      <span>ZEISS AI Image Generator</span>
                      <div className="w-8 h-px bg-border"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'gallery' && <Gallery />}

          {currentView === 'templates' && <TemplateList />}
        </main>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
