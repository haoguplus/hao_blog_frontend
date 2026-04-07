<template>
  <div class="admin-login-page">
    <div class="page-orb page-orb-left"></div>
    <div class="page-orb page-orb-right"></div>

    <div class="login-shell">
      <section class="login-brand">
        <div class="brand-kicker">Admin Access</div>
        <h1>欢迎进入 Hao Blog 管理后台</h1>
        <p>
          登录后可统一管理文章、分类、用户与系统内容。页面延续后台布局的蓝色系风格，方便后续继续扩展。
        </p>

        <div class="brand-highlights">
          <div class="highlight-card">
            <div class="highlight-label">内容中心</div>
            <div class="highlight-value">文章、分类、用户统一管理</div>
          </div>
          <div class="highlight-card">
            <div class="highlight-label">状态反馈</div>
            <div class="highlight-value">内置表单校验、加载态与错误提示</div>
          </div>
        </div>
      </section>

      <section class="login-panel">
        <div class="panel-header">
          <div class="panel-kicker">Sign In</div>
          <h2>管理员登录</h2>
          <p>请输入账号与密码，登录后进入后台工作台。</p>
        </div>

        <el-form
          ref="formRef"
          :model="formState"
          :rules="formRules"
          class="login-form"
          label-position="top"
          @submit.prevent
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formState.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formState.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleSubmit"
            />
          </el-form-item>

          <div class="action-row">
            <el-checkbox v-model="rememberMe">记住本次登录状态</el-checkbox>
            <span class="action-hint">建议使用管理员账号登录</span>
          </div>

          <el-button
            type="primary"
            class="submit-button"
            :loading="submitting"
            @click="handleSubmit"
          >
            登录后台
          </el-button>
        </el-form>

        <div class="panel-footer">
          <span>返回前台站点</span>
          <button type="button" class="back-link" @click="router.push('/')">前往首页</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { adminLogin } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const rememberMe = ref(true)

const formState = reactive<API.UserLoginRequest>({
  username: '',
  password: '',
})

const validateUsername = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }

  if (!/^[a-zA-Z0-9]{6,}$/.test(value)) {
    callback(new Error('用户名至少 6 位，且只能包含字母和数字'))
    return
  }

  callback()
}

const validatePassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }

  if (value.length < 6) {
    callback(new Error('密码至少需要 6 位'))
    return
  }

  callback()
}

const formRules: FormRules<API.UserLoginRequest> = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (!formRef.value) {
    return
  }

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }

  submitting.value = true

  try {
    const res = await adminLogin(formState)
    if (res.data.code === 0 && res.data.data) {
      loginUserStore.setLoginUser(res.data.data)
      ElMessage.success('登录成功，正在进入后台')
      router.push('/admin')
      return
    }
  } catch (error) {
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(95, 129, 255, 0.22), transparent 28%),
    radial-gradient(circle at right bottom, rgba(70, 182, 255, 0.18), transparent 30%),
    linear-gradient(180deg, #eff4fb 0%, #e9f0f8 100%);
}

.page-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  pointer-events: none;
}

.page-orb-left {
  top: 86px;
  left: 8%;
  width: 220px;
  height: 220px;
  background: rgba(83, 123, 255, 0.14);
}

.page-orb-right {
  right: 10%;
  bottom: 72px;
  width: 280px;
  height: 280px;
  background: rgba(73, 179, 255, 0.14);
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(320px, 1.1fr) minmax(320px, 460px);
  gap: 24px;
  align-items: stretch;
  max-width: 1200px;
  margin: 0 auto;
}

.login-brand,
.login-panel {
  border: 1px solid rgba(204, 214, 230, 0.72);
  border-radius: 30px;
  backdrop-filter: blur(14px);
}

.login-brand {
  padding: 42px;
  background:
    radial-gradient(circle at top right, rgba(145, 187, 255, 0.22), transparent 30%),
    linear-gradient(145deg, #1d4fd8, #4e89ff);
  color: #fff;
  box-shadow: 0 24px 60px rgba(38, 70, 133, 0.24);
}

.brand-kicker,
.panel-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-kicker {
  background: rgba(255, 255, 255, 0.16);
}

.login-brand h1 {
  margin: 20px 0 14px;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.15;
}

.login-brand p {
  max-width: 520px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  line-height: 1.85;
}

.brand-highlights {
  display: grid;
  gap: 16px;
  margin-top: 32px;
}

.highlight-card {
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.highlight-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}

.highlight-value {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
}

.login-panel {
  padding: 34px 30px 28px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 22px 54px rgba(48, 74, 120, 0.12);
}

.panel-kicker {
  background: rgba(71, 106, 247, 0.1);
  color: #4a63f1;
}

.panel-header h2 {
  margin: 18px 0 10px;
  color: #1a2742;
  font-size: 30px;
  font-weight: 700;
}

.panel-header p {
  color: #6f7d98;
  font-size: 14px;
  line-height: 1.75;
}

.login-form {
  margin-top: 28px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-form-item__label) {
  padding-bottom: 8px;
  color: #44516d;
  font-size: 13px;
  font-weight: 700;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 48px;
  border: 1px solid #d7e1f0;
  border-radius: 16px;
  background: #f8fbff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  background: #ffffff;
  border-color: #bcc9e4;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  border-color: #6a7cff;
  box-shadow: 0 0 0 4px rgba(106, 124, 255, 0.12);
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 2px 0 22px;
  color: #7a879f;
  font-size: 13px;
}

.action-hint {
  text-align: right;
}

.submit-button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #4566f3 0%, #44a0ff 100%);
  box-shadow: 0 18px 32px rgba(67, 101, 240, 0.24);
}

.submit-button:hover {
  background: linear-gradient(135deg, #3f5ee4 0%, #3d94ef 100%);
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
  color: #7a879f;
  font-size: 13px;
}

.back-link {
  padding: 0;
  border: none;
  background: transparent;
  color: #4265f4;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.back-link:hover {
  color: #3354dc;
}

@media (max-width: 960px) {
  .admin-login-page {
    padding: 18px;
  }

  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand,
  .login-panel {
    padding: 24px 20px;
  }

  .login-brand h1 {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .action-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .panel-header h2 {
    font-size: 26px;
  }
}
</style>
