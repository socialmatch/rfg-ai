/**
 * Data Cache Utility
 * Stores shared data between pages (Home, Leaderboard, ModelDetail) with TTL support
 */

const cacheStore = {
  // API-level cache: "apiName:modelUid" -> data
  apiCache: {},
  // Global cache for aggregated data (legacy)
  balance: {
    data: null,
    timestamp: null
  },
  trades: {
    data: null,
    timestamp: null
  },
  positions: {
    data: null,
    timestamp: null
  }
}

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  balance: 15000,  // 15 seconds
  trades: 60000,   // 60 seconds (trades don't change as frequently)
  positions: 20000  // 20 seconds
}

/**
 * Get cached data if still valid
 * @param {string} key - Cache key ('balance', 'trades', 'positions')
 * @returns {Object|null} Cached data or null if expired/missing
 */
export const getCachedData = (key) => {
  const cache = cacheStore[key]
  
  if (!cache || !cache.data || !cache.timestamp) {
    console.log(`📦 Cache miss for ${key} (no data)`)
    return null
  }

  const age = Date.now() - cache.timestamp
  const ttl = CACHE_TTL[key]

  if (age > ttl) {
    console.log(`⏰ Cache expired for ${key} (age: ${age}ms, ttl: ${ttl}ms)`)
    return null
  }

  console.log(`✅ Cache hit for ${key} (age: ${age}ms)`)
  return cache.data
}

/**
 * Store data in cache
 * @param {string} key - Cache key ('balance', 'trades', 'positions')
 * @param {Object} data - Data to cache
 */
export const setCachedData = (key, data) => {
  cacheStore[key] = {
    data: data,
    timestamp: Date.now()
  }
  console.log(`💾 Cached ${key} data`, { timestamp: new Date(cacheStore[key].timestamp).toISOString() })
}

/**
 * Clear specific cache
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  if (key) {
    cacheStore[key] = { data: null, timestamp: null }
    console.log(`🗑️ Cleared cache for ${key}`)
  } else {
    // Clear all caches
    Object.keys(cacheStore).forEach(k => {
      cacheStore[k] = { data: null, timestamp: null }
    })
    console.log(`🗑️ Cleared all caches`)
  }
}

/**
 * Get cache age in milliseconds
 * @param {string} key - Cache key
 * @returns {number|null} Age in milliseconds or null if not cached
 */
export const getCacheAge = (key) => {
  const cache = cacheStore[key]
  if (!cache || !cache.timestamp) return null
  return Date.now() - cache.timestamp
}

/**
 * Check if cache is valid
 * @param {string} key - Cache key
 * @returns {boolean} True if cache exists and is valid
 */
export const isCacheValid = (key) => {
  const cache = cacheStore[key]
  if (!cache || !cache.data || !cache.timestamp) return false
  
  const age = Date.now() - cache.timestamp
  return age <= CACHE_TTL[key]
}

/**
 * Get cached API data for a specific model
 * @param {string} apiName - API name (e.g., 'aster/balance', 'aster/trades')
 * @param {string} modelUid - Model UID
 * @returns {Object|null} Cached data or null
 */
export const getCachedApiData = (apiName, modelUid) => {
  const cacheKey = `${apiName}:${modelUid}`
  const cached = cacheStore.apiCache[cacheKey]
  
  if (!cached) {
    console.log(`📦 Cache miss for ${cacheKey}`)
    return null
  }
  
  const age = Date.now() - cached.timestamp
  console.log(`✅ Cache hit for ${cacheKey} (age: ${age}ms)`)
  return cached.data
}

/**
 * Store API data in cache for a specific model
 * @param {string} apiName - API name (e.g., 'aster/balance', 'aster/trades')
 * @param {string} modelUid - Model UID
 * @param {Object} data - Data to cache
 */
export const setCachedApiData = (apiName, modelUid, data) => {
  const cacheKey = `${apiName}:${modelUid}`
  cacheStore.apiCache[cacheKey] = {
    data: data,
    timestamp: Date.now()
  }
  console.log(`💾 Cached ${cacheKey}`)
}

/**
 * Check if all models have cached data for a specific API
 * @param {string} apiName - API name
 * @param {Array} models - Array of model objects with uid property
 * @returns {boolean} True if all models have cached data
 */
export const hasAllModelsCached = (apiName, models) => {
  if (!models || models.length === 0) return false
  
  for (const model of models) {
    if (!model.uid) return false
    const cached = getCachedApiData(apiName, model.uid)
    if (!cached) return false
  }
  
  return true
}

/**
 * Get all cached data for an API across all models
 * @param {string} apiName - API name
 * @param {Array} models - Array of model objects with uid property
 * @returns {Object|null} Aggregated cached data or null
 */
export const getAllModelsCachedData = (apiName, models) => {
  if (!hasAllModelsCached(apiName, models)) {
    return null
  }
  
  const results = []
  for (const model of models) {
    const cached = getCachedApiData(apiName, model.uid)
    if (cached) {
      results.push({
        modelInfo: model,
        data: cached,
        success: true
      })
    }
  }
  
  if (results.length > 0) {
    console.log(`✅ Retrieved cached data for ${apiName} for ${results.length} models`)
    return {
      success: true,
      accounts: results
    }
  }
  
  return null
}

export default {
  getCachedData,
  setCachedData,
  clearCache,
  getCacheAge,
  isCacheValid,
  getCachedApiData,
  setCachedApiData,
  hasAllModelsCached,
  getAllModelsCachedData
}
