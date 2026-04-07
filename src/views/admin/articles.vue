<template>
  <section class="article-page">
    <header class="page-hero">
      <div class="hero-top">
        <div class="hero-copy">
          <div class="hero-title-row">
            <div class="hero-kicker">Article</div>
            <h2>文章管理</h2>
          </div>
          <p>集中筛选、查看和发布文章。</p>
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
              <span class="stat-label">已发布</span>
              <strong class="stat-value">{{ publishedCount }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">草稿</span>
              <strong class="stat-value">{{ draftCount }}</strong>
            </div>
          </div>

          <el-button class="create-button" type="primary" size="large" @click="openCreateDialog">
            新增文章
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
              :aria-pressed="quickFilterKey === item.key"
              @click="applyQuickFilter(item.key)"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </button>
          </div>
        </div>

        <el-form :model="queryForm" label-position="top" class="query-form">
          <div class="query-grid">
            <el-form-item label="文章标题">
              <el-input
                v-model="queryForm.title"
                clearable
                placeholder="按标题搜索文章"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="状态">
              <el-select v-model="queryForm.status" clearable placeholder="全部状态">
                <el-option label="已发布" :value="1" />
                <el-option label="草稿" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item label="分类">
              <el-select v-model="queryForm.categoryId" clearable placeholder="全部分类">
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name || '未命名分类'"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="推荐标记">
              <el-select v-model="featureFilter" clearable placeholder="全部标记">
                <el-option label="置顶文章" value="top" />
                <el-option label="热门文章" value="hot" />
              </el-select>
            </el-form-item>
          </div>
        </el-form>

        <div class="hero-filter-footer">
          <div class="toolbar-actions">
            <el-button type="primary" :loading="loading" @click="handleSearch">查询文章</el-button>
            <el-button @click="handleReset">重置条件</el-button>
            <el-button :loading="loading" @click="fetchArticles">刷新列表</el-button>
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
              当前展示 {{ tableData.length }} 篇，共匹配 {{ total }} 篇文章
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="table-card">
      <div class="list-head">
        <div>
          <div class="toolbar-kicker">Results</div>
          <h3>文章列表</h3>
          <p>桌面端使用表格，移动端自动切换为卡片视图，保证信息层级和操作触达都更清晰。</p>
        </div>
        <div class="list-head-badge">第 {{ pagination.current }} 页</div>
      </div>

      <el-empty
        v-if="!loading && !tableData.length"
        class="article-empty"
        description="没有找到符合条件的文章"
      />

      <template v-else-if="isCompact">
        <div v-loading="loading" class="article-card-list">
          <article v-for="row in tableData" :key="row.id || row.title" class="article-card">
            <div class="article-card-main">
              <div class="article-cover article-cover-large">
                <img
                  v-if="row.coverImage"
                  :src="siteInfo.imageUrl + row.coverImage"
                  :alt="row.title || '文章封面'"
                />
                <div v-else class="cover-placeholder">BLOG</div>
              </div>

              <div class="article-card-body">
                <div class="article-card-top">
                  <div class="article-title">{{ row.title || '未命名文章' }}</div>
                  <el-tag :type="row.status === 1 ? 'success' : 'warning'" effect="light" round>
                    {{ row.status === 1 ? '已发布' : '草稿' }}
                  </el-tag>
                </div>

                <div class="article-summary">{{ row.summary || '暂无文章摘要' }}</div>

                <div class="article-card-meta">
                  <span>{{ formatDate(row.publishTime || row.createTime) }}</span>
                </div>

                <div class="taxonomy-panel taxonomy-panel-inline">
                  <div class="taxonomy-row">
                    <span class="taxonomy-label">分类</span>
                    <div class="taxonomy-content">
                      <span
                        class="category-pill"
                        :class="{ 'category-pill-empty': !getCategoryName(row.categoryId) }"
                      >
                        <span class="category-pill-dot"></span>
                        {{ getCategoryName(row.categoryId) || '未分类' }}
                      </span>
                    </div>
                  </div>

                  <div class="taxonomy-row taxonomy-row-tags">
                    <span class="taxonomy-label">标签</span>
                    <div class="taxonomy-tags">
                      <span
                        v-for="tag in getVisibleTags(row.tags)"
                        :key="tag.id || tag.name"
                        class="taxonomy-tag"
                      >
                        {{ tag.name || '未命名标签' }}
                      </span>
                      <span
                        v-if="getHiddenTagCount(row.tags)"
                        class="taxonomy-tag taxonomy-tag-more"
                      >
                        +{{ getHiddenTagCount(row.tags) }}
                      </span>
                      <span v-if="!hasTags(row.tags)" class="taxonomy-empty">暂无标签</span>
                    </div>
                  </div>
                </div>

                <div class="article-card-footer">
                  <div class="article-card-metrics">
                    <span>浏览 {{ row.viewCount || 0 }}</span>
                    <span>点赞 {{ row.likeCount || 0 }}</span>
                    <span>评论 {{ row.commentCount || 0 }}</span>
                  </div>

                  <div class="flag-list">
                    <el-tag v-if="row.isTop === 1" round effect="plain" type="danger">置顶</el-tag>
                    <el-tag v-if="row.isHot === 1" round effect="plain" type="warning">热门</el-tag>
                    <span v-if="row.isTop !== 1 && row.isHot !== 1" class="meta-empty"
                      >无推荐标记</span
                    >
                  </div>

                  <div class="action-group action-group-card">
                    <el-button size="small" type="primary" plain @click="openEditDialog(row)">
                      编辑
                    </el-button>
                    <el-button size="small" type="danger" plain @click="handleDelete(row)">
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </template>

      <el-table
        v-else
        v-loading="loading"
        :data="tableData"
        stripe
        class="article-table"
        empty-text="暂无符合条件的文章"
      >
        <el-table-column label="文章信息" min-width="320">
          <template #default="{ row }">
            <div class="article-cell">
              <div class="article-cover">
                <img
                  v-if="row.coverImage"
                  :src="siteInfo.imageUrl + row.coverImage"
                  :alt="row.title || '文章封面'"
                />
                <div v-else class="cover-placeholder">BLOG</div>
              </div>

              <div class="article-meta">
                <div class="article-title">{{ row.title || '未命名文章' }}</div>
                <div class="article-summary">{{ row.summary || '暂无文章摘要' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分类 / 标签" min-width="220">
          <template #default="{ row }">
            <div class="meta-stack">
              <div class="taxonomy-panel">
                <div class="taxonomy-row">
                  <span class="taxonomy-label">分类</span>
                  <div class="taxonomy-content">
                    <span
                      class="category-pill"
                      :class="{ 'category-pill-empty': !getCategoryName(row.categoryId) }"
                    >
                      <span class="category-pill-dot"></span>
                      {{ getCategoryName(row.categoryId) || '未分类' }}
                    </span>
                  </div>
                </div>

                <div class="taxonomy-row taxonomy-row-tags">
                  <span class="taxonomy-label">标签</span>
                  <div class="taxonomy-tags">
                    <span
                      v-for="tag in getVisibleTags(row.tags)"
                      :key="tag.id || tag.name"
                      class="taxonomy-tag"
                    >
                      {{ tag.name || '未命名标签' }}
                    </span>
                    <span v-if="getHiddenTagCount(row.tags)" class="taxonomy-tag taxonomy-tag-more">
                      +{{ getHiddenTagCount(row.tags) }}
                    </span>
                    <span v-if="!hasTags(row.tags)" class="taxonomy-empty">暂无标签</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="130">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'" effect="light" round>
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="推荐标记" width="170">
          <template #default="{ row }">
            <div class="flag-list">
              <el-tag v-if="row.isTop === 1" round effect="plain" type="danger">置顶</el-tag>
              <el-tag v-if="row.isHot === 1" round effect="plain" type="warning">热门</el-tag>
              <span v-if="row.isTop !== 1 && row.isHot !== 1" class="meta-empty">无</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="数据表现" width="180">
          <template #default="{ row }">
            <div class="metric-list">
              <span>浏览 {{ row.viewCount || 0 }}</span>
              <span>点赞 {{ row.likeCount || 0 }}</span>
              <span>评论 {{ row.commentCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.publishTime || row.createTime) }}
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
          :layout="isCompact ? 'prev, pager, next, total' : 'prev, pager, next, jumper, ->, total'"
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>

    <ArticleEditorDialog
      v-model="articleDialogVisible"
      :mode="dialogMode"
      :article="currentArticle"
      :category-options="categoryOptions"
      :tag-options="tagOptions"
      :submitting="submitting"
      @submit="handleDialogSubmit"
      @closed="handleDialogClosed"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteArticle,
  editArticle,
  getArticleAdminList,
  getCategoriesAndTages,
  pushArticle,
} from '@/api/articleController'
import ArticleEditorDialog, {
  type ArticleDialogMode,
  type ArticleDialogSubmitPayload,
} from '@/components/admin/ArticleEditorDialog.vue'
import { useSiteInfoStore } from '@/stores/siteInfo'
const siteInfo = useSiteInfoStore().siteInfo

type QuickFilterKey = 'all' | 'published' | 'draft' | 'top' | 'hot'
type ActiveFilterKey = 'title' | 'status' | 'categoryId' | 'feature'

const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const tableData = ref<API.ArticleAdminVo[]>([])
const categoryOptions = ref<API.CategoriesVo[]>([])
const tagOptions = ref<API.TagsVo[]>([])
const articleDialogVisible = ref(false)
const dialogMode = ref<ArticleDialogMode>('create')
const currentArticle = ref<API.ArticleAdminVo | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
})

const queryForm = reactive<API.ArticleQueryRequest>({
  title: '',
  status: undefined,
  categoryId: undefined,
  isTop: undefined,
  isHot: undefined,
})

const publishedCount = computed(() => tableData.value.filter((item) => item.status === 1).length)
const draftCount = computed(() => tableData.value.filter((item) => item.status === 0).length)
const topCount = computed(() => tableData.value.filter((item) => item.isTop === 1).length)
const hotCount = computed(() => tableData.value.filter((item) => item.isHot === 1).length)
const viewportWidth = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)

const isCompact = computed(() => viewportWidth.value <= 900)

const featureFilter = computed({
  get: () => {
    if (queryForm.isTop === 1) return 'top'
    if (queryForm.isHot === 1) return 'hot'
    return undefined
  },
  set: (value?: string) => {
    queryForm.isTop = value === 'top' ? 1 : undefined
    queryForm.isHot = value === 'hot' ? 1 : undefined
  },
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: tableData.value.length },
  { key: 'published' as const, label: '已发布', count: publishedCount.value },
  { key: 'draft' as const, label: '草稿', count: draftCount.value },
  { key: 'top' as const, label: '置顶', count: topCount.value },
  { key: 'hot' as const, label: '热门', count: hotCount.value },
])

const quickFilterKey = computed<QuickFilterKey>(() => {
  if (queryForm.isTop === 1) return 'top'
  if (queryForm.isHot === 1) return 'hot'
  if (queryForm.status === 1) return 'published'
  if (queryForm.status === 0) return 'draft'
  return 'all'
})

const activeFilters = computed(() => {
  const filters: Array<{ key: ActiveFilterKey; label: string; value: string }> = []

  if (queryForm.title?.trim()) {
    filters.push({
      key: 'title',
      label: '标题',
      value: queryForm.title.trim(),
    })
  }

  if (queryForm.status === 1 || queryForm.status === 0) {
    filters.push({
      key: 'status',
      label: '状态',
      value: queryForm.status === 1 ? '已发布' : '草稿',
    })
  }

  if (queryForm.categoryId) {
    filters.push({
      key: 'categoryId',
      label: '分类',
      value: getCategoryName(queryForm.categoryId) || '未命名分类',
    })
  }

  if (featureFilter.value) {
    filters.push({
      key: 'feature',
      label: '标记',
      value: featureFilter.value === 'top' ? '置顶文章' : '热门文章',
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

const getCategoryName = (categoryId?: string | number) => {
  return categoryOptions.value.find((item) => item.id == categoryId)?.name || ''
}

const getTagList = (tags?: API.TagsVo[]) => {
  return (tags || []).filter((tag) => Boolean(tag?.id || tag?.name))
}

const getVisibleTags = (tags?: API.TagsVo[], max = 3) => {
  return getTagList(tags).slice(0, max)
}

const getHiddenTagCount = (tags?: API.TagsVo[], max = 3) => {
  return Math.max(getTagList(tags).length - max, 0)
}

const hasTags = (tags?: API.TagsVo[]) => {
  return getTagList(tags).length > 0
}

const updateViewportWidth = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

const fetchCategoriesAndTags = async () => {
  try {
    const res = await getCategoriesAndTages()

    if (res.data.code === 0 && res.data.data) {
      categoryOptions.value = res.data.data.categories || []
      tagOptions.value = res.data.data.tags || []
      return
    }

    ElMessage.error(res.data.msg || '获取分类和标签失败')
  } catch {
    ElMessage.error('获取分类和标签失败，请稍后重试')
  }
}

const fetchArticles = async () => {
  loading.value = true

  try {
    const res = await getArticleAdminList({
      current: pagination.current,
      pageSize: pagination.pageSize,
      title: queryForm.title || undefined,
      status: queryForm.status,
      categoryId: queryForm.categoryId,
      isTop: queryForm.isTop,
      isHot: queryForm.isHot,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0) {
      tableData.value = res.data.data?.records || []
      total.value = Number(res.data.data?.total || 0)
      return
    }

    ElMessage.error(res.data.msg || '获取文章列表失败')
  } catch {
    ElMessage.error('获取文章列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  pagination.current = 1
  await fetchArticles()
}

const handleReset = async () => {
  queryForm.title = ''
  queryForm.status = undefined
  queryForm.categoryId = undefined
  queryForm.isTop = undefined
  queryForm.isHot = undefined
  pagination.current = 1
  await fetchArticles()
}

const handleCurrentChange = async (page: number) => {
  pagination.current = page
  await fetchArticles()
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  currentArticle.value = null
  articleDialogVisible.value = true
}

const openEditDialog = (article: API.ArticleAdminVo) => {
  dialogMode.value = 'edit'
  currentArticle.value = article
  articleDialogVisible.value = true
}

const applyQuickFilter = async (filter: QuickFilterKey) => {
  queryForm.status = undefined
  queryForm.isTop = undefined
  queryForm.isHot = undefined

  if (filter === 'published') queryForm.status = 1
  if (filter === 'draft') queryForm.status = 0
  if (filter === 'top') queryForm.isTop = 1
  if (filter === 'hot') queryForm.isHot = 1

  pagination.current = 1
  await fetchArticles()
}

const clearFilter = async (key: ActiveFilterKey) => {
  if (key === 'title') queryForm.title = ''
  if (key === 'status') queryForm.status = undefined
  if (key === 'categoryId') queryForm.categoryId = undefined
  if (key === 'feature') {
    queryForm.isTop = undefined
    queryForm.isHot = undefined
  }

  pagination.current = 1
  await fetchArticles()
}

const handleDialogClosed = () => {
  currentArticle.value = null
}

const handleDialogSubmit = async (payload: ArticleDialogSubmitPayload, mode: ArticleDialogMode) => {
  if (mode === 'edit') {
    if (!payload.id) {
      ElMessage.error('缺少文章 ID，无法更新')
      return
    }

    submitting.value = true

    try {
      const res = await editArticle(payload)

      if (res.data.code === 0) {
        ElMessage.success('文章更新成功')
        articleDialogVisible.value = false
        await fetchArticles()
        return
      }

      ElMessage.error(res.data.msg || '文章更新失败')
    } catch {
      ElMessage.error('文章更新失败，请稍后重试')
    } finally {
      submitting.value = false
    }

    return
  }
  // if (mode === 'edit') {
  //   ElMessage.warning('当前项目未提供文章更新接口，编辑弹窗结构已完成，联调后即可接入保存逻辑')
  //   return
  // }

  submitting.value = true

  try {
    const res = await pushArticle(payload)

    if (res.data.code === 0) {
      ElMessage.success('文章发布成功')
      articleDialogVisible.value = false
      pagination.current = 1
      await fetchArticles()
      return
    }

    ElMessage.error(res.data.msg || '文章发布失败')
  } catch {
    ElMessage.error('文章发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (article: API.ArticleAdminVo) => {
  if (!article.id) {
    ElMessage.error('缺少文章 ID，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除文章“${article.title || '未命名文章'}”吗？`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await deleteArticle({
      articleId: article.id,
    })

    if (res.data.code !== 0 || !res.data.data) {
      ElMessage.error(res.data.msg || '文章删除失败')
      return
    }

    ElMessage.success('文章删除成功')

    if (tableData.value.length === 1 && pagination.current > 1) {
      pagination.current -= 1
    }

    await fetchArticles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作未完成，请稍后重试')
    }
  }

  return

  try {
    await ElMessageBox.confirm(`确定要删除文章“${article.title || '未命名文章'}”吗？`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    ElMessage.warning('当前项目未提供文章删除接口，删除按钮结构已预留，联调后即可接入删除逻辑')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作未完成，请稍后重试')
    }
  }
}

onMounted(async () => {
  updateViewportWidth()
  window.addEventListener('resize', updateViewportWidth)
  await fetchCategoriesAndTags()
  await fetchArticles()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportWidth)
})
</script>

<style scoped>
.article-page {
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

.hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
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
  line-height: 1.2;
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
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

.quick-filter-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(45, 84, 148, 0.08);
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

.query-grid {
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

.article-empty {
  padding: 34px 0 18px;
}

.article-cell {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.article-cover {
  width: 74px;
  height: 74px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(145deg, #edf4ff, #dfeaff);
  border: 1px solid rgba(200, 214, 236, 0.86);
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #4c74ff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.article-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.article-title {
  color: #223452;
  font-size: 15px;
  font-weight: 700;
}

.article-summary {
  color: #6b7a95;
  font-size: 13px;
  line-height: 1.7;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-card-list {
  display: grid;
  gap: 16px;
}

.article-card {
  padding: 18px;
  border: 1px solid rgba(208, 216, 229, 0.76);
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f9fbff);
  box-shadow: 0 12px 24px rgba(47, 78, 126, 0.07);
}

.article-card-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.article-cover-large {
  width: 104px;
  height: 104px;
  border-radius: 20px;
}

.article-card-body {
  display: grid;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.article-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.article-card-meta,
.article-card-metrics {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #6b7a95;
  font-size: 13px;
}

.article-card-footer {
  display: grid;
  gap: 12px;
}

.taxonomy-panel {
  display: grid;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(214, 223, 236, 0.9);
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff, #f8fbff);
}

.taxonomy-panel-inline {
  padding: 10px 12px;
}

.taxonomy-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.taxonomy-label {
  padding-top: 5px;
  color: #8795ad;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.taxonomy-content {
  min-width: 0;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(157, 186, 239, 0.72);
  border-radius: 999px;
  background: linear-gradient(180deg, #eef4ff, #f8fbff);
  color: #2b4ca0;
  font-size: 13px;
  font-weight: 700;
}

.category-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
  background: #4f7cff;
  box-shadow: 0 0 0 4px rgba(79, 124, 255, 0.16);
}

.category-pill-empty {
  border-style: dashed;
  border-color: rgba(201, 210, 224, 0.92);
  background: #f7f9fc;
  color: #7e8aa1;
}

.category-pill-empty .category-pill-dot {
  background: #b6c2d5;
  box-shadow: none;
}

.taxonomy-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.taxonomy-tag {
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
  box-shadow: 0 8px 16px rgba(52, 79, 121, 0.05);
}

.taxonomy-tag-more {
  border-color: rgba(163, 190, 255, 0.76);
  background: #edf4ff;
  color: #3157d1;
}

.taxonomy-empty {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  color: #8a97b1;
  font-size: 13px;
}

.meta-stack,
.metric-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-list,
.flag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-empty {
  color: #8a97b1;
  font-size: 13px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-group-card {
  gap: 10px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

:deep(.article-table .el-table__cell) {
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

  .query-grid {
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

  .list-head h3 {
    font-size: 20px;
  }

  .query-grid {
    grid-template-columns: 1fr;
  }

  .quick-filter-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-filter-chip {
    min-width: 0;
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

  .article-card {
    padding: 16px;
    border-radius: 20px;
  }

  .article-card-main {
    flex-direction: column;
  }

  .article-cover-large {
    width: 100%;
    height: 180px;
  }

  .article-card-top {
    flex-direction: column;
  }

  .taxonomy-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .taxonomy-label {
    padding-top: 0;
  }

  .action-group-card {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pagination-wrap {
    justify-content: stretch;
  }

  .pagination-wrap {
    overflow-x: auto;
  }
}
</style>
