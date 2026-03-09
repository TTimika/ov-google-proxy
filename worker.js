// Cloudflare Worker for OviMap Google Map Proxy
// 代理 mt1.google.com 的所有请求
// 
// Version: v2.0.7 (2024-03-09)
// Changelog:
//   v2.0.7 - 使用 Workers Sites 服务 static HTML，只负责路由代理
//   v2.0.6 - 自动获取域名，生成三种地图类型完整配置表格，新增实时测试地图
//   v2.0.5 - 根路径直接返回 HTML 配置页面
//   v2.0.4 - 简化界面为纯配置模板模式，移除复制和二维码功能
//   v2.0.3 - 优化导入配置，使用验证成功的 URL 模板格式
//   v2.0.2 - 修复 host 字段，去除 https:// 前缀；支持更多 URL 参数格式
//   v2.0.1 - 添加版本号标识，修复路由匹配逻辑
//   v2.0.0 - 修复代理路径 (/vt), Base64 编码二维码，支持三种地图源
//   v1.0.0 - 初始版本

const GOOGLE_MAP_URL = 'https://mt1.google.com';

async function handleProxyRequest(request) {
  const url = new URL(request.url);
  
  let targetPath = url.pathname;
  let searchParams = url.search;
  
  // 标准化路径
  if (targetPath.startsWith('/maps/vt')) {
    targetPath = targetPath.substring('/maps'.length);
  } else if (targetPath.startsWith('/mt1/vt')) {
    targetPath = targetPath.substring('/mt1'.length);
  }
  
  const targetUrl = `${GOOGLE_MAP_URL}${targetPath}${searchParams}`;
  
  console.log(`[v2.0.7 Proxy] ${request.method} ${targetPath}${searchParams}`);
  
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
        'Referer': 'https://www.google.com/maps',
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      }
    });
    
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      headers: headers
    });
  } catch (error) {
    console.error('[Proxy Error]', error);
    return new Response(`Proxy error: ${error.message}`, { 
      status: 502,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    console.log(`[v2.0.7] ${request.method} ${pathname}`);
    
    // 🎯 瓦片代理路由（优先级最高）
    if (pathname.startsWith('/vt') || pathname.startsWith('/maps/') || pathname.startsWith('/mt1/')) {
      console.log(`[v2.0.7] 代理路由 -> Google`);
      return handleProxyRequest(request);
    }
    
    // 🎯 所有其他路径返回静态 HTML（由 Workers Sites 提供）
    console.log(`[v2.0.7] 返回静态文件`);
    return env.ASSETS.fetch(request);
  }
};
