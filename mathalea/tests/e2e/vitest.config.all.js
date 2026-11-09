// une config particulière pour vitest, pour lancer les test/**/*.longtest.js
// cf https://vitest.dev/config/

import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: [
        './tests/interactivity/*.test.{js,ts}',
        './tests/console_errors/*.test.{js,ts}',
      ],
      // on veut laisser le navigateur ouvert sur un plantage (10min)
      hookTimeout: 600_000,
      testTimeout: 20_000_000,
    },
  }),
)
