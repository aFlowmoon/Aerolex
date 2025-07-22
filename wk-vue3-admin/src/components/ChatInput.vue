<template>
  <div class="chat-input-wrapper">
    <div v-if="attachedFiles.length" class="attached-files">
      <div class="file-item" v-for="(f, idx) in attachedFiles" :key="f.name + f.size">
        <img :src="getFileIcon(f.type)" class="file-icon" />
        <div class="file-info">
          <div class="file-name">{{ f.name }}</div>
          <div class="file-size">{{ formatSize(f.size) }}</div>
        </div>
        <span class="file-remove" @click="removeFile(idx)">×</span>
      </div>
    </div>
    <div v-if="uploadProgress > 0" class="upload-progress">上传进度：{{ uploadProgress }}%</div>
    <div class="input-row">
      <input
        v-model="inputValue"
        class="chat-input"
        placeholder="请输入任何你想问的问题"
        @keyup.enter="onSend"
      />
    </div>
    <div class="action-row">
      <!-- 附件按钮 -->
      <button class="icon-btn attach-btn" @click="triggerFileInput" title="上传附件">
        <img src="@/assets/images/attachment.svg" class="icon-img" />
        <input type="file" ref="fileInput" style="display:none" @change="onFileChange" multiple />
      </button>
      <!-- 精准搜索按钮 - 可切换 -->
      <button 
        class="icon-btn precise-search-btn" 
        :class="{ 'active': isPreciseSearchActive }"
        @click="togglePreciseSearch" 
        title="精准搜索"
      >
        <img src="@/assets/images/search-law.svg" class="icon-img" />
        <span class="precise-search-text">精准搜索</span>
      </button>
      <div class="action-spacer"></div>
      <!-- 发送按钮 -->
      <button class="send-btn" @click="onSend">
        <img src="@/assets/images/send-arrow.svg" class="send-arrow" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import wordIcon from '@/assets/images/word.svg'

const inputValue = ref('')
const isPreciseSearchActive = ref(false)
const fileInput = ref(null)
const attachedFiles = ref([])
const uploadProgress = ref(0)
const emit = defineEmits(['send', 'upload'])

function onSend() {
  if (inputValue.value.trim() || attachedFiles.value.length > 0) {
    const searchType = isPreciseSearchActive.value ? 'es' : 'rag'
    // 先上传所有附件
    if (attachedFiles.value.length > 0) {
      uploadAllFiles().then(uploadedUrls => {
        // 上传成功后，带上附件url一起emit
        emit('send', inputValue.value, searchType, uploadedUrls)
        inputValue.value = ''
        attachedFiles.value = []
        uploadProgress.value = 0
      })
    } else {
      emit('send', inputValue.value, searchType, [])
      inputValue.value = ''
    }
  }
}

async function uploadAllFiles() {
  const urls = []
  for (let i = 0; i < attachedFiles.value.length; i++) {
    const fileObj = attachedFiles.value[i]
    const url = await uploadFile(fileObj.file)
    urls.push(url)
  }
  return urls
}

function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      },
    })
    .then(res => {
      // 假设后端返回 { url: 'xxx' }
      resolve(res.data.url)
    })
    .catch(() => {
      alert('上传失败！')
      reject()
    })
  })
}

function triggerFileInput() {
  if (fileInput.value) fileInput.value.click()
}

function onFileChange(e) {
  const files = e.target.files;
  console.log('选中的文件:', files);
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // 去重：同名同大小不重复
      if (!attachedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
        attachedFiles.value.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type
        })
      }
    }
  e.target.value = '';
}

function removeFile(idx) {
  attachedFiles.value.splice(idx, 1)
}

function togglePreciseSearch() {
  isPreciseSearchActive.value = !isPreciseSearchActive.value
}

function formatSize(size) {
  if (size < 1024) return size + 'B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB';
  return (size / 1024 / 1024).toFixed(1) + 'MB';
}

function getFileIcon(type) {
  return wordIcon;
}
</script>

<style scoped>
.chat-input-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 0 0 1px #E0E0E0 inset;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  box-sizing: border-box;
  overflow: hidden;
  padding: 20px 24px 16px 24px; /* 新增：上下左右内边距 */
}

.input-row {
  width: 100%;
  margin-bottom: 8px;
  margin-top: 12px; /* 让输入框和文件卡片之间有间隙 */
  box-sizing: border-box;
}

.chat-input {
  width: 756px;
  height: 40px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #222;
  border-radius: 12px;
  padding: 8px 16px;
  box-sizing: border-box;
}

.chat-input::placeholder {
  color: #BFBFBF;
  font-size: 14px;
}

.action-row {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
  margin-top: 0;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.icon-btn {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #E0E0E0 inset;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 2;
  margin-right: 12px;
  height: 32px;
  transition: all 0.2s ease;
}

.attach-btn {
  width: 32px;
  min-width: 32px;
  padding: 0;
}

.precise-search-btn {
  width: 100px;
  min-width: 100px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-family: 'Source Han Sans', '思源黑体', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  color: #262626;
  font-weight: 400;
  position: relative;
  white-space: nowrap;
}

/* 精准搜索按钮激活状态 */
.precise-search-btn.active {
  background: #eaf3fc;
  box-shadow: 0 0 0 1px #1565c0 inset;
  color: #1565c0;
}

.precise-search-btn:hover {
  background: #f5f8fc;
}

.precise-search-btn.active:hover {
  background: #dde8f5;
}

.precise-search-text {
  font-size: 14px;
  color: inherit;
  font-family: 'Source Han Sans', '思源黑体', 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 4px;
}

.icon-img {
  width: 20px;
  height: 20px;
  display: block;
}

.action-spacer {
  flex: 1;
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #EBEBEB;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 0;
  margin-left: 12px;
}

.send-arrow {
  width: 20px;
  height: 20px;
  display: block;
}

.attached-files {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
  padding-bottom: 16px; /* 让文件卡片和输入框之间有间隙 */
  flex-wrap: wrap;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}
.file-item {
  background: #fafbfc;
  border-radius: 10px;
  padding: 8px 16px 8px 8px;
  display: flex;
  align-items: center;
  position: relative;
  max-width: 260px; /* 限制最大宽度 */
  min-width: 0;
  overflow: hidden;
}
.file-icon {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.file-info {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
}
.file-name {
  font-size: 14px;
  color: #222;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px; /* 限制最大宽度 */
  display: block;
}
.file-size {
  font-size: 12px;
  color: #888;
}
.file-remove {
  cursor: pointer;
  font-size: 18px;
  color: #bbb;
  margin-left: 4px;
  position: absolute;
  right: 8px;
  top: 4px;
}

.upload-progress {
  font-size: 13px;
  color: #1976d2;
  margin-bottom: 8px;
}

@media (max-width: 900px) {
  .chat-input-wrapper {
    max-width: 98vw !important;
    min-width: 0 !important;
  }
}
</style> 