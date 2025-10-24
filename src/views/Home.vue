<template lang="pug">
.home-container
  Header

  // Top ticker bar
  .ticker-bar
    .ticker-content
      .ticker-left
        .ticker-item(v-for="crypto in cryptoPrices" :key="crypto.symbol")
          .crypto-icon
            img(:src="getCryptoIcon(crypto.symbol)" :alt="crypto.symbol")
          .crypto-info
            .sym {{ crypto.symbol }}
            .price ${{ crypto.price.toLocaleString() }}
      .ticker-right
        .performance-summary
          .highest HIGHEST: {{ highestModel.name }} $
            span.rolling-value {{ highestModel.value.toLocaleString() }}
            span.positive +{{ highestModel.change.toFixed(2) }}%
          .lowest LOWEST: {{ lowestModel.name }} $
            span.rolling-value {{ lowestModel.value.toLocaleString() }}
            span.negative {{ lowestModel.change.toFixed(2) }}%

  // Main area: left chart + right sidebar
  main.main-content
    .main-grid
      // Left side: large chart
      .left-panel
        .panel-header
          .title-container
            .back-all-btn(v-if="showBackAllButton" @click="backToAllModels") BACK TO ALL
            .title TOTAL ACCOUNT VALUE
          .periods
            button.chart-btn(:class="{ active: chartPeriod === 'all' }" @click="setChartPeriod('all')") ALL
            button.chart-btn(:class="{ active: chartPeriod === '72h' }" @click="setChartPeriod('72h')") 72H
        .chart-frame
          .y-axis-label $
          .chart-canvas
            canvas#tradingChart(ref="chartCanvas")
          .right-icons
            .icon-item(v-for="model in tradingModels" :key="model.name"
              :class="{ hovered: hoveredModel && hoveredModel.name === model.name }"
              :style="{ display: selectedModel === 'ALL MODELS' || selectedModel === model.name ? 'flex' : 'none' }"
              @click="selectedModel = model.name; handleModelChange()")
              .icon-dot(:style="{ backgroundColor: model.color }")
              .icon-content
                .model-image
                  img(v-if="!model.isBtcPrice" :src="getModelImage(model.name)" :alt="model.name")
                  .btc-icon(v-else) ₿
                .model-value(v-if="!model.isBtcPrice") ${{ (model.balance ? parseFloat(model.balance) : model.value).toLocaleString() }}
          .x-axis
            .tick(v-for="tick in xAxisTicks" :key="tick") {{ tick }}

      // Right side: sidebar tabs + list
      .right-panel
        .sidebar-tabs
          .tab(:class="{ active: activeDetailTab === 'trades' }" @click="setActiveDetailTab('trades')") COMPLETED TRADES
          //.tab(:class="{ active: activeDetailTab === 'model' }" @click="setActiveDetailTab('model')") MODELCHAT
          .tab(:class="{ active: activeDetailTab === 'positions' }" @click="setActiveDetailTab('positions')") POSITIONS
          .tab(:class="{ active: activeDetailTab === 'readme' }" @click="setActiveDetailTab('readme')") README.TXT
        .filter-section(v-if="activeDetailTab !== 'readme'")
          .filter
            span.label FILTER:
            select.select(v-model="selectedModel" @change="handleModelChange")
              option(v-for="m in modelOptions" :key="m" :value="m") {{ m }}
          .showing Showing Last 100 Trades
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
       .legend-item(v-for="legend in legends" :key="legend.name"
         :style="{ display: selectedModel === 'ALL MODELS' || selectedModel === legend.name ? 'flex' : 'none' }")
         .legend-dot(:style="{ backgroundColor: legend.color }")
         .legend-name {{ legend.name }}
         .legend-value ${{ legend.value.toLocaleString() }}

  // Connection status
  .connection-status
    .status-indicator(:class="connectionStatus")
    span.status-text {{ getStatusText() }}
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import Header from '@/components/Header.vue'
import CompletedTrades from '@/components/CompletedTrades.vue'
import ModelChatFeed from '@/components/ModelChatFeed.vue'
import Chat from '@/components/Chat.vue'
import Positions from '@/components/Positions.vue'
import Readme from '@/components/Readme.vue'
import { getAllModelsProcessedBalance } from '@/utils/newBalanceService.js'
import { getAllModelsProcessedPositions } from '@/utils/newPositionsService.js'
import { getAllModelsProcessedTrades } from '@/utils/newTradesService.js'
import { getAllModelInfo, getModelIconPath, updateAccountBalance } from '@/config/accounts.js'
import { getAllModelsChartData, processChartData } from '@/utils/chartDataService.js'
import { getAllCryptoPrices } from '@/utils/cryptoPriceService.js'
import { getBtcPriceData } from '@/utils/btcPriceService.js'

Chart.register(...registerables, zoomPlugin)

const router = useRouter()

const activeTab = ref('live')
const activeDetailTab = ref('trades')
const chartPeriod = ref('all')
const connectionStatus = ref('connecting')
const chartCanvas = ref(null)
let chartInstance = null
let resizeObserver = null
let resizeTimer = null
let lastContainerSize = { width: 0, height: 0 }
const chartData = ref(null)

// 图表交互状态
const hoveredModel = ref(null)
const selectedModelForChart = ref(null)
const showBackAllButton = ref(false)

const selectedModel = ref('ALL MODELS')
const modelOptions = computed(() => {
  const allModels = ['ALL MODELS']
  const configModels = getAllModelInfo().map(model => model.name)
  return [...allModels, ...configModels]
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

const cryptoPrices = ref([
  { symbol: 'BTC', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'ETH', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'SOL', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'BNB', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'DOGE', price: 0, change: 0, prevPrice: 0 },
  { symbol: 'XRP', price: 0, change: 0, prevPrice: 0 }
])

// Trading models data - using unified config and balance data
const tradingModels = ref([])

// Provide a default empty model data on initialization to avoid reduce errors
const defaultModel = {
  name: 'Loading...',
  value: 0,
  change: 0,
  color: '#64748b'
}

// Load account balance data using new balance service
const loadAsterBalance = async () => {
  asterBalanceLoading.value = true
  asterBalanceError.value = null

  try {
    const result = await getAllModelsProcessedBalance()

    if (result.success) {
      const balanceData = []
      result.accounts.forEach(account => {
        if (account.success && account.data) {
          const usdtBalance = account.data.find(b => b.asset === 'USDT')
          console.log('USDT balance:', usdtBalance, account.modelInfo.name)
          if (usdtBalance || account.data.length > 0) {
            balanceData.push({
              name: account.modelInfo.name,
              value: parseFloat(usdtBalance.balance),
              change: parseFloat(usdtBalance.crossUnPnl), // Use unrealized P&L as change
              color: account.modelInfo.color,
              accountAlias: usdtBalance.accountAlias,
              asset: usdtBalance.asset,
              balance: usdtBalance.balance,
              crossWalletBalance: usdtBalance.crossWalletBalance,
              crossUnPnl: usdtBalance.crossUnPnl,
              availableBalance: usdtBalance.availableBalance,
              maxWithdrawAmount: usdtBalance.maxWithdrawAmount,
              marginAvailable: usdtBalance.marginAvailable,
              updateTime: usdtBalance.updateTime,
              totalUsdtValue: usdtBalance.totalUsdtValue,
              uid: usdtBalance.uid,
              walletName: usdtBalance.walletName
            })
          }
        }
      })

      // Sort by balance
      balanceData.sort((a, b) => b.value - a.value)

      // Add BTC price data as a model
      try {
        const btcResult = await getBtcPriceData('BTCUSDT', '5m', 500) // Get more data for better time alignment
        if (btcResult.success && btcResult.data.length > 0) {
          // Get the first model data time to align BTC calculation
          const firstModelTime = balanceData.length > 0 ? new Date().getTime() : null // This will be updated when we have actual model data

          // For now, use the first BTC price as initial price
          const firstPrice = parseFloat(btcResult.data[0][4])
          const btcQuantity = 10000 / firstPrice
          const latestPrice = parseFloat(btcResult.data[btcResult.data.length - 1][4])
          const latestValue = btcQuantity * latestPrice

          balanceData.push({
            name: 'BTC Price',
            value: latestValue,
            change: 0, // BTC price doesn't have change data in this context
            color: '#f7931a',
            isBtcPrice: true
          })
        }
      } catch (error) {
        console.warn('⚠️ Failed to load BTC price for trading models:', error)
      }

      tradingModels.value = balanceData
      asterBalance.value = balanceData

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
      // Update animation with real data
      updateRealDataWithAnimation(balanceData)
    } else {
      asterBalanceError.value = result.error
      console.error('❌ Account balance loading failed:', result.error)

      // Keep empty array instead of mock data
      tradingModels.value = []
    }
  } catch (error) {
    asterBalanceError.value = error.message
    console.error('❌ Account balance loading exception:', error)

    // Keep empty array instead of mock data
    tradingModels.value = []
  } finally {
    asterBalanceLoading.value = false
  }
}

const legends = computed(() => tradingModels.value)

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
    const enabledModels = getAllModelInfo().filter(model => model.enabled && model.uid)

    if (enabledModels.length === 0) {
      console.warn('⚠️ No models with UID found for chart data')
      chartDataError.value = 'No models with UID found'
      return
    }
    // Concurrently get chart data for all models and BTC price data
    const [chartResult, btcPriceResult] = await Promise.allSettled([
      getAllModelsChartData(enabledModels, 2000),
      getBtcPriceData('BTCUSDT', '5m', 500)
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
        mode: 'index'
      },
      onHover: (event, activeElements) => {
        if (activeElements.length > 0) {
          const datasetIndex = activeElements[0].datasetIndex
          const dataset = filteredDatasets[datasetIndex]
          hoveredModel.value = dataset ? dataset.modelInfo : null
        } else {
          hoveredModel.value = null
        }
      },
      onClick: (event, activeElements) => {
        if (activeElements.length > 0) {
          const datasetIndex = activeElements[0].datasetIndex
          const dataset = filteredDatasets[datasetIndex]
          if (dataset) {
            selectedModelForChart.value = dataset.modelInfo.name
            showBackAllButton.value = true
            updateChart()
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
          callbacks: {
            title: (context) => {
              const date = new Date(context[0].label)
              return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            },
            label: (context) => {
              if (context.dataset.label === 'BTC Price') {
                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
              }
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
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
          display: false,
          maxTicksLimit: 10 // Limit x-axis ticks for better performance with large datasets
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

  chartInstance.data.datasets = filteredDatasets
  chartInstance.update('active')
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
  if (!newBalanceData) return

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
    const highestValueElement = document.querySelector('.performance-summary .highest .rolling-value')
    const lowestValueElement = document.querySelector('.performance-summary .lowest .rolling-value')

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
  updateChart()
}

// Handle model selection change
const handleModelChange = () => {
  updateChart()
}

// Scheduled data updates
let dataUpdateInterval = null

const startDataUpdates = () => {
  dataUpdateInterval = setInterval(() => {
    // Use real API data updates instead of generating mock data
    loadChartData() // Load chart data from real API
    loadAsterBalance()
  }, 30000) // Update real data every 30 seconds
}

const stopDataUpdates = () => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval)
    dataUpdateInterval = null
  }
}

// Get model image
const getModelImage = (modelName) => {
  return getModelIconPath(modelName)
}

// Get crypto icon
const getCryptoIcon = (symbol) => {
  const iconMap = {
    'BTC': new URL('../assets/images/btc.svg', import.meta.url).href,
    'ETH': new URL('../assets/images/eth.svg', import.meta.url).href,
    'SOL': new URL('../assets/images/sol.svg', import.meta.url).href,
    'BNB': new URL('../assets/images/bnb.svg', import.meta.url).href,
    'DOGE': new URL('../assets/images/doge.svg', import.meta.url).href,
    'XRP': new URL('../assets/images/xrp.svg', import.meta.url).href
  }
  return iconMap[symbol] || new URL('../assets/images/btc.svg', import.meta.url).href
}

  // Get trading history using new trades service
  const loadAsterUserTrades = async () => {
    asterTradesLoading.value = true
    asterTradesError.value = null

    try {
      const result = await getAllModelsProcessedTrades()

      if (result.success) {
        // Merge trading history data from all accounts
        let allTrades = []
        result.accounts.forEach(account => {
          if (account.success && account.data) {
            allTrades = allTrades.concat(account.data)
          }
        })

        // Sort by time (newest first)
        allTrades.sort((a, b) => b.time - a.time)

        asterUserTrades.value = allTrades
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
  const loadAsterAccountData = async () => {
  asterLoading.value = true
  asterError.value = null

  try {
    const result = await getAllModelsProcessedPositions()

    if (result.success) {
      // Merge positions data from all accounts
      const allPositions = []

      result.accounts.forEach(account => {
        if (account.success && account.data) {
          // Add model info to each position
          const positionsWithModel = account.data.map(position => ({
            ...position,
            modelInfo: account.modelInfo
          }))
          allPositions.push(...positionsWithModel)
        }
      })

      // Since we're only using positions data, we can set asterAccountData to null or empty
      asterAccountData.value = null
      asterPositions.value = allPositions
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
      // Update cryptoPrices data and detect price changes
      cryptoPrices.value.forEach((crypto, index) => {
        const priceData = result.prices.find(p => p.name === crypto.symbol)
        if (priceData) {
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
  // Get data immediately once
  fetchCryptoPrices()

  // Update price every 5 seconds
  priceUpdateInterval = setInterval(fetchCryptoPrices, 5000)
}

const stopPriceUpdates = () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
    priceUpdateInterval = null
  }
}

const setActiveTab = (tab) => { activeTab.value = tab }
const setActiveDetailTab = (tab) => { activeDetailTab.value = tab }
const setChartPeriod = (period) => { chartPeriod.value = period }
const goToLeaderboard = () => { router.push('/leaderboard') }
const joinWaitlist = () => { alert('Join waitlist feature to be implemented') }
const aboutRFGAI = () => { alert('About RFG AI feature to be implemented') }

const getActiveDetailComponent = () => {
  const components = { trades: CompletedTrades, model: ModelChatFeed, chat: ModelChatFeed, positions: Positions, readme: Readme }
  return components[activeDetailTab.value]
}

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connecting': return 'STATUS: CONNECTING TO SERVER'
    case 'connected': return 'STATUS: CONNECTED'
    case 'disconnected': return 'STATUS: DISCONNECTED'
    default: return 'STATUS: UNKNOWN'
  }
}

onMounted(() => {
  setTimeout(() => { connectionStatus.value = 'connected' }, 1500)
  // Load chart data first, then build chart
  loadChartData()
  // Start data updates
  startDataUpdates()
  // Start price updates
  startPriceUpdates()
  // Load Aster Finance account info
  loadAsterAccountData()
  // Load Aster Finance trading history
  loadAsterUserTrades()
  // Load Aster Finance account balance
  loadAsterBalance()
  // Ensure initial state is correct
  updateChart()
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
  stopDataUpdates()
  stopPriceUpdates()
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
  align-items center
  gap 12px
  color #e5e7eb
  white-space nowrap
  font-weight 600
  font-size 12px
  padding 8px 12px
  border-radius 6px
  background rgba(255, 255, 255, 0.05)
  border 1px solid rgba(255, 255, 255, 0.1)
  transition all 0.2s ease

  &:hover
    background rgba(255, 255, 255, 0.08)
    border-color rgba(255, 255, 255, 0.2)

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
  border 1px solid #2b3444
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
  padding 8px 48px 6px 22px  // 右边从8px改为48px，增加40px间距
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
  right 8px
  top 50%
  transform translateY(-50%)
  display flex
  flex-direction column
  gap 8px
  z-index 10

.icon-item
  display flex
  align-items center
  gap 8px
  padding 6px 8px
  background rgba(15, 23, 42, 0.9)
  border 1px solid #2b3444
  border-radius 6px
  cursor pointer
  transition all 0.2s ease
  min-width 140px

  &:hover, &.hovered
    border-color #3b82f6
    background rgba(15, 23, 42, 0.95)
    transform scale(1.05)
    box-shadow 0 4px 12px rgba(59, 130, 246, 0.3)

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
  width 20px
  height 20px
  display flex
  align-items center
  justify-content center

  img
    width 100%
    height 100%
    object-fit contain
    border-radius 2px

  .btc-icon
    width 100%
    height 100%
    display flex
    align-items center
    justify-content center
    background-color #f7931a
    border-radius 2px
    color #ffffff
    font-size 12px
    font-weight bold

.model-value
  color #f8fafc
  font-size 12px
  font-weight 800
  font-family 'JetBrains Mono', monospace
  white-space nowrap


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

  .rolling-value
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
  grid-template-columns repeat(auto-fit, minmax(180px, 1fr))
  gap 10px

.legend-item
  display flex
  align-items center
  gap 8px
  background #0f172a
  border 1px solid #2b3444
  padding 8px 10px
  border-radius 4px

.legend-dot
  width 10px
  height 10px
  border-radius 50%

.legend-name
  color #e5e7eb
  font-weight 800
  font-size 12px

.legend-value
  margin-left auto
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

</style>

