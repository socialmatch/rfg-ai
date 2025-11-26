/**
 * 账户配置文件
 * 管理多个交易账户和对应的AI模型
 */

// 默认初始本金常量（方便统一修改）
export const DEFAULT_INITIAL_CAPITAL = 500

// 账户配置列表
export const ACCOUNT_CONFIGS = [
  {
    id: 'ds4',
    modelName: 'DS4',
    modelSlug: 'ds4',
    modelColor: '#F59E0B', // 琥珀色 (Amber 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao4',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x45da399ec5a552f0ef2c48a7817971ef43d1b83a",
    "signer_address": "0x5571BAa2115B01613394d272982E1f2a3E0778ee",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy4',
    modelName: 'ZY4',
    modelSlug: 'zy4',
    modelColor: '#8B5CF6', // 紫色 (Violet 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao7',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.',
    "user_address": "0x9362Ce38dEDEFEeb03439d7e36e0949F13AE8aAA",
    "signer_address": "0x5E5aCc45bE2c81f18e0c627D606BAE9bddD06293",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy6',
    modelName: 'ZY6',
    modelSlug: 'zy6',
    modelColor: '#EC4899', // 粉红色 (Pink 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao8',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x83B6D7A8F6181c569f59bFae154704FdEE9FAD27",
    "signer_address": "0x8a50BF4Ad95E01981479bdcd47D5cCdd0946eC6e",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'ds6',
    modelName: 'DS6',
    modelSlug: 'ds6',
    modelColor: '#14B8A6', // 蓝绿色 (Teal 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'rfg-6',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0xBfCE9e60F3aFcFe558BD9B3Be66280BD095C6e0E",
    "signer_address": "0x8a50BF4Ad95E01981479bdcd47D5cCdd0946eC6e",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
    accountAlias: "Rfgs",
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
    id: 'ds7',
    modelName: 'DS7',
    modelSlug: 'ds7',
    modelColor: '#F97316', // 橙色 (Orange 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ds7',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy7',
    modelName: 'ZY7',
    modelSlug: 'zy7',
    modelColor: '#6366F1', // 靛蓝色 (Indigo 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy7',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'ds8',
    modelName: 'DS8',
    modelSlug: 'ds8',
    modelColor: '#0EA5E9', // 天空蓝色 (Sky 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ds8',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy8',
    modelName: 'ZY8',
    modelSlug: 'zy8',
    modelColor: '#22C55E', // 绿色 (Green 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy8',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'ds9',
    modelName: 'DS9_B',
    modelSlug: 'ds9_b',
    modelColor: '#EF4444', // 红色 (Red 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'ds9',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy9',
    modelName: 'ZY9_B',
    modelSlug: 'zy9_b',
    modelColor: '#06B6D4', // 青色 (Cyan 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy9',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy4_b',
    modelName: 'ZY4_B',
    modelSlug: 'zy4_b',
    modelColor: '#A855F7', // 紫色变种 (Purple 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy4_b',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy10',
    modelName: 'ZY10_B',
    modelSlug: 'zy10_b',
    modelColor: '#84CC16', // 青柠色 (Lime 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy10',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy11',
    modelName: 'ZY11_B',
    modelSlug: 'zy11_b',
    modelColor: '#F59E0B', // 琥珀色 (Amber 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy11',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy6_b',
    modelName: 'ZY6_B',
    modelSlug: 'zy6_b',
    modelColor: '#F472B6', // 粉红色变种 (Pink 400)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy6_b',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy7_b',
    modelName: 'ZY7_B',
    modelSlug: 'zy7_b',
    modelColor: '#818CF8', // 靛蓝色变种 (Indigo 400)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy7_b',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
    id: 'zy8_b',
    modelName: 'ZY8_B',
    modelSlug: 'zy8_b',
    modelColor: '#10B981', // 绿色变种 (Emerald 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'zy8_b',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x0000000000000000000000000000000000000000",
    "signer_address": "0x0000000000000000000000000000000000000000",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
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
