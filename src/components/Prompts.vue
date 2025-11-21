<template lang="pug">
.prompts-container
  .prompts-content(v-html="renderedContent")
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const promptContent = computed(() => {
  // 依赖 locale 以确保语言切换时重新计算
  void locale.value
  
  return `${t('prompts.title')}

---

## 🎯 ${t('prompts.goal')}

${t('prompts.goalDesc')}

${t('prompts.mustRule')}

${t('prompts.mustRuleDesc')}

${t('prompts.symbolRule')}

---

## 📊 ${t('prompts.currentData')}

- ${t('prompts.symbol')}  
- ${t('prompts.availableFunds')}  
- ${t('prompts.maxLeverage')}  
- ${t('prompts.currentPrice')}  
- ${t('prompts.dataFreshness')}  

---

## 🔐 ${t('prompts.corePrinciples')}

${t('prompts.principle1')}

${t('prompts.principle2')}

${t('prompts.principle3')}

${t('prompts.principle4')}

${t('prompts.principle5')}

${t('prompts.principle6')}

${t('prompts.principle7')}

${t('prompts.principle8')}

${t('prompts.principle9')}

${t('prompts.principle10')}

${t('prompts.principle11')}

${t('prompts.principle11Desc')}

---

## ${t('prompts.decisionRules')}

### ${t('prompts.directionTitle')}

${t('prompts.directionDesc')}

### ${t('prompts.confidenceTitle')}

- ${t('prompts.confidenceDesc1')}
- ${t('prompts.confidenceDesc2')}
- ${t('prompts.confidenceDesc3')}

### ${t('prompts.riskControlTitle')}

${t('prompts.riskControlDesc1')}

- ${t('prompts.riskControlDesc2')}
- ${t('prompts.riskControlDesc3')}
- ${t('prompts.riskControlDesc4')}

### ${t('prompts.riskRewardTitle')}

${t('prompts.riskRewardDesc1')}

- ${t('prompts.riskRewardDesc2')}
- ${t('prompts.riskRewardDesc3')}

---

## ${t('prompts.positionRulesTitle')}

${t('prompts.positionRule1')}

- ${t('prompts.positionRule1Desc1')}
- ${t('prompts.positionRule1Desc2')}
- ${t('prompts.positionRule1Desc3')}
- ${t('prompts.positionRule1Desc4')}
- ${t('prompts.positionRule1Desc5')}

${t('prompts.positionRule1Desc6')}

${t('prompts.positionRule2')}

- ${t('prompts.positionRule2Desc1')}
- ${t('prompts.positionRule2Desc2')}
- ${t('prompts.positionRule2Desc3')}

${t('prompts.positionRule3')}

- ${t('prompts.positionRule3Desc1')}
- ${t('prompts.positionRule3Desc2')}
- ${t('prompts.positionRule3Desc3')}
- ${t('prompts.positionRule3Desc4')}

${t('prompts.positionRule4')}

- ${t('prompts.positionRule4Desc1')}
- ${t('prompts.positionRule4Desc2')}
- ${t('prompts.positionRule4Desc3')}
- ${t('prompts.positionRule4Desc4')}
- ${t('prompts.positionRule4Desc5')}

---

## ${t('prompts.accountOverviewTitle')}

- ${t('prompts.accountOverviewDesc1')}
- ${t('prompts.accountOverviewDesc2')}
- ${t('prompts.accountOverviewDesc3')}
- ${t('prompts.accountOverviewDesc4')}

${t('prompts.accountOverviewDesc5')}

${t('prompts.accountOverviewDesc6')}`
})

// Improved markdown to HTML converter
const markdownToHtml = (markdown) => {
  let html = markdown
  
  // Escape Vue template placeholders ({{ }}) to prevent Vue from parsing them
  // Replace {{ with &#123;&#123; and }} with &#125;&#125;
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
  
  return html
}

const renderedContent = computed(() => {
  return markdownToHtml(promptContent.value)
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
