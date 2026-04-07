<template>
  <div class="vditor-editor-shell">
    <div ref="containerRef" class="vditor-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
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
const containerRef = ref<HTMLDivElement | null>(null)
const localVditorCdn = '/vditor'
let editor: Vditor | null = null
let syncingFromEditor = false

const noopCustomWysiwygToolbar = () => {}

const getResolvedPlaceholder = () => {
  const currentPlaceholder = String(props.placeholder || '').trim()

  if (!currentPlaceholder) return '请输入文章内容...'
  if (/Markdown/i.test(currentPlaceholder)) return '请输入文章内容...'

  return currentPlaceholder
}

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

const normalizeUploadFiles = (
  files: File[] | FileList | DataTransferItemList | ArrayLike<File | DataTransferItem | null>,
) => {
  return Array.from(files as ArrayLike<File | DataTransferItem | null>)
    .map((file) => {
      if (file instanceof DataTransferItem) return file.getAsFile()
      return file
    })
    .filter((file): file is File => file instanceof File)
}

const formatUploadResponse = (
  files: File[] | FileList | DataTransferItemList | ArrayLike<File | DataTransferItem | null>,
  responseText: string,
) => {
  const uploadedFiles = normalizeUploadFiles(files)

  try {
    const response = JSON.parse(responseText) as API.BaseResponseBlogimages
    const imageUrl = buildUploadedImageUrl(
      response.data?.fileUrl || response.data?.filePath || response.data?.thumbPath,
    )

    if (response.code !== 0 || !imageUrl) {
      return JSON.stringify({
        code: 1,
        msg: response.msg || '图片上传失败',
        data: {
          errFiles: uploadedFiles.map((file) => file.name),
          succMap: {},
        },
      })
    }

    const succMap = uploadedFiles.reduce<Record<string, string>>((accumulator, file) => {
      accumulator[file.name] = imageUrl
      return accumulator
    }, {})

    return JSON.stringify({
      code: 0,
      msg: '',
      data: {
        errFiles: [],
        succMap,
      },
    })
  } catch {
    return JSON.stringify({
      code: 1,
      msg: '图片上传失败，请稍后重试',
      data: {
        errFiles: uploadedFiles.map((file) => file.name),
        succMap: {},
      },
    })
  }
}

const initEditor = async () => {
  if (!containerRef.value) return

  await nextTick()

  editor = new Vditor(containerRef.value, {
    cdn: localVditorCdn,
    height: props.height,
    lang: 'zh_CN',
    mode: 'wysiwyg',
    placeholder: getResolvedPlaceholder(),
    value: props.modelValue,
    cache: {
      enable: false,
    },
    toolbarConfig: {
      pin: true,
    },
    customWysiwygToolbar: noopCustomWysiwygToolbar,
    preview: {
      mode: 'both',
    },
    upload: {
      url: '/api/file/uploadImg',
      fieldName: 'file',
      max: 2 * 1024 * 1024,
      multiple: false,
      accept: 'image/jpeg,image/png,image/webp',
      validate(files) {
        if (!files.length) return '请选择要上传的图片'

        const isValidType = files.every((file) =>
          ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        )

        if (!isValidType) return '正文图片仅支持 JPG、PNG、WEBP 格式'

        const isLt2M = files.every((file) => file.size / 1024 / 1024 < 2)
        if (!isLt2M) return '正文图片大小不能超过 2MB'

        return true
      },
      format(files, responseText) {
        return formatUploadResponse(files, responseText)
      },
    },
    input(value) {
      syncingFromEditor = true
      emit('update:modelValue', value)
      queueMicrotask(() => {
        syncingFromEditor = false
      })
    },
  })
}

watch(
  () => props.height,
  (value) => {
    if (!containerRef.value) return
    containerRef.value.style.height = `${value}px`
  },
)

watch(
  () => props.modelValue,
  (value) => {
    if (!editor || syncingFromEditor) return
    if (editor.getValue() === value) return
    editor.setValue(value || '')
  },
)

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<style scoped>
.vditor-editor-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid rgba(216, 225, 237, 0.9);
  border-radius: 18px;
  background: #fff;
}

.vditor-editor {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.vditor) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: none;
}

:deep(.vditor-toolbar) {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  border-bottom: 1px solid rgba(216, 225, 237, 0.9);
  background: linear-gradient(180deg, #f9fbff, #f3f7ff);
}

:deep(.vditor-content) {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: #fff;
}

:deep(.vditor-wysiwyg__block),
:deep(.vditor-ir__node),
:deep(.vditor-sv__marker),
:deep(.vditor-reset p),
:deep(.vditor-reset div) {
  max-width: 100%;
  box-sizing: border-box;
}

:deep(.vditor-wysiwyg) {
  min-height: 280px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.vditor-reset) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.vditor-sv),
:deep(.vditor-ir) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

:deep(.vditor-editor-shell::-webkit-scrollbar),
:deep(.vditor-content::-webkit-scrollbar),
:deep(.vditor-toolbar::-webkit-scrollbar) {
  height: 6px;
}

:deep(.vditor-editor-shell::-webkit-scrollbar-thumb),
:deep(.vditor-content::-webkit-scrollbar-thumb),
:deep(.vditor-toolbar::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: rgba(137, 155, 177, 0.4);
}

@media (max-width: 768px) {
  :deep(.vditor-toolbar) {
    padding-bottom: 2px;
  }

  :deep(.vditor-toolbar__item) {
    flex: 0 0 auto;
  }

  :deep(.vditor-wysiwyg) {
    min-height: 240px;
  }
}
</style>
