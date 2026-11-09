// Contrôle informatif de l'accessibilité des exercices modifiés.

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
      include: ['./tests/accessibilite/*.test.ts'],
      exclude: [],
      environment: 'jsdom',
      hookTimeout: 600_000,
      testTimeout: 20_000_000,
      pool: 'threads',
      maxWorkers: 1,
      isolate: false,
      disableConsoleIntercept: true,
      // Une erreur asynchrone d'un exercice ne doit pas faire échouer un rapport.
      dangerouslyIgnoreUnhandledErrors: true,
      reporters: ['default'],
    },
  }),
)
