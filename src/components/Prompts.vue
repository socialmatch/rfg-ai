<template lang="pug">
.prompts-container
  .prompts-content(ref="contentRef")
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'

// Direct Chinese content - no i18n to avoid Vue template parsing issues
const promptContent = computed(() => {
  return `你是一名专业的加密货币量化交易 AI。

---

## 🎯 目标是：在风险可控的前提下，实现 高胜率 + 高收益 的多空合约策略。

每 15 分钟分析一次 6 个币种（BTC、ETH、SOL、BNB、DOGE、XRP）的最新数据，并输出 严格 JSON 格式 的交易策略。

必须基于传入的数据，按照下述 硬性规则 输出严格 JSON 格式的交易策略。

不得虚构数据、不得使用未提供的数据，不得改变数据含义。

对于当前指定的目标币种（symbol），你必须输出完整 JSON。

---

## 📊 当前数据（隐私保护）

- 符号：{{SYMBOL}} # 例如，BNB / BTC / ETH
- 可用资金（四舍五入）：{{AVAILABLE_FUNDS_BUCKET}} USDT # 桶（例如 2900）
- 最大杠杆上限：{{MAX_LEVERAGE_CAP}} # 例如，10
- 当前市场价格（四舍五入）：{{CURRENT_PRICE_ROUNDED}}
- 数据新鲜度：最近一小时内更新

---

## 🔐 核心原则与交易员准则

1. 所有判断必须完全基于提供的数据；任何缺失数据 → 不可推断、不可虚构。

2. 最终开仓方向仅由  Dk 决定；若 Dk=None → 禁止开仓。

3. CI（信心指数）不满足 **开仓CI动态要求** → 一律 HOLD，不允许开仓。

4. RR ≤ 1 → 禁止开仓。

5. 每次最多开 1 个币种，且单次开仓最大保证金 ≤ 可用资产总额的 20%，杠杆= 10x。

6. 亏损持仓禁止加仓；只有在盈利且 CI 满足 **开仓CI动态要求** 且方向一致时加仓。

7. 持仓亏损 ≥ 3% → 必须止损。

8. 数据冲突 / 结构不明 / 信号不共振 / 方向不一致 / 风险过高 → 必须输出 HOLD。

9. 连续 3 单亏损 → 暂停开仓，直到出现 CI≥85 且 RR≥1.3 的信号才能恢复。

10. 同一币种连续 3 单亏损 → 对该币种启用防守式开仓（即当该币种出现CI ≥ 85 且 RR ≥ 1.3 的信号才开仓）。

11. 所有输出必须遵守 JSON 结构；不得输出额外内容，不得替换方向、指标或风控逻辑。

技术分、盘口分、盈亏比、风险指数、信心指数等参数由外部计算输入，不得篡改。

---

## ⚙️ 决策规则（Decision Rules）

### 方向判断（Direction Determination）：

使用 15分钟K线 作为主要周期，并由 1小时K线 确认趋势。

### 信心指数 Confidence Index（0–100）：

- 信心指数仅代表 信号强度，不代表方向
- < 70 → 观望（HOLD）
- ≥ 70→ 可以执行**开仓CI动态要求**

### 风险控制（Risk Control）：

你只判断范围：
- ≤ 0.4 → 低风险
- 0.4 - 0.7 → 中风险
- ≥ 0.7 → 高风险 → 可直接 HOLD

### 盈亏比

你只判断：
- RR > 1 → 可继续判断
- RR ≤ 1 → 必须 HOLD

---

## 开仓 / 加仓 / 持仓规则

1. 开仓前置条件（必须全部满足）：

- D ∈ {"多","空"}，且 Dk ≠ None；
- RR > 1；
- CI ≥ **开仓CI动态要求**；
- RiskIndex ≤ 0.7
- 当前币种无亏损持仓。

否则：side 必须输出为 "HOLD"

2. 仓位与保证金：

- 单次开仓使用保证金 ≤ 当前可用资金 20%；
- 仓位大小根据 CI、RiskIndex 和可用资金计算，需在 reasoning 中合理化说明。
- 杠杆固定为 10x。

3. 加仓（仅在盈利时）：

- 满足全部开仓前置条件
- 已有持仓盈利，且当前方向 D 与持仓方向一致，才允许考虑加仓；
- 单次加仓保证金不得超过当前盈利；
- 多次加仓后，总加仓保证金 < 总盈利。

4. 持仓止盈止损（核心纪律）：

- 当持仓盈利且 信心指数较小或 当持仓盈利且 当前判断多空方向与所开仓位多空方向相反时，可以主动止盈。
- 持仓亏损 ≥ 3% → 无条件止损；
- 未实现利润从最高点回撤至 50% 时 → 必须止盈 （非常重要）；
- 持仓亏损且当前方向与持仓方向相反 → 可以主动止损；
- 禁止在亏损时加仓，也禁止动用账户剩余资金给亏损仓位补仓。

---

## 💰 账户概况（抽象处理）

- 账户总价值（区间化）：{{TOTAL_ASSET_BUCKET}} USDT
- 可用资金（区间化）：{{AVAILABLE_FUNDS_BUCKET}} USDT
- 当前整体盈亏状态：{{ACCOUNT_PNL_STATUS}}
- 例如："moderate_gain"（中度盈利）、"flat"（持平）、"minor_loss"（小额亏损）

所有数据均为大致区间值，并非实时数值。

在输出中永远不要回显原始账户数据或时间戳。`
})

// Improved markdown to HTML converter
const markdownToHtml = (markdown) => {
  let html = markdown
  
  // First: Escape Vue template placeholders to prevent parsing
  // This must be done before any other processing
  html = html.replace(/\{\{/g, '&#123;&#123;')
  html = html.replace(/\}\}/g, '&#125;&#125;')
  
  // Process code blocks first (before other processing)
  html = html.replace(/```json\n([\s\S]*?)```/g, '<pre><code class="language-json">$1</code></pre>')
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  
  // Split into lines for processing
  const lines = html.split('\n')
  const processedLines = []
  let inCodeBlock = false
  let inList = false
  let listType = null // 'ul' or 'ol'
  let listItems = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const originalLine = lines[i]
    
    // Check if we're in a code block
    if (line.startsWith('<pre>')) {
      inCodeBlock = true
      processedLines.push(originalLine)
      continue
    }
    if (line.includes('</pre>')) {
      inCodeBlock = false
      processedLines.push(originalLine)
      continue
    }
    if (inCodeBlock) {
      processedLines.push(originalLine)
      continue
    }
    
    // Headers
    if (line.startsWith('### ')) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listItems = []
      }
      processedLines.push(`<h3>${line.substring(4)}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listItems = []
      }
      processedLines.push(`<h2>${line.substring(3)}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listItems = []
      }
      processedLines.push(`<h1>${line.substring(2)}</h1>`)
      continue
    }
    
    // Horizontal rules
    if (line === '---' || line === '***') {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listItems = []
      }
      processedLines.push('<hr>')
      continue
    }
    
    // Blockquotes
    if (line.startsWith('> ')) {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listItems = []
      }
      processedLines.push(`<blockquote>${line.substring(2)}</blockquote>`)
      continue
    }
    
    // Ordered list items
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (orderedMatch) {
      if (inList && listType !== 'ol') {
        processedLines.push(`</${listType}>`)
        listItems = []
      }
      if (!inList) {
        listType = 'ol'
        inList = true
      }
      const itemContent = orderedMatch[2]
      // Process inline code and bold
      let processedContent = itemContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
      processedLines.push(`<li>${processedContent}</li>`)
      continue
    }
    
    // Unordered list items
    if (line.startsWith('- ')) {
      if (inList && listType !== 'ul') {
        processedLines.push(`</${listType}>`)
        listItems = []
      }
      if (!inList) {
        listType = 'ul'
        inList = true
      }
      const itemContent = line.substring(2)
      // Process inline code and bold
      let processedContent = itemContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
      processedLines.push(`<li>${processedContent}</li>`)
      continue
    }
    
    // Close list if needed
    if (inList && line === '') {
      processedLines.push(`</${listType}>`)
      inList = false
      listType = null
      listItems = []
      processedLines.push('')
      continue
    }
    
    // Regular paragraphs
    if (line === '') {
      if (inList) {
        processedLines.push(`</${listType}>`)
        inList = false
        listType = null
        listItems = []
      }
      processedLines.push('')
      continue
    }
    
    // Process inline formatting
    let processedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Wrap in paragraph if not already wrapped
    if (!processedLine.startsWith('<')) {
      processedLine = `<p>${processedLine}</p>`
    }
    
    if (inList) {
      processedLines.push(`</${listType}>`)
      inList = false
      listType = null
      listItems = []
    }
    
    processedLines.push(processedLine)
  }
  
  // Close any remaining list
  if (inList) {
    processedLines.push(`</${listType}>`)
  }
  
  // Join and clean up
  html = processedLines.join('\n')
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/\n\n+/g, '\n')
  
  // Final safety: ensure all {{ }} are escaped (in case any were missed)
  // This is a double-check to prevent Vue from parsing placeholders
  html = html.replace(/\{\{/g, '&#123;&#123;')
  html = html.replace(/\}\}/g, '&#125;&#125;')
  
  return html
}

const renderedContent = computed(() => {
  return markdownToHtml(promptContent.value)
})

// Use ref to set content directly, avoiding Vue template parsing
const contentRef = ref(null)

// Update content when renderedContent changes
watch(renderedContent, (newContent) => {
  if (contentRef.value && newContent) {
    contentRef.value.innerHTML = newContent
  }
}, { immediate: true })

onMounted(() => {
  nextTick(() => {
    if (contentRef.value && renderedContent.value) {
      contentRef.value.innerHTML = renderedContent.value
    }
  })
})
</script>

<style lang="stylus" scoped>
.prompts-container
  height 100%
  overflow-y auto
  padding 20px

.prompts-content
  max-width 800px
  margin 0 auto
  color #e5e7eb
  line-height 1.6
  font-size 14px

  :deep(h1)
    color #f8fafc
    font-size 24px
    font-weight 800
    margin 24px 0 16px 0
    border-bottom 2px solid #2b3444
    padding-bottom 12px

    &:first-child
      margin-top 0

  :deep(h2)
    color #f8fafc
    font-size 20px
    font-weight 700
    margin 24px 0 12px 0
    border-bottom 1px solid #2b3444
    padding-bottom 8px

  :deep(h3)
    color #f8fafc
    font-size 16px
    font-weight 700
    margin 20px 0 12px 0

  :deep(p)
    margin-bottom 16px
    color #cbd5e1
    line-height 1.6

  :deep(ul), :deep(ol)
    margin 16px 0
    padding-left 24px
    color #cbd5e1

  :deep(li)
    margin-bottom 8px
    line-height 1.6

  :deep(blockquote)
    background #1a2230
    border-left 4px solid #3b82f6
    margin 16px 0
    padding 12px 16px
    color #cbd5e1
    font-style italic

  :deep(hr)
    border none
    border-top 1px solid #2b3444
    margin 24px 0

  :deep(code)
    background #1a2230
    border 1px solid #2b3444
    border-radius 4px
    padding 2px 6px
    font-family 'JetBrains Mono', 'Courier New', monospace
    font-size 13px
    color #10b981

  :deep(pre)
    background #0f172a
    border 1px solid #2b3444
    border-radius 8px
    padding 16px
    margin 20px 0
    overflow-x auto

    code
      background transparent
      border none
      padding 0
      color #e5e7eb
      font-size 13px
      line-height 1.5
      display block
      white-space pre-wrap
      word-wrap break-word

  :deep(strong)
    color #f8fafc
    font-weight 700

// Mobile responsive styles
@media (max-width: 960px)
  .prompts-container
    padding 16px

  .prompts-content
    max-width 100%
    font-size 13px

    :deep(h1)
      font-size 20px
      margin 20px 0 12px 0
      padding-bottom 8px

    :deep(h2)
      font-size 18px
      margin 20px 0 10px 0
      padding-bottom 6px

    :deep(h3)
      font-size 15px
      margin 16px 0 10px 0

    :deep(p)
      margin-bottom 12px
      font-size 13px

    :deep(ul), :deep(ol)
      padding-left 20px
      margin 12px 0

    :deep(li)
      margin-bottom 6px
      font-size 13px

    :deep(blockquote)
      padding 10px 12px
      margin 12px 0
      font-size 13px

    :deep(hr)
      margin 20px 0

    :deep(code)
      font-size 12px
      padding 2px 4px

    :deep(pre)
      padding 12px
      margin 16px 0

      code
        font-size 12px
</style>
