import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The 3D physics engine is big; it's loaded separately so this is fine
  build: { chunkSizeWarningLimit: 3500 },
})
