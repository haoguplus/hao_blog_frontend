import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'
import { useAppBootstrapStore } from '@/stores/appBootstrap'

const APP_BOOTSTRAP_TIMEOUT = 12000

const waitForOverlayPaint = async () => {
  await Promise.resolve()

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs = APP_BOOTSTRAP_TIMEOUT) =>
  new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('初始化请求超时，请检查网络连接后重试。'))
    }, timeoutMs)

    promise
      .then((value) => {
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        window.clearTimeout(timer)
        reject(error)
      })
  })

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '初始化请求失败，请稍后重试。'
}

export async function runAppBootstrap() {
  const appBootstrapStore = useAppBootstrapStore()
  const loginUserStore = useLoginUserStore()
  const siteInfoStore = useSiteInfoStore()

  appBootstrapStore.startLoading(
    '正在加载站点初始化数据...',
    '我们正在同步访客状态和站点信息，马上就好。',
  )

  await waitForOverlayPaint()

  try {
    const [loginResponse, siteInfoResponse] = await withTimeout(
      Promise.all([
        loginUserStore.fetchLoginUser({ silentError: true }),
        siteInfoStore.fetcSiteInfo({ silentError: true }),
      ]),
    )

    const loginCode = loginResponse?.data?.code
    const siteInfoCode = siteInfoResponse?.data?.code
    const hasSiteInfo = Boolean(siteInfoResponse?.data?.data)

    if (loginCode !== 0 && loginCode !== 40100) {
      throw new Error(loginResponse?.data?.msg || '访客状态初始化失败，请稍后重试。')
    }

    if (siteInfoCode !== 0 || !hasSiteInfo) {
      throw new Error(siteInfoResponse?.data?.msg || '站点信息加载失败，请稍后重试。')
    }

    appBootstrapStore.markReady('初始化完成', '页面内容已经准备好。')
  } catch (error) {
    appBootstrapStore.markError('加载失败', getErrorMessage(error))
    throw error
  }
}
