import { useWarpStore } from '../store/warpStore';

/**
 * 统计面板组件
 * 显示抽卡统计数据
 */
export function StatsPanel() {
  const stats = useWarpStore(state => state.stats);
  const currentBannerId = useWarpStore(state => state.currentBannerId);

  const currentBannerStats = stats.bannerStats[currentBannerId];
  const pullsInCurrentBanner = currentBannerStats?.pulls || 0;
  const fiveStarsInBanner = currentBannerStats?.fiveStars || 0;
  const fourStarsInBanner = currentBannerStats?.fourStars || 0;

  // 计算概率
  const fiveStarRate = stats.totalPulls > 0
    ? ((stats.totalFiveStars / stats.totalPulls) * 100).toFixed(2)
    : '0.00';
  const fourStarRate = stats.totalPulls > 0
    ? ((stats.totalFourStars / stats.totalPulls) * 100).toFixed(2)
    : '0.00';

  const bannerFiveStarRate = pullsInCurrentBanner > 0
    ? ((fiveStarsInBanner / pullsInCurrentBanner) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="bg-[#161B22] rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">统计</h2>

      {/* 总体统计 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-[#0D1117] rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.totalPulls}</div>
          <div className="text-xs text-gray-400">总抽数</div>
        </div>
        <div className="text-center p-3 bg-[#0D1117] rounded-lg">
          <div className="text-2xl font-bold text-[#F2C94C]">{stats.totalFiveStars}</div>
          <div className="text-xs text-gray-400">5星</div>
        </div>
        <div className="text-center p-3 bg-[#0D1117] rounded-lg">
          <div className="text-2xl font-bold text-[#BB6BD9]">{stats.totalFourStars}</div>
          <div className="text-xs text-gray-400">4星</div>
        </div>
      </div>

      {/* 概率统计 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-[#0D1117] rounded-lg">
          <div className="text-lg font-bold text-white">{fiveStarRate}%</div>
          <div className="text-xs text-gray-400">5星概率</div>
        </div>
        <div className="text-center p-3 bg-[#0D1117] rounded-lg">
          <div className="text-lg font-bold text-white">{fourStarRate}%</div>
          <div className="text-xs text-gray-400">4星概率</div>
        </div>
      </div>

      {/* 当前卡池统计 */}
      <div className="border-t border-gray-700 pt-4">
        <div className="text-sm text-gray-400 mb-2">当前卡池</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-white">{pullsInCurrentBanner}</div>
            <div className="text-xs text-gray-500">抽数</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#F2C94C]">{fiveStarsInBanner}</div>
            <div className="text-xs text-gray-500">5星</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#BB6BD9]">{fourStarsInBanner}</div>
            <div className="text-xs text-gray-500">4星</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{bannerFiveStarRate}%</div>
            <div className="text-xs text-gray-500">5星率</div>
          </div>
        </div>
      </div>
    </div>
  );
}
