import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { resolve } from 'path'
import {fileURLToPath, URL} from "url";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 支持 pug 模板
        }
      }
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    Components({
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  css: {
    preprocessorOptions: {
      stylus: {
        // 移除全局变量导入，改为在组件中直接使用
      }
    }
  },
  optimizeDeps: {
    include: ['stylus', 'buffer']
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  }
})
