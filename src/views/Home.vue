<template lang="pug">
.home-container
  Header

  // Top ticker bar
  .ticker-bar
    .ticker-content
      .ticker-left
        .ticker-item(v-for="crypto in cryptoPrices" :key="crypto.symbol")
          .icon-sym-row
            .crypto-icon
              img(:src="getCryptoIcon(crypto.symbol)" :alt="crypto.symbol")
            .sym {{ crypto.symbol }}
          .price {{ formatNumber(crypto.price, { currency: true, useBalanceData: false }) }}
      .ticker-right
        .performance-summary
          .highest {{ $t('home.highest') }}: {{ highestModel.name }}
            .value-row
              template(v-if="balanceDataLoaded")
                span.rolling-value {{ formatNumber(highestModel.value, { currency: true, useBalanceData: true }) }}
                span.positive {{ formatNumber(highestModel.change, { percent: true, decimals: 2, showSign: true, useBalanceData: true }) }}
              template(v-else)
                span.rolling-value --
          .lowest {{ $t('home.lowest') }}: {{ lowestModel.name }}
            .value-row
              template(v-if="balanceDataLoaded")
                span.rolling-value {{ formatNumber(lowestModel.value, { currency: true, useBalanceData: true }) }}
                span.negative {{ formatNumber(lowestModel.change, { percent: true, decimals: 2, useBalanceData: true }) }}
              template(v-else)
                span.rolling-value --

  // Main area: left chart + right sidebar
  main.main-content
    .main-grid
      // Left side: large chart
      .left-panel
        .panel-header
          .title-container
            .back-all-btn(v-if="showBackAllButton" @click="backToAllModels") {{ $t('common.backToAll') }}
            .title {{ $t('home.totalAccountValue') }}
          //.periods
            button.chart-btn(:class="{ active: chartPeriod === 'all' }" @click="setChartPeriod('all')") {{ $t('home.periods.all') }}
            button.chart-btn(:class="{ active: chartPeriod === '72h' }" @click="setChartPeriod('72h')") {{ $t('home.periods.72h') }}
        .chart-frame
          .y-axis-label $
          .chart-canvas(@mouseleave="handleChartLeave")
            canvas#tradingChart(ref="chartCanvas")
          .right-icons(v-show="hasChartData")
            .icon-item(v-for="model in tradingModels" :key="model.name"
              :class="{ hovered: hoveredModel && hoveredModel.name === model.name }"
              :style="getIconItemStyle(model)"
              @mouseenter="handleIconItemHover(model)"
              @mouseleave="handleIconItemLeave"
              @click="selectedModel = model.name")
              //.icon-dot(:style="{ backgroundColor: model.color }")
              .icon-content
                .model-image(:style="!model.isBtcPrice && shouldShowBackground(model.name) ? { backgroundColor: model.color } : {}")
                  img(v-if="!model.isBtcPrice" :src="getModelImage(model.name)" :alt="model.name")
                  img(v-else :src="getCryptoIcon('BTC')" alt="BTC")
                .model-value(:style="{ backgroundColor: model.color }") {{ formatNumber(model.balance ? parseFloat(model.balance) : model.value, { currency: true, useBalanceData: true }) }}
          //.x-axis
            .tick(v-for="tick in xAxisTicks" :key="tick") {{ tick }}

      // Right side: sidebar tabs + list
      .right-panel
        .sidebar-tabs
          .tab(:class="{ active: activeDetailTab === 'positions' }" @click="setActiveDetailTab('positions')") {{ $t('home.positions') }}
          .tab(:class="{ active: activeDetailTab === 'trades' }" @click="setActiveDetailTab('trades')") {{ $t('home.completedTrades') }}
          .tab(:class="{ active: activeDetailTab === 'prompts' }" @click="setActiveDetailTab('prompts')") {{ $t('home.prompts') }}
          .tab(:class="{ active: activeDetailTab === 'readme' }" @click="setActiveDetailTab('readme')") {{ $t('home.readme') }}
        .filter-section(v-if="activeDetailTab !== 'readme' && activeDetailTab !== 'prompts'")
          .filter
            span.label {{ $t('common.filter') }}:
            select.select(v-model="selectedModel")
              option(v-for="m in modelOptions" :key="m" :value="m") {{ m }}
          .showing(v-if="sidebarInfoText") {{ sidebarInfoText }}
        .sidebar-content
          component(:is="getActiveDetailComponent()"
            :selectedModel="selectedModel"
            :asterPositions="asterPositions"
            :asterAccountData="asterAccountData"
            :asterLoading="asterLoading"
            :asterError="asterError"
            :asterUserTrades="asterUserTrades"
            :asterTradesLoading="asterTradesLoading"
            :asterTradesError="asterTradesError")
  // Bottom model legend bar
  .legend-bar
    .legend-content
       .legend-item(v-for="legend in legends" :key="legend.name")
         //.legend-dot(:style="{ backgroundColor: legend.color }")
         .legend-content-inner
           .legend-name(:style="{ color: legend.color }") {{ legend.name }}
           .legend-value {{ formatNumber(legend.value, { currency: true, useBalanceData: true }) }}

  // Connection status
  //.connection-status
    .status-indicator(:class="connectionStatus")
    span.status-text {{ getStatusText() }}

  // Mobile modal for sidebar content
  .mobile-modal(v-if="showMobileModal" @click="closeMobileModal")
    .modal-overlay(@click.stop="")
      .modal-header
        .modal-title {{ getModalTitle() }}
        .modal-close(@click="closeMobileModal") ✕
      .modal-filter(v-if="activeDetailTab === 'trades' || activeDetailTab === 'positions'")
        select.select(v-model="selectedModel")
          option(v-for="m in modelOptions" :key="m" :value="m") {{ m }}
      .modal-body
        component(:is="getActiveDetailComponent()"
          :selectedModel="selectedModel"
          :asterPositions="asterPositions"
          :asterAccountData="asterAccountData"
          :asterLoading="asterLoading"
          :asterError="asterError"
          :asterUserTrades="asterUserTrades"
          :asterTradesLoading="asterTradesLoading"
          :asterTradesError="asterTradesError")
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Chart, registerables } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import Header from '@/components/Header.vue'
import CompletedTrades from '@/components/CompletedTrades.vue'
import ModelChatFeed from '@/components/ModelChatFeed.vue'
import Chat from '@/components/Chat.vue'
import Positions from '@/components/Positions.vue'
import Readme from '@/components/Readme.vue'
import Prompts from '@/components/Prompts.vue'
import { getAllModelsProcessedBalance } from '@/utils/newBalanceService.js'
import { getAllModelsProcessedPositions } from '@/utils/newPositionsService.js'
import { getAllModelsProcessedTrades } from '@/utils/newTradesService.js'
import { getAllModelInfo, getModelInfo, getModelIconPath, updateAccountBalance, DEFAULT_INITIAL_CAPITAL } from '@/config/accounts.js'
import { getAllModelsChartData, processChartData } from '@/utils/chartDataService.js'
import { getAllCryptoPrices } from '@/utils/cryptoPriceService.js'
import { getBtcPriceData } from '@/utils/btcPriceService.js'
import { getCachedData, setCachedData } from '@/utils/dataCache.js'
import { getCryptoIcon } from '@/utils/cryptoIcons.js'

Chart.register(...registerables, zoomPlugin)

const router = useRouter()
const { t } = useI18n()

const activeTab = ref('live')
const activeDetailTab = ref('positions')
const chartPeriod = ref('all')
const connectionStatus = ref('connecting')
const showMobileModal = ref(false)
const chartCanvas = ref(null)
let chartInstance = null
let resizeObserver = null
let resizeTimer = null
let lastContainerSize = { width: 0, height: 0 }
const chartData = ref(null)

// 图表交互状态
const hoveredModel = ref(null)
let hoveredDatasetIndex = -1 // Store the index of the hovered dataset for tooltip filtering (non-reactive for Chart.js filter)
const selectedModelForChart = ref(null)
const showBackAllButton = ref(false)
const iconPositionUpdate = ref(0) // Used to trigger icon position recalculation

const selectedModel = ref('ALL MODELS')
const modelOptions = computed(() => {
  const allModels = ['ALL MODELS']
  // Only include enabled models in the filter options
  const configModels = getModelInfo().map(model => model.name)
  return [...allModels, ...configModels]
})

const sidebarInfoText = computed(() => {
  if (activeDetailTab.value === 'positions') {
    return 'Showing Current Positions'
  }
  if (activeDetailTab.value === 'trades') {
    return 'Showing Last 100 Trades'
  }
  return ''
})

// Aster Finance 账户数据
const asterAccountData = ref(null)
const asterPositions = ref([])
const asterLoading = ref(false)
const asterError = ref(null)

// Aster Finance 交易历史数据
const asterUserTrades = ref([])
const asterTradesLoading = ref(false)
const asterTradesError = ref(null)

// Aster Finance 账户余额数据
const asterBalance = ref([])
const asterBalanceLoading = ref(false)
const asterBalanceError = ref(null)

// Chart data
const chartDataLoading = ref(false)
const chartDataError = ref(null)

// Track if data has been loaded at least once - separate for crypto prices and balance data
const cryptoPricesLoaded = ref(false)
const balanceDataLoaded = ref(false)

const cryptoPrices = ref([
  { symbol: 'BTC', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'ETH', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'SOL', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'BNB', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'DOGE', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'XRP', price: 0, change: 0, prevPrice: 0 }
])

// Trading models data - using unified config and balance data
// Initialize from config to ensure all enabled models are shown
const initializeTradingModelsFromConfig = () => {
  const configModels = getModelInfo()
  return configModels.map(model => ({
    name: model.name,
    value: 0,
    change: 0,
    color: model.color,
    accountAlias: null,
    asset: 'USDT',
    balance: '0.00000000',
    crossWalletBalance: '0.00000000',
    crossUnPnl: '0.00000000',
    availableBalance: '0.00000000',
    availableCash: '0.00000000',
    maxWithdrawAmount: '0.00000000',
    marginAvailable: true,
    updateTime: 0,
    totalUsdtValue: '0.00000000',
    uid: null,
    walletName: null
  }))
}

const tradingModels = ref(initializeTradingModelsFromConfig())

// Provide a default empty model data on initialization to avoid reduce errors
const defaultModel = {
  name: 'Loading...',
  value: 0,
  change: 0,
  color: '#64748b'
}

// Load account balance data using new balance service
const loadAsterBalance = async ({ skipInit = false, skipCache = false } = {}) => {
  const createEmptyModelData = (model) => ({
    name: model.name,
    value: 0,
    change: 0,
    color: model.color,
    accountAlias: null,
    asset: 'USDT',
    balance: 0,
    crossWalletBalance: 0,
    crossUnPnl: 0,
    availableBalance: 0,
    availableCash: 0,
    maxWithdrawAmount: 0,
    marginAvailable: true,
    updateTime: 0,
    totalUsdtValue: '0.00000000',
    uid: null,
    walletName: null
  })

  // Helper function to process and update UI with data
  const processAndUpdateData = async (result, { skipInit = false } = {}) => {
    const configModels = getModelInfo()
    const balanceDataMap = new Map()

    if (skipInit && tradingModels.value.length > 0) {
      tradingModels.value.forEach(model => {
        balanceDataMap.set(model.name, { ...model })
      })
    }

    // Ensure all configured models exist in map
    configModels.forEach(model => {
      if (!balanceDataMap.has(model.name)) {
        balanceDataMap.set(model.name, createEmptyModelData(model))
      }
    })

    const accountDataList = []

    const parseToNumber = (value) => {
      const num = parseFloat(value ?? 0)
      return isNaN(num) ? 0 : num
    }

    // Track if we have any real data loaded from API
    // hasRealData will be true if at least one account successfully returned data from API
    // (even if the value is 0, as long as it came from the API, it's real data)
    let hasRealData = false

    // Update models with API data
    result.accounts.forEach(account => {
      if (account.success && account.data && account.data.length > 0) {
        const usdtBalance = account.data.find(b => b.asset === 'USDT')
        if (usdtBalance) {
          // If we got data from API (even if value is 0), mark as real data
          hasRealData = true

          const accountValue = parseToNumber(usdtBalance.balance)
          const initialCapital = account.modelInfo.initialCapital || DEFAULT_INITIAL_CAPITAL
          // Calculate change as: (accountValue - initialCapital) / initialCapital * 100
          const changePercent = initialCapital > 0 ? ((accountValue - initialCapital) / initialCapital) * 100 : 0

          const availableBalanceValue = parseToNumber(usdtBalance.availableBalance ?? usdtBalance.availableCash)
          const availableCashValue = parseToNumber(usdtBalance.availableCash)
          const finalAvailableCash = !isNaN(availableCashValue) && availableCashValue !== 0 ? availableCashValue : availableBalanceValue

          const modelData = {
            name: account.modelInfo.name,
            value: accountValue,
            change: changePercent,
            color: account.modelInfo.color,
            accountAlias: usdtBalance.accountAlias,
            asset: usdtBalance.asset,
            balance: accountValue,
            crossWalletBalance: parseToNumber(usdtBalance.crossWalletBalance),
            crossUnPnl: parseToNumber(usdtBalance.crossUnPnl),
            availableBalance: availableBalanceValue,
            availableCash: finalAvailableCash,
            maxWithdrawAmount: parseToNumber(usdtBalance.maxWithdrawAmount),
            marginAvailable: usdtBalance.marginAvailable,
            updateTime: usdtBalance.updateTime,
            totalUsdtValue: parseToNumber(usdtBalance.totalUsdtValue),
            uid: usdtBalance.uid,
            walletName: usdtBalance.walletName
          }

          balanceDataMap.set(account.modelInfo.name, modelData)

          // Build account data for Positions component
          accountDataList.push({
            modelInfo: account.modelInfo,
            availableBalance: availableBalanceValue,
            availableCash: finalAvailableCash,
            totalValue: parseToNumber(usdtBalance.totalValue ?? usdtBalance.balance)
          })
        }
      }
    })

    // Set account data for Positions component
    asterAccountData.value = accountDataList

    // Convert map to array and sort by value
    const balanceData = Array.from(balanceDataMap.values())
    balanceData.sort((a, b) => b.value - a.value)

    const btcIndex = balanceData.findIndex(item => item.isBtcPrice)
    if (btcIndex !== -1) {
      const btcItem = balanceData.splice(btcIndex, 1)[0]
      balanceData.push(btcItem)
    }

    // Add BTC price data as a model
    try {
      const btcResult = await getBtcPriceData('BTCUSDT', '5m')
      if (btcResult.success && btcResult.data.length > 0) {
        const firstPrice = parseFloat(btcResult.data[0][4])
        const btcQuantity = DEFAULT_INITIAL_CAPITAL / firstPrice
        const latestPrice = parseFloat(btcResult.data[btcResult.data.length - 1][4])
        const latestValue = btcQuantity * latestPrice

        const existingIndex = balanceData.findIndex(item => item.name === 'BTC BUY&HOLD')
        const btcModel = {
          name: 'BTC BUY&HOLD',
          value: latestValue,
          change: 0,
          color: '#f7931a',
          isBtcPrice: true
        }

        if (existingIndex !== -1) {
          balanceData[existingIndex] = btcModel
        } else {
          balanceData.push(btcModel)
        }
      }
      console.log('balanceData:', balanceData)
    } catch (error) {
      console.warn('⚠️ Failed to load BTC price for trading models:', error)
    }

    // Only update tradingModels if we have real data or it's a refresh
    // For refresh scenarios (skipInit), always update since we're updating existing data
    if (skipInit || hasRealData) {
      tradingModels.value = balanceData
      asterBalance.value = balanceData

      // Mark balance data as loaded only if we have real data from API (not just initial 0 values)
      // For refresh scenarios (skipInit), only mark as loaded if we have real data
      if (hasRealData) {
        balanceDataLoaded.value = true
      }

      // Update balance data in config file
      balanceData.forEach(modelData => {
        updateAccountBalance(modelData.name, {
          accountAlias: modelData.accountAlias,
          asset: modelData.asset,
          balance: modelData.balance,
          crossWalletBalance: modelData.crossWalletBalance,
          crossUnPnl: modelData.crossUnPnl,
          availableBalance: modelData.availableBalance,
          maxWithdrawAmount: modelData.maxWithdrawAmount,
          marginAvailable: modelData.marginAvailable,
          updateTime: modelData.updateTime,
          totalUsdtValue: modelData.totalUsdtValue,
          uid: modelData.uid,
          walletName: modelData.walletName
        })
      })

      updateRealDataWithAnimation(balanceData)
    } else {
      // If no real data, keep existing data and don't update balanceDataLoaded
      console.log('⚠️ No real data loaded, keeping existing display state')
    }
  }

  // Step 1: Check cache first and use it immediately if exists
  let cachedData = null
  if (!skipCache) {
    cachedData = getCachedData('balance')
    if (cachedData) {
      console.log('✅ Using cached balance data, will update with fresh data in background')
      await processAndUpdateData(cachedData, { skipInit })
      asterBalanceLoading.value = false
    } else {
      asterBalanceLoading.value = true
      if (!skipInit) {
        tradingModels.value = initializeTradingModelsFromConfig()
      }
    }
  }

  asterBalanceError.value = null

  // Step 2: Fetch fresh data in background (whether we have cache or not)
  try {
    console.log('🔄 Fetching fresh balance data in background...')
    const result = await getAllModelsProcessedBalance(skipCache)

    // Cache the result
    if (result.success) {
      setCachedData('balance', result)
      console.log('✅ Updated cache with fresh balance data')

      // Process and update UI with fresh data
      await processAndUpdateData(result, { skipInit })
    } else {
      asterBalanceError.value = result.error
      console.error('❌ Account balance loading failed:', result.error)

      // Keep models from config instead of empty array
      if (tradingModels.value.length === 0) {
        tradingModels.value = initializeTradingModelsFromConfig()
      }
    }
  } catch (error) {
    asterBalanceError.value = error.message
    console.error('❌ Account balance loading exception:', error)

    // Keep models from config instead of empty array
    if (tradingModels.value.length === 0) {
      tradingModels.value = initializeTradingModelsFromConfig()
    }
  } finally {
    asterBalanceLoading.value = false
  }
}

const legends = computed(() => tradingModels.value)

// Whether chart data is available for rendering right-icons (check if datasets have actual data)
const hasChartData = computed(() => {
  if (!chartData.value || !chartData.value.datasets || chartData.value.datasets.length === 0) {
    return false
  }

  // Check if at least one dataset has non-null data points
  return chartData.value.datasets.some(dataset => {
    if (!dataset.data || dataset.data.length === 0) {
      return false
    }
    // Check if there's at least one non-null value
    return dataset.data.some(value => value !== null && value !== undefined)
  })
})

// Dynamically generate x-axis ticks
const xAxisTicks = computed(() => {
  if (!chartData.value || !chartData.value.labels) return []

  const labels = chartData.value.labels
  const tickCount = 5 // Display 5 tick marks
  const step = Math.floor(labels.length / (tickCount - 1))

  return Array.from({ length: tickCount }, (_, i) => {
    const index = Math.min(i * step, labels.length - 1)
    const date = new Date(labels[index])
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })
})

const highestModel = computed(() => {
  if (tradingModels.value.length === 0) {
    return {
      ...defaultModel,
      prevValue: 0
    }
  }
  const current = tradingModels.value.reduce((max, model) => model.value > max.value ? model : max)
  return {
    ...current,
    prevValue: current.prevValue || current.value
  }
})

const lowestModel = computed(() => {
  if (tradingModels.value.length === 0) {
    return {
      ...defaultModel,
      prevValue: 0
    }
  }
  const current = tradingModels.value.reduce((min, model) => model.value < min.value ? model : min)
  return {
    ...current,
    prevValue: current.prevValue || current.value
  }
})

// Load chart data for all models
const loadChartData = async () => {
  chartDataLoading.value = true
  chartDataError.value = null

  try {
    // Get enabled models with uid
    const enabledModels = getModelInfo().filter(model => model.uid)

    if (enabledModels.length === 0) {
      console.warn('⚠️ No models with UID found for chart data')
      chartDataError.value = 'No models with UID found'
      return
    }
    // Concurrently get chart data for all models and BTC price data
    const [chartResult, btcPriceResult] = await Promise.allSettled([
      getAllModelsChartData(enabledModels, 10000),
      getBtcPriceData('BTCUSDT', '5m')
    ])

    const result = chartResult.status === 'fulfilled' ? chartResult.value : { success: false, models: [] }
    const btcPriceData = btcPriceResult.status === 'fulfilled' ? btcPriceResult.value : { success: false, data: [] }

    if (result.success) {
      // Process chart data with BTC price data
      const processedData = await processChartData(result.models, btcPriceData)
      chartData.value = processedData

      // Update chart if it exists
      if (chartInstance) {
        chartInstance.data = chartData.value
        chartInstance.update('none')
      } else {
        // Build chart if it doesn't exist
        buildChart()
      }
    } else {
      chartDataError.value = result.error
      console.error('❌ Failed to load chart data:', result.error)
    }
  } catch (error) {
    chartDataError.value = error.message
    console.error('❌ Chart data loading exception:', error)
  } finally {
    chartDataLoading.value = false
  }
}

const buildChart = async () => {
  await nextTick()
  if (!chartCanvas.value) return

  // Wait for real chart data to be loaded
  if (!chartData.value) {
    console.log('⏳ Waiting for chart data to be loaded...')
    return
  }

  if (chartInstance) return // 已经存在，不重复创建
  const ctx = chartCanvas.value.getContext('2d')
  const { labels, datasets } = chartData.value

  // 过滤数据集（如果选择了特定模型）
  const filteredDatasets = selectedModelForChart.value
    ? datasets.filter(d => d.modelInfo.name === selectedModelForChart.value)
    : datasets

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: filteredDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      onHover: (event, activeElements) => {
        if (activeElements.length > 0) {
          const datasetIndex = activeElements[0].datasetIndex
          const dataset = chartInstance.data.datasets[datasetIndex]
          hoveredModel.value = dataset ? dataset.modelInfo : null
          hoveredDatasetIndex = datasetIndex

          // Update opacity for all datasets
          chartInstance.data.datasets.forEach((ds, index) => {
            if (index === datasetIndex) {
              // Selected line: full opacity
              ds.borderColor = ds.modelInfo.color
              ds.backgroundColor = hexToRgba(ds.modelInfo.color, 0.2)
              ds.borderWidth = 1.5
            } else {
              // Other lines: reduced opacity (0.5)
              ds.borderColor = hexToRgba(ds.modelInfo.color, 0.5)
              ds.backgroundColor = hexToRgba(ds.modelInfo.color, 0.1)
              ds.borderWidth = 1
            }
          })
          chartInstance.update('none')

          // Trigger icon position update to update icon-item opacity
          iconPositionUpdate.value++
        } else {
          // Reset all opacity when mouse is not on any line
          resetAllOpacity()
        }
      },
      onClick: (event, activeElements) => {
        if (activeElements.length > 0) {
          const datasetIndex = activeElements[0].datasetIndex
          const dataset = chartInstance.data.datasets[datasetIndex]
          if (dataset) {
            selectedModel.value = dataset.modelInfo.name
            showBackAllButton.value = true
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#475569',
          borderWidth: 1,
          displayColors: false, // Remove the color square indicator
          filter: (tooltipItem) => {
            // Only show the tooltip for the hovered dataset
            if (hoveredDatasetIndex >= 0) {
              return tooltipItem.datasetIndex === hoveredDatasetIndex
            }
            // If no hover, don't show tooltip
            return false
          },
          callbacks: {
            title: (context) => {
              if (context.length === 0) return ''
              const date = new Date(context[0].label)
              return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            },
            label: (context) => {
              if (context.dataset.label === 'BTC BUY&HOLD') {
                return `$${context.parsed.y.toLocaleString()}`
                // return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
              }
              return ` $${context.parsed.y.toLocaleString()}`
              // return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
            }
          }
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1
            },
            pinch: {
              enabled: true
            },
            mode: 'xy'
          },
          pan: {
            enabled: true,
            mode: 'xy'
          },
          limits: {
            x: { min: 'original', max: 'original' },
            y: { min: 'original', max: 'original' }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { color: '#2b3444', drawBorder: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 11, weight: 'bold' },
            maxTicksLimit: 10, // Limit x-axis ticks for better performance with large datasets
            callback: function(value, index, ticks) {
              // Use labels from closure
              if (!labels || !labels[value]) return ''
              const date = new Date(labels[value])
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: '#2b3444', drawBorder: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 12, weight: 'bold' },
            callback: (value) => '$' + value.toLocaleString(),
            stepSize: 500, // Fixed step size of 500 for clean tick marks
            maxTicksLimit: 12
          },
          min: chartData.value.yAxisRange.min,
          max: chartData.value.yAxisRange.max
        }
      },
      elements: {
        point: {
          radius: 0, // Hide points for better performance with large datasets
          hoverRadius: 4
        },
        line: {
          tension: 0.4, // Smooth curves
          spanGaps: false // Don't connect points across null values
        }
      },
      animation: {
        duration: 0 // Disable animation for better performance with large datasets
      }
    }
  })

  // Trigger icon position update after chart is built
  nextTick(() => {
    iconPositionUpdate.value++
  })
}

// Update chart data
const updateChart = () => {
  if (!chartInstance || !chartData.value) return

  const { labels, datasets } = chartData.value
  let filteredDatasets = datasets

  // Filter data based on selected model
  if (selectedModel.value && selectedModel.value !== 'ALL MODELS') {
    filteredDatasets = datasets.filter(d => d.modelInfo.name === selectedModel.value)
    selectedModelForChart.value = selectedModel.value
    showBackAllButton.value = true
  } else {
    // Show all models
    selectedModelForChart.value = null
    showBackAllButton.value = false
    filteredDatasets = datasets // Ensure all datasets are shown
  }

  // Update chart data comprehensively
  chartInstance.data.labels = labels
  chartInstance.data.datasets = filteredDatasets
  chartInstance.update('none')

  // Trigger icon position update after chart update
  nextTick(() => {
    iconPositionUpdate.value++
  })
}

// Number rolling animation component
const createRollingNumber = (element, fromValue, toValue, duration = 1000) => {
  const startTime = Date.now()
  const difference = toValue - fromValue

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Use easing function
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    const currentValue = fromValue + (difference * easeOutCubic)

    // Set different text formats based on element type
    if (element.classList.contains('rolling-value')) {
      element.textContent = Math.round(currentValue).toLocaleString()
    } else if (element.classList.contains('price')) {
      // Price elements need dollar sign and formatting
      element.textContent = '$' + currentValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    } else {
      element.textContent = '$' + Math.round(currentValue).toLocaleString()
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Real data update animation
const updateRealDataWithAnimation = (newBalanceData) => {
  if (!newBalanceData || !balanceDataLoaded.value) return

  // Save current highest and lowest values
  const prevHighestValue = highestModel.value.value
  const prevLowestValue = lowestModel.value.value

  // Update model data
  tradingModels.value.forEach((model, index) => {
    const newModelData = newBalanceData.find(newModel => newModel.name === model.name)
    if (newModelData) {
      const oldValue = model.value
      const newValue = newModelData.balance ? parseFloat(newModelData.balance) : newModelData.value

      // Save old value for animation
      model.prevValue = oldValue

      // Update model value
      model.value = newValue
      model.balance = newModelData.balance
      model.accountAlias = newModelData.accountAlias

      // Add rolling animation to corresponding DOM elements
      nextTick(() => {
        const modelElements = document.querySelectorAll('.model-value')
        if (modelElements[index]) {
          createRollingNumber(modelElements[index], oldValue, newValue, 800)
        }
      })
    }
  })

  // Add rolling animation to numbers in performance-summary
  nextTick(() => {
    const highestValueElement = document.querySelector('.performance-summary .highest .value-row .rolling-value')
    const lowestValueElement = document.querySelector('.performance-summary .lowest .value-row .rolling-value')

    if (highestValueElement && highestModel.value.value !== prevHighestValue) {
      createRollingNumber(highestValueElement, prevHighestValue, highestModel.value.value, 800)
    }

    if (lowestValueElement && lowestModel.value.value !== prevLowestValue) {
      createRollingNumber(lowestValueElement, prevLowestValue, lowestModel.value.value, 800)
    }
  })
}

// Return to all models view
const backToAllModels = () => {
  selectedModelForChart.value = null
  selectedModel.value = 'ALL MODELS'
  showBackAllButton.value = false
}

// Scheduled data updates - separate intervals for different data types
let balanceUpdateInterval = null
let chartDataLongInterval = null // 30-minute interval for chart data
let balanceLongInterval = null // 30-minute interval for balance data
let positionsUpdateInterval = null // 15-second interval for positions data

// Load crypto prices asynchronously (fast, non-blocking)
const loadCryptoPricesAsync = async () => {
  console.log('🚀 Loading crypto prices asynchronously...')
  try {
    await fetchCryptoPrices()
    console.log('✅ Crypto prices loaded')
  } catch (error) {
    console.error('❌ Error loading crypto prices:', error)
  }
}

// Main sequential data loading function
const loadAllData = async () => {
  console.log('🔄 Starting sequential data load...')

  // Start crypto prices async request (doesn't block)
  loadCryptoPricesAsync()

  try {
    // Step 1: Load chart data and BTC price
    console.log('📊 Step 1: Loading chart data and BTC price...')
    await loadChartData()

    // Step 2: Load all models balance
    console.log('💰 Step 2: Loading all models balance...')
    await loadAsterBalance()

    // Step 3: Load all models positions
    console.log('📍 Step 3: Loading all models positions...')
    await loadAsterAccountData()

    // Step 4: Load all models trades
    console.log('📈 Step 4: Loading all models trades...')
    await loadAsterUserTrades()

    console.log('✅ All data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading data:', error)
  }
}

// Refresh model balance every 15 seconds
const startBalanceUpdates = () => {
  balanceUpdateInterval = setInterval(() => {
    console.log('🔄 Refreshing model balance data...')
    loadAsterBalance({ skipInit: true, skipCache: true })
  }, 15000) // Update balance every 15 seconds
}

const stopBalanceUpdates = () => {
  if (balanceUpdateInterval) {
    clearInterval(balanceUpdateInterval)
    balanceUpdateInterval = null
  }
}

const startPositionsUpdates = () => {
  positionsUpdateInterval = setInterval(() => {
    console.log('🔄 Refreshing positions data...')
    loadAsterAccountData({ skipCache: true })
  }, 15000) // Update positions every 15 seconds
}

const stopPositionsUpdates = () => {
  if (positionsUpdateInterval) {
    clearInterval(positionsUpdateInterval)
    positionsUpdateInterval = null
  }
}

// Start 30-minute interval for chart data refresh
const startChartDataLongUpdates = () => {
  // 30 minutes = 30 * 60 * 1000 = 1800000 milliseconds
  chartDataLongInterval = setInterval(() => {
    console.log('🔄 Refreshing chart data (30-minute interval)...')
    loadChartData()
  }, 30 * 60 * 1000)
}

const stopChartDataLongUpdates = () => {
  if (chartDataLongInterval) {
    clearInterval(chartDataLongInterval)
    chartDataLongInterval = null
  }
}

// Start 30-minute interval for balance data refresh
const startBalanceLongUpdates = () => {
  // 30 minutes = 30 * 60 * 1000 = 1800000 milliseconds
  balanceLongInterval = setInterval(() => {
    console.log('🔄 Refreshing balance data (30-minute interval)...')
    loadAsterBalance({ skipInit: true, skipCache: true })
  }, 30 * 60 * 1000)
}

const stopBalanceLongUpdates = () => {
  if (balanceLongInterval) {
    clearInterval(balanceLongInterval)
    balanceLongInterval = null
  }
}

// Legacy function for compatibility - removed trades/positions auto refresh
const startDataUpdates = () => {
  startBalanceUpdates()
  startPositionsUpdates()
}

const stopDataUpdates = () => {
  stopBalanceUpdates()
  stopPositionsUpdates()
}

// Get model image
const getModelImage = (modelName) => {
  return getModelIconPath(modelName)
}

// Determine if background color should be set
// Only GROK 4 needs background color (too similar to theme), others don't
const shouldShowBackground = (modelName) => {
  return modelName === 'GROK 4'
}

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Get icon item style with dynamic positioning based on chart data point
const getIconItemStyle = (model) => {
  // Reference iconPositionUpdate to trigger reactivity
  const _ = iconPositionUpdate.value

  // Set opacity based on hover state
  let opacity = 1
  if (hoveredModel.value) {
    // If hovering over a model, set opacity to 0.5 for non-hovered items, 1 for hovered item
    opacity = hoveredModel.value.name === model.name ? 1 : 0.5
  }

  const baseStyle = {
    display: selectedModel.value === 'ALL MODELS' || selectedModel.value === model.name ? 'flex' : 'none',
    position: 'absolute',
    right: '8px',
    transform: 'translateY(-50%)',
    opacity: opacity.toString()
  }

  // If chart is not ready, return base style
  if (!chartInstance || !chartData.value || !chartCanvas.value) {
    return baseStyle
  }

  try {
    // Find the dataset for this model
    const dataset = chartInstance.data.datasets.find(d => d.modelInfo?.name === model.name)
    if (!dataset || !dataset.data || dataset.data.length === 0) {
      return baseStyle
    }

    // Get the last non-null value from the dataset
    let lastValue = null
    for (let i = dataset.data.length - 1; i >= 0; i--) {
      if (dataset.data[i] !== null && dataset.data[i] !== undefined) {
        lastValue = dataset.data[i]
        break
      }
    }

    if (lastValue === null) {
      return baseStyle
    }

    // Get the y scale
    const yScale = chartInstance.scales.y
    if (!yScale) {
      return baseStyle
    }

    // Get the pixel position for the y value (relative to canvas)
    const yPixel = yScale.getPixelForValue(lastValue)

    // Get the chart canvas element and its container
    const canvasElement = chartCanvas.value
    const chartCanvasContainer = canvasElement.closest('.chart-canvas')

    if (!chartCanvasContainer) {
      return baseStyle
    }

    // Get the chart frame container
    const chartFrame = chartCanvasContainer.closest('.chart-frame')
    if (!chartFrame) {
      return baseStyle
    }

    // Get positions using getBoundingClientRect
    // Wait for next tick to ensure DOM is ready
    const canvasRect = chartCanvasContainer.getBoundingClientRect()
    const chartFrameRect = chartFrame.getBoundingClientRect()

    // Calculate offset: canvas container top relative to chart-frame top
    // yPixel is relative to the canvas top, so we need to add the canvas offset
    const offsetTop = canvasRect.top - chartFrameRect.top

    // Calculate final top position: yPixel is relative to canvas top, add the offset
    const topPosition = yPixel + offsetTop

    return {
      ...baseStyle,
      top: `${topPosition}px`
    }
  } catch (error) {
    console.warn('Error calculating icon item position:', error)
    return baseStyle
  }
}

// Reset all lines and icons to full opacity
const resetAllOpacity = () => {
  if (!chartInstance || !chartData.value) return

  hoveredModel.value = null
  hoveredDatasetIndex = -1

  // Reset all datasets to full opacity
  chartInstance.data.datasets.forEach((ds) => {
    ds.borderColor = ds.modelInfo.color
    ds.backgroundColor = hexToRgba(ds.modelInfo.color, 0.2)
    ds.borderWidth = 1.5
  })
  chartInstance.update('none')

  // Trigger icon position update to update icon-item opacity
  iconPositionUpdate.value++
}

// Handle icon item hover - update chart opacity when hovering over icon items
const handleIconItemHover = (model) => {
  if (!chartInstance || !chartData.value) return

  // Find the dataset for this model
  const dataset = chartInstance.data.datasets.find(
    ds => ds.modelInfo && ds.modelInfo.name === model.name
  )

  if (dataset && dataset.modelInfo) {
    hoveredModel.value = dataset.modelInfo
    hoveredDatasetIndex = chartInstance.data.datasets.indexOf(dataset)
  } else {
    // If dataset not found, create a modelInfo object from the model
    hoveredModel.value = {
      name: model.name,
      color: model.color,
      uid: model.uid || null
    }
    hoveredDatasetIndex = -1
  }

  // Update opacity for all datasets
  chartInstance.data.datasets.forEach((ds) => {
    if (ds.modelInfo && ds.modelInfo.name === model.name) {
      // Selected line: full opacity
      ds.borderColor = ds.modelInfo.color
      ds.backgroundColor = hexToRgba(ds.modelInfo.color, 0.2)
      ds.borderWidth = 1.5
    } else {
      // Other lines: reduced opacity (0.5)
      ds.borderColor = hexToRgba(ds.modelInfo.color, 0.5)
      ds.backgroundColor = hexToRgba(ds.modelInfo.color, 0.1)
      ds.borderWidth = 1
    }
  })
  chartInstance.update('none')

  // Trigger icon position update to update icon-item opacity
  iconPositionUpdate.value++
}

// Handle icon item leave - reset chart opacity when leaving icon items
const handleIconItemLeave = () => {
  // Reset all opacity when mouse leaves icon item
  resetAllOpacity()
}

// Handle chart leave - reset opacity when mouse leaves chart area
const handleChartLeave = (event) => {
  // Check if mouse moved to icon area
  const relatedTarget = event.relatedTarget
  if (relatedTarget) {
    const rightIcons = document.querySelector('.right-icons')
    // If mouse moved to icon area, don't reset (handleIconItemHover will handle it)
    if (rightIcons && (rightIcons.contains(relatedTarget) || rightIcons === relatedTarget)) {
      return
    }
  }

  // Mouse left chart area (and not moved to icon area), reset opacity
  // Use a small delay to allow icon hover events to process first
  setTimeout(() => {
    resetAllOpacity()
  }, 50)
}

// Get trading history using new trades service
const loadAsterUserTrades = async () => {
  // Helper function to process trades data
  const processTradesData = (result) => {
    let allTrades = []
    result.accounts.forEach(account => {
      if (account.success && account.data) {
        // Filter out trades with realizedPnl === 0
        const filteredTrades = account.data.filter(trade => {
          const realizedPnl = parseFloat(trade.realizedPnl)
          return realizedPnl !== 0
        })
        allTrades = allTrades.concat(filteredTrades)
      }
    })
    allTrades.sort((a, b) => b.time - a.time)
    asterUserTrades.value = allTrades
  }

  // Step 1: Check cache first and use it immediately
  const cachedData = getCachedData('trades')
  if (cachedData) {
    console.log('✅ Using cached trades data, will update with fresh data in background')
    processTradesData(cachedData)
    asterTradesLoading.value = false
  } else {
    asterTradesLoading.value = true
  }

  asterTradesError.value = null

  // Step 2: Fetch fresh data in background
  try {
    console.log('🔄 Fetching fresh trades data in background...')
    const result = await getAllModelsProcessedTrades()

    // Cache the result
    if (result.success) {
      setCachedData('trades', result)
      console.log('✅ Updated cache with fresh trades data')

      // Process and update UI with fresh data
      processTradesData(result)
    } else {
      asterTradesError.value = result.error
      console.error('❌ Trading history loading failed:', result.error)

      // Keep empty array instead of mock data
      asterUserTrades.value = []
    }
  } catch (error) {
    asterTradesError.value = error.message
    console.error('❌ Trading history loading exception:', error)

    // Keep empty array instead of mock data
    asterUserTrades.value = []
  } finally {
    asterTradesLoading.value = false
  }
}

// Get account positions data using new positions service
const loadAsterAccountData = async ({ skipCache = false } = {}) => {
  // Helper function to process positions data
  const processPositionsData = (result) => {
    const allPositions = []
    result.accounts.forEach(account => {
      if (account.success && account.data) {
        const positionsWithModel = account.data.map(position => ({
          ...position,
          modelInfo: account.modelInfo
        }))
        allPositions.push(...positionsWithModel)
      }
    })
    asterPositions.value = allPositions
  }

  // Step 1: Check cache first and use it immediately
  let cachedData = null
  if (!skipCache) {
    cachedData = getCachedData('positions')
    if (cachedData) {
      console.log('✅ Using cached positions data, will update with fresh data in background')
      processPositionsData(cachedData)
      asterLoading.value = false
    } else {
      asterLoading.value = true
    }
  }

  asterError.value = null

  // Step 2: Fetch fresh data in background
  try {
    console.log('🔄 Fetching fresh positions data in background...')
    const result = await getAllModelsProcessedPositions(skipCache)

    // Cache the result
    if (result.success) {
      setCachedData('positions', result)
      console.log('✅ Updated cache with fresh positions data')

      // Process and update UI with fresh data
      processPositionsData(result)
    } else {
      asterError.value = result.error
      console.error('❌ Account positions loading failed:', result.error)

      // Keep empty arrays instead of mock data
      asterAccountData.value = null
      asterPositions.value = []
    }
  } catch (error) {
    asterError.value = error.message
    console.error('❌ Account positions loading exception:', error)

    // Keep empty arrays instead of mock data
    asterAccountData.value = null
    asterPositions.value = []
  } finally {
    asterLoading.value = false
  }
}

// Aster Finance API related functions
const fetchCryptoPrices = async () => {
  try {
    // Use new Aster Finance API to get crypto prices
    const result = await getAllCryptoPrices()

    if (result.success) {
      // Track if we have real price data (not just 0)
      let hasRealPriceData = false

      // Update cryptoPrices data and detect price changes
      cryptoPrices.value.forEach((crypto, index) => {
        const priceData = result.prices.find(p => p.name === crypto.symbol)
        if (priceData && priceData.price > 0) {
          hasRealPriceData = true
          const newPrice = priceData.price
          const priceChangePercent = 0 // Aster Finance ticker/price doesn't provide 24h change

          // Check if price has changed (avoid triggering animation for small changes)
          const priceChanged = Math.abs(newPrice - crypto.price) > 0.01

          if (priceChanged) {
            // Save old price for rolling animation
            crypto.prevPrice = crypto.price
            crypto.price = newPrice
            crypto.change = priceChangePercent

            // Add rolling animation for price changes
            nextTick(() => {
              const priceElement = document.querySelector(`.ticker-item:nth-child(${index + 1}) .price`)
              if (priceElement) {
                createRollingNumber(priceElement, crypto.prevPrice, newPrice, 800)
              }
            })
          } else {
            // Even if price has not changed, update percentage change
            crypto.change = priceChangePercent
          }
        }
      })

      // Mark crypto prices as loaded only if we have real price data
      // For refresh scenarios, always mark as loaded since we're updating existing data
      if (hasRealPriceData || cryptoPricesLoaded.value) {
        cryptoPricesLoaded.value = true
      }
    } else {
      console.error('❌ Failed to fetch crypto prices from Aster Finance:', result.error)
    }
  } catch (error) {
    console.error('❌ Failed to fetch crypto prices:', error)
  }
}

// Scheduled price data updates
let priceUpdateInterval = null

const startPriceUpdates = () => {
  // Update price every 5 seconds
  priceUpdateInterval = setInterval(() => {
    console.log('🔄 Refreshing crypto prices...')
    fetchCryptoPrices()
  }, 30000)
}

const stopPriceUpdates = () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
    priceUpdateInterval = null
  }
}

const setActiveTab = (tab) => { activeTab.value = tab }
const setActiveDetailTab = (tab) => {
  activeDetailTab.value = tab

  // Open modal on mobile (screen width <= 960px)
  if (window.innerWidth <= 960) {
    showMobileModal.value = true
  }
}

const closeMobileModal = () => {
  showMobileModal.value = false
}

const getModalTitle = () => {
  switch (activeDetailTab.value) {
    case 'trades': return t('home.completedTrades')
    case 'prompts': return t('home.prompts')
    case 'positions': return t('home.positions')
    case 'readme': return t('home.readme')
    default: return 'DETAILS'
  }
}

const setChartPeriod = (period) => { chartPeriod.value = period }
const goToLeaderboard = () => { router.push('/leaderboard') }
const joinWaitlist = () => { alert('Join waitlist feature to be implemented') }
const aboutRFGAI = () => { alert('About RFG AI feature to be implemented') }

const getActiveDetailComponent = () => {
  const components = { trades: CompletedTrades, model: ModelChatFeed, chat: ModelChatFeed, prompts: Prompts, positions: Positions, readme: Readme }
  return components[activeDetailTab.value]
}

// Format number: show "--" on initial load, show actual number (including 0) on refresh
// When showing "--", don't show unit symbols like $ or %
// useBalanceData: true for model balance data, false for crypto prices
const formatNumber = (value, options = {}) => {
  // Determine which loaded state to check based on useBalanceData option
  // Default to balanceDataLoaded for backward compatibility
  const isLoaded = options.useBalanceData === false ? cryptoPricesLoaded.value : balanceDataLoaded.value

  if (!isLoaded) {
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

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connecting': return t('home.statusConnecting')
    case 'connected': return t('home.statusConnected')
    case 'disconnected': return t('home.statusDisconnected')
    default: return t('home.statusUnknown')
  }
}

watch(selectedModel, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    updateChart()
  }
})

// Window resize handler for icon positions
let resizeHandler = null

onMounted(() => {
  setTimeout(() => { connectionStatus.value = 'connected' }, 1500)

  // Initialize trading models from config to ensure all models are shown immediately
  tradingModels.value = initializeTradingModelsFromConfig()

  // Load all data sequentially
  loadAllData()

  // Start auto refresh for balance (every 15s) and crypto prices (every 5s)
  startDataUpdates()
  startPriceUpdates()

  // Start 30-minute intervals for chart data and balance data refresh
  startChartDataLongUpdates()
  startBalanceLongUpdates()

  // Add window resize listener to update icon positions
  resizeHandler = () => {
    if (chartInstance) {
      nextTick(() => {
        iconPositionUpdate.value++
      })
    }
  }

  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
  stopDataUpdates()
  stopPriceUpdates()
  stopChartDataLongUpdates()
  stopBalanceLongUpdates()
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style lang="stylus" scoped>
.home-container
  min-height 100vh
  background #0f172a
  padding-bottom 72px // safe area for fixed legend bar

.header
  background #0f172a
  border-bottom 1px solid #2b3444
  padding 14px 0

.header-content
  width 100%
  padding 0 16px
  display flex
  align-items center
  justify-content space-between

.logo h1
  color #f8fafc
  font-size 22px
  font-weight 800
  margin 0

.nav
  display flex
  gap 24px

.nav-item
  color #cbd5e1
  cursor pointer
  padding 6px 10px
  border-radius 4px
  transition all 0.2s ease
  font-weight 700
  letter-spacing .02em

  &.active, &:hover
    color #f8fafc
    background #1a2230

.header-actions
  display flex
  gap 12px

.btn-primary, .btn-secondary
  font-size 12px
  padding 8px 16px
  border-radius 6px
  font-weight 800
  cursor pointer
  transition all 0.2s ease

.btn-primary
  background linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
  border none
  color white
  &:hover
    transform translateY(-1px)
    box-shadow 0 5px 15px rgba(59, 130, 246, 0.25)

.btn-secondary
  background transparent
  border 1px solid #2b3444
  color #cbd5e1
  &:hover
    border-color #3b82f6
    color #3b82f6

.ticker-bar
  background #0f172a
  border-bottom 1px solid #2b3444

.ticker-content
  width 100%
  padding 8px 16px
  display flex
  justify-content space-between
  align-items center

.ticker-left
  display flex
  gap 24px
  overflow-x auto

.ticker-right
  display flex
  align-items center
  gap 16px

.ticker-item
  display flex
  flex-direction column
  gap 4px
  color #e5e7eb
  white-space nowrap
  font-weight 600
  font-size 12px
  padding 8px 12px
  border-radius 6px
  background rgba(255, 255, 255, 0.05)
  border 1px solid rgba(255, 255, 255, 0.1)
  transition all 0.2s ease
  width 120px
  flex-shrink 0

  &:hover
    background rgba(255, 255, 255, 0.08)
    border-color rgba(255, 255, 255, 0.2)

.icon-sym-row
  display flex
  align-items center
  gap 8px

.crypto-icon
  width 24px
  height 24px
  display flex
  align-items center
  justify-content center
  border-radius 50%
  background rgba(255, 255, 255, 0.1)

  img
    width 20px
    height 20px
    object-fit contain

.crypto-info
  display flex
  flex-direction column
  gap 2px

.sym
  color #f8fafc
  font-weight 700
  font-size 11px
  text-transform uppercase

.price
  color #e5e7eb
  font-weight 600
  font-size 12px
  font-family 'JetBrains Mono', monospace

.main-content
  width 100%
  padding 12px 16px 24px

// Make the grid consume viewport height minus header/ticker paddings (~170px)
.main-grid
  display grid
  grid-template-columns 1fr 500px
  gap 12px
  height calc(100vh - 300px)

.left-panel
  background #0f172a
  border 1px solid #2b3444
  display flex
  flex-direction column
  height 100%
  align-self stretch
  min-height 0

.panel-header
  display flex
  justify-content space-between
  align-items center
  padding 8px 10px
  border-bottom 1px solid #2b3444

.title-container
  display flex
  align-items center
  gap 12px

.back-all-btn
  background #10b981
  color white
  border none
  padding 6px 12px
  border-radius 4px
  font-size 12px
  font-weight 700
  cursor pointer
  transition all 0.2s ease

  &:hover
    background #059669
    transform translateY(-1px)

.title
  color #e5e7eb
  font-weight 800
  font-size 12px
  letter-spacing .08em

.periods
  display flex
  gap 6px

.chart-btn
  background transparent
  //border 1px solid #2b3444
  color #cbd5e1
  padding 4px 10px
  border-radius 4px
  cursor pointer
  font-size 12px
  font-weight 700
  &:hover
    border-color #3b82f6
    color #3b82f6
  &.active
    background #3b82f6
    color #fff
    border-color #3b82f6

.chart-frame
  position relative
  padding 8px 160px 6px 22px  // 右边从8px改为48px，增加40px间距
  flex 1 // fill remaining height below header
  min-height 320px

.y-axis-label
  position absolute
  left 6px
  top 6px
  color #cbd5e1
  font-weight 700

.chart-canvas
  height 100%
  position relative

#tradingChart
  width 100% !important
  height 100% !important
  display block

.right-icons
  position absolute
  right 0
  top 0
  bottom 0
  width 160px
  pointer-events none
  z-index 1

.icon-item
  display flex
  align-items center
  gap 8px
  padding 6px 8px
  cursor pointer
  transition all 0.2s ease
  min-width 155px
  pointer-events auto
  &:hover, &.hovered
    //background rgba(15, 23, 42, 0.95)
    transform scale(1.05) translateY(-50%) !important

.icon-dot
  width 8px
  height 8px
  border-radius 50%
  flex-shrink 0

.icon-content
  display flex
  align-items center
  gap 8px

.model-image
  width 30px
  height 30px
  display flex
  align-items center
  justify-content center

  img
    width 100%
    height 100%
    object-fit contain
    border-radius 2px

.model-value
  color #f8fafc
  font-size 12px
  font-weight 800
  font-family 'JetBrains Mono', monospace
  white-space nowrap
  padding 2px 4px


.x-axis
  display flex
  justify-content space-between
  color #94a3b8
  font-size 10px
  padding 0 8px 6px

.right-panel
  background #0f172a
  border 1px solid #2b3444
  display flex
  flex-direction column
  height 100%
  min-height 0
  overflow hidden

.performance-summary
  display flex
  gap 16px
  .highest, .lowest
    color #cbd5e1
    font-size 12px
    font-weight 700
    margin 0
    display flex
    flex-direction column
    gap 4px

  .value-row
    display flex
    align-items center
    gap 8px

  .rolling-value, .positive, .negative
    color #f8fafc
    font-weight 800
    font-family 'JetBrains Mono', monospace

  .positive
    color #10b981

  .negative
    color #ef4444

.filter-section
  padding 8px 10px
  border-bottom 1px solid #2b3444
  display flex
  justify-content space-between
  align-items center

.filter
  display flex
  align-items center
  gap 8px

.label
  color #cbd5e1
  font-size 12px
  font-weight 700

.select
  background #0f172a
  color #f8fafc
  border 1px solid #2b3444
  border-radius 4px
  padding 4px 8px
  font-size 12px

.showing
  color #94a3b8
  font-size 12px
  font-weight 700

.sidebar-tabs
  display flex
  border-bottom 1px solid #2b3444

.sidebar-tabs .tab
  padding 10px 12px
  color #94a3b8
  cursor pointer
  font-size 12px
  font-weight 800
  letter-spacing .04em
  border-right 1px solid #2b3444
  &:hover
    color #f8fafc
    background #1a2230
  &.active
    color #3b82f6
    background #0f172a

.sidebar-content
  padding 0
  flex 1 1 auto
  min-height 0 // 允许子元素在flex容器中计算溢出
  overflow hidden

// trades-list 局部滚动容器
.sidebar-content > *
  height 100%
  overflow-y auto
  padding 10px

.legend-bar
  position fixed
  left 0
  right 0
  bottom 0
  border-top 1px solid #2b3444
  background #0f172a
  z-index 20

.legend-content
  width 100%
  padding 10px 16px
  display grid
  grid-template-columns repeat(auto-fit, minmax(120px, 1fr))
  gap 10px

.legend-item
  display flex
  align-items center
  gap 8px
  background #0f172a
  border 1px solid #2b3444
  padding 8px 10px
  border-radius 4px

.legend-content-inner
  display flex
  flex-direction column
  gap 4px

.legend-dot
  width 10px
  height 10px
  border-radius 50%

.legend-name
  color #e5e7eb
  font-weight 800
  font-size 12px

.legend-value
  color #f8fafc
  font-family 'JetBrains Mono', monospace
  font-weight 700

.connection-status
  position fixed
  bottom 84px // keep above fixed legend bar
  right 16px
  display flex
  align-items center
  background #0f172a
  border 1px solid #2b3444
  border-radius 6px
  padding 6px 10px

.status-text
  color #cbd5e1
  font-size 12px
  font-weight 700

.status-indicator
  width 8px
  height 8px
  border-radius 50%
  display inline-block
  margin-right 8px

.status-connecting
  background #f59e0b
.status-connected
  background #10b981
.status-disconnected
  background #ef4444

// Mobile responsive styles
@media (max-width: 960px)
  .home-container
    min-height auto
    padding-bottom 0

  .ticker-content
    padding 8px 12px
    flex-direction column
    align-items flex-start
    gap 12px

  .ticker-left
    width 100%
    display grid
    grid-template-columns repeat(3, 1fr)
    gap 8px

  .ticker-item
    width auto
    min-width 0
    padding 6px 8px
    font-size 10px

    .icon-sym-row
      gap 6px

    .crypto-icon
      width 20px
      height 20px

      img
        width 16px
        height 16px

    .sym
      font-size 10px

    .price
      font-size 11px

  .ticker-right
    width 100%
    flex-wrap wrap
    gap 8px

  .performance-summary
    flex 1 1 100%

    .highest, .lowest
      font-size 10px
      padding 6px 8px
      min-width 120px

      .value-row
        gap 6px

      .rolling-value, .positive, .negative
        font-size 10px

  .main-content
    padding 8px 12px 16px

  .main-grid
    grid-template-columns 1fr
    height auto
    gap 12px

  .left-panel
    order 1
    width 100%

  .right-panel
    order 2
    height auto
    padding 25px 0
    border 1px solid #2b3444

  // Hide filter-section and sidebar content on mobile
  .filter-section
    display none

  .sidebar-content
    display none

  .chart-frame
    height 400px !important
    width 100%
    padding 8px
    flex none !important

  .chart-canvas
    width 100%
    height 100% !important

  .right-icons
    // Icon items are now positioned individually based on chart data points

    .icon-item
      border none
      background-color transparent !important
      min-width 80px
      padding 0
      gap 6px

      .model-value
        font-size 10px

      .model-image
        width 16px
        height 16px

  .legend-bar
    position relative
    bottom auto

  .legend-content
    padding 8px 12px
    display grid
    grid-template-columns repeat(2, 1fr)
    gap 8px

  .legend-item
    padding 6px 8px

  .legend-name
    font-size 11px

  .legend-value
    font-size 10px

  .sidebar-tabs
    display grid
    grid-template-columns repeat(2, 1fr)
    gap 8px
    border-bottom none
    padding 8px

  .sidebar-tabs .tab
    padding 12px
    font-size 12px
    text-align center
    border 1px solid #2b3444
    border-radius 4px
    background #1a2230
    font-weight 700

    &.active
      background #3b82f6
      border-color #3b82f6
      color #ffffff

  .connection-status
    bottom 64px
    right 12px
    padding 4px 8px

  .status-text
    font-size 11px

// Mobile modal styles
@media (max-width: 960px)
  .mobile-modal
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    background rgba(0, 0, 0, 0.7)
    z-index 100
    display flex
    align-items center
    justify-content center
    padding 20px

  .modal-overlay
    background #1a2230
    border 1px solid #2b3444
    border-radius 12px
    width 100%
    max-width 600px
    height 80vh
    display flex
    flex-direction column
    overflow hidden

  .modal-header
    display flex
    justify-content space-between
    align-items center
    padding 16px 20px
    border-bottom 1px solid #2b3444
    background #0f172a

  .modal-title
    font-size 14px
    font-weight 700
    color #f8fafc

  .modal-close
    width 24px
    height 24px
    display flex
    align-items center
    justify-content center
    cursor pointer
    border-radius 4px
    background rgba(255, 255, 255, 0.1)
    color #94a3b8
    font-size 18px
    transition all 0.2s ease

    &:hover
      background rgba(255, 255, 255, 0.2)
      color #f8fafc

  .modal-filter
    padding 12px 20px
    border-bottom 1px solid #2b3444
    background #0f172a

    .select
      width 100%
      padding 8px 12px
      border-radius 6px
      background #1a2230
      border 1px solid #2b3444
      color #f8fafc
      font-size 14px

      &:focus
        outline none
        border-color #3b82f6

  .modal-body
    flex 1
    overflow-y auto
    padding 0

  .modal-footer
    display none

  // Show sidebar content in desktop view only
  @media (min-width: 961px)
    .mobile-modal
      display none !important

</style>

