/**
 * New Trades Service - Replacement for Aster Finance UserTrades API
 * This service handles trades requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'

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
export const getModelTrades = async (uid, symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT) => {
  try {
    // const response = await fetch(`${BASE_URL}/${uid}?symbol=${symbol}&limit=${limit}`, {
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
      return {
        success: true,
        data: data.data,
        error: null
      }
    } else {
      console.error(`❌ API returned error for ${uid}:`, data.message)
      return {
        success: false,
        data: null,
        error: data.message || 'Unknown API error'
      }
    }
  } catch (error) {
    console.error(`❌ Failed to fetch trades for ${uid}:`, error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Get trades data for all enabled models
 * @param {string} symbol - Trading symbol (default: BTCUSDT)
 * @param {number} limit - Number of trades to fetch (default: 25)
 * @returns {Promise<Object>} Aggregated trades data for all models
 */
export const getAllModelsTrades = async (symbol = DEFAULT_SYMBOL, limit = DEFAULT_LIMIT) => {
  try {
    console.log('🔄 Fetching trades data for all enabled models...')

    // Get all enabled models with UID
    const enabledModels = getAllModelInfo().filter(model => model.enabled && model.uid)

    if (enabledModels.length === 0) {
      console.warn('⚠️ No enabled models with UID found')
      return {
        success: false,
        accounts: [],
        error: 'No ISO 4217 currency code models with UID found'
      }
    }

    // Fetch trades data for all models sequentially (one after another)
    console.log(`🔄 Fetching trades data for ${enabledModels.length} models sequentially...`)
    const accounts = []
    let successfulCount = 0
    let failedCount = 0

    for (const model of enabledModels) {
      try {
        const result = await getModelTrades(model.uid, symbol, limit)
        console.log(`✅ ${model.name} (${model.uid}): completed`)
        
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

  // Process trades array
  if (tradesData.data.trades) {
    tradesData.data.trades.forEach(trade => {
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
