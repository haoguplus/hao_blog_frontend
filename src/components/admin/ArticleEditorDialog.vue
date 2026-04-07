<template>
  <el-dialog
    v-model="dialogVisible"
    :width="dialogWidth"
    :fullscreen="isMobile"
    class="article-dialog"
    modal-class="article-dialog-overlay"
    destroy-on-close
    @closed="handleClosed"
  >
    <template #header>
      <div class="dialog-hero">
        <div class="dialog-kicker">{{ mode === 'create' ? 'New Article' : 'Edit Article' }}</div>
        <div class="dialog-hero-main">
          <div>
            <h3>{{ mode === 'create' ? '新增文章' : '编辑文章' }}</h3>
          </div>

        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-position="top"
      class="article-form"
    >
      <section class="section-card">
        <div class="section-heading">
          <div>
            <h4>基础信息</h4>
            <p>先补齐标题、分类和摘要，让文章在列表页中更完整。</p>
          </div>
          <div class="section-chip">必填优先</div>
        </div>

        <div class="form-grid">
          <el-form-item label="文章标题" prop="title">
            <el-input
              v-model="form.title"
              maxlength="80"
              show-word-limit
              placeholder="请输入文章标题"
            />
          </el-form-item>

          <el-form-item label="文章分类" prop="categoryId">
            <el-select v-model="form.categoryId" placeholder="请选择文章分类">
              <el-option
                v-for="category in normalizedCategoryOptions"
                :key="category.id"
                :label="category.name || '未命名分类'"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item class="cover-upload-item" label="文章封面">
          <div class="cover-upload-wrap">
            <el-upload
              class="cover-uploader"
              action="/api/article/uploadCover"
              :show-file-list="false"
              accept="image/jpeg,image/png,image/webp"
              :before-upload="beforeCoverUpload"
              :on-success="handleCoverSuccess"
              :on-error="handleCoverError"
            >
              <div class="cover-avatar-shell">
                <el-avatar
                  v-if="form.coverImage"
                  shape="square"
                  :size="116"
                  :src="siteInfo.imageUrl + form.coverImage"
                  class="cover-avatar"
                />
                <el-avatar
                  v-else
                  shape="square"
                  :size="116"
                  class="cover-avatar cover-avatar-empty"
                >
                  <el-icon :size="24"><Plus /></el-icon>
                </el-avatar>

                <div class="cover-avatar-overlay">
                  {{ form.coverImage ? '更换封面' : '上传封面' }}
                </div>
              </div>
            </el-upload>

            <div class="cover-helper">建议使用 JPG、PNG、WEBP，大小不超过 2MB。</div>
          </div>
        </el-form-item>
        <div class="section-heading">
          <div>
            <h4>正文内容</h4>
          </div>
          <div class="editor-switch-wrap">
            <div class="section-chip section-chip-accent">WYSIWYG</div>
            <el-segmented v-model="editorType" :options="editorTypeOptions" class="editor-switch" />
          </div>
        </div>

        <el-form-item class="editor-item" label="文章内容" prop="content">
          <VditorEditor
            v-model="form.content"
            :height="editorHeight"
            :editor-type="editorType"
            placeholder="请输入 Markdown 内容..."
          />
        </el-form-item>
      </section>

      <section class="section-card section-card-editor">
        <el-form-item class="summary-item" label="文章摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="4"
            resize="none"
            maxlength="180"
            show-word-limit
            placeholder="输入文章摘要，用于文章列表和推荐位展示"
          />
        </el-form-item>
      </section>

      <section class="section-card">
        <div class="section-heading">
          <div>
            <h4>发布设置</h4>
            <p>设置标签、状态以及前台展示行为。</p>
          </div>
        </div>

        <div class="form-stack">
          <el-form-item label="文章标签">
            <el-select
              v-model="form.tags"
              multiple
              filterable
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择标签"
            >
              <el-option
                v-for="tag in normalizedTagOptions"
                :key="tag.id"
                :label="tag.name || '未命名标签'"
                :value="tag.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="发布状态">
            <el-segmented v-model="form.status" :options="statusOptions" />
          </el-form-item>

          <div class="switch-grid">
            <div class="switch-card">
              <div>
                <div class="switch-title">允许评论</div>
                <div class="switch-desc">关闭后前台不显示该文章评论入口</div>
              </div>
              <el-switch v-model="switches.isComment" />
            </div>

            <div class="switch-card">
              <div>
                <div class="switch-title">设为置顶</div>
                <div class="switch-desc">文章会优先展示在推荐区域</div>
              </div>
              <el-switch v-model="switches.isTop" />
            </div>

            <div class="switch-card">
              <div>
                <div class="switch-title">热门推荐</div>
                <div class="switch-desc">用于后台和前台的热点标识</div>
              </div>
              <el-switch v-model="switches.isHot" />
            </div>

            <div class="switch-card">
              <div>
                <div class="switch-title">加密阅读</div>
                <div class="switch-desc">开启后需要输入密码才能查看正文</div>
              </div>
              <el-switch v-model="switches.isEncrypt" />
            </div>
          </div>

          <el-form-item v-if="switches.isEncrypt" label="访问密码" prop="encryptPwd">
            <el-input
              v-model="form.encryptPwd"
              show-password
              maxlength="32"
              placeholder="请输入访问密码"
            />
          </el-form-item>
        </div>
      </section>

      <section class="section-card">
        <div class="section-heading">
          <div>
            <h4>SEO 信息</h4>
            <p>补充搜索引擎展示信息</p>
          </div>
        </div>

        <div class="form-stack">
          <el-form-item label="SEO 标题">
            <el-input
              v-model="form.seoTitle"
              maxlength="80"
              show-word-limit
              placeholder="留空时默认使用文章标题"
            />
          </el-form-item>

          <el-form-item label="SEO 关键词">
            <el-input
              v-model="form.seoKeywords"
              maxlength="120"
              show-word-limit
              placeholder="多个关键词建议用逗号分隔"
            />
          </el-form-item>

          <el-form-item label="SEO 描述">
            <el-input
              v-model="form.seoDescription"
              type="textarea"
              :rows="6"
              resize="none"
              maxlength="180"
              show-word-limit
              placeholder="用于搜索引擎摘要展示"
            />
          </el-form-item>
        </div>
      </section>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-note">请确认正文、分类和发布状态后再提交。</div>
        <div class="footer-actions">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ mode === 'create' ? '发布文章' : '保存修改' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import VditorEditor from './VditorEditor.vue'
import { useSiteInfoStore } from '@/stores/siteInfo'
const siteInfo = useSiteInfoStore().siteInfo

export type ArticleDialogMode = 'create' | 'edit'
export type ArticleDialogSubmitPayload = API.ArticlePushRequest & { id?: string | number }
type EditorType = 'md-editor-v3' | 'vditor'

type ArticleFormState = API.ArticlePushRequest & { id?: string | number; tags: number[] }

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: ArticleDialogMode
    article?: API.ArticleAdminVo | null
    categoryOptions: API.CategoriesVo[]
    tagOptions: API.TagsVo[]
    submitting?: boolean
  }>(),
  {
    article: null,
    submitting: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: ArticleDialogSubmitPayload, mode: ArticleDialogMode]
  closed: []
}>()

const formRef = ref<FormInstance>()

const form = reactive<ArticleFormState>({
  id: undefined,
  coverImage: '',
  title: '',
  summary: '',
  content: '',
  categoryId: undefined,
  tags: [],
  status: 1,
  isTop: 0,
  isHot: 0,
  isComment: 1,
  isEncrypt: 0,
  encryptPwd: '',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
})

const switches = reactive({
  isTop: false,
  isHot: false,
  isComment: true,
  isEncrypt: false,
})
const editorType = ref<EditorType>('md-editor-v3')

const statusOptions = [
  { label: '直接发布', value: 1 },
  { label: '保存草稿', value: 0 },
]

const editorTypeOptions: Array<{ label: string; value: EditorType }> = [
  { label: 'MdEditor', value: 'md-editor-v3' },
  { label: 'Vditor', value: 'vditor' },
]

const formRules: FormRules<ArticleFormState> = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 80, message: '文章标题长度需在 2 到 80 个字符之间', trigger: 'blur' },
  ],
  categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
  encryptPwd: [
    {
      validator: (_, value, callback) => {
        if (switches.isEncrypt && !String(value || '').trim()) {
          callback(new Error('开启加密阅读后请输入访问密码'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const viewportWidth = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)

const isMobile = computed(() => viewportWidth.value <= 768)
const dialogWidth = computed(() => (viewportWidth.value <= 1280 ? 'calc(100vw - 24px)' : '1180px'))
const editorHeight = computed(() => {
  if (viewportWidth.value <= 480) return 300
  if (viewportWidth.value <= 768) return 340
  if (viewportWidth.value <= 1100) return 400
  return 460
})

const normalizeId = (value: unknown) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : undefined
}

const normalizedCategoryOptions = computed(() =>
  (props.categoryOptions || [])
    .map((category) => ({
      ...category,
      id: normalizeId(category.id),
      name: String(category.name || '').trim(),
    }))
    .filter((category): category is { id: number; name: string } => category.id != null),
)

const normalizedTagOptions = computed(() =>
  (props.tagOptions || [])
    .map((tag) => ({
      ...tag,
      id: normalizeId(tag.id),
      name: String(tag.name || '').trim(),
    }))
    .filter((tag): tag is { id: number; name: string } => tag.id != null),
)

const updateViewportWidth = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

const syncFlags = () => {
  form.isTop = switches.isTop ? 1 : 0
  form.isHot = switches.isHot ? 1 : 0
  form.isComment = switches.isComment ? 1 : 0
  form.isEncrypt = switches.isEncrypt ? 1 : 0

  if (!switches.isEncrypt) {
    form.encryptPwd = ''
  }
}

const applyArticleData = (article?: API.ArticleAdminVo | null) => {
  form.id = article?.id

  form.coverImage = article?.coverImage || ''
  form.title = article?.title || ''
  form.summary = article?.summary || ''
  form.content = article?.content || ''
  form.categoryId = normalizeId(article?.categoryId)
  form.tags = (article?.tags || [])
    .map((tag) => normalizeId(tag.id))
    .filter((id): id is number => id != null)
  form.status = article?.status ?? 1
  form.encryptPwd = article?.encryptPwd || ''

  form.seoTitle = article?.seoTitle || ''
  form.seoKeywords = article?.seoKeywords || ''
  form.seoDescription = article?.seoDescription || ''

  switches.isTop = article?.isTop === 1
  switches.isHot = article?.isHot === 1
  switches.isComment = article?.isComment !== 0
  switches.isEncrypt = article?.isEncrypt === 1

  syncFlags()
}

const beforeCoverUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage.error('封面仅支持 JPG、PNG、WEBP 格式')
    return false
  }

  if (!isLt2M) {
    ElMessage.error('封面大小不能超过 2MB')
    return false
  }

  return true
}

const handleCoverSuccess = (response: API.BaseResponseBlogimages) => {
  if (response?.code !== 0) {
    ElMessage.error(response?.msg || '封面上传失败')
    return
  }

  const imageUrl =
    response.data?.fileUrl || response.data?.thumbPath || response.data?.filePath || ''

  if (!imageUrl) {
    ElMessage.error('上传成功，但未返回图片地址')
    return
  }

  form.coverImage = imageUrl
  ElMessage.success('封面上传成功')
}

const handleCoverError = () => {
  ElMessage.error('封面上传失败，请稍后重试')
}

watch(
  () => [props.modelValue, props.article, props.mode] as const,
  ([visible]) => {
    if (!visible) return
    applyArticleData(props.mode === 'edit' ? props.article : null)
  },
  { immediate: true },
)

onMounted(() => {
  updateViewportWidth()
  window.addEventListener('resize', updateViewportWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportWidth)
})

const handleClosed = () => {
  formRef.value?.clearValidate()
  emit('closed')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  syncFlags()
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  emit(
    'submit',
    {
      id: form.id,
      coverImage: form.coverImage?.trim() || undefined,
      title: form.title?.trim(),
      summary: form.summary?.trim(),
      content: form.content?.trim(),
      categoryId: form.categoryId,
      tags: form.tags,
      status: form.status,
      isTop: form.isTop,
      isHot: form.isHot,
      isComment: form.isComment,
      isEncrypt: form.isEncrypt,
      encryptPwd: form.encryptPwd?.trim() || undefined,
      seoTitle: form.seoTitle?.trim() || undefined,
      seoKeywords: form.seoKeywords?.trim() || undefined,
      seoDescription: form.seoDescription?.trim() || undefined,
    },
    props.mode,
  )
}
</script>

<style scoped>
.dialog-hero {
  padding: 28px 28px 24px;
  padding-right: 82px;
}

.dialog-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2457d6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dialog-hero-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-top: 14px;
}

.dialog-hero h3 {
  margin: 0;
  color: #16253d;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.dialog-hero p {
  max-width: 760px;
  margin: 10px 0 0;
  color: #60708b;
  font-size: 14px;
  line-height: 1.8;
}

.el-form {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.section-card {
  width: 100%;
  min-width: 0;
  padding: 22px;
  border: 1px solid rgba(216, 225, 237, 0.88);
  border-radius: 24px;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 251, 255, 0.96));
  box-shadow: 0 14px 36px rgba(37, 64, 110, 0.06);
}

.section-card-editor {
  padding-bottom: 18px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-heading h4 {
  margin: 0;
  color: #1f304a;
  font-size: 18px;
  font-weight: 700;
}

.section-heading p {
  margin: 6px 0 0;
  color: #72819b;
  font-size: 13px;
  line-height: 1.7;
}

.section-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f3f7ff;
  color: #4b6287;
  font-size: 12px;
  font-weight: 700;
}

.section-chip-accent {
  background: rgba(14, 165, 233, 0.1);
  color: #0369a1;
}

.editor-switch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.form-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-grid {
  align-items: start;
}

.form-stack {
  display: grid;
  gap: 4px;
}

.cover-upload-item,
.summary-item,
.editor-item {
  margin-bottom: 0;
  width: 100%;
  min-width: 0;
}

.editor-item :deep(.el-form-item__content) {
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.cover-upload-wrap {
  display: grid;
  justify-items: start;
  gap: 10px;
  min-width: 0;
  margin: 8px 0 12px;
}

.cover-avatar-shell {
  position: relative;
  display: inline-flex;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.12);
}

.cover-avatar {
  border: 1px solid rgba(206, 218, 235, 0.92);
  background: linear-gradient(180deg, #f8fbff, #eef5ff);
}

.cover-avatar-empty {
  color: #5c76a4;
}

.cover-avatar-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 10px;
  background: rgba(17, 24, 39, 0.58);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  opacity: 0;
  transform: translateY(100%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.cover-avatar-shell:hover .cover-avatar-overlay {
  opacity: 1;
  transform: translateY(0);
}

:deep(.cover-uploader .el-upload) {
  display: inline-flex;
  border-radius: 18px;
}

.cover-helper {
  color: #7a879f;
  font-size: 12px;
  line-height: 1.6;
}

.switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.switch-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 92px;
  padding: 18px;
  border: 1px solid rgba(214, 223, 236, 0.9);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 36%),
    linear-gradient(180deg, #ffffff, #f7faff);
}

.switch-title {
  color: #223450;
  font-size: 14px;
  font-weight: 700;
}

.switch-desc {
  margin-top: 6px;
  color: #7a879f;
  font-size: 12px;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-note {
  color: #7a879d;
  font-size: 13px;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

:deep(.article-dialog-overlay) {
  backdrop-filter: blur(8px);
}

:deep(.article-dialog.el-dialog) {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: min(1180px, calc(100vw - 24px)) !important;
  max-width: calc(100vw - 24px);
  min-width: 0;
  border: 1px solid rgba(213, 223, 236, 0.95);
  border-radius: 28px;
  overflow: hidden;
  max-height: calc(100vh - 32px);
  box-shadow:
    0 26px 80px rgba(27, 53, 95, 0.18),
    0 12px 28px rgba(27, 53, 95, 0.08);
}

:deep(.article-dialog.el-dialog .el-dialog__header) {
  position: relative;
  padding: 0 !important;
  margin-right: 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(221, 230, 241, 0.9);
  background-color: #f3f8ff !important;
  background-image:
    radial-gradient(circle at top left, rgba(29, 78, 216, 0.14), transparent 32%),
    radial-gradient(circle at right center, rgba(14, 165, 233, 0.12), transparent 28%),
    linear-gradient(135deg, #f8fbff, #eef5ff) !important;
}

:deep(.article-dialog.el-dialog .el-dialog__headerbtn) {
  top: 20px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 18px rgba(37, 64, 110, 0.08);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.article-dialog.el-dialog .el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.96);
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(37, 64, 110, 0.12);
}

:deep(.article-dialog.el-dialog .el-dialog__close) {
  color: #5d708f;
  font-size: 18px;
}

:deep(.article-dialog.el-dialog .el-dialog__body) {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  padding: 24px 28px 20px;
  background: linear-gradient(180deg, #fbfdff, #f5f8fc);
}

:deep(.article-dialog.el-dialog .el-dialog__footer) {
  flex-shrink: 0;
  padding: 16px 28px 24px;
  border-top: 1px solid rgba(225, 232, 241, 0.92);
  background: rgba(255, 255, 255, 0.94);
}

:deep(.article-form .el-form-item) {
  margin-bottom: 18px;
}

:deep(.article-form .el-form-item__label) {
  padding-bottom: 8px;
  color: #44536c;
  font-size: 13px;
  font-weight: 700;
}

:deep(.article-form .el-input__wrapper),
:deep(.article-form .el-select__wrapper),
:deep(.article-form .el-textarea__inner),
:deep(.article-form .el-segmented) {
  border-radius: 16px;
}

:deep(.editor-switch.el-segmented) {
  min-height: 34px;
}

:deep(.article-form .el-input__wrapper),
:deep(.article-form .el-select__wrapper) {
  min-height: 46px;
  background: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 6px 14px rgba(57, 84, 126, 0.04);
}

:deep(.article-form .el-textarea__inner) {
  min-height: 116px;
  background: #ffffff;
  box-shadow: 0 6px 14px rgba(57, 84, 126, 0.04);
}

:deep(.article-form .el-input__wrapper.is-focus),
:deep(.article-form .el-select__wrapper.is-focused),
:deep(.article-form .el-textarea__inner:focus) {
  box-shadow:
    0 0 0 4px rgba(37, 99, 235, 0.1),
    0 10px 24px rgba(37, 99, 235, 0.08);
}

@media (max-width: 1100px) {
  .detail-grid,
  .form-grid,
  .switch-grid,
  .dialog-hero-main {
    grid-template-columns: 1fr;
  }

  .dialog-hero-main {
    display: grid;
  }
}

@media (max-width: 768px) {
  :deep(.article-dialog.el-dialog) {
    width: 100vw !important;
    max-width: 100vw;
    max-height: 100dvh;
    border-radius: 0;
  }

  .dialog-hero,
  :deep(.article-dialog.el-dialog .el-dialog__body),
  :deep(.article-dialog.el-dialog .el-dialog__footer) {
    padding-left: 18px;
    padding-right: 18px;
  }

  .dialog-hero {
    padding-right: 72px;
  }

  .section-card {
    padding: 18px;
    border-radius: 20px;
  }

  .dialog-hero h3 {
    font-size: 24px;
  }

  .switch-grid {
    grid-template-columns: 1fr;
  }

  .cover-upload-wrap {
    margin: 6px 0 14px;
  }

  .cover-avatar-overlay {
    opacity: 1;
    transform: translateY(0);
  }

  .dialog-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .footer-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
