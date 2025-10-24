<template lang="pug">
.models-container
  Header

  // 页面标题
  .page-title AI MODELS

  // 模型列表
  .models-grid
    .model-card(v-for="model in models" :key="model.name" @click="goToModelDetail(model)")
      .model-header
        .model-icon
          img(:src="model.icon" :alt="model.name")
        .model-name {{ model.name }}

      .model-stats
        .stat-item
          .label Account Value
          .value ${{ model.accountValue.toLocaleString() }}
        .stat-item
          .label Return %
          .value(:class="model.returnPercent >= 0 ? 'positive' : 'negative'")
            | {{ model.returnPercent >= 0 ? '+' : '' }}{{ model.returnPercent.toFixed(2) }}%
        .stat-item
          .label Total P&L
          .value(:class="model.totalPnl >= 0 ? 'positive' : 'negative'")
            | ${{ model.totalPnl.toLocaleString() }}
        .stat-item
          .label Win Rate
          .value {{ model.winRate.toFixed(1) }}%
        .stat-item
          .label Trades
          .value {{ model.trades }}

      .model-chart
        .mini-chart(:style="{ backgroundColor: model.color + '20' }")
          .chart-bar(v-for="(value, index) in model.chartData" :key="index"
            :style="{ height: getBarHeight(value, model.chartData) + '%', backgroundColor: model.color }")
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { getAllModelInfo, getModelIconPath } from '@/config/accounts.js'

const router = useRouter()

// 模型数据 - 从配置文件获取基础信息，添加模拟数据
const models = ref(getAllModelInfo().map(model => ({
  name: model.name,
  slug: model.slug,
  icon: getModelIconPath(model.name),
  color: model.color,
  accountValue: Math.floor(Math.random() * 15000) + 2000,
  returnPercent: (Math.random() - 0.5) * 100,
  totalPnl: Math.floor(Math.random() * 10000) - 5000,
  winRate: Math.random() * 50,
  trades: Math.floor(Math.random() * 100) + 10,
  chartData: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 20)
})))

// 方法
const goToModelDetail = (model) => {
  router.push(`/models/${model.slug}`)
}

const getBarHeight = (value, data) => {
  const maxValue = Math.max(...data)
  return (value / maxValue) * 100
}
</script>

<style lang="stylus" scoped>
.models-container
  min-height 100vh
  background #0f172a

.page-title
  width 95%
  margin 0 auto
  padding 40px 20px 20px
  font-size 48px
  font-weight 900
  color #f8fafc
  text-align center
  margin-bottom 40px
  font-family 'Inter', sans-serif

.models-grid
  width 95%
  margin 0 auto
  padding 0 20px 40px
  display grid
  grid-template-columns repeat(auto-fit, minmax(400px, 1fr))
  gap 24px

.model-card
  background-color #1a2230
  border-radius 12px
  padding 24px
  border 1px solid #2b3444
  cursor pointer
  transition all 0.3s ease

  &:hover
    transform translateY(-2px)
    box-shadow 0 8px 25px rgba(0, 0, 0, 0.3)
    border-color #3b82f6

.model-header
  display flex
  align-items center
  gap 16px
  margin-bottom 20px

  .model-icon
    width 48px
    height 48px
    border-radius 8px
    overflow hidden

    img
      width 100%
      height 100%
      object-fit cover

  .model-name
    font-size 20px
    font-weight 700
    color #f8fafc

.model-stats
  display grid
  grid-template-columns 1fr 1fr
  gap 16px
  margin-bottom 20px

  .stat-item
    display flex
    justify-content space-between
    align-items center

    .label
      font-size 12px
      color #94a3b8
      font-weight 600

    .value
      font-size 14px
      font-weight 700
      color #f8fafc

      &.positive
        color #10b981

      &.negative
        color #ef4444

.model-chart
  height 80px
  border-radius 8px
  overflow hidden

  .mini-chart
    height 100%
    display flex
    align-items end
    gap 2px
    padding 8px

    .chart-bar
      flex 1
      min-height 4px
      border-radius 2px 2px 0 0
</style>
