/**
 * Crypto Price Service
 * Handles cryptocurrency price requests from Aster Finance
 */

// Base API URL
const BASE_URL = 'https://fapi.asterdex.com/fapi/v3'

// Supported cryptocurrencies
const SUPPORTED_CRYPTOS = [
  { symbol: 'BTCUSDT', name: 'BTC' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'SOL' },
  { symbol: 'DOGEUSDT', name: 'DOGE' },
  { symbol: 'ETHUSDT', name: 'ETH' },
  { symbol: 'XRPUSDT', name: 'XRP' }
]

/**
 * Get price for a single cryptocurrency
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @returns {Promise<Object>} Price data response
 */
export const getCryptoPrice = async (symbol) => {
  try {
    const response = await fetch(`${BASE_URL}/ticker/price?symbol=${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Price API request failed for ${symbol}: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()


    return {
      success: true,
      data: data,
      symbol: symbol,
      error: null
    }
  } catch (error) {
    console.error(`❌ Failed to get price for ${symbol}:`, error)
    return {
      success: false,
      data: null,
      symbol: symbol,
      error: error.message
    }
  }
}

/**
 * Get prices for all supported cryptocurrencies
 * @returns {Promise<Object>} All crypto prices response
 */
export const getAllCryptoPrices = async () => {
  try {
    // Fetch prices for all supported cryptocurrencies concurrently
    const promises = SUPPORTED_CRYPTOS.map(crypto => getCryptoPrice(crypto.symbol))
    const results = await Promise.allSettled(promises)

    const successfulResults = []
    const failedResults = []

    results.forEach((result, index) => {
      const crypto = SUPPORTED_CRYPTOS[index]

      if (result.status === 'fulfilled' && result.value.success) {
        successfulResults.push({
          ...crypto,
          price: parseFloat(result.value.data.price),
          time: result.value.data.time,
          rawData: result.value.data
        })
      } else {
        failedResults.push({
          ...crypto,
          error: result.status === 'fulfilled' ? result.value.error : result.reason.message
        })
      }
    })
    return {
      success: true,
      prices: successfulResults,
      failedPrices: failedResults,
      totalCryptos: SUPPORTED_CRYPTOS.length,
      successfulCount: successfulResults.length,
      failedCount: failedResults.length
    }

  } catch (error) {
    console.error('❌ Failed to load crypto prices:', error)
    return {
      success: false,
      prices: [],
      failedPrices: [],
      totalCryptos: SUPPORTED_CRYPTOS.length,
      successfulCount: 0,
      failedCount: SUPPORTED_CRYPTOS.length,
      error: error.message
    }
  }
}

/**
 * Get price for a specific cryptocurrency by name
 * @param {string} name - Crypto name (e.g., 'BTC', 'ETH')
 * @returns {Promise<Object>} Price data response
 */
export const getCryptoPriceByName = async (name) => {
  const crypto = SUPPORTED_CRYPTOS.find(c => c.name === name.toUpperCase())
  if (!crypto) {
    return {
      success: false,
      data: null,
      symbol: name,
      error: `Unsupported cryptocurrency: ${name}`
    }
  }
  return await getCryptoPrice(crypto.symbol)
}

export default {
  getCryptoPrice,
  getAllCryptoPrices,
  getCryptoPriceByName,
  SUPPORTED_CRYPTOS
}
