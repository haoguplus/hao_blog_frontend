import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getSysInfo } from '@/api/sysconfigController'
export const useSiteInfoStore = defineStore('siteInfo', () => {
  const siteInfo = ref<API.SysInfo>({
    siteName: '',
  })

  function setSiteInfo(newSiteInfo: API.SysInfo) {
    siteInfo.value = newSiteInfo
  }

  async function fetcSiteInfo(options?: { [key: string]: any }) {
    let res = await getSysInfo(options)
    if (res.data.code === 0 && res.data.data) {
      siteInfo.value = res.data.data
    }
    return res
  }

  return { siteInfo, setSiteInfo, fetcSiteInfo }
})
