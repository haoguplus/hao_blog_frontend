<template>
  <section class="categories-page">
    <header class="hero-card">
      <div class="hero-glow hero-glow-left"></div>
      <div class="hero-glow hero-glow-right"></div>

      <div class="hero-copy">
        <span class="hero-badge">分类索引</span>
        <h1>文章分类</h1>
        <p>
          这里汇总了站点当前的分类与标签。你可以先用关键词快速筛选，再进入对应主题，
          更轻松地找到同一方向下的文章内容。
        </p>

        <div class="hero-overview">
          <div class="overview-chip">
            <span class="chip-label">分类</span>
            <strong>{{ categories.length }}</strong>
          </div>
          <div class="overview-chip">
            <span class="chip-label">标签</span>
            <strong>{{ tags.length }}</strong>
          </div>
          <div class="overview-chip">
            <span class="chip-label">状态</span>
            <strong>{{ searchKeyword ? '筛选中' : '全部' }}</strong>
          </div>
        </div>

        <div class="hero-actions">
          <el-input
            v-model="searchInput"
            placeholder="搜索分类或标签"
            clearable
            class="hero-search"
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button class="refresh-button" :loading="loading" @click="fetchCategoriesAndTags">
            刷新数据
          </el-button>
        </div>
      </div>

    </header>

    <section class="content-grid">
      <div class="content-main">
        <div class="section-head">
          <div>
            <span class="section-kicker">主题目录</span>
            <h2>分类导航</h2>
          </div>
          <span class="section-tip">点击卡片查看该分类下的文章列表</span>
        </div>

        <div v-if="searchKeyword" class="search-summary">
          <span>当前关键词</span>
          <strong>{{ searchKeyword }}</strong>
          <button type="button" class="summary-action" @click="clearSearch">清空筛选</button>
        </div>

        <el-skeleton :loading="loading" animated :count="4">
          <template #template>
            <div class="skeleton-grid">
              <div v-for="item in 4" :key="item" class="skeleton-card">
                <el-skeleton-item variant="p" style="width: 40%" />
                <el-skeleton-item variant="h3" style="width: 60%; margin-top: 16px" />
                <el-skeleton-item variant="text" style="width: 100%; margin-top: 18px" />
                <el-skeleton-item variant="button" style="width: 110px; margin-top: 20px" />
              </div>
            </div>
          </template>

          <template #default>
            <div v-if="filteredCategories.length" class="category-grid">
              <article
                v-for="category in filteredCategories"
                :key="category.id || category.name"
                class="category-card"
                @click="openCategory(category.name || '')"
              >
                <div class="card-orb"></div>
                <div class="category-top">
                  <span class="category-accent">分类卡片</span>
                  <span class="category-index">#{{ formatIndex(category.id) }}</span>
                </div>

                <h3>{{ category.name || '未命名分类' }}</h3>
                <p>
                  进入这个分类的文章列表，继续浏览同一主题下的内容，快速建立阅读路径。
                </p>

                <div class="category-footer">
                  <span class="category-meta">专题浏览入口</span>
                  <button type="button" class="category-link">查看分类文章</button>
                </div>
              </article>
            </div>

            <div v-else class="empty-state">
              <el-icon class="empty-icon"><FolderOpened /></el-icon>
              <strong>{{ searchKeyword ? '没有找到匹配结果' : '暂时还没有分类数据' }}</strong>
              <p>
                {{
                  searchKeyword
                    ? '换一个关键词试试，或者清空筛选后浏览全部分类与标签。'
                    : '等后端返回分类与标签后，这里会自动展示内容。'
                }}
              </p>
            </div>
          </template>
        </el-skeleton>
      </div>

      <aside class="content-side">
        <div class="side-card">
          <div class="section-head side-head">
            <div>
              <span class="section-kicker">标签聚合</span>
              <h2>标签云</h2>
            </div>
          </div>

          <div v-if="filteredTags.length" class="tag-cloud">
            <button
              v-for="tag in filteredTags"
              :key="tag.id || tag.name"
              type="button"
              class="tag-chip"
              @click="searchByTag(tag.name || '')"
            >
              #{{ tag.name || '未命名标签' }}
            </button>
          </div>

          <div v-else class="side-empty">暂无标签数据</div>
        </div>

        <div class="side-card side-note">
          <span class="section-kicker">浏览说明</span>
          <h2>如何使用</h2>
          <ul class="note-list">
            <li>点击分类卡片会跳转到文章列表页并自动带上分类参数。</li>
            <li>点击标签会按关键词搜索相关文章。</li>
            <li>顶部搜索框会同时筛选分类和标签。</li>
          </ul>
        </div>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { FolderOpened, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getCategoriesAndTages } from '@/api/articleController'

const router = useRouter()

const loading = ref(false)
const searchInput = ref('')
const searchKeyword = ref('')
const categories = ref<API.CategoriesVo[]>([])
const tags = ref<API.TagsVo[]>([])

const filteredCategories = computed(() => {
  if (!searchKeyword.value) return categories.value
  const keyword = searchKeyword.value.toLowerCase()
  return categories.value.filter((item) => (item.name || '').toLowerCase().includes(keyword))
})

const filteredTags = computed(() => {
  if (!searchKeyword.value) return tags.value
  const keyword = searchKeyword.value.toLowerCase()
  return tags.value.filter((item) => (item.name || '').toLowerCase().includes(keyword))
})

const handleSearch = () => {
  searchKeyword.value = searchInput.value.trim()
}

const clearSearch = () => {
  searchInput.value = ''
  searchKeyword.value = ''
}

const fetchCategoriesAndTags = async () => {
  loading.value = true

  try {
    const res = await getCategoriesAndTages()

    if (res.data.code === 0 && res.data.data) {
      categories.value = res.data.data.categories || []
      tags.value = res.data.data.tags || []
      return
    }

    ElMessage.error(res.data.msg || '获取分类和标签失败')
  } catch {
    ElMessage.error('获取分类和标签失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const formatIndex = (id?: number) => {
  if (!id) return '--'
  return String(id).padStart(2, '0')
}

const openCategory = (category: string) => {
  if (!category) return
  router.push({
    path: '/articles',
    query: { category },
  })
}

const searchByTag = (tag: string) => {
  if (!tag) return
  router.push({
    path: '/articles',
    query: { keyword: tag },
  })
}

onMounted(() => {
  fetchCategoriesAndTags()
})
</script>

<style scoped>
.categories-page {
  --text-primary: #173254;
  --text-secondary: #5d7597;
  --text-muted: #8095b2;
  --line-soft: rgba(156, 179, 213, 0.28);
  --accent-start: #4e73df;
  --accent-end: #5dbde8;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1140px;
  margin: 0 auto;
  padding: 4px 0 24px;
}

.hero-card {
  position: relative;
  overflow: hidden;
  display: block;
  padding: 22px 24px;
  border: 1px solid rgba(145, 170, 205, 0.24);
  border-radius: 32px;
  background:
    radial-gradient(circle at left top, rgba(112, 154, 255, 0.18), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(244, 249, 255, 0.95));
  box-shadow: 0 26px 52px rgba(24, 59, 110, 0.12);
}

.hero-glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(10px);
}

.hero-glow-left {
  left: -44px;
  top: -38px;
  width: 180px;
  height: 180px;
  background: rgba(93, 132, 234, 0.14);
}

.hero-glow-right {
  right: -36px;
  bottom: -44px;
  width: 220px;
  height: 220px;
  background: rgba(102, 202, 255, 0.12);
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-badge,
.section-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(82, 127, 227, 0.1);
  color: #3a65aa;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1,
.section-head h2,
.side-card h2 {
  margin: 10px 0 8px;
  color: var(--text-primary);
  font-size: 30px;
  font-weight: 800;
}

.section-head h2,
.side-card h2 {
  margin: 12px 0 0;
  font-size: 24px;
}

.hero-copy p {
  max-width: 640px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.hero-overview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.overview-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.chip-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.overview-chip strong {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.hero-search {
  flex: 1;
}

.hero-search :deep(.el-input__wrapper) {
  min-height: 44px;
  border: 1px solid rgba(153, 176, 210, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow:
    0 8px 18px rgba(34, 71, 126, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.hero-search :deep(.el-input__prefix-inner) {
  color: #5c79a8;
}

.hero-search :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 4px rgba(82, 126, 216, 0.12),
    0 10px 22px rgba(34, 71, 126, 0.08);
}

.refresh-button {
  min-height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  box-shadow: 0 12px 24px rgba(45, 89, 169, 0.16);
}

.side-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 96px;
  padding: 18px 20px;
  border: 1px solid rgba(160, 183, 215, 0.26);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow:
    0 12px 28px rgba(21, 56, 104, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

.panel-label,
.panel-tip {
  color: #7f92af;
  font-size: 12px;
}

.panel-card strong {
  margin: 6px 0 4px;
  color: #183458;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.content-main,
.content-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
}

.section-tip {
  color: #7f92af;
  font-size: 13px;
}

.search-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 4px 0;
  padding: 14px 16px;
  border: 1px solid rgba(164, 185, 217, 0.24);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 249, 255, 0.92));
  color: var(--text-secondary);
  box-shadow: 0 10px 24px rgba(21, 56, 104, 0.05);
}

.search-summary strong {
  color: var(--text-primary);
  font-size: 14px;
}

.summary-action {
  margin-left: auto;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(141, 167, 207, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #4c6ea0;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.category-grid,
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.category-card,
.skeleton-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  border: 1px solid rgba(152, 176, 209, 0.24);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 16px 36px rgba(21, 56, 104, 0.1);
}

.category-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: rgba(87, 132, 228, 0.32);
  box-shadow: 0 24px 44px rgba(21, 56, 104, 0.15);
}

.card-orb {
  position: absolute;
  right: -36px;
  top: -26px;
  width: 124px;
  height: 124px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(101, 164, 255, 0.18), transparent 68%);
  pointer-events: none;
}

.category-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.category-accent,
.category-index {
  color: #7d91b0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.category-card h3 {
  color: #183255;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
}

.category-card p {
  color: #5e7598;
  line-height: 1.8;
}

.category-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.category-meta {
  color: #86a0c1;
  font-size: 12px;
  font-weight: 700;
}

.category-link {
  min-height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4c73df, #54b0e7);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(54, 98, 178, 0.18);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.tag-chip {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(161, 182, 214, 0.28);
  border-radius: 999px;
  background: rgba(244, 248, 255, 0.92);
  color: #496585;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.tag-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(86, 125, 211, 0.4);
  background: linear-gradient(135deg, rgba(87, 134, 234, 0.12), rgba(100, 198, 255, 0.12));
  box-shadow: 0 10px 18px rgba(45, 89, 169, 0.12);
}

.side-note {
  justify-content: flex-start;
}

.note-list {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  color: #60769a;
  line-height: 1.8;
}

.empty-state,
.side-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 42px 20px;
  border: 1px dashed rgba(155, 178, 206, 0.5);
  border-radius: 22px;
  color: #6480a4;
  text-align: center;
  background: rgba(255, 255, 255, 0.76);
}

.empty-icon {
  font-size: 36px;
  color: #79a0d3;
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 18px;
}

.empty-state p {
  max-width: 360px;
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.8;
}

@media (max-width: 960px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .categories-page {
    gap: 16px;
  }

  .hero-card,
  .category-card,
  .skeleton-card,
  .side-card {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .hero-actions,
  .section-head,
  .category-footer,
  .search-summary {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-overview {
    display: grid;
    grid-template-columns: 1fr;
  }

  .category-grid,
  .skeleton-grid {
    grid-template-columns: 1fr;
  }

  .summary-action {
    margin-left: 0;
  }
}
</style>
