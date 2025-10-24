/**
 * 钱包服务 - 获取钱包地址的代币持仓和余额
 */

// 币安API基础URL
const BINANCE_API_BASE = 'https://api.binance.com'

/**
 * 获取钱包地址的代币持仓和余额
 * @param {string} walletAddress - 钱包地址
 * @returns {Promise<Object>} 包含代币信息的对象
 */
export const getWalletTokens = async (walletAddress) => {
  try {
    // 获取所有支持的代币列表（从币安获取）
    const supportedTokens = await getSupportedTokens()

    // 获取钱包余额（这里使用模拟数据，因为币安API不直接提供钱包余额查询）
    const walletBalances = await getWalletBalances(walletAddress, supportedTokens)

    return {
      success: true,
      walletAddress,
      tokens: walletBalances,
      totalTokens: walletBalances.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('获取钱包代币信息失败:', error)
    return {
      success: false,
      error: error.message,
      walletAddress,
      tokens: [],
      totalTokens: 0,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取币安支持的代币列表
 * @returns {Promise<Array>} 代币列表
 */
const getSupportedTokens = async () => {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/exchangeInfo`)
    const data = await response.json()

    // 提取USDT交易对的代币
    const usdtPairs = data.symbols
      .filter(symbol => symbol.symbol.endsWith('USDT') && symbol.status === 'TRADING')
      .map(symbol => ({
        symbol: symbol.baseAsset,
        name: symbol.baseAsset,
        pair: symbol.symbol,
        status: symbol.status
      }))

    return usdtPairs
  } catch (error) {
    console.error('获取支持代币列表失败:', error)
    // 返回默认代币列表
    return [
      { symbol: 'BTC', name: 'Bitcoin', pair: 'BTCUSDT' },
      { symbol: 'ETH', name: 'Ethereum', pair: 'ETHUSDT' },
      { symbol: 'SOL', name: 'Solana', pair: 'SOLUSDT' },
      { symbol: 'BNB', name: 'BNB', pair: 'BNBUSDT' },
      { symbol: 'DOGE', name: 'Dogecoin', pair: 'DOGEUSDT' },
      { symbol: 'XRP', name: 'XRP', pair: 'XRPUSDT' }
    ]
  }
}

/**
 * 获取钱包余额（模拟数据，实际需要连接区块链节点）
 * @param {string} walletAddress - 钱包地址
 * @param {Array} supportedTokens - 支持的代币列表
 * @returns {Promise<Array>} 钱包余额列表
 */
const getWalletBalances = async (walletAddress, supportedTokens) => {
  try {
    // 注意：币安API不提供钱包余额查询功能
    // 这里使用模拟数据，实际项目中需要：
    // 1. 连接以太坊节点（如Infura、Alchemy）
    // 2. 使用Web3.js或ethers.js查询余额
    // 3. 或者使用第三方服务如Moralis、Alchemy等
    // 模拟钱包余额数据
    const mockBalances = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: '0.12500000',
        balanceUsd: '13521.75',
        price: '108174.00',
        change24h: 2.5
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '2.50000000',
        balanceUsd: '9649.63',
        price: '3859.85',
        change24h: -1.2
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: '15.00000000',
        balanceUsd: '2766.60',
        price: '184.44',
        change24h: 5.8
      },
      {
        symbol: 'BNB',
        name: 'BNB',
        balance: '5.00000000',
        balanceUsd: '5341.25',
        price: '1068.25',
        change24h: 0.8
      },
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        balance: '1000.00000000',
        balanceUsd: '191.30',
        price: '0.1913',
        change24h: -3.2
      },
      {
        symbol: 'XRP',
        name: 'XRP',
        balance: '500.00000000',
        balanceUsd: '1200.00',
        price: '2.40',
        change24h: 1.5
      }
    ]

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    return mockBalances
  } catch (error) {
    console.error('获取钱包余额失败:', error)
    return []
  }
}

/**
 * 获取代币价格信息
 * @param {string} symbol - 代币符号
 * @returns {Promise<Object>} 价格信息
 */
export const getTokenPrice = async (symbol) => {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol}USDT`)
    const data = await response.json()

    return {
      symbol: data.symbol.replace('USDT', ''),
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice)
    }
  } catch (error) {
    console.error(`获取 ${symbol} 价格失败:`, error)
    return null
  }
}

/**
 * 批量获取代币价格
 * @param {Array} symbols - 代币符号数组
 * @returns {Promise<Array>} 价格信息数组
 */
export const getBatchTokenPrices = async (symbols) => {
  try {
    const promises = symbols.map(symbol => getTokenPrice(symbol))
    const results = await Promise.all(promises)

    return results.filter(result => result !== null)
  } catch (error) {
    console.error('批量获取代币价格失败:', error)
    return []
  }
}

/**
 * 计算钱包总价值
 * @param {Array} tokens - 代币列表
 * @returns {Object} 总价值信息
 */
export const calculateWalletValue = (tokens) => {
  const totalValueUsd = tokens.reduce((sum, token) => {
    return sum + parseFloat(token.balanceUsd || 0)
  }, 0)

  const totalValueBtc = tokens.find(token => token.symbol === 'BTC')
    ? totalValueUsd / parseFloat(tokens.find(token => token.symbol === 'BTC').price)
    : 0

  return {
    totalValueUsd: totalValueUsd.toFixed(2),
    totalValueBtc: totalValueBtc.toFixed(8),
    currency: 'USD',
    tokenCount: tokens.length
  }
}

// 导出默认对象
export default {
  getWalletTokens,
  getTokenPrice,
  getBatchTokenPrices,
  calculateWalletValue
}
