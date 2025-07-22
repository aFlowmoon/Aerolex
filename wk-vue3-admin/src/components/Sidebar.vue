<template>
  <div class="sidebar-wrapper">
    <img src="@/assets/images/comac.svg" class="sidebar-logo" />
    <button class="sidebar-card new-session-btn" @click="emit('newChat')">
      <img src="@/assets/images/new-session.svg" class="nav-icon" />
      <span class="card-title">新建会话</span>
    </button>
    <div class="session-title">会话记录</div>
    <div class="session-list">
      <div v-if="!props.chatList || props.chatList.length === 0" class="session-list-empty">暂无会话</div>
      <div v-else>
        <div
          class="session-list-item"
          v-for="chat in props.chatList"
          :key="chat.id"
          @click="$emit('selectChat', chat)"
        >
          {{ chat.title }}
        </div>
      </div>
    </div>
    <div class="sidebar-user">
      <span class="sidebar-user-avatar-wrapper">
        <img src="@/assets/images/avatar-bg.svg" class="sidebar-user-avatar-bg" />
        <img src="@/assets/images/avatar-user.svg" class="sidebar-user-avatar-user" />
      </span>
      <span class="sidebar-user-name">{{ userInfo.user.loginname }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserInfo } from '@/stores/userInfo'
const userInfo = useUserInfo()
const props = defineProps({
  chatList: Array,
  userPhone: String
})
const emit = defineEmits(['newChat'])

// 编辑会话标题相关
const editIndex = ref(-1)
const editTitle = ref('')

watch(editIndex, (val) => {
  if (val !== -1 && props.chatList[val]) {
    editTitle.value = props.chatList[val].title
  }
})

function saveEdit(idx) {
  if (editTitle.value.trim()) {
    props.chatList[idx].title = editTitle.value.trim()
  }
  editIndex.value = -1
}
</script>

<style scoped>
.sidebar-wrapper {
  width: 260px;
  height: 100vh;
  background: #F5F6F8;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 0 0 0;
  box-sizing: border-box;
}
.sidebar-logo {
  width: 180px;
  margin-left: 32px;
  margin-bottom: 32px;
}
.new-session-btn,
.session-list-item {
  width: 196px;
  height: 44px;
  margin: 0 auto 19px auto;
  padding: 0 24px;
  font-size: 15px;
  color: #222;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  cursor: pointer;
  white-space: nowrap;
}
.new-session-btn {
  background: #ECF2FA;
  border: 1px solid #004EA2;
}
.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
.card-title {
  font-family: 'Source Han Sans', '思源黑体', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  color: #004EA2;
  font-weight: 400;
  width: 56px;
  height: 20px;
  line-height: 20px;
  text-align: left;
  display: inline-block;
}
.session-title {
  font-size: 16px;
  color: #BFBFBF;
  font-weight: 400;
  margin-left: 32px;
  margin-bottom: 8px;
}
.session-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.session-list-empty {
  color: #D3D3D3;
  font-size: 14px;
}
.session-list-item {
  background: url('@/assets/images/session-bg.svg') no-repeat center/cover;
  border: none;
  transition: background 0.2s;
  text-align: left;
  overflow: hidden;
}
.session-list-item:hover {
  background: #e0e0e0;
}
.sidebar-user {
  margin-top: auto;
  margin-left: 32px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #888;
  display: flex;
  align-items: center;
}
.sidebar-user-avatar-wrapper {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.sidebar-user-avatar-bg {
  width: 32px;
  height: 32px;
  display: block;
}
.sidebar-user-avatar-user {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
}
.sidebar-user-name {
  font-size: 14px;
  color: #888;
}
</style>
  