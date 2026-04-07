<template>
  <section class="comment-section">
    <div class="comment-head">
      <div>
        <div class="hero-kicker">Comments</div>
        <h2 class="comment-title">评论区</h2>
      </div>
      <p class="comment-copy">欢迎留下你的想法、问题或补充观点，和更多读者一起交流。</p>
    </div>

    <div v-if="!isLoggedIn" class="comment-login-tip">
      <div>
        <div class="comment-login-title">登录后才能发表评论</div>
        <div class="comment-login-copy">你仍然可以浏览评论内容，登录后即可参与回复和互动。</div>
      </div>
      <el-button type="primary" @click="isAuthDialogVisible = true">登录 / 注册</el-button>
    </div>

    <div v-loading="loading" class="comment-panel">
      <UComment :config="commentConfig" @submit="handleCommentSubmit" @like="handleCommentLike" />
    </div>

    <AuthDialog v-model:visible="isAuthDialogVisible">
      <template #header>
        <div class="dialog-hero">
          <div class="dialog-kicker">{{ loginOrRegister ? 'Welcome back' : 'Create account' }}</div>
          <div class="model-title">{{ loginOrRegister ? '登录你的账号' : '创建新的账号' }}</div>
          <p class="dialog-subtitle">
            {{
              loginOrRegister
                ? '登录后就可以在文章下发表评论、回复其他读者。'
                : '注册一个账号，马上加入当前文章的讨论。'
            }}
          </p>
        </div>
      </template>

      <template #body>
        <div v-if="loginOrRegister" class="model-body-content">
          <div class="input-group">
            <div class="field-label">用户名</div>
            <el-input v-model="loginForm.username" placeholder="请输入用户名" />
          </div>

          <div class="input-group">
            <div class="field-label">密码</div>
            <el-input
              v-model="loginForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </div>

          <div class="btn-group">
            <el-button type="primary" @click="handleLogin">登录</el-button>
          </div>

          <div class="switch-tip">
            还没有账号？
            <button class="switch-action" type="button" @click="loginOrRegister = false">
              立即注册
            </button>
          </div>
        </div>

        <div v-else class="model-body-content">
          <div class="input-group">
            <div class="field-label">用户名</div>
            <el-input v-model="registerForm.username" placeholder="请输入用户名" />
          </div>

          <div class="input-group">
            <div class="field-label">密码</div>
            <el-input
              v-model="registerForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </div>

          <div class="input-group">
            <div class="field-label">确认密码</div>
            <el-input
              v-model="registerForm.checkPassword"
              type="password"
              show-password
              placeholder="请再次输入密码"
            />
          </div>

          <div class="btn-group">
            <el-button type="primary" @click="handleRegister">注册</el-button>
          </div>

          <div class="switch-tip">
            已有账号？
            <button class="switch-action" type="button" @click="loginOrRegister = true">
              去登录
            </button>
          </div>
        </div>
      </template>
    </AuthDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { UComment, type CommentApi as UiCommentApi, type ConfigApi } from 'undraw-ui'
import defaultAvatar from '@/assets/image/bg.jpg'
import AuthDialog from '@/components/AuthDialog.vue'
import { getArticleComment, likeComment, pushComment } from '@/api/componentController'
import { login, regist } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'
import { useSiteInfoStore } from '@/stores/siteInfo'

const props = defineProps<{
  articleId: string | number
}>()

const loginUserStore = useLoginUserStore()
const siteInfo = useSiteInfoStore().siteInfo
const { loginUser } = storeToRefs(loginUserStore)

const loading = ref(false)
const isAuthDialogVisible = ref(false)
const loginOrRegister = ref(true)

const loginForm = reactive<API.UserLoginRequest>({
  username: '',
  password: '',
})

const registerForm = reactive<API.UserRegisterRequest>({
  username: '',
  password: '',
  checkPassword: '',
})

const isLoggedIn = computed(() => Boolean(loginUser.value.id))

const commentConfig = reactive<ConfigApi>({
  user: {
    id: 'guest',
    username: '游客',
    avatar: defaultAvatar,
    likeIds: [],
  },
  comments: [],
  show: {
    form: false,
    level: false,
    address: false,
    homeLink: false,
  },
  relativeTime: true,
})

const normalizeArticleId = () => String(props.articleId || '').trim()

const getAvatarUrl = (user?: API.UserVo | API.LoginUserVo) => {
  if (user?.userAvatar) return `${siteInfo.imageUrl || ''}${user.userAvatar}`

  return defaultAvatar
}

const resolveCommentUser = (comment: API.CommentVo) => {
  if (comment.user) return comment.user

  if (
    isLoggedIn.value &&
    comment.userId != null &&
    String(comment.userId) === String(loginUser.value.id)
  ) {
    return loginUser.value
  }

  return undefined
}

const syncCurrentUser = () => {
  commentConfig.user = {
    id: loginUser.value.id || 'guest',
    username: loginUser.value.userName || '游客',
    avatar: getAvatarUrl(loginUser.value),
    likeIds: [],
  }

  commentConfig.show = {
    ...commentConfig.show,
    form: isLoggedIn.value,
  }
}

const createUiComment = (comment: API.CommentVo): UiCommentApi => {
  const commentUser = resolveCommentUser(comment)

  return {
    id: String(comment.id || ''),
    parentId: comment.parentId == null ? null : String(comment.parentId),
    uid: String(commentUser?.id || comment.userId || ''),
    content: comment.content || '',
    likes: Number(comment.likeCount || 0),
    createTime: comment.createTime || new Date().toISOString(),
    user: {
      username: commentUser?.userName || '匿名用户',
      avatar: getAvatarUrl(commentUser),
    },
    reply: {
      total: 0,
      list: [],
    },
  }
}

const sortCommentsByCreateTimeDesc = (comments: UiCommentApi[]) => {
  comments.sort((left, right) => {
    const leftTime = new Date(left.createTime).getTime() || 0
    const rightTime = new Date(right.createTime).getTime() || 0
    return rightTime - leftTime
  })

  comments.forEach((comment) => {
    if (comment.reply?.list?.length) {
      sortCommentsByCreateTimeDesc(comment.reply.list)
      comment.reply.total = comment.reply.list.length
    }
  })

  return comments
}

const buildCommentTree = (records: API.CommentVo[]) => {
  const commentMap = new Map<string, UiCommentApi>()
  const roots: UiCommentApi[] = []

  records.forEach((comment) => {
    const uiComment = createUiComment(comment)
    commentMap.set(String(uiComment.id), uiComment)
  })

  commentMap.forEach((comment) => {
    if (!comment.parentId) {
      roots.push(comment)
      return
    }

    const parentComment = commentMap.get(String(comment.parentId))
    if (!parentComment) {
      roots.push(comment)
      return
    }

    if (!parentComment.reply) {
      parentComment.reply = {
        total: 0,
        list: [],
      }
    }

    parentComment.reply.list.push(comment)
    parentComment.reply.total = parentComment.reply.list.length
  })

  return sortCommentsByCreateTimeDesc(roots)
}

const collectLikedCommentIds = (records: API.CommentVo[]) => {
  return records
    .filter((comment) => Boolean(comment.isLike) && comment.id != null)
    .map((comment) => String(comment.id!))
}

const loadComments = async () => {
  const articleId = normalizeArticleId()
  if (!articleId) {
    commentConfig.comments = []
    commentConfig.user.likeIds = []
    return
  }

  loading.value = true

  try {
    const res = await getArticleComment(
      {
        comment: {
          articleId: articleId as never,
          current: 1,
          pageSize: 200,
          sortField: 'createTime',
          sortOrder: 'desc',
        },
      },
      {
        silentError: true,
      },
    )

    if (res.data.code !== 0) {
      commentConfig.comments = []
      commentConfig.user.likeIds = []
      return
    }

    const records = res.data.data?.records || []
    commentConfig.comments = buildCommentTree(records)
    commentConfig.user.likeIds = isLoggedIn.value ? collectLikedCommentIds(records) : []
  } catch {
    commentConfig.comments = []
    commentConfig.user.likeIds = []
  } finally {
    loading.value = false
  }
}

const findCommentById = (id: string | number, list: UiCommentApi[]): UiCommentApi | null => {
  for (const item of list) {
    if (String(item.id) === String(id)) return item

    const replyList = item.reply?.list
    if (replyList?.length) {
      const target = findCommentById(id, replyList)
      if (target) return target
    }
  }

  return null
}

const handleCommentSubmit = async ({
  content,
  parentId,
  finish,
  reply,
}: {
  content: string
  parentId: string | null
  finish: (comment?: UiCommentApi) => void
  reply?: UiCommentApi
}) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再发表评论')
    isAuthDialogVisible.value = true
    return
  }

  const articleId = normalizeArticleId()
  const trimmedContent = content.trim()
  if (!articleId || !trimmedContent) return

  try {
    const res = await pushComment({
      articleId: articleId as never,
      parentId: (parentId || undefined) as never,
      replyUserId: (reply?.uid || undefined) as never,
      content: trimmedContent,
    })

    if (res.data.code !== 0 || !res.data.data) {
      return
    }

    finish(createUiComment(res.data.data))
  } catch {
    ElMessage.error('发布评论失败')
  }
}

const handleCommentLike = async (id: string, finish: () => void) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再点赞评论')
    isAuthDialogVisible.value = true
    return
  }

  const target = findCommentById(id, commentConfig.comments)
  if (!target) return

  try {
    const res = await likeComment({
      articleId: normalizeArticleId() as never,
      commentId: String(id) as never,
    })

    if (res.data.code !== 0 || !res.data.data) {
      return
    }

    finish()
  } catch {
    ElMessage.error('评论点赞操作失败')
  }
}

const resetLoginForm = () => {
  loginForm.username = ''
  loginForm.password = ''
}

const resetRegisterForm = () => {
  registerForm.username = ''
  registerForm.password = ''
  registerForm.checkPassword = ''
}

const validateAccountForm = (username: string, password: string) => {
  if (!username || !password) {
    ElMessage.error('请填写完整的登录信息')
    return false
  }

  const usernameRegex = /^[a-zA-Z0-9]{6,}$/
  if (!usernameRegex.test(username)) {
    ElMessage.error('用户名至少 6 位，且只能包含字母和数字')
    return false
  }

  if (password.length < 6) {
    ElMessage.error('密码至少需要 6 位')
    return false
  }

  return true
}

const handleLogin = async () => {
  if (!validateAccountForm(loginForm.username || '', loginForm.password || '')) {
    return
  }

  const res = await login(loginForm)
  if (res.data.code === 0 && res.data.data) {
    loginUserStore.setLoginUser(res.data.data)
    resetLoginForm()
    isAuthDialogVisible.value = false
    ElMessage.success('登录成功')
  }
}

const handleRegister = async () => {
  if (!validateAccountForm(registerForm.username || '', registerForm.password || '')) {
    return
  }

  if (!registerForm.checkPassword) {
    ElMessage.error('请填写确认密码')
    return
  }

  if (registerForm.password !== registerForm.checkPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  const res = await regist(registerForm)
  if (res.data.code === 0) {
    resetRegisterForm()
    loginOrRegister.value = true
    ElMessage.success('注册成功，请登录后发表评论')
  }
}

watch(
  () => [props.articleId, loginUser.value.id],
  async () => {
    syncCurrentUser()
    await loadComments()
  },
  { immediate: true },
)
</script>

<style scoped>
.comment-section {
  margin-top: 30px;
  padding: 28px 30px;
  border: 1px solid rgba(188, 202, 225, 0.34);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 22px 50px rgba(28, 67, 130, 0.1);
}

.comment-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
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

.comment-title {
  margin-top: 14px;
  color: #1d2b47;
  font-size: 28px;
  font-weight: 800;
}

.comment-copy {
  max-width: 420px;
  color: #6a7b98;
  font-size: 14px;
  line-height: 1.8;
}

.comment-login-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 22px;
  padding: 16px 18px;
  border: 1px solid rgba(203, 215, 233, 0.75);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f6f9ff);
}

.comment-login-title {
  color: #243654;
  font-size: 15px;
  font-weight: 800;
}

.comment-login-copy {
  margin-top: 6px;
  color: #6a7b98;
  font-size: 13px;
  line-height: 1.7;
}

.comment-panel {
  margin-top: 22px;
  padding: 18px;
  border: 1px solid rgba(203, 215, 233, 0.75);
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff, #f7faff);
}

.dialog-hero {
  padding-right: 44px;
}

.dialog-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(104, 125, 255, 0.1);
  color: #5d6ef8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.model-title {
  margin-top: 14px;
  color: #18243d;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.dialog-subtitle {
  margin-top: 10px;
  max-width: 320px;
  color: #66738f;
  font-size: 14px;
  line-height: 1.7;
}

.model-body-content {
  position: relative;
}

.input-group {
  margin-bottom: 18px;
}

.field-label {
  margin-bottom: 8px;
  color: #44516d;
  font-size: 13px;
  font-weight: 600;
}

.btn-group {
  margin-top: 10px;
}

.switch-tip {
  margin-top: 18px;
  color: #7b859c;
  font-size: 13px;
  text-align: center;
}

.switch-action {
  margin-left: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: #5d6ef8;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.switch-action:hover {
  color: #4459f2;
}

.el-input {
  height: 48px;
}

.el-button {
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
}

.btn-group .el-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #5d6ef8 0%, #4ba7ff 100%);
  box-shadow: 0 14px 28px rgba(84, 113, 247, 0.28);
}

.btn-group .el-button:hover {
  background: linear-gradient(135deg, #5262ec 0%, #439cf2 100%);
}

.el-input :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d8e0f2 !important;
  border-radius: 14px;
  background: rgba(246, 248, 255, 0.85);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8) !important;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.el-input:hover :deep(.el-input__wrapper) {
  border-color: #b8c5ec !important;
  background: #ffffff;
}

.el-input :deep(.el-input__wrapper.is-focus) {
  border-color: #6b7cff !important;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(107, 124, 255, 0.12) !important;
}

.el-input :deep(.el-input__inner) {
  color: #1f2a44;
  font-size: 14px;
}

.el-input :deep(.el-input__inner::placeholder) {
  color: #9aa6bf;
}

@media (max-width: 960px) {
  .comment-head,
  .comment-login-tip {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .comment-section {
    padding: 22px 20px;
    border-radius: 24px;
  }

  .comment-title,
  .model-title {
    font-size: 24px;
  }

  .comment-panel {
    padding: 14px;
  }

  .dialog-subtitle {
    max-width: none;
  }
}
</style>
