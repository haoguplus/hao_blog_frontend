export type PostMediaType = 'image' | 'video'

export const POST_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const POST_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'] as const

export const POST_MEDIA_ACCEPT = [...POST_IMAGE_MIME_TYPES, ...POST_VIDEO_MIME_TYPES].join(',')

export const POST_IMAGE_MAX_SIZE_MB = 2
export const POST_VIDEO_MAX_SIZE_MB = 50

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogg', 'mov', 'm4v'])

const normalizeValue = (value?: string) => String(value || '').trim().toLowerCase()

const getFileExtension = (value?: string) => {
  const normalizedValue = String(value || '').trim().split(/[?#]/)[0] || ''
  const extensionIndex = normalizedValue.lastIndexOf('.')

  if (extensionIndex < 0) return ''

  return normalizedValue.slice(extensionIndex + 1).toLowerCase()
}

export const isPostImageMimeType = (mimeType?: string) =>
  POST_IMAGE_MIME_TYPES.includes(normalizeValue(mimeType) as (typeof POST_IMAGE_MIME_TYPES)[number])

export const isPostVideoMimeType = (mimeType?: string) =>
  POST_VIDEO_MIME_TYPES.includes(normalizeValue(mimeType) as (typeof POST_VIDEO_MIME_TYPES)[number])

export const getPostMediaType = (value?: string, mimeType?: string): PostMediaType => {
  if (isPostVideoMimeType(mimeType)) return 'video'
  if (isPostImageMimeType(mimeType)) return 'image'

  const extension = getFileExtension(value)
  if (VIDEO_EXTENSIONS.has(extension)) return 'video'
  if (IMAGE_EXTENSIONS.has(extension)) return 'image'

  return 'image'
}

export const isPostVideo = (value?: string, mimeType?: string) => getPostMediaType(value, mimeType) === 'video'

export const normalizePostMediaUrl = (value?: string, baseUrl?: string) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const normalizedBaseUrl = String(baseUrl || '').trim()
  if (!normalizedBaseUrl) return value

  const normalizedBase = normalizedBaseUrl.endsWith('/') ? normalizedBaseUrl.slice(0, -1) : normalizedBaseUrl
  const normalizedPath = value.startsWith('/') ? value : `/${value}`
  return `${normalizedBase}${normalizedPath}`
}
