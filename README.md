# 🗺️ 奥维地图 Google 源代理 v2.0.6

Cloudflare Worker 代理服务，解决 `mt1.google.com` 无法访问的问题。

**当前版本**: v2.0.6 (2024-03-09)  
**仓库**: https://github.com/miaouai/ov-google-proxy

---

## ✅ 已验证可用

- ✅ **自动检测域名** - 配置页自动填充当前 Worker 域名
- ✅ **三种地图类型** - 卫星图、街道图、混合图完整配置
- ✅ **实时测试功能** - 页面直接显示测试瓦片，验证代理状态
- ✅ 支持 Google 卫星图 (`lyrs=s`)
- ✅ 支持 Google 街道图 (`lyrs=m`)
- ✅ 支持 Google 混合图 (`lyrs=y`)
- ✅ URL 模板格式：`/vt/lyrs=s@699&hl=zh-CN&gl=cn&src=app&x={$x}&y={$y}&z={$z}&s=`

---

## 🚀 快速使用

### 1️⃣ 访问配置页面

直接访问你的 Worker 域名即可获取配置：

```
https://your-worker.workers.dev/
```

页面将显示：
- 自动检测的当前域名
- **实时测试地图**（x=1, y=1, z=1 的全球概览图）
- 三个完整的 XML 配置文件
- 详细的导入步骤说明

### 2️⃣ 验证代理状态

页面顶部会显示一张 **测试地图图片**（世界地图，缩放级别 1）：
- ✅ **如果能看到地图** → 代理正常工作
- ❌ **如果显示空白/错误** → 检查 Worker 部署状态

### 3️⃣ 复制并导入配置

选择需要的地图类型，复制对应的 XML 配置：
1. 全选 XML 代码框内容
2. 奥维地图 → **系统** → **导入对象** → **从文本导入**
3. 粘贴配置，确定
4. 在图层列表启用对应地图

---

## 📋 技术详情

| 参数 | 值 |
|------|-----|
| **服务器地址** | 你的 Worker 域名 (自动检测) |
| **URL 模板** | `/vt/lyrs=s@699&hl=zh-CN&gl=cn&src=app&x={$x}&y={$y}&z={$z}&s=` |
| **支持的 lyrs** | `s` (卫星), `m` (街道), `y` (混合) |
| **最大缩放级别** | 28 |
| **坐标系** | Web Mercator (EPSG:3857) |
| **瓦片尺寸** | 256×256 像素 |

---

## 🔧 部署到 Cloudflare Workers

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 部署项目
cd /app/working/overvier-google-proxy
wrangler deploy
```

部署后获得类似 `https://your-name.workers.dev` 的地址。

---

## 📜 版本历史

### v2.0.6 (2024-03-09) - **当前最新版**
- ✅ **新增实时测试地图** - 页面显示 x=1,y=1,z=1 的世界地图，直观验证代理状态
- ✅ **自动检测域名** - 所有配置自动填充当前 Worker 域名，无需手动修改
- ✅ **三种地图完整配置** - 卫星/街道/混合图各自独立的 XML 配置卡片
- ✅ **优化界面布局** - 响应式网格设计，移动端友好
- ✅ **隐私保护** - 无硬编码域名，完全动态生成

### v2.0.5 (2024-03-09)
- ✅ 根路径直接返回 HTML 配置页面（无需 `/copy` 后缀）
- ✅ 路由逻辑优化，代理路由优先级最高

### v2.0.4 (2024-03-09)
- ✅ 简化为纯配置模板模式
- ✅ 移除复制按钮和二维码功能
- ✅ 清晰的导入步骤说明

### v2.0.3 (2024-03-09)
- ✅ 使用验证成功的 URL 模板格式
- ✅ Base64 编码修复

### v2.0.0 (2024-03-09)
- ✅ 修复代理路径 (`/vt` 替代 `/maps/vt`)
- ✅ 支持三种地图类型

---

## ❓ 常见问题

**Q: 页面上看不到测试地图？**  
A: 检查 Worker 是否正确部署，尝试刷新页面或查看浏览器控制台 (F12) 的错误信息。

**Q: 导入后显示"No Data"？**  
A: 确保 `<host>` 字段只包含域名（不含 `https://`），新版已自动处理。

**Q: 如何知道代理是否成功？**  
A: 页面顶部的**测试地图**（世界地图小图）如果能正常显示，就说明代理工作正常！

**Q: 切换不同类型的地图？**  
A: 三个配置可同时导入，在奥维地图左侧图层列表中切换使用。

---

## 🧪 测试命令

```bash
# 测试根路径（应返回 HTML）
curl -I "https://your-worker.workers.dev/"

# 测试瓦片代理（应返回图片）
curl -I "https://your-worker.workers.dev/vt?lyrs=s&x=1&y=1&z=1"

# 验证配置中的域名
curl -s "https://your-worker.workers.dev/" | grep "location.hostname"
```

---

**项目地址**: https://github.com/miaouai/ov-google-proxy  
**在线演示**: https://miaouai.github.io/ov-google-proxy/
