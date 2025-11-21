<template lang="pug">
.model-detail-container
  Header

  // Loading state
  .loading-state(v-if="loading")
    .loading-icon 🔄
    .loading-text Loading model data...

  // Error state
  .error-state(v-if="error")
    .error-icon ❌
    .error-text Failed to load data: {{ error }}
    .error-retry(@click="loadModelData") Retry

  // Model info header
  .model-header
    .model-info
      .model-icon(:style="shouldShowBackground(currentModel.name) ? { backgroundColor: currentModel.color } : {}")
        img(:src="currentModel.icon" :alt="currentModel.name")
      .model-name {{ currentModel.name }}
    .model-stats
      .stat-item
        .label {{ $t('modelDetail.totalAccountValue') }}
        .value {{ formatNumber(currentModel.accountValue, { currency: true }) }}
      .stat-item
        .label {{ $t('modelDetail.availableCash') }}
        .value {{ formatNumber(currentModel.availableCash, { currency: true }) }}
      .stat-item
        .label
          span {{ $t('modelDetail.totalPnl') }} ({{$t('modelDetail.winRate')}})
          .tooltip-icon(:title="$t('modelDetail.totalPnlWinRateFormula')") ?
        .value(:class="dataLoaded && currentModel.totalPnl >= 0 ? 'positive' : (dataLoaded && currentModel.totalPnl < 0 ? 'negative' : '')")
          | {{ formatNumber(currentModel.totalPnl, { currency: true }) }}
          |  ({{ formatNumber(currentModel.returnPercent, { percent: true, decimals: 2 }) }})
      .stat-item
        .label {{ $t('modelDetail.totalFees') }}
        .value(:class="dataLoaded && (currentModel.totalFees || 0) >= 0 ? 'positive' : (dataLoaded && (currentModel.totalFees || 0) < 0 ? 'negative' : '')")
          | {{ formatNumber(currentModel.totalFees, { currency: true }) }}

  // Statistics
  .stats-section
    .stats-grid
      //.stat-card
        .stat-label {{ $t('modelDetail.averageLeverage') }}
        .stat-value {{ formatAverageLeverage(currentModel.averageLeverage) }}
      .stat-card
        .stat-label {{ $t('modelDetail.winRate') }}
        .stat-value {{ formatNumber(currentModel.winRate, { percent: true, decimals: 1 }) }}
      .stat-card
        .stat-label {{ $t('modelDetail.biggestWin') }}
        .stat-value.positive {{ formatNumber(currentModel.biggestWin, { currency: true }) }}
      .stat-card
        .stat-label {{ $t('modelDetail.biggestLoss') }}
        .stat-value.negative {{ formatNumber(currentModel.biggestLoss, { currency: true }) }}
      .stat-card
        .stat-label {{ $t('modelDetail.long') }}
        .stat-value {{ formatNumber(currentModel.holdTimes.long, { percent: true, decimals: 0 }) }}
      .stat-card
        .stat-label {{ $t('modelDetail.short') }}
        .stat-value {{ formatNumber(currentModel.holdTimes.short, { percent: true, decimals: 0 }) }}
    //.hold-times
      .hold-times-title Hold Times
      .hold-times-grid
        .hold-time-item
          .label Long
          .value {{ currentModel.holdTimes.long }}%
        .hold-time-item
          .label Short
          .value {{ currentModel.holdTimes.short }}%
        //.hold-time-item
          .label Flat
          .value {{ currentModel.holdTimes.flat }}%

  // Active positions
  .positions-section
    .section-header
      .section-title {{ $t('modelDetail.activePositions') }}
      .total-pnl {{ $t('modelDetail.totalUnrealizedPnl') }}
        span(:class="dataLoaded && currentModel.totalUnrealizedPnl >= 0 ? 'positive' : (dataLoaded && currentModel.totalUnrealizedPnl < 0 ? 'negative' : '')") {{ formatNumber(currentModel.totalUnrealizedPnl, { currency: true }) }}
    .positions-grid
      .position-card(v-for="position in currentModel.positions" :key="position.id")
        .position-header
          .coin-info
            .coin-icon
              img(:src="getCryptoIcon(position.coin)" :alt="position.coin" v-if="getCryptoIcon(position.coin)")
            .coin-name {{ position.coin }}
          .side(:class="position.side.toLowerCase()") {{ position.side }}

        .position-details
          .detail-row
            .label {{ $t('modelDetail.entryTimeLabel') }}
            .value {{ position.entryTime }}
          .detail-row
            .label {{ $t('modelDetail.entryPrice') }}
            .value ${{ formatCurrency(position.entryPrice) }}
          .detail-row
            .label {{ $t('modelDetail.quantity') }}
            .value {{ formatQuantity(position.quantity) }}
          .detail-row
            .label Leverage
            .value {{ position.leverage }}x
          .detail-row
            .label {{ $t('modelDetail.liquidationPrice') }}
            .value ${{ formatCurrency(position.liquidationPrice) }}
          .detail-row
            .label {{ $t('modelDetail.margin') }}
            .value ${{ formatCurrency(position.margin) }}
          .detail-row
            .label {{ $t('modelDetail.unrealizedPnl') }}
            .value(:class="position.unrealPnl >= 0 ? 'positive' : 'negative'")
              | ${{ formatCurrency(position.unrealPnl) }}
          .detail-row
            .label {{ $t('modelDetail.notional') }}
            .value ${{ formatCurrency(position.notional) }}

      // No positions data state
      .no-positions-data(v-if="currentModel.positions.length === 0")
        .no-data-icon 📊
        .no-data-text {{ $t('modelDetail.noPositionData') }}
        .no-data-subtitle {{ $t('modelDetail.noPositionSubtitle') }}

  // Recent trades
  .trades-section
    .section-title {{ $t('modelDetail.last25Trades') }}

    .trades-table
      .table-header
        .col {{ $t('modelDetail.side') }}
        .col {{ $t('modelDetail.coin') }}
        .col {{ $t('modelDetail.entryPrice') }}
        .col {{ $t('modelDetail.exitPrice') }}
        .col {{ $t('modelDetail.quantity') }}
        .col {{ $t('modelDetail.holdingTime') }}
        .col {{ $t('modelDetail.entryTime') }}
        .col {{ $t('modelDetail.closeTime') }}
        .col {{ $t('modelDetail.fees') }}
        .col {{ $t('modelDetail.notionalEntry') }}
        .col {{ $t('modelDetail.notionalExit') }}
        .col {{ $t('modelDetail.netPnl') }}

      .table-body
        .table-row(v-for="trade in currentModel.recentTrades" :key="trade.id")
          .col(:data-label="$t('modelDetail.side')")
            .side(:class="trade.side.toLowerCase()") {{ trade.side }}
          .col(:data-label="$t('modelDetail.coin')")
            .coin-info
              .coin-icon
                img(:src="getCryptoIcon(trade.coin)" :alt="trade.coin" v-if="getCryptoIcon(trade.coin)")
              .coin-name {{ trade.coin }}
          .col(:data-label="$t('modelDetail.entryPrice')") ${{ formatCurrency(trade.entryPrice) }}
          .col(:data-label="$t('modelDetail.exitPrice')") ${{ formatCurrency(trade.exitPrice) }}
          .col(:data-label="$t('modelDetail.quantity')") {{ formatQuantity(trade.quantity) }}
          .col(:data-label="$t('modelDetail.holdingTime')") {{ trade.holdingTime }}
          .col(:data-label="$t('modelDetail.entryTime')") {{ formatBeijingTime(trade.entryBeijingTime) }}
          .col(:data-label="$t('modelDetail.closeTime')") {{ formatBeijingTime(trade.closeBeijingTime) }}
          .col(:data-label="$t('modelDetail.fees')") ${{ formatCurrency(trade.totalFees) }}
          .col(:data-label="$t('modelDetail.notionalEntry')") ${{ formatCurrency(trade.notionalEntry) }}
          .col(:data-label="$t('modelDetail.notionalExit')") ${{ formatCurrency(trade.notionalExit) }}
          .col(:class="trade.netPnl >= 0 ? 'positive' : 'negative'" :data-label="$t('modelDetail.netPnl')")
            | ${{ formatCurrency(trade.netPnl) }}

      // No trades data state
      .no-trades-data(v-if="currentModel.recentTrades.length === 0")
        .no-data-icon 📈
        .no-data-text {{ $t('modelDetail.noTradeRecords') }}
        .no-data-subtitle {{ $t('modelDetail.noTradeSubtitle') }}
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import { getAllModelInfo, getModelIconPath, getAccountBalanceData, getAccountByModelName, DEFAULT_INITIAL_CAPITAL } from '@/config/accounts.js'
import { getModelBalance } from '@/utils/newBalanceService.js'
import { getModelPositions } from '@/utils/newPositionsService.js'
import { getModelTrades, processTradesData } from '@/utils/newTradesService.js'
import { calculateTradingStats, calculateSharpeRatio, calculateMaxDrawdown } from '@/utils/tradingStatsCalculator.js'
import { getCryptoIcon } from '@/utils/cryptoIcons.js'
import { setCachedApiData } from '@/utils/dataCache.js'

const route = useRoute()

// Data loading state
const loading = ref(false)
const error = ref(null)

// Track if data has been loaded at least once
const dataLoaded = ref(false)

// Model data - initialized with default data, dynamically get real data later
const models = ref(getAllModelInfo().map(model => ({
  name: model.name,
  slug: model.slug,
  icon: getModelIconPath(model.name),
  color: model.color,
  accountValue: 0,
  availableCash: 0,
  totalPnl: 0,
  totalFees: 0,
  netRealized: 0,
  returnPercent: 0,
  averageLeverage: '0.0',
  averageConfidence: 0,
  biggestWin: 0,
  biggestLoss: 0,
  holdTimes: {
    long: 0,
    short: 0,
    flat: 0
  },
  totalUnrealizedPnl: 0,
  positions: [],
  recentTrades: []
})))

// Current model
const currentModel = computed(() => {
  const slug = route.params.slug
  return models.value.find(model => model.slug === slug) || models.value[0]
})

// Determine if background color should be set
// Only GROK 4 needs background color (too similar to theme), others don't
const shouldShowBackground = (modelName) => {
  return modelName === 'GROK 4'
}

// Dynamically get model data
const loadModelData = async () => {
  // Prevent multiple simultaneous loads
  if (loading.value) {
    console.log('⏸️ Already loading, skipping...')
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('🔄 Loading model detail data...')

    // Get current model from route params
    const currentModelSlug = route.params.slug
    const currentModel = models.value.find(model => model.slug === currentModelSlug)

    if (!currentModel) {
      console.error(`❌ Model not found for slug: ${currentModelSlug}`)
      error.value = 'Model not found'
      return
    }

    const accountConfig = getAccountByModelName(currentModel.name)
    console.log(`🔍 Account config for ${currentModel.name}:`, {
      enabled: accountConfig?.enabled,
      uid: accountConfig?.uid,
      modelName: accountConfig?.modelName
    })

    if (!accountConfig || !accountConfig.enabled) {
      error.value = 'Account not enabled'
      return
    }

    try {
      console.log(`🔍 Loading data for model: ${currentModel.name}, UID: ${accountConfig.uid}`)
      loading.value = true

      // Helper function to process and update model data
      const processAndUpdateModelData = (balance, trades, positions) => {
        try {
          // Process balance data - same as Leaderboard
          let balanceData = null
          let accountValue = 0
          let availableCash = 0
          if (balance && balance.status === 'fulfilled' && balance.value.success) {
            const apiData = balance.value.data
            // Use total_value directly from API response (same as Leaderboard uses balance.balance)
            // In processBalanceData, balance.balance = data.total_value
            accountValue = parseFloat(apiData.total_value || 0)
            availableCash = parseFloat(apiData.available_cash || 0)

            if (apiData.active_balances && apiData.active_balances.length > 0) {
              balanceData = apiData.active_balances.find(b => b.asset === 'USDT')
              if (balanceData) {
                // Set balance.balance to total_value (same as processBalanceData does)
                balanceData.balance = apiData.total_value ? apiData.total_value.toString() : "0"
                balanceData.totalUsdtValue = apiData.total_value || 0
                balanceData.crossWalletBalance = apiData.total_value ? apiData.total_value.toString() : "0"
                balanceData.crossUnPnl = (accountValue - availableCash) ? (accountValue - availableCash).toString() : "0"
                balanceData.uid = apiData.uid
                balanceData.walletName = apiData.wallet_name
                balanceData.availableBalance = apiData.available_cash ? apiData.available_cash.toString() : "0"
              }
            }
          }

          // Process trading history, filter out trades with realizedPnl === 0
          let tradesData = []
          if (trades && trades.status === 'fulfilled' && trades.value.success) {
            const apiData = trades.value.data
            tradesData = processTradesData({ data: apiData }, accountConfig)
          }

          // Process position data
          let positionsData = []
          let totalUnrealizedPositionsPnl = 0
          if (positions && positions.status === 'fulfilled' && positions.value.success) {
            const apiData = positions.value.data
            if (apiData.positions && apiData.positions.length > 0) {
              positionsData = apiData.positions.map(position => ({
                ...position,
                uid: apiData.uid,
                walletName: apiData.wallet_name,
                totalPositions: apiData.total_positions
              }))
              totalUnrealizedPositionsPnl = positionsData.reduce((sum, position) => {
                const pnl = parseFloat(position.unRealizedProfit ?? position.netUnrealizedPnl ?? 0)
                return sum + (isNaN(pnl) ? 0 : pnl)
              }, 0)
            }
          }

          // Calculate statistics
          const stats = calculateTradingStats(tradesData)
          const sharpeRatio = calculateSharpeRatio(tradesData)
          const maxDrawdown = calculateMaxDrawdown(tradesData)

          const initialCapital = accountConfig.initialCapital || DEFAULT_INITIAL_CAPITAL
          const fees = stats.totalCommission || 0

          // 新的 TOTAL P&L 计算公式: ACCT VALUE + FEES - 初始本金
          const totalPnl = accountValue + fees - initialCapital

          // 新的回报率计算公式: (ACCT VALUE + FEES - 初始本金) / 初始本金
          const returnPercent = initialCapital > 0 ? ((accountValue + fees - initialCapital) / initialCapital) * 100 : 0

          // 计算新的胜率: (已平仓盈利订单数 + 未平仓盈利订单数) / (已平仓订单数 + 未平仓订单数)
          // 已平仓的盈利订单数量
          const closedWinTrades = tradesData.filter(trade => {
            const pnl = parseFloat(trade.realizedPnl || 0)
            return pnl > 0
          }).length

          // 当前未平仓的盈利订单数量
          const openWinPositions = positionsData.filter(position => {
            const pnl = parseFloat(position.unRealizedProfit ?? position.netUnrealizedPnl ?? 0)
            return pnl > 0
          }).length

          // 已平仓的订单总数
          const closedTradesCount = tradesData.length

          // 当前持仓的订单总数
          const openPositionsCount = positionsData.length

          // 计算胜率
          const totalOrders = closedTradesCount + openPositionsCount
          const winRate = totalOrders > 0 ? ((closedWinTrades + openWinPositions) / totalOrders) * 100 : 0

          // Update model data
          const modelIndex = models.value.findIndex(m => m.slug === currentModelSlug)
          if (modelIndex !== -1) {
            models.value[modelIndex] = {
              ...models.value[modelIndex],
              accountValue: accountValue,
              availableCash: availableCash,
              totalPnl: totalPnl,
              totalUnrealizedPnl: totalUnrealizedPositionsPnl,
              totalFees: fees,
              netRealized: stats.totalProfit || 0,
              returnPercent: returnPercent,
              averageLeverage: (() => {
                const leverageValues = tradesData
                  .map(trade => parseFloat(trade.leverage))
                  .filter(value => !isNaN(value) && value > 0)
                if (leverageValues.length === 0) return 'N/A'
                const avg = leverageValues.reduce((sum, value) => sum + value, 0) / leverageValues.length
                return avg.toFixed(1)
              })(),
              averageConfidence: Math.round(winRate * 100) / 100, // 保留2位小数
              biggestWin: stats.biggestWin || 0,
              biggestLoss: stats.biggestLoss || 0,
              holdTimes: {
                long: stats.totalTrades > 0 ? Math.round((stats.longTrades / stats.totalTrades) * 100) : 0,
                short: stats.totalTrades > 0 ? Math.round((stats.shortTrades / stats.totalTrades) * 100) : 0,
                flat: 0
              },
              totalTrades: stats.totalTrades || 0,
              winRate: Math.round(winRate * 100) / 100, // 使用新计算的胜率，保留2位小数
              winTrades: stats.winTrades || 0,
              lossTrades: stats.lossTrades || 0,
              averageWin: stats.averageWin || 0,
              averageLoss: stats.averageLoss || 0,
              profitLossRatio: stats.profitLossRatio || 0,
              sharpeRatio: sharpeRatio || 0,
              maxDrawdown: maxDrawdown || 0,
              positions: positionsData.map((position, index) => ({
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
                notional: Math.abs(parseFloat(position.notional || 0)) // Display absolute value as amount
              })),
              recentTrades: tradesData
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 25)
                .map((trade, index) => {
                  const direction = (trade.direction || trade.positionSide || '').toUpperCase()
                  const side = direction === 'SHORT' ? 'SHORT' : (trade.side === 'SELL' ? 'SHORT' : 'LONG')
                  const entryPrice = parseFloat(trade.entryPrice ?? 0)
                  const exitPrice = parseFloat(trade.exitPrice ?? entryPrice)
                  const quantity = parseFloat(trade.quantity ?? 0)
                  const absQty = Math.abs(quantity)
                  // Notional values should be absolute amounts (always positive)
                  const notionalEntry = !isNaN(entryPrice) ? Math.abs(entryPrice * absQty) : 0
                  const notionalExit = !isNaN(exitPrice) ? Math.abs(exitPrice * absQty) : notionalEntry
                  return {
                    id: index + 1,
                    side,
                    coin: trade.symbol ? trade.symbol.replace('USDT', '') : '',
                    entryPrice,
                    exitPrice,
                    quantity: side === 'SHORT' ? -absQty : absQty,
                    holdingTime: trade.holdingTime || trade.holding_time || 'N/A',
                    entryBeijingTime: trade.entry_beijing_time || null,
                    closeBeijingTime: trade.close_beijing_time || null,
                    notionalEntry,
                    notionalExit,
                    totalFees: Math.abs(parseFloat(trade.feesTotal ?? trade.commission ?? trade.fees_total ?? 0)),
                    netPnl: parseFloat(trade.realizedPnl ?? trade.net_pnl ?? 0)
                  }
                })
            }
          }

          loading.value = false // Stop loading when data is processed
          dataLoaded.value = true // Mark data as loaded
          console.log(`✅ Model data updated for ${currentModel.name}`)
        } catch (error) {
          console.error(`❌ Error processing data for ${currentModel.name}:`, error)
        }
      }

      const fetchPromises = [
        { key: 'balance', cacheKey: 'aster/balance', promise: getModelBalance(accountConfig.uid, true) },
        { key: 'trades', cacheKey: 'aster/closed-trades', promise: getModelTrades(accountConfig.uid, 'BTCUSDT', 10000, true) },
        { key: 'positions', cacheKey: 'aster/positions', promise: getModelPositions(accountConfig.uid, true) }
      ]

      const results = await Promise.allSettled(fetchPromises.map(p => p.promise))

      const balanceResult = results[0]
      const tradesResult = results[1]
      const positionsResult = results[2]

      // Update caches with fresh data
      fetchPromises.forEach((item, index) => {
        const result = results[index]
        if (result.status === 'fulfilled' && result.value?.success) {
          setCachedApiData(item.cacheKey, accountConfig.uid, result.value.data)
        }
      })

      const hasSuccessfulData =
        (balanceResult.status === 'fulfilled' && balanceResult.value?.success) ||
        (tradesResult.status === 'fulfilled' && tradesResult.value?.success) ||
        (positionsResult.status === 'fulfilled' && positionsResult.value?.success)

      if (hasSuccessfulData) {
        console.log(`📥 Processing fresh data for ${currentModel.name}`)
        processAndUpdateModelData(balanceResult, tradesResult, positionsResult)
      } else {
        throw new Error('No data available from API')
      }
    } catch (error) {
      console.error(`❌ Failed to get ${currentModel.name} data:`, error)
      error.value = `Failed to load data: ${error.message}`
      loading.value = false
    }

    console.log('✅ Model detail data loaded successfully')
  } catch (error) {
    console.error('❌ Failed to load model detail data:', error)
    error.value = error.message
  } finally {
    loading.value = false
  }
}

// Format currency function - handle NaN and 4 decimal places
const formatCurrency = (value) => {
  if (!dataLoaded.value) {
    return '--'
  }
  if (isNaN(value) || value === null || value === undefined) {
    return '0.0000'
  }
  return parseFloat(value).toFixed(4)
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

// Format average leverage: show "--" on initial load, show "N/A" if no leverage data, otherwise show value with "x" suffix
const formatAverageLeverage = (value) => {
  if (!dataLoaded.value) {
    return '--'
  }
  if (value === 'N/A' || value === null || value === undefined) {
    return 'N/A'
  }
  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return 'N/A'
  }
  return `${numValue.toFixed(1)}x`
}

// Format quantity function
const formatQuantity = (value) => {
  if (!dataLoaded.value) {
    return '--'
  }
  if (isNaN(value) || value === null || value === undefined) {
    return '0.0000'
  }
  return parseFloat(value).toFixed(4)
}

// Format Beijing time function
const formatBeijingTime = (timeString) => {
  if (!timeString) return 'N/A'
  try {
    const date = new Date(timeString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`
  } catch (error) {
    return timeString
  }
}

// Load data when component mounts
onMounted(() => {
  loadModelData()
})

// Watch for route changes (when switching between models)
watch(() => route.params.slug, (newSlug, oldSlug) => {
  if (newSlug !== oldSlug) {
    console.log(`🔄 Route changed from ${oldSlug} to ${newSlug}, reloading data...`)
    loadModelData()
  }
})
</script>

<style lang="stylus" scoped>
.model-detail-container
  min-height 100vh
  background #0f172a

// Loading state styles
.loading-state
  display flex
  flex-direction column
  align-items center
  justify-content center
  padding 60px 20px
  text-align center

  .loading-icon
    font-size 48px
    margin-bottom 16px
    animation spin 1s linear infinite

  .loading-text
    font-size 18px
    font-weight 600
    color #64748b

// Error state styles
.error-state
  display flex
  flex-direction column
  align-items center
  justify-content center
  padding 60px 20px
  text-align center

  .error-icon
    font-size 48px
    margin-bottom 16px

  .error-text
    font-size 18px
    font-weight 600
    color #ef4444
    margin-bottom 16px

  .error-retry
    padding 8px 16px
    background #3b82f6
    color white
    border-radius 4px
    cursor pointer
    font-weight 600

    &:hover
      background #2563eb

// Rotation animation
@keyframes spin
  from
    transform rotate(0deg)
  to
    transform rotate(360deg)

// No data state styles
.no-positions-data, .no-trades-data
  display flex
  flex-direction column
  align-items center
  justify-content center
  padding 40px 20px
  text-align center

  .no-data-icon
    font-size 48px
    margin-bottom 16px
    opacity 0.6

  .no-data-text
    font-size 18px
    font-weight 600
    color #64748b
    margin-bottom 8px

  .no-data-subtitle
    font-size 14px
    color #94a3b8
    opacity 0.8

.model-header
  width 95%
  margin 0 auto
  padding 40px 20px
  display flex
  justify-content space-between
  align-items flex-start
  gap 40px

.model-info
  display flex
  align-items center
  gap 16px
  margin-bottom 0

.model-name
  font-size 32px
  font-weight 700
  color #f8fafc

.model-icon
  width 80px
  height 80px
  border-radius 50%
  padding 12px
  display flex
  align-items center
  justify-content center

  img
    width 56px
    height 56px
    border-radius 50%
    object-fit cover

.model-stats
  display flex
  gap 24px
  flex-wrap wrap

.stat-item
  .label
    font-size 14px
    color #94a3b8
    margin-bottom 4px
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
        top 100%
        left 50%
        transform translateX(-50%)
        margin-top 8px
        padding 10px 14px
        background #1e293b
        border 1px solid #2b3444
        border-radius 6px
        color #f8fafc
        font-size 12px
        font-weight 400
        white-space pre-line
        min-width 300px
        max-width 450px
        z-index 10000
        box-shadow 0 4px 12px rgba(0, 0, 0, 0.3)
        pointer-events none
        text-align left
        line-height 1.5

      &:hover::before
        content ''
        position absolute
        top 100%
        left 50%
        transform translateX(-50%)
        margin-top 2px
        border 6px solid transparent
        border-bottom-color #2b3444
        z-index 10001
        pointer-events none

  .value
    font-size 18px
    font-weight 600
    color #f8fafc

    &.positive
      color #10b981

    &.negative
      color #ef4444

.performance-summary
  display flex
  flex-direction column
  gap 16px

.summary-item
  text-align right

  .label
    font-size 14px
    color #94a3b8
    margin-bottom 4px

  .value
    font-size 20px
    font-weight 700
    color #f8fafc

    &.positive
      color #10b981

    &.negative
      color #ef4444

  .note
    font-size 12px
    color #64748b
    margin-top 4px

.stats-section
  width 95%
  margin 0 auto
  padding 0 20px 40px

.stats-grid
  display grid
  grid-template-columns repeat(5, 1fr)
  gap 24px

.stat-card
  background #1e293b
  border-radius 12px
  padding 24px
  text-align center

  .stat-label
    font-size 14px
    color #94a3b8
    margin-bottom 8px

  .stat-value
    font-size 20px
    font-weight 700
    color #f8fafc

    &.positive
      color #10b981

    &.negative
      color #ef4444

.hold-times
  background #1e293b
  border-radius 12px
  padding 24px

  .hold-times-title
    font-size 18px
    font-weight 600
    color #f8fafc
    margin-bottom 16px

.hold-times-grid
  display grid
  grid-template-columns repeat(3, 1fr)
  gap 24px

.hold-time-item
  text-align center

  .label
    font-size 14px
    color #94a3b8
    margin-bottom 4px

  .value
    font-size 20px
    font-weight 600
    color #f8fafc

.positions-section
  width 95%
  margin 0 auto
  padding 0 20px 40px

.section-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 24px

.section-title
  font-size 24px
  font-weight 700
  color #f8fafc

.total-pnl
  font-size 16px
  color #94a3b8

  span.positive
    color #10b981
    font-weight 600
  span.negative
    color #ef4444

.positions-grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(400px, 1fr))
  gap 24px

.position-card
  background #1e293b
  border-radius 12px
  padding 24px

.position-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 20px

.coin-info
  display flex
  align-items center
  gap 12px

.coin-icon
  width 32px
  height 32px
  background #3b82f6
  border-radius 50%
  display flex
  align-items center
  justify-content center
  color #f8fafc
  font-weight 600

.coin-name
  font-size 16px
  font-weight 600
  color #f8fafc

.side
  padding 6px 12px
  border-radius 6px
  font-size 12px
  font-weight 600
  text-transform uppercase

  &.long
    background #10b98120
    color #10b981

  &.short
    background #ef444420
    color #ef4444

.position-details
  display grid
  grid-template-columns repeat(2, 1fr)
  gap 16px

.detail-row
  .label
    font-size 12px
    color #94a3b8
    margin-bottom 4px

  .value
    font-size 14px
    font-weight 600
    color #f8fafc

    &.positive
      color #10b981

    &.negative
      color #ef4444

// Coin icon styles
.coin-info
  display flex
  align-items center
  gap 8px

  .coin-icon
    width 20px
    height 20px
    border-radius 50%
    overflow hidden
    flex-shrink 0

    img
      width 100%
      height 100%
      object-fit cover

  .coin-name
    font-weight 600
    color #f8fafc

.trades-section
  width 95%
  margin 0 auto
  padding 0 20px 40px

.section-title
  font-size 24px
  font-weight 700
  color #f8fafc
  margin-bottom 24px

.trades-table
  background #1e293b
  border-radius 12px
  overflow hidden

.table-header
  display grid
  grid-template-columns repeat(12, 1fr)
  gap 16px
  padding 16px 24px
  background #334155
  font-size 12px
  font-weight 600
  color #94a3b8
  text-transform uppercase

.table-body
  .table-row
    display grid
    grid-template-columns repeat(12, 1fr)
    gap 16px
    padding 16px 24px
    border-bottom 1px solid #334155
    font-size 14px
    color #f8fafc

    &:last-child
      border-bottom none

    &:hover
      background-color inherit
      cursor default

.col
  display flex
  align-items center

  .side
    padding 4px 8px
    border-radius 4px
    font-size 10px
    font-weight 600
    text-transform uppercase

    &.long
      background #10b98120
      color #10b981

    &.short
      background #ef444420
      color #ef4444

  .coin-info
    display flex
    align-items center
    gap 8px

    .coin-icon
      width 24px
      height 24px
      background #3b82f6
      border-radius 50%
      display flex
      align-items center
      justify-content center
      color #f8fafc
      font-size 10px
      font-weight 600

    .coin-name
      font-weight 600

  &.positive
    color #10b981

  &.negative
    color #ef4444

// Mobile responsive styles
@media (max-width: 960px)
  .model-header
    padding 20px 0
    flex-direction column
    gap 0

    .model-info
      gap 0

      .model-icon
        width 44px
        height 44px
        padding 0
        margin-right 12px

        img
          width 44px
          height 44px

    .model-details
      .model-name
        font-size 24px
        margin-bottom 12px

    .model-stats
      gap 16px

      .stat-item
        .label
          font-size 12px

        .value
          font-size 14px

  .stats-section
    padding 0 0 30px

    .stats-grid
      grid-template-columns repeat(2, 1fr)
      gap 16px
      margin-bottom 24px

      .stat-card
        padding 16px

        .stat-label
          font-size 12px

        .stat-value
          font-size 18px

    .hold-times
      padding 16px

      .hold-times-title
        font-size 16px
        margin-bottom 12px

    .hold-times-grid
      gap 16px

      .hold-time-item
        .label
          font-size 12px

        .value
          font-size 16px

  .positions-section
    padding 0 0 30px

    .section-header
      margin-bottom 16px

    .section-title
      font-size 18px

    .total-pnl
      font-size 13px

    .positions-grid
      grid-template-columns 1fr
      gap 12px

    .position-card
      padding 16px

    .position-header
      margin-bottom 16px

    .coin-info
      gap 8px

      .coin-icon
        width 24px
        height 24px

      .coin-name
        font-size 14px

    .position-details
      grid-template-columns repeat(2, 1fr)
      gap 8px

    .detail-row
      .label
        font-size 11px

      .value
        font-size 13px

  .trades-section
    padding 0 0 30px

    .section-title
      font-size 18px
      margin-bottom 16px

    .trades-table
      .table-header
        display none

    .table-body
      .table-row
        background #1a2230
        border 1px solid #2b3444
        border-radius 8px
        margin-bottom 12px
        padding 12px
        display flex
        flex-direction row
        flex-wrap wrap
        gap 8px

        &:last-child
          margin-bottom 0

        .col
          flex-basis calc(50% - 4px)
          display flex
          justify-content space-between
          align-items center
          padding 4px 0
          font-size 12px

          &:not(:first-child):not(:nth-child(2)):before
            content attr(data-label)
            color #94a3b8
            font-size 11px
            font-weight 600
            margin-right 8px

          &:first-child
            flex-basis 100%
            padding-bottom 8px
            border-bottom 1px solid #2b3444
            margin-bottom 4px

          &:nth-child(2)
            flex-basis 100%
            padding-bottom 8px
            border-bottom 1px solid #2b3444
            margin-bottom 4px

          .side
            padding 3px 6px
            font-size 9px

          .coin-info
            gap 6px

            .coin-icon
              width 20px
              height 20px

            .coin-name
              font-size 12px

          &.positive
            color #10b981

          &.negative
            color #ef4444
</style>
