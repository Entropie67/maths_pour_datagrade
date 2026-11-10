import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright'
import { runTest } from '../../helpers/run'

// AUTOTEST=true PLAYWRIGHT_SERVER_PORT=<port> pnpm exec vitest --config
// tests/e2e/vitest.config.interactivity.js --run cliqueFigure.accessible
async function tabulerVers(page: Page, cible: Locator) {
  for (let i = 0; i < 100; i++) {
    if (await cible.evaluate((element) => element === document.activeElement))
      return
    await page.keyboard.press('Tab')
  }
  throw new Error('La cible est inaccessible par tabulation.')
}

async function figuresAuClavier(page: Page) {
  const port = process.env.PLAYWRIGHT_SERVER_PORT ?? '5173'
  await page.goto(`http://localhost:${port}/alea/?uuid=83763&i=1&n=3&alea=5bRC`)
  const figures = page.locator('[data-clique-figure]')
  await expect(figures).toHaveCount(12, { timeout: 60_000 })
  const selections: string[] = []
  for (let i = 0; i < 3; i++) {
    const host = page.locator(`clique-figure[question-index="${i}"]`).first()
    const config = JSON.parse((await host.getAttribute('figures'))!) as {
      id: string
      solution: boolean
    }[]
    selections.push(config.find((figure) => figure.solution === (i !== 1))!.id)
  }

  await tabulerVers(page, figures.first())
  for (let i = 0; i < 12; i++) {
    const figure = figures.nth(i)
    await expect(figure).toBeFocused()
    await expect(figure).toHaveRole('checkbox')
    await expect(figure).toHaveAccessibleName(
      new RegExp(`^Figure ${(i % 4) + 1}\\.`),
    )
    await expect(figure).toHaveAttribute('aria-checked', 'false')
    expect(
      await figure.evaluate((el) => getComputedStyle(el).boxShadow),
    ).not.toBe('none')
    if (selections.includes((await figure.getAttribute('id'))!)) {
      const scrollAvant = await page.evaluate(() => window.scrollY)
      await page.keyboard.press('Space')
      await expect(figure).toHaveAttribute('aria-checked', 'true')
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollAvant)
      await page.keyboard.press('Enter')
      await expect(figure).toHaveAttribute('aria-checked', 'false')
      await page.keyboard.press('Enter')
      await expect(figure).toHaveAttribute('aria-checked', 'true')
    }
    if (i < 11) await page.keyboard.press('Tab')
  }
  await page.keyboard.press('Shift+Tab')
  await expect(figures.nth(10)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(figures.last()).toBeFocused()

  await tabulerVers(
    page,
    page.getByRole('button', { name: /Vérifier/ }).first(),
  )
  await page.keyboard.press('Enter')
  for (let i = 0; i < 3; i++) {
    await expect(page.locator(`#resultatCheckEx0Q${i}`)).toHaveAttribute(
      'aria-label',
      i === 1 ? 'Réponse incorrecte.' : 'Bonne réponse.',
    )
  }
  for (const figure of await figures.all()) {
    await expect(figure).toHaveAttribute('tabindex', '-1')
    await expect(figure).toHaveAttribute('aria-disabled', 'true')
  }
  return true
}

runTest(figuresAuClavier, import.meta.url, {
  headless: true,
  pauseOnError: false,
})
