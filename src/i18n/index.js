import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

// 从 localStorage 获取用户语言偏好，默认为英文
const getDefaultLocale = () => {
  const saved = localStorage.getItem('locale')
  if (saved && (saved === 'en' || saved === 'zh')) {
    return saved
  }
  // 根据浏览器语言自动检测
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
})

export default i18n

