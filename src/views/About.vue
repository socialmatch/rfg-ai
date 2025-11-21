<template lang="pug">
.about-container
  Header
  .about-content
    .about-section
      h1 {{ $t('about.title') }}
      
      .story-section
        p.intro {{ $t('about.intro') }}
        
        p.paragraph {{ $t('about.paragraph1') }}
        
        p.paragraph {{ $t('about.paragraph2') }}
        p.paragraph.sub {{ $t('about.paragraph3') }}
        
        p.paragraph {{ $t('about.paragraph4') }}
        p.paragraph {{ $t('about.paragraph5') }}
        
        p.paragraph {{ $t('about.paragraph6') }}
        
        p.conclusion {{ $t('about.conclusion') }}
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

<style lang="stylus" scoped>
.about-container
  min-height 100vh
  background #0f172a
  padding-bottom 40px

.about-content
  max-width 800px
  margin 0 auto
  padding 40px 20px

.about-section
  background #1a2230
  border 1px solid #2b3444
  border-radius 12px
  padding 40px
  margin-top 20px

h1
  color #f8fafc
  font-size 32px
  font-weight 800
  margin-bottom 32px
  text-align center
  letter-spacing 0.05em

.story-section
  color #e5e7eb
  line-height 1.8
  font-size 16px

.intro
  font-size 18px
  font-weight 600
  color #3b82f6
  margin-bottom 24px
  text-align center
  line-height 1.7

.paragraph
  margin-bottom 20px
  color #cbd5e1
  line-height 1.8
  
  &.sub
    font-style italic
    color #94a3b8
    margin-left 24px
    border-left 3px solid #3b82f6
    padding-left 16px

.conclusion
  margin-top 32px
  font-size 18px
  font-weight 700
  color #f8fafc
  text-align center
  letter-spacing 0.03em

// Mobile responsive styles
@media (max-width: 960px)
  .about-content
    padding 20px 16px

  .about-section
    padding 24px 20px

  h1
    font-size 24px
    margin-bottom 24px

  .intro
    font-size 16px

  .story-section
    font-size 15px

  .paragraph
    margin-bottom 16px
    
    &.sub
      margin-left 16px
      padding-left 12px

  .conclusion
    font-size 16px
    margin-top 24px
</style>

