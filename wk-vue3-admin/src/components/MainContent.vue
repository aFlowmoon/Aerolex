<template>
    <div class="main-content">
      <div class="main-center-area">
        <div class="main-title" v-if="!currentChat || !currentChat.messages || currentChat.messages.length === 0">
          您好，有什么可以帮您？
        </div>
        <div id="chat-bubble-list">
          <ChatBubble
            v-for="(message, index) in currentChat?.messages || []"
            :key="index"
            :message="message.content"
            :isUser="message.isUser"
            :timestamp="message.timestamp"
          />
        </div>
      </div>
      <div class="tab-content">
        <div class="tab-page" v-show="activeTab === 'query'">
          <QueryTab @addChatMessage="onAddChatMessage" />
        </div>
        <div class="tab-page" v-show="activeTab === 'qa'">
          <QaTab @addChatMessage="onAddChatMessage" />
        </div>
        <div class="tab-page" v-show="activeTab === 'compare'">
          <CompareTab @addChatMessage="onAddChatMessage" />
        </div>
      </div>
      <div class="footer-tip">内容由AI生成，重要信息请仔细核查</div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import ChatBubble from './ChatBubble.vue'
  import QueryTab from './tabs/QueryTab.vue'
  import QaTab from './tabs/QaTab.vue'
  import CompareTab from './tabs/CompareTab.vue'
  
  const props = defineProps({
    activeTab: String,
    currentChat: Object
  })
  const emit = defineEmits(['addChatMessage'])
  
  function onAddChatMessage(content, isUser, type) {
    emit('addChatMessage', content, isUser, type)
  }
  </script>
  
  <style scoped>
  .main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    position: relative;
  }
  .main-center-area {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-top: 0;
    gap: 0;
    justify-content: flex-start;
  }
  .main-title {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Source Han Sans', '思源黑体', 'Microsoft YaHei', Arial, sans-serif !important;
    font-size: 24px !important;
    color: #262626 !important;
    font-weight: 400 !important;
    line-height: 30px !important;
    letter-spacing: 0;
    text-align: center;
    margin: 24px 0 32px 0;
    padding: 0;
  }
  #chat-bubble-list {
    width: 800px;
    max-width: 100vw;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    box-sizing: border-box;
    max-height: 60vh;
    overflow-y: auto;
    padding-bottom: 12px;
  }
  @media (max-width: 900px) {
    #chat-bubble-list {
      width: 98vw !important;
      min-width: 0 !important;
      max-width: 100vw !important;
    }
  }
  .tab-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0;
  }
  .tab-page {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0;
  }
  .footer-tip {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 800px;
    text-align: center;
    background: #fff;
    padding: 12px 0 0 0;
    box-shadow: none;
    font-family: 'Source Han Sans', '思源黑体', 'Microsoft YaHei', Arial, sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: #BFBFBF;
  }
  </style>
  