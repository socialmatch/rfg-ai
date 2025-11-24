<template lang="pug">
div
  router-view
  TradingEndModal
</template>

<script setup>
import { onMounted } from 'vue'
import TradingEndModal from '@/components/TradingEndModal.vue'

onMounted(() => {
})
</script>

<style lang="stylus">
#app
  min-height 100vh
  background #0f172a
</style>
