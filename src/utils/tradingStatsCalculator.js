/**
 * 交易统计计算工具
 * 根据交易历史数据计算各种统计数据
 */

/**
 * 计算交易统计数据
 * @param {Array} trades - 交易历史数据
 * @returns {Object} 统计数据
 */
export const calculateTradingStats = (trades) => {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      biggestWin: 0,
      biggestLoss: 0,
      totalProfit: 0,
      totalLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      profitLossRatio: 0,
      longTrades: 0,
      shortTrades: 0,
      winTrades: 0,
      lossTrades: 0
    }
  }

  // 过滤有效的交易（有实现盈亏的交易）
  const validTrades = trades.filter(trade => 
    trade.realizedPnl !== undefined && 
    trade.realizedPnl !== null && 
    !isNaN(parseFloat(trade.realizedPnl))
  )

  if (validTrades.length === 0) {
    return {
      totalTrades: trades.length,
      winRate: 0,
      biggestWin: 0,
      biggestLoss: 0,
      totalProfit: 0,
      totalLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      profitLossRatio: 0,
      longTrades: 0,
      shortTrades: 0,
      winTrades: 0,
      lossTrades: 0
    }
  }

  // 计算基本统计
  const totalTrades = validTrades.length
  const profits = []
  const losses = []
  let totalProfit = 0
  let totalLoss = 0
  let longTrades = 0
  let shortTrades = 0

  validTrades.forEach(trade => {
    const pnl = parseFloat(trade.realizedPnl)
    
    if (pnl > 0) {
      profits.push(pnl)
      totalProfit += pnl
    } else if (pnl < 0) {
      losses.push(pnl)
      totalLoss += Math.abs(pnl)
    }

    // 统计多空交易
    if (trade.side === 'BUY') {
      longTrades++
    } else if (trade.side === 'SELL') {
      shortTrades++
    }
  })

  // 计算胜负统计
  const winTrades = profits.length
  const lossTrades = losses.length
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0

  // 计算最大最小盈利
  const biggestWin = profits.length > 0 ? Math.max(...profits) : 0
  const biggestLoss = losses.length > 0 ? Math.min(...losses) : 0

  // 计算平均盈利和亏损
  const averageWin = winTrades > 0 ? totalProfit / winTrades : 0
  const averageLoss = lossTrades > 0 ? totalLoss / lossTrades : 0

  // 计算盈亏比
  const profitLossRatio = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? Infinity : 0)

  // 计算总手续费（保持原始正负值）
  const totalCommission = validTrades.reduce((sum, trade) => {
    const commission = parseFloat(trade.commission) || 0
    return sum + commission
  }, 0)

  return {
    totalTrades,
    winRate: Math.round(winRate * 100) / 100, // 保留2位小数
    biggestWin: Math.round(biggestWin * 100) / 100,
    biggestLoss: Math.round(biggestLoss * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    totalLoss: Math.round(totalLoss * 100) / 100,
    averageWin: Math.round(averageWin * 100) / 100,
    averageLoss: Math.round(averageLoss * 100) / 100,
    profitLossRatio: Math.round(profitLossRatio * 100) / 100,
    longTrades,
    shortTrades,
    winTrades,
    lossTrades,
    totalCommission: Math.round(totalCommission * 100) / 100
  }
}

/**
 * 计算夏普比率（简化版本）
 * @param {Array} trades - 交易历史数据
 * @returns {Number} 夏普比率
 */
export const calculateSharpeRatio = (trades) => {
  if (!trades || trades.length < 2) {
    return 0
  }

  const validTrades = trades.filter(trade => 
    trade.realizedPnl !== undefined && 
    trade.realizedPnl !== null && 
    !isNaN(parseFloat(trade.realizedPnl))
  )

  if (validTrades.length < 2) {
    return 0
  }

  // 计算收益率序列
  const returns = validTrades.map(trade => parseFloat(trade.realizedPnl))
  
  // 计算平均收益率
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  
  // 计算标准差
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1)
  const stdDev = Math.sqrt(variance)
  
  // 计算夏普比率（假设无风险利率为0）
  const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0
  
  return Math.round(sharpeRatio * 100) / 100
}

/**
 * 计算最大回撤
 * @param {Array} trades - 交易历史数据
 * @returns {Number} 最大回撤百分比
 */
export const calculateMaxDrawdown = (trades) => {
  if (!trades || trades.length === 0) {
    return 0
  }

  const validTrades = trades.filter(trade => 
    trade.realizedPnl !== undefined && 
    trade.realizedPnl !== null && 
    !isNaN(parseFloat(trade.realizedPnl))
  )

  if (validTrades.length === 0) {
    return 0
  }

  // 计算累计收益
  let cumulativeReturn = 0
  let maxReturn = 0
  let maxDrawdown = 0

  validTrades.forEach(trade => {
    cumulativeReturn += parseFloat(trade.realizedPnl)
    
    if (cumulativeReturn > maxReturn) {
      maxReturn = cumulativeReturn
    }
    
    const drawdown = maxReturn > 0 ? ((maxReturn - cumulativeReturn) / maxReturn) * 100 : 0
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  })

  return Math.round(maxDrawdown * 100) / 100
}

export default {
  calculateTradingStats,
  calculateSharpeRatio,
  calculateMaxDrawdown
}
