<template lang="pug">
.language-switcher
  button.lang-btn(@click="toggleLanguage" :title="currentLang === 'en' ? 'Switch to Chinese' : '切换到英文'")
    span {{ currentLang === 'en' ? 'EN' : '中文' }}
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const currentLang = ref(locale.value)

const toggleLanguage = () => {
  const newLang = currentLang.value === 'en' ? 'zh' : 'en'
  locale.value = newLang
  currentLang.value = newLang
  localStorage.setItem('locale', newLang)
}

onMounted(() => {
  currentLang.value = locale.value
})
</script>

<style lang="stylus" scoped>
.language-switcher
  display flex
  align-items center

.lang-btn
  background transparent
  border 1px solid #2b3444
  color #cbd5e1
  font-size 12px
  padding 6px 12px
  border-radius 6px
  font-weight 600
  cursor pointer
  transition all 0.2s ease

  &:hover
    border-color #3b82f6
    color #3b82f6
    background rgba(59, 130, 246, 0.1)
</style>

