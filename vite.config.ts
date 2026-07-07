import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from aaaver-app as a static site at /craws/ —
// base must match the sites/<slug>/ folder name exactly.
export default defineConfig({
  base: '/craws/',
  plugins: [react(), tailwindcss()],
})
