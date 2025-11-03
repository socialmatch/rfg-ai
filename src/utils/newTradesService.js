/**
 * New Trades Service - Replacement for Aster Finance UserTrades API
 * This service handles trades requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'
import { getCachedApiData, setCachedApiData, getAllModelsCachedData } from '../utils/dataCache.js'

// Base API URL
const BASE_URL = 'https://testapi1.rfgmeme.ai/aster/trades'

// Default parameters
const DEFAULT_SYMBOL = 'BTCUSDT'
const DEFAULT_LIMIT = 1000

/**
 * Get trades data for a single model by UID
 * @param {string} uid - Model UID
 * @param {string} symbol - Trading symbol (default: BTCUSDT)
 * @param {number} limit - Number of trades to fetch (default: 25)
 * @returns {Promise<Object>} Trades data response
 */
export const getModelTrades = async (uid, symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT, skipCache = false) => {
  const API_NAME = 'aster/trades'
  
  // Check cache first if not skipping
  if (!skipCache) {
    const cached = getCachedApiData(API_NAME, uid)
    if (cached) {
      console.log(`✅ Using cached trades for ${uid}`)
      return {
        success: true,
        data: cached,
        error: null,
        fromCache: true
      }
    }
  }
  
  try {
    console.log(`🔄 Fetching trades for ${uid}...`)
    const response = await fetch(`${BASE_URL}/${uid}?symbol=&limit=${limit}`, {
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
    console.error(`❌ Failed to fetch trades for ${uid}:`, error)
    return {
      success: false,
      data: null,
      error: error.message,
      fromCache: false
    }
  }
}

/**
 * Get trades data for all enabled models
 * @param {string} symbol - Trading symbol (default: BTCUSDT)
 * @param {number} limit - Number of trades to fetch (default: 25)
 * @returns {Promise<Object>} Aggregated trades data for all models
 */
export const getAllModelsTrades = async (symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT, skipCache = false) => {
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
        return getCachedApiData('aster/trades', model.uid) !== null
      })
      
      if (allModelsHaveCache) {
        console.log(`✅ Using cached trades for all ${enabledModels.length} models`)
        const results = []
        enabledModels.forEach(model => {
          const cached = getCachedApiData('aster/trades', model.uid)
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
    
    // Fetch trades data for all models sequentially
    console.log(`🔄 Fetching trades for ${enabledModels.length} models...`)
    const accounts = []
    let successfulCount = 0
    let failedCount = 0

    for (const model of enabledModels) {
      try {
        const result = await getModelTrades(model.uid, symbol, limit, skipCache)
        console.log(`✅ ${model.name} (${model.uid}): ${result.fromCache ? 'from cache' : 'fetched'}`)
        
        if (result.success) {
          accounts.push({
            modelInfo: model,
            data: result.data,
            success: true
          })
          successfulCount++
        } else {
          console.error(`❌ Failed to fetch trades for ${model.name} (${model.uid}):`, result.error)
          accounts.push({
            modelInfo: model,
            data: null,
            success: false,
            error: result.error
          })
          failedCount++
        }
      } catch (error) {
        console.error(`❌ Failed to fetch trades for ${model.name} (${model.uid}):`, error.message)
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
      error: overallSuccess ? null : 'All trades requests failed'
    }
  } catch (error) {
    console.error('❌ Failed to fetch trades data for all models:', error)
    return {
      success: false,
      accounts: [],
      error: error.message
    }
  }
}

/**
 * Process trades data to match the expected format
 * @param {Object} tradesData - Raw trades data from API
 * @returns {Array} Processed trades data
 */
export const processTradesData = (tradesData) => {
  if (!tradesData || !tradesData.data) {
    return []
  }

  const processedData = []

  // Process trades array, filter out trades with realizedPnl === 0
  if (tradesData.data.trades) {
    tradesData.data.trades.forEach(trade => {
      // Filter out trades where realizedPnl is 0
      const realizedPnl = parseFloat(trade.realizedPnl)
      if (realizedPnl === 0) {
        return // Skip this trade
      }
      
      processedData.push({
        symbol: trade.symbol,
        id: trade.id,
        orderId: trade.orderId,
        side: trade.side,
        price: trade.price,
        qty: trade.qty,
        realizedPnl: trade.realizedPnl,
        marginAsset: trade.marginAsset,
        quoteQty: trade.quoteQty,
        commission: trade.commission,
        commissionAsset: trade.commissionAsset,
        time: trade.time,
        positionSide: trade.positionSide,
        buyer: trade.buyer,
        maker: trade.maker,
        uid: tradesData.data.uid,
        walletName: tradesData.data.wallet_name,
        totalTrades: tradesData.data.total_trades,
        statistics: tradesData.data.statistics
      })
    })
  }

  return processedData
}

/**
 * Get trades data for all models and process it
 * @param {string} symbol - Trading symbol (default: BTCUSDT)
 * @param {number} limit - Number of trades to fetch (default: 25)
 * @returns {Promise<Object>} Processed trades data for all models
 */
export const getAllModelsProcessedTrades = async (symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT) => {
  try {
    const result = await getAllModelsTrades(symbol, limit)

    if (!result.success) {
      return result
    }

    // Process each account's trades data
    const processedAccounts = result.accounts.map(account => ({
      modelInfo: account.modelInfo,
      data: account.success ? processTradesData(account) : [],
      success: account.success,
      error: account.error || null
    }))

    return {
      success: result.success,
      accounts: processedAccounts,
      error: result.error
    }
  } catch (error) {
    console.error('❌ Failed to process trades data for all models:', error)
    return {
      success: false,
      accounts: [],
      error: error.message
    }
  }
}

// Export all functions
export default {
  getModelTrades,
  getAllModelsTrades,
  processTradesData,
  getAllModelsProcessedTrades
}
