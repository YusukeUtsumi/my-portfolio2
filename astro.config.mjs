// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';

// === GitHub Pages (project page) settings ===
// 公開URL: https://YusukeUtsumi.github.io/my-portfolio2
const site = 'https://YusukeUtsumi.github.io'; // 末尾スラなし
const base = '/my-portfolio2';                  // リポジトリ名

export default defineConfig({
  site: 'https://YusukeUtsumi.github.io',
  base: '/my-portfolio2',
  output: 'static',    // デフォルトだが明示
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});
