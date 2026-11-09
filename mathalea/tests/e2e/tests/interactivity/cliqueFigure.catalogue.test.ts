import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import { runTest } from '../../helpers/run'

// Tous les exercices utilisant cliqueFiguresArray, y compris l'héritage.
async function clicsSurLesFiguresDuCatalogue(page: Page) {
  const port = process.env.PLAYWRIGHT_SERVER_PORT ?? '5173'
  const cas = [
    'uuid=e297b&n=4&s=1-2-3-3&alea=uSKK',
    'uuid=33c9a&n=3',
    'uuid=8ded2',
    'uuid=e9cac',
    'uuid=e9cad&n=2',
    'uuid=e9cae&n=2',
    'uuid=f57fe&s2=false&n=2',
    'uuid=f57fe&s2=true&n=2',
    'uuid=83763&n=3',
  ]
  for (const params of cas) {
    await page.goto(
      `http://localhost:${port}/alea/?${params}&i=1&v=eleve&es=111000110`,
    )
    const hosts = page.locator('clique-figure')
    const count = Number(new URLSearchParams(params).get('n') ?? 1)
    await expect(hosts).toHaveCount(count, { timeout: 60_000 })
    expect(count, params).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const host = hosts.nth(i)
      const config = JSON.parse((await host.getAttribute('figures'))!) as {
        id: string
        solution: boolean
      }[]
      expect(config.length, params).toBeGreaterThan(0)
      for (const { id, solution } of config) {
        const figure = page.locator(`[id="${id}"]`)
        await expect(figure, params).toHaveCount(1)
        await expect(figure, params).toHaveAttribute('aria-checked', 'false')
        await figure.click()
        await expect(figure, params).toHaveAttribute('aria-checked', 'true')
        await figure.click()
        await expect(figure, params).toHaveAttribute('aria-checked', 'false')
        if (solution) await figure.click()
      }
    }
    await page
      .getByRole('button', { name: /Vérifier/i })
      .first()
      .click()
    for (let i = 0; i < count; i++) {
      await expect(
        page.locator(`#resultatCheckEx0Q${i}`),
        params,
      ).toHaveAttribute('aria-label', 'Bonne réponse.')
    }
  }
  return true
}

runTest(clicsSurLesFiguresDuCatalogue, import.meta.url, {
  headless: true,
  pauseOnError: false,
})

// Les autres moteurs de sélection portent leurs contrôles dans l'énoncé.
async function clicsSurLesAutresFormatsDeFigures(page: Page) {
  const port = process.env.PLAYWRIGHT_SERVER_PORT ?? '5173'
  const cas = [
    ['4000d', 'points-cliquables', '[data-points-cliquables-host]'],
    ['07f8a', 'points-cliquables', '[data-points-cliquables-host]'],
    ['2a611', 'points-cliquables', '[data-points-cliquables-host]'],
    ['a2582', 'points-cliquables', '[data-points-cliquables-host]'],
    ['40d57', 'objets-cliquables', '[data-objets-cliquables-host]'],
    ['1574a', 'svg-selection', 'svg-selection button'],
    ['1574f', 'svg-selection', 'svg-selection button'],
    ['1474f', 'svg-selection', 'svg-selection button'],
  ]
  for (const [uuid, tag, selector] of cas) {
    await page.goto(
      `http://localhost:${port}/alea/?uuid=${uuid}&n=1&i=1&alea=5bRC&v=eleve&es=111000110`,
    )
    const host = page.locator(tag).first()
    const target = page.locator(selector).first()
    await expect(target, uuid).toBeVisible({ timeout: 60_000 })
    const initial = await host.evaluate(
      (el) => (el as HTMLElement & { value: string }).value,
    )
    await target.click()
    await expect
      .poll(
        () =>
          host.evaluate((el) => (el as HTMLElement & { value: string }).value),
        { message: uuid },
      )
      .not.toEqual(initial)
    await target.click()
    await expect
      .poll(
        () =>
          host.evaluate((el) => (el as HTMLElement & { value: string }).value),
        { message: uuid },
      )
      .toEqual(initial)
  }
  return true
}

runTest(clicsSurLesAutresFormatsDeFigures, import.meta.url, {
  headless: true,
  pauseOnError: false,
})
