// Cloudflare Worker for OviMap Google Map Proxy
// 将 mt1.google.com 的请求代理到可访问的源

const GOOGLE_MAP_URL = 'https://mt1.google.com';

// 奥维配置 XML 模板
const XML_CONFIG_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<customMapSource>
  <mapID>203</mapID>
  <name>谷歌街道</name>
  <version>0</version>
  <maxZoom>28</maxZoom>
  <coordType>Mercator</coordType>
  <tileType>Satellite</tileType>
  <tileFormat>JPG</tileFormat>
  <tileSize>256</tileSize>
  <protocol>https</protocol>
  <host>{WORKER_HOST}</host>
  <group>谷歌官方</group>
  <port>443</port>
  <url>/maps/vt?lyrs=m&x={$x}&y={$y}&z={$z}</url>
</customMapSource>`;

// 奥维二维码参数解析
function parseOvObjParams(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

// 解码 base64 参数 (如 hn 参数)
function decodeBase64Param(param) {
  try {
    return atob(param);
  } catch (e) {
    return param;
  }
}

// 生成奥维配置文件二维码
function generateQRCode(data) {
  // 使用 Google Charts API 生成二维码
  const encodedData = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}`;
}

async function handleXMLConfig(request, workerHost) {
  const xmlContent = XML_CONFIG_TEMPLATE.replace('{WORKER_HOST}', workerHost);
  
  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleCopyConfig(request, workerHost) {
  const xmlContent = XML_CONFIG_TEMPLATE.replace('{WORKER_HOST}', workerHost);
  
  // 返回带复制功能的 HTML
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>奥维地图 - Google 源配置</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f6f8fa;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #24292e; }
    .config-box {
      background: #f6f8fa;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      position: relative;
    }
    textarea {
      width: 100%;
      height: 200px;
      font-family: monospace;
      font-size: 12px;
      border: 1px solid #dfe2e5;
      border-radius: 4px;
      padding: 10px;
      resize: vertical;
    }
    button {
      background: #2ea44f;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px 5px;
    }
    button:hover { background: #2c974b; }
    button.secondary {
      background: #6a737d;
    }
    button.secondary:hover { background: #5a6268; }
    .qrcode-section {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #fafbfc;
      border-radius: 6px;
    }
    .qrcode-img {
      max-width: 300px;
      border: 2px solid #e1e4e8;
      border-radius: 4px;
    }
    .info {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .success {
      background: #d4edda;
      border: 1px solid #28a745;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗺️ 奥维地图 - Google 地图源配置</h1>
    
    <div class="info">
      <strong>使用说明：</strong><br>
      1. 点击「复制配置」按钮复制 XML 配置<br>
      2. 在奥维地图中：系统设置 → 导入对象 → 选择 XML 文件或直接粘贴<br>
      3. 或者扫描二维码自动导入配置
    </div>
    
    <div class="success" id="successMsg">✅ 配置已复制到剪贴板！</div>
    
    <h2>XML 配置文件</h2>
    <div class="config-box">
      <textarea id="configText">${xmlContent}</textarea>
    </div>
    
    <div style="text-align: center;">
      <button onclick="copyConfig()">📋 复制配置到剪贴板</button>
      <button class="secondary" onclick="showQRCode()">📱 显示二维码</button>
    </div>
    
    <div class="qrcode-section" id="qrSection" style="display: none;">
      <h3>📱 扫码导入配置</h3>
      <img id="qrImage" class="qrcode-img" alt="配置二维码">
      <p><small>使用奥维地图扫码功能扫描此二维码</small></p>
    </div>
    
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #e1e4e8;">
    
    <h2>🔗 直接链接</h2>
    <p><strong>配置地址：</strong><code>${workerHost}</code></p>
    <p><strong>地图瓦片地址：</strong><code>${workerHost}/maps/vt?lyrys=m&x={x}&y={y}&z={z}</code></p>
    
    <script>
      function copyConfig() {
        const text = document.getElementById('configText').value;
        navigator.clipboard.writeText(text).then(() => {
          document.getElementById('successMsg').style.display = 'block';
          setTimeout(() => {
            document.getElementById('successMsg').style.display = 'none';
          }, 3000);
        }).catch(err => {
          alert('复制失败，请手动复制');
          console.error(err);
        });
      }
      
      function showQRCode() {
        const qrData = 'ovobj?t=37&id=202&na=6auY5b635Y2r5pif5Zu_&po=0&vr=1&pn=1&mt=1&mf=3&hs=1&he=4&oy=1&df=211,16777215,211,16777215&hn=${encodeURIComponent(workerHost)}&ul=L2FwcG1hcHRpbilee3N5bX0meT17JHl9Jno9eyR6fQ';
        const qrUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + encodeURIComponent(qrData);
        document.getElementById('qrImage').src = qrUrl;
        document.getElementById('qrSection').style.display = 'block';
      }
    </script>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleQRCodeConfig(request, workerHost) {
  // 解析二维码数据并生成页面
  const url = new URL(request.url);
  const data = url.searchParams.get('data');
  
  if (!data) {
    return new Response('缺少二维码数据参数', { status: 400 });
  }
  
  const decodedData = decodeURIComponent(data);
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>奥维地图 - 二维码配置</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f6f8fa;
      text-align: center;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    img {
      max-width: 300px;
      border: 2px solid #e1e4e8;
      border-radius: 4px;
    }
    .info {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      text-align: left;
    }
    code {
      background: #f6f8fa;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 奥维地图配置二维码</h1>
    <img src="https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(decodedData)}" alt="配置二维码">
    
    <div class="info">
      <strong>使用方法：</strong><br>
      1. 打开奥维地图<br>
      2. 点击「扫一扫」功能<br>
      3. 扫描此二维码即可自动导入配置
    </div>
    
    <h3>二维码数据：</h3>
    <p><code>${decodedData}</code></p>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

async function handleProxyRequest(request, workerHost) {
  const url = new URL(request.url);
  
  // 替换 Google 地图请求
  let targetUrl = '';
  
  if (url.pathname.startsWith('/maps/vt')) {
    // 地图瓦片请求
    targetUrl = `${GOOGLE_MAP_URL}${url.pathname}${url.search}`;
  } else if (url.pathname.startsWith('/mt1/')) {
    // mt1 请求
    targetUrl = `${GOOGLE_MAP_URL}${url.pathname}${url.search}`;
  } else {
    return new Response('Not found', { status: 404 });
  }
  
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
        'Referer': 'https://www.google.com/maps'
      }
    });
    
    // 返回原始响应内容
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(`Proxy error: ${error.message}`, { 
      status: 502,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const workerHost = url.origin;
    
    // 路由处理
    const pathname = url.pathname;
    
    // 根路径 - 返回 XML 配置
    if (pathname === '/' || pathname === '/config') {
      return handleXMLConfig(request, workerHost);
    }
    
    // 复制配置页面
    if (pathname === '/copy' || pathname === '/gui') {
      return handleCopyConfig(request, workerHost);
    }
    
    // 二维码配置页面
    if (pathname === '/qr') {
      return handleQRCodeConfig(request, workerHost);
    }
    
    // 地图瓦片代理
    if (pathname.startsWith('/maps/') || pathname.startsWith('/mt1/')) {
      return handleProxyRequest(request, workerHost);
    }
    
    // 默认返回 GUI 页面
    return handleCopyConfig(request, workerHost);
  }
};
