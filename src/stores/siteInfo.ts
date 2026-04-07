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

  async function fetcSiteInfo() {
    let res = await getSysInfo()
    if (res.data.code === 0 && res.data.data) {
      siteInfo.value = res.data.data
    }
  }

  return { siteInfo, setSiteInfo, fetcSiteInfo }
})
