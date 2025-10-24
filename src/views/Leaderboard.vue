<template lang="pug">
.leaderboard-container
  Header

  // Page title
  .page-title LEADERBOARD

  // Tabs
  .tabs-container
    .tab(:class="{ active: activeTab === 'overall' }" @click="setActiveTab('overall')") OVERALL STATS
    //.tab(:class="{ active: activeTab === 'analytics' }" @click="setActiveTab('analytics')") ADVANCED ANALYTICS

  // Leaderboard table
  .leaderboard-table
    .table-header
      .col.rank RANK
      .col MODEL
      .col ACCT VALUE
      .col RETURN %
      .col TOTAL P&L
      .col FEES
      .col WIN RATE
      .col BIGGEST WIN
      .col BIGGEST LOSS
      .col TRADES

    .table-body
      .table-row(v-for="(model, index) in leaderboardData" :key="model.name" :class="{ 'alternate': index % 2 === 1 }")
        .col.rank {{ model.rank }}
        .col.model
          .model-icon(:style="shouldShowBackground(model.name) ? { backgroundColor: model.color } : {}")
            img(:src="getModelIcon(model.name)" :alt="model.name")
          .model-name {{ model.name }}
        .col.account-value ${{ (model.accountValue || 0).toLocaleString() }}
        .col.return-percent(:class="(model.returnPercent || 0) >= 0 ? 'positive' : 'negative'")
          | {{ (model.returnPercent || 0) >= 0 ? '+' : '' }}{{ (model.returnPercent || 0).toFixed(2) }}%
        .col.total-pnl(:class="(model.totalPnl || 0) >= 0 ? 'positive' : 'negative'")
          | ${{ (model.totalPnl || 0).toLocaleString() }}
        .col.fees ${{ Math.abs(model.fees || 0).toFixed(2) }}
        .col.win-rate {{ (model.winRate || 0).toFixed(1) }}%
        .col.biggest-win(:class="(model.biggestWin || 0) >= 0 ? 'positive' : 'negative'")
          | ${{ (model.biggestWin || 0).toFixed(2) }}
        .col.biggest-loss(:class="(model.biggestLoss || 0) >= 0 ? 'positive' : 'negative'")
          | ${{ (model.biggestLoss || 0).toFixed(2) }}
        .col.trades {{ model.trades || 0 }}

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
        .value ${{ winningModel.accountValue.toLocaleString() }}

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
            .bar(:style="{ height: getBarHeight(model.accountValue || 0) + '%', backgroundColor: model.color || '#64748b' }")
            .bar-value ${{ (model.accountValue || 0).toLocaleString() }}
            .bar-icon
              img(:src="getModelIcon(model.name)" :alt="model.name")
          .model-info
            .bar-label(:style="{ color: model.color || '#94a3b8' }") {{ model.name }}

  // Bottom note
  .footer-note
    | Note: All statistics (except Account Value and P&L) reflect completed trades only. Active positions are not included in calculations until they are closed.
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { getAllModelInfo, getModelIconPath, getAccountBalanceData, getAccountByModelName } from '@/config/accounts.js'
import { getAllModelsProcessedBalance } from '@/utils/newBalanceService.js'
import { getAllModelsProcessedTrades } from '@/utils/newTradesService.js'
import { getAllModelsProcessedPositions } from '@/utils/newPositionsService.js'
import { calculateTradingStats, calculateSharpeRatio, calculateMaxDrawdown } from '@/utils/tradingStatsCalculator.js'
import { getCryptoIcon } from '@/utils/cryptoIcons.js'

const router = useRouter()

const activeTab = ref('overall')
const loading = ref(false)
const desc = ref('')
const sortColumn = ref('')

// Leaderboard data - initialized as empty, dynamically get real data later
const leaderboardData = ref([])

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
  
  // Extract unique crypto symbols from positions
  const cryptos = [...new Set(winningModel.positions.map(position => position.coin))]
  console.log('🔍 Active crypto symbols:', cryptos)
  return cryptos.filter(crypto => crypto && crypto.trim() !== '')
}

// Dynamically load leaderboard data
const loadLeaderboardData = async () => {
  loading.value = true

  try {
    console.log('🔄 Loading leaderboard data...')

    // Concurrently get balance, trading history, and positions data
    const [balanceResult, tradesResult, positionsResult] = await Promise.allSettled([
      getAllModelsProcessedBalance(),
      getAllModelsProcessedTrades(),
      getAllModelsProcessedPositions()
    ])

    const balanceData = balanceResult.status === 'fulfilled' ? balanceResult.value : null
    const tradesData = tradesResult.status === 'fulfilled' ? tradesResult.value : null
    const positionsData = positionsResult.status === 'fulfilled' ? positionsResult.value : null

    // Build model data mapping
    const modelDataMap = new Map()

    // Process balance data
    if (balanceData && balanceData.success) {
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

    // Process trading history data
    if (tradesData && tradesData.success) {
      tradesData.accounts.forEach(account => {
        if (account.data && account.data.length > 0) {
          const modelName = account.modelInfo.name
          const existingData = modelDataMap.get(modelName) || { modelInfo: account.modelInfo }

          // Calculate trading statistics
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

    // Process positions data
    console.log('🔍 Positions data received:', positionsData)
    if (positionsData && positionsData.success) {
      console.log('🔍 Processing positions data for accounts:', positionsData.accounts.length)
      positionsData.accounts.forEach(account => {
        console.log('🔍 Processing account:', account.modelInfo.name, 'Success:', account.success)
        console.log('🔍 Account data structure:', account.data)
        
        if (account.success && account.data) {
          // Check if positions exist in the data structure
          const positions = account.data.positions || account.data
          console.log('🔍 Positions found:', positions)
          
          if (positions && positions.length > 0) {
            console.log('🔍 Account has positions:', positions.length, 'positions')
            const modelName = account.modelInfo.name
            const existingData = modelDataMap.get(modelName) || { modelInfo: account.modelInfo }
            
            // Map positions data to the expected format (same as ModelDetail)
            const mappedPositions = positions.map((position, index) => ({
              id: index + 1,
              coin: position.symbol ? position.symbol.replace('USDT', '') : 'UNKNOWN',
              entryTime: new Date(position.updateTime || Date.now()).toLocaleTimeString(),
              entryPrice: parseFloat(position.entryPrice || 0),
              side: parseFloat(position.positionAmt || 0) >= 0 ? 'LONG' : 'SHORT', // Passed positionAmt determines side
              quantity: Math.abs(parseFloat(position.positionAmt || 0)),
              leverage: parseFloat(position.leverage || 1),
              liquidationPrice: parseFloat(position.liquidationPrice || 0),
              margin: parseFloat(position.isolatedMargin || 0), // Use isolatedMargin as margin
              unrealPnl: parseFloat(position.unRealizedProfit || 0), // Fixed field name
              notional: parseFloat(position.notional || 0) // Add notional field
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

    // Build leaderboard data
    const leaderboardItems = []
    modelDataMap.forEach((data, modelName) => {
      const balance = data.balance
      const stats = data.stats || {}
      const accountValue = balance ? parseFloat(balance.balance) : 0
      const initialCapital = data.modelInfo.initialCapital || 10000 // Default to $10,000
      
      // Calculate total P&L: ACCT VALUE - Initial Capital
      const totalPnl = accountValue - initialCapital
      
      // Calculate return percentage: (ACCT VALUE - Initial Capital) / Initial Capital * 100
      const returnPercent = initialCapital > 0 ? (totalPnl / initialCapital) * 100 : 0

      leaderboardItems.push({
        rank: 0, // Sort later
        name: modelName,
        accountValue: accountValue,
        returnPercent: returnPercent,
        totalPnl: totalPnl,
        fees: stats.totalCommission || 0, // Total commission from trading history
        winRate: stats.winRate || 0,
        biggestWin: stats.biggestWin || 0,
        biggestLoss: stats.biggestLoss || 0,
        sharpe: stats.profitLossRatio || 0, // Use profit/loss ratio as Sharpe ratio approximation
        trades: stats.totalTrades || 0,
        color: data.modelInfo.color,
        balance: balance?.balance || '0.00000000',
        availableBalance: balance?.availableBalance || '0.00000000',
        marginAvailable: balance?.marginAvailable || false,
        initialCapital: initialCapital,
        // Add positions data
        positions: data.positions || [],
        // New detailed statistics
        longTrades: stats.longTrades || 0,
        shortTrades: stats.shortTrades || 0,
        winTrades: stats.winTrades || 0,
        lossTrades: stats.lossTrades || 0,
        averageWin: stats.averageWin || 0,
        averageLoss: stats.averageLoss || 0,
        maxDrawdown: data.maxDrawdown || 0
      })
      
      console.log('🔍 Built leaderboard item for', modelName, 'with positions:', data.positions || [])
    })

    // Sort by account value and set ranking
    leaderboardItems.sort((a, b) => b.accountValue - a.accountValue)
    leaderboardItems.forEach((item, index) => {
      item.rank = index + 1
    })

    leaderboardData.value = leaderboardItems

    console.log('✅ Leaderboard data loaded successfully:', {
      totalModels: leaderboardItems.length,
      data: leaderboardItems
    })

  } catch (error) {
    console.error('❌ Failed to load leaderboard data:', error)
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

// Determine if background color should be set (Rfg_logo image has built-in background)
const shouldShowBackground = (modelName) => {
  const iconPath = getModelIcon(modelName)
  return !iconPath.includes('Rfg_logo')
}

// Load data when component mounts
onMounted(() => {
  loadLeaderboardData()
})

const getBarHeight = (value) => {
  if (leaderboardData.value.length === 0) return 0
  const maxValue = Math.max(...leaderboardData.value.map(m => m.accountValue || 0))
  return maxValue > 0 ? (value / maxValue) * 100 : 0
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
  gap 12px

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
</style>
