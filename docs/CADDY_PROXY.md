# Caddy 反向代理配置说明

## 📋 概述

使用 Caddy 替代 Nginx，同时提供：

1. **静态文件服务**：提供前端应用
2. **API 反向代理**：代理所有 EastMoney API，设置正确的 Referer 绕过防盗链

## 📡 代理的 API 列表

所有 API 都使用统一的公共函数 `buildJsonpApiUrl` 来处理环境检测：

- **开发环境**（localhost/127.0.0.1）：直接调用原始 API
- **生产环境**：使用 Caddy 代理路径

### 1. 基金排行榜 API

- **原始 URL**: `https://fund.eastmoney.com/data/rankhandler.aspx`
- **代理路径**: `/api/fund-ranking`
- **文件**: `src/api/fundRanking.ts`

### 2. 基金历史净值列表 API

- **原始 URL**: `https://api.fund.eastmoney.com/f10/lsjz`
- **代理路径**: `/api/fund-nav-history`
- **文件**: `src/api/eastmoney.ts` → `fetchFundNavHistoryList`

### 3. 基金实时估值 API

- **原始 URL**: `https://fundgz.1234567.com.cn/js/{code}.js`
- **代理路径**: `/api/fund-realtime/{code}.js`
- **文件**: `src/api/eastmoney.ts` → `fetchFundRealtime`

### 4. 基金净值趋势数据 API（pingzhongdata）

- **原始 URL**: `https://fund.eastmoney.com/pingzhongdata/{code}.js`
- **代理路径**: `/api/fund-pingzhongdata/{code}.js`
- **文件**: `src/api/eastmoney.ts` → `fetchFundHistory`, `fetchFundBasicInfoFromPingzhong`, `fetchFundOverviewData`

### 5. 基金详情和持仓 API（FundArchivesDatas）

- **原始 URL**: `https://fundf10.eastmoney.com/FundArchivesDatas.aspx`
- **代理路径**: `/api/fund-archives`
- **文件**: `src/api/eastmoney.ts` → `fetchFundBasicInfo`, `fetchHoldingsBasic`

## 🔧 配置说明

### Caddyfile 配置

所有 API 代理配置都在 `Caddyfile` 中，主要配置如下：

```caddy
# API 代理：基金排行榜接口
handle /api/fund-ranking* {
    uri replace /api/fund-ranking /data/rankhandler.aspx
    reverse_proxy https://fund.eastmoney.com {
        header_up Referer "https://fund.eastmoney.com/"
        header_up Host "fund.eastmoney.com"
        header_down -X-Frame-Options
        header_down -X-XSS-Protection
    }
}

# API 代理：基金历史净值接口
handle /api/fund-nav-history* {
    uri replace /api/fund-nav-history /f10/lsjz
    reverse_proxy https://api.fund.eastmoney.com {
        header_up Referer "https://fund.eastmoney.com/"
        header_up Host "api.fund.eastmoney.com"
        header_down -X-Content-Type-Options
        header_down -X-Frame-Options
        header_down -X-XSS-Protection
    }
}

# API 代理：基金实时估值接口
handle /api/fund-realtime/* {
    uri replace /api/fund-realtime /js
    reverse_proxy https://fundgz.1234567.com.cn {
        header_up Referer "https://fund.eastmoney.com/"
        header_up Host "fundgz.1234567.com.cn"
        header_down -X-Content-Type-Options
        header_down -X-Frame-Options
        header_down -X-XSS-Protection
    }
}

# API 代理：基金净值趋势数据接口（pingzhongdata）
handle /api/fund-pingzhongdata/* {
    uri replace /api/fund-pingzhongdata /pingzhongdata
    reverse_proxy https://fund.eastmoney.com {
        header_up Referer "https://fund.eastmoney.com/"
        header_up Host "fund.eastmoney.com"
        header_down -X-Content-Type-Options
        header_down -X-Frame-Options
        header_down -X-XSS-Protection
    }
}

# API 代理：基金详情和持仓接口（FundArchivesDatas）
handle /api/fund-archives* {
    uri replace /api/fund-archives /FundArchivesDatas.aspx
    reverse_proxy https://fundf10.eastmoney.com {
        header_up Referer "https://fund.eastmoney.com/"
        header_up Host "fundf10.eastmoney.com"
        header_down -X-Content-Type-Options
        header_down -X-Frame-Options
        header_down -X-XSS-Protection
    }
}
```

### 工作原理

1. **前端请求**：根据环境自动选择 URL

   - 开发环境：直接调用原始 API（如 `https://fund.eastmoney.com/data/rankhandler.aspx?op=ph&...`）
   - 生产环境：使用代理路径（如 `/api/fund-ranking?op=ph&...`）

2. **Caddy 处理**（仅生产环境）：

   - `uri replace` 重写路径前缀
   - 保留查询参数
   - 代理到原始 API 服务器

3. **设置 Headers**：
   - `Referer: https://fund.eastmoney.com/` - 绕过防盗链
   - `Host: {原始域名}` - 确保服务器识别正确的域名
   - 移除 `X-Content-Type-Options` - 允许 JSONP 执行（某些 API 需要）

### 前端代码修改

所有 API 调用都使用公共工具函数 `buildJsonpApiUrl`（位于 `src/utils/apiUtils.ts`）：

```typescript
import { buildJsonpApiUrl } from '../utils/apiUtils';

// 示例：基金排行榜 API
const getApiUrl = () => {
  return buildJsonpApiUrl(
    'https://fund.eastmoney.com/data/rankhandler.aspx',
    '/api/fund-ranking',
    params
  );
};

// 示例：历史净值 API
const url = buildJsonpApiUrl(
  'https://api.fund.eastmoney.com/f10/lsjz',
  '/api/fund-nav-history',
  { callback: callbackName, fundCode: code, ... }
);
```

**公共函数说明**：

- `isDevelopment()`: 检测是否在开发环境
- `buildJsonpApiUrl(originalUrl, proxyPath, params)`: 根据环境返回正确的 URL
  - 开发环境：返回完整的原始 URL（包含查询参数）
  - 生产环境：返回代理路径（包含查询参数）

## 🚀 部署

### Dockerfile 变更

```dockerfile
FROM caddy:2-alpine

RUN mkdir -p /usr/share/caddy/fundpulse
COPY --from=builder /app/dist /usr/share/caddy/fundpulse
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t fundpulse:latest .

# 运行容器
docker run -d \
  --name fundpulse \
  -p 8080:80 \
  --restart unless-stopped \
  fundpulse:latest
```

## ✅ 优势

1. **简单配置**：Caddy 配置比 Nginx 更简洁
2. **自动 HTTPS**：Caddy 支持自动 HTTPS（如果配置域名）
3. **统一服务**：静态文件和 API 代理在同一服务中
4. **绕过限制**：通过设置正确的 Referer 绕过防盗链

## 🔍 测试

### 本地测试

```bash
# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 测试 API 代理
curl "http://localhost:8080/api/fund-ranking?op=ph&dt=kf&ft=all&sc=1nzf&st=desc&pi=1&pn=10"
```

### 生产环境测试

1. 访问应用：`https://your-domain.com/fundpulse/`
2. 打开浏览器开发者工具 → Network
3. 查看排行榜请求是否通过 `/api/fund-ranking` 代理
4. 检查响应是否成功（不再返回 "无访问权限"）

## 📝 注意事项

1. **开发环境**：仍然直接调用原始 API，避免本地开发时的代理复杂性
2. **生产环境**：自动使用代理，设置正确的 Referer
3. **JSONP 支持**：Caddy 透明代理 JSONP 响应，无需特殊处理
4. **缓存策略**：API 响应不缓存，确保数据实时性

## 🐛 故障排查

### 问题：API 仍然返回 404

**检查**：

1. Caddyfile 中的路径匹配是否正确
2. `uri strip_prefix` 是否正确移除前缀
3. 查询参数是否正确传递

**调试**：

```bash
# 进入容器
docker exec -it fundpulse sh

# 查看 Caddy 日志
cat /var/log/caddy/access.log
```

### 问题：仍然返回 "无访问权限"

**检查**：

1. `header_up Referer` 是否正确设置
2. `header_up Host` 是否正确设置
3. 服务器端是否还有其他验证机制

**解决方案**：

- 检查 Caddyfile 配置
- 查看浏览器 Network 面板中的请求 Headers
- 确认代理是否正常工作
