import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/icon.svg"],
      manifest: {
        name: "GutSense - Gut Health Companion",
        short_name: "GutSense",
        description: "Personalized gut health food analyzer powered by AI",
        theme_color: "#0d9488",
        background_color: "#f0fdf9",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable any",
          },
        ],
        categories: ["health", "food", "medical", "lifestyle"],
        shortcuts: [
          {
            name: "Check a Food",
            short_name: "Check Food",
            description: "Analyze a food item",
            url: "/check",
            icons: [{ src: "icons/icon.svg", sizes: "any" }],
          },
          {
            name: "View History",
            short_name: "History",
            description: "View food history",
            url: "/history",
            icons: [{ src: "icons/icon.svg", sizes: "any" }],
          },
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "View gut health dashboard",
            url: "/dashboard",
            icons: [{ src: "icons/icon.svg", sizes: "any" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: null,
        offlineGoogleAnalytics: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.groq\.com/,
            handler: "NetworkFirst",
            options: {
              cacheName: "groq-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
