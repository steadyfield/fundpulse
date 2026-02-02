import { useState } from 'react';
import clsx from 'clsx';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string | React.ReactNode;
}

const faqData: FAQItem[] = [
  // 基金基础知识
  {
    id: 'fund-basics-1',
    category: '基础知识',
    question: '什么是基金？',
    answer: '基金是一种集合投资工具，由基金管理公司募集资金，由专业基金经理进行投资管理。投资者购买基金份额，享受基金投资收益，同时承担相应风险。',
  },
  {
    id: 'fund-basics-2',
    category: '基础知识',
    question: '基金有哪些类型？',
    answer: (
      <div className="space-y-2">
        <p><strong>按投资标的分类：</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>股票型基金</strong>：主要投资股票，风险较高，收益潜力大</li>
          <li><strong>债券型基金</strong>：主要投资债券，风险较低，收益相对稳定</li>
          <li><strong>混合型基金</strong>：同时投资股票和债券，风险和收益介于两者之间</li>
          <li><strong>货币型基金</strong>：主要投资短期货币市场工具，风险极低，流动性好</li>
          <li><strong>指数型基金</strong>：跟踪特定指数，如沪深300、中证500等</li>
        </ul>
        <p className="mt-2"><strong>按运作方式分类：</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>开放式基金</strong>：可随时申购赎回</li>
          <li><strong>封闭式基金</strong>：有固定存续期，期间不能赎回</li>
          <li><strong>LOF基金</strong>：上市型开放式基金，可在交易所交易</li>
          <li><strong>ETF基金</strong>：交易型开放式指数基金，可在交易所买卖</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'fund-basics-3',
    category: '基础知识',
    question: '什么是基金净值？',
    answer: '基金净值是指每份基金份额对应的资产价值。计算公式为：基金净值 = 基金总资产 / 基金总份额。基金净值每天更新一次，通常在交易日晚上公布。',
  },
  {
    id: 'fund-basics-4',
    category: '基础知识',
    question: '什么是实时估算净值？',
    answer: '实时估算净值是基金公司在交易时间内根据基金持仓和股票实时价格估算的净值。由于基金持仓可能不完全公开，估算净值与实际净值可能存在差异，仅供参考。',
  },
  
  // 概念解释
  {
    id: 'concept-1',
    category: '概念解释',
    question: '什么是涨跌幅？',
    answer: '涨跌幅是指基金净值相对于前一交易日的变动百分比。计算公式为：涨跌幅 = (当前净值 - 昨日净值) / 昨日净值 × 100%。正数表示上涨，负数表示下跌。',
  },
  {
    id: 'concept-2',
    category: '概念解释',
    question: '什么是持有份额？',
    answer: '持有份额是指您持有的基金份数。当您申购基金时，会根据申购金额和当日净值计算出您获得的份额。例如：申购10000元，当日净值1.0000，则获得10000份。',
  },
  {
    id: 'concept-3',
    category: '概念解释',
    question: '什么是成本价？',
    answer: '成本价是指您买入基金时的净值，用于计算累计收益。如果您分批买入，可以计算平均成本价。成本价是衡量投资盈亏的重要参考指标。',
  },
  {
    id: 'concept-4',
    category: '概念解释',
    question: '什么是持有金额？',
    answer: '持有金额是指您当前持有的基金市值，计算公式为：持有金额 = 当前净值 × 持有份额。持有金额会随着基金净值的变化而变化。',
  },
  {
    id: 'concept-5',
    category: '概念解释',
    question: '盘中、盘后、日终是什么意思？',
    answer: (
      <div className="space-y-2">
        <p><strong>盘中（9:30-15:00）</strong>：交易时间内，使用实时估算净值计算盈亏。</p>
        <p><strong>盘后（15:00-19:00）</strong>：收盘后但正式净值未公布前，使用收盘估算净值。</p>
        <p><strong>日终（19:00后）</strong>：正式净值公布后，使用准确的正式净值进行计算。</p>
        <p className="text-text-tertiary text-sm mt-2">FundPulse 会根据当前时间自动选择合适的数据源，确保计算的准确性。</p>
      </div>
    ),
  },
  
  // 盈亏计算
  {
    id: 'calculation-1',
    category: '盈亏计算',
    question: '今日盈亏是如何计算的？',
    answer: (
      <div className="space-y-3">
        <p><strong>计算公式：</strong></p>
        <div className="bg-white/5 rounded-lg p-3 font-mono text-sm">
          今日盈亏 = (当前净值 - 昨日收盘净值) × 持有份额
        </div>
        <p><strong>示例：</strong></p>
        <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm">
          <p>假设：</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>昨日收盘净值：1.0000</li>
            <li>当前净值（实时估算）：1.0150</li>
            <li>持有份额：10000 份</li>
          </ul>
          <p className="mt-2">计算：</p>
          <p className="font-mono">今日盈亏 = (1.0150 - 1.0000) × 10000 = 150.00 元</p>
        </div>
        <p className="text-text-tertiary text-sm">
          <strong>注意：</strong>盘中使用实时估算净值，日终使用正式净值。FundPulse 会自动选择合适的数据源。
        </p>
      </div>
    ),
  },
  {
    id: 'calculation-2',
    category: '盈亏计算',
    question: '累计收益是如何计算的？',
    answer: (
      <div className="space-y-3">
        <p><strong>计算公式：</strong></p>
        <div className="bg-white/5 rounded-lg p-3 font-mono text-sm">
          累计收益 = (当前净值 - 成本价) × 持有份额
        </div>
        <p><strong>累计收益率：</strong></p>
        <div className="bg-white/5 rounded-lg p-3 font-mono text-sm">
          累计收益率 = (当前净值 - 成本价) / 成本价 × 100%
        </div>
        <p><strong>示例：</strong></p>
        <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm">
          <p>假设：</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>成本价：0.9500（买入时的净值）</li>
            <li>当前净值：1.0150</li>
            <li>持有份额：10000 份</li>
          </ul>
          <p className="mt-2">计算：</p>
          <p className="font-mono">累计收益 = (1.0150 - 0.9500) × 10000 = 650.00 元</p>
          <p className="font-mono">累计收益率 = (1.0150 - 0.9500) / 0.9500 × 100% = 6.84%</p>
        </div>
        <p className="text-text-tertiary text-sm">
          <strong>注意：</strong>累计收益反映的是从买入到现在的总盈亏，不受每日波动影响。
        </p>
      </div>
    ),
  },
  {
    id: 'calculation-3',
    category: '盈亏计算',
    question: '为什么我的盈亏和支付宝显示的不一样？',
    answer: (
      <div className="space-y-2">
        <p>可能的原因：</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>数据源不同</strong>：FundPulse 使用实时估算净值，支付宝可能使用不同的数据源</li>
          <li><strong>计算时点不同</strong>：盘中、盘后、日终的数据会有差异</li>
          <li><strong>成本价设置</strong>：请确认您输入的持仓成本价和份额是否正确</li>
          <li><strong>手续费差异</strong>：部分平台会扣除手续费，FundPulse 显示的是净值盈亏</li>
        </ul>
        <p className="text-text-tertiary text-sm mt-2">
          <strong>建议：</strong>在日终（19:00后）对比正式净值，此时数据最准确。
        </p>
      </div>
    ),
  },
  {
    id: 'calculation-4',
    category: '盈亏计算',
    question: '数据多久更新一次？',
    answer: (
      <div className="space-y-2">
        <p><strong>自动更新：</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>实时数据：每30秒自动刷新（可在设置中调整）</li>
          <li>历史数据：缓存5分钟，避免频繁请求</li>
        </ul>
        <p className="mt-2"><strong>手动更新：</strong></p>
        <p className="ml-4">点击导航栏的刷新按钮，立即更新所有数据。</p>
        <p className="text-text-tertiary text-sm mt-2">
          <strong>注意：</strong>频繁刷新可能影响性能，建议使用自动更新功能。
        </p>
      </div>
    ),
  },
  
  // 使用技巧
  {
    id: 'tips-1',
    category: '使用技巧',
    question: '如何添加基金到自选？',
    answer: (
      <div className="space-y-2">
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>进入"自选"页面</li>
          <li>点击"+ 添加基金"按钮</li>
          <li>输入6位基金代码（如：161725）</li>
          <li>确认基金信息后，设置持仓信息（可选）</li>
          <li>完成添加</li>
        </ol>
        <p className="text-text-tertiary text-sm mt-2">
          <strong>提示：</strong>设置持仓信息后，可以查看详细的盈亏数据。
        </p>
      </div>
    ),
  },
  {
    id: 'tips-2',
    category: '使用技巧',
    question: '如何修改持仓信息？',
    answer: (
      <div className="space-y-2">
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>在自选列表中，找到要修改的基金</li>
          <li>点击"修改"按钮</li>
          <li>更新持仓金额、成本价或份额</li>
          <li>保存修改</li>
        </ol>
        <p className="text-text-tertiary text-sm mt-2">
          <strong>注意：</strong>修改持仓信息后，盈亏数据会重新计算。
        </p>
      </div>
    ),
  },
];

const categories = ['基础知识', '概念解释', '盈亏计算', '使用技巧'];

export function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(item => item.category === selectedCategory);

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-void bg-scanline pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8 sm:mb-12 pt-6 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-text-primary mb-3 sm:mb-4">
            常见问题
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
            了解基金基础知识，掌握盈亏计算方法，更好地使用 FundPulse
          </p>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setExpandedItems(new Set()); // 切换分类时收起所有项
              }}
              className={clsx(
                'px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200',
                'active:scale-95',
                selectedCategory === category
                  ? 'bg-neon-red/20 text-white shadow-[0_0_15px_rgba(255,45,85,0.3)] border border-neon-red/50'
                  : 'bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 border border-transparent'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ 列表 */}
        <div className="space-y-3 sm:space-y-4">
          {filteredFAQs.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <div
                key={item.id}
                className="glass-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-base sm:text-lg font-medium text-text-primary flex-1">
                    {item.question}
                  </span>
                  <i
                    className={clsx(
                      'ri-arrow-down-s-line text-xl sm:text-2xl text-text-secondary transition-transform duration-200 flex-shrink-0',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0">
                    <div className="border-t border-white/10 pt-4 sm:pt-5">
                      <div className="text-sm sm:text-base text-text-secondary leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 算法文档链接 */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="glass-card p-6 sm:p-8 inline-block">
            <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3">
              想了解更多技术细节？
            </h3>
            <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-5">
              查看详细的算法文档，了解数据源、计算公式和更新机制
            </p>
            <a
              href="https://github.com/lighting-ai/fundpulse/blob/main/docs/ALGORITHM.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-neon-red/20 hover:bg-neon-red/30 text-white rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95 border border-neon-red/50"
            >
              <i className="ri-file-text-line" />
              <span>查看算法文档</span>
              <i className="ri-external-link-line text-sm" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
