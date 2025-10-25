/**
 * New Positions Service - Replacement for Aster Finance Account API
 * This service handles positions requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'

// Base API URL
const BASE_URL = 'https://testapi1.rfgmeme.ai/aster/positions'

/**
 * Get positions data for a single model by UID
 * @param {string} uid - Model UID
 * @returns {Promise<Object>} Positions data response
 */
export const getModelPositions = async (uid) => {
  try {
    const response = await fetch(`${BASE_URL}/?uid=${uid}`, {
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
    console.error(`❌ Failed to fetch positions for ${uid}:`, error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Get positions data for all enabled models
 * @returns {Promise<Object>} Aggregated positions data for all models
 */
export const getAllModelsPositions = async () => {
  try {
    console.log('🔄 Fetching positions data for all enabled models...')

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
    // Fetch positions data for all models sequentially (one after another)
    console.log(`🔄 Fetching positions data for ${enabledModels.length} models sequentially...`)
    const accounts = []
    let successfulCount = 0
    let failedCount = 0

    for (const model of enabledModels) {
      try {
        const result = await getModelPositions(model.uid)
        console.log(`✅ ${model.name} (${model.uid}): completed`)
        
        if (result.success) {
          accounts.push({
            modelInfo: model,
            data: result.data,
            success: true
          })
          successfulCount++
        } else {
          console.error(`❌ Failed to fetch positions for ${model.name} (${model.uid}):`, result.error)
          accounts.push({
            modelInfo: model,
            data: null,
            success: false,
            error: result.error
          })
          failedCount++
        }
      } catch (error) {
        console.error(`❌ Failed to fetch positions for ${model.name} (${model.uid}):`, error.message)
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
      error: overallSuccess ? null : 'All positions requests failed'
    }
  } catch (error) {
    console.error('❌ Failed to fetch positions data for all models:', error)
    return {
      success: false,
      accounts: [],
      error: error.message
    }
  }
}

/**
 * Process positions data to match the expected format
 * @param {Object} positionsData - Raw positions data from API
 * @returns {Array} Processed positions data
 */
export const processPositionsData = (positionsData) => {
  if (!positionsData || !positionsData.data) {
    return []
  }

  const processedData = []

  // Process positions array
  if (positionsData.data.positions) {
    positionsData.data.positions.forEach(position => {
      processedData.push({
        symbol: position.symbol,
        positionAmt: position.positionAmt,
        entryPrice: position.entryPrice,
        markPrice: position.markPrice,
        unRealizedProfit: position.unRealizedProfit,
        liquidationPrice: position.liquidationPrice,
        leverage: position.leverage,
        maxNotionalValue: position.maxNotionalValue,
        marginType: position.marginType,
        isolatedMargin: position.isolatedMargin,
        isAutoAddMargin: position.isAutoAddMargin,
        positionSide: position.positionSide,
        notional: position.notional,
        isolatedWallet: position.isolatedWallet,
        updateTime: position.updateTime,
        uid: positionsData.data.uid,
        walletName: positionsData.data.wallet_name,
        totalPositions: positionsData.data.total_positions
      })
    })
  }

  return processedData
}

/**
 * Get positions data for all models and process it
 * @returns {Promise<Object>} Processed positions data for all models
 */
export const getAllModelsProcessedPositions = async () => {
  try {
    const result = await getAllModelsPositions()

    if (!result.success) {
      return result
    }

    // Process each account's positions data
    const processedAccounts = result.accounts.map(account => ({
      modelInfo: account.modelInfo,
      data: account.success ? processPositionsData(account) : [],
      success: account.success,
      error: account.error || null
    }))

    return {
      success: result.success,
      accounts: processedAccounts,
      error: result.error
    }
  } catch (error) {
    console.error('❌ Failed to process positions data for all models:', error)
    return {
      success: false,
      accounts: [],
      error: error.message
    }
  }
}

// Export all functions
export default {
  getModelPositions,
  getAllModelsPositions,
  processPositionsData,
  getAllModelsProcessedPositions
}
