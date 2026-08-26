import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages 는 https://<계정>.github.io/test/ 처럼 하위 경로로 서비스된다.
// 그래서 빌드할 때만 base 를 '/test/' 로 두고, 개발 서버는 그냥 루트를 쓴다.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/test/' : '/',
  plugins: [react(), tailwindcss()],
}))
