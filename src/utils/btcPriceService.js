/**
 * BTC Price Service
 * Handles BTC price data requests from Aster Finance
 */

// Base API URL
const BASE_URL = 'https://fapi.asterdex.com/fapi/v3'

/**
 * Get BTC price data from Aster Finance markPriceKlines API
 * @param {string} symbol - Trading pair symbol (default: BTCUSDT)
 * @param {string} interval - Time interval (default: 5m)
 * @param {number} limit - Number of records to fetch (default: 500)
 * @returns {Promise<Object>} BTC price data response
 */
export const getBtcPriceData = async (symbol = 'BTCUSDT', interval = '5m', limit = 500) => {
  try {
    console.log(`🔄 Fetching BTC price data for ${symbol} with interval ${interval}, limit ${limit}`)
    
    const url = new URL(`${BASE_URL}/markPriceKlines`)
    url.searchParams.append('symbol', symbol)
    url.searchParams.append('interval', interval)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`BTC price API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log(`✅ BTC price data fetched successfully:`, {
      dataLength: data.length,
      symbol: symbol,
      interval: interval,
      limit: limit
    })
    
    return {
      success: true,
      data: data,
      symbol: symbol,
      interval: interval,
      error: null
    }
  } catch (error) {
    console.error(`❌ Failed to get BTC price data:`, error)
    return {
      success: false,
      data: [],
      symbol: symbol,
      interval: interval,
      error: error.message
    }
  }
}

/**
 * Process BTC price data for chart display
 * @param {Array} priceData - Raw BTC price data from API
 * @param {Array} modelLabels - Model data time labels to align with
 * @returns {Object} Processed BTC price data for chart
 */
export const processBtcPriceData = (priceData, modelLabels = null) => {
  try {
    if (!priceData || priceData.length === 0) {
      return {
        labels: [],
        data: []
      }
    }

    // Process price data
    const labels = []
    const data = []

    // Calculate BTC quantity based on first model data time
    let firstPrice = null
    let btcQuantity = 0
    
    if (modelLabels && modelLabels.length > 0) {
      // Find the BTC price at the first model data time
      const firstModelTime = new Date(modelLabels[0]).getTime()
      let minDiff = Infinity
      
      priceData.forEach(candle => {
        const candleTime = candle[0]
        const diff = Math.abs(candleTime - firstModelTime)
        if (diff < minDiff) {
          minDiff = diff
          firstPrice = parseFloat(candle[4]) // Close price at the closest time
        }
      })
      
      if (firstPrice) {
        btcQuantity = 10000 / firstPrice // BTC quantity bought with $10,000
      }
    } else {
      // Fallback to first BTC price if no model labels provided
      firstPrice = parseFloat(priceData[0][4])
      btcQuantity = 10000 / firstPrice
    }
    
    console.log(`🔍 BTC calculation:`, {
      firstPrice: firstPrice,
      btcQuantity: btcQuantity,
      initialInvestment: 10000,
      firstModelTime: modelLabels ? modelLabels[0] : 'N/A'
    })

    priceData.forEach(candle => {
      // Extract timestamp (open time)
      const timestamp = candle[0]
      // Extract close price (current price)
      const closePrice = parseFloat(candle[4])
      
      // Calculate current value: BTC quantity * current price
      const currentValue = btcQuantity * closePrice
      
      labels.push(new Date(timestamp).toISOString())
      data.push(currentValue)
    })

    console.log(`🔍 Processed BTC price data:`, {
      labelsCount: labels.length,
      dataLength: data.length,
      firstValue: data[0],
      lastValue: data[data.length - 1],
      btcQuantity: btcQuantity
    })

    return {
      labels,
      data
    }
  } catch (error) {
    console.error('❌ Failed to process BTC price data:', error)
    return {
      labels: [],
      data: []
    }
  }
}

export default {
  getBtcPriceData,
  processBtcPriceData
}
