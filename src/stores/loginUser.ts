import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUser } from '@/api/userController'
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVo>({
    userName: '未登录',
  })

  function setLoginUser(newUser: API.LoginUserVo) {
    loginUser.value = newUser
  }

  async function fetchLoginUser(options?: { [key: string]: any }) {
    let res = await getLoginUser(options)
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
    return res
  }

  return { loginUser, setLoginUser, fetchLoginUser }
})
