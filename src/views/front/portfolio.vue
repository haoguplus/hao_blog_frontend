<template>
  <section class="portfolio-page">
    <header class="portfolio-hero">
      <div class="hero-orb hero-orb-left"></div>
      <div class="hero-orb hero-orb-right"></div>

      <div class="hero-copy">
        <span class="hero-badge">Portfolio</span>
        <h1>作品集</h1>
        <p>
          这里整理了我做过的一些项目与实验，覆盖博客系统、后台平台、AI 交互原型和前端视觉实验。
          我更在意项目是否真的解决问题，也在意它是否足够好看、足够顺手、足够易扩展。
        </p>

        <div class="hero-actions">
          <button type="button" class="primary-btn" @click="scrollToProjects">查看项目</button>
          <button type="button" class="ghost-btn">联系合作</button>
        </div>

        <div class="hero-points">
          <span class="point-chip">注重体验设计</span>
          <span class="point-chip">强调工程可维护性</span>
          <span class="point-chip">持续迭代更新</span>
        </div>
      </div>

      <div class="hero-side">
        <div class="hero-stat wide">
          <span class="stat-label">精选方向</span>
          <strong>Web / Admin / AI</strong>
          <span class="stat-tip">从产品感到工程感同时推进</span>
        </div>

        <div class="stat-grid">
          <div class="hero-stat compact">
            <span class="stat-label">项目数量</span>
            <strong>{{ projects.length }}</strong>
            <span class="stat-tip">个整理案例</span>
          </div>

          <div class="hero-stat compact">
            <span class="stat-label">当前状态</span>
            <strong>持续更新</strong>
            <span class="stat-tip">保持作品迭代</span>
          </div>
        </div>
      </div>
    </header>

    <section class="featured-section">
      <article class="featured-card">
        <div class="featured-copy">
          <span class="section-kicker">Featured Work</span>
          <h2>{{ featuredProject?.title }}</h2>
          <p>{{ featuredProject?.description }}</p>

          <div class="featured-meta">
            <span>{{ featuredProject?.period }}</span>
            <span>{{ featuredProject?.role }}</span>
            <span>{{ featuredProject?.status }}</span>
          </div>

          <div class="featured-tags">
            <span v-for="tag in featuredProject?.tech || []" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>

          <div class="highlight-grid">
            <div v-for="item in featuredProject?.highlights || []" :key="item.label" class="highlight-card">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="featured-preview">
          <div class="preview-window">
            <div class="preview-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="preview-layout">
              <div class="preview-sidebar">
                <div class="preview-nav long"></div>
                <div class="preview-nav"></div>
                <div class="preview-nav"></div>
                <div class="preview-nav"></div>
              </div>

              <div class="preview-main">
                <div class="preview-hero-card"></div>
                <div class="preview-mini-grid">
                  <div class="preview-mini-card"></div>
                  <div class="preview-mini-card"></div>
                  <div class="preview-mini-card wide"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <div class="filter-bar">
      <button
        v-for="item in filterOptions"
        :key="item"
        type="button"
        class="filter-chip"
        :class="{ 'is-active': activeFilter === item }"
        @click="activeFilter = item"
      >
        {{ item }}
      </button>
    </div>

    <section class="overview-strip">
      <div class="overview-card">
        <span class="overview-label">项目筛选</span>
        <strong>{{ activeFilter }}</strong>
        <span class="overview-tip">当前展示维度</span>
      </div>
      <div class="overview-card">
        <span class="overview-label">结果数量</span>
        <strong>{{ filteredProjects.length }}</strong>
        <span class="overview-tip">个匹配作品</span>
      </div>
      <div class="overview-card">
        <span class="overview-label">作品特征</span>
        <strong>体验 + 工程</strong>
        <span class="overview-tip">兼顾落地与视觉</span>
      </div>
    </section>

    <section id="projects" class="project-grid">
      <article v-for="project in filteredProjects" :key="project.title" class="project-card">
        <div class="project-cover">
          <div class="cover-pattern cover-pattern-a"></div>
          <div class="cover-pattern cover-pattern-b"></div>
          <div class="cover-content">
            <span class="project-type">{{ project.type }}</span>
            <h3>{{ project.title }}</h3>
            <span class="project-status">{{ project.status }}</span>
          </div>
        </div>

        <div class="project-body">
          <p class="project-desc">{{ project.description }}</p>

          <div class="project-info">
            <div class="info-row">
              <span class="info-label">项目周期</span>
              <span class="info-value">{{ project.period }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">我的角色</span>
              <span class="info-value">{{ project.role }}</span>
            </div>
          </div>

          <div class="tag-list">
            <span v-for="tag in project.tech" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>

          <div class="card-footer">
            <button type="button" class="text-link">查看详情</button>
            <span class="project-year">{{ project.year }}</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type ProjectHighlight = {
  label: string
  value: string
}

type ProjectItem = {
  title: string
  type: string
  status: string
  description: string
  period: string
  role: string
  year: string
  tech: string[]
  highlights: ProjectHighlight[]
}

const filterOptions = ['全部', '后台系统', '前端应用', 'AI 项目', '个人实验']
const activeFilter = ref('全部')

const projects: ProjectItem[] = [
  {
    title: '博客前台与管理后台',
    type: '后台系统',
    status: '持续迭代',
    description:
      '从博客展示页到后台管理页的一体化项目，包含文章管理、内容展示、个人中心和多页面运营内容建设。重点打磨页面一致性、交互完整度与内容组织效率。',
    period: '2026.03 - 至今',
    role: '产品设计 / 前端开发',
    year: '2026',
    tech: ['Vue 3', 'TypeScript', 'Element Plus', 'Vite'],
    highlights: [
      { label: '页面模块', value: '10+' },
      { label: '统一路由体验', value: '已完成' },
      { label: '视觉体系', value: '持续优化' },
    ],
  },
  {
    title: '轻量 CMS 管理系统',
    type: '后台系统',
    status: '已完成',
    description:
      '面向内容管理场景的中后台系统，强调清晰的信息架构、权限边界和高效的数据录入体验，适合内容型业务快速搭建管理后台。',
    period: '2025.11 - 2026.01',
    role: '前端负责人',
    year: '2026',
    tech: ['Vue 3', 'Pinia', 'Element Plus', 'ECharts'],
    highlights: [
      { label: '核心模块', value: '6 个' },
      { label: '权限体系', value: '已接入' },
      { label: '数据可视化', value: '支持' },
    ],
  },
  {
    title: 'AI 搜索体验原型',
    type: 'AI 项目',
    status: '原型验证',
    description:
      '围绕大模型搜索体验搭建的工具型产品原型，重点探索搜索结果组织、可解释性与对话式交互方式，让 AI 结果更易理解和使用。',
    period: '2025.08 - 2025.10',
    role: '交互设计 / 前端实现',
    year: '2025',
    tech: ['Vue 3', 'LLM', 'Prompt Design', 'UX'],
    highlights: [
      { label: '原型轮次', value: '3 轮' },
      { label: '体验重点', value: '搜索交互' },
      { label: '输出形式', value: '高保真' },
    ],
  },
  {
    title: '移动端作品展示站',
    type: '前端应用',
    status: '已上线',
    description:
      '为个人内容与项目展示设计的一套移动端友好的响应式站点，重点优化排版阅读感、触控反馈和模块切换流畅度。',
    period: '2025.05 - 2025.06',
    role: '独立开发',
    year: '2025',
    tech: ['Vue 3', 'Responsive', 'Animation', 'CSS'],
    highlights: [
      { label: '设备适配', value: '多端' },
      { label: '体验侧重', value: '触控反馈' },
      { label: '样式策略', value: '响应式' },
    ],
  },
  {
    title: '交互实验室',
    type: '个人实验',
    status: '长期更新',
    description:
      '收集和实现一些界面动效、卡片布局和信息展示的小实验，用来持续打磨视觉风格、过渡节奏与界面完成度。',
    period: '长期维护',
    role: '个人练习',
    year: '2025',
    tech: ['Motion', 'UI Design', 'Prototype', 'Front-end'],
    highlights: [
      { label: '实验方向', value: '动效 / 布局' },
      { label: '更新方式', value: '持续追加' },
      { label: '用途', value: '视觉探索' },
    ],
  },
]

const featuredProject = projects[0]

const filteredProjects = computed(() => {
  if (activeFilter.value === '全部') {
    return projects
  }

  return projects.filter((item) => item.type === activeFilter.value)
})

const scrollToProjects = () => {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.portfolio-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.portfolio-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
  gap: 18px;
  padding: 30px;
  border: 1px solid rgba(145, 171, 207, 0.26);
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(107, 153, 255, 0.22), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 249, 255, 0.95));
  box-shadow: 0 24px 52px rgba(23, 59, 108, 0.12);
}

.hero-orb {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(10px);
}

.hero-orb-left {
  left: -40px;
  top: -50px;
  width: 190px;
  height: 190px;
  background: rgba(102, 145, 255, 0.16);
}

.hero-orb-right {
  right: -50px;
  bottom: -60px;
  width: 240px;
  height: 240px;
  background: rgba(86, 198, 233, 0.12);
}

.hero-copy,
.hero-side {
  position: relative;
  z-index: 1;
}

.hero-badge,
.section-kicker,
.project-type {
  color: #7f93b2;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin-top: 12px;
  color: #173154;
  font-size: 40px;
  font-weight: 800;
  line-height: 1.08;
}

.hero-copy p {
  max-width: 640px;
  margin-top: 14px;
  color: #5f759a;
  font-size: 15px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}

.primary-btn,
.ghost-btn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 16px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.primary-btn:hover,
.ghost-btn:hover,
.filter-chip:hover,
.project-card:hover {
  transform: translateY(-2px);
}

.primary-btn {
  background: linear-gradient(135deg, #4b72df, #58b2e6);
  color: #fff;
  box-shadow: 0 14px 26px rgba(41, 84, 159, 0.18);
}

.ghost-btn {
  border: 1px solid rgba(166, 185, 214, 0.34);
  background: rgba(255, 255, 255, 0.76);
  color: #496586;
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.point-chip,
.tag-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(70, 117, 205, 0.08);
  color: #456995;
  font-size: 12px;
  font-weight: 700;
}

.hero-side {
  display: grid;
  gap: 14px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  border: 1px solid rgba(158, 181, 213, 0.28);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
}

.hero-stat.wide {
  min-height: 148px;
}

.hero-stat.compact {
  min-height: 126px;
}

.stat-label,
.stat-tip,
.overview-label,
.overview-tip {
  color: #7c92b2;
  font-size: 12px;
}

.hero-stat strong,
.overview-card strong {
  margin: 8px 0 6px;
  color: #17365b;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.4;
}

.featured-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: 20px;
  padding: 26px;
  border: 1px solid rgba(152, 176, 209, 0.24);
  border-radius: 28px;
  background:
    radial-gradient(circle at right top, rgba(125, 165, 255, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 18px 38px rgba(22, 58, 109, 0.1);
}

.featured-copy h2 {
  margin-top: 10px;
  color: #173154;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.featured-copy p {
  margin-top: 12px;
  color: #5c7498;
  line-height: 1.85;
}

.featured-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  color: #758ba9;
  font-size: 13px;
  font-weight: 600;
}

.featured-tags,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.highlight-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 92px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(248, 251, 255, 0.9);
  border: 1px solid rgba(171, 189, 216, 0.22);
}

.highlight-card strong {
  color: #17385c;
  font-size: 20px;
  font-weight: 800;
}

.highlight-card span {
  margin-top: 6px;
  color: #7d92af;
  font-size: 12px;
  font-weight: 700;
}

.featured-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-window {
  width: 100%;
  max-width: 400px;
  padding: 14px;
  border: 1px solid rgba(170, 189, 217, 0.26);
  border-radius: 28px;
  background: rgba(252, 253, 255, 0.88);
  box-shadow:
    0 20px 40px rgba(30, 72, 136, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.preview-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.preview-bar span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(120, 140, 175, 0.46);
}

.preview-layout {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 12px;
}

.preview-sidebar,
.preview-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-sidebar {
  padding: 10px;
  border-radius: 18px;
  background: rgba(241, 246, 255, 0.92);
}

.preview-nav,
.preview-hero-card,
.preview-mini-card {
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(89, 127, 221, 0.14), rgba(99, 195, 225, 0.14)),
    rgba(240, 246, 255, 0.92);
}

.preview-nav {
  min-height: 40px;
}

.preview-nav.long {
  min-height: 62px;
}

.preview-main {
  padding: 10px;
  border-radius: 18px;
  background: rgba(248, 251, 255, 0.92);
}

.preview-hero-card {
  min-height: 132px;
}

.preview-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.preview-mini-card {
  min-height: 88px;
}

.preview-mini-card.wide {
  grid-column: 1 / -1;
  min-height: 74px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(160, 182, 214, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #496585;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

.filter-chip.is-active {
  border-color: rgba(86, 125, 211, 0.42);
  background: linear-gradient(135deg, rgba(87, 134, 234, 0.12), rgba(100, 198, 255, 0.12));
  box-shadow: 0 10px 20px rgba(38, 85, 148, 0.12);
}

.overview-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 118px;
  padding: 18px 20px;
  border: 1px solid rgba(160, 182, 214, 0.24);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 28px rgba(27, 68, 127, 0.08);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.project-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(151, 175, 208, 0.24);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.95));
  box-shadow: 0 16px 36px rgba(22, 58, 109, 0.1);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.project-card:hover {
  border-color: rgba(94, 131, 213, 0.34);
  box-shadow: 0 22px 44px rgba(22, 58, 109, 0.14);
}

.project-cover {
  position: relative;
  overflow: hidden;
  min-height: 180px;
  padding: 20px;
  background:
    linear-gradient(135deg, rgba(76, 115, 223, 0.16), rgba(89, 178, 230, 0.12)),
    linear-gradient(180deg, #f5f9ff, #edf4ff);
}

.cover-pattern {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
}

.cover-pattern-a {
  right: -26px;
  top: -18px;
  width: 120px;
  height: 120px;
  background: rgba(104, 149, 255, 0.18);
}

.cover-pattern-b {
  left: -18px;
  bottom: -24px;
  width: 140px;
  height: 140px;
  background: rgba(95, 199, 232, 0.12);
}

.cover-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cover-content h3 {
  color: #173255;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
}

.project-status {
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  color: #446da8;
  font-size: 12px;
  font-weight: 700;
}

.project-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
}

.project-desc {
  color: #5e7698;
  line-height: 1.85;
}

.project-info {
  display: grid;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(248, 251, 255, 0.9);
}

.info-label {
  color: #8194b1;
  font-size: 12px;
  font-weight: 700;
}

.info-value {
  color: #2d4f79;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.text-link {
  border: none;
  background: transparent;
  color: #456d9f;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.project-year {
  color: #8799b3;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 980px) {
  .portfolio-hero,
  .featured-card,
  .overview-strip,
  .project-grid {
    grid-template-columns: 1fr;
  }

  .stat-grid,
  .highlight-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .portfolio-page {
    gap: 16px;
  }

  .portfolio-hero,
  .featured-card,
  .project-card {
    padding: 18px;
    border-radius: 24px;
  }

  .hero-copy h1,
  .featured-copy h2,
  .cover-content h3 {
    font-size: 30px;
  }

  .hero-actions,
  .card-footer,
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .primary-btn,
  .ghost-btn {
    width: 100%;
  }

  .preview-layout {
    grid-template-columns: 1fr;
  }
}
</style>
