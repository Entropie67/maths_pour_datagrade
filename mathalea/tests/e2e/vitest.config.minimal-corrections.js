// Contrôle des réponses courtes des exercices modifiés et du corpus #9651.

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
      workerThreads: {
        memoryLimit: '4096',
      },
      include: ['./tests/minimalCorrections/*.test.ts'],
      exclude: [],
      environment: 'jsdom',
      hookTimeout: 600_000,
      testTimeout: 20_000_000,
      pool: 'threads',
      maxWorkers: 1,
      isolate: false,
      disableConsoleIntercept: true,
      reporters: ['default'],
    },
  }),
)
