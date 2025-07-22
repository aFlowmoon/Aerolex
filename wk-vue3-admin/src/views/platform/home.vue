<template>
  <div class="container">
    <!-- 侧边栏 -->
    <Sidebar
      :chatList="chatList"
      :userPhone="userPhone"
      @newChat="addNewChat"
      @selectChat="selectChat"
      @deleteChat="deleteChat"
    />
    
    <!-- 主内容区 -->
    <div class="main-content main-content-center" id="main-content">
      <div class="center-group">
        <div class="main-title" v-show="!currentChat">您好，有什么可以帮您？</div>
        <div id="chat-bubble-list" v-if="currentChat && currentChat.messages && currentChat.messages.length">
          <ChatBubble
            v-for="(msg, idx) in currentChat.messages"
            :key="idx"
            :message="msg.content"
            :isUser="msg.isUser"
            :timestamp="msg.timestamp"
            :attachments="msg.attachments"
            @refresh="handleRefresh(idx)"
          />
        </div>
        <div class="input-center-wrapper" :class="{fixed: currentChat && currentChat.messages && currentChat.messages.length}">
          <ChatInput
            @send="(content, searchType, attachments) => addChatMessage(content, true, searchType, attachments)"
            @upload="handleFileUpload"
          />
        </div>
      </div>
      <div class="footer-tip">内容由AI生成，重要信息请仔细核查</div>
    </div>

    <!-- 知识库管理模态框 -->
    <KnowledgeModal 
      v-if="showKnowledgeModal" 
      @close="showKnowledgeModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import ChatBubble from '@/components/ChatBubble.vue'
import KnowledgeModal from '@/components/KnowledgeModal.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useUserInfo } from '@/stores/userInfo'

// 响应式数据
const chatList = ref([])
const currentChat = ref(null)
const showKnowledgeModal = ref(false)
const userInfo = useUserInfo()
const userPhone = computed(() => {
  // 优先显示用户名，其次手机号，否则显示“未登录”
  return userInfo.user.loginname || userInfo.user.mobile || '未登录'
})
// 移除技能相关变量，现在使用精准搜索状态

// 模拟法规数据库
const regulationsDB = reactive({
  FAA: [
    { 
      id: 'FAA-001', 
      code: '14 CFR 25.1301', 
      title: 'Equipment, systems, and installations', 
      content: 'Each item of equipment, each system, and each installation whose functioning is essential for safe operation must be designed and installed to ensure that it can perform its intended function under any foreseeable operating condition.', 
      source: 'FAA-14-CFR-25.pdf', 
      region: 'FAA' 
    },
    { 
      id: 'FAA-002', 
      code: '14 CFR 25.1302', 
      title: 'Installed systems and equipment for use by the flightcrew', 
      content: 'Each system and item of equipment installed in the airplane must be designed and installed so that it can be used by the flightcrew without interference with the performance of their duties.', 
      source: 'FAA-14-CFR-25.pdf', 
      region: 'FAA' 
    },
    { 
      id: 'FAA-003', 
      code: '14 CFR 25.1303', 
      title: 'Flight and navigation instruments', 
      content: 'The following flight and navigation instruments must be installed so that the instrument is visible from each pilot station.', 
      source: 'FAA-14-CFR-25.pdf', 
      region: 'FAA' 
    }
  ],
  EASA: [
    { 
      id: 'EASA-001', 
      code: 'CS-25.1301', 
      title: 'Equipment, systems and installations', 
      content: 'Each item of equipment, each system, and each installation whose functioning is essential for safe operation must be designed and installed to ensure that it can perform its intended function under any foreseeable operating condition.', 
      source: 'EASA-CS-25.pdf', 
      region: 'EASA' 
    },
    { 
      id: 'EASA-002', 
      code: 'CS-25.1302', 
      title: 'Installed systems and equipment for use by the flightcrew', 
      content: 'Each system and item of equipment installed in the airplane must be designed and installed so that it can be used by the flightcrew without interference with the performance of their duties.', 
      source: 'EASA-CS-25.pdf', 
      region: 'EASA' 
    },
    { 
      id: 'EASA-003', 
      code: 'CS-25.1303', 
      title: 'Flight and navigation instruments', 
      content: 'The following flight and navigation instruments must be installed so that the instrument is visible from each pilot station.', 
      source: 'EASA-CS-25.pdf', 
      region: 'EASA' 
    }
  ],
  CAAC: [
    { 
      id: 'CAAC-001', 
      code: 'CCAR-25.1301', 
      title: '设备、系统和安装', 
      content: '每个对安全运行至关重要的设备、系统和安装项目，必须设计和安装成能确保在任何可预见的运行条件下都能完成其预定功能。', 
      source: 'CAAC-CCAR-25.pdf', 
      region: 'CAAC' 
    },
    { 
      id: 'CAAC-002', 
      code: 'CCAR-25.1302', 
      title: '供飞行机组使用的已安装系统和设备', 
      content: '安装在飞机上的每个系统和设备项目，必须设计和安装成能被飞行机组使用，而不干扰其履行职责。', 
      source: 'CAAC-CCAR-25.pdf', 
      region: 'CAAC' 
    },
    { 
      id: 'CAAC-003', 
      code: 'CCAR-25.1303', 
      title: '飞行和导航仪表', 
      content: '下列飞行和导航仪表必须安装成使仪表能从每个驾驶员站位看到。', 
      source: 'CAAC-CCAR-25.pdf', 
      region: 'CAAC' 
    }
  ]
})

// 工具函数
function formatTime() {
  const now = new Date()
  return now.toLocaleString('zh-CN')
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>')
}

function searchRegulations(keyword, code, region) {
  let results = []
  const searchRegions = region ? [region] : ['FAA', 'EASA', 'CAAC']
  // 接口
  searchRegions.forEach(reg => {
    if (regulationsDB[reg]) {
      results = results.concat(regulationsDB[reg].filter(item => {
        const keywordMatch = !keyword || 
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.content.toLowerCase().includes(keyword.toLowerCase())
        const codeMatch = !code || item.code.includes(code)
        return keywordMatch && codeMatch
      }))
    }
  })
  
  return results
}

function generateAIResponse(question, searchType) {
  let response = ''
  //
  if (searchType === 'es') {
    // 使用ES库进行精准搜索
    const results = searchRegulations(question, '', '')
    if (results.length > 0) {
      response = `【精准搜索结果】根据您的检索需求，我找到了以下相关法规：\n`
      results.forEach(result => {
        response += `\n【${result.code} - ${result.title}】\n${result.content}\n来源：${result.source} | 地区：${result.region}\n`
      })
    } else {
      response = '【精准搜索】抱歉，未找到相关法规信息。请尝试其他关键词或联系管理员。'
    }
  } else {
    // 使用RAG库进行智能问答
    response = `【智能问答】根据您的问题，我为您整理了相关法规条款及分析信息。\n\n${question} 的相关法规信息包括：\n\n1. 相关条款分析\n2. 适用条件说明\n3. 注意事项提醒\n\n如需更精准的法规检索，请点击"精准搜索"按钮。`
  }
  
  return response
}

// 事件处理函数 - 移除switchTab，现在不需要tab切换

function addNewChat() {
  // 只有当前会话有内容时才存入历史
  if (currentChat.value && currentChat.value.messages && currentChat.value.messages.length > 0) {
    const firstUserMessage = currentChat.value.messages.find(msg => msg.isUser)
    let title = firstUserMessage ? firstUserMessage.content.slice(0, 20) : '未命名会话'
    chatList.value.unshift({
      id: currentChat.value.id,
      title: title,
      messages: [...currentChat.value.messages]
    })
  }
  // 新建空会话，不加入chatList，只切换currentChat
  currentChat.value = {
    id: Date.now(),
    title: '新建会话',
    messages: []
  }
}

function selectChat(chat) {
  currentChat.value = {
    id: chat.id,
    title: chat.title,
    messages: [...chat.messages]
  }
}

function deleteChat(chat) {
  const index = chatList.value.findIndex(c => c.id === chat.id)
  if (index > -1) {
    chatList.value.splice(index, 1)
  }
  
  // 如果删除的是当前会话，切换到最新会话或清空
  if (currentChat.value && currentChat.value.id === chat.id) {
    if (chatList.value.length > 0) {
      selectChat(chatList.value[0])
    } else {
      currentChat.value = null
    }
  }
}

function addChatMessage(content, isUser = false, searchType = 'rag', attachments = []) {
  // 确保有当前会话
  if (!currentChat.value) {
    currentChat.value = {
      id: Date.now(),
      title: '新会话',
      messages: []
    }
  }
  
  // 添加用户消息
  currentChat.value.messages.push({
    content: content,
    isUser: isUser,
    timestamp: formatTime()
  })
  
  // 如果是用户消息，延迟添加AI回复
  if (isUser) {
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, searchType)
      currentChat.value.messages.push({
        content: aiResponse,
        isUser: false,
        timestamp: formatTime()
      })
    }, 1000)
  }
}

function handleFileUpload(file) {
  // 这里可以处理上传的文件，比如添加到当前会话或上传到服务器
  // 示例：将文件名作为一条消息加入会话
  addChatMessage(`已上传附件：${file.name}`, false)
}

// 移除技能选择处理函数，现在使用精准搜索按钮

function handleRefresh(idx) {
  const msg = currentChat.value.messages[idx]
  if (!msg.isUser) {
    // 重新生成时使用RAG模式
    const newContent = generateAIResponse('重新生成', 'rag')
    currentChat.value.messages[idx].content = newContent
    currentChat.value.messages[idx].timestamp = formatTime()
  }
}

// 生命周期
onMounted(() => {
  // 初始化时不需要设置特定tab
})

watch(
  () => currentChat.value && currentChat.value.messages && currentChat.value.messages.length,
  async () => {
    await nextTick()
    const list = document.getElementById('chat-bubble-list')
    if (list) {
      list.scrollTop = list.scrollHeight
    }
  }
)
</script>

<style scoped>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  color: #222;
  width: 100vw;
  overflow-x: hidden;
  height: 100%;
}

.container {
  display: flex;
  height: 100vh;
  background: #fff;
  width: 100vw;
  overflow-x: hidden;
}

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
  font-size: 22px !important;
  color: #262626 !important;
  font-weight: 400 !important;
  line-height: 30px !important;
  letter-spacing: 0;
  text-align: center;
  margin: 24px 0 32px 0;
  padding: 0;
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

#chat-bubble-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-sizing: border-box;
  max-height: 60vh;
  overflow-y: auto;
  padding-bottom: 180px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
#chat-bubble-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}

@media (max-width: 900px) {
  #chat-bubble-list,
  .footer-tip,
  .input-center-wrapper.fixed {
    max-width: 98vw !important;
    min-width: 0 !important;
  }
}

.footer-tip {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
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

/* 主内容区按钮使用SVG背景，不变色 */
.main-action-btn,
.main-action-btn-white,
.main-action-btn:hover,
.main-action-btn-white:hover {
  background: url('@/assets/images/btn-bg.svg') no-repeat center/cover !important;
  color: #1976d2 !important;
  border: none !important;
  box-shadow: none !important;
}

/* 主标题样式 */
.main-title {
  margin-bottom: 32px !important;
}

.main-content.align-top {
  justify-content: flex-start !important;
}
.main-content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}
.center-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.input-center-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
}
.input-center-wrapper.fixed {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.03);
  border-radius: 20px 20px 0 0;
  padding-bottom: 8px;
}
</style>