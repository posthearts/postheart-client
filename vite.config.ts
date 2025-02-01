import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': '/src',
      "@/UI": '/src/components/UI',
    }
  },
  build: {
    target: 'es2020'
  },
  esbuild: {
    drop: ['console']
  }
})
