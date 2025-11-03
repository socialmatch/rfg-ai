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
export const getBtcPriceData = async (symbol = 'BTCUSDT', interval = '5m') => {
  try {

    const url = new URL(`${BASE_URL}/markPriceKlines`)
    url.searchParams.append('symbol', symbol)
    url.searchParams.append('interval', interval)
    url.searchParams.append('startTime', new Date('2025/11/04 00:30').getTime())
    url.searchParams.append('endTime', new Date().getTime())

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
 * Calculate portfolio value based on buying BTC with $10,000 at the first price
 * @param {Array} priceData - Raw BTC price data from API
 * @param {Array} modelLabels - Model data time labels to align with (not used for BTC calculation)
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

    // Use the first BTC price data as the entry price
    // Calculate BTC quantity: $10,000 / first price
    const firstPrice = parseFloat(priceData[0][4]) // Close price of the first candle
    const initialCapital = 10000
    const btcQuantity = initialCapital / firstPrice // Fixed BTC quantity bought with $10,000

    console.log(`💰 BTC Entry: ${initialCapital} USDT at ${firstPrice} = ${btcQuantity.toFixed(8)} BTC`)

    // Process each candle: calculate portfolio value = btcQuantity * current price
    priceData.forEach((candle, index) => {
      // Extract timestamp (open time)
      const timestamp = candle[0]
      // Extract close price (current price)
      const closePrice = parseFloat(candle[4])

      // Calculate current portfolio value: Fixed BTC quantity * current price
      const currentValue = btcQuantity * closePrice

      labels.push(new Date(timestamp).toISOString())
      data.push(currentValue)
    })

    console.log(`📊 BTC Chart: ${priceData.length} data points, initial value: ${initialCapital}, final value: ${data[data.length - 1]?.toFixed(2)}`)

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
