import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../../vitest.config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['tests/integration/interactivity_all.test.ts'],
      testTimeout: 300_000,
      reporters: ['default', 'json'],
      outputFile: {
        json: 'tests/integration/logs/interactivity_all_results.json',
      },
      globalSetup: ['./tests/integration/globalSetup.js'],
    },
  }),
)
