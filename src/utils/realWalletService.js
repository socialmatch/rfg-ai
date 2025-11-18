/**
 * 真实钱包服务 - 使用区块链API获取钱包地址的代币持仓和余额
 * 支持以太坊主网和BSC网络
 */

// API配置
const MORALIS_API_BASE = 'https://deep-index.moralis.io/api/v2'
const BINANCE_API_BASE = 'https://api.binance.com'

// 网络配置
const NETWORKS = {
  ethereum: 'eth',
  bsc: 'bsc',
  polygon: 'polygon'
}

/**
 * 获取钱包地址的代币持仓和余额
 * @param {string} walletAddress - 钱包地址
 * @param {string} network - 网络类型 ('ethereum', 'bsc', 'polygon')
 * @param {string} apiKey - Moralis API密钥（可选，如果不提供则使用模拟数据）
 * @returns {Promise<Object>} 包含代币信息的对象
 */
export const getWalletTokens = async (walletAddress, network = 'ethereum', apiKey = null) => {
  try {
    if (!apiKey) {
      console.warn('未提供Moralis API密钥，使用模拟数据')
      return getMockWalletTokens(walletAddress, network)
    }

    // 获取钱包代币余额
    const tokens = await getWalletTokenBalances(walletAddress, network, apiKey)

    // 获取代币价格信息
    const tokensWithPrices = await enrichTokensWithPrices(tokens)

    // 计算总价值
    const walletValue = calculateWalletValue(tokensWithPrices)

    return {
      success: true,
      walletAddress,
      network,
      tokens: tokensWithPrices,
      walletValue,
      totalTokens: tokensWithPrices.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('获取钱包代币信息失败:', error)
    return {
      success: false,
      error: error.message,
      walletAddress,
      network,
      tokens: [],
      walletValue: null,
      totalTokens: 0,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取钱包代币余额
 * @param {string} walletAddress - 钱包地址
 * @param {string} network - 网络类型
 * @param {string} apiKey - API密钥
 * @returns {Promise<Array>} 代币余额列表
 */
const getWalletTokenBalances = async (walletAddress, network, apiKey) => {
  try {
    const networkParam = NETWORKS[network] || 'eth'
    const url = `${MORALIS_API_BASE}/${walletAddress}/erc20?chain=${networkParam}`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // 转换数据格式
    return data.result.map(token => ({
      symbol: token.symbol,
      name: token.name,
      balance: token.balance,
      balanceFormatted: formatTokenBalance(token.balance, token.decimals),
      contractAddress: token.token_address,
      decimals: token.decimals,
      logo: token.logo,
      thumbnail: token.thumbnail
    }))
  } catch (error) {
    console.error('获取钱包代币余额失败:', error)
    throw error
  }
}

/**
 * 为代币添加价格信息
 * @param {Array} tokens - 代币列表
 * @returns {Promise<Array>} 包含价格信息的代币列表
 */
const enrichTokensWithPrices = async (tokens) => {
  try {
    // 获取代币价格
    const symbols = tokens.map(token => token.symbol)
    const prices = await getBatchTokenPrices(symbols)

    // 合并价格信息
    return tokens.map(token => {
      const priceInfo = prices.find(p => p.symbol === token.symbol)
      if (priceInfo) {
        const balanceUsd = parseFloat(token.balanceFormatted) * priceInfo.price
        return {
          ...token,
          price: priceInfo.price,
          change24h: priceInfo.change24h,
          balanceUsd: balanceUsd.toFixed(2),
          volume: priceInfo.volume,
          high24h: priceInfo.high24h,
          low24h: priceInfo.low24h
        }
      }
      return token
    })
  } catch (error) {
    console.error('获取代币价格信息失败:', error)
    return tokens
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
 * 格式化代币余额
 * @param {string} balance - 原始余额
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的余额
 */
const formatTokenBalance = (balance, decimals) => {
  const divisor = Math.pow(10, decimals)
  return (parseFloat(balance) / divisor).toFixed(8)
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

/**
 * 获取模拟钱包数据（用于测试）
 * @param {string} walletAddress - 钱包地址
 * @param {string} network - 网络类型
 * @returns {Promise<Object>} 模拟钱包数据
 */
const getMockWalletTokens = async (walletAddress, network) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockTokens = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '1250000000000', // 0.00125 BTC in satoshis
      balanceFormatted: '0.00125000',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 8,
      price: 108174.00,
      change24h: 2.5,
      balanceUsd: '135.22',
      volume: 1234567890,
      high24h: 110000,
      low24h: 105000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '2500000000000000000', // 2.5 ETH in wei
      balanceFormatted: '2.50000000',
      contractAddress: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      price: 3859.85,
      change24h: -1.2,
      balanceUsd: '9649.63',
      volume: 9876543210,
      high24h: 4000,
      low24h: 3800
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      balance: '50000000000', // 1000 USDT
      balanceFormatted: '1000.00000000',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      price: 1.00,
      change24h: 0.1,
      balanceUsd: '1000.00',
      volume: 50000000000,
      high24h: 1.01,
      low24h: 0.99
    }
  ]

  const walletValue = calculateWalletValue(mockTokens)

  return {
    success: true,
    walletAddress,
    network,
    tokens: mockTokens,
    walletValue,
    totalTokens: mockTokens.length,
    timestamp: new Date().toISOString()
  }
}

// 导出默认对象
export default {
  getWalletTokens,
  getTokenPrice,
  getBatchTokenPrices,
  calculateWalletValue
}
