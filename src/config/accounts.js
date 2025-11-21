/**
 * 账户配置文件
 * 管理多个交易账户和对应的AI模型
 */

// 默认初始本金常量（方便统一修改）
export const DEFAULT_INITIAL_CAPITAL = 500

// 账户配置列表
export const ACCOUNT_CONFIGS = [
  {
    id: 'ds1',
    modelName: 'DS1',
    modelSlug: 'ds1',
    modelColor: '#EF4444', // 红色 (Red 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao1',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0xdb71d86188ccf4fa0b6bf4c5181272b9b497161c",
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
    id: 'ds2',
    modelName: 'DS2',
    modelSlug: 'ds2',
    modelColor: '#10B981', // 翠绿色 (Emerald 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao2',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x5591a0894e7e7d4950c8ce17048a2c3ba5f4f2ff",
    "signer_address": "0xbF7F859886C873d2BA4dC43610d8e295469a7b71",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
    accountAlias: "Deep",
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
    id: 'ds3',
    modelName: 'DS3',
    modelSlug: 'ds3',
    modelColor: '#3B82F6', // 蓝色 (Blue 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao3',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.',
    "user_address": "0x0956e309e65e64519fc17d07eb3da3f30c293680",
    "signer_address": "0x41e4d0D232fe922417127e047cF3801552744158",
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
    id: 'ds5',
    modelName: 'DS5',
    modelSlug: 'ds5',
    modelColor: '#06B6D4', // 青色 (Cyan 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao5',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0xb597b1f7235f2fb3250416f39ad1caf459c9eb58",
    "signer_address": "0xc20BA21AC4705971609d8Ba9B002B6f91662b005",
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
    id: 'zy3',
    modelName: 'ZY3',
    modelSlug: 'zy3',
    modelColor: '#EAB308', // 黄色 (Yellow 500)
    modelIcon: 'Rfg_logo.png',
    uid: 'xiao6',
    initialCapital: DEFAULT_INITIAL_CAPITAL, // 初始本金
    description: 'A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x4d62c2959c06efe620a4e1e95dbe060d56e5f59e",
    "signer_address": "0x7744b0d7f624D00625755FD0e871cA0d752673Db",
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
