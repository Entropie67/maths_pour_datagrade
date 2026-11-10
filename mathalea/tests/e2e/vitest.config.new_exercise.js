import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const arg = process.argv[2]

console.log('Running newExercise test with', arg)

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        testBrowser: resolve(__dirname, 'e2e'),
      },
    },
    test: {
      include: ['./tests/test_exercice/testExercice.test.{js,ts}'],
      hookTimeout: 1200_000,
      testTimeout: 20_000_000,
      pool: 'threads',
      maxWorkers: 1,
      isolate: false,
    },
  }),
)
