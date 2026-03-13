import { useWarpStore } from '../store/warpStore';
import { getBannerConfig } from '../utils/constants';
import { banners } from '../store/warpStore';

/**
 * 保底计数器组件
 * 显示5星和4星保底进度
 */
export function PityCounter() {
  const pityState = useWarpStore(state => state.pityState);
  const currentBannerId = useWarpStore(state => state.currentBannerId);

  const currentBanner = banners.find(b => b.id === currentBannerId);
  const config = currentBanner ? getBannerConfig(currentBanner.type, currentBanner.category) : null;

  if (!config) return null;

  const fiveStarPity = pityState.fiveStarPity;
  const fourStarPity = pityState.fourStarPity;
  const fiveStarProgress = (fiveStarPity / config.fiveStarPity) * 100;
  const fourStarProgress = (fourStarPity / config.fourStarPity) * 100;

  const isFiveStarNearPity = fiveStarPity >= 70;
  const isFiveStarAtPity = fiveStarPity >= config.fiveStarPity;
  const isFourStarNearPity = fourStarPity >= 8;

  return (
    <div className="bg-[#161B22] rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">保底进度</h2>

      {/* 5星保底 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">
            5星保底
            {pityState.isGuaranteedUP && (
              <span className="ml-2 text-[#F2C94C]">(大保底)</span>
            )}
          </span>
          <span className={isFiveStarAtPity ? 'text-[#F2C94C]' : 'text-gray-400'}>
            {fiveStarPity} / {config.fiveStarPity}
          </span>
        </div>
        <div className="h-3 bg-[#0D1117] rounded-full overflow-hidden">
          <div
            className={`
              h-full transition-all duration-300
              ${isFiveStarAtPity ? 'bg-[#F2C94C]' : isFiveStarNearPity ? 'bg-orange-500' : 'bg-[#BB6BD9]'}
            `}
            style={{ width: `${Math.min(fiveStarProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* 4星保底 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">
            4星保底
            {pityState.isFourStarGuaranteedUP && (
              <span className="ml-2 text-[#BB6BD9]">(保底)</span>
            )}
          </span>
          <span className="text-gray-400">
            {fourStarPity} / {config.fourStarPity}
          </span>
        </div>
        <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
          <div
            className={`
              h-full transition-all duration-300
              ${isFourStarNearPity ? 'bg-[#BB6BD9]' : 'bg-gray-600'}
            `}
            style={{ width: `${Math.min(fourStarProgress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
