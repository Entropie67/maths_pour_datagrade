import { resolve } from 'node:path'
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

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
      include: ['./tests/pdfexports/*.test.{js,ts}'],
      exclude: ['./tests/pdfexports/pdfexport.moule.test.ts'],
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          url: 'http://localhost:80/alea/',
        },
      },
      hookTimeout: 120_000,
      testTimeout: 18_000_000,
      reporters: ['html', 'junit', 'json', 'default'],
      outputFile: {
        junit: './logs/junit-report.xml',
        json: './logs/json-report.json',
        html: './logs/testconsole.html',
      },
      pool: 'forks',
      maxWorkers: 1,
      minWorkers: 1,
      fileParallelism: false,
      isolate: false,
      disableConsoleIntercept: true,
    },
  }),
)
