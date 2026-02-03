/**
 * API 工具函数
 * 用于统一处理开发环境和生产环境的 API URL
 */

/**
 * 检查是否在开发环境
 */
export const isDevelopment = (): boolean => {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname.includes('127.0.0.1')
  );
};

/**
 * 构建 API URL
 * @param originalUrl 原始 API URL（开发环境使用）
 * @param proxyPath 代理路径（生产环境使用，例如：/api/fund-ranking）
 * @param params 查询参数（可选，如果原始 URL 已包含参数则传空对象）
 * @returns 根据环境返回正确的 URL
 */
export const buildApiUrl = (
  originalUrl: string,
  proxyPath: string,
  params?: Record<string, string> | URLSearchParams
): string => {
  if (isDevelopment()) {
    // 开发环境：直接使用原始 URL
    if (params) {
      const urlObj = new URL(originalUrl);
      if (params instanceof URLSearchParams) {
        params.forEach((value, key) => {
          urlObj.searchParams.append(key, value);
        });
      } else {
        Object.entries(params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, value);
        });
      }
      return urlObj.toString();
    }
    return originalUrl;
  } else {
    // 生产环境：使用代理路径
    const urlObj = new URL(proxyPath, window.location.origin);
    if (params) {
      if (params instanceof URLSearchParams) {
        params.forEach((value, key) => {
          urlObj.searchParams.append(key, value);
        });
      } else {
        Object.entries(params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, value);
        });
      }
    }
    const apiUrl = urlObj.pathname + urlObj.search;
    console.log('📡 使用代理 API:', apiUrl, '当前域名:', window.location.hostname);
    return apiUrl;
  }
};

/**
 * 构建 JSONP API URL（用于 script.src）
 * @param originalUrl 原始 API URL（开发环境使用）
 * @param proxyPath 代理路径（生产环境使用）
 * @param params 查询参数
 * @returns 根据环境返回正确的 URL
 */
export const buildJsonpApiUrl = (
  originalUrl: string,
  proxyPath: string,
  params: Record<string, string> | URLSearchParams
): string => {
  return buildApiUrl(originalUrl, proxyPath, params);
};
