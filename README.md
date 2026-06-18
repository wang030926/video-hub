# VideoHub - 视频仓库

一个基于 Vue 3 + Express 的个人视频上传与展示网站。

## 功能

- 📤 拖拽或点击上传视频文件
- 🎬 视频网格展示，支持在线播放
- 📊 实时上传进度条
- 🗑️ 视频删除功能
- 📱 响应式设计，支持移动端

## 技术栈

- **前端**: Vue 3 + Vite
- **后端**: Express
- **文件上传**: Multer
- **样式**: 原生 CSS

## 快速开始

```bash
# 安装依赖
npm install

# 启动后端服务器 (端口 3001)
npm run server

# 另一个终端，启动前端开发服务器 (端口 5173)
npm run dev
```

然后在浏览器打开 http://localhost:5173

## 项目结构

```
├── server.js          # Express 后端服务器
├── src/
│   ├── App.vue        # 主组件
│   ├── main.js        # 入口文件
│   ├── style.css      # 全局样式
│   └── components/
│       ├── VideoUpload.vue   # 上传组件
│       └── VideoGallery.vue  # 视频画廊组件
├── public/
│   └── videos/        # 上传的视频存储目录
└── vite.config.js     # Vite 配置 (含 API 代理)
测试阶段，仅供个人测试
```
