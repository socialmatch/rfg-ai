<template lang="pug">
.completed-trades
  .trades-list
    .trade-item(v-for="trade in trades" :key="trade.id")
      .trade-header
        .timestamp {{ formatDate(trade.timestamp) }}
        .model-info
          .model-icon(:style="shouldShowBackground(trade.model) ? { backgroundColor: getModelColorEvent(trade.model) } : {}")
            img(:src="getModelIcon(trade.model)" :alt="trade.model")
          .model {{ trade.model }}
      .trade-action {{ trade.action }}
      .trade-details
        .detail-row
          span.label Price:
          span.value ${{ trade.entryPrice.toLocaleString() }} -> ${{ trade.exitPrice.toLocaleString() }}
        .detail-row
          span.label Quantity:
          span.value {{ trade.quantity }}
        .detail-row
          span.label Notional:
          span.value ${{ trade.notionalStart.toLocaleString() }} -> ${{ trade.notionalEnd.toLocaleString() }}
        .detail-row
          span.label Holding time:
          span.value {{ trade.holdingTime }}
        .detail-row
          span.label Commission:
          span.value ${{ trade.commission.toFixed(4) }}
      .trade-pnl
        .pnl-label NET P&L:
        .pnl-amount(:class="trade.profit >= 0 ? 'positive' : 'negative'")
          | {{ trade.profit >= 0 ? '+' : '' }}${{ trade.profit.toFixed(2) }}

  // No data state
  .no-data(v-if="trades.length === 0")
    .no-data-icon 📈
    .no-data-text No trade records
    .no-data-subtitle Waiting for API data loading or account has no trading history
</template>

<script setup>
import { ref, computed } from 'vue'
import {getModelIconPath, getModelColor, getAccountByUid} from '@/config/accounts.js'

// Get model icon
const getModelIcon = (modelName) => {
  return getModelIconPath(modelName)
}

// Get model color
const getModelColorEvent = (modelName) => {
  return getModelColor(modelName)
}

// Determine if background color should be set
// Only GROK 4 needs background color (too similar to theme), others don't
const shouldShowBackground = (modelName) => {
  return modelName === 'GROK 4'
}

const props = defineProps({
  selectedModel: {
    type: String,
    default: 'ALL MODELS'
  },
  asterPositions: {
    type: Array,
    default: () => []
  },
  asterAccountData: {
    type: Object,
    default: () => null
  },
  asterLoading: {
    type: Boolean,
    default: false
  },
  asterError: {
    type: String,
    default: null
  },
  asterUserTrades: {
    type: Array,
    default: () => []
  },
  asterTradesLoading: {
    type: Boolean,
    default: false
  },
  asterTradesError: {
    type: String,
    default: null
  }
})

const models = ['Qwen3 Max', 'Deepseek Chat V3.1', 'Grok 4', 'Gemini 2.5 Pro', 'Claude Sonnet 4.5', 'GPT 5']
const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP']

function randomBetween(min, max) { return Math.random() * (max - min) + min }


// No longer use mock data, only display real data

// Convert Aster Finance trading data to format needed by component
const convertAsterTrades = (asterTrades) => {
  console.log('🔄 Converting Aster Finance trading data:', asterTrades)

  if (!asterTrades || asterTrades.length === 0) {
    console.log('❌ Aster Finance trading data is empty')
    return []
  }

  // Filter out trades with realizedPnl === 0 before mapping
  return asterTrades
    .filter(trade => {
      const realizedPnl = parseFloat(trade.realizedPnl ?? trade.net_pnl ?? 0)
      return !isNaN(realizedPnl) && realizedPnl !== 0
    })
    .map((trade, index) => {
      const direction = (trade.direction || trade.positionSide || '').toUpperCase()
      const side = direction === 'SHORT' ? 'SHORT' : 'LONG'
      const symbol = (trade.symbol || '').replace('USDT', '')
      const entryPrice = parseFloat(trade.entryPrice ?? trade.price ?? trade.entry_price ?? 0)
      const exitPrice = parseFloat(trade.exitPrice ?? trade.exit_price ?? entryPrice)
      const quantity = parseFloat(trade.quantity ?? trade.qty ?? 0)
      const realizedPnl = parseFloat(trade.realizedPnl ?? trade.net_pnl ?? 0)
      const commission = Math.abs(parseFloat(trade.commission ?? trade.fees_total ?? 0))
      const tradeTime = trade.time
        ? new Date(trade.time)
        : trade.createdAt
          ? new Date(trade.createdAt)
          : new Date()
      const holdingTime = trade.holdingTime || trade.holding_time || 'N/A'
      const modelConfig = trade.uid ? getAccountByUid(trade.uid) : null
      const modelName = modelConfig?.modelName || trade.walletName || 'UNKNOWN'
      const absQty = Math.abs(quantity)
      const notionalStart = !isNaN(entryPrice) ? entryPrice * absQty : 0
      const notionalEnd = !isNaN(exitPrice) ? exitPrice * absQty : notionalStart + realizedPnl

      return {
        id: trade.id || trade.orderId || index + 1,
        model: modelName,
        action: `completed a ${side.toLowerCase()} trade on ${symbol || trade.symbol}!`,
        entryPrice,
        exitPrice,
        quantity: side === 'SHORT' ? -absQty : absQty,
        notionalStart,
        notionalEnd,
        holdingTime,
        profit: realizedPnl, // net_pnl already accounts for fees
        timestamp: tradeTime,
        commission
      }
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Filter trade records based on selected model
const trades = computed(() => {
  let allTradesData = []

  console.log('🔍 Checking data source:', {
    asterUserTrades: props.asterUserTrades,
    asterUserTradesLength: props.asterUserTrades?.length,
    selectedModel: props.selectedModel
  })

  // Only use Aster Finance real data
  if (props.asterUserTrades && props.asterUserTrades.length > 0) {
    allTradesData = convertAsterTrades(props.asterUserTrades)
  } else {
    allTradesData = []
  }

  // Ensure data is sorted by time (newest first)
  allTradesData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Filter based on selected model
  if (props.selectedModel === 'ALL MODELS') {
    // Group by model, max 5 latest records per model
    const modelGroups = {}
    allTradesData.forEach(trade => {
      const modelName = trade.model
      if (!modelGroups[modelName]) {
        modelGroups[modelName] = []
      }
      if (modelGroups[modelName].length < 25) {
        modelGroups[modelName].push(trade)
      }
    })
    // Merge data from all models and sort by time
    const limitedTrades = Object.values(modelGroups).flat()
    limitedTrades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limitedTrades
  }
  const filtered = allTradesData.filter(trade => {
    return trade.model && trade.model.toLowerCase() === props.selectedModel.toLowerCase()
  })
  // Limit to maximum 10 trades for single model
  const limitedFiltered = filtered.slice(0, 100)
  return limitedFiltered
})

const totalTrades = computed(() => trades.value.length)
const successRate = computed(() => {
  if (trades.value.length === 0) return 0
  return +(trades.value.filter(t => t.profit >= 0).length / trades.value.length * 100).toFixed(1)
})
const totalProfit = computed(() => {
  return trades.value.reduce((sum, t) => sum + t.profit, 0)
})

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style lang="stylus" scoped>
.completed-trades
  .trades-list
    display flex
    flex-direction column
    gap 12px
    padding-bottom 60px

.trade-item
  background #0f172a
  border 1px solid #2b3444
  border-radius 6px
  padding 12px
  transition all 0.2s ease

  &:hover
    border-color #3b82f6
    background #1a2230

.trade-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 8px

.timestamp
  color #94a3b8
  font-size 12px
  font-weight 700
  font-family 'JetBrains Mono', monospace

.model-info
  display flex
  align-items center
  gap 8px

.model-icon
  width 24px
  height 24px
  border-radius 50%
  padding 3px
  display flex
  align-items center
  justify-content center

  img
    width 18px
    height 18px
    border-radius 50%
    object-fit cover

.model
  color #f8fafc
  font-size 12px
  font-weight 700

.trade-action
  color #cbd5e1
  font-size 12px
  margin-bottom 8px

.trade-details
  margin-bottom 8px

.detail-row
  display flex
  justify-content space-between
  margin-bottom 4px

  &:last-child
    margin-bottom 0

  .label
    color #94a3b8
    font-size 11px
    font-weight 700

  .value
    color #f8fafc
    font-size 11px
    font-family 'JetBrains Mono', monospace

.trade-pnl
  display flex
  justify-content space-between
  align-items center
  padding-top 8px
  border-top 1px solid #2b3444

.pnl-label
  color #94a3b8
  font-size 11px
  font-weight 700

.pnl-amount
  font-size 12px
  font-weight 700
  font-family 'JetBrains Mono', monospace

  &.positive
    color #10b981

  &.negative
    color #ef4444

// No data state styles
.no-data
  display flex
  flex-direction column
  align-items center
  justify-content center
  padding 60px 20px
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
</style>
