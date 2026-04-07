<template>
  <el-container class="admin-layout">
    <div v-if="isMobileSidebarOpen" class="sidebar-mask" @click="closeMobileSidebar"></div>

    <el-aside
      class="admin-sidebar"
      :class="{ 'is-mobile-open': isMobileSidebarOpen }"
      width="260px"
    >
      <div class="brand-panel">
        <div class="brand-badge">Admin</div>
        <h1 class="brand-title">Hao Blog</h1>
        <p class="brand-subtitle">内容管理中心</p>
      </div>

      <div class="nav-section">
        <div class="nav-caption">导航菜单</div>
        <el-menu
          class="admin-menu"
          :default-active="activeMenu"
          background-color="transparent"
          text-color="#5f6f94"
          active-text-color="#1d4ed8"
          @select="handleSelect"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.index"
            :index="item.index"
            class="admin-menu-item"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="sidebar-footer">
        <div class="footer-card">
          <div class="footer-label">当前环境</div>
          <div class="footer-value">Element Plus Admin Layout</div>
        </div>
      </div>
    </el-aside>

    <el-container class="admin-main-shell">
      <el-header class="admin-header">
        <div class="header-left">
          <button class="sidebar-toggle" type="button" @click="toggleMobileSidebar">
            <el-icon><Operation /></el-icon>
          </button>
          <div>
            <div class="header-title">管理员后台</div>
            <div class="header-path">{{ route.path }}</div>
          </div>
        </div>

        <div class="header-status">
          <div class="status-chip">
            <span class="status-dot"></span>
            <span>{{ loginUserStore.loginUser.id ? '已登录' : '未登录' }}</span>
          </div>

          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-panel el-dropdown-link">
              <el-avatar :size="38" class="user-avatar">
                {{ userInitial }}
              </el-avatar>
              <div class="user-meta">
                <div class="user-name">{{ loginUserStore.loginUser.userName || '未登录' }}</div>
                <el-tag
                  size="small"
                  effect="plain"
                  round
                  :type="getRoleType(loginUserStore.loginUser.userRole || 'user')"
                >
                  {{ getRoleLabel(loginUserStore.loginUser.userRole || 'user') }}
                </el-tag>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>

            <template #dropdown>
              <el-dropdown-menu class="admin-user-dropdown">
                <el-dropdown-item class="logout-item" command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" v-if="Component" />
          <div v-else class="dashboard-placeholder">
            <div class="hero-card">
              <div class="hero-copy">
                <div class="hero-kicker">Dashboard</div>
                <h2>欢迎进入后台管理中心</h2>
                <p>
                  左侧可以放文章、用户、分类等管理入口，右侧区域会根据子路由展示具体内容。
                  现在这页先作为管理员布局首页，方便你继续往下扩展。
                </p>
              </div>

              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">当前用户</div>
                  <div class="stat-value">{{ loginUserStore.loginUser.userName || '未登录' }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">角色状态</div>
                  <div class="stat-value">
                    {{ getRoleLabel(loginUserStore.loginUser.userRole || 'user') }}
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">当前路由</div>
                  <div class="stat-value">{{ route.path }}</div>
                </div>
              </div>
            </div>
          </div>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown,
  ChatDotRound,
  DataBoard,
  Document,
  EditPen,
  Operation,
  Setting,
  User,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '@/api/userController'
import { getRoleLabel, getRoleType } from '@/constants/userRoles'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()
const isMobileSidebarOpen = ref(false)

const menuItems = [
  { index: '/admin', label: '控制台', icon: DataBoard },
  { index: '/admin/articles', label: '文章管理', icon: Document },
  { index: '/admin/posts', label: '说说管理', icon: EditPen },
  { index: '/admin/comments', label: '评论管理', icon: ChatDotRound },
  { index: '/admin/users', label: '用户管理', icon: User },
  { index: '/admin/settings', label: '系统设置', icon: Setting },
]

const activeMenu = computed(() => {
  const matched = menuItems.find(
    (item) => route.path.startsWith(item.index) && item.index !== '/admin',
  )
  return matched?.index || '/admin'
})

const userInitial = computed(() => {
  const userName = loginUserStore.loginUser.userName || 'U'
  return userName.slice(0, 1).toUpperCase()
})

const handleSelect = (index: string) => {
  isMobileSidebarOpen.value = false
  router.push(index)
}

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

const handleUserCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出当前登录状态吗？', '退出登录', {
        confirmButtonText: '退出登录',
        cancelButtonText: '取消',
        type: 'warning',
      })

      const res = await logout()

      if (res.data.code === 0) {
        ElMessage.success('已退出登录')
        loginUserStore.setLoginUser({})
        router.push('/admin/login')
        return
      }

      ElMessage.error(res.data.msg || '退出登录失败')
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('退出登录失败，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(85, 137, 255, 0.18), transparent 28%),
    linear-gradient(180deg, #f4f7fb 0%, #eef3f9 100%);
}

.sidebar-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(2px);
}

.admin-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  overflow-y: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
  border-right: 1px solid rgba(196, 208, 224, 0.65);
  box-shadow: 18px 0 40px rgba(41, 72, 126, 0.08);
}

.brand-panel {
  padding: 20px 18px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(123, 165, 255, 0.22), transparent 34%),
    linear-gradient(145deg, #1f4ed8, #4f8cff);
  color: #fff;
  box-shadow: 0 18px 36px rgba(38, 83, 174, 0.24);
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-title {
  margin: 16px 0 6px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.15;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  line-height: 1.6;
}

.nav-section {
  margin-top: 24px;
}

.nav-caption,
.footer-label {
  margin: 0 12px 12px;
  color: #8b98b3;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-menu {
  border-right: none;
}

.admin-menu-item {
  height: 50px;
  margin-bottom: 8px;
  border-radius: 14px;
  font-weight: 600;
}

.admin-menu :deep(.el-menu-item) {
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.admin-menu :deep(.el-menu-item:hover) {
  background: #eef4ff !important;
  transform: translateX(2px);
}

.admin-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(
    135deg,
    rgba(74, 122, 255, 0.16),
    rgba(80, 170, 255, 0.14)
  ) !important;
  box-shadow: inset 0 0 0 1px rgba(80, 117, 255, 0.16);
}

.sidebar-footer {
  margin-top: auto;
}

.footer-card {
  padding: 16px 18px;
  border: 1px solid rgba(201, 211, 225, 0.7);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 24px rgba(62, 92, 138, 0.08);
}

.footer-value {
  color: #31405e;
  font-size: 14px;
  font-weight: 600;
}

.admin-main-shell {
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 86px;
  padding: 20px 28px 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex-wrap: wrap;
}

.sidebar-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(196, 208, 224, 0.82);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  color: #38507d;
  box-shadow: 0 10px 24px rgba(53, 81, 122, 0.08);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar-toggle:hover {
  transform: translateY(-1px);
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(53, 81, 122, 0.12);
}

.header-title {
  color: #1a2640;
  font-size: 28px;
  font-weight: 700;
}

.header-path {
  margin-top: 6px;
  color: #7f8aa3;
  font-size: 14px;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(196, 208, 224, 0.75);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #4b5b79;
  font-size: 14px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 10px 14px;
  border: 1px solid rgba(193, 206, 226, 0.78);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(106, 145, 255, 0.12), transparent 36%),
    rgba(255, 255, 255, 0.92);
  box-shadow:
    0 14px 30px rgba(53, 81, 122, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.user-panel:hover {
  transform: translateY(-1px);
  background: #ffffff;
  box-shadow:
    0 18px 34px rgba(53, 81, 122, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
}

.user-avatar {
  background: linear-gradient(135deg, #4c74ff, #53b0ff);
  color: #fff;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  color: #21304f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.dropdown-arrow {
  color: #7d8ca8;
  font-size: 14px;
}

:deep(.admin-user-dropdown.el-dropdown-menu) {
  min-width: 168px;
  padding: 8px;
  border: 1px solid rgba(204, 215, 233, 0.78);
  border-radius: 16px;
  background:
    radial-gradient(circle at top left, rgba(108, 145, 255, 0.1), transparent 40%),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 44px rgba(46, 79, 127, 0.16);
}

:deep(.admin-user-dropdown .el-dropdown-menu__item) {
  height: 44px;
  border-radius: 12px;
  color: #3e5375;
  font-size: 14px;
  font-weight: 600;
}

:deep(.admin-user-dropdown .el-dropdown-menu__item:hover) {
  background: rgba(244, 98, 98, 0.08);
  color: #d14343;
}

:deep(.admin-user-dropdown .logout-item) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-content {
  padding: 8px 28px 28px;
}

.dashboard-placeholder {
  min-height: calc(100vh - 122px);
}

.hero-card {
  display: grid;
  gap: 20px;
  padding: 28px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(84, 156, 255, 0.14), transparent 24%),
    rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 44px rgba(47, 78, 126, 0.1);
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(72, 112, 255, 0.1);
  color: #4064f6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h2 {
  margin: 16px 0 12px;
  color: #1d2b47;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-copy p {
  max-width: 760px;
  color: #60708f;
  font-size: 15px;
  line-height: 1.8;
}

.stat-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  padding: 18px 20px;
  border-radius: 20px;
  background: linear-gradient(180deg, #f9fbff, #eef4ff);
  border: 1px solid rgba(204, 216, 235, 0.86);
}

.stat-label {
  color: #7d8ba6;
  font-size: 13px;
}

.stat-value {
  margin-top: 10px;
  color: #233553;
  font-size: 18px;
  font-weight: 700;
  word-break: break-word;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    width: min(82vw, 280px) !important;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
  }

  .admin-sidebar.is-mobile-open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: inline-flex;
  }

  .admin-main-shell {
    width: 100%;
  }

  .admin-header {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 18px 8px;
  }

  .header-left {
    width: 100%;
  }

  .header-status {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .admin-content {
    padding: 8px 18px 18px;
  }

  .hero-card {
    padding: 22px 18px;
  }

  .hero-copy h2 {
    font-size: 26px;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
