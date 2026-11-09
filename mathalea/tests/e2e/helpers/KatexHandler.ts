/**
 * Pilotage d'un span Katex dans le DOM
 * @class
 */
import type { Locator, Page } from 'playwright'
import { clean } from './text'
import type { Question } from './types'

export class KatexHandler {
  page: Page
  question: Question
  index: number
  locator: Locator | null
  /**
   *
   * @param {question} Question
   * @param {string} selector
   * @param {number} index
   * @param {Locator} has
   * @param {string} hasText
   */
  constructor(
    page: Page,
    question: Question,
    {
      selector,
      index,
      has,
      hasText,
    }: {
      has?: Locator | undefined
      hasText?: string
      index?: number
      selector?: string
    } = { selector: '' },
  ) {
    this.question = question
    this.index = index ?? 0
    this.locator = null
    this.page = page
    if (selector == null) {
      selector = ''
    }
    // on cherche notre input dans le dom
    if (selector) selector += ' '
    selector += 'span.katex-mathml'
    if (has || hasText) {
      /**
       * Le conteneur de l'input
       * @type {Locator}
       */
      this.locator = this.question.locator
        .locator(selector, { has, hasText })
        .first()
    } else {
      this.locator = this.question.locator.locator(selector).nth(this.index)
    }
  }

  /**
   * Récupère les fractions du span katex
   * @return Promise<{ num: string, den: string }[]>
   */
  async getFraction() {
    if (this.locator != null) {
      const latex = (await this.locator
        .locator('annotation')
        .first()
        .textContent())!.slice(1, -1)
      const [num, den] = latex
        .split('\\dfrac{')[1]
        .split('}')
        .map((s) => s.replace('{', ''))
        .map((s) => s.replaceAll('\\,', ''))

      console.log(`getFraction : ${latex} => ${num}/${den}`)
      return {
        num: `${latex.startsWith('-') ? '-' + num.replaceAll('\\,', '') : num.replaceAll('\\,', '')}`,
        den: den.replaceAll('\\,', ''),
      }
    }
  }

  /**
   * Récupère les fractions du span katex
   * @return Promise<{ num: string, den: string }[]>
   */
  async getExpression() {
    if (this.locator != null) {
      return clean(await this.locator.innerText(), [])
    }
  }
}
