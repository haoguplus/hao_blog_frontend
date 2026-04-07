<template>
  <section class="comment-page">
    <header class="page-hero">
      <div class="hero-top">
        <div class="hero-copy">
          <div class="hero-title-row">
            <div class="hero-kicker">Comment</div>
            <h2>评论管理</h2>
          </div>
          <p>集中筛选、查看和审核站点评论，快速处理异常内容。</p>
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
              <span class="stat-label">已通过</span>
              <strong class="stat-value">{{ approvedCount }}</strong>
            </div>
            <div class="stat-pill">
              <span class="stat-label">未通过</span>
              <strong class="stat-value">{{ rejectedCount }}</strong>
            </div>
          </div>
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
            <el-form-item label="评论内容">
              <el-input
                v-model="queryForm.content"
                clearable
                placeholder="按评论内容搜索"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="文章 ID">
              <el-input v-model="articleIdText" clearable placeholder="输入文章 ID" />
            </el-form-item>

            <el-form-item label="评论用户 ID">
              <el-input v-model="userIdText" clearable placeholder="输入评论用户 ID" />
            </el-form-item>

            <el-form-item label="审核状态">
              <el-select v-model="queryForm.status" clearable placeholder="全部状态">
                <el-option label="审核通过" :value="0" />
                <el-option label="审核失败" :value="1" />
              </el-select>
            </el-form-item>
          </div>
        </el-form>

        <div class="hero-filter-footer">
          <div class="toolbar-actions">
            <el-button type="primary" :loading="loading" @click="handleSearch">查询评论</el-button>
            <el-button @click="handleReset">重置条件</el-button>
            <el-button :loading="loading" @click="fetchComments">刷新列表</el-button>
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
              当前展示 {{ tableData.length }} 条，共匹配 {{ total }} 条评论
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="table-card">
      <div class="list-head">
        <div>
          <div class="toolbar-kicker">Results</div>
          <h3>评论列表</h3>
          <p>支持按文章、用户、审核状态筛选，并在右侧快速完成审核与删除操作。</p>
        </div>
        <div class="list-head-badge">第 {{ pagination.current }} 页</div>
      </div>

      <el-empty
        v-if="!loading && !tableData.length"
        class="comment-empty"
        description="没有找到符合条件的评论"
      />

      <el-table
        v-else
        v-loading="loading"
        :data="tableData"
        stripe
        class="comment-table"
        empty-text="暂无符合条件的评论"
      >
        <el-table-column label="评论内容" min-width="380">
          <template #default="{ row }">
            <div class="comment-content-cell">
              <div class="comment-content">{{ row.content || '暂无评论内容' }}</div>
              <div class="comment-meta-line">
                <span>评论 ID {{ row.id || '-' }}</span>
                <span>文章 ID {{ row.articleId || '-' }}</span>
                <span>{{ row.parentId ? `回复评论 ${row.parentId}` : '顶级评论' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="评论用户" min-width="180">
          <template #default="{ row }">
            <div class="user-stack">
              <div class="user-name">{{ row.user?.userName || '未知用户' }}</div>
              <div class="user-id">用户 ID {{ row.user?.id || '-' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="回复对象" min-width="180">
          <template #default="{ row }">
            <div class="user-stack">
              <div class="user-name">{{ row.replyUser?.userName || '文章评论' }}</div>
              <div class="user-id">
                {{ row.replyUser?.id ? `用户 ID ${row.replyUser.id}` : '无回复对象' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="140">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" effect="light" round>
              {{ row.status === 0 ? '审核通过' : '审核失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <div class="action-group">
              <el-button
                link
                :type="row.status === 0 ? 'warning' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 0 ? '审核失败' : '审核通过' }}
              </el-button>
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
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteComment, getALlComment, updateComment } from '@/api/componentController'

type QuickFilterKey = 'all' | 'approved' | 'rejected' | 'topLevel' | 'reply'
type ActiveFilterKey = 'content' | 'articleId' | 'userId' | 'status'

const loading = ref(false)
const total = ref(0)
const tableData = ref<API.CommentAdminVo[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
})

const queryForm = reactive<API.CommentQueryRequest>({
  content: '',
  articleId: undefined,
  userId: undefined,
  status: undefined,
})

const articleIdText = ref('')
const userIdText = ref('')

const approvedCount = computed(() => tableData.value.filter((item) => item.status === 0).length)
const rejectedCount = computed(() => tableData.value.filter((item) => item.status === 1).length)
const topLevelCount = computed(() => tableData.value.filter((item) => !item.parentId).length)
const replyCount = computed(() => tableData.value.filter((item) => Boolean(item.parentId)).length)

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: total.value },
  { key: 'approved' as const, label: '已通过', count: approvedCount.value },
  { key: 'rejected' as const, label: '未通过', count: rejectedCount.value },
  { key: 'topLevel' as const, label: '顶级评论', count: topLevelCount.value },
  { key: 'reply' as const, label: '回复评论', count: replyCount.value },
])

const quickFilterKey = computed<QuickFilterKey>(() => {
  if (queryForm.status === 0) return 'approved'
  if (queryForm.status === 1) return 'rejected'
  if (queryForm.parentId === 0) return 'topLevel'
  if (queryForm.parentId === -1) return 'reply'
  return 'all'
})

const activeFilters = computed(() => {
  const filters: Array<{ key: ActiveFilterKey; label: string; value: string }> = []

  if (queryForm.content?.trim()) {
    filters.push({
      key: 'content',
      label: '内容',
      value: queryForm.content.trim(),
    })
  }

  if (queryForm.articleId != null) {
    filters.push({
      key: 'articleId',
      label: '文章',
      value: String(queryForm.articleId),
    })
  }

  if (queryForm.userId != null) {
    filters.push({
      key: 'userId',
      label: '用户',
      value: String(queryForm.userId),
    })
  }

  if (queryForm.status === 0 || queryForm.status === 1) {
    filters.push({
      key: 'status',
      label: '状态',
      value: queryForm.status === 0 ? '审核通过' : '审核失败',
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

const parseOptionalNumber = (value: string) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) return undefined
  return trimmedValue as never
}

const fetchComments = async () => {
  loading.value = true

  try {
    const requestParams: API.CommentQueryRequest = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      content: queryForm.content?.trim() || undefined,
      articleId: queryForm.articleId,
      userId: queryForm.userId,
      status: queryForm.status,
      sortField: 'createTime',
      sortOrder: 'descend',
    }

    const res = await getALlComment({
      commentQueryRequest: requestParams,
    })

    if (res.data.code === 0) {
      let records = res.data.data?.records || []

      if (queryForm.parentId === 0) {
        records = records.filter((item: API.CommentAdminVo) => !item.parentId)
      } else if (queryForm.parentId === -1) {
        records = records.filter((item: API.CommentAdminVo) => Boolean(item.parentId))
      }

      tableData.value = records
      total.value =
        queryForm.parentId === 0 || queryForm.parentId === -1
          ? records.length
          : Number(res.data.data?.total || 0)
      return
    }

    ElMessage.error(res.data.msg || '获取评论列表失败')
  } catch {
    ElMessage.error('获取评论列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const syncQueryIds = () => {
  queryForm.articleId = parseOptionalNumber(articleIdText.value)
  queryForm.userId = parseOptionalNumber(userIdText.value)
}

const handleSearch = async () => {
  syncQueryIds()
  pagination.current = 1
  await fetchComments()
}

const handleReset = async () => {
  queryForm.content = ''
  queryForm.articleId = undefined
  queryForm.userId = undefined
  queryForm.status = undefined
  queryForm.parentId = undefined
  articleIdText.value = ''
  userIdText.value = ''
  pagination.current = 1
  await fetchComments()
}

const handleCurrentChange = async (page: number) => {
  pagination.current = page
  await fetchComments()
}

const applyQuickFilter = async (filter: QuickFilterKey) => {
  queryForm.status = undefined
  queryForm.parentId = undefined

  if (filter === 'approved') queryForm.status = 0
  if (filter === 'rejected') queryForm.status = 1
  if (filter === 'topLevel') queryForm.parentId = 0 as never
  if (filter === 'reply') queryForm.parentId = -1 as never

  pagination.current = 1
  await fetchComments()
}

const clearFilter = async (key: ActiveFilterKey) => {
  if (key === 'content') queryForm.content = ''
  if (key === 'articleId') {
    queryForm.articleId = undefined
    articleIdText.value = ''
  }
  if (key === 'userId') {
    queryForm.userId = undefined
    userIdText.value = ''
  }
  if (key === 'status') queryForm.status = undefined

  pagination.current = 1
  await fetchComments()
}

const handleToggleStatus = async (comment: API.CommentAdminVo) => {
  if (!comment.id) {
    ElMessage.error('缺少评论 ID，无法修改状态')
    return
  }

  const nextStatus = comment.status === 0 ? 1 : 0

  try {
    const res = await updateComment({
      id: comment.id,
      status: nextStatus,
    })

    if (res.data.code !== 0 || !res.data.data) {
      ElMessage.error(res.data.msg || '修改评论状态失败')
      return
    }

    ElMessage.success(nextStatus === 0 ? '评论已审核通过' : '评论已标记为审核失败')
    await fetchComments()
  } catch {
    ElMessage.error('修改评论状态失败，请稍后重试')
  }
}

const handleDelete = async (comment: API.CommentAdminVo) => {
  if (!comment.id) {
    ElMessage.error('缺少评论 ID，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？删除后无法恢复。', '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await deleteComment({
      id: comment.id,
    })

    if (res.data.code !== 0 || !res.data.data) {
      ElMessage.error(res.data.msg || '删除评论失败')
      return
    }

    ElMessage.success('评论删除成功')

    if (tableData.value.length === 1 && pagination.current > 1) {
      pagination.current -= 1
    }

    await fetchComments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除评论失败，请稍后重试')
    }
  }
}

onMounted(async () => {
  await fetchComments()
})
</script>

<style scoped>
.comment-page {
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

.comment-empty {
  padding: 34px 0 18px;
}

.comment-content-cell {
  display: grid;
  gap: 10px;
}

.comment-content {
  color: #223452;
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
}

.comment-meta-line,
.user-id {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #6b7a95;
  font-size: 12px;
}

.user-stack {
  display: grid;
  gap: 6px;
}

.user-name {
  color: #223452;
  font-size: 14px;
  font-weight: 700;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

:deep(.comment-table .el-table__cell) {
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

  .pagination-wrap {
    overflow-x: auto;
    justify-content: stretch;
  }
}
</style>
