// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /article/addArticleLikeCount */
export async function addArticleLikeCount(
  body: API.ArticleIdRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/article/addArticleLikeCount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/addBrowse */
export async function addBrowse(body: API.ArticleIdRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/article/addBrowse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/deleteArticle */
export async function deleteArticle(
  body: API.ArticleDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/article/deleteArticle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/editArticle */
export async function editArticle(body: API.ArticleEditRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseArticleAdminVo>('/article/editArticle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/getArticleAdminList */
export async function getArticleAdminList(
  body: API.ArticleQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageArticleAdminVo>('/article/getArticleAdminList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /article/getArticleDetail */
export async function getArticleDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticleDetailParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseArticleVo>('/article/getArticleDetail', {
    method: 'GET',
    params: {
      ...params,
      articleDetailRequest: undefined,
      ...params['articleDetailRequest'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /article/getArticleList */
export async function getArticleList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticleListParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageArticleVo>('/article/getArticleList', {
    method: 'GET',
    params: {
      ...params,
      articleQueryRequest: undefined,
      ...params['articleQueryRequest'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/getArticlePassDetail */
export async function getArticlePassDetail(
  body: API.ArticleDetailPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseArticleVo>('/article/getArticlePassDetail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /article/getCategoriesAndTags */
export async function getCategoriesAndTages(options?: { [key: string]: any }) {
  return request<API.BaseResponseArticleCategoriesAndTags>('/article/getCategoriesAndTags', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/getSearchArticle */
export async function getSearchArticle(
  body: API.ArticleSearchRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageArticleVo>('/article/getSearchArticle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /article/isLikeArticle */
export async function isLikeArticle(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.isLikeArticleParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/article/isLikeArticle', {
    method: 'GET',
    params: {
      ...params,
      articleIdRequest: undefined,
      ...params['articleIdRequest'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/pushArticle */
export async function pushArticle(body: API.ArticlePushRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseArticleAdminVo>('/article/pushArticle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/removeArticleLikeCount */
export async function removeArticleLikeCount(
  body: API.ArticleIdRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/article/removeArticleLikeCount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /article/uploadCover */
export async function pushImage2(body: {}, options?: { [key: string]: any }) {
  return request<API.BaseResponseBlogimages>('/article/uploadCover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
