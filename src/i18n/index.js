import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

// 从 localStorage 获取用户语言偏好，默认为中文
const getDefaultLocale = () => {
  const saved = localStorage.getItem('locale')
  if (saved && (saved === 'en' || saved === 'zh')) {
    return saved
  }
  // 默认使用中文
  return 'zh'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh',
  messages: {
    en,
    zh
  }
})

export default i18n

