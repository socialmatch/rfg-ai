/**
 * 账户配置文件
 * 管理多个交易账户和对应的AI模型
 */

// 账户配置列表
export const ACCOUNT_CONFIGS = [
  {
    id: 'rfg-6',
    modelName: 'RFG-6',
    modelSlug: 'rfg-6',
    modelColor: '#10b981',
    modelIcon: 'Rfg_logo.png',
    uid: 'rfg_ai',
    initialCapital: 10000, // 初始本金 $10,000
    description: 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0xbcd72a4206dff98bf64d6563fa29b5ac45d4095d",
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
    id: 'deepseek-chat-v3-1',
    modelName: 'DEEPSEEK CHAT V3.1',
    modelSlug: 'deepseek-chat-v3-1',
    modelColor: '#3B82F6', // 蓝色
    modelIcon: 'deepseek_logo.png',
    uid: 'deepseek',
    initialCapital: 10000, // 初始本金 $10,000
    description: 'A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).',
    "user_address": "0x5e5d3b8476890ef35fb104a264d738a32d385566",
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
    id: 'rfg-all',
    modelName: 'RFG-ALL',
    modelSlug: 'rfg-all',
    modelColor: '#00ff04', // 橙色
    modelIcon: 'Rfg_logo.png',
    uid: 'rfg_ai_x',
    initialCapital: 10000, // 初始本金 $10,000
    description: 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.',
    "user_address": "0x9362ce38dedefeeb03439d7e36e0949f13ae8aaa",
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
  // {
  //   id: 'gpt-5',
  //   modelName: 'GPT 5',
  //   modelSlug: 'gpt-5',
  //   modelColor: '#c52274', // 绿色
  //   modelIcon: 'GPT_logo.png',
  //   uid: 'gpt',
  //   initialCapital: 10000, // 初始本金 $10,000
  //   "user_address": "0xa4e350536224ec9a62566cfc91814cd5387183b0",
  //   "signer_address": "0x5571BAa2115B01613394d272982E1f2a3E0778ee",
  //   enabled: true,
  //   // 账户余额相关字段（从API获取后会更新）
  //   accountAlias: "GPT5",
  //   asset: "USDT",
  //   balance: "0.00000000",
  //   crossWalletBalance: "0.00000000",
  //   crossUnPnl: "0.00000000",
  //   availableBalance: "0.00000000",
  //   maxWithdrawAmount: "0.00000000",
  //   marginAvailable: true,
  //   updateTime: 0
  // },
  // {
  //   id: 'gemini-2-5-pro',
  //   modelName: 'GEMINI 2.5 PRO',
  //   modelSlug: 'gemini-2-5-pro',
  //   modelColor: '#64748b', // 灰色
  //   modelIcon: 'Gemini_logo.png',
  //   uid: 'gemini',
  //   initialCapital: 10000, // 初始本金 $10,000
  //   "user_address": "0x40743b7420c019832e7b90be608981394d6a220d",
  //   "signer_address": "0xc20BA21AC4705971609d8Ba9B002B6f91662b005",
  //   enabled: true,
  //   // 账户余额相关字段（从API获取后会更新）
  //   accountAlias: "Gemi",
  //   asset: "USDT",
  //   balance: "0.00000000",
  //   crossWalletBalance: "0.00000000",
  //   crossUnPnl: "0.00000000",
  //   availableBalance: "0.00000000",
  //   maxWithdrawAmount: "0.00000000",
  //   marginAvailable: true,
  //   updateTime: 0
  // },
  // {
  //   id: 'grok-4',
  //   modelName: 'GROK 4',
  //   modelSlug: 'grok-4',
  //   modelColor: '#0ee1e6', // 深灰色
  //   modelIcon: 'Grok_logo.png',
  //   uid: 'grok',
  //   initialCapital: 10000, // 初始本金 $10,000
  //   "user_address": "0xc08ebbb03dfa1fc3e240836e04f25c8c0070cd11",
  //   "signer_address": "0x7744b0d7f624D00625755FD0e871cA0d752673Db",
  //   enabled: true,
  //   // 账户余额相关字段（从API获取后会更新）
  //   accountAlias: "Grok",
  //   asset: "USDT",
  //   balance: "0.00000000",
  //   crossWalletBalance: "0.00000000",
  //   crossUnPnl: "0.00000000",
  //   availableBalance: "0.00000000",
  //   maxWithdrawAmount: "0.00000000",
  //   marginAvailable: true,
  //   updateTime: 0
  // },
  {
    id: 'qwen3-max',
    modelName: 'QWEN3 MAX',
    modelSlug: 'qwen3-max',
    modelColor: '#8b5cf6', // 紫色
    modelIcon: 'qwen_logo.png',
    uid: 'qwen',
    initialCapital: 10000, // 初始本金 $10,000
    description: 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
    "user_address": "0x8410f290a7dc296f53ce87921eb1ae4ced07db2d",
    "signer_address": "0x5E5aCc45bE2c81f18e0c627D606BAE9bddD06293",
    enabled: true,
    // 账户余额相关字段（从API获取后会更新）
    accountAlias: "Qwen",
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
