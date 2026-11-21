import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // За замовчуванням — корінь домену (Render та інші хостинги).
    // Для GitHub Pages можна передати VITE_BASE_PATH=/home-appliance-store/.
    base: env.VITE_BASE_PATH || '/',
  }
})
