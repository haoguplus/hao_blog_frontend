// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /comment/deleteComment */
export async function deleteComment(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/deleteComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /comment/getALlComment */
export async function getALlComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getALlCommentParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentAdminVo>('/comment/getALlComment', {
    method: 'GET',
    params: {
      ...params,
      commentQueryRequest: undefined,
      ...params['commentQueryRequest'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /comment/getArticleComment */
export async function getArticleComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticleCommentParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentVo>('/comment/getArticleComment', {
    method: 'GET',
    params: {
      ...params,
      comment: undefined,
      ...params['comment'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /comment/getPostCommentList */
export async function getPostCommentList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPostCommentListParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePostCommentVo>('/comment/getPostCommentList', {
    method: 'GET',
    params: {
      ...params,
      postCommentQueryRequest: undefined,
      ...params['postCommentQueryRequest'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /comment/likeComment */
export async function likeComment(body: API.CommentLikeRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/likeComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /comment/pushComment */
export async function pushComment(
  body: API.ComponentPushRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseCommentVo>('/comment/pushComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /comment/pushPostComment */
export async function pushPostComment(
  body: API.PostCommentPushRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePostCommentVo>('/comment/pushPostComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /comment/updateComment */
export async function updateComment(
  body: API.CommentUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/comment/updateComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
