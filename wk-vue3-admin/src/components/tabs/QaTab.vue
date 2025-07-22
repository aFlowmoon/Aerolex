<template>
  <div class="search-block">
    <div class="search-row">
      <label class="search-label">民航局</label>
      <select class="search-select" v-model="bureau">
        <option value="">请选择</option>
        <option value="CAAC">CAAC</option>
        <option value="FAA">FAA</option>
        <option value="EASA">EASA</option>
      </select>
      <label class="search-label">法规编号</label>
      <select class="search-select" v-model="code">
        <option value="">请选择</option>
        <option value="XX001">XX001</option>
        <option value="XX002">XX002</option>
      </select>
    </div>
    <div class="search-box">
      <div class="input-action-wrapper-vertical" style="position: relative;">
        <textarea class="search-input-area" v-model="question" placeholder="请输入你想咨询的问题"></textarea>
        <!-- 左下角智能问答按钮 -->
        <div class="left-action-btn" style="display: flex;">
          <button class="main-action-btn" @click="onQa">
            <img src="@/assets/images/main-qa.svg" class="main-btn-img" alt="智能问答">
            <span class="main-btn-text">智能问答</span>
          </button>
        </div>
        <!-- 右下角按钮组 -->
        <div class="input-action-row">
          <div class="input-action-btns">
            <label for="qa-file-upload" class="icon-btn-plain" title="上传附件">
              <img src="@/assets/images/attachment.svg" alt="上传附件" class="icon-img">
            </label>
            <input id="qa-file-upload" type="file" style="display:none;" accept=".pdf,.doc,.docx,.txt" @change="onFileChange">
            <svg class="divider-line" xmlns="http://www.w3.org/2000/svg" fill="none" width="2" height="18" viewBox="0 0 2 18">
              <g transform="matrix(0,1,-1,0,1,-1)">
                <line x1="1" y1="-0.5" x2="19" y2="-0.5" stroke="#EBEBEB" stroke-width="1"/>
              </g>
            </svg>
            <button class="icon-btn-plain" title="发送" @click="onSend">
              <span class="send-btn-bg">
                <img src="@/assets/images/send-bg.svg" alt="发送背景" class="send-bg-img">
                <img src="@/assets/images/send-arrow.svg" alt="发送" class="send-arrow-img">
              </span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="fileName" class="file-list">{{ fileName }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const bureau = ref('')
const code = ref('')
const question = ref('')
const fileName = ref('')

const emit = defineEmits(['addChatMessage'])

function onQa() {
  if (!question.value.trim()) {
    alert('请输入咨询问题')
    return
  }
  emit('addChatMessage', question.value, true, 'qa')
  question.value = ''
}
function onSend() {
  onQa()
}
function onFileChange(e) {
  const file = e.target.files[0]
  fileName.value = file ? file.name : ''
}
</script>

<style scoped>
.search-block {
  width: 800px;
  margin: 0 auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 12px;
  padding-left: 0;
}
.search-label {
  font-size: 14px;
  color: #222;
  margin-right: 10px;
  font-weight: 500;
  width: 56px;
  text-align: right;
  white-space: nowrap;
  padding: 0;
}
.search-select {
  width: 160px !important;
  height: 32px !important;
  min-width: 160px !important;
  font-size: 16px;
  border-radius: 8px !important;
  padding: 0 28px 0 16px;
  box-sizing: border-box;
  margin-right: 30px;
}
.search-row .search-select:last-child {
  margin-right: 0;
}
.search-box {
  width: 800px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #E0E0E0;
  position: relative;
  overflow: hidden;
}
.input-action-wrapper-vertical {
  border: none !important;
  background: none !important;
  box-shadow: none !important;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24px;
  border: 1.5px solid #d3dbe8;
  padding: 24px 24px 18px 24px;
  box-sizing: border-box;
  width: 100%;
  gap: 16px;
}
.search-input-area {
  width: 100%;
  min-height: 56px;
  max-height: 120px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  resize: none;
  font-family: inherit;
  color: #222;
}
.left-action-btn {
  position: absolute;
  left: 24px;
  bottom: 16px;
  z-index: 2;
}
.main-action-btn {
  height: 40px;
  min-width: 120px;
  border-radius: 12px;
  font-size: 14px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  background: url('@/assets/images/btn-bg.svg') no-repeat center/cover !important;
  color: #1976d2 !important;
  border: none !important;
  box-shadow: none !important;
  font-weight: 500;
}
.main-btn-img {
  width: 18px !important;
  height: 18px !important;
  margin-right: 8px;
}
.main-btn-text {
  font-size: 16px !important;
  line-height: 18px !important;
  font-weight: 500 !important;
  color: #004EA2 !important;
  font-family: inherit;
  display: inline-block;
  vertical-align: middle;
  text-align: left;
  padding: 0;
  width: auto;
  height: 18px;
  letter-spacing: 0;
}
.input-action-row {
  position: relative;
}
.input-action-btns {
  position: absolute;
  right: 12px;
  bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-btn-plain {
  background: #f7fafd;
  border: none;
  border-radius: 8px;
  padding: 0 18px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.icon-btn-plain:hover {
  background: #e0e6ef;
}
.icon-img {
  width: 16px !important;
  height: 16px !important;
  display: block;
}
.divider-line {
  width: 2px;
  height: 18px;
  margin: 0 8px;
  flex-shrink: 0;
}
.send-btn-bg {
  position: relative;
  display: inline-block;
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  background: #EBEBEB !important;
}
.send-bg-img {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  background: #EBEBEB !important;
}
.send-arrow-img {
  position: absolute;
  left: 9px;
  top: 9px;
  width: 14px !important;
  height: 14px !important;
  pointer-events: none;
}
.file-list {
  margin-top: 8px;
  font-size: 14px;
  color: #1976d2;
  min-width: 80px;
  margin-left: 8px;
}
</style> 