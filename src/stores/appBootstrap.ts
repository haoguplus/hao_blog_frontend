import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type BootstrapStatus = 'idle' | 'loading' | 'success' | 'error'

export const useAppBootstrapStore = defineStore('appBootstrap', () => {
  const status = ref<BootstrapStatus>('idle')
  const message = ref('正在准备站点内容与访客状态...')
  const detail = ref('首次进入会进行一次轻量初始化，请稍候。')
  const targetPath = ref('/')

  const isLoading = computed(() => status.value === 'loading')
  const isError = computed(() => status.value === 'error')
  const isReady = computed(() => status.value === 'success')
  const shouldShowOverlay = computed(() => isLoading.value || isError.value)

  function setTargetPath(path: string) {
    targetPath.value = path || '/'
  }

  function startLoading(nextMessage?: string, nextDetail?: string) {
    status.value = 'loading'
    message.value = nextMessage || '正在准备站点内容与访客状态...'
    detail.value = nextDetail || '首次进入会进行一次轻量初始化，请稍候。'
  }

  function markReady(nextMessage?: string, nextDetail?: string) {
    status.value = 'success'
    message.value = nextMessage || '初始化完成'
    detail.value = nextDetail || '页面内容已经准备好。'
  }

  function markError(nextMessage?: string, nextDetail?: string) {
    status.value = 'error'
    message.value = nextMessage || '初始化失败'
    detail.value = nextDetail || '网络连接异常，请稍后重试。'
  }

  return {
    status,
    message,
    detail,
    targetPath,
    isLoading,
    isError,
    isReady,
    shouldShowOverlay,
    setTargetPath,
    startLoading,
    markReady,
    markError,
  }
})
