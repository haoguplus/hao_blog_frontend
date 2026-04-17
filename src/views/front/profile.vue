<template>
  <section class="profile-page">
    <header class="profile-hero">
      <div class="hero-glow hero-glow-left"></div>
      <div class="hero-glow hero-glow-right"></div>

      <div class="hero-main">
        <div class="avatar-panel">
          <el-upload
            class="avatar-uploader"
            action="/api/user/uploadAvatar"
            :show-file-list="false"
            :disabled="avatarUploading"
            :on-success="handleAvatarSuccess"
            :on-progress="handleAvatarProgress"
            :on-error="handleAvatarError"
            :before-upload="beforeAvatarUpload"
            :headers="getAuthHeader()"
          >
            <div class="avatar-shell">
              <img
                v-if="loginUserStore.loginUser.userAvatar"
                :src="avatarUrl"
                class="avatar-image"
                alt="用户头像"
              />
              <div v-else class="avatar-placeholder">
                <el-icon size="44"><User /></el-icon>
              </div>

              <div class="avatar-overlay">
                <el-icon size="18"><Camera /></el-icon>
                <span>{{ avatarUploading ? `上传中 ${avatarUploadPercent}%` : '更换头像' }}</span>
              </div>

              <div v-if="avatarUploading" class="avatar-progress-mask">
                <el-progress
                  type="circle"
                  :percentage="avatarUploadPercent"
                  :width="88"
                  :stroke-width="7"
                  status="success"
                />
                <span class="avatar-progress-text">头像上传中</span>
              </div>
            </div>
          </el-upload>

          <button type="button" class="edit-trigger mobile-only" @click="openEditDialog">
            编辑资料
          </button>
        </div>

        <div class="hero-copy">
          <div class="hero-kicker">Personal Space</div>
          <h1>{{ loginUserStore.loginUser.userName || '未命名用户' }}</h1>
          <p class="hero-account">@{{ loginUserStore.loginUser.userAccount || 'account' }}</p>
          <p class="hero-bio">
            {{
              loginUserStore.loginUser.userProfile ||
              '这里是个人信息页，你可以补充一句更像自己的介绍，让页面更完整也更有识别度。'
            }}
          </p>

          <div class="hero-tags">
            <el-tag
              :type="getRoleType(loginUserStore.loginUser.userRole || '')"
              effect="light"
              round
              class="role-tag"
            >
              {{ getRoleLabel(loginUserStore.loginUser.userRole || '') }}
            </el-tag>
            <span class="hero-chip">资料可编辑</span>
            <span class="hero-chip">头像可上传</span>
          </div>
        </div>
      </div>

      <div class="hero-side">
        <button type="button" class="edit-trigger desktop-only" @click="openEditDialog">
          <el-icon><Edit /></el-icon>
          编辑资料
        </button>

        <div class="stat-card">
          <span class="stat-label">创建时间</span>
          <strong>{{ formatDate(loginUserStore.loginUser.createTime) }}</strong>
          <span class="stat-tip">加入这个空间的时间</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">最后更新</span>
          <strong>{{ formatDate(loginUserStore.loginUser.editTime) }}</strong>
          <span class="stat-tip">最近一次资料调整</span>
        </div>
      </div>
    </header>

    <section class="content-grid">
      <article class="info-card primary-card">
        <div class="card-header">
          <div class="title-wrap">
            <span class="card-icon">
              <el-icon><InfoFilled /></el-icon>
            </span>
            <div>
              <div class="card-kicker">Overview</div>
              <h2>基础信息</h2>
            </div>
          </div>
          <button type="button" class="text-button" @click="openEditDialog">编辑</button>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-label">姓名</span>
            <p class="info-value">{{ loginUserStore.loginUser.userName || '未设置' }}</p>
          </div>

          <div class="info-item">
            <span class="info-label">账号</span>
            <p class="info-value">@{{ loginUserStore.loginUser.userAccount || '未设置' }}</p>
          </div>

          <div class="info-item">
            <span class="info-label">手机号</span>
            <p class="info-value">{{ loginUserStore.loginUser.phone || '未设置' }}</p>
          </div>

          <div class="info-item info-item-large">
            <span class="info-label">个人简介</span>
            <p class="info-value">
              {{
                loginUserStore.loginUser.userProfile ||
                '暂时还没有填写个人简介，点右上角编辑按钮可以补充你的介绍。'
              }}
            </p>
          </div>
        </div>
      </article>

      <article class="info-card secondary-card">
        <div class="card-header">
          <div class="title-wrap">
            <span class="card-icon subtle">
              <el-icon><Clock /></el-icon>
            </span>
            <div>
              <div class="card-kicker">Timeline</div>
              <h2>账户信息</h2>
            </div>
          </div>
        </div>

        <div class="timeline-list">
          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <div class="timeline-title">账户创建</div>
              <div class="timeline-text">{{ formatDate(loginUserStore.loginUser.createTime) }}</div>
            </div>
          </div>

          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <div class="timeline-title">最近编辑</div>
              <div class="timeline-text">{{ formatDate(loginUserStore.loginUser.editTime) }}</div>
            </div>
          </div>

          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <div class="timeline-title">身份角色</div>
              <div class="timeline-text">
                {{ getRoleLabel(loginUserStore.loginUser.userRole || '') }}
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <el-dialog
      v-model="showEditDialog"
      width="min(560px, calc(100vw - 24px))"
      top="4vh"
      class="profile-dialog"
    >
      <template #header>
        <div class="dialog-hero">
          <div class="dialog-kicker">Profile Edit</div>
          <h3>编辑个人信息</h3>
          <p>更新你的显示名称和个人简介，让这个页面更像你自己。</p>
        </div>
      </template>

      <div class="dialog-body">
        <div class="dialog-tips">
          <div class="tip-chip">支持随时修改</div>
          <div class="tip-chip">简介最多 200 字</div>
        </div>

        <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top">
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="editForm.userName" placeholder="请输入你的显示名称" />
          </el-form-item>

          <el-form-item label="个人简介" prop="userProfile">
            <el-input
              v-model="editForm.userProfile"
              type="textarea"
              :rows="5"
              resize="none"
              placeholder="写一点关于你自己的介绍，比如关注方向、正在做的事，或者一句喜欢的话。"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialog-cancel" @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="handleEdit">保存修改</el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, Clock, Edit, InfoFilled, User } from '@element-plus/icons-vue'
import type { FormInstance, UploadProgressEvent } from 'element-plus'
import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'
import { getRoleLabel, getRoleType } from '@/constants/userRoles'
import { updateUser } from '@/api/userController'

const loginUserStore = useLoginUserStore()
const siteInfo = useSiteInfoStore().siteInfo

const showEditDialog = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const avatarUploading = ref(false)
const avatarUploadPercent = ref(0)

const editForm = reactive({
  userName: '',
  userProfile: '',
})

const editRules = {
  userName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 20, message: '姓名长度在 1 到 20 个字符', trigger: 'blur' },
  ],
  userProfile: [{ max: 200, message: '简介不能超过 200 个字符', trigger: 'blur' }],
}

const avatarUrl = computed(() => {
  const { userAvatar } = loginUserStore.loginUser
  if (!userAvatar) return ''
  return `${siteInfo.imageUrl || ''}${userAvatar}`
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知'

  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getAuthHeader = () => {
  return {}
}

const handleAvatarSuccess = (response: any) => {
  if (response.code === 0) {
    avatarUploading.value = false
    avatarUploadPercent.value = 100
    ElMessage.success('头像上传成功')
    loginUserStore.fetchLoginUser()
    return
  }

  avatarUploading.value = false
  avatarUploadPercent.value = 0
  ElMessage.error(response.msg || '上传失败')
}

const handleAvatarProgress = (event: UploadProgressEvent) => {
  avatarUploading.value = true
  avatarUploadPercent.value = Math.min(99, Math.max(0, Math.round(event.percent || 0)))
}

const handleAvatarError = () => {
  avatarUploading.value = false
  avatarUploadPercent.value = 0
  ElMessage.error('头像上传失败，请稍后重试')
}

const beforeAvatarUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage.error('只支持 JPG、PNG、GIF 格式的图片')
    return false
  }

  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }

  avatarUploading.value = true
  avatarUploadPercent.value = 0
  return true
}

const openEditDialog = () => {
  editForm.userName = loginUserStore.loginUser.userName || ''
  editForm.userProfile = loginUserStore.loginUser.userProfile || ''
  showEditDialog.value = true
}

const handleEdit = async () => {
  if (!editFormRef.value) return

  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  editLoading.value = true

  try {
    const updateData = {
      id: loginUserStore.loginUser.id,
      userName: editForm.userName,
      userProfile: editForm.userProfile,
    }

    const res = await updateUser(updateData)

    if (res.data.code === 0) {
      ElMessage.success('个人信息更新成功')
      showEditDialog.value = false
      loginUserStore.fetchLoginUser()
      return
    }

    ElMessage.error(res.data.msg || '更新失败')
  } catch {
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    editLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.profile-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.9fr);
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(145, 172, 208, 0.26);
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(104, 149, 255, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 249, 255, 0.95));
  box-shadow: 0 24px 52px rgba(21, 57, 108, 0.12);
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(8px);
}

.hero-glow-left {
  left: -42px;
  top: -42px;
  width: 180px;
  height: 180px;
  background: rgba(109, 147, 255, 0.18);
}

.hero-glow-right {
  right: -36px;
  bottom: -40px;
  width: 220px;
  height: 220px;
  background: rgba(104, 200, 255, 0.12);
}

.hero-main,
.hero-side {
  position: relative;
  z-index: 1;
}

.hero-main {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
}

.avatar-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.avatar-shell {
  position: relative;
  width: 144px;
  height: 144px;
  overflow: hidden;
  border: 5px solid rgba(255, 255, 255, 0.92);
  border-radius: 32px;
  background: linear-gradient(135deg, #edf3ff, #dae7ff);
  box-shadow:
    0 18px 40px rgba(35, 77, 146, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease;
}

.avatar-shell:hover {
  transform: translateY(-4px) rotate(-1deg);
  box-shadow:
    0 24px 48px rgba(35, 77, 146, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.avatar-image,
.avatar-placeholder {
  width: 100%;
  height: 100%;
}

.avatar-image {
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6d83a8;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(180deg, rgba(18, 40, 75, 0.12), rgba(18, 40, 75, 0.7));
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.24s ease;
}

.avatar-shell:hover .avatar-overlay {
  opacity: 1;
}

.avatar-progress-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(180deg, rgba(15, 33, 63, 0.3), rgba(15, 33, 63, 0.82));
  backdrop-filter: blur(4px);
}

.avatar-progress-text {
  color: rgba(255, 255, 255, 0.96);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

:deep(.avatar-progress-mask .el-progress-circle__track) {
  stroke: rgba(255, 255, 255, 0.18);
}

:deep(.avatar-progress-mask .el-progress__text) {
  color: #fff !important;
  font-size: 18px !important;
  font-weight: 800;
}

.hero-kicker,
.card-kicker {
  color: #8095b4;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin-top: 12px;
  color: #173154;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.1;
}

.hero-account {
  margin-top: 8px;
  color: #6280a7;
  font-size: 15px;
  font-weight: 600;
}

.hero-bio {
  max-width: 640px;
  margin-top: 14px;
  color: #5b7398;
  font-size: 15px;
  line-height: 1.85;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.role-tag {
  min-height: 34px;
  padding: 0 12px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(165, 186, 219, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #547094;
  font-size: 12px;
  font-weight: 700;
}

.hero-side {
  display: grid;
  gap: 14px;
}

.edit-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 18px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #456ddb, #59b2e6);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(38, 82, 159, 0.18);
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 124px;
  padding: 20px;
  border: 1px solid rgba(160, 182, 214, 0.26);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.stat-label,
.stat-tip {
  color: #7c92b1;
  font-size: 12px;
}

.stat-card strong {
  margin: 8px 0 6px;
  color: #17365b;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.5;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 18px;
}

.info-card {
  padding: 24px;
  border: 1px solid rgba(152, 176, 209, 0.24);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 18px 38px rgba(22, 58, 109, 0.1);
}

.primary-card {
  background:
    radial-gradient(circle at top right, rgba(121, 167, 255, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(76, 120, 224, 0.12);
  color: #456fba;
  font-size: 20px;
}

.card-icon.subtle {
  background: rgba(90, 169, 211, 0.12);
  color: #357da3;
}

.card-header h2 {
  margin-top: 6px;
  color: #173254;
  font-size: 24px;
  font-weight: 800;
}

.text-button {
  border: none;
  background: transparent;
  color: #4c6fa2;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-item {
  padding: 16px 18px;
  border: 1px solid rgba(165, 184, 214, 0.22);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.76);
}

.info-item-large {
  grid-column: 1 / -1;
}

.info-label {
  display: block;
  margin-bottom: 10px;
  color: #8195b3;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-value {
  color: #28486e;
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  word-break: break-word;
}

.timeline-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-left: 18px;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: linear-gradient(180deg, rgba(88, 132, 221, 0.32), rgba(103, 191, 224, 0.16));
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 14px;
}

.timeline-dot {
  position: absolute;
  left: -18px;
  top: 8px;
  width: 12px;
  height: 12px;
  border: 3px solid #f8fbff;
  border-radius: 50%;
  background: linear-gradient(135deg, #5d88e9, #63bfe2);
  box-shadow: 0 8px 18px rgba(56, 98, 172, 0.2);
}

.timeline-content {
  padding: 4px 0 0 8px;
}

.timeline-title {
  color: #24456c;
  font-size: 15px;
  font-weight: 700;
}

.timeline-text {
  margin-top: 6px;
  color: #6d82a1;
  font-size: 14px;
  line-height: 1.7;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-hero {
  position: relative;
  margin: -22px -24px 0;
  padding: 24px 24px 18px;
  background:
    radial-gradient(circle at top left, rgba(103, 145, 243, 0.18), transparent 30%),
    linear-gradient(135deg, rgba(247, 250, 255, 0.98), rgba(239, 246, 255, 0.96));
  border-bottom: 1px solid rgba(197, 211, 231, 0.5);
}

.dialog-kicker {
  color: #7f93b1;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dialog-hero h3 {
  margin-top: 10px;
  color: #183255;
  font-size: 24px;
  font-weight: 800;
}

.dialog-hero p {
  margin-top: 8px;
  color: #6480a4;
  font-size: 14px;
  line-height: 1.75;
}

.dialog-body {
  padding-top: 8px;
}

.dialog-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.tip-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(170, 189, 216, 0.3);
  border-radius: 999px;
  background: rgba(247, 250, 255, 0.9);
  color: #547095;
  font-size: 12px;
  font-weight: 700;
}

.dialog-cancel {
  border-color: rgba(164, 183, 214, 0.42);
  color: #557195;
}

.desktop-only {
  display: inline-flex;
}

.mobile-only {
  display: none;
}

:deep(.profile-dialog .el-dialog) {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 70px rgba(20, 55, 104, 0.22);
  max-width: calc(100vw - 24px);
}

:deep(.profile-dialog .el-dialog__header) {
  padding: 22px 24px 0;
  margin-right: 0;
}

:deep(.profile-dialog .el-dialog__body) {
  padding: 0 24px 12px;
}

:deep(.profile-dialog .el-dialog__footer) {
  padding: 12px 24px 22px;
  border-top: 1px solid rgba(225, 233, 243, 0.72);
  background: rgba(250, 252, 255, 0.86);
}

:deep(.profile-dialog .el-input__wrapper),
:deep(.profile-dialog .el-textarea__inner) {
  border-radius: 14px;
  border: 1px solid rgba(177, 193, 217, 0.34);
  box-shadow:
    0 8px 18px rgba(34, 71, 126, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

:deep(.profile-dialog .el-input__wrapper:hover),
:deep(.profile-dialog .el-textarea__inner:hover) {
  border-color: rgba(105, 142, 211, 0.42);
}

:deep(.profile-dialog .el-input__wrapper.is-focus),
:deep(.profile-dialog .el-textarea__inner:focus) {
  border-color: rgba(79, 124, 212, 0.64);
  box-shadow:
    0 0 0 4px rgba(83, 127, 215, 0.12),
    0 10px 22px rgba(41, 79, 140, 0.08);
}

:deep(.profile-dialog .el-form-item__label) {
  color: #32517d;
  font-size: 13px;
  font-weight: 700;
}

:deep(.profile-dialog .el-textarea__inner) {
  min-height: 140px !important;
  line-height: 1.8;
}

@media (max-width: 980px) {
  .profile-hero,
  .content-grid,
  .hero-main {
    grid-template-columns: 1fr;
  }

  .hero-main {
    justify-items: center;
    text-align: center;
  }

  .hero-bio {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-tags {
    justify-content: center;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .profile-page {
    gap: 16px;
  }

  .profile-hero,
  .info-card {
    padding: 18px;
    border-radius: 24px;
  }

  .hero-copy h1 {
    font-size: 30px;
  }

  .avatar-shell {
    width: 120px;
    height: 120px;
    border-radius: 28px;
  }

  :deep(.avatar-progress-mask .el-progress) {
    transform: scale(0.88);
  }

  .info-list {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dialog-hero {
    margin: -18px -18px 0;
    padding: 18px 18px 14px;
  }

  .dialog-hero h3 {
    font-size: 20px;
  }

  .dialog-hero p {
    font-size: 13px;
    line-height: 1.65;
  }

  .dialog-body {
    padding-top: 0;
  }

  .dialog-tips {
    gap: 8px;
    margin-bottom: 14px;
  }

  .tip-chip {
    min-height: 30px;
    padding: 0 12px;
    font-size: 11px;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .dialog-footer :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  :deep(.profile-dialog .el-dialog) {
    max-width: calc(100vw - 16px);
  }

  :deep(.profile-dialog .el-dialog__header) {
    padding: 18px 18px 0;
  }

  :deep(.profile-dialog .el-dialog__body) {
    padding: 0 18px 10px;
  }

  :deep(.profile-dialog .el-dialog__footer) {
    padding: 10px 18px 18px;
  }

  :deep(.profile-dialog .el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.profile-dialog .el-textarea__inner) {
    min-height: 120px !important;
  }
}
</style>
