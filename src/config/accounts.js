/**
 * 账户配置文件
 * 管理多个交易账户和对应的AI模型
 */

// 默认初始本金常量（方便统一修改）
export const DEFAULT_INITIAL_CAPITAL = 500

// 账户配置列表（按等级排序：钻石、黄金、白银、青铜、无）
export const ACCOUNT_CONFIGS = [
  {
    id: 'zy6-bn',
    modelName: '策略-ZY6-钻石',
    modelSlug: 'zy6-bn',
    modelColor: '#8B5CF6', // 紫色 (Violet 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY6-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "Wjt3GW22NDyLTjtZNQ2cfRYJIhoxJgzd02lab5fD7rvl7FQ6VI6yliSe0zLULOwE",
    enabled: true,
    accountAlias: "RfgX",
    asset: "USDT",
    balance: "0.00000000",
    crossWalletBalance: "0.00000000",
    crossUnPnl: "0.00000000",
    availableBalance: "0.00000000",
    maxWithdrawAmount: "0.00000000",
    marginAvailable: true,
    updateTime: 0
  },
  {
    id: 'v3',
    modelName: '策略-V3-黄金',
    modelSlug: 'v3',
    modelColor: '#991B1B', // 深红色 (Red 800)
    modelIcon: 'Rfg_logo.png',
    uid: 'LL-anti-martin',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "RbfTiMMQCyLpkP3b1d2Jwof6FjTGQpKInDk4KA9YXaurRvxs5QV9Y6jJLfL7kT2w",
    enabled: true,
    accountAlias: "RfgX",
    asset: "USDT",
    balance: "0.00000000",
    crossWalletBalance: "0.00000000",
    crossUnPnl: "0.00000000",
    availableBalance: "0.00000000",
    maxWithdrawAmount: "0.00000000",
    marginAvailable: true,
    updateTime: 0
  },
  {
    id: 'v4',
    modelName: '策略-V4-白银',
    modelSlug: 'v4',
    modelColor: '#22C55E', // 绿色 (Green 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY11-FLu',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "6XTcavF1F7ODFpQlvjtjJXMYDcvCfnYvH8zSQFUd350UoNAS3JHm0cyljxBoPxZC",
    enabled: true,
    accountAlias: "RfgX",
    asset: "USDT",
    balance: "0.00000000",
    crossWalletBalance: "0.00000000",
    crossUnPnl: "0.00000000",
    availableBalance: "0.00000000",
    maxWithdrawAmount: "0.00000000",
    marginAvailable: true,
    updateTime: 0
  },
  {
    id: 'zy4-bn',
    modelName: '策略-船体-青铜',
    modelSlug: 'zy4-bn',
    modelColor: '#EC4899', // 粉红色 (Pink 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY4-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "IlDCWqHFPuhFQoAqdBPKe2sVrWrgj3CVSVBO9GeC7KP572M5jPicS3gk5TB8VgH8",
    enabled: true,
    accountAlias: "RfgX",
    asset: "USDT",
    balance: "0.00000000",
    crossWalletBalance: "0.00000000",
    crossUnPnl: "0.00000000",
    availableBalance: "0.00000000",
    maxWithdrawAmount: "0.00000000",
    marginAvailable: true,
    updateTime: 0
  },
  {
    id: 'ds6-bn',
    modelName: '策略-DS6-无',
    modelSlug: 'ds6-bn',
    modelColor: '#14B8A6', // 蓝绿色 (Teal 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS6-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "2LxOX2EEL2sys39iySQdRw3IOpeZCkhizxAHdjbcMvx6x6SQs4PbAkrgOTx8oO0O",
    enabled: true,
    accountAlias: "RfgX",
    asset: "USDT",
    balance: "0.00000000",
    crossWalletBalance: "0.00000000",
    crossUnPnl: "0.00000000",
    availableBalance: "0.00000000",
    maxWithdrawAmount: "0.00000000",
    marginAvailable: true,
    updateTime: 0
  }
]

// 获取启用的账户配置
export const getEnabledAccounts = () => {
  return ACCOUNT_CONFIGS.filter(account => account.enabled)
}

// 根据ID获取账户配置
export const getAccountById = (id) => {
  return ACCOUNT_CONFIGS.find(account => account.id === id)
}

// 根据模型名称获取账户配置
export const getAccountByModelName = (modelName) => {
  return ACCOUNT_CONFIGS.find(account => account.modelName === modelName)
}

// 根据UID获取账户配置
export const getAccountByUid = (uid) => {
  return ACCOUNT_CONFIGS.find(account => account.uid === uid)
}

// 获取所有模型信息
export const getModelInfo = () => {
  return getEnabledAccounts().map(account => ({
    id: account.id,
    name: account.modelName,
    slug: account.modelSlug,
    color: account.modelColor,
    icon: account.modelIcon,
    uid: account.uid,
    enabled: account.enabled
  }))
}

// 获取所有模型信息（包括未启用的）
export const getAllModelInfo = () => {
  return ACCOUNT_CONFIGS.map(account => ({
    id: account.id,
    name: account.modelName,
    slug: account.modelSlug,
    color: account.modelColor,
    icon: account.modelIcon,
    uid: account.uid,
    enabled: account.enabled
  }))
}

// 根据模型名称获取模型信息
export const getModelInfoByName = (modelName) => {
  return ACCOUNT_CONFIGS.find(account => account.modelName === modelName)
}

// 根据模型ID获取模型信息
export const getModelInfoById = (modelId) => {
  return ACCOUNT_CONFIGS.find(account => account.id === modelId)
}

// 获取模型图标路径
export const getModelIconPath = (modelName) => {
  const modelInfo = getModelInfoByName(modelName)
  if (modelInfo && modelInfo.modelIcon) {
    try {
      // 使用动态导入来获取图片URL
      return new URL(`../assets/images/${modelInfo.modelIcon}`, import.meta.url).href
    } catch (error) {
      console.warn(`Failed to load image for ${modelName}:`, error)
      return new URL('../assets/images/default-model.png', import.meta.url).href
    }
  }
  return new URL('../assets/images/default-model.png', import.meta.url).href
}

// 获取模型颜色
export const getModelColor = (modelName) => {
  const modelInfo = getModelInfoByName(modelName)
  return modelInfo ? modelInfo.modelColor : '#3B82F6'
}

// 更新账户余额数据
export const updateAccountBalance = (modelName, balanceData) => {
  const accountIndex = ACCOUNT_CONFIGS.findIndex(account => account.modelName === modelName)
  if (accountIndex !== -1) {
    ACCOUNT_CONFIGS[accountIndex] = {
      ...ACCOUNT_CONFIGS[accountIndex],
      ...balanceData
    }
  }
}

// 获取账户余额数据
export const getAccountBalanceData = (modelName) => {
  const account = getAccountByModelName(modelName)
  if (account) {
    return {
      accountAlias: account.accountAlias,
      asset: account.asset,
      balance: account.balance,
      crossWalletBalance: account.crossWalletBalance,
      crossUnPnl: account.crossUnPnl,
      availableBalance: account.availableBalance,
      maxWithdrawAmount: account.maxWithdrawAmount,
      marginAvailable: account.marginAvailable,
      updateTime: account.updateTime
    }
  }
  return null
}

export default {
  ACCOUNT_CONFIGS,
  DEFAULT_INITIAL_CAPITAL,
  getEnabledAccounts,
  getAccountById,
  getAccountByModelName,
  getAccountByUid,
  getModelInfo,
  getAllModelInfo,
  getModelInfoByName,
  getModelInfoById,
  getModelIconPath,
  getModelColor,
  updateAccountBalance,
  getAccountBalanceData
}
