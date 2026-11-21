import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    // Ouvre le navigateur au lancement de `npm run dev` (comme dans Three.js Journey)
    open: true,
  },
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
  },
})
