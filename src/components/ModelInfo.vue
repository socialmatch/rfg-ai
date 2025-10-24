<template lang="pug">
.model-info
  .model-overview
    .model-header
      .model-name GPT-4 Trading Model v2.1
      .model-status
        .status-indicator.connected
        span Active
    .model-metrics
      .metric
        .metric-label Performance
        .metric-value.positive +15.8%
      .metric
        .metric-label Win Rate
        .metric-value.success 78.7%
      .metric
        .metric-label Total Trades
        .metric-value 247
      .metric
        .metric-label Sharpe Ratio
        .metric-value 1.42

  .model-details
    .detail-section
      h4 Model Configuration
      .config-grid
        .config-item
          .config-label Strategy Type
          .config-value Trend Following
        .config-item
          .config-label Risk Management
          .config-value Conservative
        .config-item
          .config-label Timeframe
          .config-value 5m, 15m, 1h
        .config-item
          .config-label Max Position Size
          .config-value 10% of Portfolio

    .detail-section
      h4 Performance History
      .performance-chart
        .chart-placeholder
          .chart-title 30-Day Performance
          .performance-bars
            .bar(v-for="day in performanceData" :key="day.date" :style="{ height: Math.abs(day.performance) * 2 + '%' }" :class="day.performance >= 0 ? 'positive' : 'negative'")
          .chart-labels
            span(v-for="day in performanceData.slice(-7)" :key="day.date") {{ day.date }}

    .detail-section
      h4 Trading Parameters
      .parameters-table
        .param-row
          .param-name Stop Loss
          .param-value 2.5%
        .param-row
          .param-name Take Profit
          .param-value 5.0%
        .param-row
          .param-name RSI Threshold
          .param-value 30/70
        .param-row
          .param-name MACD Signal
          .param-value Bullish/Bearish
        .param-row
          .param-name Volume Filter
          .param-value 1.5x Average
</template>

<script setup>
import { ref } from 'vue'

const performanceData = ref([
  { date: '01/01', performance: 2.1 },
  { date: '01/02', performance: -1.2 },
  { date: '01/03', performance: 3.4 },
  { date: '01/04', performance: 1.8 },
  { date: '01/05', performance: -0.5 },
  { date: '01/06', performance: 2.7 },
  { date: '01/07', performance: 1.2 },
  { date: '01/08', performance: -1.8 },
  { date: '01/09', performance: 2.9 },
  { date: '01/10', performance: 0.8 },
  { date: '01/11', performance: 3.1 },
  { date: '01/12', performance: -0.9 },
  { date: '01/13', performance: 1.5 },
  { date: '01/14', performance: 2.3 },
  { date: '01/15', performance: 1.7 }
])
</script>

<style lang="stylus" scoped>
.model-info
  .model-overview
    background #334155
    border-radius 6px
    padding 24px
    margin-bottom 24px

.model-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 24px

.model-name
  color #f8fafc
  font-size 20px
  font-weight 600

.model-status
  display flex
  align-items center
  gap 8px

  span
    color #cbd5e1
    font-weight 600

.model-metrics
  display grid
  grid-template-columns repeat(auto-fit, minmax(150px, 1fr))
  gap 24px

.metric
  text-align center

.metric-label
  color #cbd5e1
  font-size 14px
  margin-bottom 4px

.metric-value
  color #f8fafc
  font-size 18px
  font-weight 600

  &.positive
    color #10b981

  &.success
    color #10b981

.detail-section
  background #334155
  border-radius 6px
  padding 24px
  margin-bottom 24px

  h4
    color #f8fafc
    font-size 18px
    margin 0 0 24px 0
    border-bottom 1px solid #475569
    padding-bottom 8px

.config-grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
  gap 24px

.config-item
  .config-label
    color #cbd5e1
    font-size 14px
    margin-bottom 4px

  .config-value
    color #f8fafc
    font-weight 600

.performance-chart
  .chart-placeholder
    text-align center

.chart-title
  color #f8fafc
  font-weight 600
  margin-bottom 24px

.performance-bars
  display flex
  align-items end
  justify-content center
  gap 4px
  height 100px
  margin-bottom 16px

.bar
  width 20px
  background #3b82f6
  border-radius 4px
  transition all 0.3s ease

  &.positive
    background #10b981

  &.negative
    background #ef4444

.chart-labels
  display flex
  justify-content center
  gap 4px

  span
    width 20px
    text-align center
    color #cbd5e1
    font-size 12px

.parameters-table
  .param-row
    display flex
    justify-content space-between
    padding 8px 0
    border-bottom 1px solid #475569

    &:last-child
      border-bottom none

.param-name
  color #cbd5e1

.param-value
  color #f8fafc
  font-weight 600
  font-family 'JetBrains Mono', monospace

.status-indicator
  width 8px
  height 8px
  border-radius 50%
  display inline-block
  margin-right 8px

.status-connected
  background #10b981
</style>