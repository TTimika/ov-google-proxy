# 🗺️ 奥维地图 Google 源代理

Cloudflare Worker 代理服务，解决 `mt1.google.com` 无法访问的问题，让奥维地图可以正常加载 Google 地图数据。

## 🚀 功能特性

- ✅ **Google 地图瓦片代理** - 代理 mt1.google.com 的地图请求
- ✅ **一键配置生成** - 自动生成奥维地图 XML 配置文件
- ✅ **剪贴板复制** - 一键复制配置到剪贴板
- ✅ **二维码导入** - 生成二维码，手机扫码自动导入配置
- ✅ **无需额外费用** - Cloudflare Worker 免费额度够用

## 📋 部署步骤

### 1. 安装 Cloudflare Wrangler

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 部署到 Cloudflare

```bash
cd /app/working/overvier-google-proxy
wrangler deploy
```

### 4. 获取 Worker 域名

部署完成后，Wrangler 会显示你的 Worker 域名，例如：
```
https://ov-google-proxy.xxx.workers.dev
```

## 📱 使用方法

### 方式一：XML 配置导入

1. 访问 Worker 域名：`https://your-worker-id.workers.dev`
2. 点击「📋 复制 XML 配置」按钮
3. 打开奥维地图
4. 系统设置 → 导入对象 → 选择「从文本导入」
5. 粘贴配置的 XML 内容
6. 确认导入

### 方式二：二维码扫码

1. 访问 Worker 域名
2. 点击「📱 显示二维码」
3. 打开奥维地图的扫一扫功能
4. 扫描二维码自动导入配置

### 方式三：直接链接

在奥维地图中直接添加自定义地图源：

- **服务器地址**: `https://your-worker-id.workers.dev`
- **URL 模板**: `/maps/vt?lyrs=m&x={$x}&y={$y}&z={$z}`

## 🔧 配置说明

生成的 XML 配置如下：

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
  <host>your-worker-id.workers.dev</host>
  <group>谷歌官方</group>
  <port>443</port>
  <url>/maps/vt?lyrs=m&x={$x}&y={$y}&z={$z}</url>
</customMapSource>
```

## 📊 二维码参数说明

奥维地图二维码格式：
```
ovobj?t=37&id=202&na=...&hn=服务器地址&ul=...
```

- `t=37`: 类型标识（自定义地图源）
- `id=202`: 地图 ID
- `na`: 地图名称（Base64 编码）
- `hn`: 主机地址（Base64 编码）
- `ul`: URL 模板（Base64 编码）

## 🛠️ 技术实现

### Cloudflare Worker 路由

| 路径 | 功能 |
|------|------|
| `/` 或 `/config` | 返回 XML 配置文件 |
| `/copy` 或 `/gui` | 图形化配置页面 |
| `/qr` | 二维码配置页面 |
| `/maps/vt` | 地图瓦片代理 |

### 代理逻辑

Worker 会拦截所有 `/maps/vt` 路径的请求，将其转发到 `https://mt1.google.com/maps/vt`，然后返回原始响应。

## ⚠️ 注意事项

1. **Cloudflare 免费额度**:每月 10 万次请求，足够个人使用
2. **缓存策略**: Worker 会自动缓存地图瓦片，减少请求次数
3. **隐私**: 所有请求通过 Cloudflare 中转，不会暴露你的真实 IP

## 📝 更新日志

### v1.0.0 (2024-03-09)
- ✨ 初始版本发布
- ✨ 支持 Google 地图瓦片代理
- ✨ 支持 XML 配置生成
- ✨ 支持二维码导入

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
