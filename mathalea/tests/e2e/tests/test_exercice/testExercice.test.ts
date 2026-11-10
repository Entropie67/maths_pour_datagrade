import type { Page } from 'playwright'
import prefs from '../../helpers/prefs'
import { runTest } from '../../helpers/run'
import {
  getExercisesCount,
  getLatexFromPage,
  testAllViews,
  type Variation,
  type View,
} from '../../helpers/testAllViews'
import { promises as fs } from 'fs'
import { dirname } from 'path'
import { exec } from 'child_process'

// Exemple de test avec des paramètres définis dans les variables d'environnement :
// id=4C20 pnpm testExercice

let id = '4C20' // paramètres par défaut utilisés si non définis dans les variables d'environnement (voir ci-dessus)

async function test(page: Page) {
  const shellId = Object.entries(process.env)
    .filter(([key]) => key === 'id')
    .map((el) => el[1])[0]
  if (shellId) id = shellId
  try {
    await fs.rmdir(`screenshots/${id}/`, { recursive: true })
  } catch (error) {
    console.log('No screenshots folder to delete')
  }
  await testAllViews(page, { params: `id=${id}` }, callback)
  console.warn(`Les captures d'écran sont dans le dossier screenshots/${id}`)
  console.warn(
    "N'oubliez pas de tester les différents paramètres de votre exercice avec et sans interactivité !",
  )
  return true
}

type Scenario = {
  displayCorrectionSelectors: string[]
  isMultipleDisplayCorrectionSelectorsOnSamePage?: boolean
  isMultiplePagesView?: boolean
  navigationSelectors?: string[]
  callbackBeforeNavigation?: (page: Page, i: number) => Promise<void>
}

let questionsNb = 1
let isFirstPage = true

const callback = async (
  page: Page,
  description: string,
  view: View,
  variation: Variation,
) => {
  if (view === 'start' && isFirstPage) {
    questionsNb = (await page.locator('.list-inside').locator('li').all())
      .length
    isFirstPage = false // des fois questionsNb n'est pas défini lorsqu'on lance la course aux nombres, peut-être pour ça ?
  }
  const scenario = await getScenario(description, view, variation)
  if (scenario.isMultiplePagesView) {
    if (
      !scenario.navigationSelectors ||
      scenario.navigationSelectors.length === 0
    ) {
      console.error(
        'View has multiple pages but no navigation selector is found',
      ) // Je ne sais pas pourquoi mais the throw new Error apparaît comme <empty line> dans la console et donc on ne sait pas ce qui a causé l'erreur
      throw new Error(
        'View has multiple pages but no navigation selector is found',
      )
    }
    if (
      scenario.displayCorrectionSelectors.length !== 0 &&
      scenario.displayCorrectionSelectors.length - 1 !==
        scenario.navigationSelectors.length
    ) {
      console.error(
        'In multiple pages scenario, displayCorrectionSelectors should be empty or have the same length as scenario.navigationSelectors minus one',
      )
      throw new Error(
        'In multiple pages scenario, displayCorrectionSelectors should be empty or have the same length as scenario.navigationSelectors minus one',
      )
    }
    for (let i = 0; i < scenario.navigationSelectors.length + 1; i++) {
      if (scenario.displayCorrectionSelectors.length !== 0) {
        await displayCorrection(page, scenario, i)
      }
      await page.waitForTimeout(100) // to limit white screenshots
      await action(page, description, view, variation, String(i + 1))
      const viewSpecificExceptions =
        view === 'diaporama' && i === scenario.navigationSelectors.length // there is no correction to show in diaporama's ending screen
      if (scenario.callbackBeforeNavigation && !viewSpecificExceptions)
        await scenario.callbackBeforeNavigation(page, i)
      if (
        scenario.navigationSelectors[i] !== '' &&
        i < scenario.navigationSelectors.length
      )
        await page.locator(scenario.navigationSelectors[i]).click()
    }
  } else {
    if (view === 'LaTeX' || view === 'AMC') {
      let latex = ''
      if (view === 'LaTeX') {
        await page.context().grantPermissions(
          ['clipboard-read', 'clipboard-write'],
          { origin: new URL(page.url()).origin },
        )
        await page.locator('text=Code + préambule').click()
        latex = await page.evaluate(async () => {
          return await navigator.clipboard.readText()
        })
      } else {
        latex = await getLatexFromPage(page)
      }
      await compileLaTeX(page, description, view, variation, latex)
    } else {
      await displayCorrection(page, scenario, 0)
      if (view === 'apercu') {
        await testNanUndefined(page)
      }
      await action(page, description, view, variation)
    }
  }
}

async function compileLaTeX(
  page: Page,
  description: string,
  view: View,
  variation: Variation,
  latex: string,
) {
  const texDir = `screenshots/${id}/tex`
  const fileName = `${view}-${variation}${description !== '' ? `-${description}` : ''}`
  await writeStringToFile(`${texDir}/${fileName}.tex`, latex)
  const AmcFiles = ['automultiplechoice.sty', 'liste.csv']

  try {
    await prepareCompilation(view, AmcFiles)
    await compileLatex(texDir, fileName)
    await cleanAuxiliaryFiles(page, view, variation, fileName, AmcFiles)
    await movePdfFiles(id, fileName)
  } catch (error) {
    console.error('Command execution failed', error)
  }
}

async function prepareCompilation(view: View, AmcFiles: string[]) {
  if (view === 'AMC') {
    for (const file of AmcFiles) {
      console.log(`copy ${file}`)
      try {
        await fs.copyFile(`tests/e2e/tests/test_exercice/${file}`, `${file}`)
        console.log('File copied successfully')
      } catch (err) {
        console.error('Error copying file:', err)
      }
    }
  }
}

async function compileLatex(texDir: string, fileName: string) {
  const compilationCommand = `lualatex -interaction=nonstopmode -halt-on-error -file-line-error ${texDir}/${fileName}.tex`
  console.log(`First compilation of ${texDir}/${fileName}.tex`)
  await runShellCommand(compilationCommand)
  console.log(`Second compilation of ${texDir}/${fileName}.tex`)
  await runShellCommand(compilationCommand)
}

async function cleanAuxiliaryFiles(
  page: Page,
  view: View,
  variation: Variation,
  fileName: string,
  AmcFiles: string[],
) {
  console.log(`Cleaning auxiliary filed of ${fileName}`)
  await removeFile(`${fileName}.aux`)
  await removeFile(`${fileName}.log`)
  if (view === 'AMC') {
    await removeFile(`${fileName}.amc`)
    for (const file of AmcFiles) {
      console.log(`remove ${file} copy`)
      await removeFile(`${file}`)
    }
  } else if (view === 'LaTeX') {
    await removeFile(`${fileName}.out`)
    if (variation === 'ProfMaquette' || variation === 'ProfMaquetteQrcode') {
      for (let i = 0; i < getExercisesCount(page); i++) {
        let file = `${fileName}-Ex${i + 1}.sol`
        console.log(`remove ${file}`)
        await removeFile(`${file}`, true)
        file = `${fileName}-Ma${i + 1}-Ex${i + 1}.sol`
        console.log(`remove ${file}`)
        await removeFile(`${file}`, true)
      }
    }
  }
}

async function removeFile(fileName: string, canFail?: boolean) {
  try {
    await fs.unlink(fileName)
    console.log(`Deleted ${fileName}`)
  } catch (err) {
    if (canFail) return
    console.error(`Error deleting ${fileName}:`, err)
  }
}

async function movePdfFiles(id: string, fileName: string) {
  console.log(`Moving generated pdf from ${fileName}`)
  try {
    await fs.rename(`${fileName}.pdf`, `screenshots/${id}/${fileName}.pdf`)
    console.log('File moved successfully')
  } catch (err) {
    console.error('Error moving file:', err)
  }
}

async function getScenario(
  description: string,
  view: View,
  variation: Variation,
): Promise<Scenario> {
  if (view === 'start') {
    return {
      displayCorrectionSelectors: ['.bx-check-circle'],
    }
  } else if (view === 'diaporama') {
    const callbackBeforeNavigation = async (page: Page, i: number) => {
      await page.locator('.bx-show').click()
      await action(page, description, view, variation, `${i + 1}-correction`)
    }
    return {
      displayCorrectionSelectors: [],
      isMultiplePagesView: true, // always true since we have to click next to go to the final screen
      navigationSelectors: new Array(questionsNb).fill('.bx-skip-next'),
      callbackBeforeNavigation,
    }
  } else if (view === 'apercu') {
    return {
      displayCorrectionSelectors: [
        'button[aria-label="Afficher les réponses"]',
      ],
    }
  } else if (view === 'eleve') {
    if (variation === 'Une page par question') {
      const navigationSelectors = []
      for (let i = 0; i < questionsNb - 1; i++) {
        navigationSelectors.push(`#questionTitleID${i + 1}`)
      }
      return {
        displayCorrectionSelectors: new Array(questionsNb).fill(
          '.bx-toggle-right:not(.hidden .bx-toggle-right)',
        ),
        isMultiplePagesView: questionsNb > 1,
        navigationSelectors,
      }
    } else if (variation === 'Course aux nombres') {
      return {
        displayCorrectionSelectors: [],
        isMultiplePagesView: questionsNb > 1,
        navigationSelectors: new Array(questionsNb - 1).fill(
          '.bxs-chevron-right',
        ),
      }
    } else if (variation === 'Tous les exercices sur une page') {
      return {
        displayCorrectionSelectors: ['text=Voir la correction'],
      }
    }
  }
  return {
    displayCorrectionSelectors: [],
  }
}

async function displayCorrection(
  page: Page,
  scenario: Scenario,
  displayCorrectionSelectorIndex: number,
) {
  if (scenario.displayCorrectionSelectors.length === 0) return
  const displayCorrectionSelector =
    scenario.displayCorrectionSelectors[displayCorrectionSelectorIndex]
  if (displayCorrectionSelector === '') return
  if (scenario.isMultipleDisplayCorrectionSelectorsOnSamePage) {
    const correctionToggles = await page
      .locator(displayCorrectionSelector)
      .all()
    for (let i = correctionToggles.length - 1; i >= 0; i--) {
      await correctionToggles[i].click()
    }
  } else {
    await page.locator(displayCorrectionSelector).click()
  }
}

async function action(
  page: Page,
  description: string,
  view: View,
  variation: Variation,
  append?: string,
) {
  await page.screenshot({
    path: `screenshots/${id}/${view}${variation !== '' ? `-${variation}` : ''}${append !== undefined ? `-${append}` : ''}${description !== '' ? `-${description}` : ''}.png`,
    fullPage: true,
  })
}

async function writeStringToFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    console.log(`Write ${filePath}`)
    await fs.mkdir(dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf8')
  } catch (error) {
    console.error('Error writing to file', error)
  }
}

async function runShellCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`)
        reject(error)
      } else {
        // if (stdout) console.log(`stdout: ${stdout}`) la sortie LaTeX plombe tout le log
        if (stderr) console.error(`stderr: ${stderr}`)
        resolve()
      }
    })
  })
}

async function testNanUndefined(page: Page) {
  for (let i = 0; i < 10; i++) {
    const NaNLocators = await page.locator('text=/\\bNaN\\b/').all()
    const undefinedLocators = await page.locator('text=/\\bundefined\\b/').all()
    if (NaNLocators.length > 0 || undefinedLocators.length > 0) {
      await action(
        page,
        `${getTimeStamp()}`,
        'apercu',
        '',
        `testNaNUndefined-${i + 1}`,
      )
    }
    if ((await page.locator('.bx-refresh').count()) === 1) {
      await page.locator('.bx-refresh').click()
    } else if ((await page.locator('.bx-refresh').count()) > 1) {
      await page.locator('.bx-refresh').nth(0).click()
    } else {
      console.warn('No refresh button found, skipping NaN/undefined test')
    }
  }
}

function getTimeStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(test, import.meta.url, { pauseOnError: false })
} else {
  runTest(test, import.meta.url, { pauseOnError: true })
}
