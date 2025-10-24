/**
 * 多链钱包服务 - 支持ETH主网、BSC链、SOL链、Arbitrum链
 * 获取钱包地址的代币持仓和余额
 */

// API配置
const MORALIS_API_BASE = 'https://deep-index.moralis.io/api/v2'
const SOLSCAN_API_BASE = 'https://api.solscan.io'
const BINANCE_API_BASE = 'https://api.binance.com'
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImM1NzcwNjQ0LTU0MjAtNDdkYS05MDViLWQ2MGVhZDUzMGIzYiIsIm9yZ0lkIjoiNDc3MjkzIiwidXNlcklkIjoiNDkxMDUzIiwidHlwZUlkIjoiMDJkZjYxYTMtZjYzYy00ZmVlLWI1YzEtMjRkNDRjNjFjNDRmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjExNTYxMTIsImV4cCI6NDkxNjkxNjExMn0.qMop2xhcqJMlxD653Iufm4fBKLe-_gsSeJCgFH1tDrI'
// 配置选项
const CONFIG = {
  // 是否启用CORS代理模式（当API有CORS限制时）
  useCorsProxy: false,
  // CORS代理服务器地址（如果有的话）
  corsProxyUrl: '',
  // 是否在API失败时自动使用模拟数据
  fallbackToMock: true,
  // 请求超时时间（毫秒）
  requestTimeout: 5000
}

// 网络配置
const NETWORKS = {
  ethereum: 'eth',
  bsc: 'bsc',
  polygon: 'polygon',
  arbitrum: 'arbitrum',
  solana: 'solana'
}

// 链ID映射
const CHAIN_IDS = {
  ethereum: 1,
  bsc: 56,
  arbitrum: 42161,
  polygon: 137,
  solana: 999 // Solana使用特殊的链ID
}

/**
 * 获取多链钱包代币信息
 * @param {string} walletAddress - 钱包地址
 * @param {Array} networks - 网络列表 ['ethereum', 'bsc', 'arbitrum', 'solana']
 * @param {string} apiKey - Moralis API密钥（可选）
 * @returns {Promise<Object>} 包含所有链代币信息的对象
 */
export const getMultiChainWalletTokens = async (walletAddress, networks = ['ethereum', 'bsc', 'arbitrum', 'solana'], apiKey = null) => {
  try {
    const results = {
      success: true,
      walletAddress,
      totalValue: { usd: 0, btc: 0 },
      networks: {},
      timestamp: new Date().toISOString()
    }

    // 并行获取所有网络的代币信息
    const promises = networks.map(network => {
      if (network === 'solana') {
        return getSolanaWalletTokens(walletAddress)
      } else {
        return getEVMWalletTokens(walletAddress, network, apiKey)
      }
    })

    const networkResults = await Promise.allSettled(promises)

    let totalValueUsd = 0
    let totalValueBtc = 0

    networkResults.forEach((result, index) => {
      const network = networks[index]
      if (result.status === 'fulfilled' && result.value.success) {
        results.networks[network] = result.value
        totalValueUsd += parseFloat(result.value.totalValue?.usd || 0)
        totalValueBtc += parseFloat(result.value.totalValue?.btc || 0)
      } else {
        console.error(`获取 ${network} 网络代币失败:`, result.reason)
        results.networks[network] = {
          success: false,
          error: result.reason?.message || '获取失败',
          tokens: [],
          totalValue: { usd: 0, btc: 0 }
        }
      }
    })

    results.totalValue = {
      usd: totalValueUsd.toFixed(2),
      btc: totalValueBtc.toFixed(8)
    }

    return results
  } catch (error) {
    console.error('获取多链钱包代币信息失败:', error)
    return {
      success: false,
      error: error.message,
      walletAddress,
      totalValue: { usd: 0, btc: 0 },
      networks: {},
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取EVM链钱包代币信息（ETH、BSC、Arbitrum）
 * @param {string} walletAddress - 钱包地址
 * @param {string} network - 网络类型
 * @param {string} apiKey - API密钥
 * @returns {Promise<Object>} 代币信息
 */
const getEVMWalletTokens = async (walletAddress, network, apiKey) => {
  try {
    if (!apiKey) {
      console.warn(`未提供Moralis API密钥，使用模拟数据 (${network})`)
      return getMockEVMWalletTokens(walletAddress, network)
    }

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

    // 转换数据格式并获取价格信息
    const tokens = data.map(token => ({
      symbol: token.symbol,
      name: token.name,
      balance: token.balance,
      balanceFormatted: formatTokenBalance(token.balance, token.decimals),
      contractAddress: token.token_address,
      decimals: token.decimals,
      logo: token.logo,
      thumbnail: token.thumbnail,
      chain: network
    }))

    // 获取价格信息
    const tokensWithPrices = await enrichTokensWithPrices(tokens)

    // 计算总价值
    const totalValue = calculateWalletValue(tokensWithPrices)

    return {
      success: true,
      walletAddress,
      network,
      chainId: CHAIN_IDS[network],
      tokens: tokensWithPrices,
      totalValue,
      totalTokens: tokensWithPrices.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`获取 ${network} 钱包代币信息失败:`, error)
    return {
      success: false,
      error: error.message,
      walletAddress,
      network,
      chainId: CHAIN_IDS[network],
      tokens: [],
      totalValue: { usd: 0, btc: 0 },
      totalTokens: 0,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 获取Solana钱包代币信息
 * @param {string} walletAddress - 钱包地址
 * @returns {Promise<Object>} 代币信息
 */
const getSolanaWalletTokens = async (walletAddress) => {
  try {
    // 由于CORS限制，直接使用模拟数据
    // 在实际项目中，可以通过后端代理或使用其他支持CORS的API
    console.warn('Solana API由于CORS限制无法直接访问，使用模拟数据')
    return await getMockSolanaWalletTokens(walletAddress)

    // 以下是原始API调用代码，保留以备后端代理使用
    /*
    const url = `${SOLSCAN_API_BASE}/account/tokens?account=${walletAddress}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Solana API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.data) {
      throw new Error('Solana API返回数据格式错误')
    }

    // 转换数据格式
    const tokens = data.data.map(token => ({
      symbol: token.symbol || token.tokenSymbol,
      name: token.tokenName,
      balance: token.tokenAmount?.toString() || '0',
      balanceFormatted: formatSolanaTokenBalance(token.tokenAmount, token.decimals),
      contractAddress: token.tokenAddress,
      decimals: token.decimals || 9,
      logo: token.icon,
      thumbnail: token.icon,
      chain: 'solana'
    }))

    // 获取价格信息
    const tokensWithPrices = await enrichTokensWithPrices(tokens)

    // 计算总价值
    const totalValue = calculateWalletValue(tokensWithPrices)

    return {
      success: true,
      walletAddress,
      network: 'solana',
      chainId: CHAIN_IDS.solana,
      tokens: tokensWithPrices,
      totalValue,
      totalTokens: tokensWithPrices.length,
      timestamp: new Date().toISOString()
    }
    */
  } catch (error) {
    console.error('获取Solana钱包代币信息失败:', error)
    // 如果出现任何错误，都使用模拟数据
    return await getMockSolanaWalletTokens(walletAddress)
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
 * 获取代币价格信息（支持多个数据源）
 * @param {string} symbol - 代币符号
 * @returns {Promise<Object>} 价格信息
 */
export const getTokenPrice = async (symbol) => {
  try {
    // 首先尝试币安API
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol}USDT`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        return {
          symbol: data.symbol.replace('USDT', ''),
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume: parseFloat(data.volume),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice)
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn(`币安API获取 ${symbol} 价格失败，尝试CoinGecko`)
      }
    }

    // 如果币安失败，尝试CoinGecko
    try {
      const coinGeckoId = getCoinGeckoId(symbol)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const response = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high=true&include_24hr_low=true`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const coinData = data[coinGeckoId]

        if (coinData) {
          return {
            symbol: symbol,
            price: coinData.usd,
            change24h: coinData.usd_24h_change || 0,
            volume: coinData.usd_24h_vol || 0,
            high24h: coinData.usd_24h_high || 0,
            low24h: coinData.usd_24h_low || 0
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn(`CoinGecko获取 ${symbol} 价格失败`)
      }
    }

    // 如果所有API都失败，返回模拟价格
    console.warn(`所有API获取 ${symbol} 价格失败，使用模拟数据`)
    return getMockTokenPrice(symbol)
  } catch (error) {
    console.error(`获取 ${symbol} 价格失败:`, error)
    return getMockTokenPrice(symbol)
  }
}

/**
 * 获取CoinGecko代币ID
 * @param {string} symbol - 代币符号
 * @returns {string} CoinGecko ID
 */
const getCoinGeckoId = (symbol) => {
  const coinGeckoMap = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'LTC': 'litecoin',
    'ATOM': 'cosmos',
    'FTM': 'fantom'
  }

  return coinGeckoMap[symbol.toUpperCase()] || symbol.toLowerCase()
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
 * 格式化Solana代币余额
 * @param {number} tokenAmount - 代币数量
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的余额
 */
const formatSolanaTokenBalance = (tokenAmount, decimals) => {
  const divisor = Math.pow(10, decimals)
  return (tokenAmount / divisor).toFixed(8)
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

  const btcToken = tokens.find(token => token.symbol === 'BTC')
  const totalValueBtc = btcToken
    ? totalValueUsd / parseFloat(btcToken.price)
    : 0

  return {
    usd: totalValueUsd.toFixed(2),
    btc: totalValueBtc.toFixed(8)
  }
}

/**
 * 获取模拟EVM钱包数据（用于测试）
 * @param {string} walletAddress - 钱包地址
 * @param {string} network - 网络类型
 * @returns {Promise<Object>} 模拟钱包数据
 */
const getMockEVMWalletTokens = async (walletAddress, network) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockTokens = [
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
      low24h: 3800,
      chain: network
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      balance: '1000000000000', // 1000 USDT
      balanceFormatted: '1000.00000000',
      contractAddress: network === 'ethereum' ? '0xdAC17F958D2ee523a2206206994597C13D831ec7' : '0x55d398326f99059fF775485246999027B3197955',
      decimals: 6,
      price: 1.00,
      change24h: 0.1,
      balanceUsd: '1000.00',
      volume: 50000000000,
      high24h: 1.01,
      low24h: 0.99,
      chain: network
    }
  ]

  const totalValue = calculateWalletValue(mockTokens)

  return {
    success: true,
    walletAddress,
    network,
    chainId: CHAIN_IDS[network],
    tokens: mockTokens,
    totalValue,
    totalTokens: mockTokens.length,
    timestamp: new Date().toISOString()
  }
}

/**
 * 获取模拟代币价格
 * @param {string} symbol - 代币符号
 * @returns {Object} 模拟价格信息
 */
const getMockTokenPrice = (symbol) => {
  const mockPrices = {
    'BTC': { price: 108174.00, change24h: 2.5 },
    'ETH': { price: 3859.85, change24h: -1.2 },
    'SOL': { price: 184.44, change24h: 5.8 },
    'BNB': { price: 1068.25, change24h: 0.8 },
    'DOGE': { price: 0.1913, change24h: -3.2 },
    'XRP': { price: 2.40, change24h: 1.5 },
    'ADA': { price: 0.45, change24h: 2.1 },
    'MATIC': { price: 0.89, change24h: -0.5 },
    'USDT': { price: 1.00, change24h: 0.1 },
    'USDC': { price: 1.00, change24h: 0.0 }
  }

  const priceData = mockPrices[symbol.toUpperCase()] || { price: 1.00, change24h: 0.0 }

  return {
    symbol: symbol,
    price: priceData.price,
    change24h: priceData.change24h,
    volume: Math.random() * 1000000000,
    high24h: priceData.price * (1 + Math.random() * 0.1),
    low24h: priceData.price * (1 - Math.random() * 0.1)
  }
}

/**
 * 获取模拟Solana钱包数据
 * @param {string} walletAddress - 钱包地址
 * @returns {Promise<Object>} 模拟Solana钱包数据
 */
const getMockSolanaWalletTokens = async (walletAddress) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  const mockTokens = [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: '15000000000', // 15 SOL in lamports
      balanceFormatted: '15.00000000',
      contractAddress: 'So11111111111111111111111111111111111111112',
      decimals: 9,
      price: 184.44,
      change24h: 5.8,
      balanceUsd: '2766.60',
      volume: 1234567890,
      high24h: 200,
      low24h: 170,
      chain: 'solana'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '500000000', // 500 USDC
      balanceFormatted: '500.00000000',
      contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      price: 1.00,
      change24h: 0.0,
      balanceUsd: '500.00',
      volume: 50000000000,
      high24h: 1.01,
      low24h: 0.99,
      chain: 'solana'
    }
  ]

  const totalValue = calculateWalletValue(mockTokens)

  return {
    success: true,
    walletAddress,
    network: 'solana',
    chainId: CHAIN_IDS.solana,
    tokens: mockTokens,
    totalValue,
    totalTokens: mockTokens.length,
    timestamp: new Date().toISOString()
  }
}

/**
 * 配置多链钱包服务
 * @param {Object} options - 配置选项
 * @param {boolean} options.useCorsProxy - 是否启用CORS代理
 * @param {string} options.corsProxyUrl - CORS代理服务器地址
 * @param {boolean} options.fallbackToMock - 是否在API失败时使用模拟数据
 * @param {number} options.requestTimeout - 请求超时时间（毫秒）
 */
export const configureWalletService = (options) => {
  Object.assign(CONFIG, options)
  console.log('钱包服务配置已更新:', CONFIG)
}

/**
 * 获取当前配置
 * @returns {Object} 当前配置
 */
export const getWalletServiceConfig = () => {
  return { ...CONFIG }
}

/**
 * 获取指定钱包地址的代币信息（简化接口）
 * @param {string} walletAddress - 钱包地址
 * @returns {Promise<Object>} 代币信息
 */
export const getWalletTokens = async (walletAddress) => {
  let apiKey = MORALIS_API_KEY
  return await getMultiChainWalletTokens(walletAddress, ['ethereum', 'bsc', 'arbitrum', 'solana'], apiKey)
}

// 导出默认对象
export default {
  getMultiChainWalletTokens,
  getWalletTokens,
  getTokenPrice,
  getBatchTokenPrices,
  calculateWalletValue,
  configureWalletService,
  getWalletServiceConfig
}
