import { expect } from '@playwright/test'
import type { Browser, Page } from 'playwright'
import { runTest } from '../../helpers/run'

/*
Parcours complets d'un glisser-déposer au clavier, au clic et à la souris, avec de
vrais événements. Serveur de dev de sa copie :
PLAYWRIGHT_SERVER_PORT=<port> pnpm exec vitest --config tests/e2e/vitest.config.interactivity.js --run dragAndDrop.accessible
*/

const racine = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
const exercices = {
  '5N2F-1': 'c7c3d', // une étiquette par zone
  '6N3I-5': 'c0f9a', // plusieurs étiquettes par colonne, dans un tableau
  '3C10-4': 'a9001', // étiquettes duplicables, ordre imposé
}
type Reference = keyof typeof exercices
type Placement = { id: string; zone: number }
const palette = '#etiquettesEx0Q0'
const zoneSel = (k: number) => `#rectangleEx0Q0R${k}`
const boutonZone = (k: number) => `${zoneSel(k)} > .zoneDepotDND`

async function charger(page: Page, ref: Reference) {
  await page.goto(
    `${racine}?uuid=${exercices[ref]}&id=${ref}&n=1&alea=rgaa&i=1&v=eleve&es=0111001`,
  )
  await page.waitForSelector(`${palette} .katex, ${palette} .etiquette`)
  await page.waitForSelector('drag-and-drop .zoneDepotDND')
  await page.waitForTimeout(800) // rendu KaTeX et synchronisation des noms
}

/** Les placements donnant tous les points, déduits des étiquettes affichées. */
async function solution(page: Page, ref: Reference): Promise<Placement[]> {
  const etiquettes = await page
    .locator(`${palette} .etiquette`)
    .evaluateAll((liste) =>
      liste.map((e) => ({
        id: e.id,
        nom: e.getAttribute('aria-label') ?? '',
      })),
    )
  if (ref === '5N2F-1') {
    const valeur = (nom: string) =>
      Number(nom.replace('moins ', '-').replace(',', '.'))
    const nomZone = await page.locator(zoneSel(1)).getAttribute('data-nom-zone')
    const signe = nomZone?.includes('décroissant') ? -1 : 1
    return etiquettes
      .slice()
      .sort((a, b) => signe * (valeur(a.nom) - valeur(b.nom)))
      .map((e, k) => ({ id: e.id, zone: k + 1 }))
  }
  if (ref === '6N3I-5') {
    return etiquettes.map((e) => {
      const [num, den] = e.nom.split(' sur ').map(Number)
      const q = num / den
      const zone = q < 0.5 ? 1 : q === 0.5 ? 2 : q < 1 ? 3 : q === 1 ? 4 : 5
      return { id: e.id, zone }
    })
  }
  const lecture = await page
    .locator('annotation')
    .evaluateAll((l) =>
      l.map((a) => a.textContent ?? '').find((t) => t.includes('^')),
    )
  const [, mantisse, exposant] = /(\d)\^\{(\d)\}/.exec(lecture ?? '') ?? []
  const enLettres = [
    '',
    '',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
  ]
  const idDe = (nom: string) => {
    const trouvee = etiquettes.find((e) => e.nom === nom)
    if (!trouvee) throw Error(`Étiquette ${nom} introuvable`)
    return trouvee.id
  }
  return [
    enLettres[Number(mantisse)],
    'exposant',
    enLettres[Number(exposant)],
  ].map((nom) => ({ id: idDe(nom), zone: 1 }))
}

const focusCourant = (page: Page) =>
  page.evaluate(() => {
    const actif = document.activeElement as HTMLElement
    return { id: actif.id, nom: actif.getAttribute('aria-label') }
  })
const focusSur = (page: Page, selecteur: string) =>
  page.evaluate((s) => document.activeElement?.matches(s) ?? false, selecteur)

async function appuyerJusqua(
  page: Page,
  touche: string,
  selecteur: string,
  maximum = 60,
) {
  for (let k = 0; k < maximum; k++) {
    if (await focusSur(page, selecteur)) return
    await page.keyboard.press(touche)
  }
  throw Error(`${selecteur} inatteignable avec ${touche}`)
}

/** Safari n'atteint les <button> natifs de l'application, comme « Vérifier », qu'avec Option+Tab. */
function toucheBoutons(page: Page) {
  return page.context().browser()?.browserType().name() === 'webkit'
    ? 'Alt+Tab'
    : 'Tab'
}

/** Répond uniquement au clavier, alternativement avec Entrée et Espace. */
async function repondreAuClavier(page: Page, placements: Placement[]) {
  let touche = 'Enter'
  for (const { id, zone } of placements) {
    await appuyerJusqua(page, 'Shift+Tab', `${palette} .etiquette`)
    await appuyerJusqua(page, 'ArrowRight', `#${id}`)
    await page.keyboard.press(touche)
    expect(await page.locator(`#${id}`).getAttribute('aria-pressed')).toBe(
      'true',
    )
    await appuyerJusqua(page, 'Tab', boutonZone(zone))
    await page.keyboard.press(touche)
    await page.waitForTimeout(20) // Date.now() distinct pour chaque clone
    expect(await focusSur(page, boutonZone(zone))).toBe(true)
    expect(
      await page.locator('drag-and-drop [role="status"]').textContent(),
    ).toContain('déposé dans')
    touche = touche === 'Enter' ? ' ' : 'Enter'
  }
}

async function pointZone(page: Page, zone: number) {
  const element = page.locator(zoneSel(zone))
  await element.scrollIntoViewIfNeeded()
  const boite = await element.boundingBox()
  if (boite == null) throw Error(`Zone ${zone} invisible`)
  return { x: boite.x + boite.width - 4, y: boite.y + boite.height / 2 }
}

async function repondreAuClic(page: Page, placements: Placement[]) {
  for (const { id, zone } of placements) {
    await page.locator(`${palette} #${id}`).click()
    const { x, y } = await pointZone(page, zone)
    await page.mouse.click(x, y)
    await page.waitForTimeout(20)
  }
}

async function repondreEnGlissant(page: Page, placements: Placement[]) {
  for (const { id, zone } of placements) {
    const depart = page.locator(`${palette} #${id}`)
    await depart.scrollIntoViewIfNeeded()
    const boite = await depart.boundingBox()
    if (boite == null) throw Error(`Étiquette ${id} invisible`)
    await page.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2)
    await page.mouse.down()
    const { x, y } = await pointZone(page, zone)
    await page.mouse.move(x - 5, y, { steps: 5 })
    await page.mouse.move(x, y, { steps: 2 })
    await page.mouse.up()
    await page.waitForTimeout(20)
  }
}

const etatFinal = (page: Page) =>
  page.evaluate(() =>
    (
      document.querySelector('drag-and-drop') as HTMLElement & { value: string }
    ).value.replace(/-clone-\d+/g, '-clone'),
  )

async function score(page: Page) {
  await page.waitForFunction(() =>
    /\d/.test(document.querySelector('#divScoreEx0')?.textContent ?? ''),
  )
  return (
    (await page.locator('#divScoreEx0').textContent())?.replace(/\s+/g, '') ??
    ''
  )
}

function attendreTousLesPoints(resultat: string) {
  const [obtenu, total] = resultat.split('/').map(Number)
  expect(total).toBeGreaterThan(0)
  expect(obtenu).toBe(total)
}

/** Clavier seul jusqu'au score, puis clic, puis glisser : même état, même score. */
async function parcoursComplets(page: Page, ref: Reference) {
  await charger(page, ref)
  const placements = await solution(page, ref)
  await appuyerJusqua(page, 'Tab', `${palette} .etiquette`)
  await repondreAuClavier(page, placements)
  const etatClavier = await etatFinal(page)
  // Aucun piège : la tabulation sort du composant et atteint « Vérifier ».
  await appuyerJusqua(page, toucheBoutons(page), '#buttonScoreEx0')
  await page.keyboard.press('Enter')
  const scoreClavier = await score(page)
  attendreTousLesPoints(scoreClavier)
  // Une fois vérifié, plus aucun arrêt de tabulation dans le composant.
  expect(
    await page
      .locator('drag-and-drop [tabindex="0"], drag-and-drop .zoneDepotDND')
      .count(),
  ).toBe(0)
  expect(await page.locator('drag-and-drop [role="button"]').count()).toBe(0)

  await charger(page, ref)
  await repondreAuClic(page, placements)
  expect(await etatFinal(page)).toBe(etatClavier)
  await page.locator('#buttonScoreEx0').click()
  expect(await score(page)).toBe(scoreClavier)

  await charger(page, ref)
  await repondreEnGlissant(page, placements)
  expect(await etatFinal(page)).toBe(etatClavier)
  await page.locator('#buttonScoreEx0').click()
  expect(await score(page)).toBe(scoreClavier)
  return true
}

const parcours5N2F = (page: Page) => parcoursComplets(page, '5N2F-1')
const parcours6N3I = (page: Page) => parcoursComplets(page, '6N3I-5')
const parcours3C10 = (page: Page) => parcoursComplets(page, '3C10-4')

async function arbreAccessibiliteEtPiegeClavier(page: Page) {
  await charger(page, '5N2F-1')
  const arbre = await page.locator('drag-and-drop').ariaSnapshot()
  expect(arbre).toContain('group "Étiquettes disponibles"')
  expect(arbre).toContain('group "Zones de dépôt"')
  expect(arbre).toMatch(
    /button "Position 1 sur 6 dans l'ordre (dé)?croissant, vide"/,
  )
  expect(arbre).toContain('- status')
  // Un seul arrêt de tabulation pour la réserve, un par zone.
  await appuyerJusqua(page, 'Tab', `${palette} .etiquette`)
  expect(
    (await page.locator('.aideDND').boundingBox())?.height,
  ).toBeGreaterThan(5)
  await page.keyboard.press('Tab')
  expect(await focusSur(page, boutonZone(1))).toBe(true)
  await appuyerJusqua(page, toucheBoutons(page), '#buttonScoreEx0', 8)
  // Et le retour arrière ressort aussi du composant.
  await page.keyboard.press('Shift+Tab')
  expect(await focusSur(page, 'drag-and-drop *')).toBe(true)
  await appuyerJusqua(page, 'Shift+Tab', ':not(drag-and-drop *)', 10)

  // Sélection exposée, annulation par Échap, focus conservé.
  await appuyerJusqua(page, 'Tab', `${palette} .etiquette`)
  const { id } = await focusCourant(page)
  await page.keyboard.press('Enter')
  const pressee = await page.locator('drag-and-drop').ariaSnapshot()
  expect(pressee).toMatch(/button ".+" \[pressed\]/)
  await page.keyboard.press('Escape')
  expect((await focusCourant(page)).id).toBe(id)
  expect(await page.locator(`#${id}`).getAttribute('aria-pressed')).toBe(
    'false',
  )
  expect(
    await page.locator('drag-and-drop [role="status"]').textContent(),
  ).toContain('Sélection annulée')
  return true
}

async function retraitsEtReordonnancement(page: Page) {
  await charger(page, '5N2F-1')
  await appuyerJusqua(page, 'Tab', `${palette} .etiquette`)
  const { id, nom } = await focusCourant(page)
  const deposer = async () => {
    await appuyerJusqua(page, 'Shift+Tab', `${palette} .etiquette`)
    await appuyerJusqua(page, 'ArrowRight', `#${id}`)
    await page.keyboard.press('Enter')
    await appuyerJusqua(page, 'Tab', boutonZone(1))
    await page.keyboard.press('Enter')
  }
  await deposer()
  expect(
    await page.locator(boutonZone(1)).getAttribute('aria-label'),
  ).toContain(`contient ${nom}`)
  // Suppr : retour à la réserve, le focus reste sur la zone.
  await page.keyboard.press('Tab')
  expect((await focusCourant(page)).id).toBe(id)
  await page.keyboard.press('Delete')
  expect(await focusSur(page, boutonZone(1))).toBe(true)
  expect(await page.locator(`${palette} #${id}`).count()).toBe(1)
  expect(
    await page.locator(boutonZone(1)).getAttribute('aria-label'),
  ).toContain('vide')
  // Bouton de retrait, disponible seulement pour une étiquette déposée.
  await deposer()
  expect(await page.locator('.retirerDND').isVisible()).toBe(false)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  expect(await page.locator('.retirerDND').isVisible()).toBe(true)
  await appuyerJusqua(page, 'Shift+Tab', '.retirerDND')
  await page.keyboard.press('Enter')
  expect(await page.locator(`${palette} #${id}`).count()).toBe(1)
  expect((await focusCourant(page)).id).toBe(id)
  expect(await page.locator('.retirerDND').isVisible()).toBe(false)
  // Bouton « x » à la souris : pas de bouton en double après un déplacement.
  await deposer()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await appuyerJusqua(page, 'Tab', boutonZone(2))
  await page.keyboard.press('Enter')
  expect(await page.locator(`${zoneSel(2)} #${id} .delete-btn`).count()).toBe(1)
  await page.locator(`${zoneSel(2)} #${id} .delete-btn`).click()
  expect(await page.locator(`${palette} #${id}`).count()).toBe(1)
  expect(await focusSur(page, boutonZone(2))).toBe(true)

  // Étiquettes duplicables : réordonner et supprimer un clone.
  await charger(page, '3C10-4')
  const placements = await solution(page, '3C10-4')
  await appuyerJusqua(page, 'Tab', `${palette} .etiquette`)
  await repondreAuClavier(page, placements)
  expect(await page.locator(`${palette} .etiquette`).count()).toBeGreaterThan(
    10,
  )
  const ordre = () =>
    page
      .locator(`${zoneSel(1)} .etiquette`)
      .evaluateAll((l) => l.map((e) => e.id.split('-')[0]))
  const avant = await ordre()
  expect(avant.length).toBe(3)
  // Dernière étiquette placée devant la première.
  await page.keyboard.press('Tab') // première déposée
  const premiere = (await focusCourant(page)).id
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await appuyerJusqua(page, 'Shift+Tab', `#${premiere}`)
  await page.keyboard.press('Enter')
  expect(await ordre()).toEqual([avant[2], avant[0], avant[1]])
  expect((await focusCourant(page)).id).toBe(premiere)
  await page.keyboard.press('Delete')
  expect(await page.locator(`${zoneSel(1)} .etiquette`).count()).toBe(2)
  expect(await focusSur(page, boutonZone(1))).toBe(true)
  expect(await page.locator(`${palette} .etiquette`).count()).toBeGreaterThan(
    10,
  )
  return true
}

/** Dépôt au clavier et noms lisibles sur les autres exercices, et Entrée en vue CAN. */
async function autresExercicesEtVueCan(page: Page) {
  for (const [ref, uuid] of [
    ['5N1F-2', '3639a'],
    ['6N0A-6', '068ee'],
    ['6N0A-10', '3bba9'],
    ['CM2N1D-1', '6498e'],
  ]) {
    await page.goto(
      `${racine}?uuid=${uuid}&id=${ref}&alea=rgaa&i=1&v=eleve&es=0111001`,
    )
    await page.waitForSelector('drag-and-drop .zoneDepotDND')
    await page.waitForTimeout(800)
    const composant = page.locator('drag-and-drop').first()
    const arbre = await composant.ariaSnapshot()
    expect(arbre).toContain('group "Étiquettes disponibles"')
    expect(arbre).not.toMatch(/\\|\$/) // aucun LaTeX brut dans les noms
    expect(arbre).not.toContain('Zone 1 sur') // chaque zone a un nom explicite
    await appuyerJusqua(page, 'Tab', 'drag-and-drop .etiquette')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await appuyerJusqua(page, 'Tab', '.zoneDepotDND')
    await page.keyboard.press('Enter')
    expect(await composant.locator('.rectangleDND .etiquette').count()).toBe(1)
    expect(await composant.locator('[role="status"]').textContent()).toContain(
      'déposé dans',
    )
  }

  await page.goto(
    `${racine}?uuid=c7c3d&id=5N2F-1&n=2&alea=rgaa&i=1&v=can&canSA=1&canD=5&canT=3`,
  )
  await page.waitForTimeout(1500)
  const demarrer = page.getByRole('button', {
    name: /Démarrer|Commencer|Go|Lancer/i,
  })
  if (await demarrer.count()) await demarrer.first().click()
  await page.waitForSelector('drag-and-drop .zoneDepotDND')
  await page.waitForTimeout(800)
  const questionAffichee = () =>
    page
      .locator('[id^="question-content-"]:not(.hidden)')
      .evaluateAll((l) => l.map((e) => e.id).join(','))
  const question = await questionAffichee()
  await appuyerJusqua(page, 'Tab', 'drag-and-drop .etiquette')
  await page.keyboard.press('Enter')
  await appuyerJusqua(page, 'Tab', '.zoneDepotDND')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect(
    await page
      .locator('drag-and-drop:visible .rectangleDND .etiquette')
      .count(),
  ).toBe(1)
  expect(await questionAffichee()).toBe(question)
  return true
}

function contraste(a: number[], b: number[]) {
  const luminance = ([r, g, b]: number[]) => {
    const [x, y, z] = [r, g, b].map((c) => {
      const v = c / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * x + 0.7152 * y + 0.0722 * z
  }
  const [l1, l2] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (l1 + 0.05) / (l2 + 0.05)
}
const rgb = (couleur: string) =>
  (couleur.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)

async function contrastesFocusEtSelection(page: Page) {
  for (const sombre of [false, true]) {
    await charger(page, '5N2F-1')
    await page.evaluate((s) => {
      document.documentElement.classList.toggle('dark', s)
    }, sombre)
    await appuyerJusqua(page, 'Tab', `${palette} .etiquette`)
    const styles = await page.evaluate(() => {
      const actif = document.activeElement as HTMLElement
      const fond = (element: Element | null): string => {
        for (let e = element; e; e = e.parentElement) {
          const couleur = getComputedStyle(e).backgroundColor
          if (couleur !== 'rgba(0, 0, 0, 0)' && couleur !== 'transparent')
            return couleur
        }
        return 'rgb(255, 255, 255)'
      }
      return {
        contour: getComputedStyle(actif).outlineColor,
        largeur: getComputedStyle(actif).outlineWidth,
        fondPage: fond(actif.parentElement),
      }
    })
    expect(styles.largeur).toBe('3px')
    expect(
      contraste(rgb(styles.contour), rgb(styles.fondPage)),
    ).toBeGreaterThanOrEqual(3)
    await page.keyboard.press('Enter')
    const anneau = await page.evaluate(
      () => getComputedStyle(document.activeElement as HTMLElement).boxShadow,
    )
    expect(contraste(rgb(anneau), rgb(styles.fondPage))).toBeGreaterThanOrEqual(
      3,
    )
  }
  return true
}

/** Le tap équivaut au clic et un vrai glisser tactile (CDP) reste possible. */
async function tactile(page: Page) {
  const navigateur = page.context().browser() as Browser
  if (navigateur.browserType().name() !== 'chromium') {
    // Le glisser tactile passe par CDP : seuls le tap et le dépôt sont vérifiés ici.
    const contexteTap = await navigateur.newContext({ hasTouch: true })
    const tap = await contexteTap.newPage()
    await charger(tap, '5N2F-1')
    const [{ id, zone }] = await solution(tap, '5N2F-1')
    await tap.locator(`${palette} #${id}`).tap()
    expect(await tap.locator(`#${id}`).getAttribute('aria-pressed')).toBe(
      'true',
    )
    const { x, y } = await pointZone(tap, zone)
    await tap.touchscreen.tap(x, y)
    expect(await tap.locator(`${zoneSel(zone)} #${id}`).count()).toBe(1)
    await contexteTap.close()
    return true
  }
  const contexte = await navigateur.newContext({
    hasTouch: true,
    viewport: { width: 1000, height: 800 },
  })
  const tactile = await contexte.newPage()
  const cdp = await contexte.newCDPSession(tactile)
  const glisser = async (depart: string, zone: number) => {
    const element = tactile.locator(depart)
    await element.scrollIntoViewIfNeeded()
    const boite = await element.boundingBox()
    if (boite == null) throw Error('Étiquette invisible')
    const a = { x: boite.x + boite.width / 2, y: boite.y + boite.height / 2 }
    const b = await pointZone(tactile, zone)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [a],
    })
    for (const t of [0.3, 0.7, 1]) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }],
      })
    }
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await tactile.waitForTimeout(50)
  }

  await charger(tactile, '5N2F-1')
  const placements = await solution(tactile, '5N2F-1')
  const { id, zone } = placements[0]
  await tactile.locator(`${palette} #${id}`).tap()
  expect(await tactile.locator(`#${id}`).getAttribute('aria-pressed')).toBe(
    'true',
  )
  // Le tap ne laisse aucun emplacement masqué derrière lui.
  expect(await tactile.locator(`[id="${id}"]`).count()).toBe(1)
  const { x, y } = await pointZone(tactile, zone)
  await tactile.touchscreen.tap(x, y)
  expect(await tactile.locator(`${zoneSel(zone)} #${id}`).count()).toBe(1)
  // Un tap sur une étiquette déposée la sélectionne sans la cloner.
  await tactile
    .locator(`${zoneSel(zone)} #${id}`)
    .tap({ position: { x: 4, y: 12 } })
  expect(await tactile.locator(`${zoneSel(zone)} .etiquette`).count()).toBe(1)
  expect(await tactile.locator(`#${id}`).getAttribute('aria-pressed')).toBe(
    'true',
  )
  await tactile.locator('.retirerDND').tap()
  expect(await tactile.locator(`${palette} #${id}`).count()).toBe(1)

  for (const placement of placements) {
    await glisser(`${palette} #${placement.id}`, placement.zone)
  }
  await tactile.locator('#buttonScoreEx0').tap()
  attendreTousLesPoints(await score(tactile))

  await charger(tactile, '3C10-4')
  const duplicables = await solution(tactile, '3C10-4')
  const reserveInitiale = await tactile
    .locator(`${palette} .etiquette:visible`)
    .count()
  for (const placement of duplicables) {
    await glisser(
      `${palette} .etiquette[id="${placement.id}"]:visible >> nth=0`,
      placement.zone,
    )
  }
  expect(await tactile.locator(`${zoneSel(1)} .etiquette`).count()).toBe(3)
  expect(await tactile.locator(`${palette} .etiquette:visible`).count()).toBe(
    reserveInitiale,
  )
  await tactile.locator('#buttonScoreEx0').tap()
  attendreTousLesPoints(await score(tactile))
  await contexte.close()
  return true
}

// runTest et non runSeveralTests, qui garderait la page du premier navigateur.
for (const test of [
  parcours5N2F,
  parcours6N3I,
  parcours3C10,
  arbreAccessibiliteEtPiegeClavier,
  retraitsEtReordonnancement,
  autresExercicesEtVueCan,
  contrastesFocusEtSelection,
  tactile,
]) {
  runTest(test, import.meta.url, {
    browsers: ['chromium', 'webkit'],
    pauseOnError: false,
  })
}
