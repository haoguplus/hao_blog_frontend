<template>
  <div class="article-detail-page">
    <div v-if="loading" class="detail-shell detail-shell-loading">
      <div class="article-layout">
        <article class="article-content article-content-skeleton">
          <header class="article-header">
            <el-skeleton :rows="1" animated>
              <template #template>
                <div class="article-skeleton-kicker"></div>
                <div class="article-skeleton-title"></div>
                <div class="article-skeleton-meta">
                  <div class="article-skeleton-meta-item" v-for="item in 4" :key="item"></div>
                </div>
                <div class="article-skeleton-tags">
                  <div class="article-skeleton-tag" v-for="item in 3" :key="item"></div>
                </div>
              </template>
            </el-skeleton>
          </header>

          <div class="article-main article-main-skeleton">
            <el-skeleton :rows="10" animated />
          </div>

          <footer class="article-footer">
            <el-skeleton :rows="1" animated>
              <template #template>
                <div class="article-skeleton-footer">
                  <div class="article-skeleton-button"></div>
                  <div class="article-skeleton-button article-skeleton-button-like"></div>
                </div>
              </template>
            </el-skeleton>
          </footer>
        </article>

        <aside v-if="!isCompactScreen" class="article-aside">
          <div class="aside-card toc-card">
            <el-skeleton :rows="6" animated />
          </div>
          <div class="aside-card">
            <el-skeleton :rows="3" animated />
          </div>
        </aside>
      </div>
    </div>

    <div class="detail-hero" v-else-if="article || isArticleLocked">
      <div class="hero-pattern"></div>
      <div class="detail-shell">
        <div class="article-layout" :class="{ 'article-layout--single': isArticleLocked }">
          <article class="article-content">
            <header class="article-header">
              <div class="hero-kicker">Article Detail</div>
              <h1 class="article-title">{{ displayTitle }}</h1>

              <div class="article-meta-inline">
                <span class="meta-inline-item">
                  <span class="meta-inline-label">发布时间</span>
                  <span class="meta-inline-value">{{ displayDate }}</span>
                </span>
                <span class="meta-inline-item">
                  <span class="meta-inline-label">分类</span>
                  <span class="meta-inline-value">{{ displayCategory }}</span>
                </span>
                <span class="meta-inline-item">
                  <span class="meta-inline-label">阅读量</span>
                  <span class="meta-inline-value">{{ displayReadCount }}</span>
                </span>
                <span class="meta-inline-item">
                  <span class="meta-inline-label">点赞</span>
                  <span class="meta-inline-value">{{ displayLikeCount }}</span>
                </span>
              </div>

              <div class="article-tags">
                <span v-for="tag in displayTags" :key="tag" class="tag-chip">#{{ tag }}</span>
              </div>
            </header>

            <!-- <div v-if="displayImage" class="article-cover">
              <img :src="displayImage" :alt="displayTitle" />
            </div> -->

            <div v-if="isArticleLocked" class="article-lock-panel">
              <div class="lock-icon">LOCKED</div>
              <h2>这篇文章已加密</h2>
              <p>请输入访问密码后重新请求文章详情，解锁后即可查看完整正文。</p>
              <el-input
                v-model="passwordInput"
                class="lock-input"
                show-password
                maxlength="32"
                placeholder="请输入访问密码"
                @keyup.enter="handleUnlock"
              />
              <div class="lock-actions">
                <el-button type="primary" :loading="unlocking" @click="handleUnlock"
                  >解锁文章</el-button
                >
              </div>
            </div>

            <div v-else class="article-main">
              <div id="summary" v-if="displayDescription != ''" class="lead-quote">
                <span class="quote-mark">“</span>
                <p>{{ displayDescription }}</p>
              </div>

              <div id="content" class="article-full-content">
                <ArticleMarkdownContent
                  :source="displayContent"
                  @headings-change="handleHeadingsChange"
                />
              </div>
            </div>

            <footer class="article-footer">
              <button @click="goBack" class="btn-back">返回列表</button>
              <div class="footer-actions">
                <button
                  v-if="!isArticleLocked"
                  class="btn-like"
                  :class="{ 'is-active': isArticleLiked }"
                  :disabled="likePending"
                  :aria-label="isArticleLiked ? '取消点赞' : '点赞文章'"
                  @click="handleToggleLike"
                >
                  <span class="heart-icon" aria-hidden="true">
                    <svg v-if="isArticleLiked" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
                      />
                    </svg>
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        d="M12.1 21.35 10.55 19.94C5.4 15.27 2 12.19 2 8.5 2 5.42 4.42 3 7.5 3c1.9 0 3.73.88 4.9 2.28C13.57 3.88 15.4 3 17.3 3 20.38 3 22.8 5.42 22.8 8.5c0 3.69-3.4 6.77-8.55 11.44z"
                      />
                    </svg>
                  </span>
                  <span>{{ displayLikeCount }}</span>
                </button>
                <!-- <button class="btn-share">分享文章</button> -->
              </div>
            </footer>
          </article>

          <aside v-if="!isCompactScreen && !isArticleLocked" class="article-aside">
            <div class="aside-card toc-card">
              <div class="aside-title">阅读目录</div>
              <div class="toc-progress">
                <div class="toc-progress-bar" :style="{ width: `${readingProgress}%` }"></div>
              </div>
              <div class="toc-progress-text">当前阅读进度 {{ readingProgress }}%</div>
              <div v-if="!visibleTocItems.length" class="toc-empty">没有目录</div>
              <div v-else class="toc-scroll">
                <div
                  v-for="section in visibleTocItems"
                  :key="section.id"
                  class="toc-row"
                  :style="{ '--toc-depth': section.depth }"
                >
                  <button
                    v-if="section.hasChildren"
                    type="button"
                    class="toc-toggle"
                    :class="{ 'is-open': section.isExpanded }"
                    @click="toggleTocSection(section.id)"
                  >
                    <span class="toc-toggle-icon">⌄</span>
                  </button>
                  <span v-else class="toc-toggle toc-toggle-placeholder"></span>
                  <button
                    type="button"
                    class="toc-item"
                    :class="{ 'is-active': activeSection === section.id }"
                    @click="handleTocItemClick(section.id, section.hasChildren)"
                  >
                    <span :class="`toc-level toc-level-${section.level}`">{{ section.text }}</span>
                    <span>H{{ section.level }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="aside-card">
              <div class="aside-title">阅读信息</div>
              <div class="aside-item">
                <span>文章分类</span>
                <strong>{{ displayCategory }}</strong>
              </div>
              <div class="aside-item">
                <span>标签数量</span>
                <strong>{{ displayTags.length }}</strong>
              </div>
            </div>
          </aside>
        </div>

        <section v-if="!isArticleLocked && recommendedArticles.length" class="recommended-section">
          <div class="recommended-head">
            <div>
              <div class="hero-kicker">Recommended</div>
              <h2 class="recommended-title">推荐文章</h2>
            </div>
            <p class="recommended-copy">继续阅读这些相关主题，沿着当前文章的脉络继续探索。</p>
          </div>

          <div class="recommended-grid">
            <article
              v-for="item in recommendedArticles"
              :key="item.id"
              class="recommended-card"
              @click="openArticle(item.id)"
            >
              <div class="recommended-meta">
                <span>{{ item.category }}</span>
                <span>{{ item.date }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="recommended-tags">
                <span v-for="tag in item.tags.slice(0, 2)" :key="tag">#{{ tag }}</span>
              </div>
            </article>
          </div>
        </section>

        <ArticleComments v-if="shouldShowComments" :article-id="commentArticleId" />

        <button
          v-if="isCompactScreen && !isArticleLocked"
          class="aside-toggle"
          type="button"
          @click="toggleAside"
        >
          {{ isAsideOpen ? '收起目录' : '查看目录' }}
        </button>
      </div>

      <Teleport to="body">
        <div
          v-if="isCompactScreen && !isArticleLocked && isAsideOpen"
          class="aside-mask"
          @click="closeAside"
        ></div>
        <aside
          v-if="isCompactScreen && !isArticleLocked"
          class="article-aside mobile-aside"
          :class="{ 'is-open': isAsideOpen }"
        >
          <div class="aside-card toc-card">
            <div class="aside-title">阅读目录</div>
            <div class="toc-progress">
              <div class="toc-progress-bar" :style="{ width: `${readingProgress}%` }"></div>
            </div>
            <div class="toc-progress-text">当前阅读进度 {{ readingProgress }}%</div>
            <div v-if="!visibleTocItems.length" class="toc-empty">没有目录</div>
            <div v-else class="toc-scroll">
              <div
                v-for="section in visibleTocItems"
                :key="section.id"
                class="toc-row"
                :style="{ '--toc-depth': section.depth }"
              >
                <button
                  v-if="section.hasChildren"
                  type="button"
                  class="toc-toggle"
                  :class="{ 'is-open': section.isExpanded }"
                  @click="toggleTocSection(section.id)"
                >
                  <span class="toc-toggle-icon">⌄</span>
                </button>
                <span v-else class="toc-toggle toc-toggle-placeholder"></span>
                <button
                  type="button"
                  class="toc-item"
                  :class="{ 'is-active': activeSection === section.id }"
                  @click="handleTocItemClick(section.id, section.hasChildren)"
                >
                  <span :class="`toc-level toc-level-${section.level}`">{{ section.text }}</span>
                  <span>H{{ section.level }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="aside-card">
            <div class="aside-title">阅读信息</div>
            <div class="aside-item">
              <span>文章分类</span>
              <strong>{{ displayCategory }}</strong>
            </div>
            <div class="aside-item">
              <span>标签数量</span>
              <strong>{{ displayTags.length }}</strong>
            </div>
          </div>
        </aside>
      </Teleport>
    </div>

    <div v-else-if="!loading" class="detail-shell">
      <div class="not-found">
        <div class="hero-kicker">Not Found</div>
        <h2>文章未找到</h2>
        <p>抱歉，您请求的文章不存在，或者已经被移除。</p>
        <button @click="goBack" class="btn-back">返回列表</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import ArticleComments from '@/components/front/ArticleComments.vue'
import ArticleMarkdownContent, {
  type ArticleMarkdownHeading,
} from '@/components/front/ArticleMarkdownContent.vue'
import { isAdmin } from '@/constants/userRoles'
import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'
import {
  addFrontArticleLike,
  addFrontArticleBrowse,
  fetchFrontArticleDetail,
  fetchFrontArticleLikeState,
  fetchFrontArticlePage,
  type FrontArticleReferenceData,
  removeFrontArticleLike,
  type FrontArticle,
} from '@/utils/frontArticles'

// ==================== 类型定义 ====================
type ArticleItem = FrontArticle
type TocTreeNode = ArticleMarkdownHeading & { children: TocTreeNode[] }
type VisibleTocItem = ArticleMarkdownHeading & {
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

// ==================== 通用常量 ====================
const PASSWORD_ERROR_PATTERN = /密码|加密|访问|解锁|口令/i

// ==================== 路由与状态 ====================
const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()
const { loginUser } = storeToRefs(loginUserStore)
const siteInfoStore = useSiteInfoStore()
const siteInfo = siteInfoStore.siteInfo

// ==================== 页面跳转功能 ====================
// 方法：返回上一页、打开相关文章
function goBack() {
  const hasBackHistory = window.history.length > 1

  if (hasBackHistory) {
    router.back()
    return
  }

  router.push('/articles')
}

function openArticle(id: string) {
  router.push(`/article/${id}`)
}

// ==================== 目录功能 ====================
// 变量：当前激活目录、阅读进度、目录抽屉、屏幕状态、目录数据、展开状态
const activeSection = ref('summary')
const readingProgress = ref(0)
const isAsideOpen = ref(false)
const isCompactScreen = ref(false)
const articleSections = ref<ArticleMarkdownHeading[]>([])
const expandedTocIds = ref<string[]>([])

// 计算属性：目录树、父子映射、展开集合、可见目录项
const tocTree = computed<TocTreeNode[]>(() => {
  const roots: TocTreeNode[] = []
  const stack: TocTreeNode[] = []

  for (const section of articleSections.value) {
    const node: TocTreeNode = {
      ...section,
      children: [],
    }

    while ((stack.length && stack[stack.length - 1]?.level) ?? 0 >= node.level) {
      stack.pop()
    }

    if (stack.length) {
      stack[stack.length - 1]?.children.push(node)
    } else {
      roots.push(node)
    }

    stack.push(node)
  }

  return roots
})

const tocParentMap = computed(() => {
  const parentMap = new Map<string, string>()

  const walk = (nodes: TocTreeNode[], parentId?: string) => {
    for (const node of nodes) {
      if (parentId) {
        parentMap.set(node.id, parentId)
      }

      if (node.children.length) {
        walk(node.children, node.id)
      }
    }
  }

  walk(tocTree.value)
  return parentMap
})

const expandedTocIdSet = computed(() => new Set(expandedTocIds.value))

const visibleTocItems = computed<VisibleTocItem[]>(() => {
  const items: VisibleTocItem[] = []

  const walk = (nodes: TocTreeNode[], depth: number) => {
    for (const node of nodes) {
      const hasChildren = node.children.length > 0
      const isExpanded = expandedTocIdSet.value.has(node.id)

      items.push({
        id: node.id,
        text: node.text,
        level: node.level,
        depth,
        hasChildren,
        isExpanded,
      })

      if (hasChildren && isExpanded) {
        walk(node.children, depth + 1)
      }
    }
  }

  walk(tocTree.value, 0)
  return items
})

// 方法：标题同步、目录滚动联动、展开祖先目录、切换折叠、目录点击、正文滚动联动、目录跳转、抽屉控制、屏幕同步
const handleHeadingsChange = (headings: ArticleMarkdownHeading[]) => {
  articleSections.value = headings
  activeSection.value = headings[0]?.id || ''
  expandedTocIds.value = []
  nextTick(() => {
    updateReadingState()
  })
}

const syncActiveTocItemIntoView = () => {
  if (typeof window === 'undefined' || !activeSection.value) return

  window.requestAnimationFrame(() => {
    const activeItems = Array.from(
      document.querySelectorAll<HTMLElement>('.toc-scroll .toc-item.is-active'),
    )

    activeItems.forEach((item) => {
      const scrollContainer = item.closest('.toc-scroll') as HTMLElement | null
      if (!scrollContainer) return

      const itemTop = item.offsetTop
      const itemBottom = itemTop + item.offsetHeight
      const visibleTop = scrollContainer.scrollTop
      const visibleBottom = visibleTop + scrollContainer.clientHeight

      if (itemTop < visibleTop) {
        scrollContainer.scrollTo({
          top: Math.max(itemTop - 12, 0),
          behavior: 'smooth',
        })
        return
      }

      if (itemBottom > visibleBottom) {
        scrollContainer.scrollTo({
          top: itemBottom - scrollContainer.clientHeight + 12,
          behavior: 'smooth',
        })
      }
    })
  })
}

const expandTocAncestors = (id: string) => {
  if (!id) return

  const expandedIds = new Set(expandedTocIds.value)
  let currentId = id

  while (tocParentMap.value.has(currentId)) {
    const parentId = tocParentMap.value.get(currentId)
    if (!parentId) break

    expandedIds.add(parentId)
    currentId = parentId
  }

  expandedTocIds.value = Array.from(expandedIds)
  syncActiveTocItemIntoView()
}

const toggleTocSection = (id: string) => {
  const expandedIds = new Set(expandedTocIds.value)

  if (expandedIds.has(id)) {
    expandedIds.delete(id)
  } else {
    expandedIds.add(id)
  }

  expandedTocIds.value = Array.from(expandedIds)
}

const handleTocItemClick = (id: string, hasChildren: boolean) => {
  if (hasChildren) {
    const expandedIds = new Set(expandedTocIds.value)
    expandedIds.add(id)
    expandedTocIds.value = Array.from(expandedIds)
  }

  scrollToSection(id)
}

const updateReadingState = () => {
  if (isArticleLocked.value) {
    activeSection.value = ''
    readingProgress.value = 0
    return
  }

  const sections = articleSections.value.map((section) => ({
    id: section.id,
    element: document.getElementById(section.id),
  }))

  const scrollPosition = window.scrollY + 180
  const articleElement = document.querySelector('.article-content') as HTMLElement | null

  if (articleElement) {
    const start = articleElement.offsetTop
    const height = articleElement.offsetHeight - window.innerHeight
    const progress = height > 0 ? ((window.scrollY - start) / height) * 100 : 100
    readingProgress.value = Math.max(0, Math.min(100, Math.round(progress)))
  }

  for (const section of sections) {
    if (section.element && scrollPosition >= section.element.offsetTop) {
      activeSection.value = section.id
      expandTocAncestors(section.id)
    }
  }
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return

  expandTocAncestors(id)
  isAsideOpen.value = false
  window.scrollTo({
    top: element.offsetTop - 120,
    behavior: 'smooth',
  })
}

const toggleAside = () => {
  isAsideOpen.value = !isAsideOpen.value
}

const closeAside = () => {
  isAsideOpen.value = false
}

const updateScreenState = () => {
  isCompactScreen.value = window.innerWidth < 1100

  if (!isCompactScreen.value) {
    isAsideOpen.value = false
  }
}

// watch：当前高亮目录变化时同步目录面板滚动位置
watch(
  () => activeSection.value,
  () => {
    syncActiveTocItemIntoView()
  },
)

// ==================== 文章详情功能 ====================
// 变量：加载状态、解锁状态、密码输入、加密状态、当前文章
const loading = ref(true)
const unlocking = ref(false)
const passwordInput = ref('')
const isArticleLocked = ref(false)
const article = ref<ArticleItem | null>(null)

// 计算属性：详情页展示内容
const displayTitle = computed(() => article.value?.title || '加密文章')
const displayDescription = computed(() => {
  if (article.value?.description) return article.value.description
  if (isArticleLocked.value) return '当前文章已加密，输入访问密码后重新请求页面。'
  return ''
})
const displayContent = computed(() =>
  isArticleLocked.value ? '' : article.value?.rawContent || article.value?.content || '',
)
const displayDate = computed(() => article.value?.date || '--')
const displayCategory = computed(() => article.value?.category || '未分类')
const displayTags = computed(() => article.value?.tags || [])
const displayImage = computed(() => article.value?.img)

// 方法：加密错误识别、请求详情、解锁文章
const isLockedErrorMessage = (message: string) => PASSWORD_ERROR_PATTERN.test(message)

const fetchArticleDetail = async (password?: string) => {
  const articleId = String(route.params.id || '').trim()
  if (!articleId) {
    article.value = null
    recommendedArticles.value = []
    isArticleLocked.value = false
    articleSections.value = []
    return
  }

  const currentPassword = String(password || '').trim()
  const isPasswordRequest = Boolean(currentPassword)

  if (isPasswordRequest) {
    unlocking.value = true
  } else {
    loading.value = true
  }

  try {
    const result = await fetchFrontArticleDetail({
      id: articleId,
      imageBaseUrl: siteInfo.imageUrl,
      ...(isPasswordRequest ? { password: currentPassword } : {}),
    })

    article.value = result.article
    await syncArticleLikeState(result.article.id)
    isArticleLocked.value =
      !isPasswordRequest && !canBypassArticleLock.value && result.article.isEncrypt === 1

    if (!isArticleLocked.value && (!result.article.isEncrypt || isPasswordRequest)) {
      triggerArticleBrowseForCurrentRoute()
    }

    if (isArticleLocked.value) {
      recommendedArticles.value = []
      articleSections.value = []
      return
    }

    passwordInput.value = ''
    await fetchRecommendedArticles(result.article, result)
    await nextTick()
    updateReadingState()
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取文章详情失败'

    if (!isPasswordRequest && isLockedErrorMessage(message)) {
      article.value = null
      isArticleLocked.value = !canBypassArticleLock.value
      recommendedArticles.value = []
      articleSections.value = []
      return
    }

    if (isPasswordRequest && isLockedErrorMessage(message)) {
      return
    }

    article.value = null
    isArticleLocked.value = false
    recommendedArticles.value = []
    articleSections.value = []
  } finally {
    loading.value = false
    unlocking.value = false
  }
}

const handleUnlock = async () => {
  if (!passwordInput.value.trim()) {
    ElMessage.warning('请输入访问密码')
    return
  }

  await fetchArticleDetail(passwordInput.value)
}

// ==================== 评论与权限功能 ====================
// 计算属性：评论系统开关、管理员免密能力、评论区展示条件
const isSystemCommentEnabled = computed(() => siteInfo.commentStatus === '1')
const canBypassArticleLock = computed(
  () => Boolean(loginUser.value.id) && isAdmin(loginUser.value.userRole || ''),
)
const shouldShowComments = computed(
  () =>
    Boolean(article.value) &&
    !isArticleLocked.value &&
    isSystemCommentEnabled.value &&
    article.value!.isComment !== 0,
)
const commentArticleId = computed(() => {
  if (article.value?.id) return article.value.id

  const routeArticleId = route.params.id
  return Array.isArray(routeArticleId) ? routeArticleId[0] || '' : routeArticleId || ''
})

// ==================== 浏览量功能 ====================
// 变量 / 计算属性：阅读量展示、本地浏览缓存 key
const displayReadCount = computed(() => article.value?.readCount || 0)
const ARTICLE_BROWSE_CACHE_KEY = 'hao-blog:article-browse'

// 方法：读取已浏览文章、记录已浏览文章、首次访问时增加浏览量、按当前路由触发浏览量
const getViewedArticleIds = () => {
  if (typeof window === 'undefined') return new Set<string>()

  try {
    const rawValue = window.localStorage.getItem(ARTICLE_BROWSE_CACHE_KEY)
    const parsedValue = rawValue ? JSON.parse(rawValue) : []

    if (!Array.isArray(parsedValue)) return new Set<string>()

    return new Set(parsedValue.map((item) => String(item).trim()).filter(Boolean))
  } catch {
    return new Set<string>()
  }
}

const markArticleAsViewed = (articleId: string) => {
  if (typeof window === 'undefined') return

  const viewedIds = getViewedArticleIds()
  viewedIds.add(articleId)
  window.localStorage.setItem(ARTICLE_BROWSE_CACHE_KEY, JSON.stringify(Array.from(viewedIds)))
}

const increaseArticleBrowseIfNeeded = async (articleId: string) => {
  if (!String(articleId).trim()) return

  const viewedIds = getViewedArticleIds()
  if (viewedIds.has(articleId)) return

  try {
    const browseAdded = await addFrontArticleBrowse(articleId)
    if (!browseAdded) return

    markArticleAsViewed(articleId)

    if (article.value?.id === articleId) {
      article.value = {
        ...article.value,
        readCount: article.value.readCount + 1,
      }
    }
  } catch {
    // Keep detail rendering stable even if browse counting fails.
  }
}

const triggerArticleBrowseForCurrentRoute = () => {
  const articleId = String(route.params.id || '').trim()
  if (!articleId) return

  void increaseArticleBrowseIfNeeded(articleId)
}

// ==================== 点赞功能 ====================
// 变量 / 计算属性：点赞状态、点赞请求状态、点赞数展示
const likePending = ref(false)
const isArticleLiked = ref(false)
const displayLikeCount = computed(() => article.value?.likeCount || 0)

// 方法：同步点赞状态、刷新当前文章点赞状态、点赞与取消点赞
const syncArticleLikeState = async (articleId: string) => {
  try {
    isArticleLiked.value = await fetchFrontArticleLikeState(articleId)
  } catch {
    isArticleLiked.value = false
  }
}

const refreshCurrentArticleLikeState = async () => {
  const articleId = article.value?.id || String(route.params.id || '').trim()
  if (!articleId) {
    isArticleLiked.value = false
    return
  }

  await syncArticleLikeState(articleId)
}

const handleToggleLike = async () => {
  const articleId = article.value?.id
  if (!articleId || likePending.value) return

  likePending.value = true

  try {
    if (isArticleLiked.value) {
      const removed = await removeFrontArticleLike(articleId)
      if (!removed) return

      isArticleLiked.value = false

      if (article.value?.id === articleId) {
        article.value = {
          ...article.value,
          likeCount: Math.max(0, article.value.likeCount - 1),
        }
      }

      return
    }

    const added = await addFrontArticleLike(articleId)
    if (!added) return

    isArticleLiked.value = true

    if (article.value?.id === articleId) {
      article.value = {
        ...article.value,
        likeCount: article.value.likeCount + 1,
      }
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '点赞操作失败')
  } finally {
    likePending.value = false
  }
}

// ==================== 推荐文章功能 ====================
// 变量：推荐文章列表
const recommendedArticles = ref<ArticleItem[]>([])

// 方法：优先同分类推荐，不足时补充通用文章
const fetchRecommendedArticles = async (
  currentArticle: ArticleItem,
  referenceData: FrontArticleReferenceData,
) => {
  try {
    const primaryResult = await fetchFrontArticlePage({
      query: {
        current: 1,
        pageSize: 4,
        categoryId: currentArticle.categoryId,
      },
      imageBaseUrl: siteInfo.imageUrl,
      referenceData,
    })

    let nextArticles = primaryResult.articles.filter((item) => item.id !== currentArticle.id)

    if (nextArticles.length < 3) {
      const fallbackResult = await fetchFrontArticlePage({
        query: {
          current: 1,
          pageSize: 6,
        },
        imageBaseUrl: siteInfo.imageUrl,
        referenceData,
      })

      const seenIds = new Set([currentArticle.id, ...nextArticles.map((item) => item.id)])
      nextArticles = [
        ...nextArticles,
        ...fallbackResult.articles.filter((item) => !seenIds.has(item.id)),
      ]
    }

    recommendedArticles.value = nextArticles.slice(0, 3)
  } catch {
    recommendedArticles.value = []
  }
}

// ==================== watch 与生命周期 ====================
// watch：文章 id 变化时重置局部状态并重新获取详情
watch(
  () => route.params.id,
  async () => {
    passwordInput.value = ''
    isArticleLiked.value = false
    isAsideOpen.value = false
    articleSections.value = []
    expandedTocIds.value = []
    await fetchArticleDetail()
  },
)

// watch：管理员免密状态变化时重新请求详情
watch(canBypassArticleLock, async (enabled, previous) => {
  if (enabled && isArticleLocked.value) {
    await fetchArticleDetail()
  }
  if (!enabled && previous) {
    passwordInput.value = ''
    await fetchArticleDetail()
  }
})

// watch：登录成功和退出登录后刷新点赞状态
watch(
  () => loginUser.value.id,
  async (current, previous) => {
    if (current === previous) return
    await refreshCurrentArticleLikeState()
  },
)

// 生命周期：挂载时初始化详情页，卸载时清理事件监听
onMounted(async () => {
  updateScreenState()
  window.addEventListener('scroll', updateReadingState, { passive: true })
  window.addEventListener('resize', updateScreenState, { passive: true })
  await fetchArticleDetail()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateReadingState)
  window.removeEventListener('resize', updateScreenState)
})
</script>

<style scoped>
/* ==================== 页面整体功能 ==================== */
.article-detail-page {
  min-height: 100vh;
}

.detail-hero {
  position: relative;
}

.hero-pattern {
  position: absolute;
  inset: 0 0 auto;
  height: 280px;
  background:
    radial-gradient(circle at top right, rgba(90, 135, 255, 0.18), transparent 26%),
    radial-gradient(circle at left top, rgba(88, 198, 255, 0.14), transparent 28%);
  pointer-events: none;
}

.detail-shell {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
}

.detail-shell-loading {
  padding-top: 12px;
}

/* ==================== 移动端目录抽屉功能 ==================== */
.aside-mask {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background: rgba(15, 23, 42, 0.26);
  backdrop-filter: blur(2px);
}

/* ==================== 文章详情卡片功能 ==================== */
.article-content {
  overflow: hidden;
  border: 1px solid rgba(188, 202, 225, 0.38);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 26px 56px rgba(28, 67, 130, 0.12);
  backdrop-filter: blur(14px);
}

.article-content-skeleton {
  min-height: 860px;
}

.article-header {
  padding: 42px 44px 28px;
  background:
    linear-gradient(180deg, rgba(246, 250, 255, 0.96), rgba(255, 255, 255, 0.92)),
    linear-gradient(135deg, rgba(82, 128, 255, 0.08), transparent 36%);
  border-bottom: 1px solid rgba(214, 223, 238, 0.8);
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(74, 107, 243, 0.1);
  color: #4560ef;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-title {
  margin: 18px 0 14px;
  color: #1a2742;
  font-size: clamp(1.45rem, 2.5vw, 2.1rem);
  font-weight: 800;
  line-height: 1.15;
}

.article-summary {
  max-width: 760px;
  color: #60708f;
  font-size: 16px;
  line-height: 1.85;
}

.article-meta-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 22px;
  margin-top: 28px;
}

.meta-inline-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6f7f99;
  font-size: 13px;
}

.meta-inline-label {
  color: #8a97ae;
}

.meta-inline-value {
  color: #243654;
  font-size: 14px;
  font-weight: 700;
}

/* ==================== 文章标签功能 ==================== */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.tag-chip {
  padding: 7px 14px;
  border: 1px solid rgba(74, 107, 243, 0.12);
  border-radius: 999px;
  background: rgba(72, 118, 255, 0.08);
  color: #3762c7;
  font-size: 13px;
  font-weight: 700;
}

/* ==================== 文章封面功能 ==================== */
.article-cover {
  padding: 18px 18px 0;
}

.article-cover img {
  display: block;
  width: 100%;
  max-height: 460px;
  border-radius: 24px;
  object-fit: cover;
  box-shadow: 0 16px 34px rgba(31, 74, 148, 0.14);
}

/* ==================== 页面内容布局功能 ==================== */
.article-layout {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) 240px;
  align-items: start;
}

.article-layout--single {
  grid-template-columns: minmax(0, 1fr);
}

.article-main {
  min-width: 0;
  padding: 14px 14px 0;
}

.article-main-skeleton {
  padding: 24px 20px 0;
}

.article-skeleton-kicker {
  width: 112px;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(224, 232, 245, 0.92), rgba(241, 245, 255, 0.98));
}

.article-skeleton-title {
  width: min(78%, 520px);
  height: 44px;
  margin-top: 18px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(224, 232, 245, 0.94), rgba(241, 245, 255, 0.98));
}

.article-skeleton-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 22px;
  margin-top: 28px;
}

.article-skeleton-meta-item {
  width: 126px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(229, 236, 247, 0.92), rgba(243, 247, 255, 0.98));
}

.article-skeleton-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.article-skeleton-tag {
  width: 74px;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(226, 234, 247, 0.92), rgba(243, 247, 255, 0.98));
}

.article-skeleton-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.article-skeleton-button {
  width: 132px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(225, 233, 246, 0.92), rgba(242, 246, 255, 0.98));
}

.article-skeleton-button-like {
  width: 104px;
}

/* ==================== 文章解锁功能 ==================== */
.article-lock-panel {
  display: grid;
  gap: 16px;
  padding: 34px 44px 40px;
}

.lock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #315ed3;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.article-lock-panel h2 {
  margin: 0;
  color: #1d2b47;
  font-size: 28px;
  font-weight: 800;
}

.article-lock-panel p {
  max-width: 620px;
  margin: 0;
  color: #647693;
  font-size: 15px;
  line-height: 1.85;
}

.lock-input {
  max-width: 420px;
}

.lock-input :deep(.el-input__wrapper) {
  min-height: 48px;
  border-radius: 16px;
}

.lock-actions {
  display: flex;
  gap: 12px;
}

/* ==================== 文章导语与正文功能 ==================== */
.lead-quote {
  position: relative;
  padding: 22px 24px 22px 30px;
  border: 1px solid rgba(188, 204, 229, 0.62);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(244, 248, 255, 0.95), rgba(252, 254, 255, 0.98));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.lead-quote,
.article-full-content {
  scroll-margin-top: 130px;
}

.quote-mark {
  position: absolute;
  top: 8px;
  left: 18px;
  color: rgba(78, 110, 240, 0.18);
  font-size: 54px;
  font-weight: 800;
  line-height: 1;
}

.lead-quote p {
  position: relative;
  z-index: 1;
  color: #4c6387;
  font-size: 16px;
  line-height: 1.85;
}

.article-full-content {
  margin-top: 5px;
  overflow-x: hidden;
}

.article-full-content :deep(img) {
  max-width: 100%;
}

/* ==================== 右侧侧栏功能 ==================== */
.article-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 110px;
  align-self: start;
}

.aside-toggle {
  position: fixed;
  right: 18px;
  bottom: 20px;
  z-index: 18;
  display: none;
  min-width: 104px;
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #4566f3 0%, #44a0ff 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 18px 30px rgba(67, 101, 240, 0.24);
  cursor: pointer;
}

/* ==================== 侧栏卡片功能 ==================== */
.aside-card {
  padding: 20px;
  border: 1px solid rgba(203, 215, 233, 0.75);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f6f9ff);
  box-shadow: 0 12px 28px rgba(48, 77, 126, 0.08);
}

.toc-card {
  overflow: hidden;
}

/* ==================== 目录功能 ==================== */
.toc-progress {
  width: 100%;
  height: 8px;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(222, 230, 242, 0.9);
}

.toc-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #4a67ef, #51a9ff);
}

.toc-progress-text {
  margin-bottom: 12px;
  color: #7787a3;
  font-size: 12px;
}

.toc-empty {
  margin-bottom: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(241, 245, 255, 0.9);
  color: #7d8ba5;
  font-size: 13px;
  line-height: 1.7;
}

.toc-scroll {
  overflow-y: auto;
  max-height: min(52vh, 420px);
  padding-right: 4px;
}

.toc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  margin-bottom: 4px;
  padding-left: calc(var(--toc-depth, 0) * 16px);
}

.toc-row:last-child {
  margin-bottom: 0;
}

.toc-toggle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #7d8ba5;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.toc-toggle:hover {
  color: #4f67a5;
}

.toc-toggle.is-open .toc-toggle-icon {
  transform: rotate(0deg);
}

.toc-toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

.toc-toggle-placeholder {
  visibility: hidden;
}

.toc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 6px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #5e708f;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.toc-item:hover {
  color: #3558a2;
}

.toc-item.is-active {
  position: relative;
  color: #274d9c;
  font-weight: 700;
}

.toc-item.is-active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 7px;
  bottom: 7px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #4a67ef, #51a9ff);
}

.toc-level {
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-level-2 {
  padding-left: 10px;
}

.toc-level-3 {
  padding-left: 20px;
}

.toc-level-4 {
  padding-left: 30px;
}

.toc-level-5 {
  padding-left: 40px;
}

/* ==================== 侧栏补充信息功能 ==================== */
.soft-card {
  background: linear-gradient(180deg, #f8fbff, #eef5ff);
}

.aside-title {
  margin-bottom: 14px;
  color: #243654;
  font-size: 15px;
  font-weight: 800;
}

.aside-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(225, 231, 242, 0.9);
  color: #70809e;
  font-size: 13px;
}

.aside-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.aside-item strong {
  color: #253757;
  font-size: 14px;
}

.soft-card p {
  color: #637592;
  font-size: 14px;
  line-height: 1.8;
}

/* ==================== 底部操作功能 ==================== */
.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34px 44px 40px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

/* ==================== 点赞与操作按钮功能 ==================== */
.btn-back,
.btn-like,
.btn-share {
  min-width: 132px;
  padding: 13px 22px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

.btn-back {
  background: #eef3fb;
  color: #33517c;
  box-shadow: 0 10px 22px rgba(56, 82, 125, 0.08);
}

.btn-like {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 244, 247, 0.98);
  color: #bf4868;
  box-shadow: 0 12px 24px rgba(191, 72, 104, 0.12);
}

.heart-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.heart-icon svg {
  width: 20px;
  height: 20px;
  display: block;
}

.btn-like.is-active {
  background: linear-gradient(135deg, #ef6a8a 0%, #ff8e72 100%);
  color: #fff;
  box-shadow: 0 16px 28px rgba(239, 106, 138, 0.22);
}

.btn-like:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.btn-share {
  background: linear-gradient(135deg, #4566f3 0%, #44a0ff 100%);
  color: #fff;
  box-shadow: 0 16px 28px rgba(67, 101, 240, 0.22);
}

.btn-back:hover,
.btn-like:hover,
.btn-share:hover {
  transform: translateY(-1px);
}

/* ==================== 空状态功能 ==================== */
.not-found {
  padding: 54px 28px;
  border: 1px solid rgba(188, 202, 225, 0.38);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 26px 56px rgba(28, 67, 130, 0.12);
  text-align: center;
}

.not-found h2 {
  margin: 18px 0 12px;
  color: #253757;
  font-size: 30px;
  font-weight: 800;
}

.not-found p {
  margin-bottom: 24px;
  color: #6a7b98;
  font-size: 15px;
}

/* ==================== 推荐文章功能 ==================== */
.recommended-section {
  margin-top: 28px;
  padding: 28px;
  border: 1px solid rgba(188, 202, 225, 0.38);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 26px 56px rgba(28, 67, 130, 0.1);
}

.recommended-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.recommended-title {
  margin-top: 14px;
  color: #1d2b47;
  font-size: 28px;
  font-weight: 800;
}

.recommended-copy {
  max-width: 420px;
  color: #6a7b98;
  font-size: 14px;
  line-height: 1.8;
}

.recommended-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.recommended-card {
  padding: 20px;
  border: 1px solid rgba(203, 215, 233, 0.75);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f6f9ff);
  box-shadow: 0 12px 28px rgba(48, 77, 126, 0.08);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.recommended-card:hover {
  transform: translateY(-2px);
  border-color: rgba(78, 116, 241, 0.26);
  box-shadow: 0 18px 30px rgba(48, 77, 126, 0.12);
}

.recommended-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #7c8ba6;
  font-size: 12px;
  font-weight: 700;
}

.recommended-card h3 {
  margin: 14px 0 10px;
  color: #243654;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.45;
}

.recommended-card p {
  color: #647693;
  font-size: 14px;
  line-height: 1.8;
}

.recommended-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.recommended-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(72, 118, 255, 0.08);
  color: #3762c7;
  font-size: 12px;
  font-weight: 700;
}

/* ==================== 响应式布局：平板端 ==================== */
@media (max-width: 1100px) {
  .aside-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .article-layout {
    grid-template-columns: 1fr;
  }

  .mobile-aside {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 1002;
    width: min(82vw, 260px);
    padding: 16px 14px 20px;
    box-sizing: border-box;
    overflow-y: auto;
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.98), rgba(240, 246, 255, 0.96));
    box-shadow: -18px 0 40px rgba(41, 72, 126, 0.12);
    transform: translateX(calc(100% + 20px));
    transition: transform 0.28s ease;
  }

  .mobile-aside.is-open {
    transform: translateX(0);
  }

  .recommended-grid {
    grid-template-columns: 1fr;
  }
}

/* ==================== 响应式布局：中等屏幕 ==================== */
@media (max-width: 960px) {
  .article-layout {
    grid-template-columns: 1fr;
  }

  .mobile-aside {
    width: min(84vw, 260px);
  }

  .recommended-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ==================== 响应式布局：移动端 ==================== */
@media (max-width: 768px) {
  .article-header {
    padding: 28px 20px 22px;
  }

  .article-cover {
    padding: 14px 14px 0;
  }

  .article-main {
    padding: 10px 8px 0;
  }

  .article-lock-panel {
    padding: 24px 20px 28px;
  }

  .article-footer {
    flex-direction: column;
    gap: 14px;
    padding: 24px 20px 28px;
  }

  .footer-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-back,
  .btn-like,
  .btn-share {
    width: 100%;
  }

  .recommended-section {
    padding: 22px 20px;
    border-radius: 24px;
  }

  .recommended-title {
    font-size: 24px;
  }
}
</style>
