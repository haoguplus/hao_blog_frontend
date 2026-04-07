import {
  addArticleLikeCount,
  addBrowse,
  getArticleDetail,
  getArticleList,
  getArticlePassDetail,
  getCategoriesAndTages,
  getSearchArticle,
  isLikeArticle,
  removeArticleLikeCount,
} from '@/api/articleController'

export interface FrontArticle {
  id: string
  title: string
  description: string
  content: string
  rawContent: string
  date: string
  readCount: number
  category: string
  tags: string[]
  img?: string
  categoryId?: string | number
  likeCount: number
  commentCount: number
  isComment: number
  isEncrypt: number
  publishTime?: string
  updateTime?: string
}

export interface FrontArticleReferenceData {
  categories: API.CategoriesVo[]
  tags: API.TagsVo[]
  categoryMap: Map<number, string>
}

interface FrontArticlePageResult extends FrontArticleReferenceData {
  articles: FrontArticle[]
  total: number
}

interface FrontArticleDetailResult extends FrontArticleReferenceData {
  article: FrontArticle
}

const DEFAULT_PAGE_SIZE = 100

const normalizeArticleId = (value?: string | number) => String(value ?? '').trim()

const buildCategoryMap = (categories: API.CategoriesVo[]) => {
  return new Map(
    categories
      .filter((category): category is API.CategoriesVo & { id: number; name: string } => {
        return typeof category.id === 'number' && Boolean(String(category.name || '').trim())
      })
      .map((category) => [category.id, String(category.name || '').trim()]),
  )
}

const normalizeDate = (value?: string) => {
  const currentValue = String(value || '').trim()
  if (!currentValue) return ''

  const normalizedValue = currentValue.replace('T', ' ')
  return normalizedValue.slice(0, 10)
}

const stripMarkdown = (value?: string) => {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\((.*?)\)/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~\-]+/g, ' ')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const buildSummary = (article: API.ArticleVo) => {
  const summary = String(article.summary || '').trim()
  if (summary) return summary

  return ''
}

const buildExcerpt = (article: API.ArticleVo) => {
  const plainContent = stripMarkdown(article.content)
  if (!plainContent) return buildSummary(article)

  return plainContent.slice(0, 180)
}

const resolveImageUrl = (coverImage?: string, imageBaseUrl?: string) => {
  const currentUrl = String(coverImage || '').trim()
  if (!currentUrl) return undefined
  if (/^(https?:)?\/\//i.test(currentUrl) || currentUrl.startsWith('data:')) return currentUrl

  const normalizedBase = String(imageBaseUrl || '')
    .trim()
    .replace(/\/$/, '')
  const normalizedPath = currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`

  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath
}

export const mapArticleRecord = (
  article: API.ArticleVo,
  categoryMap: Map<number, string>,
  imageBaseUrl?: string,
): FrontArticle => {
  const publishTime = article.publishTime || article.updateTime || ''
  const summary = buildSummary(article)

  return {
    id: normalizeArticleId(article.id),
    title: String(article.title || '未命名文章'),
    description: summary,
    content: buildExcerpt(article),
    rawContent: String(article.content || ''),
    date: normalizeDate(publishTime) || '--',
    readCount: Number(article.viewCount || 0),
    category: categoryMap.get(Number(article.categoryId)) || '未分类',
    tags: (article.tags || []).map((tag) => String(tag.name || '').trim()).filter(Boolean),
    img: resolveImageUrl(article.coverImage, imageBaseUrl),
    categoryId: article.categoryId,
    likeCount: Number(article.likeCount || 0),
    commentCount: Number(article.commentCount || 0),
    isComment: Number(article.isComment ?? 1),
    isEncrypt: Number(article.isEncrypt ?? 0),
    publishTime: article.publishTime,
    updateTime: article.updateTime,
  }
}

export const fetchFrontArticleReferenceData = async (): Promise<FrontArticleReferenceData> => {
  const res = await getCategoriesAndTages()

  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.msg || '获取分类和标签失败')
  }

  const categories = res.data.data.categories || []
  const tags = res.data.data.tags || []

  return {
    categories,
    tags,
    categoryMap: buildCategoryMap(categories),
  }
}

const buildArticleQuery = (query?: API.ArticleQueryRequest): API.ArticleQueryRequest => {
  return {
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortField: 'publishTime',
    sortOrder: 'desc',
    ...query,
  }
}

const requestArticlePage = async (query?: API.ArticleQueryRequest) => {
  const res = await getArticleList({
    articleQueryRequest: buildArticleQuery(query),
  })

  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.msg || '获取文章列表失败')
  }

  return res.data.data
}

const buildArticleSearchQuery = (
  query?: API.ArticleSearchRequest,
): API.ArticleSearchRequest => {
  return {
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortField: 'publishTime',
    sortOrder: 'desc',
    ...query,
  }
}

const requestArticleSearchPage = async (query?: API.ArticleSearchRequest) => {
  const res = await getSearchArticle(buildArticleSearchQuery(query))

  if (res.data.code !== 0 || !res.data.data) {
    throw new Error(res.data.msg || '获取搜索文章列表失败')
  }

  return res.data.data
}

export const fetchFrontArticlePage = async (options?: {
  query?: API.ArticleQueryRequest
  imageBaseUrl?: string
  referenceData?: FrontArticleReferenceData
}): Promise<FrontArticlePageResult> => {
  const articlePage = await requestArticlePage(options?.query)
  const referenceData = options?.referenceData || (await fetchFrontArticleReferenceData())

  return {
    ...referenceData,
    articles: (articlePage.records || []).map((article: API.ArticleVo) =>
      mapArticleRecord(article, referenceData.categoryMap, options?.imageBaseUrl),
    ),
    total: Number(articlePage.total || 0),
  }
}

export const fetchAllFrontArticles = async (options?: {
  query?: API.ArticleQueryRequest
  imageBaseUrl?: string
}): Promise<FrontArticlePageResult> => {
  const referenceData = await fetchFrontArticleReferenceData()
  const firstPage = await requestArticlePage(options?.query)

  const total = Number(firstPage.total || 0)
  const pageSize = Number(
    firstPage.size || buildArticleQuery(options?.query).pageSize || DEFAULT_PAGE_SIZE,
  )
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)))

  const pageRequests: Promise<API.PageArticleVo>[] = []
  for (let page = 2; page <= totalPages; page += 1) {
    pageRequests.push(
      requestArticlePage({
        ...options?.query,
        current: page,
        pageSize,
      }),
    )
  }

  const restPages = pageRequests.length ? await Promise.all(pageRequests) : []
  const records = [firstPage, ...restPages].flatMap((page) => page.records || [])

  return {
    ...referenceData,
    articles: records.map((article) =>
      mapArticleRecord(article, referenceData.categoryMap, options?.imageBaseUrl),
    ),
    total,
  }
}

export const fetchAllSearchFrontArticles = async (options?: {
  query?: API.ArticleSearchRequest
  imageBaseUrl?: string
}): Promise<FrontArticlePageResult> => {
  const referenceData = await fetchFrontArticleReferenceData()
  const firstPage = await requestArticleSearchPage(options?.query)

  const total = Number(firstPage.total || 0)
  const pageSize = Number(
    firstPage.size || buildArticleSearchQuery(options?.query).pageSize || DEFAULT_PAGE_SIZE,
  )
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)))

  const pageRequests: Promise<API.PageArticleVo>[] = []
  for (let page = 2; page <= totalPages; page += 1) {
    pageRequests.push(
      requestArticleSearchPage({
        ...options?.query,
        current: page,
        pageSize,
      }),
    )
  }

  const restPages = pageRequests.length ? await Promise.all(pageRequests) : []
  const records = [firstPage, ...restPages].flatMap((page) => page.records || [])

  return {
    ...referenceData,
    articles: records.map((article) =>
      mapArticleRecord(article, referenceData.categoryMap, options?.imageBaseUrl),
    ),
    total,
  }
}

export const fetchFrontArticleDetail = async (options: {
  id: string
  imageBaseUrl?: string
  password?: string
}): Promise<FrontArticleDetailResult> => {
  const referenceData = await fetchFrontArticleReferenceData()
  const articleId = normalizeArticleId(options.id)
  const response = options.password
    ? await getArticlePassDetail({
        articleId,
        password: options.password,
      })
    : await getArticleDetail({
        articleDetailRequest: {
          id: articleId,
        },
      })

  if (response.data.code !== 0 || !response.data.data) {
    throw new Error(response.data.msg || '获取文章详情失败')
  }

  return {
    ...referenceData,
    article: mapArticleRecord(response.data.data, referenceData.categoryMap, options.imageBaseUrl),
  }
}

export const addFrontArticleBrowse = async (articleId: string) => {
  const res = await addBrowse({
    articleId: normalizeArticleId(articleId),
  })

  if (res.data.code !== 0) {
    throw new Error(res.data.msg || '增加文章浏览量失败')
  }

  return Boolean(res.data.data)
}

export const addFrontArticleLike = async (articleId: string) => {
  const res = await addArticleLikeCount({
    articleId: normalizeArticleId(articleId),
  })

  if (res.data.code !== 0) {
    throw new Error(res.data.msg || '增加文章点赞失败')
  }

  return Boolean(res.data.data)
}

export const removeFrontArticleLike = async (articleId: string) => {
  const res = await removeArticleLikeCount({
    articleId: normalizeArticleId(articleId),
  })

  if (res.data.code !== 0) {
    throw new Error(res.data.msg || '取消文章点赞失败')
  }

  return Boolean(res.data.data)
}

export const fetchFrontArticleLikeState = async (articleId: string) => {
  const res = await isLikeArticle({
    articleIdRequest: {
      articleId: normalizeArticleId(articleId),
    },
  })

  if (res.data.code !== 0) {
    throw new Error(res.data.msg || '获取文章点赞状态失败')
  }

  return Boolean(res.data.data)
}
