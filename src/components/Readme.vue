<template lang="pug">
.readme-container
  .readme-content
    h1 RFG AI - Alpha Arena
    p An AI-driven trading platform that integrates live trading, conversational analysis, and intelligent market discovery.

    .intro-section
      h3 RFG.AI Multi-Asset Intelligence Architecture
      p RFG.AI operates a multi-asset intelligent planning engine that integrates specialized MCP (Modular Cognitive Process) Agents:
      ul.agents-list
        li KOL Agent – opinion leader sentiment and social influence analysis
        li K-Line Agent – technical chart and pattern recognition
        li Basic-News Agent – fundamental and macro-news analysis
        li On-Chain Agent – blockchain data monitoring and behavioral analytics
      p In the Vibe Trading module, RFG.AI leverages its proprietary large model, primarily utilizing the K-Line Agent and On-Chain Agent for concurrent real-time market parsing and causal reasoning.
      p A Transformer-based Planner continuously interprets multi-timeframe market data to determine the dominant market regime (bullish, bearish, or ranging), generating directional bias and confidence scores through causal reasoning and self-feedback optimization.
      p Each trade undergoes periodic post-execution evaluation through GRPO (Group Reward Policy Optimization), enabling continuous self-adjustment and achieving equilibrium between profitability and capital preservation.
      p All analytical outputs are consolidated through RFG.AI's multi-expert adversarial debate mechanism, producing final trading signals that include trade direction, entry confidence, position sizing, take-profit/stop-loss estimation, and decision reasoning chains.

    h2 Features
    .features-list
      .feature-item 🤖 AI Trading Models: Four autonomous trading agents with real-time performance tracking
      .feature-item 📊 Live Market Data: Real-time cryptocurrency prices, open positions, and account balance monitoring
      .feature-item 📈 Interactive Charts: Dynamic trading charts powered by the Aster API with live execution metrics
      .feature-item 💬 AI Chat Interface: Chat with AI models to explore trading logic, entry/exit points, and market insights
      .feature-item 📋 Trade Records: Transparent trade history and statistics synced with Aster Finance API
      .feature-item 🏆 Leaderboard: Real-time ranking of AI model performance and trading efficiency
      .feature-item 📱 Responsive Design: Optimized for desktop and mobile with seamless user experience

    h2 AI Trading Models
    p The platform currently showcases four AI trading models, each directly connected to live trading accounts and providing real-time performance analytics:

    .models-list
      .model-card(v-for="model in models" :key="model.name")
        .model-header
          .model-name {{ model.name }}
        .model-description {{ getModelDescription(model.name) }}

    p Each model combines reasoning-based decision logic, live execution, and continuous self-optimization — creating a transparent AI trading ecosystem that learns and evolves in real time.
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getModelInfo } from '@/config/accounts.js'

const models = ref([])

const modelDescriptions = {
  'RFG-6': 'A stable, conservative AI trading model mirroring DeepSeek\'s multi-asset setup, focused on risk-balanced execution across six leading coins (BTC, ETH, BNB, SOL, DOGE, XRP).',
  'DEEPSEEK CHAT V3.1': 'A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).',
  'QWEN3 MAX': 'An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.',
  'RFG-ALL': 'A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.'
}

const getModelDescription = (modelName) => {
  return modelDescriptions[modelName] || 'An AI trading model with live execution capabilities.'
}

onMounted(() => {
  // Load model list from configuration
  models.value = getModelInfo()
})
</script>

<style lang="stylus" scoped>
.readme-container
  height 100%
  overflow-y auto
  padding 20px

.readme-content
  max-width 600px
  margin 0 auto
  color #e5e7eb
  line-height 1.6

h1
  color #f8fafc
  font-size 24px
  font-weight 800
  margin-bottom 16px
  text-align center

h2
  color #f8fafc
  font-size 18px
  font-weight 700
  margin 24px 0 12px 0
  border-bottom 1px solid #2b3444
  padding-bottom 8px

h3
  color #f8fafc
  font-size 16px
  font-weight 700
  margin 20px 0 12px 0

.intro-section
  background #1a2230
  border 1px solid #2b3444
  border-radius 8px
  padding 20px
  margin 24px 0

  p
    margin-bottom 12px
    color #cbd5e1
    line-height 1.6

  ul.agents-list
    list-style none
    padding 0
    margin 12px 0 16px 0

    li
      padding 8px 0 8px 24px
      color #cbd5e1
      position relative
      line-height 1.5

      &::before
        content '•'
        position absolute
        left 8px
        color #3b82f6
        font-weight bold

p
  margin-bottom 16px
  color #cbd5e1

.highlight-box
  background #1a2230
  border 1px solid #3b82f6
  border-radius 8px
  padding 16px
  margin 20px 0
  text-align center

  p
    color #3b82f6
    font-weight 700
    font-size 16px
    margin 0

.features-list
  .feature-item
    padding 12px 0
    color #cbd5e1
    border-bottom 1px solid #1a2230
    line-height 1.6

    &:last-child
      border-bottom none

.models-list
  margin 24px 0

.model-card
  background #1a2230
  border 1px solid #2b3444
  border-radius 8px
  padding 16px
  margin-bottom 16px

  &:last-child
    margin-bottom 0

.model-header
  margin-bottom 12px

.model-name
  color #f8fafc
  font-weight 700
  font-size 16px
  margin-bottom 8px

.model-description
  color #cbd5e1
  line-height 1.6
  font-size 14px
</style>
