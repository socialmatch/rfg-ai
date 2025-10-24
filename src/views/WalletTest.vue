<template>
  <div class="wallet-test">
    <h2>多链钱包服务测试</h2>
    
    <div class="test-section">
      <h3>配置信息</h3>
      <div class="config-info">
        <p><strong>当前配置:</strong></p>
        <pre>{{ JSON.stringify(config, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h3>钱包查询测试</h3>
      <div class="input-group">
        <input 
          v-model="walletAddress" 
          placeholder="输入钱包地址"
          class="wallet-input"
        />
        <button @click="testWalletQuery" :disabled="loading" class="test-button">
          {{ loading ? '查询中...' : '查询钱包' }}
        </button>
      </div>
      
      <div v-if="result" class="result-section">
        <h4>查询结果</h4>
        <div class="result-info">
          <p><strong>状态:</strong> {{ result.success ? '成功' : '失败' }}</p>
          <p><strong>钱包地址:</strong> {{ result.walletAddress }}</p>
          <p><strong>总价值:</strong> ${{ result.totalValue.usd }}</p>
          <p><strong>支持网络:</strong> {{ Object.keys(result.networks).join(', ') }}</p>
        </div>
        
        <div class="networks-grid">
          <div 
            v-for="(data, network) in result.networks" 
            :key="network"
            class="network-card"
            :class="{ 'error': !data.success }"
          >
            <h5>{{ network.toUpperCase() }}</h5>
            <div v-if="data.success">
              <p>代币数量: {{ data.totalTokens }}</p>
              <p>网络价值: ${{ data.totalValue.usd }}</p>
              <div class="tokens-list">
                <div 
                  v-for="token in data.tokens.slice(0, 3)" 
                  :key="token.symbol"
                  class="token-item"
                >
                  {{ token.symbol }}: {{ token.balanceFormatted }} (${token.balanceUsd})
                </div>
              </div>
            </div>
            <div v-else class="error-message">
              获取失败: {{ data.error }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h3>价格查询测试</h3>
      <button @click="testPriceQuery" :disabled="priceLoading" class="test-button">
        {{ priceLoading ? '查询中...' : '查询代币价格' }}
      </button>
      
      <div v-if="priceResult" class="result-section">
        <h4>价格查询结果</h4>
        <div class="price-grid">
          <div 
            v-for="price in priceResult" 
            :key="price.symbol"
            class="price-card"
          >
            <h5>{{ price.symbol }}</h5>
            <p>价格: ${{ price.price }}</p>
            <p :class="price.change24h >= 0 ? 'positive' : 'negative'">
              24h变化: {{ price.change24h }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  getWalletTokens, 
  getBatchTokenPrices, 
  configureWalletService,
  getWalletServiceConfig 
} from '@/utils/multiChainWalletService.js'

const walletAddress = ref('0xe25fc8a4711c5e1f52f7d144f907b9cffc054f4d')
const loading = ref(false)
const priceLoading = ref(false)
const result = ref(null)
const priceResult = ref(null)
const config = ref({})

const loadConfig = () => {
  config.value = getWalletServiceConfig()
}

const testWalletQuery = async () => {
  loading.value = true
  result.value = null
  
  try {
    const queryResult = await getWalletTokens(walletAddress.value)
    result.value = queryResult
    
    if (queryResult.success) {
      console.log('✅ 钱包查询成功:', queryResult)
    } else {
      console.error('❌ 钱包查询失败:', queryResult.error)
    }
  } catch (error) {
    console.error('❌ 钱包查询异常:', error)
    result.value = {
      success: false,
      error: error.message
    }
  } finally {
    loading.value = false
  }
}

const testPriceQuery = async () => {
  priceLoading.value = true
  priceResult.value = null
  
  try {
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP']
    const prices = await getBatchTokenPrices(symbols)
    priceResult.value = prices
    
    console.log('✅ 价格查询成功:', prices)
  } catch (error) {
    console.error('❌ 价格查询失败:', error)
  } finally {
    priceLoading.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.wallet-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.config-info {
  background: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  margin-top: 10px;
}

.wallet-input {
  width: 400px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-right: 10px;
}

.test-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.test-button:hover:not(:disabled) {
  background: #2563eb;
}

.test-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.result-section {
  margin-top: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 6px;
}

.result-info {
  margin-bottom: 15px;
}

.result-info p {
  margin: 5px 0;
}

.networks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.network-card {
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.network-card.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
}

.tokens-list {
  margin-top: 10px;
}

.token-item {
  padding: 4px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.price-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.price-card {
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  text-align: center;
}

.price-card h5 {
  margin: 0 0 10px 0;
  color: #374151;
}

.price-card p {
  margin: 5px 0;
  font-size: 14px;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

pre {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
