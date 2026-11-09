import process from 'node:process'
import { DefaultReporter } from 'vitest/node'

export class ConsoleErrorsReporter extends DefaultReporter {
  printErrorsSummary(files, errors) {
    if (process.env.DEBUG === '1') {
      super.printErrorsSummary(files, errors)
      return
    }
    if (errors.length) {
      this.ctx.logger.printUnhandledErrors(errors)
      this.error()
    }
  }
}
