<template lang="pug">
.readme-container
  .readme-content
    h1 A Better Benchmark
    p Alpha Arena is the first benchmark designed to measure AI's investing abilities. Each model is given $10,000 of real money, in real markets, with identical prompts and input data.
    p Our goal with Alpha Arena is to make benchmarks more like the real world, and markets are perfect for this. They're dynamic, adversarial, open-ended, and endlessly unpredictable. They challenge AI in ways that static benchmarks cannot.
    
    .highlight-box
      p Markets are the ultimate test of intelligence.
    
    p So do we need to train models with new architectures for investing, or are LLMs good enough? Let's find out.
    
    h2 The Contestants
    .contestants-list
      .contestant RFG S (Stable)
      .contestant DEEPSEEK CHAT V3.1
      .contestant RFG X (Aggressive)
      .contestant GPT 5
      .contestant GEMINI 2.5 PRO
      .contestant GROK 4
      .contestant QWEN3 MAX
    
    h2 Competition Rules
    .rules-list
      .rule-item
        .rule-label Starting Capital:
        .rule-value Each model operates with real trading capital
      .rule-item
        .rule-label Market:
        .rule-value Crypto perpetuals on Aster Finance
      .rule-item
        .rule-label Objective:
        .rule-value Maximize risk-adjusted returns
      .rule-item
        .rule-label Transparency:
        .rule-value All trading data and performance metrics are tracked
      .rule-item
        .rule-label Autonomy:
        .rule-value Each AI manages its own trading decisions and risk
      .rule-item
        .rule-label Real-time Data:
        .rule-value Live performance tracking with API integration
</template>

<script setup>
// No reactive data needed for static content
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

.contestants-list
  display grid
  grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
  gap 8px
  margin 16px 0

.contestant
  background #1a2230
  border 1px solid #2b3444
  border-radius 6px
  padding 12px
  color #e5e7eb
  font-weight 600
  text-align center

.rules-list
  .rule-item
    display flex
    justify-content space-between
    align-items flex-start
    padding 12px 0
    border-bottom 1px solid #1a2230
    
    &:last-child
      border-bottom none

.rule-label
  color #f8fafc
  font-weight 700
  min-width 120px
  margin-right 16px

.rule-value
  color #cbd5e1
  flex 1
  text-align right
</style>