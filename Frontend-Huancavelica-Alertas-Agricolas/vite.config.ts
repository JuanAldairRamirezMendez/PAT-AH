import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Para usar __dirname en ES modules
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    // Habilitar PWA sólo cuando la variable de entorno VITE_ENABLE_PWA sea 'true'
    plugins: [
        react(),
        ...(process.env.VITE_ENABLE_PWA === 'true'
            ? [
                  VitePWA({
                      registerType: 'autoUpdate',
                      manifestFilename: 'manifest.webmanifest',
                      includeAssets: [
                          'favicon.ico',
                          'apple-touch-icon.png',
                          'android-chrome-192x192.png',
                          'android-chrome-512x512.png'
                      ],
                      manifest: {
                          name: 'Huancavelica Alertas Agrícolas',
                          short_name: 'Alertas',
                          description: 'Alertas agrícolas para Huancavelica',
                          theme_color: '#ffffff',
                          background_color: '#ffffff',
                          display: 'standalone',
                          scope: '/',
                          start_url: '/',
                          icons: [
                              { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                              { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                              { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
                          ]
                      },
                      workbox: {
                          runtimeCaching: [
                              {
                                  urlPattern: /^https:\/\/.+\/.*/i,
                                  handler: 'NetworkFirst',
                                  options: {
                                      cacheName: 'api-cache',
                                      expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }
                                  }
                              },
                              {
                                  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                                  handler: 'CacheFirst',
                                  options: {
                                      cacheName: 'image-cache',
                                      expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }
                                  }
                              }
                          ]
                      },
                      // Desactivar opciones PWA en modo dev para evitar interferencias en entornos preview
                      devOptions: {
                          enabled: false
                      }
                  })
              ]
            : [])
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            'vaul@1.1.2': 'vaul',
            'sonner@2.0.3': 'sonner',
            'recharts@2.15.2': 'recharts',
            'react-resizable-panels@2.1.7': 'react-resizable-panels',
            'react-hook-form@7.55.0': 'react-hook-form',
            'react-day-picker@8.10.1': 'react-day-picker',
            'next-themes@0.4.6': 'next-themes',
            'lucide-react@0.487.0': 'lucide-react',
            'input-otp@1.4.2': 'input-otp',
            'embla-carousel-react@8.6.0': 'embla-carousel-react',
            'cmdk@1.1.1': 'cmdk',
            'class-variance-authority@0.7.1': 'class-variance-authority',
            '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
            '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
            '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
            '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
            '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
            '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
            '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
            '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
            '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
            '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
            '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
            '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
            '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
            '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
            '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
            '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
            '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
            '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
            '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
            '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
            '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
            '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        target: 'esnext',
        outDir: 'dist',
        // OPTIMIZACIONES PARA REDES LENTAS:
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separa en archivos más pequeños para carga progresiva
                    'react-vendor': ['react', 'react-dom'],
                    'ui-vendor': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-tooltip',
                        '@radix-ui/react-select'
                    ],
                    'charts-vendor': ['recharts'],
                    'forms-vendor': ['react-hook-form', 'react-day-picker'],
                    'utils-vendor': ['lucide-react', 'cmdk', 'class-variance-authority']
                },
                // Optimiza nombres de archivos para cache
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        // MEJORA PARA PRODUCCIÓN:
        minify: 'terser',
        // EVITA RUIDO EN CONSOLA:
        reportCompressedSize: false,
    },
    server: {
        port: 3000,
        open: true,
    },
    // Esto ayuda con los archivos en public/
    publicDir: 'public',
});