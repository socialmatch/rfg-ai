/**
 * 币种图标工具函数
 * 获取币种对应的图标路径
 */

// 支持的币种列表
export const SUPPORTED_CRYPTOS = ['BNB', 'BTC', 'XRP', 'SOL', 'ETH', 'DOGE']

// 币种图标映射 (使用 tokens 目录下的 PNG 格式图标)
const cryptoIconMap = {
  'BNB': 'tokens/bnb.png',
  'BTC': 'tokens/btc.png',
  'XRP': 'tokens/xrp.png',
  'SOL': 'tokens/sol.png',
  'ETH': 'tokens/eth.png',
  'DOGE': 'tokens/doge.png'
}

/**
 * 获取币种图标路径
 * @param {string} symbol - 币种符号
 * @returns {string} 图标路径
 */
export const getCryptoIcon = (symbol) => {
  if (!symbol) return ''
  
  const normalizedSymbol = symbol.toUpperCase()
  const iconFile = cryptoIconMap[normalizedSymbol]
  
  if (!iconFile) {
    console.warn(`⚠️ No icon found for crypto symbol: ${symbol}`)
    return ''
  }
  
  try {
    return new URL(`../assets/images/${iconFile}`, import.meta.url).href
  } catch (error) {
    console.error(`❌ Failed to load crypto icon for ${symbol}:`, error)
    return ''
  }
}

/**
 * 检查币种是否支持
 * @param {string} symbol - 币种符号
 * @returns {boolean} 是否支持
 */
export const isSupportedCrypto = (symbol) => {
  if (!symbol) return false
  return SUPPORTED_CRYPTOS.includes(symbol.toUpperCase())
}

/**
 * 获取币种显示名称
 * @param {string} symbol - 币种符号
 * @returns {string} 显示名称
 */
export const getCryptoDisplayName = (symbol) => {
  if (!symbol) return ''
  return symbol.toUpperCase()
}

export default {
  getCryptoIcon,
  isSupportedCrypto,
  getCryptoDisplayName,
  SUPPORTED_CRYPTOS
}
