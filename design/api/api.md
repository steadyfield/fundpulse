## 基金基本信息

> https://fundgz.1234567.com.cn/js/161725.js?rt=1770039840989

```json
jsonpgz({
    "fundcode": "161725",
    "name": "招商中证白酒指数(LOF)A",
    "jzrq": "2026-01-30",
    "dwjz": "0.7121",
    "gsz": "0.7254",
    "gszzl": "1.87",
    "gztime": "2026-02-02 15:00"
});

```

这是**天天基金网**的实时估值接口，返回的是单只基金的最新数据。以下是每个字段的详细解释：

---

## 字段对照表

**表格**复制

| 字段       | 含义                                | 示例值                     | 说明                         |
| :--------- | :---------------------------------- | :------------------------- | :--------------------------- |
| `fundcode` | **基金代码**                        | `"161725"`                 | 唯一标识符                   |
| `name`     | **基金名称**                        | `"招商中证白酒指数(LOF)A"` | 完整名称含类型               |
| `dwjz`     | **单位净值** (Previous NAV)         | `"0.7121"`                 | **昨日收盘**的单位净值       |
| `jzrq`     | **净值日期** (NAV Date)             | `"2026-01-30"`             | `dwjz` 对应的日期（通常T-1） |
| `gsz`      | **估算净值** (Estimated NAV)        | `"0.7254"`                 | **实时估算**的当前净值       |
| `gszzl`    | **估算涨跌幅** (Estimated Change %) | `"1.87"`                   | 相比昨日净值的涨跌百分比     |
| `gztime`   | **估值时间** (Estimate Time)        | `"2026-02-02 15:00"`       | 数据更新时间                 |

---

## 计算逻辑

复制

```
估算涨跌幅(gszzl) = (估算净值(gsz) - 单位净值(dwjz)) / 单位净值(dwjz) × 100%

验证： (0.7254 - 0.7121) / 0.7121 × 100% = 1.867% ≈ 1.87%
```

---

## 使用场景

### 1. 显示今日实时收益

**JavaScript**复制

```javascript
const fund = {
  fundcode: "161725",
  name: "招商中证白酒指数(LOF)A",
  dwjz: "0.7121", // 昨日净值
  gsz: "0.7254", // 实时估算
  gszzl: "1.87", // 涨跌幅
  gztime: "2026-02-02 15:00",
};

// 判断涨跌状态
const isPositive = parseFloat(fund.gszzl) > 0;
const isNegative = parseFloat(fund.gszzl) < 0;

// 颜色（iOS风格）
const color = isPositive ? "#34C759" : isNegative ? "#FF3B30" : "#8E8E93";
```

### 2. 计算用户持仓收益

**JavaScript**复制

```javascript
// 假设用户持有数据
const userHolding = {
  fundcode: "161725",
  shares: 1000, // 持有份额
  cost: 0.7, // 成本价
};

// 今日实时市值
const marketValue = parseFloat(fund.gsz) * userHolding.shares; // 725.4元

// 今日预估盈亏
const todayProfit =
  (parseFloat(fund.gsz) - parseFloat(fund.dwjz)) * userHolding.shares;
// (0.7254 - 0.7121) × 1000 = 13.3元

// 累计盈亏（从成本算）
const totalProfit =
  (parseFloat(fund.gsz) - userHolding.cost) * userHolding.shares;
// (0.7254 - 0.70) × 1000 = 25.4元
```

---

## ⚠️ 重要注意事项
