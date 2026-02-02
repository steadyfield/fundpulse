我知道为什么今日盈亏和累计收益计算有问题了，因为这个接口返回的是实时估算净值和估算涨跌幅
https://fundgz.1234567.com.cn/js/161725.js?rt=1770045676883

在盘中就是要用实时估算净值来计算营收，但是盘后/日终正式净值，就要用 pingzhongdata 接口的 Data_netWorthTrend 的最后一条今天的正式净值和涨跌幅 计算了

## 今日收益用哪个？

**表格**复制

| 场景              | 用哪个                     | 原因                      |
| :---------------- | :------------------------- | :------------------------ |
| **盘中实时显示**  | **0.7254** (fundgz)        | 最新估算，15:00收盘数据   |
| **盘后/历史记录** | **0.7243** (pingzhongdata) | 日终正式净值，写入数据库  |
| **画收益曲线**    | **0.7243**                 | 日K线一个点，避免盘中波动 |

---

## 关键区别

复制

```
0.7243 (pingzhongdata) = 2月2日 日终正式净值
0.7254 (fundgz)        = 2月2日 15:00 实时估算（比正式高0.0011）

差异原因：
• 估算基于持仓股票最后3分钟成交价
• 正式净值是基金清算后的准确值（通常19:00后公布）
```

**建议** ：

- **用户看今日盈亏** ：显示 `0.7254` (+1.87%)，标注"实时估算"
- **收盘后更新** ：自动替换为 `0.7243` (+1.71%)，标注"正式净值"

  **分层数据策略** ：用 `pingzhongdata` 作为 **基线** ，`fundgz` 作为 **实时覆盖层** 。

**JavaScript**复制

```javascript
// 1. 获取历史数据（pingzhongdata）
const historyData = await fetchPingzhongData(fundCode);
const lastHistory = historyData[historyData.length - 1]; // {x, y, equityReturn}

// 2. 获取实时数据（fundgz）- 仅在交易时间
const realtimeData = isTradingHours() ? await fetchFundgz(fundCode) : null;

// 3. 数据融合
const displayData = {
  // 净值：优先实时，fallback 历史
  netValue: realtimeData?.gsz ? parseFloat(realtimeData.gsz) : lastHistory.y,

  // 涨跌幅：优先实时，fallback 历史
  changePercent: realtimeData?.gszzl
    ? parseFloat(realtimeData.gszzl)
    : lastHistory.equityReturn,

  // 昨日净值（用于计算）
  previousValue:
    parseFloat(realtimeData?.dwjz) || getPreviousClose(historyData),

  // 元数据
  isRealtime: !!realtimeData,
  updateTime: realtimeData?.gztime || formatTimestamp(lastHistory.x),
  dataSource: realtimeData ? "fundgz" : "pingzhong",
};
```

---

## 关键判断逻辑

**JavaScript**复制

```javascript
// 是否在交易时间（9:30-11:30, 13:00-15:00）
const isTradingHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();

  if (day === 0 || day === 6) return false; // 周末

  const time = hour * 100 + minute;
  return (time >= 930 && time <= 1130) || (time >= 1300 && time <= 1500);
};

// 是否已收盘（15:00后，但正式净值未公布前）
const isAfterClose = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 15 && hour < 19; // 15:00-19:00 用实时估算
};
```

---

## 场景矩阵

**表格**复制

| 时间        | 数据来源                 | 显示净值 | 显示涨跌幅 | UI标注             |
| :---------- | :----------------------- | :------- | :--------- | :----------------- |
| 9:30前      | pingzhongdata (昨日收盘) | 0.7243   | +1.71%     | "昨日收盘"         |
| 9:30-15:00  | fundgz (实时估算)        | 0.725x   | +1.87%     | "实时估算 · 10:23" |
| 15:00-19:00 | fundgz (收盘估算)        | 0.7254   | +1.87%     | "收盘估算 · 15:00" |
| 19:00后     | pingzhongdata (更新正式) | 0.7243   | +1.71%     | "今日净值"         |
| 次日        | pingzhongdata            | 0.7243   | +1.71%     | "2月2日净值"       |

## 一句话总结

> **历史数据打底，实时数据覆盖，自动降级切换，UI明示状态**
