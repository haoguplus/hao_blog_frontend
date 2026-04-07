<template>
  <div class="page-wrap">
    <div class="container">
      <template v-if="loading">
        <article v-for="item in pageSize" :key="item" class="article-item article-item-skeleton">
          <div class="article-cover article-cover-skeleton"></div>
          <div class="article-right">
            <el-skeleton animated>
              <template #template>
                <div class="home-skeleton-topline">
                  <div class="home-skeleton-category"></div>
                  <div class="home-skeleton-date"></div>
                </div>
                <div class="home-skeleton-title"></div>
                <div class="home-skeleton-tagline"></div>
                <div class="home-skeleton-content">
                  <div class="home-skeleton-line" v-for="line in 2" :key="line"></div>
                </div>
                <div class="home-skeleton-meta">
                  <div class="home-skeleton-chip" v-for="chip in 3" :key="chip"></div>
                </div>
                <div class="home-skeleton-tags">
                  <div class="home-skeleton-tag" v-for="tag in 3" :key="tag"></div>
                </div>
                <div class="home-skeleton-actions">
                  <div class="home-skeleton-button"></div>
                  <div class="home-skeleton-button home-skeleton-button-secondary"></div>
                </div>
              </template>
            </el-skeleton>
          </div>
        </article>
      </template>

      <template v-else>
        <article
          class="article-item"
          v-for="article in paginatedArticles"
          :key="article.id"
          @click="openArticle(article.id)"
        >
          <div v-if="article.img" class="article-cover">
            <img :src="article.img" :alt="article.title" />
          </div>
          <div v-else class="article-cover article-cover--placeholder">
            <span class="cover-category">{{ article.category }}</span>
            <strong>{{ article.title.slice(0, 24) }}</strong>
            <p>{{ formatPreviewTags(article.tags) }}</p>
          </div>

          <div class="article-right">
            <div class="article-topline">
              <span class="article-category" @click="openCategory(article.category)">
                {{ article.category }}
              </span>
              <span class="article-date">{{ article.date }}</span>
            </div>

            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-tagline">{{ article.description }}</p>
            <p class="article-content">{{ article.content }}</p>

            <div class="meta-wrap">
              <span>阅读 {{ article.readCount }}</span>
              <span>点赞 {{ article.likeCount }}</span>
              <span>评论 {{ article.commentCount }}</span>
            </div>

            <div class="tag-list">
              <span v-for="tag in article.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
            </div>

            <div class="action-line">
              <button class="btn-read" type="button" @click.stop="openArticle(article.id)">
                阅读全文
              </button>
              <button class="btn-share" type="button" @click.stop="openCategory(article.category)">
                同分类
              </button>
            </div>
          </div>
        </article>

        <div v-if="articles.length === 0" class="empty-state">暂无内容，敬请期待。</div>
      </template>
    </div>

    <el-pagination
      class="my-pagination"
      background
      layout="prev, pager, next, jumper"
      :page-size="pageSize"
      :current-page="currentPage"
      :total="total"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useSiteInfoStore } from '@/stores/siteInfo'
import { applyPendingScrollRestore } from '@/utils/scrollRestore'
import { fetchFrontArticlePage, type FrontArticle } from '@/utils/frontArticles'

const route = useRoute()
const router = useRouter()
const siteInfo = useSiteInfoStore().siteInfo
const loading = ref(false)
const total = ref(0)
const articles = ref<FrontArticle[]>([])
const currentPage = ref(1)
const pageSize = ref(6)

const paginatedArticles = computed(() => articles.value)

const fetchArticles = async () => {
  loading.value = true

  try {
    const result = await fetchFrontArticlePage({
      query: {
        current: currentPage.value,
        pageSize: pageSize.value,
      },
      imageBaseUrl: siteInfo.imageUrl,
    })

    articles.value = result.articles
    total.value = result.total
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取文章失败')
  } finally {
    loading.value = false
    applyPendingScrollRestore(route.fullPath)
  }
}

const formatPreviewTags = (tags: string[]) => {
  const content = tags
    .slice(0, 3)
    .map((tag) => `#${tag}`)
    .join(' ')

  return content || 'Discover more'
}

async function handlePageChange(page: number) {
  currentPage.value = page
  await fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
.page-wrap {
  max-width: 1140px;
  margin: 0 auto;
}

.article-category:hover,
.btn-read:hover,
.btn-share:hover {
  transform: translateY(-1px);
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 168px;
  overflow: hidden;
  border: 1px solid rgba(140, 166, 201, 0.2);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(247, 250, 255, 0.96)),
    linear-gradient(120deg, rgba(78, 128, 229, 0.04), transparent 55%);
  box-shadow:
    0 18px 40px rgba(22, 58, 109, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.article-item::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(76, 115, 223, 0), rgba(76, 115, 223, 0.5), rgba(84, 176, 231, 0));
  opacity: 0;
  transition: opacity 0.22s ease;
}

.article-item:hover {
  transform: translateY(-4px);
  box-shadow:
    0 24px 52px rgba(31, 74, 148, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  border-color: rgba(71, 113, 189, 0.24);
}

.article-item-skeleton {
  cursor: default;
}

.article-item-skeleton:hover {
  transform: none;
}

.article-item-skeleton::after {
  display: none;
}

.article-item:hover::after {
  opacity: 1;
}

.article-cover {
  width: 272px;
  overflow: hidden;
  flex-shrink: 0;
  align-self: stretch;
  position: relative;
  clip-path: polygon(0 0, 100% 0, 84% 100%, 0 100%);
}

.article-cover-skeleton {
  background: linear-gradient(135deg, rgba(226, 235, 247, 0.95), rgba(242, 246, 255, 0.98));
}

.article-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 18, 38, 0.02), rgba(8, 18, 38, 0.12));
  pointer-events: none;
}

.article-cover--placeholder {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  padding: 20px;
  background:
    radial-gradient(circle at top right, rgba(118, 174, 255, 0.42), transparent 28%),
    linear-gradient(160deg, #274a92 0%, #3d70c6 45%, #63b6e7 100%);
  color: #fff;
  overflow: hidden;
}

.cover-category {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 700;
}

.article-cover--placeholder strong {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
}

.article-cover--placeholder p {
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  line-height: 1.6;
}

.article-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.article-item:hover .article-cover img {
  transform: scale(1.05);
}

.article-right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
  padding: 18px 18px 16px;
}

.home-skeleton-topline,
.home-skeleton-meta,
.home-skeleton-tags,
.home-skeleton-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.home-skeleton-topline {
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-skeleton-category,
.home-skeleton-date,
.home-skeleton-chip,
.home-skeleton-tag {
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(225, 233, 246, 0.94), rgba(243, 247, 255, 0.98));
}

.home-skeleton-category {
  width: 92px;
  height: 30px;
}

.home-skeleton-date {
  width: 108px;
  height: 16px;
}

.home-skeleton-title {
  width: min(72%, 420px);
  height: 32px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(223, 231, 245, 0.95), rgba(242, 246, 255, 0.98));
}

.home-skeleton-tagline {
  width: min(58%, 320px);
  height: 16px;
  margin-top: 10px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(227, 235, 247, 0.92), rgba(243, 247, 255, 0.98));
}

.home-skeleton-content {
  margin: 14px 0 12px;
}

.home-skeleton-line {
  height: 14px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(229, 236, 248, 0.92), rgba(243, 247, 255, 0.98));
}

.home-skeleton-line:last-child {
  width: 86%;
  margin-bottom: 0;
}

.home-skeleton-chip {
  width: 68px;
  height: 24px;
  margin-bottom: 10px;
}

.home-skeleton-tags {
  margin-bottom: 10px;
}

.home-skeleton-tag {
  width: 54px;
  height: 22px;
}

.home-skeleton-actions {
  margin-top: 6px;
}

.home-skeleton-button {
  width: 92px;
  height: 36px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(224, 232, 245, 0.94), rgba(242, 246, 255, 0.98));
}

.home-skeleton-button-secondary {
  width: 78px;
}

.article-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.article-category {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(92, 126, 201, 0.12);
  background: rgba(70, 117, 205, 0.07);
  color: #476a95;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.article-date {
  color: #7f94ae;
  font-size: 12px;
  white-space: nowrap;
}

.article-title {
  margin: 0;
  color: #183255;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-tagline {
  min-height: 0;
  margin: 8px 0 6px;
  color: #4d668c;
  font-size: 13px;
  line-height: 1.7;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.article-content {
  flex-grow: 1;
  margin-bottom: 10px;
  color: #5f7291;
  font-size: 13px;
  line-height: 1.75;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  color: #8093ae;
  font-size: 12px;
}

.meta-wrap span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(242, 246, 255, 0.9);
  font-size: 11px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag-chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(92, 126, 201, 0.1);
  background: rgba(70, 117, 205, 0.06);
  color: #436792;
  font-size: 11px;
  font-weight: 700;
}

.action-line {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.btn-read,
.btn-share {
  min-height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 14px;
  outline: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-read {
  background: linear-gradient(135deg, #4c73df, #54b0e7);
  color: #fff;
  box-shadow: 0 12px 24px rgba(49, 93, 175, 0.18);
}

.btn-read:hover {
  background: linear-gradient(135deg, #4165cb, #4aa3d8);
}

.btn-share {
  background: rgba(244, 247, 255, 0.96);
  color: #436792;
  border: 1px solid rgba(156, 180, 212, 0.28);
}

.btn-read:focus,
.btn-share:focus,
.btn-read:focus-visible,
.btn-share:focus-visible {
  outline: none;
  box-shadow: none;
}

.btn-share:hover {
  background: #e7efff;
}

.empty-state {
  padding: 48px 20px;
  border: 1px dashed rgba(155, 178, 206, 0.5);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  color: #6480a4;
  font-size: 16px;
  text-align: center;
}

.my-pagination {
  display: flex;
  justify-content: center;
  margin: 8px auto 0;
}

.my-pagination :deep(.btn-prev),
.my-pagination :deep(.btn-next),
.my-pagination :deep(.number),
.my-pagination :deep(.btn-quicknext),
.my-pagination :deep(.btn-quickprev) {
  min-width: 38px;
  height: 38px;
  border: 1px solid rgba(146, 170, 205, 0.22);
  border-radius: 12px !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.94)) !important;
  color: #4d678f !important;
  box-shadow: 0 10px 22px rgba(39, 73, 122, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.my-pagination :deep(.number:hover),
.my-pagination :deep(.btn-prev:hover),
.my-pagination :deep(.btn-next:hover),
.my-pagination :deep(.btn-quicknext:hover),
.my-pagination :deep(.btn-quickprev:hover) {
  transform: translateY(-1px);
  border-color: rgba(84, 124, 214, 0.28);
  box-shadow: 0 14px 26px rgba(39, 73, 122, 0.1);
}

.my-pagination :deep(.number.is-active) {
  border-color: rgba(78, 116, 214, 0.38);
  background: linear-gradient(135deg, #4c73df, #54b0e7) !important;
  color: #fff !important;
  box-shadow: 0 14px 28px rgba(49, 93, 175, 0.2);
}

.my-pagination :deep(.el-pagination__jump),
.my-pagination :deep(.el-pagination__total) {
  color: #7386a4;
  font-size: 13px;
}

.my-pagination :deep(.el-input__wrapper) {
  min-height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 8px 18px rgba(39, 73, 122, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

.my-pagination :deep(.el-pager) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.my-pagination :deep(.el-pagination button) {
  margin: 0;
}

@media (max-width: 900px) {
  .article-item {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 170px;
    clip-path: none;
  }
}

@media (max-width: 720px) {
  .article-right {
    padding: 18px;
  }

  .article-topline,
  .action-line {
    flex-direction: column;
    align-items: stretch;
  }

  .article-date {
    white-space: normal;
  }

  .btn-read,
  .btn-share {
    width: 100%;
  }

  .article-title {
    font-size: 21px;
  }
}
</style>
