export interface BlogArticle {
  id: number
  title: string
  description: string
  content: string
  date: string
  readCount: number
  category: string
  tags: string[]
  img?: string
}

export const blogArticles: BlogArticle[] = [
  {
    id: 1,
    title: '昇腾开发者训练营：Dify 大模型部署实战',
    description: '从环境搭建到模型推理，覆盖 Atlas800/910A 全栈实战，包含 MindIE 与 BGE 部署方案。',
    content:
      '本次我负责【昇腾开发者训练营】上海分会场的《DeepSeek + Dify 大模型推理部署实战》部分内容讲解，需要完成 PPT、实操手册以及服务器环境部署。\n\n落地过程中比较关键的难点包括：ARM 架构上的 Dify 部署、910A 上运行 MindIE、向量模型与重排序模型的配套部署。\n\n如果要把这类方案真正落进企业场景，重点不是单一组件能不能跑起来，而是整条链路的稳定性、可维护性和后续扩展成本。',
    date: '2024-06-01',
    readCount: 1000,
    category: 'AI基础',
    tags: ['Dify', '模型部署', '昇腾'],
  },
  {
    id: 2,
    title: '前端性能优化实战：从白屏到首屏 1 秒',
    description: '用实战方案优化资源加载、代码分割和缓存策略，提升用户感知速度。',
    content:
      '这篇文章围绕真实项目中的首屏性能问题展开，从资源体积、接口瀑布、组件懒加载到缓存命中率逐步排查。\n\n当你把性能优化拆成可量化的指标之后，团队协作会顺畅很多，因为每个动作都能回到指标本身，而不是停留在“感觉更快了”。\n\n最终我们通过预加载关键资源、拆分业务代码和优化图片策略，将首屏加载时间从 3 秒以上压到 1 秒左右。',
    date: '2025-03-20',
    readCount: 4200,
    category: '前端优化',
    tags: ['性能', 'Vue', '懒加载'],
    img: '/src/assets/image/192104-17723640645691.jpg',
  },
  {
    id: 3,
    title: '使用 TypeScript 设计可维护组件库',
    description: '分享用 TypeScript + Vue3 构建组件库的类型设计和发布流程。',
    content:
      '一个真正好维护的组件库，不只是组件写出来就结束，而是要在 API 设计、类型推导和变更兼容性上提前想清楚。\n\n通过建立一致的 props 结构、事件命名约定和组合式能力封装，可以显著降低后期维护成本。',
    date: '2025-01-09',
    readCount: 3620,
    category: '前端架构',
    tags: ['TypeScript', '组件库', '测试'],
  },
  {
    id: 4,
    title: '从 0 到 1：构建一套轻量级 CMS',
    description: '实战示例：Vue + Pinia + Element Plus 的后台管理系统。',
    content:
      '这类项目最适合训练系统化思维，因为它几乎覆盖了权限、状态管理、数据表格、表单校验和组件复用等所有常见后台场景。\n\n如果布局、权限和数据请求层一开始抽得合理，后面新增模块的速度会非常快。',
    date: '2025-02-14',
    readCount: 2780,
    category: '项目实战',
    tags: ['CMS', '后台', '权限'],
    img: '/src/assets/image/192104-17723640645691.jpg',
  },
  {
    id: 5,
    title: 'Web3 前端开发与钱包交互指南',
    description: '介绍 MetaMask、WalletConnect 在 Vue 中的集成模式。',
    content:
      '钱包接入最大的挑战通常不是“怎么连上”，而是如何处理签名反馈、交易状态和错误提示，让普通用户也能安全完成操作。',
    date: '2025-02-28',
    readCount: 1970,
    category: '区块链',
    tags: ['Web3', '钱包', '安全'],
  },
  {
    id: 6,
    title: '登录与鉴权体系设计：从 JWT 到 OIDC',
    description: '一文搞懂前端鉴权流程与 Token 刷新策略。',
    content:
      '鉴权体系设计的关键在于边界清晰：哪些信息由前端维护，哪些状态由后端判定，以及失效策略如何统一。',
    date: '2025-03-05',
    readCount: 2840,
    category: '安全',
    tags: ['鉴权', 'JWT', '安全'],
  },
  {
    id: 7,
    title: 'Vue3 组合式 API 的性能陷阱和规避方案',
    description: '深挖响应式系统，避免不必要的重复渲染与计算。',
    content:
      '响应式带来的开发体验很强，但如果边界不清楚，也容易出现意外依赖扩大、重复计算和组件更新风暴。',
    date: '2025-03-12',
    readCount: 2260,
    category: '性能',
    tags: ['Vue3', '响应式', '调试'],
  },
  {
    id: 8,
    title: '实用 CSS 布局案例：Flex / Grid 混合技巧',
    description: '用项目案例解释复杂布局的优雅实现逻辑。',
    content: 'Flex 和 Grid 不是二选一，真正高效的方案往往是把它们放在各自最适合的位置上组合使用。',
    date: '2025-03-18',
    readCount: 1820,
    category: 'UI/UX',
    tags: ['CSS', '布局', '响应式'],
  },
  {
    id: 9,
    title: '自动化测试入门：Vitest + Playwright',
    description: '构建前后端一体的测试策略与 CI 触发方案。',
    content: '好的测试体系不是覆盖率数字本身，而是能不能在真正有风险的地方，提前给出反馈。',
    date: '2025-03-22',
    readCount: 2230,
    category: '测试',
    tags: ['测试', 'CI', '自动化'],
  },
  {
    id: 10,
    title: '前端监控与埋点体系实现',
    description: '覆盖 Vue 应用的错误上报、行为埋点与性能指标。',
    content: '监控体系是线上稳定性的基础设施，越早接入，后续排查问题的成本越低。',
    date: '2025-03-25',
    readCount: 3150,
    category: '运维',
    tags: ['监控', '埋点', '稳定性'],
  },
  {
    id: 11,
    title: 'AI + 前端：大模型搜索体验设计',
    description: '从提示工程到交互设计，构建 LLM 工具型搜索产品。',
    content: 'AI 产品的核心体验，不只是生成得出来，而是用户能否理解、信任并继续使用结果。',
    date: '2025-03-27',
    readCount: 1840,
    category: 'AI 交互',
    tags: ['AI', '搜索', 'UX'],
  },
  {
    id: 12,
    title: '移动端 Web App 适配与触控优化',
    description: '从 viewport 到触控反馈，提升 mobile 用户留存。',
    content:
      '移动端体验好不好，往往体现在滚动、点击反馈和键盘弹起这种“用户说不清但会直接感受到”的细节里。',
    date: '2025-03-28',
    readCount: 1660,
    category: '移动端',
    tags: ['移动', '触控', '适配'],
  },
]

export const categoryMeta: Record<string, { english: string; description: string }> = {
  AI基础: { english: 'AI Basics', description: '大模型部署、AI 基础设施和工程化落地相关内容。' },
  前端优化: { english: 'Performance', description: '围绕加载、渲染、资源策略和感知性能做的优化实践。' },
  前端架构: { english: 'Architecture', description: '组件设计、类型系统和前端工程结构相关沉淀。' },
  项目实战: { english: 'Projects', description: '系统搭建、模块拆分和复杂业务落地过程中的经验记录。' },
  区块链: { english: 'Web3', description: '钱包交互、链上前端接入和安全体验相关内容。' },
  安全: { english: 'Security', description: '鉴权、登录体系和前端安全机制设计。' },
  性能: { english: 'Runtime', description: '运行时性能、响应式边界和调优思路。' },
  'UI/UX': { english: 'Design', description: '界面布局、交互细节和视觉体验相关内容。' },
  测试: { english: 'Testing', description: '自动化测试、质量保障和工程反馈链路。' },
  运维: { english: 'Ops', description: '监控、埋点、稳定性和线上问题治理。' },
  'AI 交互': { english: 'AI UX', description: 'AI 产品体验、搜索交互和结果可解释性探索。' },
  移动端: { english: 'Mobile', description: '移动 Web 适配、触控优化和端侧体验提升。' },
}

export const allCategories = Array.from(new Set(blogArticles.map((item) => item.category)))
