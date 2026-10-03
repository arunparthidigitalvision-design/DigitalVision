import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // <--- Change this to your preferred port number
    strictPort: true // (Optional) If true, Vite will fail if port 3000 is already in use instead of automatically picking another one
  }
})