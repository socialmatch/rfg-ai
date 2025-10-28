<template lang="pug">
header.header
  .header-content
    .logo
      h1 Alpha Arena by RFG AI

    nav.nav
      .nav-item(@click="goToHome" :class="{ active: $route.name === 'home' }") LIVE
      .nav-item(@click="goToLeaderboard" :class="{ active: $route.name === 'leaderboard' }") LEADERBOARD
      .nav-item(@mouseenter="showModelsDropdown = true" @mouseleave="handleMouseLeave" :class="{ active: $route.name === 'models' || $route.name === 'model-detail' }")
        | MODELS
        .models-dropdown(v-if="showModelsDropdown" @mouseenter="handleDropdownEnter" @mouseleave="showModelsDropdown = false")
          .dropdown-title AI MODELS
          .dropdown-separator
          .model-item(v-for="model in models" :key="model.name" @click="goToModelDetail(model)")
            //.model-color-dot(:style="{ backgroundColor: model.color }")
            .model-icon(:style="shouldShowBackground(model.name) ? { backgroundColor: model.color } : {}")
              img(:src="model.icon" :alt="model.name")
            .model-name {{ model.name }}

    .header-actions
      button.btn-secondary(@click="aboutRFGAI") ABOUT RFG.AI
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAllModelInfo, getModelIconPath } from '@/config/accounts.js'

const router = useRouter()
const showModelsDropdown = ref(false)
let hideTimeout = null

// 从配置文件获取模型数据
const models = ref(getAllModelInfo().map(model => ({
  name: model.name,
  slug: model.slug,
  icon: getModelIconPath(model.name),
  color: model.color
})))

// Determine if background color should be set
// Only GROK 4 needs background color (too similar to theme), others don't
const shouldShowBackground = (modelName) => {
  return modelName === 'GROK 4'
}

// 导航方法
const goToHome = () => {
  router.push('/')
}

const goToLeaderboard = () => {
  router.push('/leaderboard')
}

const goToModelDetail = (model) => {
  showModelsDropdown.value = false
  router.push(`/models/${model.slug}`)
}

const handleMouseLeave = () => {
  // 使用延时关闭，给用户时间移动到弹窗上
  hideTimeout = setTimeout(() => {
    showModelsDropdown.value = false
  }, 150)
}

const handleDropdownEnter = () => {
  // 鼠标进入弹窗时清除延时关闭
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  showModelsDropdown.value = true
}

const aboutRFGAI = () => {
  alert('关于 RFG AI 功能待实现')
}
</script>

<style lang="stylus" scoped>
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

.nav
  display flex
  gap 32px

.nav-item
  color #94a3b8
  font-weight 600
  font-size 14px
  cursor pointer
  transition color 0.3s ease
  position relative

  &:hover
    color #f8fafc

  &.active
    color #3b82f6

.models-dropdown
  position absolute
  top 100%
  left 0
  background #1a2230
  border 1px solid #2b3444
  border-radius 8px
  box-shadow 0 8px 25px rgba(0, 0, 0, 0.3)
  z-index 1000
  min-width 240px
  margin-top 8px

  .dropdown-title
    padding 12px 16px 8px
    font-weight 700
    font-size 14px
    color #f8fafc
    border-bottom 1px solid #2b3444

  .dropdown-separator
    height 1px
    background #2b3444

  .model-item
    display flex
    align-items center
    gap 12px
    padding 12px 16px
    cursor pointer
    transition background-color 0.2s ease

    &:hover
      background-color #0f172a

    .model-color-dot
      width 8px
      height 8px
      border-radius 50%
      flex-shrink 0

    .model-icon
      width 24px
      height 24px
      border-radius 4px
      overflow hidden

      img
        width 100%
        height 100%
        object-fit cover

    .model-name
      font-weight 600
      font-size 14px
      color #f8fafc

.header-actions
  display flex
  gap 12px

.btn-primary
  background linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
  border none
  color white
  font-size 12px
  padding 8px 16px
  border-radius 6px
  font-weight 800
  cursor pointer
  transition all 0.2s ease

  &:hover
    transform translateY(-1px)
    box-shadow 0 5px 15px rgba(59, 130, 246, 0.25)

.btn-secondary
  background transparent
  border 1px solid #2b3444
  color #cbd5e1
  font-size 12px
  padding 8px 16px
  border-radius 6px
  font-weight 800
  cursor pointer
  transition all 0.2s ease

  &:hover
    border-color #3b82f6
    color #3b82f6

// Mobile responsive styles
@media (max-width: 960px)
  .header
    padding 10px 0

  .header-content
    flex-wrap wrap
    gap 10px 0

  // Top row: Logo + Actions (first row)
  .logo
    flex 0 1 auto
    min-width 0
    
    h1
      font-size 16px
      line-height 1.2

  .header-actions
    flex 0 0 auto
    gap 8px

    .btn-secondary
      font-size 10px
      padding 6px 10px
      white-space nowrap

  // Bottom row: Navigation (second row)
  .nav
    order 10
    width 100%
    gap 12px
    justify-content center
    margin-top 6px
    padding-top 6px
    border-top 1px solid #2b3444

  .nav-item
    font-size 11px
    flex-shrink 0

  .models-dropdown
    left -16px
    right -16px
    width auto
    min-width auto

    .model-item
      padding 10px 16px

      .model-icon
        width 20px
        height 20px

      .model-name
        font-size 13px
</style>
