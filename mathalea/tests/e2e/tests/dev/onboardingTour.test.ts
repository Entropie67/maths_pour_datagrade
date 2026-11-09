import type { Page } from 'playwright'
import { runTest } from '../../helpers/run'

/**
 * Vérifie que la visite guidée de la page d'accueil (driver.js,
 * src/lib/onboarding/tour.ts) se déroule toujours correctement de bout en
 * bout : recherche, ajout d'exercice, navigation par niveau/chapitre,
 * raccourci Ctrl+K, boutons d'export, puis nettoyage final.
 *
 * Ce test couvre deux régressions déjà rencontrées :
 * - driver.js capturait un nœud de l'arborescence juste avant que Svelte ait
 *   fini de le mettre à jour, pointant la visite sur le mauvais élément
 *   (cf `moveNextAfterRender` dans tour.ts) ;
 * - dans un navigateur automatisé/headless, `requestAnimationFrame` peut
 *   être fortement throttlé, ce qui bloquait indéfiniment la transition
 *   animée entre deux étapes (cf `animate: false` dans tour.ts).
 * Chaque étape attend donc explicitement non seulement le titre du popover,
 * mais aussi que l'élément réellement mis en évidence par driver.js
 * (`.driver-active-element`) corresponde à ce qui est attendu.
 */
async function testOnboardingTour(page: Page): Promise<boolean> {
  const baseUrl = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`

  await page.goto(baseUrl)
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  async function waitForStepTitle(title: string) {
    await page.waitForFunction(
      (expected) =>
        document.querySelector('.driver-popover-title')?.textContent ===
        expected,
      title,
      { timeout: 15_000 },
    )
  }

  /** Attend que l'élément mis en évidence par driver.js contienne ce texte */
  async function waitForActiveElementText(expectedSubstring: string) {
    await page.waitForFunction(
      (expected) =>
        (
          document.querySelector('.driver-active-element')?.textContent ?? ''
        ).includes(expected),
      expectedSubstring,
      { timeout: 15_000 },
    )
  }

  /**
   * Attend que l'élément mis en évidence par driver.js porte l'attribut
   * `name` avec exactement la valeur `expectedValue`.
   */
  async function waitForActiveElementAttrEquals(
    name: string,
    expectedValue: string,
  ) {
    await page.waitForFunction(
      ({ name, expectedValue }) =>
        document.querySelector('.driver-active-element')?.getAttribute(name) ===
        expectedValue,
      { name, expectedValue },
      { timeout: 15_000 },
    )
  }

  async function clickNext() {
    await page.locator('.driver-popover-next-btn').click()
  }

  /**
   * Attend qu'un exercice ajouté par la démo soit rendu. driver.js affiche l'étape
   * suivante dès que le clic est passé, sans attendre que Svelte ait dessiné la
   * carte : compter les `#exerciceN` sans attendre, c'est une course perdue dès
   * que la page est occupée (régénération de l'exercice après un réglage).
   */
  async function waitForExercice(index: number, nom: string) {
    await page
      .locator(`#exercice${index}`)
      .first()
      .waitFor({ state: 'attached', timeout: 15_000 })
      .catch(() => {
        throw new Error(`l'exercice ${nom} n'a pas été ajouté`)
      })
  }

  // Étape 1/13 : accueil, se déclenche automatiquement (poste jamais vu)
  await waitForStepTitle('Bienvenue sur MathALÉA')

  // Étape 2/13 : champ de recherche
  await clickNext()
  await waitForStepTitle('Rechercher un exercice')

  // Étape 3/13 : la démo tape « 3L11 » et le résultat exact doit apparaître
  await clickNext()
  await waitForStepTitle('3L11 — Simple distributivité')
  await waitForActiveElementText('3L11')
  const searchValue = await page.inputValue('[data-tour="search-input"]')
  if (searchValue !== '3L11') {
    throw new Error(
      `champ de recherche attendu "3L11", obtenu "${searchValue}"`,
    )
  }

  // Étape 4/13 : clic sur le résultat -> l'exercice est ajouté (index 0)
  // (la page peut rendre la carte prof et une copie « vue élève » partageant
  // le même id, d'où le >= 1 plutôt qu'une égalité stricte — cf task_0df5d500)
  await clickNext()
  await waitForStepTitle('L’exercice sélectionné')
  await waitForExercice(0, '3L11')

  // Étape 5/13 : panneau « Forme de développement »
  await clickNext()
  await waitForStepTitle('Paramétrer finement un exercice')

  // Étape 6/13 : la démo règle 4 questions, coche la forme 1 avec un poids de 3
  // et la forme 2 (soit « 1-1-1-2 » dans l'URL), vide la recherche, puis met en
  // évidence « Course aux nombres »
  await clickNext()
  await waitForStepTitle('Course aux nombres')
  // Le poids d'apparition n'est plus un champ numérique mais un compteur réglé
  // par des boutons « + » / « − » : on lit la valeur affichée. Le réglage se
  // fait par clics successifs (asynchrones) côté visite, d'où l'attente.
  await page.waitForFunction(
    () =>
      document
        .querySelector('#settings-formTextListe3-0-1-poids')
        ?.textContent?.trim() === '3',
    undefined,
    { timeout: 15_000 },
  )
  const nbQuestions = await page.inputValue('#settings-nb-questions-0')
  const poidsForme1 = (
    await page.locator('#settings-formTextListe3-0-1-poids').textContent()
  )?.trim()
  const forme2Cochee = await page.isChecked('#settings-formTextListe3-0-2')
  // 3L11 démarre sur « Mélange » : la démo doit avoir décoché les autres formes,
  // sinon les proportions annoncées (¾ / ¼) seraient fausses
  const forme3Cochee = await page.isChecked('#settings-formTextListe3-0-3')
  if (
    nbQuestions !== '4' ||
    poidsForme1 !== '3' ||
    !forme2Cochee ||
    forme3Cochee
  ) {
    throw new Error(
      `réglages attendus 4 questions / forme 1 de poids 3 / forme 2 cochée / forme 3 décochée, obtenu ${nbQuestions} / ${poidsForme1} / ${forme2Cochee} / ${forme3Cochee}`,
    )
  }
  const searchCleared = await page.inputValue('[data-tour="search-input"]')
  if (searchCleared !== '')
    throw new Error('le champ de recherche aurait dû être vidé')
  await waitForActiveElementText('Course aux nombres')

  // Étape 7/13 : « Quatrième » se déplie et doit être l'élément actif
  // (régression historique : driver.js pointait parfois sur un nœud stale)
  await clickNext()
  await waitForStepTitle('Une entrée par niveau')
  await waitForActiveElementText('Quatrième')

  // Étape 8/13 : le chapitre « Théorème de Pythagore » se déplie
  await clickNext()
  await waitForStepTitle('Un chapitre')
  await waitForActiveElementText('Pythagore')

  // Étape 9/13 : l'exercice 4G20 est visible
  await clickNext()
  await waitForStepTitle('4G20 — Calculer une longueur avec Pythagore')
  await waitForActiveElementText('4G20')

  // Étape 10/13 : clic ajoute 4G20 (index 1), puis explique Ctrl+K
  await clickNext()
  await waitForStepTitle('Un raccourci pour aller plus vite')
  await waitForExercice(1, '4G20')

  // Étape 11/13 : ouvre la modale Ctrl+K, cherche « Pythagore ». On met en
  // évidence tout le conteneur de résultats plutôt qu'un aperçu de brevet
  // précis&nbsp;: ses aperçus se chargent tous de façon asynchrone et font
  // grandir la liste en continu, si bien qu'un aperçu ciblé précisément
  // dérive hors du halo de driver.js (cf commentaire dans tour.ts) ; le
  // conteneur, lui, a une taille fixe et ne bouge jamais.
  await clickNext()
  await waitForStepTitle('Aperçus des exercices')
  const modalSearchValue = await page.inputValue(
    '[data-tour="add-exercise-search-input"]',
  )
  if (modalSearchValue !== 'Pythagore') {
    throw new Error(
      `recherche Ctrl+K attendue "Pythagore", obtenu "${modalSearchValue}"`,
    )
  }
  await waitForActiveElementAttrEquals('data-tour', 'add-exercise-results')

  // Étape 12/13 : la modale se referme, les 5 boutons d'export sont mis en
  // évidence
  await clickNext()
  await waitForStepTitle('Une fois la feuille prête')
  const modalStillOpen = await page
    .locator('[data-tour="add-exercise-search-input"]')
    .count()
  if (modalStillOpen !== 0)
    throw new Error('la modale Ctrl+K aurait dû se refermer')
  await waitForActiveElementAttrEquals('data-tour', 'export-buttons')

  // Étape 13/13 : bouton d'aide
  await clickNext()
  await waitForStepTitle('Besoin d’aide plus tard ?')
  await waitForActiveElementAttrEquals('data-tour', 'help-button')

  // Fin de la visite : nettoyage complet et mémorisation dans localStorage
  await page.locator('.driver-popover-next-btn').click() // « Terminer »
  await page.waitForFunction(
    () => document.querySelector('.driver-popover') === null,
    undefined,
    { timeout: 5_000 },
  )
  const seenFlag = await page.evaluate(() =>
    window.localStorage.getItem('mathalea-onboarding-tour-vue'),
  )
  if (seenFlag !== '1')
    throw new Error('la visite aurait dû être marquée comme vue')
  const residualExercices = await page.locator('#exercice0').count()
  if (residualExercices !== 0) {
    throw new Error('les exercices de démonstration auraient dû être retirés')
  }

  // Un rechargement ne doit pas relancer la visite
  await page.reload()
  const tourReappeared = await page
    .locator('.driver-popover-title')
    .count()
    .then((count) => count > 0)
  if (tourReappeared) throw new Error('la visite ne devrait pas se relancer')

  return true
}

runTest(testOnboardingTour, import.meta.url)
