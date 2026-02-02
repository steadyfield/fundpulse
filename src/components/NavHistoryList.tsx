import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { fetchFundNavHistoryList, NavHistoryListItem } from '../api/eastmoney';
import { useDetailStore } from '../store/detailStore';

interface NavHistoryListProps {
  fundCode: string;
}

export function NavHistoryList({ fundCode }: NavHistoryListProps) {
  const [historyList, setHistoryList] = useState<NavHistoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 每页10条

  useEffect(() => {
    if (!fundCode) return;

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 获取最近20条数据
        const data = await fetchFundNavHistoryList(fundCode, 1, 20);
        setHistoryList(data);
      } catch (err) {
        console.error('加载历史净值失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [fundCode]);

  // 分页数据
  const totalPages = Math.ceil(historyList.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = historyList.slice(startIndex, endIndex);

  if (isLoading && historyList.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-tertiary">
          <i className="ri-loader-4-line animate-spin inline-block mr-2" />
          正在加载历史净值...
        </div>
      </div>
    );
  }

  if (error && historyList.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <i className="ri-error-warning-line text-4xl text-red-400 mb-4 block" />
        <div className="text-text-secondary mb-2">加载失败</div>
        <div className="text-sm text-text-tertiary">{error}</div>
      </div>
    );
  }

  if (historyList.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <i className="ri-file-list-line text-4xl text-text-tertiary mb-4 block" />
        <div className="text-text-secondary">暂无历史净值数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/30 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-text-secondary font-medium text-xs uppercase tracking-wider">
                  日期
                </th>
                <th className="px-4 py-3 text-right text-text-secondary font-medium text-xs uppercase tracking-wider">
                  单位净值
                </th>
                <th className="px-4 py-3 text-right text-text-secondary font-medium text-xs uppercase tracking-wider">
                  累计净值
                </th>
                <th className="px-4 py-3 text-right text-text-secondary font-medium text-xs uppercase tracking-wider">
                  日增长率
                </th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium text-xs uppercase tracking-wider">
                  申购状态
                </th>
                <th className="px-4 py-3 text-center text-text-secondary font-medium text-xs uppercase tracking-wider">
                  赎回状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentData.map((item, index) => (
                <tr
                  key={`${item.date}-${index}`}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-text-primary font-mono">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {item.nav > 0 ? item.nav.toFixed(4) : '--'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {item.accNav > 0 ? item.accNav.toFixed(4) : '--'}
                  </td>
                  <td
                    className={clsx(
                      'px-4 py-3 text-right font-mono',
                      item.dailyGrowth > 0
                        ? 'text-up'
                        : item.dailyGrowth < 0
                        ? 'text-down'
                        : 'text-text-primary'
                    )}
                  >
                    {item.dailyGrowth !== 0 ? (
                      <>
                        {item.dailyGrowth > 0 ? '+' : ''}
                        {item.dailyGrowth.toFixed(2)}%
                      </>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary text-xs">
                    {item.purchaseStatus || '--'}
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary text-xs">
                    {item.redemptionStatus || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              'active:scale-95',
              currentPage === 1
                ? 'bg-white/5 text-text-tertiary cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/15 active:bg-white/20'
            )}
          >
            <i className="ri-arrow-left-line mr-1" />
            上一页
          </button>
          <div className="text-sm text-text-secondary px-4">
            第 {currentPage} / {totalPages} 页
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              'active:scale-95',
              currentPage === totalPages
                ? 'bg-white/5 text-text-tertiary cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/15 active:bg-white/20'
            )}
          >
            下一页
            <i className="ri-arrow-right-line ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
