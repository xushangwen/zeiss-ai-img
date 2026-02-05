import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { TaskList } from './components/TaskPanel/TaskList';
import { ReferenceUpload } from './components/WorkArea/ReferenceUpload';
import { PromptEditor } from './components/WorkArea/PromptEditor';
import { ThumbnailGrid } from './components/WorkArea/ThumbnailGrid';
import { FinalImage } from './components/WorkArea/FinalImage';
import { TemplateList } from './components/TemplateManager/TemplateList';
import { Gallery } from './components/ImageGallery/Gallery';
import { useStore } from './stores/useStore';
import 'remixicon/fonts/remixicon.css';

function App() {
  const { currentView, currentTaskId } = useStore();

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
                  <div className="grid grid-cols-2 gap-6 h-full">
                    {/* 左列：参考图 + 提示词编辑 + 图片生成 */}
                    <div className="flex flex-col gap-4">
                      <ReferenceUpload />
                      <PromptEditor />
                      <ThumbnailGrid />
                    </div>

                    {/* 右列：选中图片展示 */}
                    <div className="flex flex-col gap-4">
                      <FinalImage />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                    <i className="ri-cursor-line text-5xl mb-4"></i>
                    <p className="text-lg">请从左侧选择一个任务开始</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'gallery' && <Gallery />}

          {currentView === 'templates' && <TemplateList />}
        </main>
      </div>
    </div>
  );
}

export default App;
