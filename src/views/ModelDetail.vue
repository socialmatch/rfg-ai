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
      .model-details
        .model-name {{ currentModel.name }}
        .model-stats
          .stat-item
            .label Total Account Value
            .value ${{ currentModel.accountValue.toLocaleString() }}
          .stat-item
            .label Available Cash
            .value ${{ currentModel.availableCash.toLocaleString() }}
          .stat-item
            .label Total P&L
            .value(:class="currentModel.totalPnl >= 0 ? 'positive' : 'negative'")
              | ${{ currentModel.totalPnl.toLocaleString() }}
          .stat-item
            .label Total Fees
            .value(:class="(currentModel.totalFees || 0) >= 0 ? 'positive' : 'negative'")
              | ${{ formatCurrency(currentModel.totalFees) }}
          .stat-item
            .label RETURN %
            .value(:class="(currentModel.returnPercent || 0) >= 0 ? 'positive' : 'negative'")
              | {{ (currentModel.returnPercent || 0) >= 0 ? '+' : '' }}{{ (currentModel.returnPercent || 0).toFixed(2) }}%

  // Statistics
  .stats-section
    .stats-grid
      .stat-card
        .stat-label Average Leverage
        .stat-value {{ currentModel.averageLeverage }}
      .stat-card
        .stat-label Average Confidence
        .stat-value {{ currentModel.averageConfidence }}%
      .stat-card
        .stat-label Biggest Win
        .stat-value.positive ${{ formatCurrency(currentModel.biggestWin) }}
      .stat-card
        .stat-label Biggest Loss
        .stat-value.negative ${{ formatCurrency(currentModel.biggestLoss) }}

    .hold-times
      .hold-times-title Hold Times
      .hold-times-grid
        .hold-time-item
          .label Long
          .value {{ currentModel.holdTimes.long }}%
        .hold-time-item
          .label Short
          .value {{ currentModel.holdTimes.short }}%
        .hold-time-item
          .label Flat
          .value {{ currentModel.holdTimes.flat }}%

  // Active positions
  .positions-section
    .section-header
      .section-title ACTIVE POSITIONS
      .total-pnl Total Unrealized P&L:
        span.positive ${{ formatCurrency(currentModel.totalUnrealizedPnl) }}

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
            .label Entry Time
            .value {{ position.entryTime }}
          .detail-row
            .label Entry Price
            .value ${{ formatCurrency(position.entryPrice) }}
          .detail-row
            .label Quantity
            .value {{ formatQuantity(position.quantity) }}
          .detail-row
            .label Leverage
            .value {{ position.leverage }}x
          .detail-row
            .label Liquidation Price
            .value ${{ formatCurrency(position.liquidationPrice) }}
          .detail-row
            .label Margin
            .value ${{ formatCurrency(position.margin) }}
          .detail-row
            .label Unrealized P&L
            .value(:class="position.unrealPnl >= 0 ? 'positive' : 'negative'")
              | ${{ formatCurrency(position.unrealPnl) }}
          .detail-row
            .label Notional
            .value ${{ formatCurrency(position.notional) }}

      // No positions data state
      .no-positions-data(v-if="currentModel.positions.length === 0")
        .no-data-icon 📊
        .no-data-text No position data
        .no-data-subtitle Current account has no active positions

  // Recent trades
  .trades-section
    .section-title LAST 25 TRADES

    .trades-table
      .table-header
        .col SIDE
        .col COIN
        .col ENTRY PRICE
        .col EXIT PRICE
        .col QUANTITY
        .col HOLDING TIME
        .col NOTIONAL ENTRY
        .col NOTIONAL EXIT
        .col TOTAL FEES
        .col NET P&L

      .table-body
        .table-row(v-for="trade in currentModel.recentTrades" :key="trade.id")
          .col
            .side(:class="trade.side.toLowerCase()") {{ trade.side }}
          .col
            .coin-info
              .coin-icon
                img(:src="getCryptoIcon(trade.coin)" :alt="trade.coin" v-if="getCryptoIcon(trade.coin)")
              .coin-name {{ trade.coin }}
          .col ${{ formatCurrency(trade.entryPrice) }}
          .col ${{ formatCurrency(trade.exitPrice) }}
          .col {{ formatQuantity(trade.quantity) }}
          .col {{ trade.holdingTime }}
          .col ${{ formatCurrency(trade.notionalEntry) }}
          .col ${{ formatCurrency(trade.notionalExit) }}
          .col ${{ formatCurrency(trade.totalFees) }}
          .col(:class="trade.netPnl >= 0 ? 'positive' : 'negative'")
            | ${{ formatCurrency(trade.netPnl) }}

      // No trades data state
      .no-trades-data(v-if="currentModel.recentTrades.length === 0")
        .no-data-icon 📈
        .no-data-text No trade records
        .no-data-subtitle Current account has no trading history
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import { getAllModelInfo, getModelIconPath, getAccountBalanceData, getAccountByModelName } from '@/config/accounts.js'
import { getModelBalance } from '@/utils/newBalanceService.js'
import { getModelPositions } from '@/utils/newPositionsService.js'
import { getModelTrades } from '@/utils/newTradesService.js'
import { calculateTradingStats, calculateSharpeRatio, calculateMaxDrawdown } from '@/utils/tradingStatsCalculator.js'
import { getCryptoIcon } from '@/utils/cryptoIcons.js'
import { getCachedApiData, setCachedApiData } from '@/utils/dataCache.js'

const route = useRoute()

// Data loading state
const loading = ref(false)
const error = ref(null)

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

// Determine if background color should be set (Rfg_logo image has built-in background)
const shouldShowBackground = (modelName) => {
  const iconPath = getModelIconPath(modelName)
  return !iconPath.includes('Rfg_logo')
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
      // Check cache first for this model
      console.log(`🔍 Loading data for model: ${currentModel.name}, UID: ${accountConfig.uid}`)
      let balanceResult, tradesResult, positionsResult
      // Get cached data (always use cache if available, no TTL check)
      const cachedBalance = getCachedApiData('aster/balance', accountConfig.uid)
      const cachedTrades = getCachedApiData('aster/trades', accountConfig.uid)
      const cachedPositions = getCachedApiData('aster/positions', accountConfig.uid)
      
      if (cachedBalance) {
        console.log(`✅ Using cached balance data for ${currentModel.name}`)
        balanceResult = { status: 'fulfilled', value: { success: true, data: cachedBalance } }
      } else {
        console.log(`⚠️ No cached balance data for ${currentModel.name}, will fetch`)
      }
      if (cachedTrades) {
        console.log(`✅ Using cached trades data for ${currentModel.name}`)
        tradesResult = { status: 'fulfilled', value: { success: true, data: cachedTrades } }
      } else {
        console.log(`⚠️ No cached trades data for ${currentModel.name}, will fetch`)
      }
      if (cachedPositions) {
        console.log(`✅ Using cached positions data for ${currentModel.name}`)
        positionsResult = { status: 'fulfilled', value: { success: true, data: cachedPositions } }
      } else {
        console.log(`⚠️ No cached positions data for ${currentModel.name}, will fetch`)
      }
      
      // Helper function to process and update model data
      const processAndUpdateModelData = (balance, trades, positions) => {
        try {
          // Process balance data
          let balanceData = null
          if (balance && balance.status === 'fulfilled' && balance.value.success) {
            const apiData = balance.value.data
            if (apiData.active_balances && apiData.active_balances.length > 0) {
              balanceData = apiData.active_balances.find(b => b.asset === 'USDT')
              if (balanceData) {
                balanceData.totalUsdtValue = apiData.total_usdt_value
                balanceData.uid = apiData.uid
                balanceData.walletName = apiData.wallet_name
              }
            }
          }

          // Process trading history
          let tradesData = []
          if (trades && trades.status === 'fulfilled' && trades.value.success) {
            const apiData = trades.value.data
            if (apiData.trades && apiData.trades.length > 0) {
              tradesData = apiData.trades.map(trade => ({
                ...trade,
                uid: apiData.uid,
                walletName: apiData.wallet_name,
                totalTrades: apiData.total_trades,
                statistics: apiData.statistics
              }))
            }
          }

          // Process position data
          let positionsData = []
          if (positions && positions.status === 'fulfilled' && positions.value.success) {
            const apiData = positions.value.data
            if (apiData.positions && apiData.positions.length > 0) {
              positionsData = apiData.positions.map(position => ({
                ...position,
                uid: apiData.uid,
                walletName: apiData.wallet_name,
                totalPositions: apiData.total_positions
              }))
            }
          }

          // Calculate statistics
          const stats = calculateTradingStats(tradesData)
          const sharpeRatio = calculateSharpeRatio(tradesData)
          const maxDrawdown = calculateMaxDrawdown(tradesData)

          const initialCapital = accountConfig.initialCapital || 10000
          const accountValue = balanceData ? parseFloat(balanceData.balance) : 0
          const totalPnl = accountValue - initialCapital
          const returnPercent = initialCapital > 0 ? (totalPnl / initialCapital) * 100 : 0

          // Update model data
          const modelIndex = models.value.findIndex(m => m.slug === currentModelSlug)
          if (modelIndex !== -1) {
            models.value[modelIndex] = {
              ...models.value[modelIndex],
              accountValue: accountValue,
              availableCash: balanceData ? parseFloat(balanceData.availableBalance) : 0,
              totalPnl: totalPnl,
              totalUnrealizedPnl: balanceData ? parseFloat(balanceData.crossUnPnl) : 0,
              totalFees: stats.totalCommission || 0,
              netRealized: stats.totalProfit || 0,
              returnPercent: returnPercent,
              averageLeverage: tradesData.length > 0 ? (tradesData.reduce((sum, trade) => sum + parseFloat(trade.leverage || 1), 0) / tradesData.length).toFixed(1) : '0.0',
              averageConfidence: stats.winRate || 0,
              biggestWin: stats.biggestWin || 0,
              biggestLoss: stats.biggestLoss || 0,
              holdTimes: {
                long: stats.totalTrades > 0 ? Math.round((stats.longTrades / stats.totalTrades) * 100) : 0,
                short: stats.totalTrades > 0 ? Math.round((stats.shortTrades / stats.totalTrades) * 100) : 0,
                flat: 0
              },
              totalTrades: stats.totalTrades || 0,
              winRate: stats.winRate || 0,
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
                notional: parseFloat(position.notional || 0)
              })),
              recentTrades: tradesData
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 25)
                .map((trade, index) => ({
                  id: index + 1,
                  side: trade.side === 'BUY' ? 'LONG' : 'SHORT',
                  coin: trade.symbol.replace('USDT', ''),
                  entryPrice: parseFloat(trade.price),
                  exitPrice: parseFloat(trade.price),
                  quantity: parseFloat(trade.qty),
                  holdingTime: '1h 30m',
                  notionalEntry: parseFloat(trade.quoteQty),
                  notionalExit: parseFloat(trade.quoteQty),
                  totalFees: Math.abs(parseFloat(trade.commission)),
                  netPnl: parseFloat(trade.realizedPnl)
                }))
            }
          }
          
          loading.value = false // Stop loading when data is processed
          console.log(`✅ Model data updated for ${currentModel.name}`)
        } catch (error) {
          console.error(`❌ Error processing data for ${currentModel.name}:`, error)
        }
      }
      
      // If we have cached data, process and display it immediately
      if (cachedBalance || cachedTrades || cachedPositions) {
        console.log(`⚡ Processing cached data immediately for ${currentModel.name}`)
        processAndUpdateModelData(balanceResult, tradesResult, positionsResult)
      } else {
        // No cache, keep loading state until fresh data arrives
        loading.value = true
      }
      
      // Always fetch fresh data in background (even if we have cache)
      const fetchPromises = [
        { key: 'balance', promise: getModelBalance(accountConfig.uid, true) }, // Skip cache
        { key: 'trades', promise: getModelTrades(accountConfig.uid, 'BTCUSDT', 25, true) }, // Skip cache
        { key: 'positions', promise: getModelPositions(accountConfig.uid, true) } // Skip cache
      ]
      
      const results = await Promise.allSettled(fetchPromises.map(p => p.promise))
      
      // Update with fresh data
      results.forEach((result, index) => {
        const key = fetchPromises[index].key
        
        if (result.status === 'fulfilled') {
          const data = result.value
          console.log(`✅ Fetched fresh ${key} data for ${currentModel.name}:`, data)
          
          // Cache using API-specific names
          if (key === 'balance' && data.success) {
            setCachedApiData('aster/balance', accountConfig.uid, data.data)
            balanceResult = result
            console.log(`✅ Updated balance result for ${currentModel.name}`)
          } else if (key === 'trades' && data.success) {
            setCachedApiData('aster/trades', accountConfig.uid, data.data)
            tradesResult = result
            console.log(`✅ Updated trades result for ${currentModel.name}`)
          } else if (key === 'positions' && data.success) {
            setCachedApiData('aster/positions', accountConfig.uid, data.data)
            positionsResult = result
            console.log(`✅ Updated positions result for ${currentModel.name}`)
          } else {
            console.log(`⚠️ ${key} fetch succeeded but data.success = false:`, data)
          }
        } else {
          console.error(`❌ ${key} fetch failed for ${currentModel.name}:`, result.reason)
        }
      })
      
      // Ensure we have results (from cache or fresh fetch)
      balanceResult = balanceResult || { status: 'fulfilled', value: null }
      tradesResult = tradesResult || { status: 'fulfilled', value: null }
      positionsResult = positionsResult || { status: 'fulfilled', value: null }

      // Process fresh data (only if we didn't process cached data already)
      if (!cachedBalance && !cachedTrades && !cachedPositions) {
        console.log(`📥 Processing fresh data for ${currentModel.name}`)
        processAndUpdateModelData(balanceResult, tradesResult, positionsResult)
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
  if (isNaN(value) || value === null || value === undefined) {
    return '0.0000'
  }
  return parseFloat(value).toFixed(4)
}

// Format quantity function
const formatQuantity = (value) => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.0000'
  }
  return parseFloat(value).toFixed(4)
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
  gap 24px

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

.model-details
  .model-name
    font-size 32px
    font-weight 700
    color #f8fafc
    margin-bottom 16px

.model-stats
  display flex
  gap 24px
  flex-wrap wrap

.stat-item
  .label
    font-size 14px
    color #94a3b8
    margin-bottom 4px

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
  grid-template-columns repeat(4, 1fr)
  gap 24px
  margin-bottom 40px

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
    font-size 24px
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
  grid-template-columns repeat(10, 1fr)
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
    grid-template-columns repeat(10, 1fr)
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
</style>
