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
          <div class="dialog-kicker">{{ loginOrRegister ? 'Welcome back' : 'Create account' }}</div>
          <div class="model-title">{{ loginOrRegister ? '登录你的账号' : '创建新的账号' }}</div>
          <p class="dialog-subtitle">
            {{
              loginOrRegister
                ? '继续访问你的博客空间、个人资料和互动内容。'
                : '花一分钟完成注册，马上开始你的博客之旅。'
            }}
          </p>
        </div>
      </template>

      <template #body>
        <div v-if="loginOrRegister" class="model-body-content">
          <div class="input-group">
            <div class="field-label">用户名</div>
            <el-input v-model="loginUserInfo.username" placeholder="请输入用户名" />
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
            <el-button type="primary" @click="handleLogin">登录</el-button>
          </div>

          <div class="switch-tip">
            还没有账号？
            <button class="switch-action" type="button" @click="loginOrRegister = false">
              立即注册
            </button>
          </div>
        </div>

        <div v-else class="model-body-content">
          <div class="input-group">
            <div class="field-label">用户名</div>
            <el-input v-model="registerUserInfo.username" placeholder="请输入用户名" />
          </div>

          <div class="input-group">
            <div class="field-label">密码</div>
            <el-input
              v-model="registerUserInfo.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </div>

          <div class="input-group">
            <div class="field-label">确认密码</div>
            <el-input
              v-model="registerUserInfo.checkPassword"
              type="password"
              show-password
              placeholder="请再次输入密码"
            />
          </div>

          <div class="btn-group">
            <el-button type="primary" @click="handleRegister">注册</el-button>
          </div>

          <div class="switch-tip">
            已有账号？
            <button class="switch-action" type="button" @click="loginOrRegister = true">
              去登录
            </button>
          </div>
        </div>
      </template>
    </myLogin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import myLogin from '@/components/AuthDialog.vue'
import { login, logout, regist } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'

const loginUserStore = useLoginUserStore()
const siteInfo = useSiteInfoStore().siteInfo
const router = useRouter()

const isOpenLogin = ref(false)
const loginOrRegister = ref(true)

const registerUserInfo = reactive<API.UserRegisterRequest>({
  username: '',
  password: '',
  checkPassword: '',
})

const loginUserInfo = reactive<API.UserLoginRequest>({
  username: '',
  password: '',
})

const handleRegister = async () => {
  if (!registerUserInfo.username || !registerUserInfo.password || !registerUserInfo.checkPassword) {
    ElMessage.error('请填写完整的注册信息')
    return
  }

  const usernameRegex = /^[a-zA-Z0-9]{6,}$/
  if (!usernameRegex.test(registerUserInfo.username)) {
    ElMessage.error('用户名至少 6 位，且只能包含字母和数字')
    return
  }

  if (registerUserInfo.password.length < 6) {
    ElMessage.error('密码至少需要 6 位')
    return
  }

  if (registerUserInfo.password !== registerUserInfo.checkPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  const res = await regist(registerUserInfo)
  if (res.data.code === 0 && res.data.data) {
    ElMessage.success('注册成功')
    loginOrRegister.value = true
    registerUserInfo.username = ''
    registerUserInfo.password = ''
    registerUserInfo.checkPassword = ''
  }
}

const handleLogin = async () => {
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

  const res = await login(loginUserInfo)
  const loginUser = res.data.data

  if (res.data.code === 0 && loginUser) {
    ElMessage.success('登录成功')
    isOpenLogin.value = false
    loginUserInfo.username = ''
    loginUserInfo.password = ''
    loginUserStore.setLoginUser(loginUser)
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

.model-body-content {
  position: relative;
}

.input-group {
  margin-bottom: 18px;
}

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
