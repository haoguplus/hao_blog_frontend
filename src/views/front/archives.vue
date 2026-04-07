<template>
  <section v-loading="loading" class="archives-page">
    <header class="hero-card">
      <div class="hero-copy">
        <span class="hero-badge">Archives</span>
        <h1>文章归档</h1>
        <p>按时间把文章重新排列，除了看更新时间，也可以点击右侧分类标签进入统一文章列表页继续筛选。</p>
      </div>

      <div class="archive-summary">
        <div class="summary-card">
          <span class="summary-label">归档年份</span>
          <strong>{{ archiveGroups.length }}</strong>
          <span class="summary-tip">个年度节点</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">最近月份</span>
          <strong>{{ archiveGroups[0]?.items[0]?.monthLabel }}</strong>
          <span class="summary-tip">持续更新中</span>
        </div>
      </div>
    </header>

    <div class="archive-timeline">
      <section v-for="group in archiveGroups" :key="group.year" class="year-block">
        <div class="year-label">{{ group.year }}</div>

        <div class="month-list">
          <article v-for="month in group.items" :key="month.monthLabel" class="month-card">
            <div class="month-head">
              <div>
                <span class="month-caption">Month</span>
                <h2>{{ month.monthLabel }}</h2>
              </div>
              <span class="month-count">{{ month.articles.length }} 篇</span>
            </div>

            <div class="archive-list">
              <button
                v-for="article in month.articles"
                :key="article.id"
                type="button"
                class="archive-item"
                @click="openArticle(article.id)"
              >
                <div class="archive-main">
                  <span class="archive-date">{{ article.date }}</span>
                  <span class="archive-title">{{ article.title }}</span>
                </div>
                <span class="archive-tag" @click.stop="openCategory(article.category)">{{ article.category }}</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useSiteInfoStore } from '@/stores/siteInfo'
import { applyPendingScrollRestore } from '@/utils/scrollRestore'
import { fetchAllFrontArticles, type FrontArticle } from '@/utils/frontArticles'

type ArchiveArticle = {
  id: string
  date: string
  title: string
  category: string
}

type ArchiveMonth = {
  monthLabel: string
  articles: ArchiveArticle[]
}

type ArchiveGroup = {
  year: string
  items: ArchiveMonth[]
}

const route = useRoute()
const router = useRouter()
const siteInfo = useSiteInfoStore().siteInfo
const loading = ref(false)
const articles = ref<FrontArticle[]>([])

const archiveGroups = computed<ArchiveGroup[]>(() => {
  const archiveMap = new Map<string, Map<string, ArchiveArticle[]>>()

  for (const article of [...articles.value].sort((a, b) => b.date.localeCompare(a.date))) {
    const [year = '--', month = '--', day = '--'] = article.date.split('-')
    const monthLabel = `${month} 月`

    if (!archiveMap.has(year)) archiveMap.set(year, new Map())
    const monthMap = archiveMap.get(year)!
    if (!monthMap.has(monthLabel)) monthMap.set(monthLabel, [])

    monthMap.get(monthLabel)!.push({
      id: article.id,
      date: `${month}-${day}`,
      title: article.title,
      category: article.category,
    })
  }

  return Array.from(archiveMap.entries()).map(([year, monthMap]) => ({
    year,
    items: Array.from(monthMap.entries()).map(([monthLabel, monthArticles]) => ({
      monthLabel,
      articles: monthArticles,
    })),
  }))
})

const fetchArticles = async () => {
  loading.value = true

  try {
    const result = await fetchAllFrontArticles({
      imageBaseUrl: siteInfo.imageUrl,
    })

    articles.value = result.articles
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取归档失败')
  } finally {
    loading.value = false
    applyPendingScrollRestore(route.fullPath)
  }
}

function openArticle(id: string) {
  router.push(`/article/${id}`)
}

function openCategory(category: string) {
  router.push({
    path: '/articles',
    query: { category },
  })
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.archives-page {
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
  border: 1px solid rgba(147, 173, 207, 0.28);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(93, 169, 212, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 249, 255, 0.95));
  box-shadow: 0 22px 48px rgba(22, 58, 108, 0.12);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(65, 142, 191, 0.12);
  color: #2d6992;
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

.archive-summary {
  display: grid;
  gap: 14px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 120px;
  padding: 18px 20px;
  border: 1px solid rgba(162, 185, 216, 0.28);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.74);
}

.summary-label,
.summary-tip {
  color: #7f92af;
  font-size: 12px;
}

.summary-card strong {
  margin: 8px 0 6px;
  color: #17355a;
  font-size: 28px;
  font-weight: 800;
}

.archive-timeline {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.year-block {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 18px;
}

.year-label {
  position: sticky;
  top: 96px;
  align-self: start;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(83, 126, 217, 0.14), rgba(96, 188, 221, 0.1));
  color: #244972;
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 12px 26px rgba(27, 69, 126, 0.1);
}

.month-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.month-card {
  padding: 22px;
  border: 1px solid rgba(154, 177, 208, 0.24);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 16px 36px rgba(22, 58, 108, 0.1);
}

.month-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.month-caption {
  color: #8094b1;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.month-head h2 {
  margin-top: 8px;
  color: #183255;
  font-size: 24px;
  font-weight: 800;
}

.month-count {
  white-space: nowrap;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(75, 122, 219, 0.1);
  color: #44689e;
  font-size: 12px;
  font-weight: 700;
}

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.archive-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid rgba(170, 189, 215, 0.24);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  color: #27496f;
  cursor: pointer;
  text-align: left;
}

.archive-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.archive-date {
  flex-shrink: 0;
  color: #7f92ae;
  font-size: 12px;
  font-weight: 700;
}

.archive-title {
  color: #24486f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.6;
}

.archive-tag {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(70, 117, 205, 0.08);
  color: #476a95;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .hero-card,
  .year-block {
    grid-template-columns: 1fr;
  }

  .year-label {
    position: static;
    width: fit-content;
  }
}

@media (max-width: 640px) {
  .archives-page {
    gap: 16px;
  }

  .hero-card,
  .month-card {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .archive-item,
  .archive-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
