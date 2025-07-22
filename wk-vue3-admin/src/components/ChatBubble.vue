<template>
  <div :class="['chat-row', isUser ? 'user' : 'ai']">
    <!-- AI消息 -->
    <template v-if="!isUser">
      <img class="avatar ai-avatar" src="@/assets/images/ai-avatar.svg" alt="AI头像" />
      <div class="bubble ai-bubble">
        <div class="content" v-html="escapeHTML(message)"></div>
        <div v-if="attachments && attachments.length" class="attachments">
          <div v-for="file in attachments" :key="file">
            <a :href="file" target="_blank">下载附件</a>
          </div>
        </div>
        <div class="actions">
          <div class="custom-ai-bubble-footer">
            <div class="custom-knowledge-source">
              <img src="@/assets/images/info.svg" class="info-icon" alt="info" />
              <span>内容由AI生成</span>
            </div>
            <div class="custom-ai-footer">
              <span class="ai-action-icon ai-refresh" title="刷新" @click="onRefresh">
                <img src="@/assets/images/refresh.svg" />
              </span>
              <span class="ai-action-icon ai-copy" title="复制" @click="onCopy">
                <img src="@/assets/images/copy.svg" />
              </span>
              <span class="ai-action-icon ai-like" :class="{active: liked}" title="点赞" @click="onLike">
                <img src="@/assets/images/like.svg" />
              </span>
              <span class="ai-action-icon ai-dislike" :class="{active: disliked}" title="踩" @click="onDislike">
                <img src="@/assets/images/dislike.svg" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- 用户消息 -->
    <template v-else>
      <div class="bubble user-bubble">
        <div class="content" v-html="escapeHTML(message)"></div>
        <div v-if="attachments && attachments.length" class="attachments">
          <div v-for="file in attachments" :key="file">
            <a :href="file" target="_blank">下载附件</a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  message: String,
  isUser: Boolean,
  timestamp: String,
  index: Number,
  attachments: {
    type: Array,
    default: () => []
  }
})

const liked = ref(false)
const disliked = ref(false)
const emit = defineEmits(['refresh', 'copy', 'like', 'dislike'])

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>')
}
function onRefresh() {
  emit('refresh')
}
function onCopy() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(props.message)
  }
}
function onLike() {
  liked.value = !liked.value
  if (liked.value) disliked.value = false
}
function onDislike() {
  disliked.value = !disliked.value
  if (disliked.value) liked.value = false
}
</script>

<style scoped>
.chat-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 32px;
  width: 100%;
}
.chat-row.ai {
  flex-direction: row;
  align-items: flex-start; /* 头像和气泡顶部对齐 */
  justify-content: flex-start;
}
.chat-row.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.user-bubble {
  margin-left: auto;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 12px 0 0; /* 右侧留间距 */
  align-self: flex-start;
}
.ai-avatar {
  align-self: flex-start;
}
.bubble {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}
.ai-bubble {
  background: #fff;
  border-radius: 18px;
  padding: 24px 32px 18px 32px;
  box-sizing: border-box;
}
.user-bubble {
  background: #F7F7F7;
  border-radius: 6px;
  padding: 12px 24px;
  box-sizing: border-box;
}
.content {
  font-size: 16px;
  color: #262626;
  word-break: break-all;
}
.actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.custom-ai-bubble-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 8px;
}
.custom-knowledge-source {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}
.info-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
}
.custom-ai-footer {
  display: flex;
  align-items: center;
  gap: 16px;
}
.ai-action-icon {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: filter 0.2s;
}
.ai-action-icon.active img {
  filter: brightness(0.7) sepia(1) hue-rotate(90deg) saturate(4);
}
.attachments {
  margin-top: 8px;
}
.attachments a {
  color: #1976d2;
  margin-right: 8px;
  font-size: 14px;
  text-decoration: underline;
}
</style>
