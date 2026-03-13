import { useWarpStore, banners } from '../store/warpStore';

/**
 * 卡池选择器组件
 * 显示卡池列表，点击切换当前卡池
 */
export function BannerSelector() {
  const currentBannerId = useWarpStore(state => state.currentBannerId);
  const switchBanner = useWarpStore(state => state.switchBanner);

  const getBannerTypeLabel = (type: string) => {
    return type === 'character' ? '角色' : '武器';
  };

  const getBannerCategoryLabel = (category: string) => {
    switch (category) {
      case 'event': return '活动';
      case 'standard': return '常驻';
      case 'newcomer': return '新手';
      default: return category;
    }
  };

  return (
    <div className="bg-[#161B22] rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-200">选择卡池</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {banners.map(banner => (
          <button
            key={banner.id}
            onClick={() => switchBanner(banner.id)}
            className={`
              p-3 rounded-lg text-left transition-all duration-200
              border-2
              ${currentBannerId === banner.id
                ? 'border-[#FFD700] bg-[#FFD700]/10'
                : 'border-gray-700 hover:border-gray-600 bg-[#0D1117]'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{banner.name}</div>
                <div className="text-sm text-gray-400">
                  {getBannerTypeLabel(banner.type)} · {getBannerCategoryLabel(banner.category)}
                </div>
              </div>
              {currentBannerId === banner.id && (
                <span className="text-[#FFD700] text-sm">当前</span>
              )}
            </div>
            {banner.rateUp5Star.length > 0 && banner.category === 'event' && (
              <div className="mt-2 text-xs text-gray-400">
                <span className="text-[#F2C94C]">UP: </span>
                {banner.rateUp5Star.join(', ')}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
