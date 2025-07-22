<template>
    <div class="knowledge-modal-mask">
      <div class="knowledge-modal-content">
        <button class="close-btn" @click="$emit('close')">×</button>
        <h2 class="modal-title">
          <img src="@/assets/images/info.svg" class="modal-title-icon" alt="知识库" />
          知识库管理
        </h2>
        <div class="knowledge-status">
          <strong>当前状态：</strong>已导入 FAA 法规 1,234 条，EASA 法规 987 条，CAAC 法规 1,567 条
        </div>
        <div class="modal-section">
          <h3>导入新数据</h3>
          <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
            <div>📊 上传法规数据库文件</div>
            <input ref="fileInput" type="file" accept=".json,.csv,.xlsx" style="margin-top: 8px; display:none;" @change="handleFileChange" />
            <div v-if="fileName" class="file-name">已选择：{{ fileName }}</div>
          </div>
          <button class="action-btn import-btn" @click="importFile">开始导入</button>
        </div>
        <div class="modal-section">
          <h3>知识库统计</h3>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-num">3,788</div>
              <div class="stat-label">总法规条数</div>
            </div>
            <div class="stat-card">
              <div class="stat-num stat-green">156</div>
              <div class="stat-label">法规文件数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  const fileInput = ref(null)
  const fileName = ref('')
  
  function triggerFileInput() {
    fileInput.value && fileInput.value.click()
  }
  function handleFileChange(e) {
    const file = e.target.files[0]
    fileName.value = file ? file.name : ''
  }
  function handleDrop(e) {
    const file = e.dataTransfer.files[0]
    fileName.value = file ? file.name : ''
  }
  function importFile() {
    if (!fileName.value) {
      alert('请先选择要导入的文件！')
      return
    }
    alert('导入功能仅为演示，实际请对接后端接口！\n已选择文件：' + fileName.value)
  }
  </script>
  
  <style scoped>
  .knowledge-modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .knowledge-modal-content {
    position: relative;
    background: #fff;
    border-radius: 12px;
    padding: 32px 32px 24px 32px;
    width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 28px;
    color: #888;
    cursor: pointer;
    z-index: 10;
    transition: color 0.2s;
  }
  .close-btn:hover { color: #1976d2; }
  .modal-title {
    margin: 0 0 24px 0;
    color: #1976d2;
    font-size: 22px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .modal-title-icon {
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }
  .knowledge-status {
    padding: 8px 12px;
    background: #e8f5e8;
    color: #2e7d32;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 16px;
  }
  .modal-section { margin-bottom: 24px; }
  .upload-area {
    border: 2px dashed #e5e6eb;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    margin-bottom: 16px;
    transition: border 0.2s;
    cursor: pointer;
    color: #1976d2;
    background: #f8f9fa;
  }
  .upload-area:hover {
    border-color: #1976d2;
    background: #f0f8ff;
  }
  .file-name {
    margin-top: 12px;
    color: #888;
    font-size: 14px;
  }
  .action-btn {
    padding: 8px 24px;
    background: #28a745;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 16px;
    transition: background 0.2s, color 0.2s;
  }
  .action-btn:hover {
    background: #218838;
  }
  .import-btn {
    background: #28a745;
    color: #fff;
    border-color: #28a745;
  }
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .stat-card {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .stat-num {
    font-size: 24px;
    font-weight: bold;
    color: #1976d2;
  }
  .stat-num.stat-green {
    color: #28a745;
  }
  .stat-label {
    font-size: 14px;
    color: #666;
  }
  </style>