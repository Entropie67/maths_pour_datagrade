import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { afterEach, describe, expect, it, vi } from 'vitest'

const source = readFileSync(
  'public/assets/externalJs/moodle-bookmarklet.js',
  'utf8',
)

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style').forEach((style) => style.remove())
})

describe('Marque-page Moodle : création des questions', () => {
  it.each(['moodle', 'alea'])(
    'transmettre le mode %s et conserver l’ordre et les références',
    async (mode) => {
      document.body.innerHTML = `
      <div class="moodle-dialogue-base">
        <div class="moodle-dialogue-hd"></div>
        <div class="moodle-dialogue-bd">
          <form id="chooserform" action="/question/bank/editquestion/question.php">
            ${[
              'courseid',
              'cmid',
              'sesskey',
              'returnurl',
              'category',
              'addonpage',
            ]
              .map((name) => `<input name="${name}" value="1">`)
              .join('')}
          </form>
        </div>
      </div>`
      let onMessage: (event: { data: unknown }) => void = () => {}
      const reload = vi.fn()
      const fetch = vi.fn(
        async (_url: string, options?: { body: URLSearchParams }) => {
          if (options) return {}
          return {
            text: async () =>
              '<form action="question.php"><input name="sesskey" value="1"><input name="cancel" value="Annuler"></form>',
          }
        },
      )
      runInNewContext(source, {
        window: {
          define: { amd: true },
          addEventListener: (_type: string, listener: typeof onMessage) => {
            onMessage = listener
          },
        },
        document,
        fetch,
        URLSearchParams,
        setTimeout,
        location: { reload },
        console: { log: vi.fn(), error: vi.fn() },
      })
      const select = document.querySelector<HTMLSelectElement>(
        '#mathalea-bookmarklet-random',
      )!
      expect(select.value).toBe('moodle')
      select.value = mode
      onMessage({
        data: {
          action: 'mathalea:activityParams',
          exercices: [
            { id: '6N1', titre: 'Lire un entier', url: 'uuid=abc&s=2&n=3' },
            {
              id: '6N2',
              titre: 'Comparer des entiers',
              url: 'uuid=def&s=1&n=4',
            },
            // Compatibilité avec une page MathALÉA ne transmettant pas encore l'id.
            { titre: 'Ancien exercice', url: 'uuid=ghi' },
          ],
        },
      })
      await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce(), {
        timeout: 3000,
      })
      const submissions = fetch.mock.calls
        .filter((call) => call[1])
        .map((call) => call[1]!.body)
      expect(submissions.map((body) => body.get('name'))).toEqual([
        '6N1 - Lire un entier',
        '6N2 - Comparer des entiers',
        'Ancien exercice',
      ])
      for (const [index, body] of submissions.entries()) {
        const question = document.createElement('div')
        question.innerHTML = body.get('questiontext[text]')!
        const feedback = document.createElement('div')
        feedback.innerHTML = body.get('generalfeedback[text]')!
        const statement = question.querySelector('mathalea-moodle')!
        const correction = feedback.querySelector('mathalea-moodle')!
        expect(statement.getAttribute('graine')).toBe(
          mode === 'alea' ? '-1' : null,
        )
        expect(correction.getAttribute('graine')).toBe(
          statement.getAttribute('graine'),
        )
        expect(correction.hasAttribute('correction')).toBe(true)
        expect(statement.getAttribute('url')).toBe(
          ['uuid=abc&s=2&n=3', 'uuid=def&s=1&n=4', 'uuid=ghi'][index],
        )
        expect(body.get('answer[0]')).toBe('100|*')
        expect(body.get('fraction[0]')).toBe('1.0')
        expect(body.has('cancel')).toBe(false)
      }
    },
  )
})
