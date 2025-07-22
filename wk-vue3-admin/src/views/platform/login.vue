<template>
    <div class="bg-container">
        <img src="@/assets/images/login_backg.svg" class="bg-img" alt="bg" />
        <div class="login-box-wrapper">
            <div class="login-box">
                <!-- 只保留登录表单，无需el-tabs和el-tab-pane -->
                <el-form ref="loginFormRef" :model="loginData" :rules="loginRules" class="login-form" @keyup.enter="handleLogin(loginFormRef)">
                    <h2>欢迎登录航空法规智能查询系统</h2>
                    <div class="form-group">
                        <div class="my-input"><el-input v-model="loginData.loginname" placeholder="请输入用户名" /></div>
                    </div>
                    <div class="form-group">
                        <el-input v-model="loginData.password" type="password" placeholder="请输入密码" class="my-input" show-password />
                    </div>
                    <div class="form-group" v-if="loginData.captchaHasEnabled">
                        <div class="code-row">
                            <div class="my-input" style="flex:1;"><el-input v-model="loginData.captchaCode" placeholder="请输入验证码" /></div>
                            <span class="code-divider"></span>
                            <img :src="captchaData.captchaCodeImg" @click="getCaptchaCode" class="captcha-img" />
                        </div>
                    </div>
                    <el-button :loading="loginData.btnLoading" type="primary" class="login-btn" @click="handleLogin(loginFormRef)">
                        <span v-if="!loginData.btnLoading">登录</span>
                        <span v-else>登录中...</span>
                    </el-button>
                </el-form>
                <div class="get-pwd">
                    <el-button type="primary" link @click="showSetPwd">忘记密码</el-button>
                </div>
            </div>
        </div>
        <el-dialog title="重置密码" v-model="pwdVisible" :close-on-click-modal="false" :show-close="true" width="35%">
            <el-row>
                <el-form ref="pwdFormRef" :model="pwdFormData" :rules="pwdRules" label-width="100px">
                    <el-form-item prop="loginname" label="用户名">
                        <el-input ref="pwdFormLoginnameRef" v-model="pwdFormData.loginname" placeholder="请输入用户名" auto-complete="off" tabindex="1" style="width:220px;" />
                    </el-form-item>
                    <el-form-item v-if="pwdStep>=2" prop="type" label="验证方式" :rules="{ required: true, message: '请选择验证方式', trigger: ['blur','change']}" >
                        <el-radio-group v-model="pwdFormData.type" tabindex="2">
                            <el-radio v-for="obj in pwdType" :key="obj.key" :label="obj.key">{{ obj.val }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="pwdStep==3" prop="password" label="新密码" :rules="[{ required: true, message: '请输入新密码', trigger: ['blur','change']},buildValidatorData({ name: 'password' })]">
                        <el-input v-model="pwdFormData.password" auto-complete="off" placeholder="请输入新密码" show-password />
                    </el-form-item>
                    <el-form-item v-if="pwdStep==3" prop="code" label="验证码" :rules="{ required: true, message: '请输入验证码', trigger: ['blur','change']}" >
                        <el-input v-model="pwdFormData.code" placeholder="验证码" auto-complete="off" />
                    </el-form-item>
                    <el-form-item v-if="pwdFormData.pwdMsg" style="color: red">{{ pwdFormData.pwdMsg }}</el-form-item>
                </el-form>
            </el-row>
            <template #footer>
                <el-button :loading="pwdFormData.pwdBtnLoading" type="primary" @click="doPwd(pwdFormRef)">
                    <span v-if="pwdStep==1">验证账号</span>
                    <span v-if="pwdStep==2">发送验证码</span>
                    <span v-if="pwdStep==3">保存新密码</span>
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, nextTick, watch, onBeforeMount } from 'vue'
import { ElForm, ElInput, ElMessage, ElNotification } from 'element-plus'
import router from '@/router/index'
import { useRoute } from 'vue-router'
import JSencrypt from 'jsencrypt'
import { buildValidatorData, checkMobile } from '@/utils/validate'
import { usePlatformInfo } from '@/stores/platformInfo'
import { useUserInfo } from '@/stores/userInfo'
import { getCaptcha, getRsa, getSmsCode, doLogin, checkLoginname, sendResetPwdCode, saveNewPwd } from '@/api/ucenter/auth'
import { cloneDeep } from 'lodash'

const year = new Date().getFullYear()
const platformInfo = usePlatformInfo()
const tabActiveName = ref("loginByPassword")
const { query } = useRoute()
const { redirect } = query

const MSGINIT = '发送验证码'
const MSGSCUCCESS = '{time}秒后重发'
let MSGTIME = 60
let rsaPublicKey = ''

let pwdVisible = ref(false)
let pwdStep = ref(1)
let pwdType = ref<{ key: string; val: string }[]>([])

const loginFormRef = ref<InstanceType<typeof ElForm>>()
const loginnameRef = ref<InstanceType<typeof ElInput>>()
const passwordRef = ref<InstanceType<typeof ElInput>>()
const captchaRef = ref<InstanceType<typeof ElInput>>()
const mobileRef = ref<InstanceType<typeof ElInput>>()
const smscodeRef = ref<InstanceType<typeof ElInput>>()
const smsLoginFormRef = ref<InstanceType<typeof ElForm>>()
const pwdFormRef = ref<InstanceType<typeof ElForm>>()
const pwdFormLoginnameRef = ref<InstanceType<typeof ElInput>>()
const loginData = reactive({
    loginname: '',
    password: '',
    captchaCode: '',
    keep: false,
    captchaKey: '',
    captchaHasEnabled: false,
    smscode: '',
    mobile: '',
    rsaKey: '',
    appId: process.env.BASE_APP_ID,
    type: 'password',
    btnLoading: false
})
const captchaData = reactive({
    captchaCodeImg: ''
})
const smsData = reactive({
    msgText: MSGINIT,
    msgKey: false,
    msgTime: MSGTIME
})
const pwdFormData = reactive({
    loginname: '' as string,
    type: '' as string | undefined,
    password: '',
    code: '',
    pwdMsg: '',
    pwdBtnLoading: false
})

watch(tabActiveName, (n, o) => {
    if ('loginByPassword' === n) {
        loginData.type = 'password'
        getCaptchaCode()
    } else {
        loginData.type = 'mobile'
    }
})

const loginRules = reactive({
    loginname: [buildValidatorData({ name: 'required', message: '请输入用户名' }), buildValidatorData({ name: 'account' })],
    password: [buildValidatorData({ name: 'required', message: '请输入登录密码' })],
    captchaCode: [
        buildValidatorData({ name: 'required', title: '请输入验证码' }),
        {
            min: 1,
            max: 6,
            message: '验证码长度 1-6位',
            trigger: 'blur',
        },
    ]
})

const loginBySmsRules = reactive({
    mobile: [buildValidatorData({ name: 'required', message: '请输入手机号码' }), buildValidatorData({ name: 'mobile' })],
    smscode: [
        buildValidatorData({ name: 'required', title: '请输入短信验证码' }),
        {
            pattern: /^\d{4}$/, message: '请輸入4位短信验证码', trigger: 'blur'
        },
    ]
})

const pwdRules = reactive({
    loginname: [buildValidatorData({ name: 'required', message: '请输入用户名' }), buildValidatorData({ name: 'account' })]
})

onMounted(() => {
    getCaptchaCode()
    initRsaInfo()
    initDemoInfo()
    focusInput()
})

//初始化演示环境账号&密码
const initDemoInfo = () => {
    if (platformInfo.AppDemoEnv) {
        loginData.loginname = 'superadmin'
        loginData.password = '1'
    }
}

//获取RSA加密需要的密钥信息
const initRsaInfo = () => {
    getRsa().then((res: any) => {
        loginData.rsaKey = res.data.rsaKey
        rsaPublicKey = res.data.rsaPublicKey
    })
}

//获取图形验证码
const getCaptchaCode = () => {
    getCaptcha().then((res: any) => {
        loginData.captchaKey = res.data.key
        captchaData.captchaCodeImg = res.data.code
        loginData.captchaHasEnabled = res.data.captchaHasEnabled
        nextTick(()=>{
            if (loginData.captchaCode === '' && loginData.captchaHasEnabled) {
                if (captchaRef.value) captchaRef.value.focus()
            }
        })
    })
}

//表单焦点切换
const focusInput = () => {
    if (loginData.loginname === '') {
        if (loginnameRef.value) loginnameRef.value.focus()
    } else if (loginData.password === '') {
        if (passwordRef.value) passwordRef.value.focus()
    } else if (loginData.captchaCode === '' && loginData.captchaHasEnabled) {
        if (captchaRef.value) captchaRef.value.focus()
    }
}

//提交登录
const handleLogin = (formEl: InstanceType<typeof ElForm> | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            const formParams = cloneDeep(loginData)
            const encrypt = new JSencrypt()
            encrypt.setPublicKey(rsaPublicKey)
            const newpwd = '' + encrypt.encrypt(loginData.password)
            formParams.password = newpwd
            loginData.btnLoading = true
            doLogin(formParams).then((res: any) => {
                loginData.btnLoading = false
                const userInfo = useUserInfo()
                userInfo.setToken(res.data)
                setTimeout(()=>{
                    ElMessage.success('登录成功！') 
                },300)
                // 登录成功后跳转到 home 页面
                router.push('/platform/home')
            }).catch(() => {
                loginData.btnLoading = false
                loginData.captchaCode = ''
                getCaptchaCode()
                focusInput()
            })
        } else {
            return false
        }
    })
}

//发送短信验证码
const handleSmsSend = () => {
    if (!checkMobile(loginData.mobile)) {
        ElNotification.error('手机号码不正确')
        if (mobileRef.value) mobileRef.value.focus()
        return
    }
    getSmsCode(loginData.mobile.toString()).then((res: any) => {
        ElNotification.success('短信发送成功，请注意查收')
        loginData.smscode = ''
        if (smscodeRef.value) smscodeRef.value.focus()
        smsData.msgText = MSGSCUCCESS.replace('{time}', MSGTIME.toString())
        smsData.msgKey = true
        smsData.msgTime = MSGTIME
        var time = setInterval(() => {
            smsData.msgTime--
            smsData.msgText = MSGSCUCCESS.replace('{time}', smsData.msgTime.toString())
            if (smsData.msgTime === 0) {
                smsData.msgTime = MSGTIME
                smsData.msgText = MSGINIT
                smsData.msgKey = false
                clearInterval(time)
            }
        }, 1000)
    })
}

//弹出重置密码框
const showSetPwd = () => {
    pwdVisible.value = true
    pwdStep.value = 1
    nextTick(() => {
        pwdFormData.loginname = ''
        if (pwdFormLoginnameRef.value) pwdFormLoginnameRef.value.focus()
    })
}

//找回密码分三步处理
const doPwd = (formEl: InstanceType<typeof ElForm> | undefined) => {
    if (pwdStep.value === 1) {
        checkUserInfo(formEl)
    }
    if (pwdStep.value === 2) {
        sendCaptchaCode(formEl)
    }
    if (pwdStep.value === 3) {
        setNewPassword(formEl)
    }
}

//核验账号
const checkUserInfo = (formEl: InstanceType<typeof ElForm> | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            pwdFormData.pwdBtnLoading = true
            checkLoginname(pwdFormData.loginname!).then((res: any) => {
                pwdFormData.pwdBtnLoading = false
                pwdStep.value = 2
                if (Array.isArray(res.data)) {
                  pwdType.value = res.data as { key: string; val: string }[]
                } else {
                  pwdType.value = []
                }
            }).catch(() => {
                pwdFormData.pwdBtnLoading = false
            })
        }
    })
}

//发送验证码(手机短信或Email)
const sendCaptchaCode = (formEl: InstanceType<typeof ElForm> | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            pwdFormData.pwdBtnLoading = true
            sendResetPwdCode(pwdFormData).then((res: any) => {
                pwdFormData.pwdBtnLoading = false
                pwdFormData.pwdMsg = res.msg || (res.data && res.data.msg) || ''
                pwdStep.value = 3
            }).catch(() => {
                pwdFormData.pwdBtnLoading = false
            })
        }
    })
}

//提交新密码
const setNewPassword = (formEl: InstanceType<typeof ElForm> | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            pwdFormData.pwdBtnLoading = true
            saveNewPwd(pwdFormData).then((res: any) => {
                pwdFormData.pwdBtnLoading = false
                pwdFormData.pwdMsg = ''
                pwdVisible.value = false
                ElNotification.success('密码重置成功，请刷新页面重新登录！')
            }).catch(() => {
                pwdFormData.pwdBtnLoading = false
            })
        }
    })
}

const handleSocial = () => {
    ElNotification.success('订购功能 QQ: wizzer 微信: wizzer')
}
</script>
<style scoped lang="scss">
html, body {
    height: 100%;
    width: 100%;
}
body {
    background: #eaf3fc;
    min-height: 100vh;
    min-width: 100vw;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.bg-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    max-width: 1920px;
    max-height: 1080px;
    margin: 0 auto;
    overflow: hidden;
    background: #eaf3fc;
    aspect-ratio: 16/9;
}
.bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
}
/* 删除侧边栏相关样式 */
.sidebar-bg, .sidebar-content, .sidebar-btn, .sidebar-card, .new-session-btn, .sidebar-logo {
  display: none !important;
}
.login-box-wrapper {
    position: absolute;
    right: 10vw;
    top: 60px;
    width: 430px;
    min-width: 300px;
    min-height: 260px;
    display: flex;
    flex-directniion: column;
    align-items: center;
    /* 新增：让卡片内容自适应且整体靠上 */
}
.login-box {
    width: 100%;
    min-height: 460px;
    border-radius: 20px;
    background: rgba(249,250,255,0.6);
    border: 1px solid #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,0.10);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 47px 24px 47px;
    z-index: 2;
    box-sizing: border-box;
}
.login-box h2 {
    margin-top: 40px;
    margin-bottom: 32px;
    font-size: 23px;
    color: #3D3D3D;
    text-align: center;
    font-weight: 500;
    letter-spacing: 1px;
    width: 100%;
    display: block;
    white-space: nowrap;
    overflow: visible;
    text-overflow: clip;
}
.login-tabs {
    width: 100%;
}
.login-tabs .el-tabs__nav {
  width: 100%;
  display: flex;
}
.login-tabs .el-tabs__item {
  flex: 1 1 50%;
  text-align: center;
}
.form-group {
    margin-bottom: 18px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.login-btn {
    width: 100%;
    background: #004EA2;
    color: #fff;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 2px;
    height: 46px;
    margin-top: 18px;
    margin-bottom: 0;
}
.login-btn:hover {
    background: #1565c0;
}
.my-input {
  width: 336px;
  height: 46px;
  background: #f7fafd;
  border: 1.5px solid #d3dbe8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0;
}

/* 关键：用 :deep 深度穿透，覆盖 el-input 内部样式 */
.my-input :deep(.el-input__wrapper),
.my-input :deep(.el-input__wrapper.is-focus),
.my-input :deep(.el-input__wrapper:focus),
.my-input :deep(.el-input__wrapper:active),
.my-input :deep(.el-input__inner),
.my-input :deep(.el-input__inner:focus),
.my-input :deep(.el-input__inner:active) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  background: transparent !important;
}
.code-row {
    display: flex;
    align-items: center;
    width: 336px;
    height: 46px;
    background: #f7fafd;
    border: 1.5px solid #d3dbe8;
    border-radius: 10px;
    overflow: hidden;
    min-width: 0;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
.code-divider {
    width: 1px;
    height: 26px;
    background: #e0e6ef;
    margin: 0 12px;
}
.captcha-img {
    height: 38px;
    cursor: pointer;
}
.get-pwd {
    float: right;
    display: inline-block;
    text-align: right;
    flex-direction: row;
    flex-wrap: wrap;
    vertical-align: middle;
    margin-top: 10px;
    width: 100%;
}
.get-pwd button {
    padding-left: 10px;
    font-size: 12px;
}
.third-login {
    margin-top: 32px;
    margin-bottom: 0;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    vertical-align: middle;
}
.third-login .third-icon {
    margin: 0 20px;
    cursor: pointer;
    fill: rgba(0, 0, 0, 0.2);
}
.third-way {
    display: flex;
    justify-content: center;
}
.third-icon:hover {
    fill: rebeccapurple;
}
@media (max-width: 1920px), (max-height: 1080px) {
    .bg-container {
        width: 100vw;
        height: 100vh;
    }
    .login-box-wrapper {
        --scale-x: calc(100vw / 1920);
        --scale-y: calc(100vh / 1080);
        --scale: min(var(--scale-x), var(--scale-y));
        transform: scale(var(--scale));
    }
}
</style>