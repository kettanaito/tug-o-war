import { defineConfig } from 'vitest/config'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: './test/environments/vitest-environment-node-websocket.ts',
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
  plugins: [tsconfigPathsPlugin()],
})
