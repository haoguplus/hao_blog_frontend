<template>
  <div ref="containerRef" class="article-markdown">
    <MdPreview
      :id="previewId"
      :model-value="source"
      :md-heading-id="mdHeadingId"
      language="zh-CN"
      theme="light"
      preview-theme="github"
      code-theme="github"
      @on-get-catalog="handleGetCatalog"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { MdPreview, type HeadList, type MdHeadingId } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

export interface ArticleMarkdownHeading {
  id: string
  text: string
  level: number
}

const props = withDefaults(
  defineProps<{
    source?: string
  }>(),
  {
    source: '',
  },
)

const emit = defineEmits<{
  headingsChange: [headings: ArticleMarkdownHeading[]]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const previewId = 'article-detail-preview'

const createHeadingId = (text: string, index: number) => {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')

  return normalized ? `article-heading-${normalized}` : `article-heading-${index + 1}`
}

const mdHeadingId: MdHeadingId = ({ text, index }) => createHeadingId(text, index)

const handleGetCatalog = (catalog: HeadList[]) => {
  const headings = catalog
    .filter((item) => item.level <= 5)
    .map((item, index) => ({
      id: createHeadingId(item.text, index),
      text: item.text || `标题 ${index + 1}`,
      level: Number(item.level),
    }))

  emit('headingsChange', headings)
}

watch(
  () => props.source,
  () => {
    emit('headingsChange', [])
  },
)

onMounted(() => {
  emit('headingsChange', [])
})
</script>

<style scoped>
.article-markdown {
  min-width: 0;
  color: #324257;
}

.article-markdown :deep(.md-editor-preview-wrapper) {
  padding: 0;
  background: transparent;
}

.article-markdown :deep(.md-editor-preview) {
  color: #324257;
  font-size: 16px;
  line-height: 1.95;
}

.article-markdown :deep(.md-editor-preview h1),
.article-markdown :deep(.md-editor-preview h2),
.article-markdown :deep(.md-editor-preview h3),
.article-markdown :deep(.md-editor-preview h4),
.article-markdown :deep(.md-editor-preview h5),
.article-markdown :deep(.md-editor-preview h6) {
  color: #18253d;
}

.article-markdown :deep(.md-editor-preview img) {
  border-radius: 20px;
  box-shadow: 0 16px 32px rgba(38, 68, 120, 0.12);
}

.article-markdown :deep(.md-editor-preview pre) {
  border-radius: 18px;
}

.article-markdown :deep(.md-editor-preview blockquote) {
  border-radius: 0 16px 16px 0;
}

@media (max-width: 768px) {
  .article-markdown :deep(.md-editor-preview) {
    font-size: 15px;
    line-height: 1.85;
  }
}
</style>
