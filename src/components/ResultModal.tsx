import { useWarpStore } from '../store/warpStore';
import { PullRecord } from '../types';

/**
 * 抽卡结果弹窗组件
 */
export function ResultModal() {
  const showResult = useWarpStore(state => state.showResult);
  const currentResults = useWarpStore(state => state.currentResults);
  const setShowResult = useWarpStore(state => state.setShowResult);
  const pull = useWarpStore(state => state.pull);

  if (!showResult) return null;

  // 按星级排序：5星 → 4星 → 3星
  const sortedResults = [...currentResults].sort((a, b) => b.rarity - a.rarity);

  const handleClose = () => {
    setShowResult(false);
  };

  const handleTenPull = () => {
    setShowResult(false);
    setTimeout(() => pull(10), 100);
  };

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 5: return 'border-[#F2C94C] bg-[#F2C94C]/10';
      case 4: return 'border-[#BB6BD9] bg-[#BB6BD9]/10';
      default: return 'border-gray-600 bg-gray-800';
    }
  };

  const getRarityTextColor = (rarity: number) => {
    switch (rarity) {
      case 5: return 'text-[#F2C94C]';
      case 4: return 'text-[#BB6BD9]';
      default: return 'text-gray-400';
    }
  };

  const getStars = (rarity: number) => {
    return '★'.repeat(rarity);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161B22] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-center text-[#FFD700]">
            抽卡结果
          </h2>
        </div>

        {/* Results */}
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedResults.map((result, index) => (
              <div
                key={`${result.id}-${index}`}
                className={`
                  p-3 rounded-lg border-2 text-center
                  ${getRarityColor(result.rarity)}
                `}
              >
                <div className={`text-xs mb-1 ${getRarityTextColor(result.rarity)}`}>
                  {getStars(result.rarity)}
                </div>
                <div className="font-medium text-white text-sm">
                  {result.itemName}
                </div>
                {result.isRateUp && (
                  <div className="text-xs text-[#FFD700] mt-1">UP</div>
                )}
                {result.rarity === 5 && !result.isRateUp && (
                  <div className="text-xs text-red-400 mt-1">歪了</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 flex gap-3 justify-center">
          <button
            onClick={handleTenPull}
            className="px-6 py-2 bg-[#FFD700] hover:bg-[#E6C200] text-black rounded-lg font-medium"
          >
            再来十连
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
