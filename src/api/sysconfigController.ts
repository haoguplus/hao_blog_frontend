// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /sys/getAuthor */
export async function getAuthor(options?: { [key: string]: any }) {
  return request<API.BaseResponseHashMapStringString>('/sys/getAuthor', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /sys/getSysConfig */
export async function getSysConfig(options?: { [key: string]: any }) {
  return request<API.BaseResponseSysConfigVo>('/sys/getSysConfig', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /sys/getSysInfo */
export async function getSysInfo(options?: { [key: string]: any }) {
  return request<API.BaseResponseSysInfo>('/sys/getSysInfo', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /sys/setSysConfig */
export async function setSysConfig(
  body: API.SysConfigUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSysConfigVo>('/sys/setSysConfig', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
