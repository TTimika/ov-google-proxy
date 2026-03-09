# 🗺️ 奥维地图 Google 源代理

Cloudflare Worker 代理服务，解决 `mt1.google.com` 无法访问的问题，让奥维地图可以正常加载 Google 地图数据。

## ✅ 已修复问题

**v2.0.0 (2024-03-09)**:
- ✅ **修复代理路径**: 现在正确支持 `/vt?...` 格式 (之前错误的 `/maps/vt`)
- ✅ **Base64 编码修复**: 二维码 hn/ul 参数使用正确的 Base64 编码
- ✅ **三种地图源全部支持**: Hybrid(y)/Satellite(s)/Road(m)

## 🚀 支持的地图类型

| 类型 | lyrs 参数 | URL 示例 | 状态 |
|------|----------|---------|------|
| **Google Hybrid** (混合) | `y` | `/vt?lyrs=y&x={$x}&y={$y}&z={$z}` | ✅ 已测试 |
| **Google Satellite** (卫星) | `s` | `/vt?lyrs=s&x={$x}&y={$y}&z={$z}` | ✅ 已测试 |
| **Google Road** (街道) | `m` | `/vt?lyrs=m&x={$x}&y={$y}&z={$z}` | ✅ 已测试 |

**💡 核心原理**: 只需要把原 URL 中的 `mt1.google.com` 替换为你的 Worker 域名即可！

```
原始：https://mt1.google.com/vt?lyrs=m&x=1&y=1&z=1
代理：https://your-worker.workers.dev/vt?lyrs=m&x=1&y=1&z=1
```

## 📋 快速开始

### 方式一：GitHub Pages (最简单)

1. 访问：**https://miaouai.github.io/ov-google-proxy/**
2. 点击「📋 复制 XML 配置」按钮
3. 在奥维地图中导入配置

### 方式二：自建 Cloudflare Worker (推荐)

```bash
cd /app/working/overvier-google-proxy
npm install -g wrangler
wrangler login
wrangler deploy
```

部署后获得类似 `https://ov-google-proxy.xxx.workers.dev` 的个人专用地址

## 📱 使用方法

### 步骤 1: 获取配置

访问你的 Worker 域名，你会看到：
- XML 配置文件（可一键复制）
- 二维码（手机扫码自动导入）

### 步骤 2: 导入到奥维地图

**方法 A - XML 文件导入:**
1. 复制 XML 配置
2. 奥维地图 → 系统设置 → 导入对象 → 从文本导入
3. 粘贴并确认

**方法 B - 二维码扫描:**
1. 打开奥维地图的扫一扫功能
2. 扫描二维码
3. 自动导入配置

### 步骤 3: 验证是否成功

在奥维地图中选择"谷歌街道"图层，如果能正常显示地图，说明配置成功！

## 🔧 技术细节

### 代理路径设计

Worker 会拦截以下所有请求并转发到 mt1.google.com:

```
/vt?lyrs=m&x=1&y=1&z=1          ✅ 直接/vt 路径
/maps/vt?lyrs=m&x=1&y=1&z=1     ✅ /maps/vt 路径  
/mt1/vt?lyrs=m&x=1&y=1&z=1      ✅ /mt1/vt 路径
```

所有路径都会被标准化为 `https://mt1.google.com/vt?...` 并返回响应。

### 二维码参数说明

生成的二维码格式：
```
ovobj?t=37&id=202&na=...&hn={Base64} &ul={Base64}
```

- `hn`: Base64 编码的 Worker 域名
- `ul`: Base64 编码的 URL 模板 (`/vt?lyrs=m&x={$x}&y={$y}&z={$z}`)

**重要**: hn 和 ul 必须是 Base64 编码，不是 URL Encode！

### XML 配置示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
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
  <host>your-worker.workers.dev</host>
  <group>谷歌官方</group>
  <port>443</port>
  <url>/vt?lyrs=m&x={$x}&y={$y}&z={$z}</url>
</customMapSource>
```

修改 `lyrs` 参数可以切换地图类型：
- `lyrs=m` → 街道图
- `lyrs=s` → 卫星图  
- `lyrs=y` → 混合图

## 🎯 路由设计

| 路径 | 功能 |
|------|------|
| `/` | XML 配置下载 |
| `/copy` 或 `/gui` | GUI 配置页面 |
| `/vt*` | 地图瓦片代理 (核心) |
| `/maps/*` | 地图瓦片代理 |
| `/mt1/*` | 地图瓦片代理 |

## ⚠️ 注意事项

1. **Cloudflare 免费额度**: 每月 10 万次请求，个人使用足够
2. **缓存策略**: 瓦片图片会自动缓存 24 小时，减少重复请求
3. **隐私安全**: 所有请求通过 Cloudflare 中转，不暴露真实 IP

## 📝 常见问题

**Q: 地图加载不出来？**
A: 检查 Worker 是否正确部署，查看控制台日志是否有错误

**Q: 如何切换到卫星图？**
A: 修改 XML 中的 `<url>/vt?lyrs=s&x={$x}&y={$y}&z={$z}</url>`，将 m 改为 s

**Q: 二维码扫描失败？**
A: 检查 hn 和 ul 参数是否是 Base64 编码（可以在浏览器控制台 F12 查看调试信息）

## 🔄 更新日志

### v2.0.0 (2024-03-09)
- ✅ 修复代理路径：/vt 替代 /maps/vt
- ✅ 修复二维码 Base64 编码
- ✅ 支持所有三种地图类型

### v1.0.0 (2024-03-09)
- ✨ 初始版本发布

---

*项目地址*: https://github.com/miaouai/ov-google-proxy  
*在线演示*: https://miaouai.github.io/ov-google-proxy/
