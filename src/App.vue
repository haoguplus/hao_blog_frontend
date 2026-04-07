<template>
  <div class="container" data-theme="light">
    <RouterView />
  </div>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSiteInfoStore } from './stores/siteInfo'
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

let site = useSiteInfoStore()
let { siteInfo } = storeToRefs(site)

const setSiteInfo = () => {
  document.title =
    (siteInfo.value.siteName || '') +
    (siteInfo.value.siteTitle ? '-' + siteInfo.value.siteTitle : '')

  // 获取 meta 标签
  const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null
  const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null

  // 设置关键词和描述
  if (metaKeywords) {
    metaKeywords.content = siteInfo.value.siteKeywords || ''
  }

  if (metaDesc) {
    metaDesc.content = siteInfo.value.siteDescription || ''
  }
}

watch(siteInfo, () => {
  setSiteInfo()
})
</script>
<style scoped></style>
