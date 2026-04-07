// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /file/uploadImg */
export async function pushImage1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pushImage1Params,
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBlogimages>('/file/uploadImg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
      uploadPictureRequest: undefined,
      ...params['uploadPictureRequest'],
    },
    data: body,
    ...(options || {}),
  })
}
