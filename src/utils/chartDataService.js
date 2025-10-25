/**
 * Chart Data Service
 * Handles chart data API requests for line charts
 */

import {processBtcPriceData} from './btcPriceService.js'

const CHART_API_BASE = 'https://testapi1.rfgmeme.ai'

/**
 * Get chart data for a single model
 * @param {string} uid - Model UID
 * @param {number} size - Number of records to fetch
 * @returns {Promise<Object>} Chart data response
 */
export const getModelChartData = async (uid, size = 10) => {
  try {
    const response = await fetch(`${CHART_API_BASE}/app/v1/trader_balance_record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: uid,
        size: size
      })
    })

    if (!response.ok) {
      throw new Error(`Chart API request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        data: result.data.records || [],
        uid: uid
      }
    } else {
      return {
        success: false,
        error: result.message || 'Unknown error',
        data: [],
        uid: uid
      }
    }
  } catch (error) {
    console.error(`❌ Failed to get chart data for ${uid}:`, error)
    return {
      success: false,
      error: error.message,
      data: [],
      uid: uid
    }
  }
}

/**
 * Get chart data for all models
 * @param {Array} models - Array of model objects with uid
 * @param {number} size - Number of records to fetch per model
 * @returns {Promise<Object>} All models chart data
 */
export const getAllModelsChartData = async (models, size = 10) => {
  try {

    // Filter models that have uid
    const modelsWithUid = models.filter(model => model.uid)

    if (modelsWithUid.length === 0) {
      console.warn('⚠️ No models with UID found for chart data')
      return {
        success: false,
        error: 'No models with UID found',
        models: [],
        totalModels: 0,
        successfulCount: 0,
        failedCount: 0
      }
    }


    // Fetch chart data for all models sequentially (one after another)
    console.log(`🔄 Fetching chart data for ${modelsWithUid.length} models sequentially...`)
    const successfulResults = []
    const failedResults = []

    for (const model of modelsWithUid) {
      try {
        const result = await getModelChartData(model.uid, size)
        console.log(`✅ ${model.name} (${model.uid}): completed`)
        
        if (result.success) {
          successfulResults.push({
            modelInfo: model,
            data: result.data.reverse(),
            uid: result.uid
          })
        } else {
          failedResults.push({
            modelInfo: model,
            error: result.error,
            uid: model.uid
          })
        }
      } catch (error) {
        console.error(`❌ ${model.name} (${model.uid}): failed -`, error.message)
        failedResults.push({
          modelInfo: model,
          error: error.message,
          uid: model.uid
        })
      }
    }


    return {
      success: true,
      models: successfulResults,
      failedModels: failedResults,
      totalModels: modelsWithUid.length,
      successfulCount: successfulResults.length,
      failedCount: failedResults.length
    }

  } catch (error) {
    console.error('❌ Failed to load chart data for all models:', error)
    return {
      success: false,
      error: error.message,
      models: [],
      totalModels: 0,
      successfulCount: 0,
      failedCount: 0
    }
  }
}

/**
 * Process chart data for Chart.js
 * @param {Array} modelsData - Array of model data from API
 * @param {Array} btcPriceData - BTC price data from API
 * @returns {Object} Processed chart data for Chart.js
 */
export const processChartData = async (modelsData, btcPriceData = null) => {
  try {
    const labels = []
    const datasets = []

    // Collect all unique timestamps from all models
    const allTimestamps = new Set()
    modelsData.forEach(modelData => {
      const records = modelData.data || []
      records.forEach(record => {
        if (record.wrt_time) {
          allTimestamps.add(record.wrt_time)
        }
      })
    })

    // Sort timestamps chronologically
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    )

    // Use sorted timestamps as labels
    if (sortedTimestamps.length > 0) {
      labels.push(...sortedTimestamps)
      console.log('📊 Generated', labels.length, 'unique time labels from all models')
    } else {
      // Fallback if no timestamps
      const maxDataPoints = Math.max(...modelsData.map(model => (model.data || []).length))
      for (let i = 0; i < maxDataPoints; i++) {
        const date = new Date()
        date.setMinutes(date.getMinutes() - (maxDataPoints - 1 - i) * 5)
        labels.push(date.toISOString())
      }
    }

    // Process each model's data with time-based alignment
    modelsData.forEach((modelData) => {
      const records = modelData.data || []

      if (records.length === 0) {
        console.warn(`⚠️ No chart data for model ${modelData.uid}`)
        return
      }

      // Create a map of timestamp -> value for this model
      const timestampMap = {}
      records.forEach(record => {
        if (record.wrt_time) {
          const value = parseFloat(record.balance_json.total_asset)
          timestampMap[record.wrt_time] = isNaN(value) ? null : value
        }
      })

      // Align data with all timestamps
      // If a model doesn't have data for a timestamp, use null
      const alignedData = labels.map(label => {
        return timestampMap[label] !== undefined ? timestampMap[label] : null
      })

      console.log(`📊 Model ${modelData.uid}: ${records.length} records aligned to ${labels.length} timestamps, ${alignedData.filter(v => v === null).length} null values`)

      datasets.push({
        label: modelData.modelInfo.name || modelData.uid,
        data: alignedData,
        borderColor: modelData.modelInfo.color || '#3B82F6',
        backgroundColor: (modelData.modelInfo.color || '#3B82F6') + '20',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
        spanGaps: false,
        modelInfo: {
          name: modelData.modelInfo.name || modelData.uid,
          uid: modelData.uid,
          currentValue: alignedData[alignedData.length - 1] || 0,
          color: modelData.modelInfo.color || '#3B82F6'
        }
      })
    })

    // Add BTC price data if available
    if (btcPriceData && btcPriceData.success && btcPriceData.data.length > 0) {
      const processedBtcData = processBtcPriceData(btcPriceData.data, labels)

      // Align BTC price data with model data time labels
      const btcAlignedData = labels.map(label => {
        // Find the closest BTC price data point for each time label
        const targetTime = new Date(label).getTime()
        let closestPrice = null
        let minDiff = Infinity

        processedBtcData.labels.forEach((btcLabel, index) => {
          const btcTime = new Date(btcLabel).getTime()
          const diff = Math.abs(btcTime - targetTime)
          if (diff < minDiff) {
            minDiff = diff
            closestPrice = processedBtcData.data[index]
          }
        })

        // BTC price is already processed as portfolio value in processBtcPriceData
        return closestPrice
      })

      datasets.push({
        label: 'BTC',
        data: btcAlignedData,
        borderColor: '#f7931a', // BTC orange color
        backgroundColor: '#f7931a20',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
        yAxisID: 'y', // Use same Y axis as other models
        spanGaps: false,
        modelInfo: {
          name: 'BTC',
          uid: 'btc_price',
          currentValue: btcAlignedData[btcAlignedData.length - 1] || 0,
          color: '#f7931a'
        }
      })
    }

    // Calculate y-axis range based on actual data with better granularity
    const allValues = datasets.flatMap(dataset => dataset.data).filter(val => val !== null)
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)

    // Calculate the range of the data
    const dataRange = maxValue - minValue

    // Set minimum scale based on data minimum
    let yAxisMin
    if (minValue > 9000) {
      yAxisMin = 8000 // Set minimum to 8000 if data minimum is around 9000
    } else if (minValue > 8000) {
      yAxisMin = 7000 // Set minimum to 7000 if data minimum is around 8000
    } else if (minValue > 7000) {
      yAxisMin = 6000 // Set minimum to 6000 if data minimum is around 7000
    } else {
      yAxisMin = Math.max(0, minValue - 1000) // Default margin of 1000
    }

    // Set maximum scale with appropriate margin
    const margin = Math.max(dataRange * 0.2, 500) // 20% margin or minimum 500
    let yAxisMax = maxValue + margin

    // Round to nearest 500 for cleaner tick marks
    yAxisMin = Math.floor(yAxisMin / 500) * 500
    yAxisMax = Math.ceil(yAxisMax / 500) * 500

    return {
      labels,
      datasets,
      yAxisRange: {
        min: yAxisMin,
        max: yAxisMax
      }
    }

  } catch (error) {
    console.error('❌ Failed to process chart data:', error)
    return {
      labels: [],
      datasets: [],
      yAxisRange: {
        min: 0,
        max: 100
      }
    }
  }
}

export default {
  getModelChartData,
  getAllModelsChartData,
  processChartData
}
