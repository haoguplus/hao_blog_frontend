<template>
  <section class="settings-page">
    <header class="page-hero">
      <div class="hero-main">
        <div class="hero-copy">
          <div class="hero-kicker">System Settings</div>
          <h2>系统设置</h2>
          <p>
            统一维护站点名称、SEO 描述、版权备案和评论开关。保存后会同步更新当前前台站点信息，
            方便你直接查看实际效果。
          </p>
        </div>

        <div class="hero-meta">
          <div class="hero-meta-item">
            <span class="hero-meta-label">当前站点</span>
            <strong>{{ summarySiteName }}</strong>
          </div>
          <div class="hero-meta-item">
            <span class="hero-meta-label">评论状态</span>
            <el-tag
              round
              effect="dark"
              :type="settingsForm.commentStatus === '0' ? 'danger' : 'success'"
            >
              {{ commentStatusLabel }}
            </el-tag>
          </div>
          <div class="hero-meta-item">
            <span class="hero-meta-label">SEO 关键词</span>
            <strong>{{ previewKeywords.length }} 组</strong>
          </div>
        </div>

        <div class="hero-highlights">
          <div class="highlight-pill">
            <span class="highlight-dot highlight-dot-blue"></span>
            <span>基础配置统一维护</span>
          </div>
          <div class="highlight-pill">
            <span class="highlight-dot highlight-dot-green"></span>
            <span>保存后即时同步前台</span>
          </div>
          <div class="highlight-pill">
            <span class="highlight-dot highlight-dot-amber"></span>
            <span>支持 SEO 信息预览</span>
          </div>
        </div>
      </div>

      <div class="hero-panel">
        <div class="hero-panel-top">
          <div>
            <div class="hero-panel-kicker">Configuration Overview</div>
            <h3>配置状态</h3>
          </div>
          <el-button type="primary" plain :loading="loading" @click="loadSettings"
            >刷新配置</el-button
          >
        </div>

        <div class="hero-stats">
          <div class="stat-card stat-card-primary">
            <div class="stat-label">站点名称</div>
            <div class="stat-value">{{ summarySiteName }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">作者信息</div>
            <div class="stat-value">{{ settingsForm.siteAuthor || '未设置' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">页面标题预览</div>
            <div class="stat-value stat-value-compact">{{ previewTitle }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">备案信息</div>
            <div
              class="stat-value stat-value-compact"
              v-html="settingsForm.siteIcp || '未设置'"
            ></div>
          </div>
        </div>
      </div>
    </header>

    <section class="settings-grid">
      <div class="settings-card">
        <div class="card-header">
          <div>
            <div class="card-kicker">Site Content</div>
            <h3>基础信息</h3>
          </div>
        </div>

        <el-form
          ref="formRef"
          :model="settingsForm"
          :rules="formRules"
          label-position="top"
          class="settings-form"
        >
          <div class="form-grid">
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="settingsForm.siteName" maxlength="30" show-word-limit />
            </el-form-item>

            <el-form-item label="站点标题" prop="siteTitle">
              <el-input
                v-model="settingsForm.siteTitle"
                maxlength="50"
                show-word-limit
                placeholder="例如：个人技术与生活随笔"
              />
            </el-form-item>

            <el-form-item label="作者名称" prop="siteAuthor">
              <el-input
                v-model="settingsForm.siteAuthor"
                maxlength="20"
                show-word-limit
                placeholder="请输入站点作者"
              />
            </el-form-item>

            <el-form-item label="评论开关" prop="commentStatus">
              <el-segmented
                v-model="settingsForm.commentStatus"
                :options="commentOptions"
                class="comment-toggle"
              />
            </el-form-item>
          </div>

          <el-form-item label="站点简介" prop="siteIntroduction">
            <el-input
              v-model="settingsForm.siteIntroduction"
              type="textarea"
              :rows="4"
              maxlength="160"
              show-word-limit
              resize="none"
              placeholder="用于首页和后台概览展示"
            />
          </el-form-item>

          <el-form-item label="站点关键词" prop="siteKeywords">
            <el-input
              v-model="settingsForm.siteKeywords"
              maxlength="120"
              show-word-limit
              placeholder="多个关键词建议用英文逗号分隔"
            />
          </el-form-item>

          <el-form-item label="站点描述" prop="siteDescription">
            <el-input
              v-model="settingsForm.siteDescription"
              type="textarea"
              :rows="4"
              maxlength="220"
              show-word-limit
              resize="none"
              placeholder="用于浏览器描述和搜索摘要"
            />
          </el-form-item>

          <div class="form-grid form-grid-secondary">
            <el-form-item label="版权信息" prop="siteCopyright">
              <el-input
                v-model="settingsForm.siteCopyright"
                maxlength="80"
                show-word-limit
                placeholder="例如：Copyright © 2026 Hao Blog"
              />
            </el-form-item>

            <el-form-item label="ICP备案号" prop="siteIcp" class="icp-form-item">
              <el-input
                v-model="settingsForm.siteIcp"
                type="textarea"
                :rows="3"
                resize="none"
                placeholder="例如：沪 ICP 备 2026000000 号"
              />
            </el-form-item>
          </div>
        </el-form>

        <div class="card-actions">
          <el-button @click="resetForm">重置为当前配置</el-button>
          <el-button type="primary" :loading="saving" @click="submitForm">保存系统设置</el-button>
        </div>
      </div>

      <aside class="settings-side">
        <div class="settings-card side-card preview-card">
          <div class="card-kicker">Live Preview</div>
          <h3>{{ previewTitle }}</h3>
          <p>
            {{ settingsForm.siteDescription || settingsForm.siteIntroduction || '暂无站点描述' }}
          </p>

          <div class="preview-tags">
            <span v-for="tag in previewKeywords" :key="tag" class="preview-tag">{{ tag }}</span>
            <span v-if="previewKeywords.length === 0" class="preview-empty">未设置关键词</span>
          </div>
        </div>

        <div class="settings-card side-card">
          <div class="card-kicker">Publishing Notes</div>
          <h3>发布建议</h3>
          <ul class="tips-list">
            <li>站点名称和站点标题会共同影响浏览器标题展示。</li>
            <li>关键词建议控制在 3 到 8 组，便于前台 SEO 维护。</li>
            <li>关闭评论后建议前台同步隐藏评论入口，避免空交互。</li>
            <li>保存成功后，这个页面会自动同步刷新当前站点信息。</li>
          </ul>
        </div>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getSysConfig, setSysConfig } from '@/api/sysconfigController'
import { useSiteInfoStore } from '@/stores/siteInfo'

const siteInfoStore = useSiteInfoStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)

const settingsForm = reactive<API.SysConfigUpdateRequest>({
  siteName: '',
  siteTitle: '',
  siteIntroduction: '',
  siteAuthor: '',
  siteKeywords: '',
  siteDescription: '',
  siteCopyright: '',
  siteIcp: '',
  commentStatus: 'open',
})

const initialForm = ref<API.SysConfigUpdateRequest>({
  siteName: '',
  siteTitle: '',
  siteIntroduction: '',
  siteAuthor: '',
  siteKeywords: '',
  siteDescription: '',
  siteCopyright: '',
  siteIcp: '',
  commentStatus: 'open',
})

const commentOptions = [
  { label: '开启评论', value: '1' },
  { label: '关闭评论', value: '0' },
]

const formRules: FormRules<API.SysConfigUpdateRequest> = {
  siteName: [{ required: true, message: '请输入站点名称', trigger: 'blur' }],
  siteTitle: [{ required: true, message: '请输入站点标题', trigger: 'blur' }],
  siteAuthor: [{ required: true, message: '请输入站点作者', trigger: 'blur' }],
  siteIntroduction: [{ required: true, message: '请输入站点简介', trigger: 'blur' }],
  siteKeywords: [{ required: true, message: '请输入站点关键词', trigger: 'blur' }],
  siteDescription: [{ required: true, message: '请输入站点描述', trigger: 'blur' }],
}

const summarySiteName = computed(() => settingsForm.siteName || '未设置')

const commentStatusLabel = computed(() =>
  settingsForm.commentStatus === 'close' ? '已关闭评论' : '已开启评论',
)

const previewTitle = computed(() => {
  if (!settingsForm.siteName && !settingsForm.siteTitle) {
    return '未设置站点标题'
  }

  return [settingsForm.siteName, settingsForm.siteTitle].filter(Boolean).join(' - ')
})

const previewKeywords = computed(() =>
  (settingsForm.siteKeywords || '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6),
)

const applyFormData = (config?: API.SysConfigVo | API.SysConfigUpdateRequest) => {
  settingsForm.siteName = config?.siteName || ''
  settingsForm.siteTitle = config?.siteTitle || ''
  settingsForm.siteIntroduction = config?.siteIntroduction || ''
  settingsForm.siteAuthor = config?.siteAuthor || ''
  settingsForm.siteKeywords = config?.siteKeywords || ''
  settingsForm.siteDescription = config?.siteDescription || ''
  settingsForm.siteCopyright = config?.siteCopyright || ''
  settingsForm.siteIcp = config?.siteIcp || ''
  settingsForm.commentStatus = config?.commentStatus === '0' ? '0' : '1'
}

const syncDocumentMeta = () => {
  document.title = previewTitle.value

  const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null
  const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null

  if (metaKeywords) {
    metaKeywords.content = settingsForm.siteKeywords || ''
  }

  if (metaDesc) {
    metaDesc.content = settingsForm.siteDescription || ''
  }
}

const syncSiteStore = () => {
  siteInfoStore.setSiteInfo({
    ...siteInfoStore.siteInfo,
    siteName: settingsForm.siteName,
    siteTitle: settingsForm.siteTitle,
    siteIntroduction: settingsForm.siteIntroduction,
    siteAuthor: settingsForm.siteAuthor,
    siteKeywords: settingsForm.siteKeywords,
    siteDescription: settingsForm.siteDescription,
    siteCopyright: settingsForm.siteCopyright,
    siteIcp: settingsForm.siteIcp,
  })
}

const loadSettings = async () => {
  loading.value = true

  try {
    const res = await getSysConfig()

    if (res.data.code === 0 && res.data.data) {
      applyFormData(res.data.data)
      initialForm.value = {
        siteName: settingsForm.siteName,
        siteTitle: settingsForm.siteTitle,
        siteIntroduction: settingsForm.siteIntroduction,
        siteAuthor: settingsForm.siteAuthor,
        siteKeywords: settingsForm.siteKeywords,
        siteDescription: settingsForm.siteDescription,
        siteCopyright: settingsForm.siteCopyright,
        siteIcp: settingsForm.siteIcp,
        commentStatus: settingsForm.commentStatus,
      }
      return
    }

    ElMessage.error(res.data.msg || '获取系统配置失败')
  } catch {
    ElMessage.error('获取系统配置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  applyFormData(initialForm.value)
  formRef.value?.clearValidate()
}

const submitForm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true

  try {
    const payload: API.SysConfigUpdateRequest = {
      siteName: settingsForm.siteName?.trim(),
      siteTitle: settingsForm.siteTitle?.trim(),
      siteIntroduction: settingsForm.siteIntroduction?.trim(),
      siteAuthor: settingsForm.siteAuthor?.trim(),
      siteKeywords: settingsForm.siteKeywords?.trim(),
      siteDescription: settingsForm.siteDescription?.trim(),
      siteCopyright: settingsForm.siteCopyright?.trim(),
      siteIcp: settingsForm.siteIcp?.trim(),
      commentStatus: settingsForm.commentStatus,
    }

    const res = await setSysConfig(payload)

    if (res.data.code === 0) {
      applyFormData(payload)
      initialForm.value = { ...payload }
      syncSiteStore()
      syncDocumentMeta()
      ElMessage.success('系统设置已保存')
      return
    }
  } catch {
    ElMessage.error('保存系统配置失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.95fr);
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(94, 145, 255, 0.22), transparent 28%),
    radial-gradient(circle at right bottom, rgba(89, 198, 255, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(244, 248, 255, 0.9));
  box-shadow: 0 22px 48px rgba(47, 78, 126, 0.11);
}

.hero-main {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.hero-kicker,
.card-kicker,
.hero-panel-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(72, 112, 255, 0.1);
  color: #4064f6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h2 {
  margin: 16px 0 12px;
  color: #1d2b47;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-copy p {
  max-width: 760px;
  color: #60708f;
  font-size: 15px;
  line-height: 1.8;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(197, 211, 233, 0.75);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #28405f;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.hero-meta-label {
  color: #7d8ba6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hero-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.highlight-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(203, 216, 236, 0.8);
  color: #4f6284;
  font-size: 13px;
  font-weight: 600;
}

.highlight-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.highlight-dot-blue {
  background: #4f7cff;
  box-shadow: 0 0 0 5px rgba(79, 124, 255, 0.14);
}

.highlight-dot-green {
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
}

.highlight-dot-amber {
  background: #f59e0b;
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.14);
}

.hero-panel {
  padding: 22px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(107, 145, 255, 0.12), transparent 32%),
    rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(205, 216, 234, 0.86);
  box-shadow:
    0 18px 36px rgba(52, 84, 133, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
}

.hero-panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.hero-panel-top h3 {
  margin-top: 10px;
  color: #1a2a46;
  font-size: 20px;
  font-weight: 700;
}

.hero-stats {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-card {
  min-height: 120px;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f9fbff, #eef4ff);
  border: 1px solid rgba(204, 216, 235, 0.86);
}

.stat-card-primary {
  background:
    radial-gradient(circle at top right, rgba(109, 147, 255, 0.18), transparent 36%),
    linear-gradient(145deg, #eef4ff, #e2eeff);
}

.stat-label {
  color: #7d8ba6;
  font-size: 13px;
}

.stat-value {
  margin-top: 10px;
  color: #233553;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.stat-value-compact {
  font-size: 16px;
}

.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 18px;
  align-items: start;
}

.settings-card {
  padding: 22px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 36px rgba(47, 78, 126, 0.08);
}

.card-header,
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.card-header h3,
.side-card h3 {
  margin-top: 12px;
  color: #1a2a46;
  font-size: 24px;
  font-weight: 700;
}

.settings-form {
  margin-top: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-grid-secondary {
  margin-top: 4px;
}

.icp-form-item {
  grid-column: 1 / -1;
}

.icp-form-item :deep(.el-textarea__inner) {
  min-height: 96px;
}

.comment-toggle {
  width: 100%;
}

.card-actions {
  margin-top: 8px;
}

.settings-side {
  display: grid;
  gap: 18px;
}

.preview-card {
  background:
    radial-gradient(circle at top right, rgba(110, 147, 255, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(247, 250, 255, 0.98), rgba(238, 244, 255, 0.94));
}

.preview-card p {
  margin-top: 12px;
  color: #60708f;
  font-size: 14px;
  line-height: 1.85;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.preview-tag,
.preview-empty {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(70, 102, 241, 0.1);
  color: #4460e5;
  font-size: 13px;
  font-weight: 600;
}

.preview-empty {
  color: #7b89a3;
  background: rgba(123, 137, 163, 0.1);
}

.tips-list {
  display: grid;
  gap: 12px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.tips-list li {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f9fbff, #f2f6ff);
  color: #5b6e91;
  font-size: 14px;
  line-height: 1.7;
}

:deep(.settings-form .el-form-item) {
  margin-bottom: 20px;
}

:deep(.settings-form .el-form-item__label) {
  padding-bottom: 8px;
  color: #44516d;
  font-size: 13px;
  font-weight: 700;
}

:deep(.settings-form .el-input__wrapper),
:deep(.settings-form .el-textarea__inner),
:deep(.comment-toggle.el-segmented) {
  border-radius: 16px;
}

:deep(.settings-form .el-input__wrapper) {
  min-height: 46px;
  background: #f8fbff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

:deep(.settings-form .el-textarea__inner) {
  min-height: 110px;
  background: #f8fbff;
}

@media (max-width: 1100px) {
  .page-hero,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-hero,
  .settings-card {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-copy h2 {
    font-size: 26px;
  }

  .hero-meta,
  .hero-highlights,
  .hero-panel-top {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .card-actions :deep(.el-button) {
    flex: 1;
  }
}
</style>
