/**
 * 账户配置文件
 * 管理多个交易账户和对应的AI模型
 */

// 默认初始本金常量（方便统一修改）
export const DEFAULT_INITIAL_CAPITAL = 500

// 账户配置列表
export const ACCOUNT_CONFIGS = [
  {
    id: 'ds4-bn',
    modelName: 'DS4-BN',
    modelSlug: 'ds4-bn',
    modelColor: '#F59E0B', // 琥珀色 (Amber 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS4-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    modelName: 'DS6-BN',
    modelSlug: 'ds6-bn',
    modelColor: '#14B8A6', // 蓝绿色 (Teal 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS6-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'ds7-bn',
    modelName: 'DS7-BN',
    modelSlug: 'ds7-bn',
    modelColor: '#F97316', // 橙色 (Orange 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS7-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'ds9-bn',
    modelName: 'DS9-BN',
    modelSlug: 'ds9-bn',
    modelColor: '#EF4444', // 红色 (Red 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS9-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'ds10-bn',
    modelName: 'DS10-BN',
    modelSlug: 'ds10-bn',
    modelColor: '#0EA5E9', // 天空蓝色 (Sky 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS10-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    modelName: 'ZY4-BN',
    modelSlug: 'zy4-bn',
    modelColor: '#8B5CF6', // 紫色 (Violet 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY4-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'zy6-bn',
    modelName: 'ZY6-BN',
    modelSlug: 'zy6-bn',
    modelColor: '#EC4899', // 粉红色 (Pink 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY6-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'zy7-bn',
    modelName: 'ZY7-BN',
    modelSlug: 'zy7-bn',
    modelColor: '#6366F1', // 靛蓝色 (Indigo 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY7-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'zy9-bn',
    modelName: 'ZY9-BN',
    modelSlug: 'zy9-bn',
    modelColor: '#06B6D4', // 青色 (Cyan 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY9-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'zy10-bn',
    modelName: 'ZY10-BN',
    modelSlug: 'zy10-bn',
    modelColor: '#84CC16', // 青柠色 (Lime 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY10-BN',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'zy11-flu',
    modelName: 'LL11-7',
    modelSlug: 'LL11-7',
    modelColor: '#22C55E', // 绿色 (Green 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ZY11-FLu',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
    id: 'ds11-flu',
    modelName: 'LL11-6',
    modelSlug: 'LL11-6',
    modelColor: '#10B981', // 绿色变种 (Emerald 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'DS11-FLu',
    initialCapital: DEFAULT_INITIAL_CAPITAL,
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
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
