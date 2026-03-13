import { useWarpStore } from '../store/warpStore';

/**
 * 抽卡按钮组件
 * 单抽和十连按钮
 */
export function PullButtons() {
  const pull = useWarpStore(state => state.pull);
  const isPulling = useWarpStore(state => state.isPulling);

  const handleSinglePull = () => {
    if (!isPulling) {
      pull(1);
    }
  };

  const handleTenPull = () => {
    if (!isPulling) {
      pull(10);
    }
  };

  return (
    <div className="bg-[#161B22] rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">抽卡</h2>
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleSinglePull}
          disabled={isPulling}
          className={`
            px-8 py-3 rounded-lg font-medium text-lg
            transition-all duration-200
            ${isPulling
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-[#BB6BD9] hover:bg-[#9B4DCA] text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isPulling ? '抽卡中...' : '单抽'}
        </button>
        <button
          onClick={handleTenPull}
          disabled={isPulling}
          className={`
            px-8 py-3 rounded-lg font-medium text-lg
            transition-all duration-200
            ${isPulling
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-[#FFD700] hover:[#E6C200] text-black shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isPulling ? '抽卡中...' : '十连'}
        </button>
      </div>
    </div>
  );
}
