import { expect } from '@playwright/test'
import { writeFileSync } from 'fs'
import path from 'path'
import type { Page } from 'playwright'
import { fileURLToPath } from 'url'
import { logError, logIfVerbose } from '../../helpers/log'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testV(page: Page) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const basePath = process.env.CI ? '/alea' : ''
  const origin = `http://localhost:${port}`
  const parentRoutePattern = '**/parent*'
  const parentUrl = `${origin}${basePath}/parent`
  const moduleMockRoutePattern = '**/modulemock.js*'
  const moduleMockScriptUrl = '/modulemock.js'
  const iframeUrl = `${origin}${basePath}/?recorder=capytale`

  // Mock the api call before navigating
  await page.route(parentRoutePattern, async (route) => {
    await route.fulfill({
      contentType: 'text/html',
      body: `<html>
      <body>
      bonjour
      <div style='height: 90%;'>
      <iframe id='iframe' width="100%" height="100%" allowfullscreen="" src='${iframeUrl}'></iframe>
      </div>
      <script src='${moduleMockScriptUrl}' type='module'></script>
      </body></html>`,
    })
  })
  await page.route(moduleMockRoutePattern, async (route) => {
    await route.fulfill({
      contentType: 'text/javascript',
      path: path.resolve(
        __dirname,
        '../../mock/mock.capytale.save.can.module.js',
      ),
    })
  })

  // Go to the page
  await page.setDefaultTimeout(1_500_000) // Set timeout to 500 seconds
  await page.goto(parentUrl)

  await expect(page.locator('body')).toContainText('bonjour')
  await page.waitForSelector('#iframe')
  await page.waitForTimeout(3_000) // attendre 3_000 ms de plus pour assurer le rendu
  if (page.frames().length > 0) {
    await Promise.all(
      page.frames().map((frame) => frame.waitForLoadState('networkidle')),
    )
  }
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: ' Démarrer' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('#time-display-1')
    .waitFor({ state: 'visible' })
  // question 1
  const box = await page
    .locator('#iframe')
    .contentFrame()
    .locator('.minute-hand')
    .boundingBox()
  const box2 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#interactive-clockEx0Q0 > div > div > svg > text:nth-child(5)')
    .boundingBox()
  if (box !== null && box2 !== null) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2)
    await page.mouse.up()
  } else {
    logError('Box/Box2 is null')
  }
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 2
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('checkbox')
    .first()
    .check()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 3
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: '6' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: '0' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: '0' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('img', { name: 'Disque centre-rayon' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('#divFigure line')
    .nth(1)
    .click()
  await page.locator('#iframe').contentFrame().getByRole('textbox').fill('5')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Valider' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('img', { name: 'Déplacer les points' })
    .click()
  const box3 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#divFigure line')
    .nth(1)
    .boundingBox()
  if (box3 !== null) {
    await page.mouse.click(box3.x + box3.width / 2, box3.y + box3.height / 2)
  } else {
    logError('Box3 is null')
  }
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()
  // question 5
  await page.locator('#iframe').contentFrame().getByText('Q R').nth(2).click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 6
  await page.locator('#iframe').contentFrame().getByText('P Q').nth(1).click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 7
  const liste0 = page
    .locator('#iframe')
    .contentFrame()
    .locator('#liste-deroulanteEx5Q0')
  await liste0.click()
  await liste0.locator('li', { hasText: 'une différence' }).click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 8
  const liste1 = page
    .locator('#iframe')
    .contentFrame()
    .locator('#liste-deroulanteEx5Q1')
  await liste1.click()
  await liste1.locator('li', { hasText: 'une différence' }).click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 9
  const liste2 = page
    .locator('#iframe')
    .contentFrame()
    .locator('#liste-deroulanteEx5Q2')
  await liste2.click()
  await liste2.locator('li', { hasText: 'une différence' }).click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 10
  const liste3 = page
    .locator('#iframe')
    .contentFrame()
    .locator('#liste-deroulanteEx5Q3')
  await liste3.click()
  await liste3.locator('li', { hasText: 'une différence' }).click()
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  // question 11
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('#etiquetteEx6Q0I20')
    .dragTo(page.locator('#iframe').contentFrame().locator('#rectangleEx6Q0R1'))
  await page
    .locator('#iframe')
    .contentFrame()
    .locator('.bxs-chevron-right')
    .click()

  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Terminer et enregistrer les résultats' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('dialog')
    .getByRole('button', { name: 'Terminer et enregistrer les résultats' })
    .click()
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Accéder aux solutions' })
    .click()

  await page.waitForTimeout(2000) // attendre 2000 ms de plus pour assurer la sauvegarde
  const valueString = await page.evaluate(() =>
    localStorage.getItem('saveStudentAssignment'),
  )
  const value = JSON.parse(valueString ?? '')
  expect(value).not.toBe(null)
  expect(value.studentAssignment.length).toEqual(11)
  const responses = [
    { 'interactive-clockEx0Q0': '{"hour":12,"minute":15,"second":0}' },
    { 'mathalea-qcmEx1Q0': '[0]' },
    { Ex2Q0: '600' },
    {
      apigeomEx3F06GXX0:
        '{"apiGeomVersion":"3.0.20230508","xMin":-5.5,"yMin":-5.5,"scale":1,"pixelsPerUnit":30,"xScale":1,"yScale":1,"zoomLevel":1,"snapGrid":false,"point1":{"id":"point1","isDeletable":false,"thickness":2,"type":"Point","label":"B","labelDxInPixels":10,"labelDyInPixels":20,"shape":"x","x":1,"y":2},"point2":{"id":"point2","isDeletable":false,"thickness":2,"type":"Point","label":"S","labelDxInPixels":10,"labelDyInPixels":20,"shape":"x","x":-3,"y":2},"element0":{"id":"element0","type":"Circle","fillColor":"currentColor","idCenter":"point1","radius":5},"options":{"color":"currentColor","fillOpacity":0.2,"isDashed":false,"labelDxInPixels":15,"labelDyInPixels":15,"labelIsVisible":true,"pointSize":5,"thickness":1}}',
    },
    { 'clique-figureEx4Q0': '["cliquefigure2Ex4Q0"]' },
    { 'clique-figureEx4Q1': '["cliquefigure0Ex4Q1"]' },
    { 'liste-deroulanteEx5Q0': 'différence' },
    { 'liste-deroulanteEx5Q1': 'différence' },
    { 'liste-deroulanteEx5Q2': 'différence' },
    { 'liste-deroulanteEx5Q3': 'différence' },
    { 'drag-and-dropEx6Q0': '["etiquetteEx6Q0I20-clone-1741033348514"]' },
  ]
  logIfVerbose('Student Assignment:', value.studentAssignment)
  // await page.pause()
  const apigeomCaptures: Record<string, string> = {}
  value.studentAssignment.forEach((assignment: any, i: number) => {
    const keys = Object.keys(assignment.answers)
    const keysRep = Object.keys(responses[i])
    expect(keys.length).toEqual(keysRep.length)
    keys.forEach((key: string, j: number) => {
      logIfVerbose('Question:', i)
      logIfVerbose('Response:', j)
      logIfVerbose('Key:', assignment.answers[key])
      expect(keysRep[j]).toEqual(key)
      if (key.includes('rectangleDND')) {
        expect(assignment.answers[key].split('-')[0]).toEqual(
          (responses[i] as any)[key].split('-')[0],
        )
      } else if (key.startsWith('drag-and-drop')) {
        const actual = JSON.parse(assignment.answers[key])[0]
        const expected = JSON.parse((responses[i] as any)[key])[0]
        expect(actual.split('-')[0]).toEqual(expected.split('-')[0])
      } else if (
        key.includes('apigeom') &&
        process.env.UPDATE_APIGEOM_SNAPSHOTS
      ) {
        apigeomCaptures[key] = assignment.answers[key]
      } else {
        expect(assignment.answers[key]).toEqual((responses[i] as any)[key])
      }
    })
  })
  if (
    process.env.UPDATE_APIGEOM_SNAPSHOTS &&
    Object.keys(apigeomCaptures).length > 0
  ) {
    writeFileSync(
      '/tmp/mathalea-apigeom-save-can.json',
      JSON.stringify(apigeomCaptures, null, 2),
    )
    logIfVerbose(
      '📸 Snapshots apigeom capturés dans /tmp/mathalea-apigeom-save-can.json',
    )
  }
  return true
}

if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(testV, import.meta.url, { pauseOnError: false })
} else {
  prefs.headless = false
  runTest(testV, import.meta.url, { pauseOnError: true })
}

// pnpm vitest --config tests/e2e/vitest.config.view.js --run tests\e2e\tests\view\view.capytale.save.can.test.ts
