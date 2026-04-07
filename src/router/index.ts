import { createRouter, createWebHistory } from 'vue-router'
import { useLoginUserStore } from '@/stores/loginUser'
import { useAppBootstrapStore } from '@/stores/appBootstrap'
import { setPendingScrollRestore } from '@/utils/scrollRestore'
import { runAppBootstrap } from '@/utils/appBootstrap'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) {
      setPendingScrollRestore({
        route: to.fullPath,
        top: savedPosition.top,
        left: savedPosition.left,
      })
      return false
    }

    return {
      top: 0,
      left: 0,
    }
  },
  routes: [
    {
      path: '/',
      name: 'frontLayout',
      component: () => import('../layout/web/index.vue'),
      children: [
        {
          path: '/',
          name: 'home',
          component: () => import('../views/front/index.vue'),
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('../views/front/profile.vue'),
        },
        {
          path: '/article/:id',
          name: 'articleDetail',
          component: () => import('../views/front/articleDetail.vue'),
        },
        {
          path: '/life',
          name: 'life',
          component: () => import('../views/front/life.vue'),
        },
        {
          path: '/categories',
          name: 'categories',
          component: () => import('../views/front/categories.vue'),
        },
        {
          path: '/archives',
          name: 'archives',
          component: () => import('../views/front/archives.vue'),
        },
        {
          path: '/articles',
          name: 'articleList',
          component: () => import('../views/front/articleList.vue'),
        },
        {
          path: '/portfolio',
          name: 'portfolio',
          component: () => import('../views/front/portfolio.vue'),
        },
      ],
    },
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: () => import('../views/admin/login.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../layout/admin/index.vue'),
      children: [
        {
          path: 'settings',
          name: 'adminSettings',
          component: () => import('../views/admin/settings.vue'),
        },
        {
          path: 'users',
          name: 'adminUsers',
          component: () => import('../views/admin/users.vue'),
        },
        {
          path: 'articles',
          name: 'adminArticles',
          component: () => import('../views/admin/articles.vue'),
        },
        {
          path: 'posts',
          name: 'adminPosts',
          component: () => import('../views/admin/posts.vue'),
        },
        {
          path: 'comments',
          name: 'adminComments',
          component: () => import('../views/admin/comments.vue'),
        },
      ],
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})
let firstFetch = true
let bootstrapPromise: Promise<void> | null = null

const ensureAppBootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = runAppBootstrap().finally(() => {
      bootstrapPromise = null
    })
  }

  return bootstrapPromise
}

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  const appBootstrapStore = useAppBootstrapStore()

  appBootstrapStore.setTargetPath(to.fullPath)

  if (firstFetch) {
    try {
      await ensureAppBootstrap()
      firstFetch = false
    } catch {
      next(false)
      return
    }
  }

  const loginUser = loginUserStore.loginUser
  if (to.path.startsWith('/admin') && to.name != 'adminLogin') {
    if (!loginUser.id) {
      next('/admin/login')
      return
    } else if (loginUser.userRole != 'admin') {
      next('/')
      return
    }
  }
  next()
})

export default router
