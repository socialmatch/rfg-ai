<template lang="pug">
.prompts-container
  .prompts-content(v-html="renderedContent")
</template>

<script setup>
import { computed } from 'vue'

const promptContent = `You are a professional crypto trading AI. Analyze the market data and make a **simple, risk-controlled leveraged trading decision**.

---

## 🎯 Goal
Achieve **high win rate** and **controlled risk** through disciplined market-order trading.

---

## 📊 Current Data (Privacy-Preserved)
- Symbol: {{SYMBOL}}                     # e.g., BNB / BTC / ETH  
- Available funds (rounded): {{AVAILABLE_FUNDS_BUCKET}} USDT  # bucketed (e.g., 2900)  
- Max leverage cap: {{MAX_LEVERAGE_CAP}}  # e.g., 10  
- Current market price (rounded): {{CURRENT_PRICE_ROUNDED}}  
- Data freshness: updated within last hour  

> Filter across all available trading pairs, and use the filtered symbol data to populate the prompt.

---

## 🧠 Technical Analysis (Coarse Tags)
Focus on **15-minute K-line** for primary direction, with **1-hour confirmation**.

### Key Indicators:
- **MACD**: {{MACD_TAG}}  — up / down / flat / up_crossing / down_crossing  
- **EMA7 vs EMA20**: {{EMA_TAG}}  — ema7_above / ema7_below / crossing  
- **RSI**: {{RSI_TAG}}  — low / neutral / high  
- **Bollinger Bands mid-slope**: {{BOLL_TAG}}  — up / down / flat  

Example format (simplified):
\`\`\`json
{
  "symbol": "{{SYMBOL}}",
  "timeframes": {
    "1h": {
      "ema_relation": "ema7_below_ema20",
      "macd": "up_crossing",
      "rsi_band": "neutral",
      "boll_mid_slope": "down"
    },
    "15m": {
      "ema_relation": "ema7_above_ema20",
      "macd": "up",
      "rsi_band": "high",
      "boll_mid_slope": "up"
    }
  }
}
\`\`\`

---

## 💼 Current Holdings (Summary Only)
> Do NOT include exact entry prices, liquidation prices, or quantities.

- Long positions: {{LONG_COUNT}}  
- Short positions: {{SHORT_COUNT}}  
- Unrealized PnL distribution: {{PNL_BANDS}}  # e.g., ["small_gain", "flat", "small_loss"]  

---

## ⚙️ Decision Rules
1. **Direction Determination:**  
   Use 15m K-line as the main timeframe, confirm with 1h.  
   - If 15m & 1h both show uptrend → consider BUY  
   - If both show downtrend → consider SELL  
   - If signals conflict → HOLD

2. **Confidence Index (0–100):**  
   - < 70 → HOLD  
   - 70–85 → small position (≤10% of available funds)  
   - ≥ 85 → stronger conviction (≤20% of available funds)

3. **Risk Control:**  
   - Trade only when confidence ≥ 70 and risk acceptable.  
   - Always define stop-loss and take-profit before execution.  
   - Never add to losing positions.

4. **Position Sizing & Leverage:**  
   - Position size ≤ 20% of {{AVAILABLE_FUNDS_BUCKET}}  
   - Leverage range: 3x–{{MAX_LEVERAGE_CAP}}  
   - Determine leverage dynamically:
     - Confidence ≥ 85 → 7–{{MAX_LEVERAGE_CAP}}  
     - Confidence 75–85 → 5–7  
     - Confidence 70–75 → 3–5  

---

## 🚀 Opening Rules
- High confidence + favorable risk/reward → open position.  
- Maximum position: 20% of available funds.  
- Stop-loss required (default 5%).  
- Take-profit target required.  
- Use only **ISOLATED margin mode**.  

---

## 🔄 Position Management
1. Profit + low confidence → Take profit.  
2. Loss + low confidence → Cut loss.  
3. Loss > 3% + wrong direction → Close immediately.  
4. Never average down losing positions.

---

## 💰 Account Overview (Abstracted)
- Total account value (bucketed): {{TOTAL_ASSET_BUCKET}} USDT  
- Available funds (bucketed): {{AVAILABLE_FUNDS_BUCKET}} USDT  
- Current overall PnL status: {{ACCOUNT_PNL_STATUS}}  # e.g., "moderate_gain", "flat", "minor_loss"  

> These are approximate, rounded, and not real-time values.  
> Never echo raw account numbers or timestamps in responses.

---

## 🧾 Final Output Requirements

Please output your **market-order trading recommendation** in **strict JSON format** as follows:

\`\`\`json
{
  "analysis_summary": "Concise market-order analysis summary (≤100 words)",
  "market_sentiment": "bullish|bearish|neutral",
  "confidence_level": 85,
  "market_timing": "optimal|good|poor",
  "trading_strategy": {
    "symbol": "{{SYMBOL}}USDT",
    "side": "BUY|SELL|HOLD",
    "positionSide": "BOTH",
    "type": "MARKET",
    "quantity": {{QUANTITY_CALC}},              // ≤20% of funds * leverage / price
    "leverage": {{LEVERAGE_CHOSEN}},            // ≤ {{MAX_LEVERAGE_CAP}}
    "marginType": "ISOLATED",
    "current_market_price": {{CURRENT_PRICE_ROUNDED}},
    "expected_slippage": {{SLIPPAGE_PCT}},      // e.g., 0.1
    "margin_required": {{MARGIN_REQ}},          // derived, rounded
    "margin_percent_of_total": {{MARGIN_PCT}},  // ≤20
    "stop_loss": {{STOP_LOSS_PRICE}},           // mandatory
    "stop_loss_percent": {{STOP_LOSS_PCT}},     // e.g., 4.5
    "take_profit": {{TAKE_PROFIT_PRICE}},       // mandatory
    "risk_reward_ratio": "{{RR_LABEL}}",        // e.g., "1:2.0"
    "execution_urgency": "high|medium|low"
  }
}
\`\`\`

---

## ✅ Mandatory JSON Rules
- If **confidence < 70**, set:
  - \`"side": "HOLD"\`
  - \`"quantity": 0\`
- All keys must exist (values may be null but not omitted).  
- Always include \`stop_loss\` and \`take_profit\` fields.  
- Keep output concise, numeric, and valid JSON.  
- Do NOT print commentary outside the JSON block.

---

## ⚠️ Privacy & Compliance Reminders
- Never reveal or infer **precise account balances**, **position entries**, or **timestamps**.  
- All numeric values must be **rounded or bucketed**.  
- You are restricted to placeholders and aggregated summaries only.  
- If uncertain, output \`"side": "HOLD"\`.

---

## 🔐 Example (Fake Demonstration Output)
\`\`\`json
{
  "analysis_summary": "Market momentum is recovering; 15m and 1h indicators aligned bullishly. Controlled long entry favored.",
  "market_sentiment": "bullish",
  "confidence_level": 82,
  "market_timing": "good",
  "trading_strategy": {
    "symbol": "BNBUSDT",
    "side": "BUY",
    "positionSide": "BOTH",
    "type": "MARKET",
    "quantity": 0.42,
    "leverage": 7,
    "marginType": "ISOLATED",
    "current_market_price": 1157.4,
    "expected_slippage": 0.1,
    "margin_required": 69.26,
    "margin_percent_of_total": 8.5,
    "stop_loss": 1100.0,
    "stop_loss_percent": 4.9,
    "take_profit": 1240.0,
    "risk_reward_ratio": "1:2.1",
    "execution_urgency": "medium"
  }
}
\`\`\`

---

**Final Notes:**  
This prompt is safe for public release.  
It preserves your full trading logic, all decision rules, and JSON schema —  
while removing any confidential or live-trading data.  
Use placeholder injection at runtime for actual operation.`

// Improved markdown to HTML converter
const markdownToHtml = (markdown) => {
  let html = markdown
  
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
  return markdownToHtml(promptContent)
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
