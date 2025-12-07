<template lang="pug">
.positions-container
  // Display real data
  .model-card(v-for="model in modelPositions" :key="model.name")
    .model-header
      .model-info
        .model-icon(:style="shouldShowBackground(model.name) ? { backgroundColor: model.color } : {}")
          img(:src="getModelIcon(model.name)" :alt="model.name")
        .model-name() {{ model.name }}
      .model-pnl(:class="model.totalUnrealizedPnl >= 0 ? 'positive' : 'negative'")
        | {{ $t('modelDetail.totalUnrealizedPnl') }} {{ model.totalUnrealizedPnl >= 0 ? '+' : '' }}${{ model.totalUnrealizedPnl.toFixed(2) }}

    .positions-table
      .table-header
        .col {{ $t('modelDetail.side') }}
        .col {{ $t('modelDetail.coin') }}
        .col LEVERAGE
        .col {{ $t('modelDetail.notional') }}
        .col {{ $t('modelDetail.unrealizedPnl') }}

      .table-body
        .table-row(v-for="position in model.positions" :key="position.id")
          .col
            .side(:class="position.side.toLowerCase()") {{ position.side }}
          .col.coin
            .coin-info
              .coin-icon
                img(:src="getCryptoIcon(position.coin)" :alt="position.coin" v-if="getCryptoIcon(position.coin)")
              .coin-name {{ position.coin }}
          .col {{ position.leverage }}X
          .col ${{ position.notional.toLocaleString() }}
          .col(:class="position.unrealPnl >= 0 ? 'positive' : 'negative'")
            | {{ position.unrealPnl >= 0 ? '+' : '' }}${{ position.unrealPnl.toFixed(2) }}

    .model-footer
      .available-cash {{ $t('positions.availableCash') }}: ${{ model.availableCash.toLocaleString() }}

  // No data state
  .no-data(v-if="modelPositions.length === 0")
    .no-data-icon 📊
    .no-data-text {{ $t('positions.noPositions') }}
    .no-data-subtitle {{ $t('positions.noPositionsSubtitle') }}
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getCryptoIcon } from '@/utils/cryptoIcons.js'
import { getAccountBalanceData } from '@/config/accounts.js'

// Helper function to check if account balance is >= 500
const isAccountBalanceValid = (modelName) => {
  const accountData = getAccountBalanceData(modelName)
  if (!accountData) return false
  const balance = parseFloat(accountData.balance || 0)
  return balance >= 500
}

// 定义props
const props = defineProps({
  asterPositions: {
    type: Array,
    default: () => []
  },
  asterAccountData: {
    type: Array,
    default: () => []
  },
  selectedModel: {
    type: String,
    default: 'ALL MODELS'
  }
})

// No longer use mock data, only display real data

import { getModelIconPath } from '@/config/accounts.js'

// Get model icon
const getModelIcon = (modelName) => {
  return getModelIconPath(modelName)
}

// Determine if background color should be set
// Only GROK 4 needs background color (too similar to theme), others don't
const shouldShowBackground = (modelName) => {
  return modelName === 'GROK 4'
}

// Convert Aster Finance positions to format needed by component
const convertAsterPositions = (asterPositions, asterAccountData) => {
  console.log('🔄 convertAsterPositions called, input data:', asterPositions)

  if (!asterPositions || asterPositions.length === 0) {
    console.log('❌ asterPositions is empty or undefined')
    return []
  }

  // Group positions by model
  const modelGroups = {}
  let processedCount = 0

  asterPositions.forEach((position, index) => {

    // If positionAmt is 0, skip
    if (parseFloat(position.positionAmt) === 0) {
      console.log(`⏭️ Skip position ${index}, positionAmt is 0`)
      return
    }

    processedCount++

    // Use model info from position, if not available use default values
    const modelName = position.modelInfo?.name || 'ASTER FINANCE'
    const modelColor = position.modelInfo?.color || '#3B82F6'

    if (!modelGroups[modelName]) {
      // Calculate available cash for this model (find corresponding model from accountData)
      let availableCash = 0
      if (asterAccountData && Array.isArray(asterAccountData)) {
        const accountData = asterAccountData.find(acc => acc.modelInfo?.name === modelName)
        availableCash = parseFloat(accountData?.availableCash ?? accountData?.availableBalance ?? 0)
      } else if (asterAccountData) {
        availableCash = parseFloat(asterAccountData?.availableCash ?? asterAccountData?.availableBalance ?? 0)
      }

      modelGroups[modelName] = {
        name: modelName,
        color: modelColor,
        totalUnrealizedPnl: 0,
        availableCash: availableCash,
        positions: []
      }
    }

    const side = parseFloat(position.positionAmt) > 0 ? 'LONG' : 'SHORT'
    const notional = Math.abs(parseFloat(position.notional || 0)) // Display absolute value as amount
    const unrealPnl = parseFloat(position.unRealizedProfit || 0)
    const entryPrice = parseFloat(position.entryPrice || 0)
    const positionAmt = parseFloat(position.positionAmt || 0)

    const convertedPosition = {
      id: index + 1,
      side: side,
      coin: position.symbol.replace('USDT', ''),
      leverage: position.leverage || '1',
      notional: notional,
      unrealPnl: unrealPnl,
      entryPrice: entryPrice,
      positionAmt: Math.abs(positionAmt)
    }
    modelGroups[modelName].positions.push(convertedPosition)
    modelGroups[modelName].totalUnrealizedPnl += unrealPnl
  })
  return Object.values(modelGroups)
}

// Computed property: filter data based on data source and selected model
const modelPositions = computed(() => {
  console.log('🔍 Computing modelPositions:', {
    asterPositions: props.asterPositions,
    asterPositionsLength: props.asterPositions?.length,
    selectedModel: props.selectedModel
  })

  let positions = []

  // Only use Aster Finance real data
  if (props.asterPositions && props.asterPositions.length > 0) {
    console.log('📊 Using Aster Finance data')
    positions = convertAsterPositions(props.asterPositions, props.asterAccountData)
  } else {
    console.log('📊 No Aster Finance data, returning empty array')
    positions = []
  }

  console.log('📊 Converted positions:', positions)

  // Filter out accounts with balance < 500
  const validBalancePositions = positions.filter(model => {
    const modelName = model.name
    if (!modelName) return false
    return isAccountBalanceValid(modelName)
  })

  // Filter based on selected model
  if (props.selectedModel && props.selectedModel !== 'ALL MODELS') {
    const filtered = validBalancePositions.filter(model => {
      console.log('📊 Comparing position model:', model.name, 'with selected:', props.selectedModel)
      return model.name && model.name.toLowerCase() === props.selectedModel.toLowerCase()
    })
    console.log('📊 Filtered positions count:', filtered.length, 'from total:', validBalancePositions.length)
    // Note: Positions are not limited, show all for selected model
    return filtered
  }

  console.log('📊 Final returned positions:', validBalancePositions)
  return validBalancePositions
})

// Watch props changes
watch(() => props.asterPositions, (newPositions) => {
  console.log('🔄 Aster Finance positions data updated:', newPositions)
}, { deep: true })

watch(() => props.selectedModel, (newModel) => {
  console.log('🔄 Selected model changed:', newModel)
})

// Debug info
watch(() => modelPositions.value, (newPositions) => {
  console.log('🔄 modelPositions computed property updated:', newPositions)
}, { deep: true, immediate: true })
</script>

<style lang="stylus" scoped>
.positions-container
  height 100%
  overflow-y auto
  display flex
  flex-direction column
  gap 16px

.model-card
  background #0f172a
  border 1px solid #2b3444
  border-radius 6px
  padding 12px

.model-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 12px
  padding-bottom 8px
  border-bottom 1px solid #2b3444

.model-info
  display flex
  align-items center
  gap 12px

.model-icon
  width 32px
  height 32px
  border-radius 50%
  padding 4px
  display flex
  align-items center
  justify-content center

  img
    width 24px
    height 24px
    border-radius 50%
    object-fit cover

.model-name
  color #f8fafc
  font-weight 800
  font-size 14px

.model-pnl
  font-weight 800
  font-size 12px

  &.positive
    color #10b981
  &.negative
    color #ef4444

.positions-table
  margin-bottom 12px

.table-header
  display grid
  grid-template-columns 1fr 1fr 1fr 1fr 1fr
  gap 8px
  padding 8px
  border-bottom 1px solid #2b3444
  margin-bottom 8px

  .col
    color #94a3b8
    font-size 12px
    font-weight 700

.table-body
  .table-row
    display grid
    grid-template-columns 1fr 1fr 1fr 1fr 1fr
    gap 8px
    padding 6px 2px
    border-bottom 1px solid #1a2230

    &:last-child
      border-bottom none

    .col
      color #e5e7eb
      font-size 12px
      display flex
      align-items center

      &.positive
        color #10b981
      &.negative
        color #ef4444

.side
  padding 2px 6px
  border-radius 4px
  font-size 11px
  font-weight 700
  text-align center

  &.long
    background rgba(16, 185, 129, 0.2)
    color #10b981

  &.short
    background rgba(239, 68, 68, 0.2)
    color #ef4444

// Coin icon styles
.coin
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

.model-footer
  padding-top 8px
  border-top 1px solid #2b3444

.available-cash
  color #cbd5e1
  font-size 12px
  font-weight 700

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
