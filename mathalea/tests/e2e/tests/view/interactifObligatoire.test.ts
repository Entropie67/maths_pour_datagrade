import type { Page } from 'playwright'
import { expect } from 'vitest'
import { runTest } from '../../helpers/run'

async function test(page: Page) {
  const url = 'http://localhost:5173/alea/?uuid=424b2&i=0'
  const labyrintheSelector = 'mathalea-labyrinthe#labyrintheEx0Q0'

  await page.goto(url)
  await page.locator(labyrintheSelector).waitFor()
  await page.waitForFunction(
    (selector) =>
      Boolean(
        (
          document.querySelector(selector) as
            | (HTMLElement & { ready?: boolean })
            | null
        )?.ready,
      ),
    labyrintheSelector,
  )
  expect(
    await page
      .locator(
        'button[data-tip="Rendre interactif"], button[data-tip="Désactiver l\'interactivité"]',
      )
      .count(),
  ).toBe(0)
  await page.waitForTimeout(3000)
  expect(new URL(page.url()).searchParams.get('i')).toBe('1')
  const seed = new URL(page.url()).searchParams.get('alea')

  await page
    .getByRole('button', { name: 'Montrer la correction' })
    .click()
  await page.locator('#correction-exo0-Q0').waitFor()
  expect(new URL(page.url()).searchParams.get('alea')).toBe(seed)

  await page.goto(`${url}&v=eleve&es=021100`)
  await page.locator(labyrintheSelector).waitFor()
  await page.waitForFunction(
    (selector) =>
      Boolean(
        (
          document.querySelector(selector) as
            | (HTMLElement & { ready?: boolean })
            | null
        )?.ready,
      ),
    labyrintheSelector,
  )
  expect(
    await page
      .locator(
        'button[data-tip="Rendre interactif"], button[data-tip="Désactiver l\'interactivité"]',
      )
      .count(),
  ).toBe(0)
  return true
}

runTest(test, import.meta.url, { pauseOnError: true })
