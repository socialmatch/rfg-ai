/**
 * Aster Finance Futures API Service
 * Supports account info query, position query and other functions
 */

import { ethers } from 'ethers'
import { getEnabledAccounts } from '@/config/accounts.js'

// API configuration
const ASTER_API_BASE = 'https://fapi.asterdex.com'

/**
 * Generate Aster Finance signature (correct implementation based on ethers.js)
 * @param {Object} params - Parameter object
 * @param {string} user_address - User address
 * @param {string} signer_address - Signer address
 * @param {string} private_key - Private key
 * @returns {Promise<Object>} Parameter object with signature
 */
const signParams = async (params, user_address, signer_address, private_key) => {
  try {
    // Add necessary parameters
    const timestamp = Math.floor(Date.now() / 1000)
    const recvWindow = 50000

    params.timestamp = timestamp
    params.recvWindow = recvWindow

    // Generate nonce (millisecond timestamp)
    const nonce = Math.floor(Date.now() * 1000)

    // Serialize parameters
    const normalized = stringifyParams(params)
    const jsonStr = JSON.stringify(normalized, Object.keys(normalized).sort())

    console.log('📝 JSON payload:', jsonStr)

    // Use ethers.js AbiCoder encoding
    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'address', 'address', 'uint256'],
      [jsonStr, user_address, signer_address, nonce]
    )

    console.log('🔐 Encoded data:', data)

    const digest = ethers.keccak256(data)
    console.log('🔑 Digest:', digest)

    // Use ethers.js signing
    const wallet = new ethers.Wallet(private_key)
    const digestBytes = ethers.getBytes(digest)
    const signature = await wallet.signMessage(digestBytes)
    console.log('✍️ Signature:', signature)

    // Return parameters with signature
    const signed = { ...normalized }
    signed.nonce = nonce.toString()
    signed.user = user_address
    signed.signer = signer_address
    signed.signature = signature

    return signed
  } catch (error) {
    console.error('Signature generation failed:', error, user_address)
    throw error
  }
}

/**
 * Convert parameters to string format (based on Python example stringify_params function)
 */
const stringifyParams = (params) => {
  const normalized = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'boolean') {
      normalized[key] = value ? 'true' : 'false'
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        normalized[key] = value.toString()
      } else {
        // Float formatting, remove trailing zeros
        normalized[key] = value.toFixed(10).replace(/\.?0+$/, '')
      }
    } else {
      normalized[key] = String(value)
    }
  }

  return normalized
}


/**
 * Generate query string
 * @param {Object} params - Parameter object
 * @returns {string} Query string
 */
const generateQueryString = (params) => {
  const sortedKeys = Object.keys(params).sort()
  return sortedKeys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
}

/**
 * Add timestamp and signature to parameters
 * @param {Object} params - Original parameters
 * @param {Object} accountConfig - Account configuration
 * @returns {Promise<Object>} Parameters with timestamp and signature
 */
const addTimestampAndSignature = async (params, accountConfig) => {
  try {
    // Use new signature function
    const signedParams = await signParams(
      params,
      accountConfig.user_address,
      accountConfig.signer_address,
      ''
    )

    return signedParams
  } catch (error) {
    console.error('Failed to add signature:', error)
    throw error
  }
}

/**
 * Send API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} params - Request parameters
 * @param accountConfig
 * @returns {Promise<Object>} API response
 */
const sendApiRequest = async (endpoint, method = 'GET', params = {}, accountConfig) => {
  try {
    const url = `${ASTER_API_BASE}${endpoint}`
    let requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-MBX-APIKEY': accountConfig.signer_address
      }
    }

    if (method === 'GET') {
      // GET request adds parameters to URL
      const paramsWithAuth = await addTimestampAndSignature(params, accountConfig)
      const queryString = generateQueryString(paramsWithAuth)
      const fullUrl = `${url}?${queryString}`

      console.log('🔍 API request debug info:')
      console.log('URL:', fullUrl)
      console.log('Headers:', requestOptions.headers)
      console.log('Query String:', queryString)

      const response = await fetch(fullUrl, requestOptions)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API error response:', errorText)
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } else {
      // POST/PUT/DELETE request puts parameters in body
      const paramsWithAuth = await addTimestampAndSignature(params, accountConfig)
      const formData = new URLSearchParams()

      Object.entries(paramsWithAuth).forEach(([key, value]) => {
        formData.append(key, value)
      })

      requestOptions.body = formData

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    }
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

/**
 * 获取单个账户信息
 * @param {Object} accountConfig - 账户配置
 * @returns {Promise<Object>} 账户信息
 */
export const getAccountInfo = async (accountConfig) => {
  try {
    // Try using real API
    try {
      const accountInfo = await sendApiRequest('/fapi/v3/account', 'GET', {}, accountConfig)
      return {
        success: true,
        data: accountInfo,
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    } catch (apiError) {
      console.warn(`⚠️ ${accountConfig.modelName}真实API调用失败:`, apiError.message)

      return {
        success: false,
        error: apiError.message,
        data: {
          canTrade: false,
          totalWalletBalance: '0.00000000',
          totalUnrealizedProfit: '0.00000000',
          totalMarginBalance: '0.00000000',
          totalPositionInitialMargin: '0.00000000',
          totalOpenOrderInitialMargin: '0.00000000',
          totalCrossWalletBalance: '0.00000000',
          totalCrossUnPnl: '0.00000000',
          availableBalance: '0.00000000',
          maxWithdrawAmount: '0.00000000',
          assets: [],
          positions: []
        },
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`❌ 获取${accountConfig.modelName}账户信息失败:`, error)
    return {
      success: false,
      error: error.message,
      data: null,
      modelInfo: {
        id: accountConfig.id,
        name: accountConfig.modelName,
        slug: accountConfig.modelSlug,
        color: accountConfig.modelColor
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取所有账户信息
 * @returns {Promise<Array>} 所有账户信息
 */
export const getAllAccountsInfo = async () => {
  try {
    console.log('正在获取所有账户信息...')

    const enabledAccounts = getEnabledAccounts()
    const accountPromises = enabledAccounts.map(accountConfig =>
      getAccountInfo(accountConfig)
    )

    const results = await Promise.allSettled(accountPromises)

    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value)

    const failedResults = results
      .filter(result => result.status === 'rejected' || !result.value.success)
      .map(result => result.status === 'rejected' ? result.reason : result.value)
    if (failedResults.length > 0) {
      console.warn(`⚠️ ${failedResults.length}个账户信息获取失败`)
    }

    return {
      success: true,
      accounts: successfulResults,
      failed: failedResults,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ 获取所有账户信息失败:', error)
    return {
      success: false,
      error: error.message,
      accounts: [],
      failed: [],
      timestamp: new Date().toISOString()
    }
  }
}



/**
 * 获取账户资产信息
 * @returns {Promise<Object>} 资产信息
 */
export const getAccountAssets = async () => {
  try {
    const result = await getAccountInfo()

    if (!result.success) {
      return result
    }

    const assets = result.data.assets || []

    return {
      success: true,
      data: {
        totalWalletBalance: result.data.totalWalletBalance,
        totalUnrealizedProfit: result.data.totalUnrealizedProfit,
        availableBalance: result.data.availableBalance,
        maxWithdrawAmount: result.data.maxWithdrawAmount,
        assets: assets
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ 获取账户资产失败:', error)
    return {
      success: false,
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取持仓信息
 * @returns {Promise<Object>} 持仓信息
 */
export const getPositions = async () => {
  try {
    const result = await getAccountInfo()

    if (!result.success) {
      return result
    }

    const positions = result.data.positions || []

    // 过滤掉持仓数量为0的仓位
    const activePositions = positions.filter(position =>
      parseFloat(position.positionAmt) !== 0
    )

    return {
      success: true,
      data: {
        totalPositions: positions.length,
        activePositions: activePositions.length,
        positions: activePositions
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ 获取持仓信息失败:', error)
    return {
      success: false,
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取特定账户的持仓信息
 * @param {Object} accountConfig - 账户配置
 * @returns {Promise<Object>} 持仓信息
 */
export const getAccountPositions = async (accountConfig) => {
  try {
    try {
      const result = await getAccountInfo(accountConfig)

      if (!result.success) {
        return result
      }

      const positions = result.data.positions || []

      // 过滤掉持仓数量为0的仓位
      const activePositions = positions.filter(position =>
        parseFloat(position.positionAmt) !== 0
      )
      return {
        success: true,
        data: {
          totalPositions: positions.length,
          activePositions: activePositions.length,
          positions: activePositions
        },
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    } catch (apiError) {
      console.warn(`⚠️ ${accountConfig.modelName}真实API持仓调用失败:`, apiError.message)

      return {
        success: false,
        error: apiError.message,
        data: {
          totalPositions: 0,
          activePositions: 0,
          positions: []
        },
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`❌ 获取${accountConfig.modelName}账户持仓失败:`, error)
    return {
      success: false,
      error: error.message,
      data: {
        totalPositions: 0,
        activePositions: 0,
        positions: []
      },
      modelInfo: {
        id: accountConfig.id,
        name: accountConfig.modelName,
        slug: accountConfig.modelSlug,
        color: accountConfig.modelColor
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取账户概览信息
 * @returns {Promise<Object>} 账户概览
 */
export const getAccountOverview = async () => {
  try {
    const result = await getAccountInfo()

    if (!result.success) {
      return result
    }

    const accountData = result.data

    return {
      success: true,
      data: {
        // 基本状态
        canTrade: accountData.canTrade,
        canDeposit: accountData.canDeposit,
        canWithdraw: accountData.canWithdraw,

        // 资金信息
        totalWalletBalance: accountData.totalWalletBalance,
        totalUnrealizedProfit: accountData.totalUnrealizedProfit,
        totalMarginBalance: accountData.totalMarginBalance,
        availableBalance: accountData.availableBalance,
        maxWithdrawAmount: accountData.maxWithdrawAmount,

        // 保证金信息
        totalInitialMargin: accountData.totalInitialMargin,
        totalMaintMargin: accountData.totalMaintMargin,

        // 资产和持仓统计
        assetsCount: accountData.assets?.length || 0,
        positionsCount: accountData.positions?.length || 0,
        activePositionsCount: accountData.positions?.filter(p => parseFloat(p.positionAmt) !== 0).length || 0,

        // 更新时间
        updateTime: accountData.updateTime
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ 获取账户概览失败:', error)
    return {
      success: false,
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 测试API连接
 * @returns {Promise<Object>} 测试结果
 */
export const testApiConnection = async () => {
  try {
    console.log('🧪 测试Aster Finance API连接...')

    const result = await getAllAccountsInfo()

    if (result.success) {
      console.log('✅ API连接测试成功')
      return {
        success: true,
        message: 'API连接正常',
        accounts: result.accounts,
        failed: result.failed,
        totalAccounts: result.accounts.length + result.failed.length,
        successCount: result.accounts.length,
        failedCount: result.failed.length
      }
    } else {
      console.log('❌ API连接测试失败')
      return {
        success: false,
        message: 'API连接失败',
        error: result.error
      }
    }
  } catch (error) {
    console.error('❌ API连接测试异常:', error)
    return {
      success: false,
      message: 'API连接异常',
      error: error.message
    }
  }
}

/**
 * 获取单个账户的交易历史
 * @param {Object} accountConfig - 账户配置
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 交易历史数据
 */
export const getUserTrades = async (accountConfig, params = {}) => {
  try {
    // 设置默认参数
    const defaultParams = {
      limit: 10000, // 默认获取1000条记录
      ...params
    }

    // Try using real API
    try {
      const userTrades = await sendApiRequest('/fapi/v3/userTrades', 'GET', defaultParams, accountConfig)
      return {
        success: true,
        data: userTrades || [],
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    } catch (apiError) {
      console.warn(`⚠️ ${accountConfig.modelName}真实API交易历史调用失败:`, apiError.message)

      return {
        success: false,
        error: apiError.message,
        data: [],
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`❌ 获取${accountConfig.modelName}账户交易历史失败:`, error)
    return {
      success: false,
      error: error.message,
      data: [],
      modelInfo: {
        id: accountConfig.id,
        name: accountConfig.modelName,
        slug: accountConfig.modelSlug,
        color: accountConfig.modelColor
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取所有账户的交易历史
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 所有账户交易历史数据
 */
export const getAllAccountsUserTrades = async (params = {}) => {
  try {
    console.log('正在获取所有账户交易历史...')
    const enabledAccounts = getEnabledAccounts()
    const tradesPromises = enabledAccounts.map(accountConfig =>
      getUserTrades(accountConfig, params)
    )
    const results = await Promise.allSettled(tradesPromises)
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value)
    const failedResults = results
      .filter(result => result.status === 'rejected' || !result.value.success)
      .map(result => result.status === 'rejected' ? result.reason : result.value)
    if (failedResults.length > 0) {
      console.warn(`⚠️ ${failedResults.length}个账户交易历史获取失败`)
    }

    return {
      success: true,
      accounts: successfulResults,
      failed: failedResults,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ 获取所有账户交易历史失败:', error)
    return {
      success: false,
      error: error.message,
      accounts: [],
      failed: [],
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取单个账户的余额信息
 * @param {Object} accountConfig - 账户配置
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 账户余额数据
 */
export const getAccountBalance = async (accountConfig, params = {}) => {
  try {
    const defaultParams = {
      ...params
    }

    try {
      const balance = await sendApiRequest('/fapi/v3/balance', 'GET', defaultParams, accountConfig)

      return {
        success: true,
        data: balance || [],
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    } catch (apiError) {
      console.warn(`⚠️ ${accountConfig.modelName}真实API余额调用失败:`, apiError.message)
      return {
        success: false,
        error: apiError.message,
        data: [],
        modelInfo: {
          id: accountConfig.id,
          name: accountConfig.modelName,
          slug: accountConfig.modelSlug,
          color: accountConfig.modelColor
        },
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`❌ 获取${accountConfig.modelName}账户余额失败:`, error)
    return {
      success: false,
      error: error.message,
      data: [],
      modelInfo: {
        id: accountConfig.id,
        name: accountConfig.modelName,
        slug: accountConfig.modelSlug,
        color: accountConfig.modelColor
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取所有账户的余额信息
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 所有账户余额数据
 */
export const getAllAccountsBalance = async (params = {}) => {
  try {
    console.log('正在获取所有账户余额...')
    const enabledAccounts = getEnabledAccounts()
    const balancePromises = enabledAccounts.map(accountConfig =>
      getAccountBalance(accountConfig, params)
    )
    const results = await Promise.allSettled(balancePromises)
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value)
    const failedResults = results
      .filter(result => result.status === 'rejected' || !result.value.success)
      .map(result => result.status === 'rejected' ? result.reason : result.value)
    if (failedResults.length > 0) {
      console.warn(`⚠️ ${failedResults.length}个账户余额获取失败`)
    }

    return {
      success: true,
      accounts: successfulResults,
      failed: failedResults,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ 获取所有账户余额失败:', error)
    return {
      success: false,
      error: error.message,
      accounts: [],
      failed: [],
      timestamp: new Date().toISOString()
    }
  }
}

// 导出默认对象
export default {
  getAccountInfo,
  getAllAccountsInfo,
  getAccountAssets,
  getPositions,
  getAccountPositions,
  getAccountOverview,
  testApiConnection,
  getUserTrades,
  getAllAccountsUserTrades,
  getAccountBalance,
  getAllAccountsBalance
}
