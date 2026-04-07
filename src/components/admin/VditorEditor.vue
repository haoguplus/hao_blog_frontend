<template>
  <component
    :is="editorType === 'vditor' ? LegacyVditorEditor : MdEditorWrapper"
    :model-value="modelValue"
    :height="height"
    :placeholder="placeholder"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import MdEditorWrapper from './MdEditorWrapper.vue'
import LegacyVditorEditor from './LegacyVditorEditor.vue'

withDefaults(
  defineProps<{
    modelValue?: string
    height?: number
    placeholder?: string
    editorType?: 'md-editor-v3' | 'vditor'
  }>(),
  {
    modelValue: '',
    height: 420,
    placeholder: '请输入文章内容...',
    editorType: 'md-editor-v3',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
