<template lang="pug">
.trading-end-modal(v-if="show")
  .modal-backdrop(@click="handleBackdropClick")
  .modal-content
    .modal-icon
      svg(width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        circle(cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3")
        circle(cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="15.708")
        path(d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
    .modal-title 本轮实盘已结束
    .modal-message 等待下轮实盘开启
</template>

<script setup>
import { ref } from 'vue'

// 控制弹窗显示，可以根据实际需求改为从 store 或 props 获取
const show = ref(true)

// 点击遮罩层（可选：如果需要点击关闭，可以取消注释）
const handleBackdropClick = () => {
  // 如果需要点击遮罩关闭，可以取消下面的注释
  // show.value = false
}
</script>

<style lang="stylus" scoped>
.trading-end-modal
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index 10002  // 高于 Header 的 z-index (10000)，确保覆盖 Header
  display flex
  align-items center
  justify-content center
  pointer-events auto

.modal-backdrop
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  background rgba(15, 23, 42, 0.85)
  // 毛玻璃效果
  backdrop-filter blur(12px) saturate(180%)
  -webkit-backdrop-filter blur(12px) saturate(180%)

.modal-content
  position relative
  z-index 1
  background linear-gradient(135deg, #1a2230 0%, #0f172a 100%)
  border 1px solid #2b3444
  border-radius 16px
  padding 48px 64px
  text-align center
  box-shadow 0 20px 60px rgba(0, 0, 0, 0.5)
  min-width 400px
  max-width 90vw
  animation modalFadeIn 0.3s ease-out

@keyframes modalFadeIn
  from
    opacity 0
    transform translateY(-20px) scale(0.95)
  to
    opacity 1
    transform translateY(0) scale(1)

.modal-icon
  margin 0 auto 24px
  width 80px
  height 80px
  color #3b82f6
  display flex
  align-items center
  justify-content center
  animation iconPulse 2s ease-in-out infinite

@keyframes iconPulse
  0%, 100%
    transform scale(1)
    opacity 1
  50%
    transform scale(1.05)
    opacity 0.9

.modal-title
  font-size 24px
  font-weight 800
  color #f8fafc
  margin-bottom 12px
  letter-spacing 0.02em

.modal-message
  font-size 16px
  font-weight 600
  color #cbd5e1
  letter-spacing 0.01em

// 移动端适配
@media (max-width: 960px)
  .modal-content
    min-width auto
    width 90vw
    padding 36px 32px

  .modal-icon
    width 48px
    height 48px
    margin-bottom 20px

  .modal-title
    font-size 20px

  .modal-message
    font-size 14px
</style>

