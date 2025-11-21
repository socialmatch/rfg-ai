<template lang="pug">
.prompts-container
  .prompts-content(ref="contentRef")
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Helper function to escape Vue template placeholders
const escapeVuePlaceholders = (text) => {
  if (!text) return text
  // Escape {{ and }} to prevent Vue from parsing them
  return String(text)
    .replace(/\{\{/g, '&#123;&#123;')
    .replace(/\}\}/g, '&#125;&#125;')
}

const promptContent = computed(() => {
  // 依赖 locale 以确保语言切换时重新计算
  void locale.value
  
  // Escape placeholders in each translation before concatenating
  return `${escapeVuePlaceholders(t('prompts.title'))}

---

## 🎯 ${escapeVuePlaceholders(t('prompts.goal'))}

${escapeVuePlaceholders(t('prompts.goalDesc'))}

${escapeVuePlaceholders(t('prompts.mustRule'))}

${escapeVuePlaceholders(t('prompts.mustRuleDesc'))}

${escapeVuePlaceholders(t('prompts.symbolRule'))}

---

## 📊 ${escapeVuePlaceholders(t('prompts.currentData'))}

- ${escapeVuePlaceholders(t('prompts.symbol'))}  
- ${escapeVuePlaceholders(t('prompts.availableFunds'))}  
- ${escapeVuePlaceholders(t('prompts.maxLeverage'))}  
- ${escapeVuePlaceholders(t('prompts.currentPrice'))}  
- ${escapeVuePlaceholders(t('prompts.dataFreshness'))}  

---

## 🔐 ${escapeVuePlaceholders(t('prompts.corePrinciples'))}

${escapeVuePlaceholders(t('prompts.principle1'))}

${escapeVuePlaceholders(t('prompts.principle2'))}

${escapeVuePlaceholders(t('prompts.principle3'))}

${escapeVuePlaceholders(t('prompts.principle4'))}

${escapeVuePlaceholders(t('prompts.principle5'))}

${escapeVuePlaceholders(t('prompts.principle6'))}

${escapeVuePlaceholders(t('prompts.principle7'))}

${escapeVuePlaceholders(t('prompts.principle8'))}

${escapeVuePlaceholders(t('prompts.principle9'))}

${escapeVuePlaceholders(t('prompts.principle10'))}

${escapeVuePlaceholders(t('prompts.principle11'))}

${escapeVuePlaceholders(t('prompts.principle11Desc'))}

---

## ${escapeVuePlaceholders(t('prompts.decisionRules'))}

### ${escapeVuePlaceholders(t('prompts.directionTitle'))}

${escapeVuePlaceholders(t('prompts.directionDesc'))}

### ${escapeVuePlaceholders(t('prompts.confidenceTitle'))}

- ${escapeVuePlaceholders(t('prompts.confidenceDesc1'))}
- ${escapeVuePlaceholders(t('prompts.confidenceDesc2'))}
- ${escapeVuePlaceholders(t('prompts.confidenceDesc3'))}

### ${escapeVuePlaceholders(t('prompts.riskControlTitle'))}

${escapeVuePlaceholders(t('prompts.riskControlDesc1'))}

- ${escapeVuePlaceholders(t('prompts.riskControlDesc2'))}
- ${escapeVuePlaceholders(t('prompts.riskControlDesc3'))}
- ${escapeVuePlaceholders(t('prompts.riskControlDesc4'))}

### ${escapeVuePlaceholders(t('prompts.riskRewardTitle'))}

${escapeVuePlaceholders(t('prompts.riskRewardDesc1'))}

- ${escapeVuePlaceholders(t('prompts.riskRewardDesc2'))}
- ${escapeVuePlaceholders(t('prompts.riskRewardDesc3'))}

---

## ${escapeVuePlaceholders(t('prompts.positionRulesTitle'))}

${escapeVuePlaceholders(t('prompts.positionRule1'))}

- ${escapeVuePlaceholders(t('prompts.positionRule1Desc1'))}
- ${escapeVuePlaceholders(t('prompts.positionRule1Desc2'))}
- ${escapeVuePlaceholders(t('prompts.positionRule1Desc3'))}
- ${escapeVuePlaceholders(t('prompts.positionRule1Desc4'))}
- ${escapeVuePlaceholders(t('prompts.positionRule1Desc5'))}

${escapeVuePlaceholders(t('prompts.positionRule1Desc6'))}

${escapeVuePlaceholders(t('prompts.positionRule2'))}

- ${escapeVuePlaceholders(t('prompts.positionRule2Desc1'))}
- ${escapeVuePlaceholders(t('prompts.positionRule2Desc2'))}
- ${escapeVuePlaceholders(t('prompts.positionRule2Desc3'))}

${escapeVuePlaceholders(t('prompts.positionRule3'))}

- ${escapeVuePlaceholders(t('prompts.positionRule3Desc1'))}
- ${escapeVuePlaceholders(t('prompts.positionRule3Desc2'))}
- ${escapeVuePlaceholders(t('prompts.positionRule3Desc3'))}
- ${escapeVuePlaceholders(t('prompts.positionRule3Desc4'))}

${escapeVuePlaceholders(t('prompts.positionRule4'))}

- ${escapeVuePlaceholders(t('prompts.positionRule4Desc1'))}
- ${escapeVuePlaceholders(t('prompts.positionRule4Desc2'))}
- ${escapeVuePlaceholders(t('prompts.positionRule4Desc3'))}
- ${escapeVuePlaceholders(t('prompts.positionRule4Desc4'))}
- ${escapeVuePlaceholders(t('prompts.positionRule4Desc5'))}

---

## ${escapeVuePlaceholders(t('prompts.accountOverviewTitle'))}

- ${escapeVuePlaceholders(t('prompts.accountOverviewDesc1'))}
- ${escapeVuePlaceholders(t('prompts.accountOverviewDesc2'))}
- ${escapeVuePlaceholders(t('prompts.accountOverviewDesc3'))}
- ${escapeVuePlaceholders(t('prompts.accountOverviewDesc4'))}

${escapeVuePlaceholders(t('prompts.accountOverviewDesc5'))}

${escapeVuePlaceholders(t('prompts.accountOverviewDesc6'))}`
})

// Improved markdown to HTML converter
const markdownToHtml = (markdown) => {
  let html = markdown
  
  // Note: Vue placeholders are already escaped in promptContent computed
  // No need to escape again here
  
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
