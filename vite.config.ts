import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
  },
  preview: {
    port: 8080,
  },
  base: '/',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libs
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-slider',
            '@radix-ui/react-label',
            '@radix-ui/react-separator',
            '@radix-ui/react-scroll-area'
          ],
          // Image processing
          'image-vendor': ['konva', 'react-konva', 'react-easy-crop'],
          // PDF processing
          'pdf-vendor': ['pdf-lib', 'pdfjs-dist', 'pdfmake'],
          // Heavy utilities
          'utils-vendor': [
            'lucide-react',
            'fuse.js',
            'zustand', 
            'js-cookie',
            'uuid',
            'crypto-js',
            'jsbarcode',
            'qrcode'
          ],
          // DnD and interactions
          'interaction-vendor': [
            'react-beautiful-dnd',
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/modifiers'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable gzip compression awareness
    target: 'esnext',
    minify: 'esbuild',
    // Reduce bundle size
    cssCodeSplit: true,
    sourcemap: false // Disable sourcemaps in production
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'zustand',
      'js-cookie'
    ]
  }
}));
