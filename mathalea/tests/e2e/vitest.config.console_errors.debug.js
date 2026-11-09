// Config dédiée au debug local du test console_errors (avec navigateur visible)
// cf https://vitest.dev/config/

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
      include: ['./tests/console_errors/*.debug.test.{js,ts}'],
      exclude: [],
      hookTimeout: 600_000,
      testTimeout: 20_000_000,
      reporters: ['html', 'junit', 'json', 'default'],
      outputFile: {
        junit: './logs/junit-report.debug.xml',
        json: './logs/json-report.debug.json',
        html: './logs/testconsole.debug.html',
      },
      pool: 'threads',
      maxWorkers: 1,
      isolate: false,
    },
  }),
)
