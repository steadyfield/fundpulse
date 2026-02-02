# FundPulse 算法文档

本文档详细说明了 FundPulse 中基金数据计算的核心算法和逻辑。

## 目录

1. [数据源说明](#数据源说明)
2. [盘中/盘后数据逻辑](#盘中盘后数据逻辑)
3. [今日盈亏计算](#今日盈亏计算)
4. [累计收益计算](#累计收益计算)
5. [数据更新机制](#数据更新机制)

---

## 数据源说明

### 实时估算数据（盘中/盘后）

**接口**: `https://fundgz.1234567.com.cn/js/{code}.js`

**返回字段**:

- `gsz`: 实时估算净值（当前时刻的估算净值）
- `gszzl`: 估算涨跌幅（%）
- `dwjz`: 昨日收盘净值（前一交易日的正式净值）
- `gztime`: 估值时间

**使用场景**:

- 交易时间内（9:30-15:00）
- 收盘后至正式净值公布前（15:00-19:00）

### 正式净值数据（日终）

**接口**: `https://fund.eastmoney.com/pingzhongdata/{code}.js`

**返回数据**: `Data_netWorthTrend` 数组

**数据结构**:

```typescript
{
  x: number;        // 时间戳（毫秒）
  y: number;        // 净值
  equityReturn?: number; // 涨跌幅（%）
}
```

**使用场景**:

- 正式净值公布后（19:00 后）
- 历史数据查询

---

## 盘中/盘后数据逻辑

FundPulse 根据当前时间自动选择合适的数据源：

### 时间判断函数

```typescript
// 交易时间：9:30-11:30, 13:00-15:00
isTradingHours(): boolean

// 收盘后但未公布正式净值：15:00-19:00
isAfterClose(): boolean

// 正式净值已公布：19:00后
isOfficialNavAvailable(): boolean
```

### 数据选择逻辑

| 时间段      | 数据源   | 净值字段                      | 涨跌幅字段     | 状态标签           |
| ----------- | -------- | ----------------------------- | -------------- | ------------------ |
| 9:30-15:00  | 实时估算 | `gsz`                         | `gszzl`        | "实时估算 · HH:MM" |
| 15:00-19:00 | 收盘估算 | `gsz`                         | `gszzl`        | "收盘估算 · 15:00" |
| 19:00 后    | 正式净值 | `Data_netWorthTrend` 最后一条 | `equityReturn` | "X 月 X 日净值"    |

### 实现代码

核心逻辑位于 `src/utils/fundDataManager.ts` 的 `mergeFundData` 函数：

```typescript
// 判断是否应该使用实时数据
const shouldUseRealtime = isTradingHours() || isAfterClose();

if (shouldUseRealtime) {
  // 使用实时估算数据
  const realtimeData = await fetchFundRealtime(fundCode);
  return {
    netValue: realtimeData.estimateNav, // gsz
    changePercent: realtimeData.estimateGrowth, // gzzl
    previousNav: realtimeData.nav, // dwjz
    isRealtime: true,
    dataSource: "realtime",
  };
} else {
  // 使用正式净值
  const latestOfficial = getLatestOfficialNav(trendData);
  return {
    netValue: latestOfficial.y,
    changePercent: latestOfficial.equityReturn || 0,
    previousNav: getPreviousCloseNav(trendData),
    isRealtime: false,
    dataSource: "official",
  };
}
```

---

## 今日盈亏计算

### 计算公式

```
今日盈亏 = (当前净值 - 昨日收盘净值) × 持有份额
```

### 参数说明

- **当前净值**:

  - 盘中/盘后：实时估算净值（`gsz`）
  - 日终：今日正式净值（`Data_netWorthTrend` 最后一条的 `y`）

- **昨日收盘净值**:

  - 盘中/盘后：`dwjz`（实时接口返回）
  - 日终：`Data_netWorthTrend` 倒数第二条的 `y`

- **持有份额**: 用户输入的持仓份额

### 实现代码

```typescript
export const calculateTodayProfit = (
  netValue: number, // 当前净值
  previousNav: number, // 昨日收盘净值
  userShares: number // 持有份额
): number => {
  if (!netValue || !previousNav || !userShares) return 0;
  return (netValue - previousNav) * userShares;
};
```

### 示例

假设：

- 昨日收盘净值：1.0000
- 当前净值（实时估算）：1.0150
- 持有份额：10000

计算：

```
今日盈亏 = (1.0150 - 1.0000) × 10000 = 150.00 元
```

---

## 累计收益计算

### 计算公式

```
累计收益 = (当前净值 - 成本价) × 持有份额
```

### 参数说明

- **当前净值**:

  - 盘中/盘后：实时估算净值（`gsz`）
  - 日终：今日正式净值（`Data_netWorthTrend` 最后一条的 `y`）

- **成本价**: 用户输入的持仓成本价（买入时的净值）

- **持有份额**: 用户输入的持仓份额

### 实现代码

```typescript
export const calculateTotalProfit = (
  netValue: number, // 当前净值
  userCost: number, // 成本价
  userShares: number // 持有份额
): number => {
  if (!netValue || !userCost || !userShares) return 0;
  return (netValue - userCost) * userShares;
};
```

### 示例

假设：

- 成本价：0.9500（买入时的净值）
- 当前净值（实时估算）：1.0150
- 持有份额：10000

计算：

```
累计收益 = (1.0150 - 0.9500) × 10000 = 650.00 元
累计收益率 = (1.0150 - 0.9500) / 0.9500 × 100% = 6.84%
```

---

## 数据更新机制

### 缓存策略

为了避免频繁请求，`mergeFundData` 实现了缓存机制：

- **缓存时长**: 5 分钟
- **缓存键**: 基金代码
- **缓存内容**: `Data_netWorthTrend` 历史数据

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 检查缓存
const cached = netWorthTrendCache.get(fundCode);
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  trendData = cached.data;
}
```

### 请求队列

为了避免全局变量冲突，`fetchNetWorthTrend` 使用请求队列：

- 同一时间只有一个请求在处理
- 每个基金的数据独立处理
- 深拷贝数据，避免引用全局变量

### 数据更新频率

- **实时数据**: 每 30 秒自动刷新（可配置）
- **历史数据**: 缓存 5 分钟，避免频繁请求
- **手动刷新**: 点击刷新按钮立即更新

### 数据保留策略

- **获取失败**: 保留上次成功的数据，不清零
- **临时无效**: 使用 `FlipNumber` 组件保留最后有效值
- **异步加载**: 使用后备数据（`fund.estimateNav || fund.nav`）避免显示 0

---

## 注意事项

1. **时区处理**: 所有时间判断基于本地时区（中国时区 UTC+8）

2. **周末处理**: 周末不交易，`isTradingHours()` 返回 `false`

3. **数据一致性**:

   - 同一基金的所有计算使用相同的数据源
   - 今日盈亏和累计收益都使用 `mergeFundData` 返回的统一数据

4. **错误处理**:

   - API 请求失败时保留旧数据
   - 数据格式错误时返回 `null`，不清零显示

5. **性能优化**:
   - 使用缓存减少 API 请求
   - 使用请求队列避免并发冲突
   - 深拷贝数据避免引用问题

---

## 参考文档

- [API 文档](./api/api.md)
- [盈亏计算说明](../design/v2.0.1/yk.md)
