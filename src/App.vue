<template lang="pug">
div
  router-view
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWalletTokens } from '@/utils/multiChainWalletService.js'

const walletData = ref(null)

const loadWalletData = async () => {
  const result = await getWalletTokens('0xe25fc8a4711c5e1f52f7d144f907b9cffc054f4d')
  console.log(result)
  if (result.success) {
    walletData.value = result
  }
}

onMounted(() => {
  // loadWalletData()
})
</script>

<style lang="stylus">
#app
  min-height 100vh
  background #0f172a
</style>
