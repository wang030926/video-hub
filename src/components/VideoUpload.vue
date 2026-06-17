<template>
  <section class="upload-section">
    <div
      class="upload-zone"
      :class="{ dragging, uploading }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div v-if="!uploading" class="upload-content">
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <h3>拖拽视频到此处，或点击上传</h3>
        <p class="upload-hint">支持 MP4、WebM、MOV、AVI 等格式，最大 500MB</p>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="file-input"
          @change="onFileSelect"
        />
      </div>

      <div v-else class="upload-progress">
        <div class="spinner"></div>
        <p>正在上传 "{{ uploadingName }}"...</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ uploadProgress }}%</p>
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
    <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
  </section>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["uploaded"]);

const fileInput = ref(null);
const dragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadingName = ref("");
const error = ref("");
const successMsg = ref("");

function onDrop(e) {
  dragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
}

function onFileSelect(e) {
  const file = e.target.files[0];
  if (file) uploadFile(file);
}

async function uploadFile(file) {
  error.value = "";
  successMsg.value = "";

  if (file.size > 500 * 1024 * 1024) {
    error.value = "文件大小超过 500MB 限制";
    return;
  }

  uploading.value = true;
  uploadingName.value = file.name;
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append("video", file);

  try {
    const xhr = new XMLHttpRequest();

    const result = await new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Upload failed: " + xhr.status));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error")));
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });

    emit("uploaded", result);
    successMsg = '"' + file.name + '" 上传成功！';
    setTimeout(() => (successMsg.value = ""), 3000);
  } catch (e) {
    error.value = "上传失败: " + e.message;
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    if (fileInput.value) fileInput.value.value = "";
  }
}
</script>
