<template>
  <div class="person-container">
    <div v-if="!loginUserStore.loginUser.id" class="no-login" @click="isOpenLogin = true">
      <div class="avatar"><el-avatar :icon="UserFilled" /></div>
      <div class="info">
        <div class="btn">登录 / 注册</div>
      </div>
    </div>

    <div v-else class="login">
      <el-dropdown>
        <div class="login-info el-dropdown-link">
          <div class="avatar">
            <img
              v-if="loginUserStore.loginUser.userAvatar"
              :src="`${siteInfo.imageUrl || ''}${loginUserStore.loginUser.userAvatar}`"
              alt="用户头像"
              class="avatar"
            />
            <el-avatar v-else :icon="UserFilled" />
          </div>
          <div class="info">
            <div class="name">{{ loginUserStore.loginUser.userName }}</div>
          </div>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">个人信息</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <myLogin v-model:visible="isOpenLogin">
      <template #header>
        <div class="dialog-hero">
          <div class="dialog-kicker">Welcome back</div>
          <div class="model-title">{{ smsOrPassword ? '手机验证码登录' : '账号密码登录' }}</div>
          <p class="dialog-subtitle">
            {{ smsOrPassword ? '首次登录自动注册' : '欢迎来到旧故里的时光' }}
          </p>
        </div>
      </template>

      <template #body>
        <div v-if="smsOrPassword" class="model-body-content">
          <div class="input-group sms">
            <div class="field-label">手机号</div>
            <div class="phoneAndCode">
              <el-input v-model="loginUserInfo.username" placeholder="请输入手机号" />
              <div class="code" @click="sendSms">
                {{ sendText > 0 ? sendText + '秒后重试' : '发送验证码' }}
              </div>
            </div>
          </div>

          <div class="input-group">
            <div class="field-label">验证码</div>
            <el-input v-model="loginUserInfo.code" type="text" placeholder="请输入验证码" />
          </div>

          <div class="btn-group">
            <el-button
              type="primary"
              :loading="loginSubmitting"
              :disabled="loginSubmitting"
              @click="handleLogin"
              >登录</el-button
            >
          </div>

          <div class="switch-tip">
            手机验证码登录
            <button class="switch-action" type="button" @click="smsOrPassword = false">
              账号密码登录
            </button>
          </div>
        </div>

        <div v-else class="model-body-content">
          <div class="input-group">
            <div class="field-label">用户名</div>
            <el-input v-model="loginUserInfo.username" placeholder="请输入用户名或手机号" />
          </div>

          <div class="input-group">
            <div class="field-label">密码</div>
            <el-input
              v-model="loginUserInfo.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </div>

          <div class="btn-group">
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loginSubmitting"
              :disabled="loginSubmitting"
              >登录</el-button
            >
          </div>

          <div class="switch-tip">
            账号密码登录
            <button class="switch-action" type="button" @click="smsOrPassword = true">
              手机验证码登录
            </button>
          </div>
        </div>
      </template>
    </myLogin>

    <myLogin v-model:visible="isInitPass">
      <template #header>
        <div class="dialog-hero">
          <div class="dialog-kicker">未初始化密码</div>
          <div class="model-title">初始化密码</div>
          <!-- <p class="dialog-subtitle">欢迎来到我的博客</p> -->
        </div>
      </template>
      <template #body>
        <div class="input-group">
          <div class="field-label">密码</div>
          <el-input
            v-model="initPassObj.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </div>
        <div class="input-group">
          <div class="field-label">再次输入密码</div>
          <el-input
            v-model="initPassObj.checkPassword"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </div>
        <div class="btn-group">
          <el-button
            type="primary"
            @click="savePass"
            :loading="sendPassloading"
            :disabled="sendPassloading"
            >修改密码</el-button
          >
        </div>
      </template>
    </myLogin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import myLogin from '@/components/AuthDialog.vue'
import { login, logout, sendSms as pushSms, writePass } from '@/api/userController'
import { FRONT_AUTH_CHANGED_EVENT } from '@/constants/auth'
import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'

const loginUserStore = useLoginUserStore()
const siteInfo = useSiteInfoStore().siteInfo
const router = useRouter()
/**
 * 初始化密码
 */
const isInitPass = ref(false)
const sendPassloading = ref(false)
onMounted(() => {
  initPass()
})

//初始化逻辑
const initPass = () => {
  //获取用户
  let loginuser = loginUserStore.loginUser
  let isInit = loginuser.init
  if (!isInit) return

  isInitPass.value = true
}

const initPassObj = reactive<API.UserRegisterRequest>({
  username: '',
  password: '',
  checkPassword: '',
})

const savePass = async () => {
  if (sendPassloading.value) return
  if (!initPassObj.password) {
    ElMessage.error('密码不能为空')
    return
  }
  if (initPassObj.password.length < 6) {
    ElMessage.error('密码不能小于6位')
    return
  }
  if (initPassObj.password != initPassObj.checkPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }
  sendPassloading.value = true
  let res = await writePass(initPassObj)
  if (res.data.code === 0) {
    ElMessage.success('修改密码成功')
    isInitPass.value = false
  }
  sendPassloading.value = false
}

/**
 * 发送验证码
 */
const isSendLoding = ref(false)
const sendText = ref(0)
const PHONE_KEY = 'sms_last_send_time'
onMounted(() => {
  const lastTime = localStorage.getItem(PHONE_KEY)
  if (lastTime) {
    const now = Date.now()
    const diff = 60000 - (now - parseInt(lastTime))
    if (diff > 0) {
      sendText.value = Math.floor(diff / 1000)
      startTimer()
    }
  }
})

const sendSms = async () => {
  if (isSendLoding.value) return
  if (!loginUserInfo.username) {
    ElMessage.error('请输入手机号')
    return
  }
  //匹配正则
  const usernameRegex = /^1[3-9]\d{9}$/
  if (!usernameRegex.test(loginUserInfo.username)) {
    ElMessage.error('请输入正确的手机号码')
    return
  }
  // 记录发送时间
  localStorage.setItem(PHONE_KEY, Date.now().toString())
  sendText.value = 60
  startTimer()
  //请求代码
  const params: API.UserPhoneRequest = {
    phone: loginUserInfo.username,
  }
  const res = await pushSms(params)
  if (res.data.code === 0) {
    ElMessage.success('发送验证码成功')
  }
}
// 定时器
function startTimer() {
  isSendLoding.value = true
  const timer = setInterval(() => {
    sendText.value--
    if (sendText.value <= 0) {
      clearInterval(timer)
      isSendLoding.value = false
      localStorage.removeItem(PHONE_KEY)
    }
  }, 1000)
}
/**
 * 登录
 */

const isOpenLogin = ref(false)
const smsOrPassword = ref(true)
const loginSubmitting = ref(false)

const loginUserInfo = reactive<API.UserLoginRequest>({
  username: '',
  password: '',
  code: '',
  type: 0,
})
const handleLogin = async () => {
  if (loginSubmitting.value) return
  loginUserInfo.type = smsOrPassword.value ? 0 : 1

  if (loginUserInfo.type == 0) {
    //手机号登录
    if (!loginUserInfo.username) {
      ElMessage.error('请输入手机号')
      return
    }
    //判断手机号格式和验证码是否填写
    //匹配正则
    const usernameRegex = /^1[3-9]\d{9}$/
    if (!usernameRegex.test(loginUserInfo.username)) {
      ElMessage.error('请输入正确的手机号码')
      return
    }
    //验证码
    if (!loginUserInfo.code) {
      ElMessage.error('请输入验证码')
      return
    }
    //处理登录逻辑
    loginSubmitting.value = true

    try {
      const res = await login(loginUserInfo)
      const loginUser = res.data.data

      if (res.data.code === 0 && loginUser) {
        ElMessage.success('登录成功')
        isOpenLogin.value = false
        loginUserInfo.username = ''
        loginUserInfo.password = ''
        loginUserStore.setLoginUser(loginUser)
        initPass()
        window.dispatchEvent(
          new CustomEvent(FRONT_AUTH_CHANGED_EVENT, { detail: { action: 'login' } }),
        )
      }
    } finally {
      loginSubmitting.value = false
    }
  } else if (loginUserInfo.type == 1) {
    //账号密码登录
    if (!loginUserInfo.username || !loginUserInfo.password) {
      ElMessage.error('请填写完整的登录信息')
      return
    }

    const usernameRegex = /^[a-zA-Z0-9]{6,}$/
    if (!usernameRegex.test(loginUserInfo.username)) {
      ElMessage.error('用户名至少 6 位，且只能包含字母和数字')
      return
    }

    if (loginUserInfo.password.length < 6) {
      ElMessage.error('密码至少需要 6 位')
      return
    }

    loginSubmitting.value = true

    try {
      const res = await login(loginUserInfo)
      const loginUser = res.data.data

      if (res.data.code === 0 && loginUser) {
        ElMessage.success('登录成功')
        isOpenLogin.value = false
        loginUserInfo.username = ''
        loginUserInfo.password = ''
        loginUserStore.setLoginUser(loginUser)
        window.dispatchEvent(
          new CustomEvent(FRONT_AUTH_CHANGED_EVENT, { detail: { action: 'login' } }),
        )
      }
    } finally {
      loginSubmitting.value = false
    }
  }
}

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  ElMessageBox.confirm('确定要退出登录吗？', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'info',
    center: true,
  })
    .then(async () => {
      const res = await logout()
      if (res.data.code === 0) {
        loginUserStore.setLoginUser({
          userName: '未登录',
        })
        window.dispatchEvent(
          new CustomEvent(FRONT_AUTH_CHANGED_EVENT, { detail: { action: 'logout' } }),
        )
        ElMessage.success('退出登录成功')
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.person-container > div {
  display: flex;
  align-items: center;
  margin: 20px 20px 20px 10px;
  cursor: pointer;
}

.person-container .btn,
.person-container .name {
  margin-left: 10px;
  color: rgb(55, 55, 56);
  font-weight: 700;
}

.dialog-hero {
  padding-right: 44px;
}

.dialog-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(104, 125, 255, 0.1);
  color: #5d6ef8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.model-title {
  margin-top: 14px;
  color: #18243d;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.dialog-subtitle {
  margin-top: 10px;
  max-width: 320px;
  color: #66738f;
  font-size: 14px;
  line-height: 1.7;
}
/* 手机验证码 */
.model-body-content {
  position: relative;
}
.phoneAndCode {
  position: relative;
}
.phoneAndCode .code {
  position: absolute;
  top: 4px;
  right: 10px;
  padding: 10px;
  color: white;
  border-radius: 13px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #5381e5;
  cursor: pointer;
  font-size: 12px;
  width: 90px;
}
.phoneAndCode .code:hover {
  background-color: #3065d8;
}

.sms .el-input:deep(.el-input__wrapper) input {
  padding-right: 100px;
}

.input-group {
  margin-bottom: 18px;
}
/* .input-group.sms {
  margin-bottom: 78px;
} */

.field-label {
  margin-bottom: 8px;
  color: #44516d;
  font-size: 13px;
  font-weight: 600;
}

.btn-group {
  margin-top: 10px;
}

.switch-tip {
  margin-top: 18px;
  color: #7b859c;
  font-size: 13px;
  text-align: center;
}

.switch-action {
  margin-left: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: #5d6ef8;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.switch-action:hover {
  color: #4459f2;
}

.el-input {
  height: 48px;
}

.el-button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #5d6ef8 0%, #4ba7ff 100%);
  box-shadow: 0 14px 28px rgba(84, 113, 247, 0.28);
}

.el-button:hover {
  background: linear-gradient(135deg, #5262ec 0%, #439cf2 100%);
}

.el-input :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d8e0f2 !important;
  border-radius: 14px;
  background: rgba(246, 248, 255, 0.85);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8) !important;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.el-input:hover :deep(.el-input__wrapper) {
  border-color: #b8c5ec !important;
  background: #ffffff;
}

.el-input :deep(.el-input__wrapper.is-focus) {
  border-color: #6b7cff !important;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(107, 124, 255, 0.12) !important;
}

.el-input :deep(.el-input__inner) {
  color: #1f2a44;
  font-size: 14px;
}

.el-input :deep(.el-input__inner::placeholder) {
  color: #9aa6bf;
}

.avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-info {
  display: flex;
  align-items: center;
  border: none;
}

.login-info:hover {
  border: none;
}

.el-tooltip__trigger:focus-visible {
  outline: unset;
}

.info {
  color: var(--text-color);
  font-size: 14px;
  text-align: right;
  cursor: pointer;
}

@media (max-width: 640px) {
  .model-title {
    font-size: 24px;
  }

  .dialog-subtitle {
    max-width: none;
  }
}
</style>
