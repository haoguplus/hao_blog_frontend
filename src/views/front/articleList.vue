<template>
  <section class="article-list-page">
    <header class="hero-card">
      <div class="hero-copy">
        <span class="hero-badge">Articles</span>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>

      <div class="hero-panel">
        <div class="panel-card">
          <span class="panel-label">搜索结果</span>
          <strong>{{ filteredArticles.length }}</strong>
          <span class="panel-tip">篇匹配文章</span>
        </div>
        <div class="panel-card">
          <span class="panel-label">当前筛选</span>
          <strong>{{ activeLabel }}</strong>
          <span class="panel-tip">可继续组合关键词</span>
        </div>
      </div>
    </header>

    <div class="toolbar">
      <el-input
        v-model="searchInput"
        placeholder="搜索文章标题、描述、标签或分类"
        clearable
        class="toolbar-search"
        @keyup.enter="applySearch"
        @clear="applySearch"
      >
        <template #prefix>
          <span class="search-prefix">#</span>
        </template>
      </el-input>
      <button type="button" class="search-btn" @click="applySearch">搜索</button>
      <button v-if="hasFilters" type="button" class="reset-btn" @click="resetFilters">重置筛选</button>
    </div>

    <div class="category-bar">
      <button
        v-for="category in categoryOptions"
        :key="category"
        type="button"
        class="category-chip"
        :class="{ 'is-active': activeCategory === category }"
        @click="selectCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <div v-loading="loading" class="results">
      <article v-for="article in paginatedArticles" :key="article.id" class="article-card">
        <div v-if="article.img" class="article-cover">
          <img :src="article.img" :alt="article.title" />
        </div>

        <div class="article-content">
          <div class="content-top">
            <div>
              <span class="article-category" @click="selectCategory(article.category)">{{ article.category }}</span>
              <h2>{{ article.title }}</h2>
            </div>
            <span class="article-date">{{ article.date }}</span>
          </div>

          <p class="article-description">{{ article.description }}</p>
          <p class="article-excerpt">{{ article.content }}</p>

          <div class="article-meta">
            <span>阅读 {{ article.readCount }}</span>
            <span>{{ article.tags.length }} 个标签</span>
          </div>

          <div class="tag-list">
            <span v-for="tag in article.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
          </div>

          <div class="action-line">
            <button type="button" class="primary-btn" @click="openArticle(article.id)">阅读全文</button>
            <button type="button" class="ghost-btn" @click="selectCategory(article.category)">查看同分类</button>
          </div>
        </div>
      </article>

      <div v-if="filteredArticles.length === 0" class="empty-state">没有找到匹配的文章，换个关键词或者分类试试看。</div>
    </div>

    <el-pagination
      v-if="filteredArticles.length > pageSize"
      class="pagination"
      background
      layout="prev, pager, next, jumper, ->, total"
      :page-size="pageSize"
      :current-page="currentPage"
      :total="filteredArticles.length"
      @current-change="handlePageChange"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useSiteInfoStore } from '@/stores/siteInfo'
import { applyPendingScrollRestore } from '@/utils/scrollRestore'
import {
  fetchAllFrontArticles,
  fetchAllSearchFrontArticles,
  type FrontArticle,
} from '@/utils/frontArticles'

const route = useRoute()
const router = useRouter()
const siteInfo = useSiteInfoStore().siteInfo
const loading = ref(false)
const articles = ref<FrontArticle[]>([])
const categoryNames = ref<string[]>([])
const currentPage = ref(1)
const pageSize = 6
const searchInput = ref('')

const keyword = computed(() => String(route.query.keyword ?? '').trim())
const activeCategory = computed(() => String(route.query.category ?? '全部'))

watch(
  () => route.query,
  () => {
    searchInput.value = keyword.value
    currentPage.value = 1
  },
  { immediate: true },
)

watch(
  () => keyword.value,
  () => {
    fetchArticles()
  },
  { immediate: true },
)

const categoryOptions = computed(() => ['全部', ...categoryNames.value])

const filteredArticles = computed(() => {
  return articles.value.filter((article) => {
    const matchesCategory = activeCategory.value === '全部' || article.category === activeCategory.value
    return matchesCategory
  })
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize)
})

const hasFilters = computed(() => Boolean(keyword.value || activeCategory.value !== '全部'))

const activeLabel = computed(() => {
  if (keyword.value && activeCategory.value !== '全部') return `${activeCategory.value} + ${keyword.value}`
  return keyword.value || activeCategory.value
})

const pageTitle = computed(() => {
  if (keyword.value && activeCategory.value !== '全部') return `${activeCategory.value} / ${keyword.value}`
  if (keyword.value) return `搜索：${keyword.value}`
  if (activeCategory.value !== '全部') return `${activeCategory.value} 相关文章`
  return '文章列表'
})

const pageDescription = computed(() => {
  if (keyword.value) return '这里汇总了与当前关键词相关的文章结果，你可以继续切换分类缩小范围。'
  if (activeCategory.value !== '全部') return '这里展示当前分类下的全部文章，方便继续沿着同一个主题阅读。'
  return '这里汇总了博客中的所有文章，也支持继续按关键词或分类筛选。'
})

async function fetchArticles() {
  loading.value = true

  try {
    const result = keyword.value
      ? await fetchAllSearchFrontArticles({
          query: {
            searchContent: keyword.value,
          },
          imageBaseUrl: siteInfo.imageUrl,
        })
      : await fetchAllFrontArticles({
          imageBaseUrl: siteInfo.imageUrl,
        })

    articles.value = result.articles
    categoryNames.value = result.categories
      .map((category) => String(category.name || '').trim())
      .filter(Boolean)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取文章列表失败')
  } finally {
    loading.value = false
    applyPendingScrollRestore(route.fullPath)
  }
}

function updateQuery(next: { keyword?: string; category?: string }) {
  router.push({
    path: '/articles',
    query: {
      ...(next.keyword ? { keyword: next.keyword } : {}),
      ...(next.category && next.category !== '全部' ? { category: next.category } : {}),
    },
  })
}

function applySearch() {
  updateQuery({
    keyword: searchInput.value.trim(),
    category: activeCategory.value,
  })
}

function selectCategory(category: string) {
  updateQuery({
    keyword: keyword.value,
    category,
  })
}

function resetFilters() {
  searchInput.value = ''
  router.push('/articles')
}

function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openArticle(id: string) {
  router.push(`/article/${id}`)
}

</script>

<style scoped>
.article-list-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(146, 170, 205, 0.28);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(101, 149, 244, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 255, 0.95));
  box-shadow: 0 22px 48px rgba(24, 58, 108, 0.12);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(77, 125, 227, 0.1);
  color: #3963a7;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 14px 0 10px;
  color: #183255;
  font-size: 34px;
  font-weight: 800;
}

.hero-copy p {
  max-width: 640px;
  color: #60769a;
  line-height: 1.8;
}

.hero-panel {
  display: grid;
  gap: 14px;
}

.panel-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 120px;
  padding: 18px 20px;
  border: 1px solid rgba(160, 183, 215, 0.28);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.74);
}

.panel-label,
.panel-tip {
  color: #7f92af;
  font-size: 12px;
}

.panel-card strong {
  margin: 8px 0 6px;
  color: #183458;
  font-size: 28px;
  font-weight: 800;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.toolbar-search {
  flex: 1;
}

.search-prefix {
  color: #6b7cff;
  font-size: 14px;
  font-weight: 700;
}

.toolbar-search :deep(.el-input__wrapper) {
  min-height: 50px;
  border: 1px solid rgba(137, 155, 177, 0.32) !important;
  border-radius: 16px;
  background: rgba(248, 250, 255, 0.95) !important;
  box-shadow:
    0 8px 18px rgba(42, 76, 112, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

.search-btn,
.reset-btn {
  min-width: 110px;
  min-height: 50px;
  padding: 0 18px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}

.search-btn {
  background: linear-gradient(135deg, #4c73df, #54b0e7);
  color: #fff;
  box-shadow: 0 12px 24px rgba(49, 93, 175, 0.18);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #436792;
  border: 1px solid rgba(156, 180, 212, 0.28);
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(161, 182, 214, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #496585;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.category-chip.is-active {
  border-color: rgba(86, 125, 211, 0.4);
  background: linear-gradient(135deg, rgba(87, 134, 234, 0.12), rgba(100, 198, 255, 0.12));
  box-shadow: 0 10px 20px rgba(38, 85, 148, 0.12);
}

.results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  overflow: hidden;
  display: flex;
  min-height: 200px;
  border: 1px solid rgba(154, 176, 205, 0.24);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 16px 36px rgba(22, 58, 109, 0.1);
}

.article-cover {
  width: 260px;
  flex-shrink: 0;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-content {
  flex: 1;
  min-width: 0;
  padding: 20px;
}

.content-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.article-category {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(70, 117, 205, 0.08);
  color: #476a95;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.content-top h2 {
  color: #183255;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.35;
}

.article-date {
  color: #7f94ae;
  font-size: 12px;
  white-space: nowrap;
}

.article-description {
  margin-top: 10px;
  color: #4f678a;
  line-height: 1.8;
}

.article-excerpt {
  margin-top: 10px;
  color: #5f7291;
  line-height: 1.85;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
  color: #8093ae;
  font-size: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-chip {
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(70, 117, 205, 0.08);
  color: #436792;
  font-size: 12px;
  font-weight: 700;
}

.action-line {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.primary-btn,
.ghost-btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.primary-btn {
  background: #1f65d4;
  color: #fff;
}

.ghost-btn {
  background: #f4f7ff;
  color: #2f528e;
}

.empty-state {
  padding: 48px 20px;
  border: 1px dashed rgba(155, 178, 206, 0.5);
  border-radius: 22px;
  color: #6480a4;
  text-align: center;
  background: rgba(255, 255, 255, 0.76);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

@media (max-width: 900px) {
  .hero-card,
  .article-card {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 640px) {
  .article-list-page {
    gap: 16px;
  }

  .hero-card,
  .article-content {
    padding: 18px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .toolbar,
  .content-top,
  .action-line {
    flex-direction: column;
    align-items: stretch;
  }

  .search-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>
