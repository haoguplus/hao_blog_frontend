<template>
  <div class="md-editor-shell">
    <MdEditor
      :model-value="modelValue"
      :style="{ height: `${height}px` }"
      :placeholder="resolvedPlaceholder"
      language="zh-CN"
      preview-theme="github"
      code-theme="github"
      :toolbars="toolbars"
      @update:model-value="handleChange"
      @on-upload-img="handleUploadImg"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MdEditor, type ToolbarNames, type UploadImgCallBack } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useSiteInfoStore } from '@/stores/siteInfo'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    height?: number
    placeholder?: string
  }>(),
  {
    modelValue: '',
    height: 420,
    placeholder: '请输入文章内容...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const siteInfo = useSiteInfoStore().siteInfo

const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'previewOnly',
  'htmlPreview',
]

const resolvedPlaceholder = computed(() => {
  const currentPlaceholder = String(props.placeholder || '').trim()

  if (!currentPlaceholder) return '请输入文章内容...'
  if (/Markdown/i.test(currentPlaceholder)) return '请输入文章内容...'

  return currentPlaceholder
})

const buildUploadedImageUrl = (imageUrl?: string) => {
  const currentUrl = String(imageUrl || '').trim()

  if (!currentUrl) return ''
  if (/^(https?:)?\/\//i.test(currentUrl) || currentUrl.startsWith('data:')) return currentUrl

  const baseUrl = String(siteInfo.imageUrl || '').trim()
  if (!baseUrl) return currentUrl

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`
  return `${normalizedBase}${normalizedPath}`
}

const validateUploadFiles = (files: File[]) => {
  if (!files.length) {
    ElMessage.error('请选择要上传的图片')
    return false
  }

  const isValidType = files.every((file) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
  )

  if (!isValidType) {
    ElMessage.error('正文图片仅支持 JPG、PNG、WEBP 格式')
    return false
  }

  const isLt2M = files.every((file) => file.size / 1024 / 1024 < 2)
  if (!isLt2M) {
    ElMessage.error('正文图片大小不能超过 2MB')
    return false
  }

  return true
}

const uploadSingleImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/file/uploadImg', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  const result = (await response.json()) as API.BaseResponseBlogimages
  const imageUrl = buildUploadedImageUrl(
    result.data?.fileUrl || result.data?.filePath || result.data?.thumbPath,
  )

  if (!response.ok || result.code !== 0 || !imageUrl) {
    throw new Error(result.msg || '图片上传失败')
  }

  return imageUrl
}

const handleUploadImg = async (files: File[], callback: UploadImgCallBack) => {
  if (!validateUploadFiles(files)) return

  try {
    const urls = await Promise.all(files.map((file) => uploadSingleImage(file)))
    callback(urls)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '图片上传失败，请稍后重试')
  }
}

const handleChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.md-editor-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.md-editor) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: 18px;
  overflow: hidden;
}

:deep(.md-editor-resize-operate),
:deep(.md-editor-content),
:deep(.md-editor-input-wrapper),
:deep(.md-editor-input),
:deep(.md-editor-preview-wrapper) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.md-editor-toolbar) {
  overflow-x: auto;
  overflow-y: hidden;
}

:deep(.md-editor-toolbar::-webkit-scrollbar) {
  height: 6px;
}

:deep(.md-editor-toolbar::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: rgba(137, 155, 177, 0.4);
}

@media (max-width: 768px) {
  :deep(.md-editor) {
    border-radius: 16px;
  }

  :deep(.md-editor-toolbar) {
    padding-bottom: 2px;
  }
}
</style>
