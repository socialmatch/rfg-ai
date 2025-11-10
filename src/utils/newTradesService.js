/**
 * New Trades Service - Replacement for Aster Finance UserTrades API
 * This service handles trades requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'
import { getCachedApiData, setCachedApiData, getAllModelsCachedData } from '../utils/dataCache.js'

// Base API URL
const BASE_URL = 'https://testapi1.rfgmeme.ai/aster/closed-trades'

// Default parameters
const DEFAULT_SYMBOL = 'BTCUSDT'
const DEFAULT_LIMIT = 10000

/**
 * Get trades data for a single model by UID
 * @param {string} uid - Model UID
 * @param {string} symbol - Trading symbol (default: BTCUSDT)
 * @param {number} limit - Number of trades to fetch (default: 25)
 * @returns {Promise<Object>} Trades data response
 */
export const getModelTrades = async (uid, symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT, skipCache = false) => {
  const API_NAME = 'aster/closed-trades'

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
    const response = await fetch(`${BASE_URL}?uid=${uid}&limit=${limit}`, {
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
      const normalizedData = {
        trades: Array.isArray(data?.data?.trades) ? data.data.trades : [],
        query_params: data?.data?.query_params || { uid, limit },
        uid,
        wallet_name: Array.isArray(data?.data?.trades) && data.data.trades.length > 0
          ? data.data.trades[0].wallet_name
          : uid,
        total_trades: Array.isArray(data?.data?.trades) ? data.data.trades.length : 0,
        statistics: data?.data?.statistics || null
      }

      // Cache the result
      setCachedApiData(API_NAME, uid, normalizedData)

      return {
        success: true,
        data: normalizedData,
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
        return getCachedApiData('aster/closed-trades', model.uid) !== null
      })

      if (allModelsHaveCache) {
        console.log(`✅ Using cached trades for all ${enabledModels.length} models`)
        const results = []
        enabledModels.forEach(model => {
          const cached = getCachedApiData('aster/closed-trades', model.uid)
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
export const processTradesData = (tradesData, modelInfo = null) => {
  const data = tradesData?.data || tradesData || {}
  const tradesArray = Array.isArray(data.trades) ? data.trades : []

  if (!tradesArray || tradesArray.length === 0) {
    return []
  }

  const processedData = []
  const uid = modelInfo?.uid || data.uid || data.query_params?.uid || tradesArray[0]?.wallet_name || null
  const walletName = tradesArray[0]?.wallet_name || modelInfo?.modelSlug || uid || ''
  const totalTrades = data.total_trades || tradesArray.length
  const statistics = data.statistics || null

  tradesArray.forEach(trade => {
    const direction = (trade.direction || '').toUpperCase()
    const side = direction === 'SHORT' ? 'SELL' : direction === 'LONG' ? 'BUY' : (trade.side || 'BUY')
    const quantity = parseFloat(trade.quantity ?? trade.qty ?? 0)
    const entryPrice = parseFloat(trade.entry_price ?? trade.price ?? 0)
    const exitPrice = parseFloat(trade.exit_price ?? trade.exitPrice ?? entryPrice)
    const realizedPnl = parseFloat(trade.net_pnl ?? trade.realizedPnl ?? 0)

    if (!realizedPnl || realizedPnl === 0) {
      return
    }

    const commission = parseFloat(trade.fees_total ?? trade.commission ?? 0)
    const timestamp = trade.created_at ? new Date(trade.created_at).getTime() : (trade.time ?? Date.now())
    const quoteQty = !isNaN(entryPrice) && !isNaN(quantity) ? entryPrice * quantity : parseFloat(trade.quoteQty ?? 0)

    processedData.push({
      symbol: trade.symbol,
      id: trade.id ?? trade.trade_id,
      orderId: trade.trade_id ?? trade.orderId,
      side,
      direction: direction || null,
      price: entryPrice,
      entryPrice,
      exitPrice,
      qty: quantity,
      quantity,
      realizedPnl,
      grossPnl: parseFloat(trade.gross_pnl ?? trade.grossPnl ?? realizedPnl),
      marginAsset: trade.marginAsset || 'USDT',
      quoteQty,
      commission,
      commissionAsset: trade.commissionAsset || 'USDT',
      time: timestamp,
      createdAt: trade.created_at || null,
      positionSide: direction || null,
      holdingTime: trade.holding_time || null,
      buyer: trade.buyer ?? null,
      maker: trade.maker ?? null,
      uid,
      walletName,
      totalTrades,
      statistics
    })
  })

  return processedData
}

/**
 * Get trades data for all models and process it
 * @param {string} symbol - Trading symbol (default: BTCUSDT)
 * @param {number} limit - Number of trades to fetch (default: 25)
 * @returns {Promise<Object>} Processed trades data for all models
 */
export const getAllModelsProcessedTrades = async (symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT, skipCache = false) => {
  try {
    const result = await getAllModelsTrades(symbol, limit, skipCache)

    if (!result.success) {
      return result
    }

    // Process each account's trades data
    const processedAccounts = result.accounts.map(account => ({
      modelInfo: account.modelInfo,
      data: account.success ? processTradesData(account, account.modelInfo) : [],
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
