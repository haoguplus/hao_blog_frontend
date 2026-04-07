<template>
  <aside class="menu-container">
    <div class="menu-glow menu-glow-top"></div>
    <div class="menu-glow menu-glow-bottom"></div>

    <div class="menu-header">
      <div class="profile-card">
        <div class="logo-ring">
          <div class="logo">
            <img
              :src="(siteInfo.imageUrl || '') + (siteInfo.siteLogo || '')"
              alt="Hao Blog Logo"
            />
          </div>
        </div>

        <div class="profile-copy">
          <div class="name">{{ siteInfo.siteAuthor }}</div>
          <!-- <div class="introduce">Hello, World.</div> -->
          <p class="tagline">{{ siteInfo.siteIntroduction }}</p>
        </div>
      </div>

      <div class="search-block">
        <div class="block-title">站内探索</div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章、分类或关键字"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <span class="search-prefix">#</span>
          </template>
        </el-input>
      </div>

      <div class="social-block">
        <div class="block-title">社交入口</div>
        <div class="social-interaction">
          <el-popover
            v-for="item in socialAccountItems"
            :key="item.label"
            placement="bottom"
            trigger="click"
            :width="220"
            popper-class="social-account-popper"
          >
            <template #reference>
              <button
                type="button"
                class="social-item"
                :class="item.className"
                :aria-label="item.label"
                :title="`查看${item.label}账号`"
              >
                <i class="iconfont" :class="item.iconClass"></i>
              </button>
            </template>
            <div class="social-popover">
              <div class="social-popover-title">{{ item.label }}</div>
              <div class="social-popover-value">{{ item.value }}</div>
            </div>
          </el-popover>
          <a
            v-if="githubItem"
            :href="githubItem.href"
            class="social-item"
            :class="githubItem.className"
            :aria-label="githubItem.label"
            :title="githubItem.title"
            target="_blank"
            rel="noreferrer noopener"
          >
            <i class="iconfont" :class="githubItem.iconClass"></i>
          </a>
          <span v-if="!socialItems.length" class="social-empty">暂未配置社交账号</span>
        </div>
      </div>
    </div>

    <div class="menu-main">
      <div class="section-head">
        <div class="block-title">导航菜单</div>
        <span class="section-tip">Explore</span>
      </div>

      <div class="table-content">
        <button
          v-for="item in navItems"
          :key="item.path"
          type="button"
          class="nav-item"
          :class="{ 'is-active': route.path === item.path }"
          @click="handleItemClick(item.path)"
        >
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-arrow">→</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthor } from '@/api/sysconfigController'
import { useSiteInfoStore } from '@/stores/siteInfo'
let siteInfo = useSiteInfoStore().siteInfo
const router = useRouter()
const route = useRoute()
const searchKeyword = ref('')
const authorSocialMap = ref<Record<string, any>>({})

type SocialPlatform = {
  label: string
  className: string
  iconClass: string
  title: string
  href?: string
  value?: string
}

type SocialAccountItem = SocialPlatform & {
  value: string
}

type SocialLinkItem = SocialPlatform & {
  href: string
}

const navItems = [
  { label: '首页', path: '/' },
  { label: '分类', path: '/categories' },
  { label: '归档', path: '/archives' },
  { label: '生活', path: '/life' },
]

const normalizedAuthorSocialMap = computed<Record<string, string>>(() => {
  return Object.entries(authorSocialMap.value).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      accumulator[key.replace(/[\s_-]/g, '').toLowerCase()] = value.trim()
    }
    return accumulator
  }, {})
})

const getSocialValue = (...keys: string[]) => {
  for (const key of keys) {
    const value = normalizedAuthorSocialMap.value[key.replace(/[\s_-]/g, '').toLowerCase()]
    if (value) return value
  }
  return ''
}

const formatGithubHref = (value: string) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://github.com/${value.replace(/^@/, '')}`
}

const socialItems = computed<SocialPlatform[]>(() => {
  const qq = getSocialValue('qq', 'QQ', '企鹅号', 'qq号')
  const wechat = getSocialValue('wechat', 'weChat', 'weixin', 'wx', '微信', '微信号')
  const github = getSocialValue('github', 'gitHub', 'githubUrl', 'github_url', 'github主页', 'github链接')
  const items: SocialPlatform[] = []

  if (qq) {
    items.push({
      label: 'QQ',
      className: 'social-qq',
      iconClass: 'icon-qq',
      title: qq,
      value: qq,
    })
  }

  if (wechat) {
    items.push({
      label: '微信',
      className: 'social-wechat',
      iconClass: 'icon-weixin',
      title: wechat,
      value: wechat,
    })
  }

  if (github) {
    items.push({
      label: 'GitHub',
      className: 'social-github',
      iconClass: 'icon-GitHub',
      href: formatGithubHref(github),
      title: github,
    })
  }

  return items
})

const socialAccountItems = computed<SocialAccountItem[]>(() =>
  socialItems.value.filter((item): item is SocialAccountItem => typeof item.value === 'string' && item.value.length > 0),
)
const githubItem = computed<SocialLinkItem | undefined>(() =>
  socialItems.value.find((item): item is SocialLinkItem => item.label === 'GitHub' && typeof item.href === 'string'),
)

const handleItemClick = (path: string) => {
  router.push(path)
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()

  router.push({
    path: '/articles',
    query: keyword ? { keyword } : {},
  })
}

const fetchAuthorSocialInfo = async () => {
  try {
    const res = await getAuthor({ silentError: true })
    if (res.data.code === 0 && res.data.data) {
      authorSocialMap.value = res.data.data
    }
  } catch {
    authorSocialMap.value = {}
  }
}

onMounted(() => {
  fetchAuthorSocialInfo()
})
</script>

<style scoped>
.menu-container {
  position: sticky;
  top: 90px;
  width: 100%;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(160, 180, 209, 0.26);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 255, 0.94)),
    linear-gradient(135deg, rgba(86, 131, 255, 0.06), transparent 35%);
  box-shadow:
    0 24px 48px rgba(13, 35, 86, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.menu-glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(8px);
}

.menu-glow-top {
  top: -40px;
  right: -10px;
  width: 180px;
  height: 180px;
  background: rgba(107, 134, 255, 0.16);
}

.menu-glow-bottom {
  left: -36px;
  bottom: 32px;
  width: 140px;
  height: 140px;
  background: rgba(82, 191, 255, 0.1);
}

.menu-header,
.menu-main {
  position: relative;
  z-index: 1;
}

.menu-header {
  padding: 22px 20px 16px;
  border-bottom: 1px solid rgba(190, 203, 217, 0.36);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(183, 197, 222, 0.34);
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(115, 151, 255, 0.14), transparent 34%),
    linear-gradient(135deg, #f8fbff, #eef5ff);
  box-shadow: 0 12px 28px rgba(53, 88, 141, 0.1);
}

.logo-ring {
  display: inline-flex;
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(82, 123, 255, 0.22), rgba(79, 194, 255, 0.22));
}

.logo {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  box-shadow: 0 12px 24px rgba(34, 72, 124, 0.18);
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-copy {
  min-width: 0;
}

.name {
  color: #1c3150;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.03em;
  line-height: 1.15;
}

.introduce {
  margin-top: 3px;
  color: #58739b;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

.tagline {
  margin-top: 6px;
  color: #6e80a0;
  font-size: 12px;
  line-height: 1.55;
}

.search-block,
.social-block {
  margin-top: 18px;
}

.block-title {
  margin-bottom: 10px;
  color: #5b7094;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.search-input {
  width: 100%;
  height: 48px;
}

.search-prefix {
  color: #6b7cff;
  font-size: 14px;
  font-weight: 700;
}

.search-input :deep(.el-input__wrapper) {
  border: 1px solid rgba(137, 155, 177, 0.32) !important;
  border-radius: 14px;
  background: rgba(248, 250, 255, 0.95) !important;
  box-shadow:
    0 8px 18px rgba(42, 76, 112, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

.search-input:hover :deep(.el-input__wrapper) {
  background: #ffffff !important;
  border-color: rgba(98, 134, 193, 0.48) !important;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(74, 125, 195, 0.72) !important;
  box-shadow:
    0 0 0 4px rgba(74, 125, 195, 0.12),
    0 10px 24px rgba(42, 76, 112, 0.08) !important;
}

.search-input :deep(.el-input__inner) {
  color: #415572;
  font-size: 14px;
}

.social-interaction {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 10px 18px rgba(64, 102, 148, 0.17);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.social-item i {
  font-size: 18px;
}

.social-qq {
  background: linear-gradient(135deg, #39a1d7, #1a6eb4);
}

.social-wechat {
  background: linear-gradient(135deg, #3cc88f, #1d8f6e);
}

.social-github {
  background: linear-gradient(135deg, #6e78ff, #3f49d5);
}

.social-item:hover {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow: 0 14px 24px rgba(70, 95, 145, 0.24);
}

.social-empty {
  color: #7d8ba6;
  font-size: 12px;
  line-height: 1.6;
}

.social-popover {
  display: grid;
  gap: 8px;
}

.social-popover-title {
  color: #597095;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.social-popover-value {
  color: #203452;
  font-size: 14px;
  font-weight: 700;
  word-break: break-all;
}

.menu-main {
  flex: 1;
  padding: 18px 16px 20px;
  overflow-y: auto;
}

.menu-main::-webkit-scrollbar {
  width: 6px;
}

.menu-main::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(122, 142, 178, 0.35);
}

.menu-main::-webkit-scrollbar-track {
  background: transparent;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head .block-title {
  margin-bottom: 0;
}

.section-tip {
  color: #9aa8c0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-content {
  display: grid;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid rgba(170, 189, 214, 0.25);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f4f8ff);
  color: #27496f;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 8px 18px rgba(25, 75, 119, 0.08);
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease;
}

.nav-item:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 128, 214, 0.34);
  box-shadow: 0 14px 26px rgba(31, 86, 152, 0.14);
  background: linear-gradient(180deg, #ffffff, #ecf4ff);
}

.nav-item.is-active {
  border-color: rgba(78, 116, 241, 0.26);
  background: linear-gradient(135deg, rgba(82, 118, 255, 0.14), rgba(72, 176, 255, 0.09));
  box-shadow:
    0 16px 28px rgba(57, 99, 178, 0.16),
    inset 0 0 0 1px rgba(77, 118, 255, 0.12);
}

.nav-label {
  font-size: 14px;
  font-weight: 700;
}

.nav-arrow {
  color: #7f92b2;
  font-size: 14px;
  transition: transform 0.22s ease;
}

.nav-item:hover .nav-arrow,
.nav-item.is-active .nav-arrow {
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .menu-header,
  .menu-main {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 768px) {
  .menu-container {
    top: 0;
    max-height: 100vh;
    min-height: 100vh;
    border-radius: 0;
    margin: 0;
  }
}

@media (max-width: 640px) {
  .menu-container {
    top: 0;
  }

  .logo {
    width: 54px;
    height: 54px;
  }

  .name {
    font-size: 18px;
  }

  .social-interaction {
    justify-content: space-between;
  }

  .social-item {
    flex: 1;
  }
}
</style>
