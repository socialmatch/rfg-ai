/**
 * New Balance Service - Replacement for Aster Finance Balance API
 * This service handles balance requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'
import { getCachedApiData, setCachedApiData, getAllModelsCachedData } from '../utils/dataCache.js'

// Base API URL
const BASE_URL = 'https://testapi1.rfgmeme.ai/aster/balance'

/**
 * Get balance data for a single model by UID
 * @param {string} uid - Model UID
 * @param {boolean} skipCache - Skip cache check (default: false)
 * @returns {Promise<Object>} Balance data response
 */
export const getModelBalance = async (uid, skipCache = false) => {
  const API_NAME = 'aster/balance'
  
  // Check cache first if not skipping
  if (!skipCache) {
    const cached = getCachedApiData(API_NAME, uid)
    if (cached) {
      console.log(`✅ Using cached balance for ${uid}`)
      return {
        success: true,
        data: cached,
        error: null,
        fromCache: true
      }
    }
  }
  
  try {
    console.log(`🔄 Fetching balance for ${uid}...`)
    const response = await fetch(`${BASE_URL}/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      // Cache the result
      setCachedApiData(API_NAME, uid, data.data)
      
      return {
        success: true,
        data: data.data,
        error: null,
        fromCache: false
      }
    } else {
      console.error(`❌ API returned error for ${uid}:`, data.message)
      return {
        success: false,
        data: null,
        error: data.message || 'Unknown API error',
        fromCache: false
      }
    }
  } catch (error) {
    console.error(`❌ Failed to fetch balance for ${uid}:`, error)
    return {
      success: false,
      data: null,
      error: error.message,
      fromCache: false
    }
  }
}

/**
 * Get balance data for all enabled models
 * @param {boolean} skipCache - Skip cache check (default: false)
 * @returns {Promise<Object>} Aggregated balance data for all models
 */
export const getAllModelsBalance = async (skipCache = false) => {
  try {
    // Get all enabled models with UID
    const enabledModels = getAllModelInfo().filter(model => model.enabled && model.uid)

    if (enabledModels.length === 0) {
      console.warn('⚠️ No enabled models with UID found')
      return {
        success: false,
        accounts: [],
        error: 'No enabled models with UID found'
      }
    }
    
    // Check if all models have cached data
    if (!skipCache) {
      const cachedResult = getAllModelsCachedData('aster/balance', enabledModels)
      if (cachedResult) {
        console.log(`✅ Using cached balance for all ${enabledModels.length} models`)
        return cachedResult
      }
    }
    
    // Fetch balance data for all models sequentially
    console.log(`🔄 Fetching balance for ${enabledModels.length} models...`)
    const accounts = []
    let successfulCount = 0
    let failedCount = 0

    for (const model of enabledModels) {
      try {
        const result = await getModelBalance(model.uid, skipCache)
        console.log(`✅ ${model.name} (${model.uid}): ${result.fromCache ? 'from cache' : 'fetched'}`)
        
        if (result.success) {
          accounts.push({
            modelInfo: model,
            data: result.data,
            success: true
          })
          successfulCount++
        } else {
          console.error(`❌ Failed to fetch balance for ${model.name} (${model.uid}):`, result.error)
          accounts.push({
            modelInfo: model,
            data: null,
            success: false,
            error: result.error
          })
          failedCount++
        }
      } catch (error) {
        console.error(`❌ Failed to fetch balance for ${model.name} (${model.uid}):`, error.message)
        accounts.push({
          modelInfo: model,
          data: null,
          success: false,
          error: error.message
        })
        failedCount++
      }
    }

    const overallSuccess = successfulCount > 0
    return {
      success: overallSuccess,
      accounts,
      error: overallSuccess ? null : 'All balance requests failed'
    }
  } catch (error) {
    console.error('❌ Failed to fetch balance data for all models:', error)
    return {
      success: false,
      accounts: [],
      error: error.message
    }
  }
}

/**
 * Process balance data to match the expected format
 * @param {Object} balanceData - Raw balance data from API
 * @returns {Object} Processed balance data
 */
export const processBalanceData = (balanceData) => {
  if (!balanceData || !balanceData.data) {
    return []
  }

  const processedData = []

  // Process active balances (USDT balance)
  if (balanceData.data.active_balances) {
    console.log('Processing active balances...', balanceData.data.active_balances)
    if (balanceData.data.active_balances.length > 0) {
      balanceData.data.active_balances.forEach(balance => {
        if (balance.asset === 'USDT') {
          processedData.push({
            accountAlias: balance.accountAlias,
            asset: balance.asset,
            balance: balance.balance,
            crossWalletBalance: balance.crossWalletBalance,
            crossUnPnl: balance.crossUnPnl,
            availableBalance: balance.availableBalance,
            maxWithdrawAmount: balance.maxWithdrawAmount,
            marginAvailable: balance.marginAvailable,
            updateTime: balance.updateTime,
            totalUsdtValue: balanceData.data.total_usdt_value,
            uid: balanceData.data.uid,
            walletName: balanceData.data.wallet_name
          })
        }
      })
    } else {
      processedData.push({
        "accountAlias": "",
        "asset": "USDT",
        "balance": "0",
        "crossWalletBalance": "0",
        "crossUnPnl": "0",
        "availableBalance": "0",
        "maxWithdrawAmount": "0",
        "marginAvailable": true,
        "updateTime": 0,
        "uid": balanceData.data.uid,
        "walletName": balanceData.data.wallet_name
      })
    }
  } else {
    console.warn('⚠️ No active balances found', balanceData.data.uid)
    processedData.push({
      "accountAlias": "",
      "asset": "USDT",
      "balance": "0",
      "crossWalletBalance": "0",
      "crossUnPnl": "0",
      "availableBalance": "0",
      "maxWithdrawAmount": "0",
      "marginAvailable": true,
      "updateTime": 0,
      "uid": balanceData.data.uid,
      "walletName": balanceData.data.wallet_name
    })
  }
  return processedData
}

/**
 * Get balance data for all models and process it
 * @returns {Promise<Object>} Processed balance data for all models
 */
export const getAllModelsProcessedBalance = async () => {
  try {
    const result = await getAllModelsBalance()

    if (!result.success) {
      return result
    }

    // Process each account's balance data
    const processedAccounts = result.accounts.map(account => ({
      modelInfo: account.modelInfo,
      data: account.success ? processBalanceData(account) : [],
      success: account.success,
      error: account.error || null
    }))

    return {
      success: result.success,
      accounts: processedAccounts,
      error: result.error
    }
  } catch (error) {
    console.error('❌ Failed to process balance data for all models:', error)
    return {
      success: false,
      accounts: [],
      error: error.message
    }
  }
}

// Export all functions
export default {
  getModelBalance,
  getAllModelsBalance,
  processBalanceData,
  getAllModelsProcessedBalance
}
