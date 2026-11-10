import type { Page } from 'playwright'
import { expect } from 'vitest'
import { getFileLogger, log as lg, logIfVerbose } from '../../helpers/log'
import prefs from '../../helpers/prefs.js'
import { inputAnswerById, runTest } from '../../helpers/run'

const logConsole = getFileLogger('viewtest', { append: true })

function log(...args: unknown[]) {
  lg(args)
  logConsole(args)
}

async function clickWithFallback(page: Page, selector: string) {
  const locator = page.locator(selector)
  await locator.waitFor({ state: 'visible', timeout: 30000 })
  try {
    await locator.click({ timeout: 60000 })
  } catch {
    await page.evaluate((sel) => {
      const element = document.querySelector<HTMLElement>(sel)
      if (!element) throw new Error(`Element not found: ${sel}`)
      element.click()
    }, selector)
  }
}

async function ensureFieldVisible(page: Page, fieldId: string) {
  const selector = `#champTexteEx${fieldId}`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.waitForSelector(selector, { timeout: 2000 })
      return
    } catch {
      await clickWithFallback(page, '.bxs-chevron-right')
      await page.waitForTimeout(150)
    }
  }
  await page.waitForSelector(selector, { timeout: 10000 })
}

async function testCanView(page: Page) {
  await page.setDefaultTimeout(1_500_000) // Set timeout to 500 seconds
  log('===========================================================')
  log('===           TEST VUE CAN 2024       =====================')
  log('===========================================================')
  logIfVerbose("Chargement de l'url")
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  await page.goto(hostname + '?uuid=94d21&alea=hqk0&s=1')
  logIfVerbose('Clique sur le lien vue élève (config)')
  await page
    .locator('[data-tip="Lien pour les élèves"]')
    .getByRole('button')
    .click()
  // await page.getByRole('button', { name: 'Lien pour les élèves  ' }).click()
  logIfVerbose('Configuration de la can (2024 2e)')
  await page.getByRole('tab', { name: 'Course aux nombres' }).click()
  logIfVerbose('tab->Course aux nombres')
  const solutionsAccessToggle = page
    .locator('input#input-config-eleve-solutions-can-toggle')
    .first()
  if (!(await solutionsAccessToggle.isChecked())) {
    await solutionsAccessToggle.click()
  }
  logIfVerbose('Accès aux solutions->à la fin')
  await page
    .locator('input#config-eleve-can-duration-input[type="number"]')
    .fill('10')
  logIfVerbose('Les questions seront posées->10min')

  const page1Promise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Visualiser' }).click()
  const page1 = await page1Promise
  // await page1.goto('http://localhost:5173/alea/?uuid=94d21&v=can&canD=10&canT=2024&canSA=true&canSM=gathered&canI=true')
  logIfVerbose('clique sur démarrer')
  await page1.getByRole('button', { name: ' Démarrer' }).click()
  logIfVerbose('On attend le time-display-1')
  await page1.waitForSelector('#time-display-1')
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--0').click()
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q2', 'x^2+11x+28')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q3', '22/7')
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--6').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--6').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--1').click()
  await page1.locator('.key--2').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--6').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--3').click()
  await page1.locator('.key--6').click()
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q10', '17/3')
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--2').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--6').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--6').click()
  await page1.locator('.bxs-chevron-right').click()
  // QCM : obliger de ragarder les labels
  const label = await page1.locator('#labelEx0Q13R0').innerText()
  if (label.includes('99')) {
    await page1.locator('#checkEx0Q13R0').click()
  } else {
    await page1.locator('#checkEx0Q13R1').click()
  }
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--1').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--4').click()
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q16', '3/4')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q17', '5,4 * 10^4')
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--1').click()
  await page1.locator('.key--2').click()
  await page1.locator('.bxs-chevron-right').click()
  await ensureFieldVisible(page1, '0Q19')
  await inputAnswerById(page1, '0Q19', '-16')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q20', '5/2')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q21', '1/2')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q22', '-2')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q23', '5;15')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q24', 'x^2-8x+16')
  await page1.locator('.bxs-chevron-right').click()
  await ensureFieldVisible(page1, '0Q25')
  await inputAnswerById(page1, '0Q25', '(x-5)(x+5)')
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q26', '19/31')
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--2').click()
  await page1.locator('.bxs-chevron-right').click()
  await page1.locator('.key--3').click()
  await page1.locator('.bxs-chevron-right').click()
  await inputAnswerById(page1, '0Q29', '[-5;2]')
  await page1.locator('.bxs-chevron-right').click()
  await page1.getByRole('button', { name: 'Terminer et enregistrer les résultats' }).click()
  await page1
    .getByRole('dialog')
    .getByRole('button', { name: 'Terminer et enregistrer les résultats' })
    .click()
  logIfVerbose('Accéder aux solutions')
  await page1.getByRole('button', { name: 'Accéder aux solutions' }).click()
  await page1.locator('.bx-toggle-right').click({ button: 'right' })
  logIfVerbose(await page1.locator('#score:first-child > span').innerText())
  logIfVerbose(await page1.locator('#answer-28').innerText())
  logIfVerbose(await page1.locator('#answer-12').innerText())

  for (let i = 0; i < 30; i++) {
    const icon4 = await page1.locator(
      `#can-solutions > li:nth-child(${i + 1}) > div > div > button > i`,
    )
    const classList = (await icon4.getAttribute('class')) || ''
    if (classList.includes('text-green-500') === false) {
      logIfVerbose('classList:', classList)
      logIfVerbose(
        await page1
          .locator(`#can-solutions > li:nth-child(${i + 1})`)
          .innerText(),
      )
      logIfVerbose(`Réponse ${i + 1} Incorrecte`)
    }
    expect(classList).toContain('text-green-500')
  }
  // await page1.pause()
  expect(await page1.locator('#score:first-child > span').innerText()).toBe(
    '30/30',
  )
  expect(await page1.locator('#answer-28').innerText()).toBe('3{3}3')
  expect(await page1.locator('#answer-12').innerText()).toBe('6{6}6')
  // await page1.waitForTimeout(5 * 60 * 1000)
  return true
}

async function testEleveView(page: Page) {
  await page.setDefaultTimeout(500_000) // Set timeout to 500 seconds

  log('===========================================================')
  log('===      TEST VUE ELEVE PRESENTATION 0 2024 ===============')
  log('===========================================================')
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  await page.goto(hostname + '?uuid=94d21&alea=hqk0&s=1', { timeout: 200_000 })
  logIfVerbose("Chargement de l'url:" + hostname + '?uuid=94d21&alea=hqk0&s=1')
  logIfVerbose('Clique sur le lien vue élève (config)')
  await page
    .locator('[data-tip="Lien pour les élèves"]')
    .getByRole('button')
    .click()
  // await page.getByRole('button', { name: 'Lien pour les élèves  ' }).click()
  logIfVerbose('Configuration de la can (2024 2e)')
  await page.locator('#presentation0').click()
  await page.locator('#Interactif1').first().click()
  const page1Promise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Visualiser' }).click()
  const page1 = await page1Promise
  logIfVerbose('#champTexteEx0Q0')
  await page1.waitForSelector('#champTexteEx0Q0', { timeout: 50000 })
  await page1.locator('#champTexteEx0Q0').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q0', '10')
  await page1.locator('#champTexteEx0Q1').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--0').click()
  await inputAnswerById(page1, '0Q2', 'x^2+11x+28')
  await inputAnswerById(page1, '0Q3', '22/7')
  await page1.locator('#champTexteEx0Q4').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--6').click()
  await page1.locator('#champTexteEx0Q5').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--0').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--6').click()
  await page1.locator('#champTexteEx0Q6').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--2').click()
  await page1.locator('#champTexteEx0Q7').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1.locator('#champTexteEx0Q8').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--6').click()
  await page1.locator('#champTexteEx0Q9').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--3').click()
  await page1.locator('.key--6').click()
  await page1.locator('#champTexteEx0Q10').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q10', '17/3')
  await page1.locator('#champTexteEx0Q11').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--2').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--6').click()
  await page1.locator('#champTexteEx0Q12').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--6').click()
  // QCM : obliger de ragarder les labels
  const label = await page1.locator('#labelEx0Q13R0').innerText()
  if (label.includes('99')) {
    await page1.locator('#checkEx0Q13R0').click()
  } else {
    await page1.locator('#checkEx0Q13R1').click()
  }
  await page1.locator('#champTexteEx0Q14').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--1').click()
  await page1.locator('#champTexteEx0Q15').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--4').click()
  await page1.locator('#champTexteEx0Q16').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q16', '3/4')
  await page1.locator('#champTexteEx0Q17').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q17', '5,4 * 10^4')
  await page1.locator('#champTexteEx0Q18').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--2').click()
  await page1.locator('#champTexteEx0Q19').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q19', '-16')
  await page1.locator('#champTexteEx0Q20').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q20', '5/2')
  await page1.locator('#champTexteEx0Q21').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q21', '1/2')
  await page1.locator('#champTexteEx0Q22').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q22', '-2')
  await page1.locator('#champTexteEx0Q23').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q23', '5;15')
  await page1.locator('#champTexteEx0Q24').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q24', 'x^2-8x+16')
  await page1.locator('#champTexteEx0Q25').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q25', '(x-5)(x+5)')
  await page1.locator('#champTexteEx0Q26').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q26', '19/31')
  await page1.locator('#champTexteEx0Q27').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--2').click()
  await page1.locator('#champTexteEx0Q28').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--3').click()
  await page1.locator('#champTexteEx0Q29').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q29', '[-5;2]')
  await page1.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  logIfVerbose('Vérifier les questions')
  await clickWithFallback(page1, '#buttonScoreEx0')
  await page1.waitForSelector('#consigne0-29 + div', { timeout: 100_000 })
  await page1.waitForTimeout(500)
  const buttonResult = await page1.locator('#consigne0-29 + div').innerText()
  expect('30 / 30').toEqual(buttonResult)
  logIfVerbose(buttonResult)

  return true
}

async function testEleveViewPre2(page: Page) {
  await page.setDefaultTimeout(500_000) // Set timeout to 500 seconds

  log('===========================================================')
  log('===   TEST VUE ELEVE Presentation 3 2024 ==================')
  log('===========================================================')
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  await page.goto(hostname + '?uuid=94d21&alea=hqk0&s=1', { timeout: 200_000 })
  logIfVerbose("Chargement de l'url:" + hostname + '?uuid=94d21&alea=hqk0&s=1')
  logIfVerbose('Clique sur le lien vue élève (config)')
  // await page.getByRole('button', { name: 'Lien pour les élèves  ' }).click()
  await page
    .locator('[data-tip="Lien pour les élèves"]')
    .getByRole('button')
    .click()
  logIfVerbose('Configuration de la can (2024 2e)')
  await page.locator('#presentation2').click()
  await page.locator('#Interactif1').first().click()
  const page1Promise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Visualiser' }).click()
  const page1 = await page1Promise
  await inputAnswerById(page1, '0Q0', '10')
  await page1
    .locator('#exercice0Q0')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID20 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID21').click()
  await page1.locator('#champTexteEx0Q1').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--0').click()
  await page1
    .locator('#exercice0Q1')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID21 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID22').click()
  await inputAnswerById(page1, '0Q2', 'x^2+11x+28')
  await page1
    .locator('#exercice0Q2')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID22> div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID23').click()
  await inputAnswerById(page1, '0Q3', '22/7')
  await page1
    .locator('#exercice0Q3')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID23 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID24').click()
  await page1.locator('#champTexteEx0Q4').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--6').click()
  await page1
    .locator('#exercice0Q4')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID24 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID25').click()
  await page1.locator('#champTexteEx0Q5').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--0').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--6').click()
  await page1
    .locator('#exercice0Q5')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID25 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID26').click()
  await page1.locator('#champTexteEx0Q6').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--2').click()
  await page1
    .locator('#exercice0Q6')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID26 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID27').click()
  await page1.locator('#champTexteEx0Q7').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1
    .locator('#exercice0Q7')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID27 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID28').click()
  await page1.locator('#champTexteEx0Q8').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--6').click()
  await page1
    .locator('#exercice0Q8')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID28 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID29').click()
  await page1.locator('#champTexteEx0Q9').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--3').click()
  await page1.locator('.key--6').click()
  await page1
    .locator('#exercice0Q9')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID29 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID210').click()
  await page1.locator('#champTexteEx0Q10').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q10', '17/3')
  await page1
    .locator('#exercice0Q10')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID210 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID211').click()
  await page1.locator('#champTexteEx0Q11').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--2').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--6').click()
  await page1
    .locator('#exercice0Q11')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID211 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID212').click()
  await page1.locator('#champTexteEx0Q12').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--6').click()
  await page1
    .locator('#exercice0Q12')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID212 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID213').click()
  // QCM : obliger de ragarder les labels
  const label = await page1.locator('#labelEx0Q13R0').innerText()
  if (label.includes('99')) {
    await page1.locator('#checkEx0Q13R0').click()
  } else {
    await page1.locator('#checkEx0Q13R1').click()
  }
  await page1
    .locator('#exercice0Q13')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID213 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID214').click()
  await page1.locator('#champTexteEx0Q14').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--0').click()
  await page1.locator('.key--COMMA').click()
  await page1.locator('.key--1').click()
  await page1
    .locator('#exercice0Q14')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID214 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID215').click()
  await page1.locator('#champTexteEx0Q15').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--4').click()
  await page1
    .locator('#exercice0Q15')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID215 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID216').click()
  await page1.locator('#champTexteEx0Q16').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q16', '3/4')
  await page1
    .locator('#exercice0Q16')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID216 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID217').click()
  await page1.locator('#champTexteEx0Q17').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q17', '5,4 * 10^4')
  await page1
    .locator('#exercice0Q17')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID217 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID218').click()
  await page1.locator('#champTexteEx0Q18').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--1').click()
  await page1.locator('.key--2').click()
  await page1
    .locator('#exercice0Q18')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID218 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID219').click()
  await page1.locator('#champTexteEx0Q19').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q19', '-16')
  await page1
    .locator('#exercice0Q19')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID219 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID220').click()
  await page1.locator('#champTexteEx0Q20').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q20', '5/2')
  await page1
    .locator('#exercice0Q20')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID220 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID221').click()
  await page1.locator('#champTexteEx0Q21').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q21', '1/2')
  await page1
    .locator('#exercice0Q21')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID221 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID222').click()
  await page1.locator('#champTexteEx0Q22').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q22', '-2')
  await page1
    .locator('#exercice0Q22')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID222 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID223').click()
  await page1.locator('#champTexteEx0Q23').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q23', '5;15')
  await page1
    .locator('#exercice0Q23')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID223 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID224').click()
  await page1.locator('#champTexteEx0Q24').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q24', 'x^2-8x+16')
  await page1
    .locator('#exercice0Q24')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID224 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID225').click()
  await page1.locator('#champTexteEx0Q25').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q25', '(x-5)(x+5)')
  await page1
    .locator('#exercice0Q25')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID225 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID226').click()
  await inputAnswerById(page1, '0Q26', '19/31')
  await page1
    .locator('#exercice0Q26')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID226 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID227').click()
  await page1.locator('#champTexteEx0Q27').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--2').click()
  await page1
    .locator('#exercice0Q27')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID227 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID228').click()
  await page1.locator('#champTexteEx0Q28').focus()
  await page1.waitForTimeout(100)
  await page1.locator('.key--3').click()
  await page1
    .locator('#exercice0Q28')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID228 > div > .bg-coopmaths-warn')
    .isVisible()
  await page1.locator('#questionTitleID229').click()
  await page1.locator('#champTexteEx0Q29').focus()
  await page1.waitForTimeout(100)
  await inputAnswerById(page1, '0Q29', '[-5;2]')
  await page1
    .locator('#exercice0Q29')
    .getByRole('button', { name: 'Vérifier' })
    .click()
  await page1
    .locator('#questionTitleID229 > div > .bg-coopmaths-warn')
    .isVisible()
  logIfVerbose('Fin des questions')
  return true
}

const local = true
if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(testCanView, import.meta.url, { pauseOnError: false })
  runTest(testEleveView, import.meta.url, { pauseOnError: false })
  runTest(testEleveViewPre2, import.meta.url, { pauseOnError: false })
} else {
  prefs.headless = false
  runTest(testCanView, import.meta.url, { pauseOnError: true })
  runTest(testEleveView, import.meta.url, { pauseOnError: true })
  runTest(testEleveViewPre2, import.meta.url, { pauseOnError: true })
}
