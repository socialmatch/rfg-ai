/**
 * Balance and Positions WebSocket Service
 * Manages WebSocket connections for real-time balance and positions updates
 */

import { getEnabledAccounts, getAccountByUid, ACCOUNT_CONFIGS } from '../config/accounts.js'
import { setCachedApiData } from './dataCache.js'
import { processBalanceData } from './newBalanceService.js'
import { processPositionsData } from './newPositionsService.js'

// WebSocket base URL
const WS_BASE_URL = 'wss://testapi1.rfgmeme.ai/account/info/'

// Store active WebSocket connections
const wsConnections = new Map()

// Store callbacks for data updates
const updateCallbacks = new Set()

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30000

// Track if connections have been initialized
let connectionsInitialized = false

// Heartbeat timers for each connection
const heartbeatTimers = new Map()

/**
 * Register a callback to be called when balance/positions data is updated
 * @param {Function} callback - Callback function that receives (uid, balanceData, positionsData)
 */
export const onDataUpdate = (callback) => {
  updateCallbacks.add(callback)
  return () => {
    updateCallbacks.delete(callback)
  }
}

/**
 * Notify all registered callbacks about data update
 * @param {string} uid - Account UID
 * @param {Object} balanceData - Balance data
 * @param {Array} positionsData - Positions data
 */
const notifyCallbacks = (uid, balanceData, positionsData) => {
  updateCallbacks.forEach(callback => {
    try {
      callback(uid, balanceData, positionsData)
    } catch (error) {
      console.error(`❌ Error in update callback for ${uid}:`, error)
    }
  })
}

/**
 * Find account config by ws_uid
 * @param {string} wsUid - WebSocket UID
 * @returns {Object|null} Account config or null
 */
const getAccountByWsUid = (wsUid) => {
  return ACCOUNT_CONFIGS.find(account => account.ws_uid === wsUid && account.enabled)
}

/**
 * Process WebSocket message and update cache
 * @param {string} connectionUid - Connection UID (account uid used for connection)
 * @param {Object} messageData - Parsed WebSocket message data
 */
const processWebSocketMessage = (connectionUid, messageData) => {
  if (!messageData.success || !messageData.data) {
    console.warn(`⚠️ Invalid WebSocket message for ${connectionUid}:`, messageData)
    return
  }

  const { balance, positions, timestamp } = messageData.data

  // Find account by ws_uid from balance data or connection
  const wsUid = balance?.uid || messageData.data.uid
  if (!wsUid) {
    console.warn(`⚠️ No ws_uid found in WebSocket message for ${connectionUid}`)
    return
  }

  const accountConfig = getAccountByWsUid(wsUid)
  if (!accountConfig) {
    console.warn(`⚠️ Account not found for ws_uid: ${wsUid}`)
    return
  }

  const accountUid = accountConfig.uid

  // Update balance cache using account uid
  if (balance) {
    const balanceCacheKey = 'aster/balance'
    setCachedApiData(balanceCacheKey, accountUid, balance)
    console.log(`✅ Updated balance cache for ${accountUid} (ws_uid: ${wsUid})`)
  }

  // Update positions cache using account uid
  if (positions) {
    const positionsCacheKey = 'aster/positions'
    const positionsData = {
      data: {
        uid: accountUid,
        wallet_name: balance?.wallet_name || accountConfig.modelName,
        positions: positions,
        timestamp: timestamp
      }
    }
    setCachedApiData(positionsCacheKey, accountUid, positionsData.data)
    console.log(`✅ Updated positions cache for ${accountUid} (ws_uid: ${wsUid})`)
  }

  // Process and notify callbacks using account uid
  const processedBalance = balance ? processBalanceData({ data: balance }) : null
  const processedPositions = positions ? processPositionsData({ 
    data: { 
      positions, 
      uid: accountUid, 
      wallet_name: balance?.wallet_name || accountConfig.modelName 
    } 
  }) : null

  notifyCallbacks(accountUid, processedBalance, processedPositions)
}

/**
 * Create WebSocket connection for a single account
 * @param {Object} accountConfig - Account configuration object
 * @returns {WebSocket|null} WebSocket connection or null if failed
 */
const createWebSocketConnection = (accountConfig) => {
  const { uid, wallet_uid, ws_uid } = accountConfig

  if (!wallet_uid || !ws_uid) {
    console.warn(`⚠️ Missing wallet_uid or ws_uid for ${uid}, skipping WebSocket connection`)
    return null
  }

  const wsUrl = `${WS_BASE_URL}?uid=${ws_uid}&wallet_id=${wallet_uid}`
  console.log(`🔌 Creating WebSocket connection for ${uid}: ${wsUrl}`)

  try {
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log(`✅ WebSocket connected for ${uid}`)
      wsConnections.set(uid, {
        ws,
        accountConfig,
        connected: true,
        reconnectAttempts: 0,
        lastPongTime: Date.now()
      })
      
      // Start heartbeat for this connection
      startHeartbeat(uid)
    }

    ws.onmessage = (event) => {
      try {
        // Check if it's a pong response (heartbeat)
        if (event.data === 'pong' || event.data === '"pong"') {
          const connection = wsConnections.get(uid)
          if (connection) {
            connection.lastPongTime = Date.now()
          }
          return
        }
        
        const data = JSON.parse(event.data)
        console.log(`📨 Received WebSocket message for ${uid}`)
        processWebSocketMessage(uid, data)
      } catch (error) {
        console.error(`❌ Error parsing WebSocket message for ${uid}:`, error)
      }
    }

    ws.onerror = (error) => {
      console.error(`❌ WebSocket error for ${uid}:`, error)
    }

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed for ${uid}`, event.code, event.reason)
      const connection = wsConnections.get(uid)
      if (connection) {
        connection.connected = false
        // Stop heartbeat
        stopHeartbeat(uid)
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000) {
          attemptReconnect(uid, accountConfig)
        }
      }
    }

    return ws
  } catch (error) {
    console.error(`❌ Failed to create WebSocket for ${uid}:`, error)
    return null
  }
}

/**
 * Attempt to reconnect a WebSocket connection
 * @param {string} uid - Account UID
 * @param {Object} accountConfig - Account configuration
 */
const attemptReconnect = (uid, accountConfig) => {
  const connection = wsConnections.get(uid)
  if (!connection) return

  const maxReconnectAttempts = 5
  const reconnectDelay = 3000 // 3 seconds

  if (connection.reconnectAttempts >= maxReconnectAttempts) {
    console.error(`❌ Max reconnect attempts reached for ${uid}`)
    wsConnections.delete(uid)
    return
  }

  connection.reconnectAttempts++
  console.log(`🔄 Attempting to reconnect ${uid} (attempt ${connection.reconnectAttempts}/${maxReconnectAttempts})...`)

  setTimeout(() => {
    if (wsConnections.has(uid)) {
      // Close old connection if exists
      const existingConnection = wsConnections.get(uid)
      if (existingConnection && existingConnection.ws) {
        existingConnection.ws.close()
        stopHeartbeat(uid)
      }
      
      // Create new connection
      const newWs = createWebSocketConnection(accountConfig)
      if (newWs) {
        // Connection will be set in onopen handler
        // Heartbeat will be started in onopen handler
      }
    }
  }, reconnectDelay)
}

/**
 * Start heartbeat for a WebSocket connection
 * @param {string} uid - Account UID
 */
const startHeartbeat = (uid) => {
  // Clear existing heartbeat if any
  stopHeartbeat(uid)
  
  const timer = setInterval(() => {
    const connection = wsConnections.get(uid)
    if (!connection || !connection.connected || !connection.ws) {
      stopHeartbeat(uid)
      return
    }

    // Check if connection is still alive (received pong within 2 intervals)
    const timeSinceLastPong = Date.now() - (connection.lastPongTime || Date.now())
    if (timeSinceLastPong > HEARTBEAT_INTERVAL * 2) {
      console.warn(`⚠️ No pong received for ${uid} in ${timeSinceLastPong}ms, reconnecting...`)
      stopHeartbeat(uid)
      connection.ws.close()
      attemptReconnect(uid, connection.accountConfig)
      return
    }

    // Send ping
    try {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send('ping')
      }
    } catch (error) {
      console.error(`❌ Error sending ping for ${uid}:`, error)
      stopHeartbeat(uid)
    }
  }, HEARTBEAT_INTERVAL)

  heartbeatTimers.set(uid, timer)
  console.log(`💓 Started heartbeat for ${uid}`)
}

/**
 * Stop heartbeat for a WebSocket connection
 * @param {string} uid - Account UID
 */
const stopHeartbeat = (uid) => {
  const timer = heartbeatTimers.get(uid)
  if (timer) {
    clearInterval(timer)
    heartbeatTimers.delete(uid)
    console.log(`💓 Stopped heartbeat for ${uid}`)
  }
}

/**
 * Check if WebSocket connections have been initialized
 * @returns {boolean} True if connections are initialized
 */
export const areConnectionsInitialized = () => {
  return connectionsInitialized && wsConnections.size > 0
}

/**
 * Initialize WebSocket connections for all enabled accounts
 */
export const initializeWebSocketConnections = () => {
  // Avoid duplicate initialization
  if (connectionsInitialized && wsConnections.size > 0) {
    console.log('✅ WebSocket connections already initialized')
    return
  }

  console.log('🚀 Initializing WebSocket connections for all enabled accounts...')
  
  const enabledAccounts = getEnabledAccounts()
  console.log(`📋 Found ${enabledAccounts.length} enabled accounts`)

  enabledAccounts.forEach(account => {
    // Skip if connection already exists
    if (wsConnections.has(account.uid)) {
      const existingConnection = wsConnections.get(account.uid)
      if (existingConnection.connected) {
        console.log(`✅ WebSocket connection for ${account.uid} already exists and is connected`)
        return
      }
    }

    if (account.wallet_uid && account.ws_uid) {
      createWebSocketConnection(account)
    } else {
      console.warn(`⚠️ Skipping ${account.uid}: missing wallet_uid or ws_uid`)
    }
  })

  connectionsInitialized = true
}

/**
 * Close WebSocket connection for a specific account
 * @param {string} uid - Account UID
 */
export const closeWebSocketConnection = (uid) => {
  const connection = wsConnections.get(uid)
  if (connection && connection.ws) {
    console.log(`🔌 Closing WebSocket connection for ${uid}`)
    connection.ws.close(1000, 'Manual close')
    wsConnections.delete(uid)
  }
}

/**
 * Close all WebSocket connections
 */
export const closeAllWebSocketConnections = () => {
  console.log('🔌 Closing all WebSocket connections...')
  
  // Stop all heartbeats
  heartbeatTimers.forEach((timer, uid) => {
    clearInterval(timer)
  })
  heartbeatTimers.clear()
  
  wsConnections.forEach((connection, uid) => {
    if (connection.ws) {
      connection.ws.close(1000, 'Manual close')
    }
  })
  wsConnections.clear()
  
  connectionsInitialized = false
}

/**
 * Get connection status for all accounts
 * @returns {Object} Connection status map
 */
export const getConnectionStatus = () => {
  const status = {}
  wsConnections.forEach((connection, uid) => {
    status[uid] = {
      connected: connection.connected,
      reconnectAttempts: connection.reconnectAttempts
    }
  })
  return status
}

/**
 * Reconnect a specific account's WebSocket
 * @param {string} uid - Account UID
 */
export const reconnectWebSocket = (uid) => {
  const accountConfig = getAccountByUid(uid)
  if (!accountConfig) {
    console.error(`❌ Account not found for UID: ${uid}`)
    return
  }

  closeWebSocketConnection(uid)
  setTimeout(() => {
    createWebSocketConnection(accountConfig)
  }, 1000)
}

export default {
  initializeWebSocketConnections,
  closeWebSocketConnection,
  closeAllWebSocketConnections,
  getConnectionStatus,
  reconnectWebSocket,
  onDataUpdate,
  areConnectionsInitialized
}

