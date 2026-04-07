// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /posts/deletePost */
export async function deletePost(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/posts/deletePost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /posts/getFrontPostslist */
export async function getFrontPostsList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFrontPostsListParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserPostsVo>('/posts/getFrontPostslist', {
    method: 'GET',
    params: {
      ...params,
      pageRequest: undefined,
      ...params['pageRequest'],
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /posts/getPostsList */
export async function getPostsList(body: API.PostsQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageUserPostsVo>('/posts/getPostsList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /posts/getPostsPublicData */
export async function getPostsPublicData(options?: { [key: string]: any }) {
  return request<API.BaseResponsePostPublicData>('/posts/getPostsPublicData', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /posts/likePost */
export async function likePost(body: API.PostLikeRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/posts/likePost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /posts/pushPosts */
export async function pushPosts(body: API.PostPushRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseUserPostsVo>('/posts/pushPosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /posts/updatePost */
export async function updatePost(body: API.PostUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseUserPostsVo>('/posts/updatePost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /posts/uploadPicture */
export async function pushImage(body: {}, options?: { [key: string]: any }) {
  return request<API.BaseResponseBlogimages>('/posts/uploadPicture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
