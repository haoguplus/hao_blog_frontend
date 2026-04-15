<template>
  <section v-loading="loading" class="life-page">
    <header class="hero-card">
      <div class="hero-copy">
        <span class="hero-badge">Life Notes</span>
        <h1>生活随记</h1>
        <p>
          这里记录日常灵感、琐碎片段和一些值得回头再看的瞬间。没有太多修饰，更多是生活本身留下来的温度。
        </p>
        <div class="hero-meta">
          <span class="hero-meta-item">共 {{ lifePosts.length }} 条动态</span>
          <span class="hero-meta-divider"></span>
          <span class="hero-meta-item">最近更新：{{ latestPostDate }}</span>
        </div>
      </div>
      <img src="@/assets/image/0b267c7f1376b71dff8c7af0e2a460ee.png" class="hero-bg" />
    </header>

    <div v-if="tags.length > 1" class="filter-bar">
      <button
        v-for="tag in tags"
        :key="tag"
        :ref="(el) => setFilterChipRef(tag, el as HTMLButtonElement | null)"
        type="button"
        class="filter-chip"
        :class="{ 'is-active': activeTag === tag }"
        @click="handleSelectTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div v-if="filteredPosts.length" class="timeline">
      <article v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="timeline-dot"></div>

        <div class="post-date">
          <span class="post-day">{{ post.day }}</span>
          <span class="post-month">{{ post.month }}</span>
        </div>

        <div class="post-content">
          <div class="post-top">
            <p class="post-meta">
              {{ post.date }}
              <span v-if="post.postTypeLabel"> · {{ post.postTypeLabel }}</span>
              <span v-if="post.isTop">置顶</span>
            </p>
            <span v-if="post.moodLabel" class="mood-badge">{{ post.moodLabel }}</span>
          </div>

          <p class="post-text">{{ post.content }}</p>

          <div
            v-if="post.images.length"
            class="photo-grid"
            :class="`photo-grid-${Math.min(post.images.length, 9)}`"
          >
            <div v-for="image in post.images" :key="image" class="photo-item">
              <el-image
                :src="image"
                :preview-src-list="post.images"
                fit="cover"
                preview-teleported
                class="photo-preview"
              />
            </div>
          </div>

          <div class="post-footer" :class="{ 'post-footer-no-tags': !post.tags.length }">
            <div v-if="post.tags.length" class="tag-group">
              <button
                v-for="item in post.tags"
                :key="item"
                type="button"
                class="post-tag"
                @click="handleSelectTag(item)"
              >
                #{{ item }}
              </button>
            </div>
            <div class="post-actions">
              <button
                type="button"
                class="action-chip action-chip-comment"
                :class="{ 'is-open': commentsVisible[post.id] }"
                @click="handleToggleComments(post.id)"
              >
                <el-icon><ChatDotRound /></el-icon>
                <span>评论 {{ post.commentCount }}</span>
              </button>
              <button
                type="button"
                class="action-chip"
                :class="{ 'is-active': post.isLike }"
                @click="handleToggleLike(post.id)"
              >
                {{ post.isLike ? '已点赞' : '点赞' }} {{ post.likeCount }}
              </button>
            </div>
          </div>

          <div v-if="commentsVisible[post.id]" class="comment-panel">
            <div class="comment-compose">
              <el-input
                :ref="(el: InputInstance | null) => setCommentInputRef(post.id, el)"
                v-model="commentDrafts[post.id]"
                type="textarea"
                :rows="2"
                resize="none"
                maxlength="300"
                show-word-limit
                placeholder="写下你的想法吧..."
              />
              <div class="comment-compose-footer">
                <div class="comment-compose-tools">
                  <div
                    class="comment-emoji-wrap"
                    :ref="(el) => setCommentEmojiWrapRef(post.id, el as HTMLDivElement | null)"
                  >
                    <button
                      type="button"
                      class="comment-emoji-trigger"
                      :class="{ 'is-active': activeEmojiPostId === post.id }"
                      @mousedown.prevent
                      @click="toggleEmojiPanel(post.id)"
                    >
                      <span class="comment-emoji-icon">☺</span>
                    </button>
                    <div v-if="activeEmojiPostId === post.id" class="comment-emoji-panel">
                      <button
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        type="button"
                        class="comment-emoji-item"
                        @mousedown.prevent
                        @click="insertEmoji(post.id, emoji)"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                  <span class="comment-tip">
                    {{ loginUserStore.loginUser.id ? '文明发言，友善交流' : '登录后即可发表评论' }}
                  </span>
                </div>
                <el-button type="primary" size="small" @click="handleSubmitPostComment(post.id)">
                  发表评论
                </el-button>
              </div>
            </div>

            <div
              v-if="commentsLoading[post.id] && !commentsByPost[post.id]?.length"
              class="comment-empty"
            >
              评论加载中...
            </div>

            <div v-else-if="commentsByPost[post.id]?.length" class="comment-list">
              <div
                v-for="comment in commentsByPost[post.id]"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-avatar">
                  <img
                    v-if="comment.userAvatar"
                    :src="comment.userAvatar"
                    :alt="comment.userName"
                  />
                  <span v-else>{{ comment.userName.slice(0, 1) }}</span>
                </div>
                <div class="comment-body">
                  <div class="comment-head">
                    <div class="comment-author">
                      <strong>{{ comment.userName }}</strong>
                      <span v-if="comment.replyUserName" class="reply-tag">
                        回复 @{{ comment.replyUserName }}
                      </span>
                    </div>
                    <span>{{ comment.createdAt }}</span>
                  </div>
                  <p>{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button
                      type="button"
                      class="comment-reply"
                      @click="handleReplyComment(post.id, comment.id, comment.userName)"
                    >
                      回复
                    </button>
                  </div>
                  <div v-if="replyTargetByPost[post.id]?.id === comment.id" class="reply-compose">
                    <div class="reply-banner">
                      <span>正在回复 @{{ comment.userName }}</span>
                      <button type="button" class="reply-cancel" @click="clearReplyTarget(post.id)">
                        取消回复
                      </button>
                    </div>
                    <el-input
                      :ref="(el: InputInstance | null) => setReplyInputRef(comment.id, el)"
                      v-model="replyDraftsByComment[comment.id]"
                      type="textarea"
                      :rows="2"
                      resize="none"
                      maxlength="300"
                      show-word-limit
                      :placeholder="`回复 @${comment.userName}...`"
                    />
                    <div class="reply-compose-footer">
                      <div class="comment-compose-tools">
                        <div
                          class="comment-emoji-wrap"
                          :ref="
                            (el) => setReplyEmojiWrapRef(comment.id, el as HTMLDivElement | null)
                          "
                        >
                          <button
                            type="button"
                            class="comment-emoji-trigger"
                            :class="{ 'is-active': activeReplyEmojiCommentId === comment.id }"
                            @mousedown.prevent
                            @click="toggleReplyEmojiPanel(comment.id)"
                          >
                            <span class="comment-emoji-icon">☺</span>
                          </button>
                          <div
                            v-if="activeReplyEmojiCommentId === comment.id"
                            class="comment-emoji-panel"
                          >
                            <button
                              v-for="emoji in emojiOptions"
                              :key="emoji"
                              type="button"
                              class="comment-emoji-item"
                              @mousedown.prevent
                              @click="insertReplyEmoji(comment.id, emoji)"
                            >
                              {{ emoji }}
                            </button>
                          </div>
                        </div>
                        <span class="comment-tip">
                          {{
                            loginUserStore.loginUser.id
                              ? '文明发言，友善交流'
                              : '登录后即可发表评论'
                          }}
                        </span>
                      </div>
                      <div class="reply-compose-actions">
                        <button
                          type="button"
                          class="reply-compose-btn reply-compose-btn-ghost"
                          @click="clearReplyTarget(post.id)"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          class="reply-compose-btn reply-compose-btn-primary"
                          @click="handleSubmitReplyComment(post.id, comment)"
                        >
                          回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="commentsByPost[post.id]?.length && commentsHasMoreByPost[post.id]"
              type="button"
              class="comment-load-more"
              :disabled="commentsLoading[post.id]"
              @click="handleLoadMoreComments(post.id)"
            >
              {{ commentsLoading[post.id] ? '加载中...' : '加载更多评论' }}
            </button>

            <div
              v-else-if="commentsByPost[post.id]?.length && !commentsHasMoreByPost[post.id]"
              class="comment-load-end"
            >
              已经没有更多评论了
            </div>

            <div v-else class="comment-empty">还没有评论，来抢个沙发吧</div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="filteredPosts.length" class="timeline-status">
      <div v-if="loadingMorePosts" class="timeline-status-copy">正在加载更多说说...</div>
      <div v-else-if="!hasMorePosts" class="timeline-status-copy">已经没有更多数据了</div>
    </div>

    <div v-else-if="!loading" class="empty-state">暂时还没有生活动态</div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, type InputInstance } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'
import { getPostCommentList, pushPostComment } from '@/api/componentController'
import { FRONT_AUTH_CHANGED_EVENT } from '@/constants/auth'
import { getFrontPostsList, getPostsPublicData, likePost } from '@/api/userPostsController'
import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'

type LifePost = {
  id: string
  date: string
  day: string
  month: string
  content: string
  tags: string[]
  images: string[]
  moodLabel: string
  postTypeLabel: string
  isLike: boolean
  likeCount: number
  commentCount: number
  isTop: boolean
}

type PostCommentItem = {
  id: string
  postId: string
  replyId: string
  content: string
  createdAt: string
  userName: string
  userAvatar: string
  replyUserName: string
}

const siteInfo = useSiteInfoStore().siteInfo
const loginUserStore = useLoginUserStore()
const loading = ref(false)
const loadingMorePosts = ref(false)
const activeTag = ref('全部')
const lifePosts = ref<LifePost[]>([])
const postsPublicData = ref<API.PostPublicData>({})
const lifePostPage = ref(1)
const lifePostPageSize = 10
const hasMorePosts = ref(true)
const commentsByPost = ref<Record<string, PostCommentItem[]>>({})
const commentsVisible = ref<Record<string, boolean>>({})
const commentsLoading = ref<Record<string, boolean>>({})
const commentsLoaded = ref<Record<string, boolean>>({})
const commentsPageByPost = ref<Record<string, number>>({})
const commentsHasMoreByPost = ref<Record<string, boolean>>({})
const commentDrafts = ref<Record<string, string>>({})
const replyDraftsByComment = ref<Record<string, string>>({})
const replyTargetByPost = ref<Record<string, { id: string; userName: string } | null>>({})
const commentInputRefs = ref<Record<string, InputInstance | null>>({})
const replyInputRefs = ref<Record<string, InputInstance | null>>({})
const commentEmojiWrapRefs = ref<Record<string, HTMLDivElement | null>>({})
const replyEmojiWrapRefs = ref<Record<string, HTMLDivElement | null>>({})
const filterChipRefs = ref<Record<string, HTMLButtonElement | null>>({})
const activeEmojiPostId = ref<string | null>(null)
const activeReplyEmojiCommentId = ref<string | null>(null)
let lastWindowScrollTop = 0
const emojiOptions = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '😘',
  '🥳',
  '🤔',
  '😎',
  '😭',
  '😡',
  '👍',
  '👏',
  '🙏',
  '🎉',
  '❤️',
  '🔥',
]

const mapLabelByValue = (source?: Record<string, any>) =>
  new Map(
    Object.entries(source || {}).map(([key, value]) => [Number(key), String(value ?? '').trim()]),
  )

const moodMap = computed(() => mapLabelByValue(postsPublicData.value.mood))
const postTypeMap = computed(() => mapLabelByValue(postsPublicData.value.postType))

const normalizeImage = (value?: string) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const baseUrl = String(siteInfo.imageUrl || '').trim()
  if (!baseUrl) return value

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = value.startsWith('/') ? value : `/${value}`
  return `${normalizedBase}${normalizedPath}`
}

const formatDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCommentDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getUserAvatar = (user?: API.UserVo) => {
  if (user?.userAvatar) return `${siteInfo.imageUrl || ''}${user.userAvatar}`

  return ''
}

const resolvePostCommentUser = (comment: API.PostCommentVo) => {
  if (comment.user) return comment.user

  if (
    loginUserStore.loginUser.id != null &&
    comment.userId != null &&
    String(comment.userId) === String(loginUserStore.loginUser.id)
  ) {
    return loginUserStore.loginUser
  }

  return undefined
}

const formatMonth = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString('en-US', { month: 'short' })
}

const mapLifePost = (post: API.UserPostsVo): LifePost => ({
  id: String(post.id || ''),
  date: formatDate(post.createdAt),
  day: post.createdAt ? new Date(post.createdAt).toLocaleString('zh-CN', { day: '2-digit' }) : '--',
  month: formatMonth(post.createdAt),
  content: String(post.content || '').trim(),
  tags: post.tags || [],
  images: (post.imageList || []).map((image) => normalizeImage(image)).filter(Boolean),
  moodLabel: moodMap.value.get(Number(post.mood)) || '',
  postTypeLabel: postTypeMap.value.get(Number(post.postType)) || '',
  isLike: Boolean(post.isLike),
  likeCount: Number(post.likeCount || 0),
  commentCount: Number(post.commentCount || 0),
  isTop: post.isTop === 1,
})

const mapPostComment = (
  comment: API.PostCommentVo,
  commentMap?: Map<string, API.PostCommentVo>,
): PostCommentItem => {
  const replyId = String(comment.replyId || '')
  const replyUser = replyId ? commentMap?.get(replyId)?.user : undefined
  const commentUser = resolvePostCommentUser(comment)

  return {
    id: String(comment.id || ''),
    postId: String(comment.postId || ''),
    replyId,
    content: String(comment.content || '').trim(),
    createdAt: formatCommentDate(comment.createdAt),
    userName: commentUser?.userName || '匿名用户',
    userAvatar: getUserAvatar(commentUser),
    replyUserName: replyUser?.userName || '',
  }
}

const tags = computed(() => {
  const tagSet = new Set<string>(['全部'])
  lifePosts.value.forEach((post) => {
    post.tags.forEach((tag) => {
      if (tag) tagSet.add(tag)
    })
  })
  return Array.from(tagSet)
})

const latestPostDate = computed(() => lifePosts.value[0]?.date || '暂无动态')

const filteredPosts = computed(() => {
  if (activeTag.value === '全部') return lifePosts.value
  return lifePosts.value.filter((post) => post.tags.includes(activeTag.value))
})

// Function refs run during patch; avoid replacing reactive records here or Vue can re-render endlessly.
const updateRefRecord = <T extends object>(source: Record<string, T | null>, key: string, el: T | null) => {
  if (el) {
    if (source[key] !== el) {
      source[key] = el
    }
    return
  }

  if (key in source) {
    delete source[key]
  }
}

const setFilterChipRef = (tag: string, el: HTMLButtonElement | null) => {
  updateRefRecord(filterChipRefs.value, tag, el)
}

const scrollActiveTagIntoView = () => {
  const targetTag = activeTag.value
  const targetElement = filterChipRefs.value[targetTag]

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
    return
  }

  if (targetTag === '全部') {
    filterChipRefs.value['全部']?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }
}

const handleSelectTag = async (tag: string) => {
  const nextTag = String(tag || '').trim()
  if (!nextTag) return

  activeTag.value = nextTag
  await nextTick()
  scrollActiveTagIntoView()
}

const handlePageScroll = async () => {
  if (loading.value || loadingMorePosts.value || !hasMorePosts.value) return

  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
  const fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0

  if (scrollTop <= lastWindowScrollTop) {
    lastWindowScrollTop = scrollTop
    return
  }

  lastWindowScrollTop = scrollTop

  if (scrollTop + viewportHeight >= fullHeight - 220) {
    await fetchLifePosts(true)
  }
}

const setCommentInputRef = (postId: string, el: InputInstance | null) => {
  updateRefRecord(commentInputRefs.value, postId, el)
}

const setReplyInputRef = (commentId: string, el: InputInstance | null) => {
  updateRefRecord(replyInputRefs.value, commentId, el)
}

const setCommentEmojiWrapRef = (postId: string, el: HTMLDivElement | null) => {
  updateRefRecord(commentEmojiWrapRefs.value, postId, el)
}

const setReplyEmojiWrapRef = (commentId: string, el: HTMLDivElement | null) => {
  updateRefRecord(replyEmojiWrapRefs.value, commentId, el)
}

const toggleEmojiPanel = async (postId: string) => {
  activeEmojiPostId.value = activeEmojiPostId.value === postId ? null : postId

  await nextTick()
  commentInputRefs.value[postId]?.focus()
}

const insertEmoji = async (postId: string, emoji: string) => {
  const currentValue = commentDrafts.value[postId] || ''
  const inputInstance = commentInputRefs.value[postId]
  const textarea = inputInstance?.textarea

  if (!textarea) {
    commentDrafts.value = {
      ...commentDrafts.value,
      [postId]: `${currentValue}${emoji}`,
    }
    return
  }

  const selectionStart = textarea.selectionStart ?? currentValue.length
  const selectionEnd = textarea.selectionEnd ?? currentValue.length
  const nextValue = currentValue.slice(0, selectionStart) + emoji + currentValue.slice(selectionEnd)

  commentDrafts.value = {
    ...commentDrafts.value,
    [postId]: nextValue,
  }

  await nextTick()

  const nextCursor = selectionStart + emoji.length
  inputInstance?.focus()
  textarea.setSelectionRange(nextCursor, nextCursor)
}

const toggleReplyEmojiPanel = async (commentId: string) => {
  activeReplyEmojiCommentId.value = activeReplyEmojiCommentId.value === commentId ? null : commentId

  await nextTick()
  replyInputRefs.value[commentId]?.focus()
}

const insertReplyEmoji = async (commentId: string, emoji: string) => {
  const currentValue = replyDraftsByComment.value[commentId] || ''
  const inputInstance = replyInputRefs.value[commentId]
  const textarea = inputInstance?.textarea

  if (!textarea) {
    replyDraftsByComment.value = {
      ...replyDraftsByComment.value,
      [commentId]: `${currentValue}${emoji}`,
    }
    return
  }

  const selectionStart = textarea.selectionStart ?? currentValue.length
  const selectionEnd = textarea.selectionEnd ?? currentValue.length
  const nextValue = currentValue.slice(0, selectionStart) + emoji + currentValue.slice(selectionEnd)

  replyDraftsByComment.value = {
    ...replyDraftsByComment.value,
    [commentId]: nextValue,
  }

  await nextTick()

  const nextCursor = selectionStart + emoji.length
  inputInstance?.focus()
  textarea.setSelectionRange(nextCursor, nextCursor)
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target
  if (!(target instanceof Element)) return

  if (activeEmojiPostId.value) {
    const currentCommentWrap = commentEmojiWrapRefs.value[activeEmojiPostId.value]
    if (!currentCommentWrap?.contains(target)) {
      activeEmojiPostId.value = null
    }
  }

  if (activeReplyEmojiCommentId.value) {
    const currentReplyWrap = replyEmojiWrapRefs.value[activeReplyEmojiCommentId.value]
    if (!currentReplyWrap?.contains(target)) {
      activeReplyEmojiCommentId.value = null
    }
  }
}

const fetchPostsPublicData = async () => {
  const res = await getPostsPublicData({ silentError: true })
  if (res.data.code === 0 && res.data.data) {
    postsPublicData.value = res.data.data
  }
}

const fetchLifePosts = async (append = false, pageSize = lifePostPageSize) => {
  if (append) {
    if (loadingMorePosts.value || !hasMorePosts.value) return
    loadingMorePosts.value = true
  } else {
    loading.value = true
    lifePostPage.value = 1
    hasMorePosts.value = true
  }

  try {
    if (!postsPublicData.value?.mood || !postsPublicData.value?.postType) {
      await fetchPostsPublicData()
    }

    const res = await getFrontPostsList(
      {
        pageRequest: {
          current: lifePostPage.value,
          pageSize,
        },
      },
      {
        silentError: true,
      },
    )

    if (res.data.code === 0) {
      const records = (res.data.data?.records || []).map(mapLifePost)
      const total = Number(res.data.data?.total || 0)

      lifePosts.value = append ? [...lifePosts.value, ...records] : records
      hasMorePosts.value =
        total > 0 ? lifePosts.value.length < total : records.length === pageSize

      if (records.length > 0) {
        lifePostPage.value = append
          ? lifePostPage.value + 1
          : Math.ceil(records.length / lifePostPageSize) + 1
      }

      return
    }

    if (!append) {
      lifePosts.value = []
    }
    hasMorePosts.value = false
  } catch {
    if (!append) {
      lifePosts.value = []
    }
  } finally {
    if (append) {
      loadingMorePosts.value = false
    } else {
      loading.value = false
    }
  }
}

const refreshLifePostsForAuthChange = async () => {
  const loadedCount = Math.max(lifePostPageSize, lifePosts.value.length || 0)
  await fetchLifePosts(false, loadedCount)
}

const handleFrontAuthChanged = async () => {
  await refreshLifePostsForAuthChange()
}

const handleToggleLike = async (postId: string) => {
  if (!loginUserStore.loginUser.id) {
    ElMessage.warning('请先登录后再点赞')
    return
  }

  const targetPost = lifePosts.value.find((item) => item.id === postId)
  if (!targetPost) return

  try {
    const res = await likePost({
      postId: postId as never,
    })

    if (res.data.code !== 0 || !res.data.data) {
      return
    }

    const nextLiked = !targetPost.isLike
    targetPost.isLike = nextLiked
    targetPost.likeCount = Math.max(0, targetPost.likeCount + (nextLiked ? 1 : -1))
  } catch {
    ElMessage.error('点赞失败，请稍后重试')
  }
}

const fetchPostComments = async (postId: string, append = false) => {
  if (commentsLoading.value[postId]) return

  commentsLoading.value = {
    ...commentsLoading.value,
    [postId]: true,
  }

  try {
    const res = await getPostCommentList(
      {
        postCommentQueryRequest: {
          postId: postId as never,
          current: append ? commentsPageByPost.value[postId] || 1 : 1,
          pageSize: 5,
          sortField: 'createdAt',
          sortOrder: 'ascend',
        },
      },
      {
        silentError: true,
      },
    )

    const records = res.data.data?.records || []
    const commentMap: Map<string, API.PostCommentVo> = new Map(
      records.map((item: any) => [String(item.id || ''), item]),
    )
    const mappedRecords = records.map((item: any) => mapPostComment(item, commentMap))

    commentsByPost.value = {
      ...commentsByPost.value,
      [postId]: append
        ? [...(commentsByPost.value[postId] || []), ...mappedRecords]
        : mappedRecords,
    }
    commentsLoaded.value = {
      ...commentsLoaded.value,
      [postId]: true,
    }
    commentsPageByPost.value = {
      ...commentsPageByPost.value,
      [postId]: (append ? commentsPageByPost.value[postId] || 1 : 1) + 1,
    }
    commentsHasMoreByPost.value = {
      ...commentsHasMoreByPost.value,
      [postId]: Number(res.data.data?.total || 0) > (commentsByPost.value[postId]?.length || 0),
    }
  } catch {
    if (!append) {
      commentsByPost.value = {
        ...commentsByPost.value,
        [postId]: [],
      }
    }
    commentsHasMoreByPost.value = {
      ...commentsHasMoreByPost.value,
      [postId]: append ? Boolean(commentsHasMoreByPost.value[postId]) : false,
    }
  } finally {
    commentsLoading.value = {
      ...commentsLoading.value,
      [postId]: false,
    }
  }
}

const handleToggleComments = async (postId: string) => {
  if (commentsLoading.value[postId]) return

  const isVisible = Boolean(commentsVisible.value[postId])

  commentsVisible.value = {
    ...commentsVisible.value,
    [postId]: !isVisible,
  }

  if (!isVisible && !commentsLoaded.value[postId]) {
    await fetchPostComments(postId)
  }
}

const handleLoadMoreComments = async (postId: string) => {
  if (commentsLoading.value[postId] || !commentsHasMoreByPost.value[postId]) return
  await fetchPostComments(postId, true)
}

const handleReplyComment = (postId: string, commentId: string, userName: string) => {
  replyTargetByPost.value = {
    ...replyTargetByPost.value,
    [postId]: {
      id: commentId,
      userName,
    },
  }
}

const clearReplyTarget = (postId: string) => {
  const currentReplyTarget = replyTargetByPost.value[postId]
  if (currentReplyTarget?.id) {
    replyDraftsByComment.value = {
      ...replyDraftsByComment.value,
      [currentReplyTarget.id]: '',
    }
    if (activeReplyEmojiCommentId.value === currentReplyTarget.id) {
      activeReplyEmojiCommentId.value = null
    }
  }

  replyTargetByPost.value = {
    ...replyTargetByPost.value,
    [postId]: null,
  }
}

const handleSubmitPostComment = async (postId: string) => {
  if (!loginUserStore.loginUser.id) {
    ElMessage.warning('请先登录后再评论')
    return
  }

  const content = String(commentDrafts.value[postId] || '').trim()
  if (!content) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    const res = await pushPostComment({
      postId: postId as never,
      replyId: (replyTargetByPost.value[postId]?.id || undefined) as never,
      content,
    })

    if (res.data.code !== 0 || !res.data.data) {
      return
    }

    const existingComments = commentsByPost.value[postId] || []
    const currentReplyTarget = replyTargetByPost.value[postId]
    const nextComments = [
      ...existingComments,
      {
        ...mapPostComment(res.data.data),
        replyUserName: currentReplyTarget?.userName || '',
      },
    ]
    commentsByPost.value = {
      ...commentsByPost.value,
      [postId]: nextComments,
    }
    commentDrafts.value = {
      ...commentDrafts.value,
      [postId]: '',
    }
    clearReplyTarget(postId)
    commentsVisible.value = {
      ...commentsVisible.value,
      [postId]: true,
    }

    const targetPost = lifePosts.value.find((item) => item.id === postId)
    if (targetPost) {
      targetPost.commentCount += 1
    }

    ElMessage.success('评论成功')
  } catch {
    ElMessage.error('评论失败，请稍后重试')
  }
}

const handleSubmitReplyComment = async (postId: string, comment: PostCommentItem) => {
  if (!loginUserStore.loginUser.id) {
    ElMessage.warning('请先登录后再评论')
    return
  }

  const content = String(replyDraftsByComment.value[comment.id] || '').trim()
  if (!content) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  try {
    const res = await pushPostComment({
      postId: postId as never,
      replyId: comment.id as never,
      content,
    })

    if (res.data.code !== 0 || !res.data.data) {
      return
    }

    const existingComments = commentsByPost.value[postId] || []
    const nextComments = [
      ...existingComments,
      {
        ...mapPostComment(res.data.data),
        replyUserName: comment.userName || '',
      },
    ]

    commentsByPost.value = {
      ...commentsByPost.value,
      [postId]: nextComments,
    }
    replyDraftsByComment.value = {
      ...replyDraftsByComment.value,
      [comment.id]: '',
    }
    clearReplyTarget(postId)

    const targetPost = lifePosts.value.find((item) => item.id === postId)
    if (targetPost) {
      targetPost.commentCount += 1
    }

    ElMessage.success('回复成功')
  } catch {
    ElMessage.error('回复失败，请稍后重试')
  }
}

onMounted(async () => {
  lastWindowScrollTop = window.scrollY || document.documentElement.scrollTop || 0
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  window.addEventListener('scroll', handlePageScroll, { passive: true })
  window.addEventListener(FRONT_AUTH_CHANGED_EVENT, handleFrontAuthChanged)
  await fetchLifePosts()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('scroll', handlePageScroll)
  window.removeEventListener(FRONT_AUTH_CHANGED_EVENT, handleFrontAuthChanged)
})

watch(tags, (nextTags) => {
  if (!nextTags.includes(activeTag.value)) {
    activeTag.value = '全部'
  }
})

watch(activeTag, async () => {
  await nextTick()
  scrollActiveTagIntoView()
})
</script>

<style scoped>
.life-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto;
  padding-bottom: 24px;
}

/** 头部卡片 */
.hero-card {
  /* position: relative; */
  overflow: hidden;
  padding: 28px;
  border: 1px solid rgba(142, 170, 208, 0.28);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(115, 164, 255, 0.2), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 250, 255, 0.94));
  box-shadow: 0 22px 48px rgba(22, 55, 108, 0.12);
}
.hero-bg {
  position: absolute;
  max-width: 300px;
  top: -126px;
  z-index: 10;
}
.hero-card::after {
  content: '';
  position: absolute;
  left: 100px;
  top: -80px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: rgba(137, 203, 255, 0.2);
  filter: blur(10px);
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(56, 109, 214, 0.1);
  color: #315fa6;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 14px 0 10px;
  color: #183153;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.15;
}

.hero-copy p {
  max-width: 620px;
  color: #5e7498;
  font-size: 15px;
  line-height: 1.8;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  color: #6f86a7;
  font-size: 13px;
  font-weight: 600;
}

.hero-meta-item {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(157, 180, 212, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
}

.hero-meta-divider {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(111, 134, 167, 0.35);
}

.filter-bar {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(103, 132, 176, 0.35) transparent;
  -webkit-overflow-scrolling: touch;
}

.filter-bar::-webkit-scrollbar {
  height: 6px;
}

.filter-bar::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(103, 132, 176, 0.3);
}

.filter-chip {
  flex: 0 0 auto;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(161, 182, 214, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #496585;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

.filter-chip:hover,
.filter-chip.is-active {
  transform: translateY(-2px);
  border-color: rgba(86, 125, 211, 0.4);
  background: linear-gradient(135deg, rgba(87, 134, 234, 0.12), rgba(100, 198, 255, 0.12));
  box-shadow: 0 10px 20px rgba(38, 85, 148, 0.12);
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-left: 28px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: linear-gradient(180deg, rgba(82, 126, 221, 0.3), rgba(120, 189, 228, 0.14));
}

.post-card {
  position: relative;
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 18px;
  padding: 22px;
  border: 1px solid rgba(154, 176, 205, 0.24);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 16px 36px rgba(22, 58, 109, 0.1);
}

.timeline-dot {
  position: absolute;
  left: -27px;
  top: 30px;
  width: 18px;
  height: 18px;
  border: 4px solid #f7fbff;
  border-radius: 50%;
  background: linear-gradient(135deg, #5f88f1, #69bee9);
  box-shadow: 0 10px 24px rgba(57, 100, 177, 0.24);
}

.post-date {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 4px;
}

.post-day {
  color: #17355d;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.post-month {
  margin-top: 6px;
  color: #7b90ad;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.post-content {
  min-width: 0;
}

.post-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.post-meta {
  color: #7a8fae;
  font-size: 13px;
}

.mood-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(84, 138, 234, 0.1);
  color: #446da8;
  font-size: 12px;
  font-weight: 700;
}

.post-text {
  margin-top: 14px;
  color: #425975;
  font-size: 15px;
  line-height: 1.85;
  white-space: pre-wrap;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
  max-width: min(100%, 520px);
}

.photo-grid-1 {
  grid-template-columns: minmax(0, 1fr);
  max-width: min(100%, 420px);
}

.photo-grid-2,
.photo-grid-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.photo-item {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: #edf3fb;
  aspect-ratio: 1 / 1;
}

.photo-grid-1 .photo-item {
  aspect-ratio: 4 / 3;
}

.photo-item img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-item:hover :deep(img) {
  transform: scale(1.04);
}

.photo-preview {
  display: block;
  width: 100%;
  height: 100%;
}

.photo-preview :deep(.el-image) {
  display: block;
  width: 100%;
  height: 100%;
}

.photo-preview :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.post-footer-no-tags {
  justify-content: flex-end;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-tag {
  border: none;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(70, 117, 205, 0.08);
  color: #436792;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.post-tag:hover {
  transform: translateY(-1px);
  background: rgba(70, 117, 205, 0.14);
  color: #31578b;
}

.post-weather {
  color: #7f94ae;
  font-size: 12px;
  white-space: nowrap;
}

.action-chip {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(173, 189, 214, 0.42);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #59708f;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.action-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(101, 129, 212, 0.42);
}

.action-chip.is-active {
  border-color: rgba(238, 103, 128, 0.36);
  background: rgba(255, 241, 245, 0.96);
  color: #d14d72;
}

.action-chip-comment {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-chip-comment.is-open {
  border-color: rgba(86, 125, 211, 0.42);
  background: rgba(239, 245, 255, 0.96);
  color: #4064f6;
}

.comment-panel {
  display: grid;
  gap: 14px;
  margin-top: 18px;
  padding: 16px 18px;
  border: 1px solid rgba(214, 223, 236, 0.92);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(112, 154, 255, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(249, 251, 255, 0.96), rgba(243, 247, 255, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);
}

.comment-compose {
  padding: 14px;
  border: 1px solid rgba(219, 228, 241, 0.92);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
}

.comment-compose-footer,
.comment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.comment-compose-footer {
  margin-top: 12px;
}

.comment-compose-tools {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
}

.comment-emoji-wrap {
  position: relative;
}

.comment-emoji-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(173, 189, 214, 0.42);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #59708f;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.comment-emoji-trigger:hover,
.comment-emoji-trigger.is-active {
  border-color: rgba(86, 125, 211, 0.42);
  background: rgba(239, 245, 255, 0.96);
  transform: translateY(-1px);
}

.comment-emoji-icon {
  font-size: 18px;
  line-height: 1;
}

.comment-emoji-panel {
  position: absolute;
  left: 0;
  top: calc(100% + 10px);
  z-index: 6;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  width: 252px;
  padding: 12px;
  border: 1px solid rgba(214, 223, 236, 0.96);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 36px rgba(22, 58, 109, 0.14);
  backdrop-filter: blur(10px);
}

.comment-emoji-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: rgba(244, 247, 255, 0.96);
  font-size: 18px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}

.comment-emoji-item:hover {
  background: rgba(231, 239, 255, 0.96);
  transform: translateY(-1px);
}

.comment-tip,
.comment-head span,
.comment-empty {
  color: #7d8ba6;
  font-size: 12px;
}

.comment-compose :deep(.el-textarea__inner) {
  min-height: 90px !important;
  border-radius: 14px;
  box-shadow: none;
  border: 1px solid rgba(209, 220, 238, 0.96);
  background: #fbfcff;
  padding: 12px 14px;
}

.comment-compose :deep(.el-textarea__inner:focus) {
  border-color: rgba(88, 128, 243, 0.58);
}

.reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(178, 194, 226, 0.72);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  color: #5b6e8b;
  font-size: 12px;
}

.reply-cancel,
.comment-reply {
  padding: 0;
  border: none;
  background: transparent;
  color: #4a6cf0;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.comment-list {
  display: grid;
  gap: 10px;
}

.comment-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(226, 233, 244, 0.9);
}

.comment-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.comment-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(135deg, #5f88f1, #69bee9);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.comment-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-body {
  min-width: 0;
  flex: 1;
}

.comment-author,
.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-body strong {
  color: #243654;
  font-size: 13px;
}

.reply-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(82, 112, 255, 0.08);
  color: #5571c8;
  font-size: 11px;
}

.comment-body p {
  margin-top: 4px;
  color: #425975;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  margin-top: 6px;
}

.comment-load-more,
.comment-load-end {
  margin-top: 10px;
}

.comment-load-more {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(173, 189, 214, 0.42);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #4d678f;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.comment-load-more:hover {
  transform: translateY(-1px);
  border-color: rgba(86, 125, 211, 0.42);
  background: rgba(239, 245, 255, 0.96);
}

.comment-load-more:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.comment-load-end {
  color: #8a98b0;
  font-size: 12px;
  text-align: center;
}

.reply-compose {
  display: grid;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(219, 228, 241, 0.92);
  border-radius: 14px;
  background: rgba(248, 251, 255, 0.95);
}

.reply-compose-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.reply-compose-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-compose-btn {
  min-height: 32px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.reply-compose-btn:hover {
  transform: translateY(-1px);
}

.reply-compose-btn-ghost {
  border: 1px solid rgba(173, 189, 214, 0.42);
  background: rgba(255, 255, 255, 0.92);
  color: #59708f;
}

.reply-compose-btn-primary {
  border: 1px solid rgba(82, 112, 255, 0.12);
  background: linear-gradient(135deg, #5f88f1, #69bee9);
  color: #fff;
  box-shadow: 0 10px 18px rgba(82, 112, 255, 0.16);
}

.comment-compose-footer .el-button {
  min-width: 96px;
  border-radius: 12px;
  box-shadow: 0 10px 18px rgba(82, 112, 255, 0.16);
}

.empty-state {
  padding: 40px 16px;
  border: 1px dashed rgba(155, 178, 206, 0.5);
  border-radius: 22px;
  color: #6480a4;
  text-align: center;
  background: rgba(255, 255, 255, 0.76);
}

.timeline-status {
  display: flex;
  justify-content: center;
  margin-top: 2px;
}

.timeline-status-copy {
  color: #7d8ba6;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .post-card {
    grid-template-columns: 1fr;
  }

  .post-date {
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }
}

@media (max-width: 640px) {
  .life-page {
    gap: 16px;
  }

  .hero-card,
  .post-card {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .hero-meta {
    gap: 8px;
  }

  .hero-meta-divider {
    display: none;
  }

  .timeline {
    padding-left: 22px;
  }

  .timeline-dot {
    left: -21px;
  }

  .post-top,
  .post-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .photo-grid {
    gap: 8px;
    max-width: 100%;
  }

  .comment-compose-footer,
  .comment-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-emoji-panel {
    width: min(252px, calc(100vw - 92px));
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
