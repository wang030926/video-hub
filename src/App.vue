<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="header-left">
          <div class="logo-icon">V</div>
          <span class="logo-text">VideoHub</span>
        </div>

        <div class="header-center">
          <div class="header-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span class="search-placeholder">搜索你的视频...</span>
          </div>
        </div>

        <div class="header-right">
          <button class="header-upload-btn" @click="showUpload = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            投稿
          </button>
        </div>
      </div>
    </header>

    <!-- Upload Modal -->
    <Teleport to="body">
      <div v-if="showUpload" class="upload-overlay" @click.self="showUpload = false">
        <div class="upload-backdrop"></div>
        <div class="upload-modal">
          <div class="upload-modal-header">
            <h3>上传视频</h3>
            <button class="close-btn" @click="showUpload = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="upload-modal-body">
            <div
              class="upload-drop-zone"
              :class="{ dragging: isDragging, uploading: isUploading }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <template v-if="!isUploading">
                <div class="drop-icon-wrap">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p class="drop-title">拖拽视频到此处</p>
                <p class="drop-hint">或点击下方按钮选择文件，最大 500MB</p>
                <span class="drop-browse" @click="fileInputRef?.click()">选择文件</span>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="video/*"
                  class="file-input-hidden"
                  @change="handleFileSelect"
                />
              </template>

              <template v-else>
                <div class="upload-progress-content">
                  <div class="bili-spinner"></div>
                  <p class="uploading-file-name">正在上传 "{{ uploadingName }}"</p>
                  <div class="bili-progress-bar">
                    <div class="bili-progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <p class="progress-pct">{{ uploadProgress }}%</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <div v-if="toastMsg" class="toast" :class="toastType">{{ toastMsg }}</div>

    <!-- Main Content -->
    <main class="main">
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-text">
            <h2>你的视频仓库</h2>
            <p>在这里管理和分享你的每一支视频</p>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-num">{{ videos.length }}</div>
              <div class="hero-stat-label">视频</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">{{ totalSize }}</div>
              <div class="hero-stat-label">总大小</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <nav class="tabs-nav">
        <button class="tab-item active">全部视频</button>
        <button class="tab-item">最新发布</button>
        <button class="tab-item">最多播放</button>
      </nav>

      <!-- Video Gallery -->
      <section class="gallery-section">
        <div class="gallery-header">
          <h2>视频列表 <span v-if="videos.length" class="gallery-count">({{ videos.length }})</span></h2>
        </div>

        <div v-if="loading" class="gallery-loading">
          <div class="bili-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="!videos.length" class="gallery-empty">
          <div class="empty-icon-wrap">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <p class="empty-text">空空如也~ 快来上传第一支视频吧！</p>
          <button class="empty-upload-btn" @click="showUpload = true">立即投稿</button>
        </div>

        <div v-else class="video-grid">
          <div
            v-for="video in videos"
            :key="video.filename"
            class="video-card"
          >
            <div class="card-cover">
              <video :src="video.path" preload="metadata"></video>

              <!-- Play overlay -->
              <div class="card-play-overlay">
                <div class="play-icon-circle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                </div>
              </div>

              <!-- Duration -->
              <span class="card-duration">{{ getVideoDuration(video) }}</span>

              <!-- 3-dot menu -->
              <button class="card-more-btn" @click.stop="toggleDropdown(video.filename)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              <!-- Dropdown -->
              <div v-if="activeDropdown === video.filename" class="card-dropdown">
                <button class="danger" @click.stop="handleDelete(video.filename); activeDropdown = ''">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  删除视频
                </button>
              </div>
            </div>

            <!-- Info -->
            <div class="card-info">
              <p class="card-title">{{ video.filename }}</p>
              <div class="card-meta">
                <div class="card-meta-left">
                  <span class="card-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    {{ formatSize(video.size) }}
                  </span>
                </div>
                <span>{{ formatDate(video.uploadedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>VideoHub &copy; 2026 · 基于 Vue 3 + Express 构建</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

// ---- State ----
const videos = ref([]);
const loading = ref(true);
const showUpload = ref(false);
const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadingName = ref("");
const fileInputRef = ref(null);
const toastMsg = ref("");
const toastType = ref("success");
const activeDropdown = ref("");

let toastTimer = null;

// ---- Computed ----
const totalSize = computed(() => {
  const total = videos.value.reduce((sum, v) => sum + (v.size || 0), 0);
  return formatSize(total);
});

// ---- API ----
async function fetchVideos() {
  loading.value = true;
  try {
    const res = await fetch("/api/videos");
    videos.value = await res.json();
  } catch (e) {
    console.error("Failed to fetch videos:", e);
  } finally {
    loading.value = false;
  }
}

// ---- Upload ----
function handleDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) uploadFile(file);
}

async function uploadFile(file) {
  if (file.size > 500 * 1024 * 1024) {
    showToast("文件大小超过 500MB 限制", "error");
    return;
  }

  isUploading.value = true;
  uploadingName.value = file.name;
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append("video", file);

  try {
    const xhr = new XMLHttpRequest();
    const result = await new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) uploadProgress.value = Math.round((e.loaded / e.total) * 100);
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
        else reject(new Error("Upload failed: " + xhr.status));
      });
      xhr.addEventListener("error", () => reject(new Error("网络错误")));
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });

    videos.value.unshift(result);
    showUpload.value = false;
    showToast("视频上传成功！");
  } catch (e) {
    showToast("上传失败: " + e.message, "error");
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

// ---- Delete ----
async function handleDelete(filename) {
  try {
    await fetch("/api/videos/" + filename, { method: "DELETE" });
    videos.value = videos.value.filter((v) => v.filename !== filename);
    showToast("视频已删除");
  } catch (e) {
    showToast("删除失败", "error");
  }
}

// ---- Dropdown ----
function toggleDropdown(filename) {
  activeDropdown.value = activeDropdown.value === filename ? "" : filename;
}

function closeDropdown(e) {
  if (!e.target.closest(".card-more-btn")) {
    activeDropdown.value = "";
  }
}

// ---- Toast ----
function showToast(msg, type = "success") {
  toastMsg.value = msg;
  toastType.value = type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg.value = ""; }, 3000);
}

// ---- Helpers ----
function formatSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return diffMin + "分钟前";
  if (diffHour < 24) return diffHour + "小时前";
  if (diffDay < 7) return diffDay + "天前";

  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function getVideoDuration(video) {
  if (!video._duration) {
    video._duration = "00:00";
    const el = document.createElement("video");
    el.preload = "metadata";
    el.src = video.path;
    el.onloadedmetadata = () => {
      const m = Math.floor(el.duration / 60);
      const s = Math.floor(el.duration % 60);
      video._duration = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    };
  }
  return video._duration;
}

// ---- Lifecycle ----
onMounted(() => {
  fetchVideos();
  document.addEventListener("click", closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>