<template lang="pug">
.chat-container
  .chat-header
    h3 Model Chat
    .chat-status
      .status-indicator.connected
      span Online

  .chat-messages
    .message(v-for="message in messages" :key="message.id" :class="{ 'user-message': message.type === 'user', 'bot-message': message.type === 'bot' }")
      .message-avatar
        .avatar(:class="message.type")
          | {{ message.type === 'user' ? 'U' : 'AI' }}
      .message-content
        .message-text {{ message.text }}
        .message-time {{ formatTime(message.timestamp) }}

  .chat-input
    .input-container
      input.input-field(
        v-model="newMessage"
        @keypress.enter="sendMessage"
        placeholder="Ask the AI model about trading strategies..."
        :disabled="isLoading"
      )
      button.send-button(@click="sendMessage" :disabled="!newMessage.trim() || isLoading")
        .send-icon(v-if="!isLoading") →
        .loading-spinner(v-else)

  .chat-suggestions
    .suggestions-header Quick Questions:
    .suggestion-chips
      .chip(v-for="suggestion in suggestions" :key="suggestion" @click="selectSuggestion(suggestion)")
        | {{ suggestion }}
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const messages = ref([
  {
    id: 1,
    type: 'bot',
    text: 'Hello! I\'m your AI trading assistant. I can help you analyze market conditions, explain trading strategies, and provide insights on your portfolio performance.',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 2,
    type: 'user',
    text: 'What\'s the current market sentiment for BTC?',
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: 3,
    type: 'bot',
    text: 'Based on current market analysis, BTC shows bullish momentum with strong support at $94,500. The RSI is at 65, indicating moderate overbought conditions. I recommend monitoring for potential pullbacks to entry levels.',
    timestamp: new Date(Date.now() - 180000)
  },
  {
    id: 4,
    type: 'user',
    text: 'Should I take profit on my ETH position?',
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: 5,
    type: 'bot',
    text: 'Your ETH position is currently up 8.5%. Given the current market volatility and your risk tolerance, I suggest taking partial profits (50%) at $3,520 and letting the rest run with a trailing stop at $3,480.',
    timestamp: new Date(Date.now() - 60000)
  }
])

const newMessage = ref('')
const isLoading = ref(false)

const suggestions = ref([
  'Market analysis',
  'Risk management',
  'Portfolio optimization',
  'Technical indicators',
  'Entry/exit strategies'
])

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    text: newMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const messageText = newMessage.value
  newMessage.value = ''
  isLoading.value = true

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  // Simulate AI response
  setTimeout(() => {
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: generateAIResponse(messageText),
      timestamp: new Date()
    }
    messages.value.push(botMessage)
    isLoading.value = false
    
    nextTick(() => {
      scrollToBottom()
    })
  }, 1500)
}

const selectSuggestion = (suggestion) => {
  newMessage.value = suggestion
  sendMessage()
}

const generateAIResponse = (userMessage) => {
  const responses = {
    'market analysis': 'Current market shows mixed signals with BTC leading gains. Technical indicators suggest consolidation phase. I recommend monitoring key support/resistance levels.',
    'risk management': 'Effective risk management includes position sizing (max 10% per trade), stop-losses (2-3%), and diversification across assets. Never risk more than you can afford to lose.',
    'portfolio optimization': 'Your portfolio allocation looks well-balanced. Consider rebalancing if any single position exceeds 20% of total value. Current diversification across BTC, ETH, SOL, and altcoins is optimal.',
    'technical indicators': 'Key indicators to watch: RSI for overbought/oversold conditions, MACD for trend changes, and volume for confirmation. Current market shows bullish MACD but declining volume.',
    'entry/exit strategies': 'For entries: wait for pullbacks to key support levels with volume confirmation. For exits: use trailing stops and take profits at resistance levels. Current BTC support at $94,500.'
  }

  const lowerMessage = userMessage.toLowerCase()
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response
    }
  }

  return 'I understand your question. Based on current market conditions and your portfolio, I recommend focusing on risk management and maintaining discipline in your trading approach. Would you like me to elaborate on any specific aspect?'
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

const scrollToBottom = () => {
  const chatMessages = document.querySelector('.chat-messages')
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="stylus" scoped>
.chat-container
  height 500px
  display flex
  flex-direction column

.chat-header
  display flex
  justify-content space-between
  align-items center
  padding-bottom 16px
  border-bottom 1px solid #475569
  margin-bottom 24px

  h3
    color #f8fafc
    font-size 18px
    margin 0

.chat-status
  display flex
  align-items center
  gap 8px

  span
    color #cbd5e1
    font-weight 600

.chat-messages
  flex 1
  overflow-y auto
  padding-right 8px
  margin-bottom 24px

.message
  display flex
  gap 16px
  margin-bottom 24px

  &.user-message
    flex-direction row-reverse

.message-avatar
  .avatar
    width 32px
    height 32px
    border-radius 50%
    display flex
    align-items center
    justify-content center
    font-weight 600
    font-size 14px

    &.user
      background #3b82f6
      color white

    &.bot
      background #10b981
      color white

.message-content
  max-width 70%
  flex 1

  .message-text
    background #334155
    padding 16px
    border-radius 6px
    color #f8fafc
    line-height 1.5
    margin-bottom 4px

  .message-time
    color #94a3b8
    font-size 12px
    font-family 'JetBrains Mono', monospace

.user-message .message-content
  .message-text
    background #3b82f6
    color white

  .message-time
    text-align right

.chat-input
  margin-bottom 24px

.input-container
  display flex
  gap 8px

.input-field
  flex 1
  background #334155
  border 1px solid #475569
  color #f8fafc
  padding 16px
  border-radius 6px
  font-family 'JetBrains Mono', monospace

  &:focus
    outline none
    border-color #3b82f6

  &:disabled
    opacity 0.6
    cursor not-allowed

.send-button
  background #3b82f6
  border none
  color white
  padding 16px
  border-radius 6px
  cursor pointer
  transition all 0.3s ease
  min-width 50px

  &:hover:not(:disabled)
    background #2563eb

  &:disabled
    opacity 0.6
    cursor not-allowed

.send-icon
  font-size 18px

.loading-spinner
  width 16px
  height 16px
  border 2px solid transparent
  border-top 2px solid white
  border-radius 50%
  animation spin 1s linear infinite

@keyframes spin
  0%
    transform rotate(0deg)
  100%
    transform rotate(360deg)

.chat-suggestions
  .suggestions-header
    color #cbd5e1
    font-size 14px
    margin-bottom 8px

.suggestion-chips
  display flex
  flex-wrap wrap
  gap 8px

.chip
  background #334155
  border 1px solid #475569
  color #cbd5e1
  padding 8px 16px
  border-radius 6px
  cursor pointer
  transition all 0.3s ease
  font-size 14px

  &:hover
    border-color #3b82f6
    color #3b82f6
    background #1e293b

.status-indicator
  width 8px
  height 8px
  border-radius 50%
  display inline-block
  margin-right 8px

.status-connected
  background #10b981
</style>