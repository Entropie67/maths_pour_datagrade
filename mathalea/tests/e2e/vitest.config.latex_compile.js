import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        testBrowser: resolve(__dirname, 'e2e'),
      },
    },
    test: {
      include: ['./tests/latex_compile/*.test.{js,ts}'],
      environment: 'jsdom',
      hookTimeout: 600_000,
      testTimeout: 7_200_000,
      pool: 'threads',
      maxWorkers: 1,
      isolate: false,
      disableConsoleIntercept: true,
    },
  }),
)
