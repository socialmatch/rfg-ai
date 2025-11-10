/**
 * New Balance Service - Replacement for Aster Finance Balance API
 * This service handles balance requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'
import { getCachedApiData, setCachedApiData, getAllModelsCachedData } from '../utils/dataCache.js'

// Base API URL
const BASE_URL = `${import.meta.env.VITE_APP_SERVER_URL}/aster/balance`
const defaultResData = (uid) => {
  return {
    "uid": 'uid',
    "wallet_name": uid,
    "mark": uid,
    "available_cash": 0,
    "total_value": 0,
    "total_assets": 0,
    "account_summary": "",
    "balances": [],
    "active_balances": [],
    "timestamp": 0
  }
}
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
        data: defaultResData(uid),
        error: data.message || 'Unknown API error',
        fromCache: false
      }
    }
  } catch (error) {
    console.error(`❌ Failed to fetch balance for ${uid}:`, error)
    return {
      success: false,
      data: defaultResData(uid),
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

    // Check if all models have cached data (no TTL check, always use cache if available)
    if (!skipCache) {
      const allModelsHaveCache = enabledModels.every(model => {
        return getCachedApiData('aster/balance', model.uid) !== null
      })

      if (allModelsHaveCache) {
        console.log(`✅ Using cached balance for all ${enabledModels.length} models`)
        const results = []
        enabledModels.forEach(model => {
          const cached = getCachedApiData('aster/balance', model.uid)
          if (cached) {
            results.push({
              modelInfo: model,
              data: cached,
              success: true
            })
          }
        })
        return {
          success: true,
          accounts: results
        }
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
            data: defaultResData(model.uid),
            success: false,
            error: result.error
          })
          failedCount++
        }
      } catch (error) {
        console.error(`❌ Failed to fetch balance for ${model.name} (${model.uid}):`, error.message)
        accounts.push({
          modelInfo: model,
          data: defaultResData(model.uid),
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

  // New API structure: directly use data from response
  const data = balanceData.data

  // Create a USDT balance entry from the new structure
  processedData.push({
    "accountAlias": data.mark || "",
    "asset": "USDT",
    "balance": data.total_value ? data.total_value.toString() : "0",
    "crossWalletBalance": data.total_value ? data.total_value.toString() : "0",
    "crossUnPnl": (data.total_value - data.available_cash) ? (data.total_value - data.available_cash).toString() : "0",
    "availableBalance": data.available_cash ? data.available_cash.toString() : "0",
    "maxWithdrawAmount": data.available_cash ? data.available_cash.toString() : "0",
    "marginAvailable": true,
    "updateTime": data.timestamp || 0,
    "totalUsdtValue": data.total_value || 0,
    "uid": data.uid,
    "walletName": data.wallet_name,
    // New fields for POSITIONS display
    "availableCash": data.available_cash || 0,
    "totalValue": data.total_value || 0
  })

  return processedData
}

/**
 * Get balance data for all models and process it
 * @returns {Promise<Object>} Processed balance data for all models
 */
export const getAllModelsProcessedBalance = async (skipCache = false) => {
  try {
    const result = await getAllModelsBalance(skipCache)

    if (!result.success) {
      return result
    }

    // Process each account's balance data
    const processedAccounts = result.accounts.map(account => ({
      modelInfo: account.modelInfo,
      data: account.success ? processBalanceData({ data: account.data }) : [],
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
