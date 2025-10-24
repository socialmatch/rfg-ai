/**
 * New Balance Service - Replacement for Aster Finance Balance API
 * This service handles balance requests to the new API endpoint
 */

import { getAllModelInfo } from '../config/accounts.js'

// Base API URL
const BASE_URL = 'http://15.235.181.47:8002/aster/balance'

/**
 * Get balance data for a single model by UID
 * @param {string} uid - Model UID
 * @returns {Promise<Object>} Balance data response
 */
export const getModelBalance = async (uid) => {
  try {
    console.log(`🔄 Fetching balance for model UID: ${uid}`)
    
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
      console.log(`✅ Balance data fetched successfully for ${uid}:`, {
        totalUsdtValue: data.data.total_usdt_value,
        activeBalances: data.data.active_balances?.length || 0,
        timestamp: data.data.timestamp
      })
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
    console.error(`❌ Failed to fetch balance for ${uid}:`, error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Get balance data for all enabled models
 * @returns {Promise<Object>} Aggregated balance data for all models
 */
export const getAllModelsBalance = async () => {
  try {
    console.log('🔄 Fetching balance data for all enabled models...')
    
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

    console.log(`📊 Fetching balance for ${enabledModels.length} models:`, 
      enabledModels.map(m => `${m.name} (${m.uid})`))

    // Fetch balance data for all models concurrently
    const promises = enabledModels.map(async (model) => {
      const result = await getModelBalance(model.uid)
      return {
        modelInfo: model,
        ...result
      }
    })

    const results = await Promise.allSettled(promises)
    
    // Process results
    const accounts = []
    let successfulCount = 0
    let failedCount = 0

    results.forEach((result, index) => {
      const model = enabledModels[index]
      
      if (result.status === 'fulfilled' && result.value.success) {
        accounts.push({
          modelInfo: model,
          data: result.value.data,
          success: true
        })
        successfulCount++
      } else {
        const error = result.status === 'rejected' 
          ? result.reason.message 
          : result.value.error
        
        console.error(`❌ Failed to fetch balance for ${model.name} (${model.uid}):`, error)
        
        accounts.push({
          modelInfo: model,
          data: null,
          success: false,
          error: error
        })
        failedCount++
      }
    })

    const overallSuccess = successfulCount > 0

    console.log(`✅ Balance data fetching completed:`, {
      totalModels: enabledModels.length,
      successfulCount,
      failedCount,
      overallSuccess
    })

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
  if (balanceData.data.active_balances && balanceData.data.active_balances.length > 0) {
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
