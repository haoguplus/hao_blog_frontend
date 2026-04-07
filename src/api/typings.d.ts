declare namespace API {
  type ArticleAdminVo = {
    id?: string | number
    title?: string
    summary?: string
    content?: string
    coverImage?: string
    categoryId?: string | number
    tags?: TagsVo[]
    userId?: string | number
    status?: number
    isTop?: number
    isHot?: number
    isComment?: number
    isEncrypt?: number
    encryptPwd?: string
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
    viewCount?: number
    likeCount?: number
    commentCount?: number
    publishTime?: string
    createTime?: string
    updateTime?: string
  }

  type ArticleCategoriesAndTags = {
    categories?: CategoriesVo[]
    tags?: TagsVo[]
  }

  type ArticleDeleteRequest = {
    articleId?: string | number
  }

  type ArticleDetailPasswordRequest = {
    articleId?: string | number
    password?: string
  }

  type ArticleDetailRequest = {
    id?: string | number
  }

  type ArticleEditRequest = {
    id?: string | number
    coverImage?: string
    title?: string
    summary?: string
    content?: string
    categoryId?: number
    tags?: number[]
    status?: number
    isTop?: number
    isHot?: number
    isComment?: number
    isEncrypt?: number
    encryptPwd?: string
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
  }

  type ArticleIdRequest = {
    articleId?: string | number
  }

  type ArticlePushRequest = {
    coverImage?: string
    title?: string
    summary?: string
    content?: string
    categoryId?: number
    tags?: number[]
    status?: number
    isTop?: number
    isHot?: number
    isComment?: number
    isEncrypt?: number
    encryptPwd?: string
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
  }

  type ArticleQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: string | number
    title?: string
    content?: string
    summary?: string
    categoryId?: string | number
    tags?: string
    status?: number
    isTop?: number
    isHot?: number
    isComment?: number
    isEncrypt?: number
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
  }

  type ArticleSearchRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    searchContent?: string
  }

  type ArticleVo = {
    id?: string | number
    title?: string
    summary?: string
    content?: string
    coverImage?: string
    categoryId?: string | number
    tags?: TagsVo[]
    userId?: string | number
    status?: number
    isTop?: number
    isHot?: number
    isComment?: number
    isEncrypt?: number
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
    viewCount?: number
    likeCount?: number
    commentCount?: number
    publishTime?: string
    updateTime?: string
  }

  type BaseResponseArticleAdminVo = {
    code?: number
    msg?: string
    data?: ArticleAdminVo
  }

  type BaseResponseArticleCategoriesAndTags = {
    code?: number
    msg?: string
    data?: ArticleCategoriesAndTags
  }

  type BaseResponseArticleVo = {
    code?: number
    msg?: string
    data?: ArticleVo
  }

  type BaseResponseBlogimages = {
    code?: number
    msg?: string
    data?: Blogimages
  }

  type BaseResponseBoolean = {
    code?: number
    msg?: string
    data?: boolean
  }

  type BaseResponseCommentVo = {
    code?: number
    msg?: string
    data?: CommentVo
  }

  type BaseResponseHashMapStringString = {
    code?: number
    msg?: string
    data?: Record<string, any>
  }

  type BaseResponseLoginUserVo = {
    code?: number
    msg?: string
    data?: LoginUserVo
  }

  type BaseResponseLong = {
    code?: number
    msg?: string
    data?: number
  }

  type BaseResponsePageArticleAdminVo = {
    code?: number
    msg?: string
    data?: PageArticleAdminVo
  }

  type BaseResponsePageArticleVo = {
    code?: number
    msg?: string
    data?: PageArticleVo
  }

  type BaseResponsePageCommentAdminVo = {
    code?: number
    msg?: string
    data?: PageCommentAdminVo
  }

  type BaseResponsePageCommentVo = {
    code?: number
    msg?: string
    data?: PageCommentVo
  }

  type BaseResponsePageLoginUserVo = {
    code?: number
    msg?: string
    data?: PageLoginUserVo
  }

  type BaseResponsePagePostCommentVo = {
    code?: number
    msg?: string
    data?: PagePostCommentVo
  }

  type BaseResponsePageUserPostsVo = {
    code?: number
    msg?: string
    data?: PageUserPostsVo
  }

  type BaseResponsePostCommentVo = {
    code?: number
    msg?: string
    data?: PostCommentVo
  }

  type BaseResponsePostPublicData = {
    code?: number
    msg?: string
    data?: PostPublicData
  }

  type BaseResponseString = {
    code?: number
    msg?: string
    data?: string
  }

  type BaseResponseSysConfigVo = {
    code?: number
    msg?: string
    data?: SysConfigVo
  }

  type BaseResponseSysInfo = {
    code?: number
    msg?: string
    data?: SysInfo
  }

  type BaseResponseUserPostsVo = {
    code?: number
    msg?: string
    data?: UserPostsVo
  }

  type Blogimages = {
    id?: number
    imageName?: string
    saveName?: string
    filePath?: string
    fileUrl?: string
    fileSize?: number
    fileType?: string
    fileExt?: string
    width?: number
    height?: number
    thumbPath?: string
    sourceType?: number
    sourceId?: number
    sort?: number
    status?: number
    createTime?: string
    updateTime?: string
  }

  type CategoriesVo = {
    id?: number
    name?: string
  }

  type CommentAdminVo = {
    id?: string | number
    articleId?: string | number
    user?: UserVo
    replyUser?: UserVo
    parentId?: number
    content?: string
    status?: number
    likeCount?: number
    createTime?: string
    updateTime?: string
  }

  type CommentByArticleRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    articleId?: number
  }

  type CommentLikeRequest = {
    commentId?: number
    articleId?: number
  }

  type CommentQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    articleId?: number
    userId?: number
    replyUserId?: number
    parentId?: number
    content?: string
    status?: number
  }

  type CommentUpdateRequest = {
    id?: string | number
    status?: number
  }

  type CommentVo = {
    id?: number
    articleId?: number
    user?: UserVo
    userId?: number
    replyUser?: UserVo
    replyUserId?: number
    parentId?: number
    content?: string
    likeCount?: number
    isLike?: boolean
    createTime?: string
    updateTime?: string
  }

  type ComponentPushRequest = {
    articleId?: number
    replyUserId?: number
    parentId?: number
    content?: string
  }

  type DeleteRequest = {
    id?: string | number
  }

  type deleteUserVoByIdParams = {
    id: number
  }

  type getALlCommentParams = {
    commentQueryRequest: CommentQueryRequest
  }

  type getArticleCommentParams = {
    comment: CommentByArticleRequest
  }

  type getArticleDetailParams = {
    articleDetailRequest: ArticleDetailRequest
  }

  type getArticleListParams = {
    articleQueryRequest: ArticleQueryRequest
  }

  type getFrontPostsListParams = {
    pageRequest: PageRequest
  }

  type getPostCommentListParams = {
    postCommentQueryRequest: PostCommentQueryRequest
  }

  type getUserVoByIdParams = {
    id: number
  }

  type isLikeArticleParams = {
    articleIdRequest: ArticleIdRequest
  }

  type LoginUserVo = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    shareCode?: string
    inviteUser?: number
    editTime?: string
    createTime?: string
  }

  type OrderItem = {
    column?: string
    asc?: boolean
  }

  type PageArticleAdminVo = {
    records?: ArticleAdminVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageArticleAdminVo
    searchCount?: PageArticleAdminVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageArticleVo = {
    records?: ArticleVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageArticleVo
    searchCount?: PageArticleVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageCommentAdminVo = {
    records?: CommentAdminVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageCommentAdminVo
    searchCount?: PageCommentAdminVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageCommentVo = {
    records?: CommentVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageCommentVo
    searchCount?: PageCommentVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageLoginUserVo = {
    records?: LoginUserVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageLoginUserVo
    searchCount?: PageLoginUserVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PagePostCommentVo = {
    records?: PostCommentVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PagePostCommentVo
    searchCount?: PagePostCommentVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
  }

  type PageUserPostsVo = {
    records?: UserPostsVo[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageUserPostsVo
    searchCount?: PageUserPostsVo
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PostCommentPushRequest = {
    postId?: number
    replyId?: number
    content?: string
  }

  type PostCommentQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    postId?: number
  }

  type PostCommentVo = {
    id?: number
    postId?: number
    userId?: number
    user?: UserVo
    replyId?: number
    content?: string
    createdAt?: string
  }

  type PostLikeRequest = {
    postId?: number
  }

  type PostPublicData = {
    postType?: Record<string, any>
    mood?: Record<string, any>
    privacy?: Record<string, any>
  }

  type PostPushRequest = {
    content?: string
    imageList?: string[]
    postType?: number
    tags?: string[]
    mood?: number
    privacy?: number
    isTop?: number
  }

  type PostsQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    content?: string
    postType?: number
    tags?: string
    mood?: number
    privacy?: number
  }

  type PostUpdateRequest = {
    id?: number
    content?: string
    imageList?: string[]
    postType?: number
    tags?: string[]
    mood?: number
    privacy?: number
    isTop?: number
  }

  type pushImage1Params = {
    uploadPictureRequest: UploadPictureRequest
  }

  type SysConfigUpdateRequest = {
    siteName?: string
    siteTitle?: string
    siteIntroduction?: string
    siteAuthor?: string
    siteKeywords?: string
    siteDescription?: string
    siteCopyright?: string
    siteIcp?: string
    commentStatus?: string
  }

  type SysConfigVo = {
    siteName?: string
    siteTitle?: string
    siteLogo?: string
    siteIntroduction?: string
    siteAuthor?: string
    siteAuthorId?: number
    siteKeywords?: string
    siteDescription?: string
    siteCopyright?: string
    siteIcp?: string
    commentStatus?: string
  }

  type SysInfo = {
    siteName?: string
    siteTitle?: string
    siteLogo?: string
    siteIntroduction?: string
    siteAuthor?: string
    siteAuthorId?: number
    siteKeywords?: string
    siteDescription?: string
    siteCopyright?: string
    siteIcp?: string
    imageUrl?: string
    commentStatus?: string
  }

  type TagsVo = {
    id?: number
    name?: string
  }

  type UploadPictureRequest = {
    sourceType?: number
  }

  type UserLoginRequest = {
    username?: string
    password?: string
  }

  type UserPostsVo = {
    id?: number
    userId?: number
    content?: string
    imageList?: string[]
    postType?: number
    tags?: string[]
    mood?: number
    privacy?: number
    isTop?: number
    isLike?: boolean
    likeCount?: number
    commentCount?: number
    createdAt?: string
  }

  type UserQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    username?: string
    password?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: number
    userName?: string
    userProfile?: string
  }

  type UserVo = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
  }
}
