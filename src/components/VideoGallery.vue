<template>
  <section class="gallery-section">
    <h2 class="gallery-title">我的视频 <span v-if="videos.length" class="count">({{ videos.length }})</span></h2>

    <div v-if="loading" class="gallery-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!videos.length" class="gallery-empty">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
      <p>还没有视频，上传第一个吧！</p>
    </div>

    <div v-else class="video-grid">
      <div
        v-for="video in videos"
        :key="video.filename"
        class="video-card"
      >
        <video
          :src="video.path"
          class="video-player"
          controls
          preload="metadata"
        ></video>
        <div class="video-info">
          <p class="video-name" :title="video.filename">{{ video.filename }}</p>
          <div class="video-meta">
            <span class="video-size">{{ formatSize(video.size) }}</span>
            <span class="video-date">{{ formatDate(video.uploadedAt) }}</span>
          </div>
        </div>
        <button class="delete-btn" title="删除视频" @click="$emit('delete', video.filename)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  videos: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["delete"]);

function formatSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return month + "/" + day + " " + hour + ":" + min;
}
</script>
