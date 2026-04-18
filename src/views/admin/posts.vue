<template>
  <section class="post-page">
    <header class="page-hero">
      <div class="hero-top">
        <div class="hero-copy">
          <div class="hero-title-row">
            <div class="hero-kicker">Posts</div>
            <h2>说说管理</h2>
          </div>
          <p>统一查看已发布说说，并在后台快速发布新的生活动态。</p>
        </div>

        <div class="hero-side">
          <div class="hero-stats">
            <div class="stat-pill stat-pill-primary">
              <span class="stat-label">当前页</span>
              <strong class="stat-value">{{ tableData.length }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">总数</span>
              <strong class="stat-value">{{ total }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">置顶</span>
              <strong class="stat-value">{{ topCount }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">公开</span>
              <strong class="stat-value">{{ publicCount }}</strong>
            </div>
          </div>

          <el-button class="create-button" type="primary" size="large" @click="openCreateDialog">
            发布说说
          </el-button>
        </div>
      </div>

      <div class="hero-filter-panel">
        <div class="hero-filter-bar">
          <div class="filter-caption">常用筛选</div>
          <div class="quick-filter-group">
            <button
              v-for="item in quickFilters"
              :key="item.key"
              type="button"
              class="quick-filter-chip"
              :class="{ 'quick-filter-chip-active': quickFilterKey === item.key }"
              @click="applyQuickFilter(item.key)"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </button>
          </div>
        </div>

        <el-form :model="queryForm" label-position="top" class="query-form">
          <div class="query-grid">
            <el-form-item label="说说内容">
              <el-input
                v-model="queryForm.content"
                clearable
                placeholder="按内容搜索说说"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="说说类型">
              <el-select v-model="queryForm.postType" clearable placeholder="全部类型">
                <el-option
                  v-for="item in postTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="心情值">
              <el-select v-model="queryForm.mood" clearable placeholder="全部心情">
                <el-option
                  v-for="item in moodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="可见性">
              <el-select v-model="queryForm.privacy" clearable placeholder="全部可见性">
                <el-option
                  v-for="item in privacyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form>

        <div class="hero-filter-footer">
          <div class="toolbar-actions">
            <el-button type="primary" :loading="loading" @click="handleSearch">查询说说</el-button>
            <el-button @click="handleReset">重置条件</el-button>
            <el-button :loading="loading" @click="fetchPosts">刷新列表</el-button>
          </div>

          <div class="filter-summary">
            <div class="summary-pills">
              <span v-if="!activeFilters.length" class="summary-pill summary-pill-muted">
                当前未启用筛选条件
              </span>

              <button
                v-for="filter in activeFilters"
                :key="filter.key"
                type="button"
                class="summary-pill"
                @click="clearFilter(filter.key)"
              >
                <span>{{ filter.label }}</span>
                <strong>{{ filter.value }}</strong>
              </button>
            </div>

            <div class="summary-meta">
              当前展示 {{ tableData.length }} 条，共匹配 {{ total }} 条说说
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="table-card">
      <div class="list-head">
        <div>
          <div class="toolbar-kicker">Results</div>
          <h3>说说列表</h3>
          <p>桌面端采用表格展示，保留内容、图片、标签、互动数据等关键信息。</p>
        </div>
        <div class="list-head-badge">第 {{ pagination.current }} 页</div>
      </div>

      <el-empty
        v-if="!loading && !tableData.length"
        class="post-empty"
        description="没有找到符合条件的说说"
      />

      <el-table
        v-else
        v-loading="loading"
        :data="tableData"
        stripe
        class="post-table"
        empty-text="暂无符合条件的说说"
      >
        <el-table-column label="说说内容" min-width="360">
          <template #default="{ row }">
            <div class="post-content-cell">
              <div class="post-content">{{ row.content || '暂无内容' }}</div>
              <div v-if="row.imageList?.length" class="media-row">
                <template v-for="media in row.imageList" :key="media">
                  <el-image
                    v-if="getMediaType(media) === 'image'"
                    :src="normalizeMedia(media)"
                    fit="cover"
                    class="post-media post-image"
                    :preview-src-list="getImagePreviewList(row.imageList)"
                    preview-teleported
                  />
                  <button
                    v-else
                    type="button"
                    class="post-video-card"
                    @click="openPreviewByUrl(media)"
                  >
                    <video
                      :src="normalizeMedia(media)"
                      class="post-video"
                      muted
                      playsinline
                      preload="metadata"
                    />
                    <span class="post-video-badge">视频</span>
                  </button>
                </template>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标签 / 类型" min-width="220">
          <template #default="{ row }">
            <div class="meta-stack">
              <div class="badge-row">
                <el-tag effect="light" round>{{ getPostTypeLabel(row.postType) }}</el-tag>
                <el-tag effect="light" round type="success">{{ getMoodLabel(row.mood) }}</el-tag>
                <el-tag :type="getPrivacyTagType(row.privacy)" effect="light" round>
                  {{ getPrivacyLabel(row.privacy) }}
                </el-tag>
              </div>
              <div class="tag-list">
                <span v-for="tag in row.tags || []" :key="tag" class="meta-tag"> #{{ tag }} </span>
                <span v-if="!(row.tags || []).length" class="meta-empty">暂无标签</span>
              </div>
              <div class="meta-row">
                <span>ID {{ row.id || '-' }}</span>
                <span>作者 {{ row.userId || '-' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="可见性" width="120">
          <template #default="{ row }">
            <el-tag :type="getPrivacyTagType(row.privacy)" effect="light" round>
              {{ getPrivacyLabel(row.privacy) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="互动数据" width="160">
          <template #default="{ row }">
            <div class="metric-list">
              <span>点赞 {{ row.likeCount || 0 }}</span>
              <span>评论 {{ row.commentCount || 0 }}</span>
              <span>{{ row.isTop === 1 ? '已置顶' : '普通' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="160">
          <template #default="{ row }">
            <div class="action-group">
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '发布说说' : '编辑说说'"
      width="min(720px, calc(100vw - 24px))"
      top="4vh"
      class="post-editor-dialog"
      destroy-on-close
    >
      <el-form :model="postForm" label-position="top" class="post-form">
        <el-form-item label="说说内容" required>
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="7"
            maxlength="2000"
            show-word-limit
            placeholder="写点此刻想记录的内容..."
          />
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="说说类型">
            <el-select v-model="postForm.postType" placeholder="请选择类型">
              <el-option
                v-for="item in postTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="心情值">
            <el-select v-model="postForm.mood" placeholder="请选择心情">
              <el-option
                v-for="item in moodOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="可见性">
            <el-select v-model="postForm.privacy" placeholder="请选择可见性">
              <el-option
                v-for="item in privacyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="置顶">
            <el-switch v-model="isTopSwitch" />
          </el-form-item>
        </div>

        <el-form-item label="标签">
          <el-input
            v-model="tagsText"
            placeholder="多个标签用英文逗号分隔，例如：日常, 散步, 记录"
          />
          <div class="field-tip">提交时会自动拆分成标签数组。</div>
        </el-form-item>

        <el-form-item label="媒体上传">
          <el-upload
            action="/api/posts/uploadPicture"
            list-type="picture-card"
            :accept="POST_MEDIA_ACCEPT"
            multiple
            :file-list="uploadFileList"
            :before-upload="beforeMediaUpload"
            :on-change="handleMediaUploadChange"
            :on-success="handleMediaUploadSuccess"
            :on-error="handleMediaUploadError"
            :on-remove="handleMediaRemove"
          >
            <template #file="{ file }">
              <div
                class="upload-media-card"
                :class="{
                  'upload-media-card-pending': getUploadCardStatus(file) === 'pending',
                  'upload-media-card-failed': getUploadCardStatus(file) === 'failed',
                }"
              >
                <template v-if="isUploadedMediaReady(file)">
                  <img
                    v-if="getUploadFileMediaType(file) === 'image'"
                    :src="file.url"
                    class="upload-media-thumb"
                    alt="已上传媒体"
                  />
                  <video
                    v-else
                    :src="file.url"
                    class="upload-media-thumb"
                    muted
                    playsinline
                    preload="metadata"
                  />
                  <div class="upload-media-overlay">
                    <button
                      type="button"
                      class="upload-media-action"
                      @click.stop="handleMediaPreview(file)"
                    >
                      <el-icon><ZoomIn /></el-icon>
                    </button>
                    <button
                      type="button"
                      class="upload-media-action"
                      @click.stop="removeUploadFile(file)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                  </div>
                  <span class="upload-media-badge">
                    {{ getUploadFileMediaType(file) === 'video' ? '视频' : '图片' }}
                  </span>
                </template>
                <span v-else class="upload-media-pending-text">{{ getUploadStatusText(file) }}</span>
              </div>
            </template>
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="field-tip">
            支持 JPG、PNG、WEBP、MP4、WEBM、OGG、MOV；图片单个不超过 2MB，视频单个不超过
            50MB，可混合连续上传。
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitPost">
            {{ dialogMode === 'create' ? '发布说说' : '保存修改' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="previewVisible"
      :title="previewMediaType === 'video' ? '视频预览' : '图片预览'"
      width="min(720px, calc(100vw - 24px))"
      top="4vh"
      class="post-preview-dialog"
    >
      <img
        v-if="previewMediaUrl && previewMediaType === 'image'"
        :src="previewMediaUrl"
        class="preview-image"
        alt="预览图片"
      />
      <video
        v-else-if="previewMediaUrl"
        :src="previewMediaUrl"
        class="preview-video"
        controls
        autoplay
        playsinline
      />
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type UploadFile,
  type UploadFiles,
  type UploadProps,
} from 'element-plus'
import { Delete, Plus, ZoomIn } from '@element-plus/icons-vue'
import { useSiteInfoStore } from '@/stores/siteInfo'
import {
  deletePost,
  getPostsList,
  getPostsPublicData,
  pushPosts,
  updatePost,
} from '@/api/userPostsController'
import {
  POST_IMAGE_MAX_SIZE_MB,
  POST_MEDIA_ACCEPT,
  POST_VIDEO_MAX_SIZE_MB,
  getPostMediaType,
  isPostImageMimeType,
  isPostVideoMimeType,
  normalizePostMediaUrl,
  type PostMediaType,
} from '@/utils/postMedia'

type QuickFilterKey = 'all' | 'top' | 'public' | 'private'
type ActiveFilterKey = 'content' | 'postType' | 'mood' | 'privacy'

const siteInfo = useSiteInfoStore().siteInfo

const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const tableData = ref<API.UserPostsVo[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingPostId = ref<number>()
const postPublicData = ref<API.PostPublicData>({})
const uploadFileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewMediaUrl = ref('')
const previewMediaType = ref<PostMediaType>('image')

type UploadUserFile = UploadFile & {
  responsePath?: string
  mediaType?: PostMediaType
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
})

const queryForm = reactive<API.PostsQueryRequest>({
  content: '',
  postType: undefined,
  mood: undefined,
  privacy: undefined,
})

const postForm = reactive<API.PostPushRequest>({
  content: '',
  postType: 0,
  mood: 0,
  privacy: 0,
  isTop: 0,
  tags: [],
  imageList: [],
})

const tagsText = ref('')
const isTopSwitch = ref(false)

const mapToOptions = (source?: Record<string, any>, emptyLabel?: string) => {
  return Object.entries(source || {})
    .map(([key, label]) => {
      const normalizedLabel = String(label ?? '').trim()
      return {
        value: Number(key),
        label: normalizedLabel || emptyLabel || '',
      }
    })
    .filter((item) => item.label)
    .sort((left, right) => left.value - right.value)
}

const postTypeOptions = computed(() => mapToOptions(postPublicData.value.postType))
const moodOptions = computed(() => mapToOptions(postPublicData.value.mood, '无'))
const privacyOptions = computed(() => mapToOptions(postPublicData.value.privacy))

const topCount = computed(() => tableData.value.filter((item) => item.isTop === 1).length)
const publicPrivacyValue = computed(() => {
  return privacyOptions.value.find((item) => item.label.includes('公开'))?.value
})

const privatePrivacyValue = computed(() => {
  return privacyOptions.value.find((item) => item.label.includes('私密'))?.value
})

const publicCount = computed(
  () => tableData.value.filter((item) => item.privacy === publicPrivacyValue.value).length,
)
const privateCount = computed(
  () => tableData.value.filter((item) => item.privacy === privatePrivacyValue.value).length,
)

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: total.value },
  { key: 'top' as const, label: '置顶', count: topCount.value },
  { key: 'public' as const, label: '公开', count: publicCount.value },
  { key: 'private' as const, label: '私密', count: privateCount.value },
])

const quickFilterKey = computed<QuickFilterKey>(() => {
  if (queryForm.privacy === publicPrivacyValue.value) return 'public'
  if (queryForm.privacy === privatePrivacyValue.value) return 'private'
  return 'all'
})

const activeFilters = computed(() => {
  const filters: Array<{ key: ActiveFilterKey; label: string; value: string }> = []

  if (queryForm.content?.trim()) {
    filters.push({ key: 'content', label: '内容', value: queryForm.content.trim() })
  }
  if (queryForm.postType != null) {
    filters.push({
      key: 'postType',
      label: '类型',
      value: getPostTypeLabel(queryForm.postType),
    })
  }
  if (queryForm.mood != null) {
    filters.push({
      key: 'mood',
      label: '心情',
      value: getMoodLabel(queryForm.mood),
    })
  }
  if (queryForm.privacy != null) {
    filters.push({
      key: 'privacy',
      label: '可见性',
      value: getPrivacyLabel(queryForm.privacy),
    })
  }

  return filters
})

const formatDate = (value?: string) => {
  if (!value) return '未知'
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPostTypeLabel = (value?: number) =>
  postTypeOptions.value.find((item) => item.value === value)?.label || '未设置'

const getMoodLabel = (value?: number) =>
  moodOptions.value.find((item) => item.value === value)?.label || '未设置'

const getPrivacyLabel = (value?: number) =>
  privacyOptions.value.find((item) => item.value === value)?.label || '未设置'

const getPrivacyTagType = (value?: number) => {
  if (value === privatePrivacyValue.value) return 'warning'
  return 'success'
}

const fetchPostsPublicData = async () => {
  try {
    const res = await getPostsPublicData()

    if (res.data.code === 0 && res.data.data) {
      postPublicData.value = res.data.data

      const firstPostType = postTypeOptions.value[0]?.value
      const firstMood = moodOptions.value[0]?.value
      const firstPrivacy = privacyOptions.value[0]?.value

      if (firstPostType != null) postForm.postType = firstPostType
      if (firstMood != null) postForm.mood = firstMood
      if (firstPrivacy != null) postForm.privacy = firstPrivacy
      return
    }

    ElMessage.error(res.data.msg || '获取说说公共数据失败')
  } catch {
    ElMessage.error('获取说说公共数据失败，请稍后重试')
  }
}

const getMediaType = (value?: string, mimeType?: string) => getPostMediaType(value, mimeType)

const normalizeMedia = (value?: string) => normalizePostMediaUrl(value, siteInfo.imageUrl)

const getImagePreviewList = (mediaList?: string[]) =>
  (mediaList || [])
    .filter((media) => getMediaType(media) === 'image')
    .map((media) => normalizeMedia(media))
    .filter(Boolean)

const resolveUploadedMediaPath = (response?: API.BaseResponseBlogimages) => {
  return response?.data?.fileUrl || response?.data?.filePath || response?.data?.thumbPath || ''
}

const syncPostMediaList = () => {
  postForm.imageList = uploadFileList.value
    .map((file) => file.responsePath || file.url || '')
    .filter(Boolean)
}

const buildTrackedUploadFile = (file: UploadFile | UploadUserFile): UploadUserFile => {
  const uploadFile = file as UploadUserFile
  const previousFile = uploadFileList.value.find((item) => item.uid === uploadFile.uid)
  const responsePath = uploadFile.responsePath || previousFile?.responsePath
  const mediaType =
    uploadFile.mediaType ||
    previousFile?.mediaType ||
    getMediaType(responsePath || uploadFile.name, uploadFile.raw?.type)

  return {
    ...uploadFile,
    url: responsePath ? normalizeMedia(responsePath) : undefined,
    status: responsePath ? 'success' : uploadFile.status,
    responsePath,
    mediaType,
  }
}

const syncTrackedUploadFileList = (uploadFiles: UploadFiles | UploadUserFile[]) => {
  uploadFileList.value = uploadFiles.map((file) => buildTrackedUploadFile(file))
}

const getUploadFileMediaType = (file: UploadFile | UploadUserFile) => {
  const uploadFile = file as UploadUserFile
  return (
    uploadFile.mediaType ||
    getMediaType(uploadFile.responsePath || uploadFile.url || uploadFile.name, uploadFile.raw?.type)
  )
}

const isUploadedMediaReady = (file: UploadFile | UploadUserFile) => {
  const uploadFile = file as UploadUserFile
  return Boolean(uploadFile.responsePath || (uploadFile.status === 'success' && uploadFile.url))
}

const getUploadCardStatus = (file: UploadFile | UploadUserFile) => {
  const uploadFile = file as UploadUserFile
  if (isUploadedMediaReady(uploadFile)) return 'ready'
  if (uploadFile.status === 'fail') return 'failed'
  return 'pending'
}

const getUploadStatusText = (file: UploadFile | UploadUserFile) => {
  const uploadFile = file as UploadUserFile
  if (uploadFile.status === 'fail') return '上传失败'

  const percentage =
    typeof uploadFile.percentage === 'number' ? Math.round(uploadFile.percentage) : undefined

  return percentage != null && percentage > 0 ? `上传中 ${percentage}%` : '上传中...'
}

const markUploadFileAsFailed = (targetUid: number, uploadFiles: UploadFiles) => {
  uploadFileList.value = uploadFiles.map((file) => {
    const currentFile = buildTrackedUploadFile(file)
    if (currentFile.uid === targetUid) {
      currentFile.status = 'fail'
      currentFile.url = undefined
      currentFile.responsePath = undefined
    }
    return currentFile
  })
}

const syncUploadFileListFromImageList = (imageList?: string[]) => {
  uploadFileList.value = (imageList || []).map((image, index) => ({
    uid: -(index + 1),
    name: `${getMediaType(image)}-${index + 1}`,
    url: normalizeMedia(image),
    status: 'success',
    responsePath: image,
    mediaType: getMediaType(image),
  }))
}

const beforeMediaUpload: UploadProps['beforeUpload'] = (file) => {
  const isAllowedType = isPostImageMimeType(file.type) || isPostVideoMimeType(file.type)
  if (!isAllowedType) {
    ElMessage.error('仅支持 JPG、PNG、WEBP、MP4、WEBM、OGG、MOV 格式')
    return false
  }

  const mediaType = getMediaType(file.name, file.type)
  const maxSize = mediaType === 'video' ? POST_VIDEO_MAX_SIZE_MB : POST_IMAGE_MAX_SIZE_MB

  if (file.size / 1024 / 1024 > maxSize) {
    ElMessage.error(`${mediaType === 'video' ? '视频' : '图片'}大小不能超过 ${maxSize}MB`)
    return false
  }

  return true
}

const handleMediaUploadChange: UploadProps['onChange'] = (_uploadFile, uploadFiles) => {
  syncTrackedUploadFileList(uploadFiles)
}

const handleMediaUploadSuccess = (
  response: API.BaseResponseBlogimages,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
) => {
  if (response.code !== 0) {
    markUploadFileAsFailed(uploadFile.uid, uploadFiles)
    ElMessage.error(response.msg || '媒体上传失败')
    return
  }

  const uploadedPath = resolveUploadedMediaPath(response)
  if (!uploadedPath) {
    markUploadFileAsFailed(uploadFile.uid, uploadFiles)
    ElMessage.error('媒体上传失败，未返回文件地址')
    return
  }

  const nextUploadFiles = uploadFiles.map((file) => buildTrackedUploadFile(file))

  uploadFileList.value = nextUploadFiles.map((file) => {
    const currentFile = file as UploadUserFile
    if (file.uid === uploadFile.uid) {
      currentFile.url = normalizeMedia(uploadedPath)
      currentFile.status = 'success'
      currentFile.responsePath = uploadedPath
      currentFile.mediaType = getMediaType(
        uploadedPath || response.data?.imageName,
        response.data?.fileType || uploadFile.raw?.type,
      )
    }
    return currentFile
  })

  syncPostMediaList()
}

const handleMediaUploadError: UploadProps['onError'] = (_error, _uploadFile, uploadFiles) => {
  syncTrackedUploadFileList(uploadFiles)
}

const handleMediaRemove: UploadProps['onRemove'] = (_uploadFile, uploadFiles) => {
  syncTrackedUploadFileList(uploadFiles as UploadUserFile[])
  syncPostMediaList()
}

const handleMediaPreview = (file: UploadFile | UploadUserFile) => {
  const uploadFile = file as UploadUserFile
  previewMediaUrl.value = uploadFile.url || normalizeMedia(uploadFile.responsePath)
  previewMediaType.value = getUploadFileMediaType(uploadFile)
  previewVisible.value = true
}

const openPreviewByUrl = (value?: string) => {
  previewMediaUrl.value = normalizeMedia(value)
  previewMediaType.value = getMediaType(value)
  previewVisible.value = true
}

const removeUploadFile = (file: UploadFile | UploadUserFile) => {
  uploadFileList.value = uploadFileList.value.filter((item) => item.uid !== file.uid)
  syncPostMediaList()
}

const fetchPosts = async () => {
  loading.value = true

  try {
    const res = await getPostsList({
      current: pagination.current,
      pageSize: pagination.pageSize,
      content: queryForm.content?.trim() || undefined,
      postType: queryForm.postType,
      mood: queryForm.mood,
      privacy: queryForm.privacy,
      sortField: 'id',
      sortOrder: 'descend',
    })

    if (res.data.code === 0) {
      tableData.value = res.data.data?.records || []
      total.value = Number(res.data.data?.total || 0)
      return
    }

    ElMessage.error(res.data.msg || '获取说说列表失败')
  } catch {
    ElMessage.error('获取说说列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  pagination.current = 1
  await fetchPosts()
}

const handleReset = async () => {
  queryForm.content = ''
  queryForm.postType = undefined
  queryForm.mood = undefined
  queryForm.privacy = undefined
  pagination.current = 1
  await fetchPosts()
}

const handleCurrentChange = async (page: number) => {
  pagination.current = page
  await fetchPosts()
}

const applyQuickFilter = async (filter: QuickFilterKey) => {
  queryForm.privacy = undefined

  if (filter === 'public') queryForm.privacy = publicPrivacyValue.value
  if (filter === 'private') queryForm.privacy = privatePrivacyValue.value

  pagination.current = 1
  await fetchPosts()
}

const clearFilter = async (key: ActiveFilterKey) => {
  if (key === 'content') queryForm.content = ''
  if (key === 'postType') queryForm.postType = undefined
  if (key === 'mood') queryForm.mood = undefined
  if (key === 'privacy') queryForm.privacy = undefined

  pagination.current = 1
  await fetchPosts()
}

const resetCreateForm = () => {
  editingPostId.value = undefined
  postForm.content = ''
  postForm.postType = postTypeOptions.value[0]?.value
  postForm.mood = moodOptions.value[0]?.value
  postForm.privacy = privacyOptions.value[0]?.value
  postForm.isTop = 0
  postForm.tags = []
  postForm.imageList = []
  tagsText.value = ''
  isTopSwitch.value = false
  uploadFileList.value = []
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  resetCreateForm()
  dialogVisible.value = true
}

const openEditDialog = (post: API.UserPostsVo) => {
  dialogMode.value = 'edit'
  editingPostId.value = post.id
  postForm.content = String(post.content || '')
  postForm.postType = post.postType
  postForm.mood = post.mood
  postForm.privacy = post.privacy
  postForm.isTop = post.isTop
  postForm.tags = [...(post.tags || [])]
  postForm.imageList = [...(post.imageList || [])]
  tagsText.value = (post.tags || []).join(', ')
  isTopSwitch.value = post.isTop === 1
  syncUploadFileListFromImageList(post.imageList)
  dialogVisible.value = true
}

const handleDelete = async (post: API.UserPostsVo) => {
  if (!post.id) {
    ElMessage.error('缺少说说 ID，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这条说说吗？删除后无法恢复。', '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await deletePost({
      id: post.id,
    })

    if (res.data.code !== 0 || !res.data.data) {
      ElMessage.error(res.data.msg || '说说删除失败')
      return
    }

    ElMessage.success('说说删除成功')

    if (tableData.value.length === 1 && pagination.current > 1) {
      pagination.current -= 1
    }

    await fetchPosts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('说说删除失败，请稍后重试')
    }
  }
}

const handleSubmitPost = async () => {
  if (!postForm.content?.trim()) {
    ElMessage.error('请先填写说说内容')
    return
  }

  postForm.tags = tagsText.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  postForm.isTop = isTopSwitch.value ? 1 : 0

  submitting.value = true

  try {
    const submitPayload = {
      ...postForm,
      content: postForm.content.trim(),
    }

    const res =
      dialogMode.value === 'create'
        ? await pushPosts(submitPayload)
        : await updatePost({
            id: editingPostId.value,
            ...submitPayload,
          })

    if (res.data.code === 0) {
      ElMessage.success(dialogMode.value === 'create' ? '说说发布成功' : '说说更新成功')
      dialogVisible.value = false
      pagination.current = 1
      await fetchPosts()
      return
    }

    ElMessage.error(
      res.data.msg || (dialogMode.value === 'create' ? '说说发布失败' : '说说更新失败'),
    )
  } catch {
    ElMessage.error(
      dialogMode.value === 'create' ? '说说发布失败，请稍后重试' : '说说更新失败，请稍后重试',
    )
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await fetchPostsPublicData()
  await fetchPosts()
})
</script>

<style scoped>
.post-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(70, 142, 255, 0.2), transparent 28%),
    radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.12), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(242, 247, 255, 0.92));
  box-shadow: 0 22px 48px rgba(47, 78, 126, 0.11);
}

.hero-top {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr);
  gap: 14px;
}

.hero-kicker,
.toolbar-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(72, 112, 255, 0.1);
  color: #4064f6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-copy h2 {
  margin: 0;
  color: #1d2b47;
  font-size: 28px;
  font-weight: 700;
}

.hero-copy p {
  margin: 8px 0 0;
  max-width: 560px;
  color: #60708f;
  font-size: 14px;
  line-height: 1.6;
}

.hero-side {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f9fbff, #eef4ff);
  border: 1px solid rgba(204, 216, 235, 0.86);
}

.stat-pill-primary {
  background:
    radial-gradient(circle at top right, rgba(109, 147, 255, 0.18), transparent 36%),
    linear-gradient(145deg, #eef4ff, #e2eeff);
}

.stat-label {
  color: #7d8ba6;
  font-size: 12px;
}

.stat-value {
  color: #233553;
  font-size: 18px;
  font-weight: 700;
}

.create-button {
  min-height: 46px;
  padding: 0 20px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(52, 103, 235, 0.18);
}

.hero-filter-panel {
  padding: 16px 18px 8px;
  border: 1px solid rgba(223, 230, 241, 0.9);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.56);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.table-card {
  padding: 22px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 36px rgba(47, 78, 126, 0.08);
}

.hero-filter-bar,
.list-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.filter-caption {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(235, 241, 255, 0.9);
  color: #4a638e;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.quick-filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.quick-filter-chip {
  appearance: none;
  min-width: 86px;
  min-height: 54px;
  padding: 10px 12px;
  border: 1px solid rgba(206, 218, 235, 0.9);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  color: #5d6d89;
  font: inherit;
  cursor: pointer;
}

.quick-filter-chip span,
.quick-filter-chip strong {
  display: block;
}

.quick-filter-chip span {
  font-size: 12px;
}

.quick-filter-chip strong {
  margin-top: 4px;
  color: #223452;
  font-size: 18px;
  font-weight: 700;
}

.quick-filter-chip-active {
  border-color: rgba(72, 112, 255, 0.34);
  background:
    radial-gradient(circle at top right, rgba(109, 147, 255, 0.16), transparent 42%),
    linear-gradient(160deg, #eef4ff, #f8fbff);
  color: #3157d1;
}

.query-form {
  margin-bottom: 4px;
}

.query-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-filter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(223, 230, 241, 0.92);
}

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
}

.summary-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(206, 218, 235, 0.9);
  border-radius: 999px;
  background: #f8fbff;
  color: #50627f;
  font-size: 13px;
}

button.summary-pill {
  appearance: none;
  font: inherit;
  cursor: pointer;
}

.summary-pill strong {
  color: #223452;
  font-weight: 700;
}

.summary-pill-muted {
  border-style: dashed;
  color: #7d8ba5;
}

.summary-meta,
.list-head-badge {
  color: #6f7f9a;
  font-size: 13px;
  white-space: nowrap;
}

.list-head-badge {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f3f7ff;
  color: #3157d1;
  font-weight: 700;
}

.list-head h3 {
  margin: 12px 0 8px;
  color: #223452;
  font-size: 22px;
  font-weight: 700;
}

.list-head p {
  max-width: 720px;
  color: #6b7a95;
  font-size: 14px;
  line-height: 1.75;
}

.post-empty {
  padding: 34px 0 18px;
}

.post-content-cell {
  display: grid;
  gap: 12px;
}

.post-content {
  color: #223452;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

.media-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.post-media,
.post-image {
  width: 74px;
  height: 74px;
  border-radius: 16px;
  overflow: hidden;
}

.post-video-card {
  position: relative;
  width: 74px;
  height: 74px;
  padding: 0;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: #0f172a;
  cursor: pointer;
}

.post-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-video-badge,
.upload-media-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.meta-stack,
.metric-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.badge-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(219, 228, 241, 0.96);
  border-radius: 999px;
  background: #ffffff;
  color: #526884;
  font-size: 12px;
  font-weight: 600;
}

.meta-row,
.metric-list {
  color: #6b7a95;
  font-size: 13px;
}

.meta-empty {
  color: #8a97b1;
  font-size: 13px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.post-form {
  padding-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.post-editor-dialog),
:deep(.post-preview-dialog) {
  max-width: calc(100vw - 24px);
}

:deep(.post-editor-dialog .el-dialog__body) {
  padding-top: 12px;
}

:deep(.post-editor-dialog .el-upload--picture-card),
:deep(.post-editor-dialog .el-upload-list--picture-card .el-upload-list__item) {
  width: 108px;
  height: 108px;
  border-radius: 18px;
}

.upload-media-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.86));
}

.upload-media-card-pending {
  display: grid;
  place-items: center;
}

.upload-media-card-failed {
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, rgba(127, 29, 29, 0.92), rgba(153, 27, 27, 0.82));
}

.upload-media-thumb {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.48);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-media-card:hover .upload-media-overlay {
  opacity: 1;
}

.upload-media-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2937;
  cursor: pointer;
}

.upload-media-pending-text {
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  padding: 0 10px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-tip {
  margin-top: 8px;
  color: #7d8ba6;
  font-size: 12px;
  line-height: 1.6;
}

.preview-image {
  display: block;
  width: 100%;
  border-radius: 16px;
}

.preview-video {
  display: block;
  width: 100%;
  max-height: 70vh;
  border-radius: 16px;
  background: #000;
}

:deep(.post-table .el-table__cell) {
  padding-top: 14px;
  padding-bottom: 14px;
}

@media (max-width: 1100px) {
  .hero-top,
  .hero-filter-bar,
  .list-head {
    grid-template-columns: 1fr;
  }

  .hero-filter-bar,
  .list-head {
    display: grid;
  }

  .query-grid,
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-filter-group {
    justify-content: flex-start;
  }

  .create-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-hero,
  .table-card {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-filter-panel {
    padding: 14px 14px 4px;
    border-radius: 20px;
  }

  .hero-copy h2 {
    font-size: 24px;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .query-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .quick-filter-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-filter-footer,
  .filter-summary,
  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .summary-meta,
  .list-head-badge {
    white-space: normal;
  }

  .pagination-wrap {
    overflow-x: auto;
    justify-content: stretch;
  }

  .post-form {
    padding-top: 0;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .dialog-footer :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  :deep(.post-editor-dialog),
  :deep(.post-preview-dialog) {
    margin: 0 auto;
    max-width: calc(100vw - 16px);
  }

  :deep(.post-editor-dialog .el-dialog__header),
  :deep(.post-preview-dialog .el-dialog__header) {
    padding: 18px 18px 10px;
  }

  :deep(.post-editor-dialog .el-dialog__body),
  :deep(.post-preview-dialog .el-dialog__body) {
    padding: 12px 18px 18px;
  }

  :deep(.post-editor-dialog .el-dialog__footer) {
    padding: 0 18px 18px;
  }

  :deep(.post-editor-dialog .el-upload--picture-card),
  :deep(.post-editor-dialog .el-upload-list--picture-card .el-upload-list__item) {
    width: 88px;
    height: 88px;
    border-radius: 16px;
  }

  .field-tip {
    font-size: 11px;
  }
}
</style>
