<template lang="pug">
.readme-container
  .readme-content
    h1 {{ $t('readme.title') }}
    p {{ $t('readme.subtitle') }}

    .intro-section
      h3 {{ $t('readme.architectureTitle') }}
      p {{ $t('readme.architectureDesc') }}
      ul.agents-list
        li {{ $t('readme.agent1') }}
        li {{ $t('readme.agent2') }}
        li {{ $t('readme.agent3') }}
        li {{ $t('readme.agent4') }}
      p {{ $t('readme.vibeTradingDesc') }}
      p {{ $t('readme.plannerDesc') }}
      p {{ $t('readme.grpoDesc') }}
      p {{ $t('readme.debateDesc') }}
      ul.agents-list
        li {{ $t('readme.signal1') }}
        li {{ $t('readme.signal2') }}
        li {{ $t('readme.signal3') }}
        li {{ $t('readme.signal4') }}
        li {{ $t('readme.signal5') }}

    h2 {{ $t('readme.featuresTitle') }}
    .features-list
      .feature-item {{ $t('readme.feature1') }}
      .feature-item {{ $t('readme.feature2') }}
      .feature-item {{ $t('readme.feature3') }}
      .feature-item {{ $t('readme.feature4') }}
      .feature-item {{ $t('readme.feature5') }}
      .feature-item {{ $t('readme.feature6') }}
      .feature-item {{ $t('readme.feature7') }}

    h2 {{ $t('readme.modelsTitle') }}
    p {{ $t('readme.modelsDesc') }}

    p {{ $t('readme.modelsNote') }}

    h2 {{ $t('readme.performanceTitle') }}
    .features-list
      .feature-item {{ $t('readme.performance1') }}
      .feature-item {{ $t('readme.performance2') }}
      .feature-item {{ $t('readme.performance3') }}
      .feature-item {{ $t('readme.performance4') }}
      .feature-item {{ $t('readme.performance5') }}
      .feature-item {{ $t('readme.performance6') }}
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
// 依赖 locale 以确保语言切换时重新渲染
void locale.value
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
