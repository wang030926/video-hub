<template>
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <h1 class="logo">VideoHub</h1>
        <p class="tagline">你的私人视频仓库</p>
      </div>
    </header>

    <main class="main">
      <VideoUpload @uploaded="onVideoUploaded" />
      <VideoGallery
        ref="galleryRef"
        :videos="videos"
        :loading="loading"
        @delete="onVideoDeleted"
      />
    </main>

    <footer class="footer">
      <p>VideoHub &copy; 2026</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import VideoUpload from "./components/VideoUpload.vue";
import VideoGallery from "./components/VideoGallery.vue";

const videos = ref([]);
const loading = ref(true);
const galleryRef = ref(null);

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

function onVideoUploaded(video) {
  videos.value.unshift(video);
}

async function onVideoDeleted(filename) {
  try {
    await fetch("/api/videos/" + filename, { method: "DELETE" });
    videos.value = videos.value.filter((v) => v.filename !== filename);
  } catch (e) {
    console.error("Failed to delete video:", e);
  }
}

onMounted(fetchVideos);
</script>
