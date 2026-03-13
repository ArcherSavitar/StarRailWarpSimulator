import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局组件
 * 包含 Header、MainContent、Footer 结构
 * 使用深色主题背景 (#0D1117)
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Header */}
      <header className="bg-[#161B22] border-b border-gray-700 py-3 px-4 sm:py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#FFD700]">
            星穹铁道抽卡模拟器
          </h1>
          <span className="text-xs sm:text-sm text-gray-400">
            Honkai: Star Rail Warp Simulator
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#161B22] border-t border-gray-700 py-4 px-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          仅供学习交流使用，不涉及商业盈利
        </div>
      </footer>
    </div>
  );
}
