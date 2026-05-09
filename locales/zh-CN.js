export default {
  layout: {
    skipToMain: '跳到主要内容'
  },
  nav: {
    home: '首页',
    buildings: '房屋',
    auth: '登录',
    account: '账户',
    admin: '管理后台',
    watchlist: '关注列表',
    shortlists: '对比清单',
    logout: '退出',
    localeLabel: '语言'
  },
  search: {
    keywordLabel: '搜索',
    keywordPlaceholder: '按地址、名称或房东搜索',
    boroughLabel: '行政区',
    allBoroughs: '全部行政区',
    submit: '搜索'
  },
  pagination: {
    nav: '分页导航',
    prev: '上一页',
    next: '下一页',
    page: '第'
  },
  placeholder: {
    routeLabel: '页面路径',
    groupLabel: '页面分组',
    planHeading: '计划内容'
  },
  errors: {
    notFoundTitle: '页面不存在',
    notFoundMessage: '当前页面暂不可用。',
    unexpectedTitle: '发生错误',
    unexpectedMessage: '出现了未预期错误，请稍后再试。',
    forbiddenTitle: '禁止访问',
    forbiddenMessage: '你没有访问此页面的权限。',
  },
  footer: {
    note: 'LeaseWise NYC — 数据来源于纽约市开放数据。'
  },
  home: {
    eyebrow: '纽约市租房情报',
    title: '签约前，先了解清楚。',
    subtitle: '一站式查询任意建筑的投诉记录、违规历史和社区评价。',
    featureIntelTitle: '建筑情报',
    featureIntelDesc: '查看任意纽约市建筑的投诉、违规、臭虫报告及诉讼历史。',
    featureShortlistTitle: '短名单与对比',
    featureShortlistDesc: '将建筑加入短名单，添加私人备注，并进行并排对比。',
    featureReviewsTitle: '社区评价',
    featureReviewsDesc: '阅读和撰写带标签的租客评价，了解真实居住体验。',
    featureWatchlistTitle: '关注列表',
    featureWatchlistDesc: '追踪您正在考虑的建筑，随时从仪表盘重新查看。'
  },
  buildings: {
    noResultsTitle: '未找到建筑',
    noResultsMessage: '请尝试调整搜索词或行政区筛选条件。',
    clearSearch: '清除搜索',
    removeWatchlist: '取消关注',
    addWatchlist: '加入关注',
    riskHighlights: '风险摘要',
    housingRecords: '住房记录',
    communityReviews: '社区评价',
    noReviewsTitle: '暂无评价',
    noReviewsMessage: '成为第一个分享居住体验的人。',
    writeReview: '撰写评价',
    ratingLabel: '评分',
    ratingPlaceholder: '请选择评分',
    rating5: '5 — 非常好',
    rating4: '4 — 较好',
    rating3: '3 — 一般',
    rating2: '2 — 较差',
    rating1: '1 — 很差',
    reviewLabel: '评价内容',
    reviewPlaceholder: '描述您的居住体验...',
    submitReview: '提交评价',
    ownerManager: '房东 / 管理公司',
    buildingsInPortfolio: '栋建筑在该组合中',
    addToShortlist: '加入短名单',
    chooseShortlist: '选择短名单',
    watching: '已关注',
    watch: '关注',
    noReviewsYet: '暂无评价'
  },
  stats: {
    complaints: '投诉',
    violations: '违规',
    bedbugs: '臭虫报告',
    litigations: '诉讼'
  },
  reviews: {
    delete: '删除'
  },
  account: {
    title: '我的账户',
    profileSection: '个人资料',
    firstName: '名',
    lastName: '姓',
    email: '电子邮件',
    username: '用户名',
    saveChanges: '保存更改',
    passwordSection: '修改密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认新密码',
    updatePassword: '更新密码',
    dangerSection: '危险操作',
    dangerDesc: '永久删除您的账户及所有相关数据。',
    deleteAccount: '删除账户',
    deleteDialogTitle: '确认删除账户？',
    deleteDialogMessage: '此操作将永久删除您的账户、评价和短名单，且无法撤销。',
    deleteDialogConfirm: '确认删除我的账户'
  },
  watchlist: {
    title: '我的关注列表',
    subtitle: '您正在追踪的建筑。',
    emptyTitle: '关注列表为空',
    emptyMessage: '浏览建筑并点击"关注"将其保存到此处。',
    browseBuildings: '浏览建筑'
  },
  compare: {
    title: '建筑对比',
    colAttribute: '属性',
    rowRisk: '风险等级',
    rowComplaints: '投诉',
    rowViolations: '违规',
    rowBedbugs: '臭虫报告',
    rowLitigations: '诉讼',
    rowReviews: '评价',
    emptyTitle: '暂无可对比内容',
    emptyMessage: '请先将建筑加入短名单，再使用对比功能。',
    myShortlists: '我的短名单'
  },
  shortlists: {
    title: '我的短名单',
    subtitle: '您正在考虑的建筑精选列表。',
    newNameLabel: '新短名单名称',
    newNamePlaceholder: '例如：布鲁克林备选',
    create: '创建短名单',
    view: '查看',
    compare: '对比',
    deleteDialogTitle: '确认删除短名单？',
    deleteDialogMessage: '此操作将永久删除该短名单及所有备注。',
    deleteConfirm: '删除',
    deleteBtn: '删除短名单',
    emptyTitle: '暂无短名单',
    emptyMessage: '创建一个短名单，开始对比建筑。',
    compareAll: '全部对比',
    removeBtn: '移除',
    removeDialogTitle: '确认移除建筑？',
    removeDialogMessage: '将此建筑从短名单中移除？',
    removeConfirm: '移除',
    detailEmptyTitle: '短名单中暂无建筑',
    detailEmptyMessage: '浏览建筑并将其加入此短名单。',
    browseBuildings: '浏览建筑'
  },
  portfolio: {
    eyebrow: '房东组合',
    underOwner: '栋建筑属于该房东',
    emptyTitle: '未找到建筑',
    emptyMessage: '该组合下暂无建筑记录。'
  },
  admin: {
    manageTitle: '管理建筑',
    addBuilding: '添加建筑',
    colAddress: '地址',
    colBorough: '行政区',
    colRisk: '风险',
    colReviews: '评价',
    colActions: '操作',
    editBtn: '编辑',
    deleteBtn: '删除',
    deleteDialogTitle: '确认删除建筑？',
    deleteConfirm: '删除',
    emptyTitle: '暂无建筑',
    emptyMessage: '添加第一栋建筑以开始使用。',
    formAddTitle: '添加建筑',
    formEditTitle: '编辑建筑',
    addressLabel: '地址',
    addressPlaceholder: '例如：123 Main St',
    boroughLabel: '行政区',
    boroughPlaceholder: '请选择行政区',
    ownerLabel: '房东 / 管理公司',
    ownerPlaceholder: '房东名称',
    riskSummaryLegend: '风险摘要',
    riskLevelLabel: '风险等级',
    riskUnknown: '未知',
    riskLow: '低',
    riskMedium: '中',
    riskHigh: '高',
    scoreLabel: '评分',
    complaintsLabel: '投诉',
    violationsLabel: '违规',
    bedbugsLabel: '臭虫报告',
    litigationsLabel: '诉讼',
    cancelBtn: '取消',
    saveChanges: '保存更改',
    users: {
      title: '用户管理',
      empty: '暂无用户。',
      tableCaption: '用户管理表格',
      columns: {
        name: '姓名',
        username: '用户名',
        email: '邮箱',
        role: '角色',
        status: '状态',
        actions: '操作'
      },
      roles: {
        admin: '管理员',
        user: '普通用户'
      },
      status: {
        active: '正常',
        banned: '已封禁'
      },
      actions: {
        promote: '提升为管理员',
        ban: '封禁用户'
      },
      errors: {
        loadFailed: '加载用户失败。',
        unexpected: '发生了未预期错误。'
      }
    },
    reviews: {
      nav: '评论审核',
      title: '评论审核管理',
      subtitle: '标记、隐藏和删除评论。',
      empty: '暂无评论。',
      tableCaption: '评论审核表格',
      columns: {
        author: '作者',
        building: '房屋',
        rating: '评分',
        review: '评论',
        status: '审核状态',
        actions: '操作'
      },
      status: {
        visible: '公开',
        flagged: '已标记',
        hidden: '已隐藏',
        deleted: '已删除'
      },
      actions: {
        flag: '标记评论',
        hide: '隐藏评论',
        delete: '删除评论'
      },
    },
  },
  noteForm: {
    label: '私人备注',
    placeholder: '添加关于此建筑的私人备注...',
    hint: '仅您可见。',
    save: '保存备注'
  },
  dialog: {
    cancel: '取消'
  },
  auth: {
    loginEyebrow: '欢迎回来',
    loginTitle: '登录 LeaseWise NYC',
    loginDesc: '访问您的关注列表、短名单、评价和已保存的建筑对比。',
    usernameLabel: '用户名',
    usernamePlaceholder: '请输入用户名',
    passwordLabel: '密码',
    passwordPlaceholder: '请输入密码',
    signIn: '登录',
    noAccount: '还没有账户？',
    createAccount: '立即注册',
    registerEyebrow: '创建账户',
    registerTitle: '加入 LeaseWise NYC',
    registerDesc: '保存建筑、对比公寓、撰写评价，追踪住房记录。',
    firstNameLabel: '名',
    firstNamePlaceholder: '请输入名字',
    lastNameLabel: '姓',
    lastNamePlaceholder: '请输入姓氏',
    emailLabel: '电子邮件',
    emailPlaceholder: '请输入电子邮件地址',
    newUsernamePlaceholder: '请选择用户名',
    newPasswordPlaceholder: '请创建密码',
    confirmPasswordLabel: '确认密码',
    confirmPasswordPlaceholder: '请再次输入密码',
    hasAccount: '已有账户？'
  }
};
