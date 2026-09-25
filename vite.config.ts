import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'समृद्धि AI — Scheme Matcher',
        short_name: 'SamriddhiAI',
        description: 'AI-Driven Scheme Matching for Marginalized Entrepreneurs',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Cache the core UI assets for instant offline loading
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // NetworkFirst for scheme filtering — works offline with cached data
            urlPattern: /\/api\/v1\/schemes\/filter/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'scheme-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }, // 24 hours
              networkTimeoutSeconds: 5, // Fall back to cache after 5s
            },
          },
          {
            // CacheFirst for Google Fonts (rarely change)
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 31536000 }, // 1 year
            },
          },
        ],
      },
    }),
  ],
})
