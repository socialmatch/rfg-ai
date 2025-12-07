<template lang="pug">
.leaderboard-container
  Header

  // Page title
  .page-title {{ $t('leaderboard.title') }}

  // Tabs
  //.tabs-container
    .tab(:class="{ active: activeTab === 'overall' }" @click="setActiveTab('overall')") OVERALL STATS
    //.tab(:class="{ active: activeTab === 'analytics' }" @click="setActiveTab('analytics')") ADVANCED ANALYTICS

  // Leaderboard table
  .leaderboard-table
    .table-header
      .col.rank {{ $t('leaderboard.rank') }}
      .col {{ $t('leaderboard.model') }}
      .col {{ $t('leaderboard.accountValue') }}
      .col
        span {{ $t('leaderboard.returnPercent') }}
        .tooltip-icon(:title="$t('leaderboard.returnPercentFormula')") ?
      .col
        span {{ $t('leaderboard.totalPnl') }}
        .tooltip-icon(:title="$t('leaderboard.totalPnlFormula')") ?
      .col {{ $t('trades.fees') }}
      .col
        span {{ $t('leaderboard.winRate') }}
        .tooltip-icon(:title="$t('leaderboard.winRateFormula')") ?
      .col {{ $t('modelDetail.biggestWin') }}
      .col {{ $t('modelDetail.biggestLoss') }}
      .col {{ $t('leaderboard.totalTrades') }}

    .table-body
      .table-row(v-for="(model, index) in leaderboardData" :key="model.name" :class="{ 'alternate': index % 2 === 1 }")
        .col.rank {{ model.rank }}
        .col.model(:data-rank="model.rank")
          .model-icon(:style="shouldShowBackground(model.name) ? { backgroundColor: model.color } : {}")
            img(:src="getModelIcon(model.name)" :alt="model.name")
          .model-name {{ model.name }}
        .col(data-label="ACCT VALUE").account-value {{ formatNumber(model.accountValue, { currency: true }) }}
        .col.return-percent(:class="dataLoaded && (model.returnPercent || 0) >= 0 ? 'positive' : (dataLoaded && (model.returnPercent || 0) < 0 ? 'negative' : '')" :data-label="$t('leaderboard.returnPercent')")
          | {{ formatNumber(model.returnPercent, { percent: true, decimals: 2 }) }}
        .col(:class="dataLoaded && (model.totalPnl || 0) >= 0 ? 'positive' : (dataLoaded && (model.totalPnl || 0) < 0 ? 'negative' : '')" data-label="TOTAL P&L").total-pnl
          | {{ formatNumber(model.totalPnl, { currency: true }) }}
        .col(data-label="FEES").fees {{ formatNumber(Math.abs(model.fees || 0), { currency: true, decimals: 2 }) }}
        .col(data-label="WIN RATE").win-rate {{ formatNumber(model.winRate, { percent: true, decimals: 1 }) }}
        .col(:class="dataLoaded && (model.biggestWin || 0) >= 0 ? 'positive' : (dataLoaded && (model.biggestWin || 0) < 0 ? 'negative' : '')" data-label="BIGGEST WIN").biggest-win
          | {{ formatNumber(model.biggestWin, { currency: true, decimals: 2 }) }}
        .col(:class="dataLoaded && (model.biggestLoss || 0) >= 0 ? 'positive' : (dataLoaded && (model.biggestLoss || 0) < 0 ? 'negative' : '')" data-label="BIGGEST LOSS").biggest-loss
          | {{ formatNumber(model.biggestLoss, { currency: true, decimals: 2 }) }}
        .col(data-label="TRADES").trades {{ formatNumber(model.trades) }}

  // Bottom statistics and visualization
  .summary-section
    .summary-info
      .summary-item
        .label WINNING MODEL:
        .value
            .model-icon(:style="shouldShowBackground(winningModel.name) ? { backgroundColor: winningModel.color } : {}")
              img(:src="getModelIcon(winningModel.name)" :alt="winningModel.name")
            .model-name {{ winningModel.name }}
      .summary-item
        .label TOTAL EQUITY:
        .value {{ formatNumber(winningModel.accountValue, { currency: true }) }}

      .summary-item
        .label ACTIVE POSITIONS:
        .value
          .crypto-icons
            .crypto-icon(v-for="crypto in getActiveCryptoIcons()" :key="crypto")
              img(:src="getCryptoIcon(crypto)" :alt="crypto" v-if="getCryptoIcon(crypto)")
    .visualization
      .model-diff
        .bar-chart(v-for="model in leaderboardData" :key="model.name")
          .bar-visual
            .bar-value ${{ formatBarValue(model.accountValue) }}
            .bar(:style="{ height: getBarHeight(model.accountValue || 0) + '%', backgroundColor: model.color || '#64748b' }")
            .bar-icon
              img(:src="getModelIcon(model.name)" :alt="model.name")
          .model-info
            .bar-label(:style="{ color: model.color || '#94a3b8' }") {{ model.name }}

  // Bottom note
  .footer-note
    | {{ $t('leaderboard.note') }}
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { getAllModelInfo, getModelIconPath, getAccountBalanceData, getAccountByModelName, DEFAULT_INITIAL_CAPITAL } from '@/config/accounts.js'
import { getAllModelsProcessedBalance } from '@/utils/newBalanceService.js'
import { getAllModelsProcessedTrades } from '@/utils/newTradesService.js'
import { getAllModelsProcessedPositions } from '@/utils/newPositionsService.js'
import { calculateTradingStats, calculateSharpeRatio, calculateMaxDrawdown } from '@/utils/tradingStatsCalculator.js'
import { getCryptoIcon, isSupportedCrypto } from '@/utils/cryptoIcons.js'
import { getCachedData, setCachedData } from '@/utils/dataCache.js'

const router = useRouter()

const activeTab = ref('overall')
const loading = ref(false)
const desc = ref('')
const sortColumn = ref('')

// Leaderboard data - initialized as empty, dynamically get real data later
const leaderboardData = ref([])

// Track if data has been loaded at least once
const dataLoaded = ref(false)

// Initialize leaderboard with all models from config (for display before data loads)
const initializeLeaderboardWithAllModels = () => {
  const allModels = getAllModelInfo().filter(model => model.enabled)
  return allModels.map((model, index) => ({
    rank: index + 1,
    name: model.name,
    accountValue: 0,
    returnPercent: 0,
    totalPnl: 0,
    fees: 0,
    winRate: 0,
    biggestWin: 0,
    biggestLoss: 0,
    trades: 0,
    color: model.color,
    balance: '0.00000000',
    availableBalance: '0.00000000',
    marginAvailable: false,
    initialCapital: model.initialCapital || DEFAULT_INITIAL_CAPITAL,
    positions: [],
    longTrades: 0,
    shortTrades: 0,
    winTrades: 0,
    lossTrades: 0,
    averageWin: 0,
    averageLoss: 0,
    maxDrawdown: 0,
    isPlaceholder: true // Mark as placeholder data
  }))
}

// Check if we have complete cached data for all models
const hasCompleteCachedData = (balanceData, tradesData, positionsData) => {
  if (!balanceData || !balanceData.success) return false
  if (!tradesData || !tradesData.success) return false
  if (!positionsData || !positionsData.success) return false

  // Get all enabled models
  const allEnabledModels = getAllModelInfo().filter(model => model.enabled)
  const enabledModelNames = new Set(allEnabledModels.map(m => m.name))

  // Check if we have data for all enabled models in balance data
  const balanceModelNames = new Set(
    balanceData.accounts
      .filter(acc => acc.success && acc.data && acc.data.length > 0)
      .map(acc => acc.modelInfo.name)
  )

  // Check if we have data for all enabled models in trades data
  const tradesModelNames = new Set(
    tradesData.accounts
      .filter(acc => acc.data && acc.data.length > 0)
      .map(acc => acc.modelInfo.name)
  )

  // Check if we have data for all enabled models in positions data
  const positionsModelNames = new Set(
    positionsData.accounts
      .filter(acc => acc.success && acc.data)
      .map(acc => acc.modelInfo.name)
  )

  // We consider it complete if we have balance data for all models
  // (trades and positions might be empty for some models, which is OK)
  const hasAllBalanceData = allEnabledModels.every(model => balanceModelNames.has(model.name))

  return hasAllBalanceData
}

// Auto-refresh timer (1 minute = 60000ms)
let refreshTimer = null

// Get active crypto icons for display based on winning model's positions
const getActiveCryptoIcons = () => {
  if (leaderboardData.value.length === 0) {
    console.log('🔍 Leaderboard data is empty')
    return []
  }

  // Get the winning model (first in the list)
  const winningModel = leaderboardData.value[0]
  console.log('🔍 Winning model:', winningModel)
  console.log('🔍 Winning model positions:', winningModel?.positions)

  if (!winningModel || !winningModel.positions) {
    console.log('🔍 No winning model or positions found')
    return []
  }

  // Extract unique crypto symbols from positions and filter out unsupported cryptos
  const cryptos = [...new Set(winningModel.positions.map(position => position.coin))]
  console.log('🔍 Active crypto symbols (before filter):', cryptos)

  // Filter out cryptos that are not in cryptoIconMap (not supported)
  const supportedCryptos = cryptos.filter(crypto => {
    if (!crypto || crypto.trim() === '') return false
    // Check if crypto is supported (exists in cryptoIconMap)
    return isSupportedCrypto(crypto)
  })

  console.log('🔍 Active crypto symbols (after filter):', supportedCryptos)
  return supportedCryptos
}

const buildLeaderboardFromData = (balanceData, tradesData, positionsData) => {
  const hasBalance = balanceData && balanceData.success
  const hasTrades = tradesData && tradesData.success
  const hasPositions = positionsData && positionsData.success

  if (!hasBalance && !hasTrades && !hasPositions) {
    console.warn('⚠️ No valid leaderboard datasets available to build view')
    return false
  }

  const modelDataMap = new Map()

  if (hasBalance) {
    balanceData.accounts.forEach(account => {
      if (account.success && account.data && account.data.length > 0) {
        const usdtBalance = account.data.find(b => b.asset === 'USDT')
        if (usdtBalance) {
          modelDataMap.set(account.modelInfo.name, {
            ...modelDataMap.get(account.modelInfo.name) || {},
            modelInfo: account.modelInfo,
            balance: usdtBalance,
            accountValue: parseFloat(usdtBalance.crossWalletBalance + usdtBalance.crossUnPnl),
            unrealizedPnL: parseFloat(usdtBalance.crossUnPnl),
            totalUsdtValue: parseFloat(usdtBalance.totalUsdtValue || usdtBalance.balance),
            uid: usdtBalance.uid,
            walletName: usdtBalance.walletName
          })
        }
      }
    })
  }

  if (hasTrades) {
    tradesData.accounts.forEach(account => {
      if (account.data && account.data.length > 0) {
        const modelName = account.modelInfo.name
        const existingData = modelDataMap.get(modelName) || { modelInfo: account.modelInfo }

        const stats = calculateTradingStats(account.data)
        const sharpeRatio = calculateSharpeRatio(account.data)
        const maxDrawdown = calculateMaxDrawdown(account.data)

        modelDataMap.set(modelName, {
          ...existingData,
          trades: account.data,
          stats,
          sharpeRatio,
          maxDrawdown
        })
      }
    })
  }

  if (hasPositions) {
    console.log('🔍 Processing positions data for accounts:', positionsData.accounts.length)
    positionsData.accounts.forEach(account => {
      console.log('🔍 Processing account:', account.modelInfo.name, 'Success:', account.success)
      console.log('🔍 Account data structure:', account.data)

      if (account.success && account.data) {
        const positions = account.data.positions || account.data
        console.log('🔍 Positions found:', positions)

        if (positions && positions.length > 0) {
          console.log('🔍 Account has positions:', positions.length, 'positions')
          const modelName = account.modelInfo.name
          const existingData = modelDataMap.get(modelName) || { modelInfo: account.modelInfo }

          const mappedPositions = positions.map((position, index) => ({
            id: index + 1,
            coin: position.symbol ? position.symbol.replace('USDT', '') : 'UNKNOWN',
            entryTime: new Date(position.updateTime || Date.now()).toLocaleTimeString(),
            entryPrice: parseFloat(position.entryPrice || 0),
            side: parseFloat(position.positionAmt || 0) >= 0 ? 'LONG' : 'SHORT',
            quantity: Math.abs(parseFloat(position.positionAmt || 0)),
            leverage: parseFloat(position.leverage || 1),
            liquidationPrice: parseFloat(position.liquidationPrice || 0),
            margin: parseFloat(position.isolatedMargin || 0),
            unrealPnl: parseFloat(position.unRealizedProfit || 0),
            notional: parseFloat(position.notional || 0)
          }))

          console.log('🔍 Mapped positions for', modelName, ':', mappedPositions)
          modelDataMap.set(modelName, {
            ...existingData,
            positions: mappedPositions
          })
        } else {
          console.log('🔍 Account has no positions:', account.modelInfo.name)
        }
      } else {
        console.log('🔍 Account failed:', account.modelInfo.name)
      }
    })
  } else {
    console.log('🔍 No positions data or failed to get positions data')
  }

  // Get all enabled models to ensure we include all models even if they have no data
  const allEnabledModels = getAllModelInfo().filter(model => model.enabled)
  const allEnabledModelNames = new Set(allEnabledModels.map(m => m.name))

  const leaderboardItems = []

  // First, process models that have data
  modelDataMap.forEach((data, modelName) => {
    const balance = data.balance
    const stats = data.stats || {}
    const accountValue = balance ? parseFloat(balance.balance) : 0
    const initialCapital = data.modelInfo.initialCapital || DEFAULT_INITIAL_CAPITAL
    const fees = stats.totalCommission || 0

    // 总盈亏 = 当前余额 - 初始本金
    const totalPnl = accountValue - initialCapital

    // 回报率 = （当前余额 - 初始本金）/ 初始本金
    const returnPercent = initialCapital > 0 ? ((accountValue - initialCapital) / initialCapital) * 100 : 0

    // 计算新的胜率: (已平仓盈利订单数 + 未平仓盈利订单数) / (已平仓订单数 + 未平仓订单数)
    const closedTrades = data.trades || []
    const positions = data.positions || []

    // 已平仓的盈利订单数量
    const closedWinTrades = closedTrades.filter(trade => {
      const pnl = parseFloat(trade.realizedPnl || 0)
      return pnl > 0
    }).length

    // 当前未平仓的盈利订单数量
    const openWinPositions = positions.filter(position => {
      const pnl = parseFloat(position.unrealPnl || 0)
      return pnl > 0
    }).length

    // 已平仓的订单总数
    const closedTradesCount = closedTrades.length

    // 当前持仓的订单总数
    const openPositionsCount = positions.length

    // 计算胜率
    const totalOrders = closedTradesCount + openPositionsCount
    const winRate = totalOrders > 0 ? ((closedWinTrades + openWinPositions) / totalOrders) * 100 : 0

    leaderboardItems.push({
      rank: 0,
      name: modelName,
      accountValue: accountValue,
      returnPercent: returnPercent,
      totalPnl: totalPnl,
      fees: fees,
      winRate: Math.round(winRate * 100) / 100, // 保留2位小数
      biggestWin: stats.biggestWin || 0,
      biggestLoss: stats.biggestLoss || 0,
      sharpe: stats.profitLossRatio || 0,
      trades: stats.totalTrades || 0,
      color: data.modelInfo.color,
      balance: balance?.balance || '0.00000000',
      availableBalance: balance?.availableBalance || '0.00000000',
      marginAvailable: balance?.marginAvailable || false,
      initialCapital: initialCapital,
      positions: data.positions || [],
      longTrades: stats.longTrades || 0,
      shortTrades: stats.shortTrades || 0,
      winTrades: stats.winTrades || 0,
      lossTrades: stats.lossTrades || 0,
      averageWin: stats.averageWin || 0,
      averageLoss: stats.averageLoss || 0,
      maxDrawdown: data.maxDrawdown || 0,
      isPlaceholder: false // Mark as real data
    })

    console.log('🔍 Built leaderboard item for', modelName, 'with positions:', data.positions || [])
  })

  // Add models that don't have data yet (only if we're building from incomplete cache)
  // If we have complete cache, we don't need to add placeholder models
  allEnabledModels.forEach(model => {
    if (!modelDataMap.has(model.name)) {
      // This model has no data, but we still want to show it
      // Only add if we're in a state where we should show placeholders
      // (i.e., when we don't have complete cache)
      leaderboardItems.push({
        rank: 0,
        name: model.name,
        accountValue: 0,
        returnPercent: 0,
        totalPnl: 0,
        fees: 0,
        winRate: 0,
        biggestWin: 0,
        biggestLoss: 0,
        trades: 0,
        color: model.color,
        balance: '0.00000000',
        availableBalance: '0.00000000',
        marginAvailable: false,
        initialCapital: model.initialCapital || DEFAULT_INITIAL_CAPITAL,
        positions: [],
        longTrades: 0,
        shortTrades: 0,
        winTrades: 0,
        lossTrades: 0,
        averageWin: 0,
        averageLoss: 0,
        maxDrawdown: 0,
        isPlaceholder: true // Mark as placeholder
      })
    }
  })

  leaderboardItems.sort((a, b) => {
    // Sort by accountValue, but placeholders go to the end
    if (a.isPlaceholder && !b.isPlaceholder) return 1
    if (!a.isPlaceholder && b.isPlaceholder) return -1
    return b.accountValue - a.accountValue
  })

  // Filter out accounts with balance less than 500
  const filteredLeaderboardItems = leaderboardItems.filter(item => {
    const accountBalance = item.accountValue || 0
    return accountBalance >= 500
  })

  filteredLeaderboardItems.forEach((item, index) => {
    item.rank = index + 1
  })

  console.log('✅ Leaderboard data built:', {
    totalModels: filteredLeaderboardItems.length,
    data: filteredLeaderboardItems
  })

  // Return the built data instead of directly updating leaderboardData.value
  return filteredLeaderboardItems.length > 0 ? filteredLeaderboardItems : null
}

// Dynamically load leaderboard data
const loadLeaderboardData = async (silent = false) => {
  // Only show loading indicator on initial load, not on auto-refresh
  if (!silent) {
    loading.value = true
  }

  try {
    console.log('🔄 Loading leaderboard data...')

    let balanceData = getCachedData('balance')
    let tradesData = getCachedData('trades')
    let positionsData = getCachedData('positions')
    let newLeaderboardData = null // Declare at function scope

    if (balanceData) console.log('✅ Using cached balance data for leaderboard')
    if (tradesData) console.log('✅ Using cached trades data for leaderboard')
    if (positionsData) console.log('✅ Using cached positions data for leaderboard')

    // Check if we have complete cached data
    const hasCompleteCache = hasCompleteCachedData(balanceData, tradesData, positionsData)

    // If we have no existing data, initialize with placeholder or cached data
    if (leaderboardData.value.length === 0) {
      if (hasCompleteCache) {
        // We have complete cached data, build and display it immediately
        console.log('✅ Found complete cached data, displaying immediately')
        newLeaderboardData = buildLeaderboardFromData(balanceData, tradesData, positionsData)
        if (newLeaderboardData) {
          leaderboardData.value = newLeaderboardData
          dataLoaded.value = true // Mark as loaded since we have complete cache
        } else {
          // Fallback to placeholder if build fails
          leaderboardData.value = initializeLeaderboardWithAllModels()
        }
      } else {
        // No complete cache, initialize with placeholder data (showing --)
        console.log('⚠️ No complete cached data, initializing with placeholder models')
        leaderboardData.value = initializeLeaderboardWithAllModels()
        dataLoaded.value = false // Keep as false to show --
      }
    }

    // Step 1: Fetch balance data first
    let balanceResult = null
    try {
      balanceResult = await getAllModelsProcessedBalance(true)
      if (balanceResult && balanceResult.success) {
        balanceData = balanceResult
        setCachedData('balance', balanceResult)
        console.log('✅ Fetched fresh balance data for leaderboard')
      }
    } catch (error) {
      console.error('❌ Balance data fetch failed:', error)
    }

    // Step 2: Filter models with balance >= 500
    let validModels = null
    if (balanceData && balanceData.success && balanceData.accounts) {
      validModels = balanceData.accounts
        .filter(account => {
          if (!account.success || !account.data || account.data.length === 0) return false
          const usdtBalance = account.data.find(b => b.asset === 'USDT')
          if (!usdtBalance) return false
          const balance = parseFloat(usdtBalance.balance || usdtBalance.totalUsdtValue || 0)
          return balance >= 500
        })
        .map(account => account.modelInfo)
        .filter(model => model && model.uid)
      
      console.log(`✅ Found ${validModels.length} models with balance >= 500 for leaderboard`)
    }

    // Step 3: Fetch trades and positions only for valid models
    const fetchConfigs = [
      { 
        key: 'trades', 
        cacheKey: 'trades', 
        promise: getAllModelsProcessedTrades(undefined, undefined, true, validModels) 
      },
      { 
        key: 'positions', 
        cacheKey: 'positions', 
        promise: getAllModelsProcessedPositions(true, validModels) 
      }
    ]

    const results = await Promise.allSettled(fetchConfigs.map(p => p.promise))

    results.forEach((result, index) => {
      const { key, cacheKey } = fetchConfigs[index]
      if (result.status === 'fulfilled') {
        const data = result.value
        if (data && data.success) {
          console.log(`✅ Fetched fresh ${key} data for leaderboard`)
          setCachedData(cacheKey, data)
          if (key === 'trades') tradesData = data
          if (key === 'positions') positionsData = data
        } else {
          console.warn(`⚠️ ${key} data fetch returned unsuccessful response:`, data?.error)
        }
      } else {
        console.error(`❌ ${key} data fetch failed:`, result.reason)
      }
    })

    // Build fresh data in background, only update if successful
    newLeaderboardData = buildLeaderboardFromData(balanceData, tradesData, positionsData)

    // Only update if we got valid data, otherwise keep existing data
    if (newLeaderboardData && newLeaderboardData.length > 0) {
      leaderboardData.value = newLeaderboardData
      dataLoaded.value = true // Mark data as loaded
      console.log('✅ Leaderboard data updated successfully')
    } else {
      console.warn('⚠️ Failed to build fresh leaderboard data, keeping existing data')
      if (leaderboardData.value.length === 0) {
        // If we still have no data, initialize with placeholder
        leaderboardData.value = initializeLeaderboardWithAllModels()
        dataLoaded.value = false
      } else {
        // If we have existing data (placeholder or cached), check if it's placeholder
        // If it's placeholder, keep dataLoaded as false to continue showing --
        // If it's cached data, mark as loaded
        const hasPlaceholderData = leaderboardData.value.some(item => item.isPlaceholder)
        if (!hasPlaceholderData) {
          dataLoaded.value = true // We have real cached data
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to load leaderboard data:', error)
    // Keep existing data on error, only throw if we have no data at all
    if (leaderboardData.value.length === 0) {
      throw error
    }
  } finally {
    loading.value = false
  }
}

// Computed properties
const winningModel = computed(() => {
  return leaderboardData.value.length > 0 ? leaderboardData.value[0] : {
    name: 'Loading...',
    accountValue: 0,
    color: '#64748b',
    rank: 1
  }
})

const totalEquity = computed(() => {
  return leaderboardData.value.reduce((sum, model) => sum + (model.accountValue || 0), 0)
})

// Methods
const setActiveTab = (tab) => {
  activeTab.value = tab
}

const goToHome = () => {
  router.push('/')
}

const joinWaitlist = () => {
  alert('Join waitlist feature to be implemented')
}

const aboutRFGAI = () => {
  alert('About RFG AI feature to be implemented')
}

const getModelIcon = (modelName) => {
  return getModelIconPath(modelName)
}

// Determine if background color should be set
// Only GROK 4 needs background color (too similar to theme), others don't
const shouldShowBackground = (modelName) => {
  return modelName === 'GROK 4'
}

// Load data when component mounts
onMounted(() => {
  loadLeaderboardData(false) // Initial load with loading indicator

  // Set up auto-refresh every 30 seconds (30000ms)
  // Use silent mode to avoid showing loading indicator on auto-refresh
  refreshTimer = setInterval(() => {
    console.log('🔄 Auto-refreshing leaderboard data...')
    loadLeaderboardData(true) // Silent refresh, keep existing data visible
  }, 300000)
})

// Clean up timer when component unmounts
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
    console.log('🛑 Stopped leaderboard auto-refresh')
  }
})

const getBarHeight = (value) => {
  if (leaderboardData.value.length === 0) return 0
  const maxValue = Math.max(...leaderboardData.value.map(m => m.accountValue || 0))
  return maxValue > 0 ? (value / maxValue) * 100 : 0
}

const formatBarValue = (value) => {
  const numValue = value || 0
  // Check if on mobile (window width <= 960px)
  if (typeof window !== 'undefined' && window.innerWidth <= 960) {
    // Mobile: round to integer
    return Math.round(numValue).toLocaleString()
  }
  // Desktop: keep original format (may have decimals)
  return numValue.toLocaleString()
}

// Format number: show "--" on initial load, show actual number (including 0) on refresh
// When showing "--", don't show unit symbols like $ or %
const formatNumber = (value, options = {}) => {
  if (!dataLoaded.value) {
    return '--'
  }
  const numValue = value ?? 0
  if (options.currency) {
    if (options.decimals !== undefined) {
      return `$${numValue.toFixed(options.decimals)}`
    }
    return `$${numValue.toLocaleString()}`
  }
  if (options.percent) {
    const sign = options.showSign && numValue >= 0 ? '+' : (numValue < 0 ? '' : '')
    return `${sign}${numValue.toFixed(options.decimals || 2)}%`
  }
  if (options.decimals !== undefined) {
    return numValue.toFixed(options.decimals)
  }
  return numValue.toLocaleString()
}
</script>

<style lang="stylus" scoped>
.leaderboard-container
  min-height 100vh
  background #0f172a


.page-title
  width 95%
  margin 0 auto
  padding 30px 20px 15px
  font-size 48px
  font-weight 900
  color #f8fafc
  text-align center
  margin-bottom 20px
  font-family 'Inter', sans-serif

.tabs-container
  width 95%
  margin 0 auto
  padding 0 20px
  display flex
  justify-content center
  margin-bottom 20px

.tab
  padding 12px 24px
  margin 0 8px
  border-radius 8px
  cursor pointer
  font-weight 600
  font-size 14px
  transition all 0.3s ease

  &:not(.active)
    background-color #1a2230
    color #94a3b8

  &.active
    background-color #0f172a
    color #3b82f6

.leaderboard-table
  width 95%
  margin 0 auto 25px
  padding 0 20px
  background-color #1a2230
  border-radius 12px
  overflow hidden
  border 1px solid #2b3444
.table-header
  display grid
  grid-template-columns 60px 200px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr
  gap 16px
  padding 20px
  background-color #0f172a
  border-bottom 2px solid #2b3444
  font-weight 700
  font-size 14px
  color #f8fafc

  .col
    display flex
    align-items center
    gap 6px

    .tooltip-icon
      width 16px
      height 16px
      border-radius 50%
      background #3b82f6
      color #fff
      font-size 11px
      font-weight 700
      display flex
      align-items center
      justify-content center
      cursor help
      position relative
      flex-shrink 0

      &:hover::after
        content attr(title)
        position absolute
        top 50%
        left 100%
        transform translateY(-50%)
        margin-left 8px
        padding 8px 12px
        background #1e293b
        border 1px solid #2b3444
        border-radius 6px
        color #f8fafc
        font-size 12px
        font-weight 400
        white-space pre-line
        min-width 250px
        max-width 350px
        z-index 10000
        box-shadow 0 4px 12px rgba(0, 0, 0, 0.3)
        pointer-events none
        text-align left
        line-height 1.5

      &:hover::before
        content ''
        position absolute
        top 50%
        left 100%
        transform translateY(-50%)
        margin-left 2px
        border 6px solid transparent
        border-right-color #2b3444
        z-index 10001
        pointer-events none

.table-body
  .table-row
    display grid
    grid-template-columns 60px 200px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr
    gap 16px
    padding 16px 20px
    border-bottom 1px solid #2b3444
    font-size 14px
    align-items center

    &.alternate
      background-color #0f172a

    &:last-child
      border-bottom none

    // Ensure no hover effects
    &:hover
      background-color inherit
      cursor default

    .col
      display flex
      align-items center

      &.rank
        font-weight 700
        color #f8fafc

      &.model
        display flex
        align-items center
        gap 8px
        width 200px
        flex-shrink 0

        .model-icon
          width 24px
          height 24px
          border-radius 4px
          overflow hidden

          img
            width 100%
            height 100%
            object-fit cover

        .model-name
          font-weight 600
          color #f8fafc

      &.account-value
        font-weight 600
        color #f8fafc

      &.return-percent
        font-weight 600

        &.positive
          color #10b981
        &.negative
          color #ef4444

      &.total-pnl
        font-weight 600

        &.positive
          color #10b981
        &.negative
          color #ef4444

      &.fees
        color #94a3b8

      &.win-rate
        color #94a3b8

      &.biggest-win
        font-weight 600

        &.positive
          color #10b981
        &.negative
          color #ef4444

      &.biggest-loss
        font-weight 600

        &.positive
          color #10b981
        &.negative
          color #ef4444

      &.trades
        color #94a3b8

.summary-section
  width 95%
  margin 0 auto 25px
  display grid
  grid-template-columns 360px 1fr
  gap 25px
  align-items stretch

.summary-info
  background-color #1a2230
  border-radius 12px
  padding 24px
  border 1px solid #2b3444
  display flex
  flex-direction column
  justify-content center

  .summary-item
    display flex
    justify-content space-between
    align-items center
    margin-bottom 80px

    &:last-child, &:first-child
      .label
        font-weight 700
        color #f8fafc
        font-size 16px

      .value
        display flex
        align-items center
        gap 8px
        font-weight 600
        color #f8fafc
        font-size 16px

      .model-icon
        width 24px
        height 24px
        border-radius 50%
        overflow hidden
        padding 4px

        img
          width 100%
          height 100%
          object-fit cover
          border-radius 50%

      .bitcoin-icon
        width 24px
        height 24px
        background-color #f7931a
        border-radius 50%
        display flex
        align-items center
        justify-content center
        color #ffffff
        font-weight 700
        font-size 12px

    &:last-child
      margin-bottom 0
.visualization
  background-color #1a2230
  border-radius 12px
  padding 24px
  border 1px solid #2b3444
  display flex
  flex-direction column
  justify-content center

.model-diff
  display flex
  justify-content space-between

.bar-chart
  position relative
  .bar-visual
    height 220px
    display flex
    flex-direction column
    justify-content flex-end
    align-items center
    position relative
    width 60px
    margin 0 auto

    .bar
      width 100%
      min-height 20px
      border-radius 4px 4px 0 0
      transition all 0.3s ease

      &:hover
        opacity 0.8

      .bar-value
        position absolute
        top -35px
        left 50%
        transform translateX(-50%)
        font-size 12px
        font-weight 600
        color #f8fafc
        white-space nowrap
        z-index 10
        background rgba(26, 34, 48, 0.9)
        padding 2px 6px
        border-radius 4px

    .bar-icon
      position absolute
      bottom 35px
      left 50%
      transform translateX(-50%)
      width 24px
      height 24px
      border-radius 4px
      overflow hidden
      z-index 10

      img
        width 100%
        height 100%
        object-fit cover

  .model-info
    display flex
    flex-direction column
    align-items center
    margin-top 10px
    justify-content flex-end

    .bar-label
      font-size 11px
      font-weight 600
      color #94a3b8
      text-align center
      line-height 1.3
      max-width 100%
      word-wrap break-word

// Crypto icons styles
.crypto-icons
  display flex
  gap 8px
  align-items center

.crypto-icon
  width 24px
  height 24px
  border-radius 50%
  overflow hidden
  flex-shrink 0

  img
    width 100%
    height 100%
    object-fit cover

.footer-note
  width 95%
  max-width 800px
  margin 0 auto
  padding 0 20px 30px
  text-align center
  color #94a3b8
  font-size 14px
  line-height 1.5

// Mobile responsive styles
@media (max-width: 960px)
  .page-title
    font-size 24px
    padding 20px 15px 10px

  .tabs-container
    padding 0 15px

  .tab
    font-size 12px
    padding 10px 16px

  .leaderboard-table
    padding 0 15px

    // Hide table headers on mobile
    .table-header
      display none

    .table-body
      .table-row
        background #1a2230
        border 1px solid #2b3444
        border-radius 8px
        margin-bottom 12px
        padding 12px

        // Card layout
        display flex
        flex-direction row
        flex-wrap wrap
        gap 8px

        // Hide alternate background
        &.alternate
          background #1a2230

        .col
          display flex
          justify-content space-between
          align-items center
          padding 4px 0
          flex-basis calc(50% - 4px)

          &:not(.model):not(.rank):before
            content attr(data-label)
            color #94a3b8
            font-size 11px
            font-weight 600

          &.rank
            display none

          &.model
            order -1
            width 100%
            gap 8px
            padding-bottom 8px
            border-bottom 1px solid #2b3444
            margin-bottom 4px
            flex-basis 100%

            &:before
              content 'RANK #' attr(data-rank)
              color #3b82f6
              font-size 12px
              font-weight 700

          &.account-value, &.return-percent, &.total-pnl
            font-size 13px

          &.fees, &.win-rate, &.biggest-win, &.biggest-loss, &.trades
            font-size 12px

  .summary-section
    grid-template-columns 1fr
    gap 16px
    padding 0

  .summary-info
    padding 16px

    .summary-item
      margin-bottom 16px
      flex-direction column
      align-items flex-start
      gap 4px

      .label
        font-size 12px
        margin-bottom 2px

      .value
        font-size 12px
        word-break break-word

  .visualization
    padding 16px 8px

    .model-diff
      display flex
      flex-wrap nowrap
      justify-content space-between
      gap 12px
      padding-bottom 8px

      .bar-chart
        flex-shrink 0
        flex 1
        min-width 45px
        max-width 80px

        .bar-visual
          width 35px
          height 140px
          margin 0 auto

          .bar
            min-height 6px

          .bar-value
            font-size 12px
            top -30px
            padding 1px 4px

          .bar-icon
            display flex
            align-items center
            justify-content center
            width 24px
            height 24px
            margin 6px auto 0
            border-radius 4px

            img
              width 100%
              height 100%
              object-fit contain

        .model-info
          margin-top 4px
          display flex
          flex-direction column
          align-items center

          .bar-label
            display none
</style>
