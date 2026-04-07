// 用户角色常量定义
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIP: 'vip'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// 角色显示配置
export const ROLE_CONFIG = {
  [USER_ROLES.ADMIN]: {
    label: '管理员',
    type: 'danger' as const,
    color: '#f56c6c'
  },
  [USER_ROLES.USER]: {
    label: '普通用户',
    type: 'primary' as const,
    color: '#409eff'
  },
  [USER_ROLES.VIP]: {
    label: 'VIP会员',
    type: 'success' as const,
    color: '#67c23a'
  }
} as const

// 获取角色配置
export const getRoleConfig = (role: string) => {
  return ROLE_CONFIG[role as UserRole] || ROLE_CONFIG[USER_ROLES.USER]
}

// 获取角色标签
export const getRoleLabel = (role: string) => {
  return getRoleConfig(role).label
}

// 获取角色类型（用于Element Plus标签）
export const getRoleType = (role: string) => {
  return getRoleConfig(role).type
}

// 获取角色颜色
export const getRoleColor = (role: string) => {
  return getRoleConfig(role).color
}

// 判断是否为管理员
export const isAdmin = (role: string) => {
  return role === USER_ROLES.ADMIN
}

// 判断是否为VIP会员
export const isVip = (role: string) => {
  return role === USER_ROLES.VIP
}

// 判断是否为普通用户
export const isUser = (role: string) => {
  return role === USER_ROLES.USER
}