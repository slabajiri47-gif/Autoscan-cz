import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone'

  return {
    plugins: [react(), ...(standalone ? [viteSingleFile()] : [])],
    build: {
      assetsInlineLimit: standalone ? 100_000_000 : 4_096,
      chunkSizeWarningLimit: standalone ? 5_000 : 700,
      sourcemap: false,
    },
    server: { port: 5173 },
  }
})
