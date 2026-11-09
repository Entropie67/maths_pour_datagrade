/**
 * Figure apiGeom rechargée depuis son JSON : la vérification doit donner le
 * même résultat et ne lire aucun élément détruit par le rechargement.
 *
 * Une figure élève est rechargée par `loadJson()` quand l'élève clique sur
 * « Annuler » ou « Rétablir », et quand Capytale (ou un autre recorder)
 * recharge une copie pour la reprendre ou la relire. Tous les éléments sont
 * alors recréés : un exercice qui a gardé, pendant `nouvelleVersion()`, une
 * référence vers un point de la figure élève lit ensuite un objet détruit
 * (nom vide, coordonnées figées) et sa note devient fausse.
 */
import Figure from 'apigeom'
import Element2D from 'apigeom/src/elements/Element2D'
import type Point from 'apigeom/src/elements/points/Point'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { context } from '../../src/modules/context'
import { figureAnswerJson } from '../../src/lib/apigeom/figureAnswer'
import { ApigeomFigureElement } from '../../src/lib/apigeom/apigeom-figure'
import type { IExercice } from '../../src/lib/types'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const racine = join(__dirname, '../../src/exercices')

/** Exercices interactifs qui insèrent une figure apiGeom évaluée */
function listeExercicesApigeom(): string[] {
  const fichiers: string[] = []
  const parcours = (dossier: string) => {
    for (const nom of readdirSync(dossier)) {
      const chemin = join(dossier, nom)
      if (statSync(chemin).isDirectory()) parcours(chemin)
      else if (nom.endsWith('.ts') && !nom.endsWith('-old.ts')) {
        const source = readFileSync(chemin, 'utf8')
        if (
          source.includes('figureApigeom(') &&
          source.includes('correctionInteractive') &&
          /export const interactifReady = true/.test(source)
        ) {
          fichiers.push(relative(racine, chemin))
        }
      }
    }
  }
  parcours(racine)
  return fichiers.sort()
}

type ExerciceApigeom = {
  numeroExercice?: number
  interactif: boolean
  nbQuestions: number
  figuresApiGeom?: unknown[]
  nouvelleVersion: () => void
  correctionInteractive?: (i: number) => unknown
}

const proprietesIgnorees = new Set([
  'figuresApiGeom',
  'figures',
  'autoCorrection',
  'listeQuestions',
  'listeCorrections',
  'listeCanEnonces',
  'listeCanReponsesACompleter',
  'answers',
])

/** Éléments de `figures` référencés par l'exercice (propriétés, tableaux, objets) */
function referencesVersFigures(
  exercice: object,
  figures: Set<Figure>,
): Map<Element2D, string> {
  const trouves = new Map<Element2D, string>()
  const vus = new Set<unknown>()
  const parcours = (valeur: unknown, chemin: string, profondeur: number) => {
    if (valeur == null || typeof valeur !== 'object' || vus.has(valeur)) return
    vus.add(valeur)
    if (valeur instanceof Element2D) {
      if (valeur.figure != null && figures.has(valeur.figure as Figure)) {
        trouves.set(valeur, chemin)
      }
      return
    }
    if (valeur instanceof Figure || profondeur > 5) return
    if (valeur instanceof Map) {
      for (const [cle, v] of valeur)
        parcours(v, `${chemin}.get(${cle})`, profondeur + 1)
      return
    }
    if (Array.isArray(valeur)) {
      valeur.forEach((v, k) => parcours(v, `${chemin}[${k}]`, profondeur + 1))
      return
    }
    const proto = Object.getPrototypeOf(valeur)
    if (proto !== Object.prototype && proto !== null && profondeur > 0) return
    for (const cle of Object.keys(valeur)) {
      if (profondeur === 0 && proprietesIgnorees.has(cle)) continue
      parcours(
        (valeur as Record<string, unknown>)[cle],
        chemin === '' ? cle : `${chemin}.${cle}`,
        profondeur + 1,
      )
    }
  }
  parcours(exercice, '', 0)
  return trouves
}

/** Enregistre toute lecture (hors `id`) d'un élément détruit */
function espionne(element: Element2D, nom: string, lectures: Set<string>) {
  const proprietes = new Set<string>(Object.keys(element))
  let proto = Object.getPrototypeOf(element)
  while (proto != null && proto !== Object.prototype) {
    for (const cle of Object.getOwnPropertyNames(proto)) {
      const descripteur = Object.getOwnPropertyDescriptor(proto, cle)
      if (descripteur?.get != null) proprietes.add(cle)
    }
    proto = Object.getPrototypeOf(proto)
  }
  proprietes.delete('id')
  for (const cle of proprietes) {
    const propre = Object.getOwnPropertyDescriptor(element, cle)
    let valeur = propre?.value
    let proto2 = Object.getPrototypeOf(element)
    let descripteurProto: PropertyDescriptor | undefined
    while (propre == null && proto2 != null && descripteurProto == null) {
      descripteurProto = Object.getOwnPropertyDescriptor(proto2, cle)
      proto2 = Object.getPrototypeOf(proto2)
    }
    Object.defineProperty(element, cle, {
      configurable: true,
      get() {
        lectures.add(`${nom}.${cle}`)
        return descripteurProto?.get != null
          ? descripteurProto.get.call(element)
          : valeur
      },
      set(v) {
        if (descripteurProto?.set != null) descripteurProto.set.call(element, v)
        else valeur = v
      },
    })
  }
}

async function genere(
  fichier: string,
  graine: string,
  parametres: Record<string, unknown> = {},
) {
  const module = await import(/* @vite-ignore */ join(racine, fichier))
  seedrandom(graine, { global: true })
  const exercice = new module.default() as ExerciceApigeom
  exercice.numeroExercice = 0
  exercice.interactif = true
  Object.assign(exercice, parametres)
  exercice.nouvelleVersion()
  return exercice
}

function figuresEleve(exercice: ExerciceApigeom): Figure[] {
  return (exercice.figuresApiGeom ?? []).filter(
    (f): f is Figure => f instanceof Figure && f.isDynamic,
  )
}

async function verifie(exercice: ExerciceApigeom, graine: string) {
  document.body.innerHTML = ''
  for (let i = 0; i < 20; i++) {
    for (const id of [`feedbackEx0Q${i}`, `resultatCheckEx0Q${i}`]) {
      const div = document.createElement('div')
      div.id = id
      document.body.appendChild(div)
    }
  }
  const resultats: unknown[] = []
  for (let i = 0; i < exercice.nbQuestions; i++) {
    seedrandom(`${graine}-verif-${i}`, { global: true })
    try {
      resultats.push(exercice.correctionInteractive?.(i))
    } catch (erreur) {
      resultats.push(`Erreur : ${(erreur as Error).message}`)
    }
  }
  // shakeCorrection() et assimilés poursuivent après un await
  await new Promise((resolve) => setTimeout(resolve, 0))
  return resultats
}

const originalRandom = Math.random
const exercices: ExerciceApigeom[] = []

beforeEach(() => {
  context.isHtml = true
  context.isTypst = false
  context.isAmc = false
  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
  // L'animation du shake dure une seconde : on n'attend pas, mais ce que
  // l'exercice fait après (recopie vers la correction…) est bien exécuté.
  vi.spyOn(Figure.prototype, 'shake').mockResolvedValue()
})

afterEach(() => {
  for (const exercice of exercices.splice(0)) {
    for (const figure of exercice.figuresApiGeom ?? []) {
      if (figure instanceof Figure) figure.destroy()
    }
  }
  Math.random = originalRandom
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('Figures apiGeom rechargées (Annuler, copie Capytale)', () => {
  it.each(listeExercicesApigeom())('%s', async (fichier) => {
    const graine = 'rechargement'
    let reference: ExerciceApigeom
    let rechargee: ExerciceApigeom
    try {
      reference = await genere(fichier, graine)
      rechargee = await genere(fichier, graine)
    } catch {
      // Exercice non générable dans jsdom : hors du champ de ce test
      return
    }
    exercices.push(reference, rechargee)
    const figures = figuresEleve(rechargee)
    if (figures.length === 0) return

    const references = [
      ...referencesVersFigures(rechargee, new Set(figures)),
    ].map(([element, chemin]) => ({
      element,
      chemin,
      figure: element.figure as Figure,
    }))
    for (const figure of figures) figure.loadJson(JSON.parse(figure.json))
    const lectures = new Set<string>()
    for (const { element, chemin, figure } of references) {
      if (figure.elements.get(element.id) !== element) {
        espionne(element, chemin, lectures)
      }
    }

    const attendu = await verifie(reference, graine)
    const obtenu = await verifie(rechargee, graine)
    expect(
      [...lectures],
      'éléments détruits par le rechargement lus pendant la vérification',
    ).toEqual([])
    expect(obtenu).toEqual(attendu)
  })
})

describe('Construction juste après un rechargement de la figure', () => {
  it('5G5G-1 : la médiane construite est acceptée', async () => {
    vi.mocked(Figure.prototype.shake).mockRestore()
    const exercice = (await genere(
      '5e/5G5G-1.ts',
      'mediane',
    )) as ExerciceApigeom & {
      pA: Element2D[]
      pB: Element2D[]
      pC: Element2D[]
      relative: boolean[]
    }
    exercice.nbQuestions = 1
    exercices.push(exercice)
    const figure = figuresEleve(exercice)[0]
    figure.loadJson(JSON.parse(figure.json))
    const [A, B, C] = [exercice.pA[0], exercice.pB[0], exercice.pC[0]].map(
      (point) => figure.elements.get(point.id),
    ) as Point[]
    const milieu = figure.create('Middle', { point1: A, point2: B })
    figure.create('Line', { point1: milieu, point2: C })
    expect(await verifie(exercice, 'mediane')).toEqual([['OK']])
  })

  it('6G3B : la médiatrice construite est acceptée', async () => {
    vi.mocked(Figure.prototype.shake).mockRestore()
    const exercice = (await genere(
      '6e/6G3B.ts',
      'mediatrice',
    )) as ExerciceApigeom & {
      ensembleDesQuestions: {
        mediatrice: {
          nomSeg1: string
          nomSeg2: string
          couleurMed: { couleurHTML: string }
        }[]
      }[]
    }
    exercices.push(exercice)
    const figure = figuresEleve(exercice)[0]
    figure.loadJson(JSON.parse(figure.json))
    const { nomSeg1, nomSeg2, couleurMed } =
      exercice.ensembleDesQuestions[0].mediatrice[0]
    const points = [...figure.elements.values()] as Point[]
    const A = points.find((p) => p.label === nomSeg1)!
    const B = points.find((p) => p.label === nomSeg2)!
    const segment = figure.create('Segment', { point1: A, point2: B })
    const milieu = figure.create('Middle', { point1: A, point2: B })
    figure.create('LinePerpendicular', {
      line: segment,
      point: milieu,
      color: couleurMed.couleurHTML,
    })
    expect(await verifie(exercice, 'mediatrice')).toEqual([['OK']])
  })

  it('6G3B : conserve la médiatrice orange et sa réussite à la relecture Capytale', async () => {
    const parametres = {
      sup: 2,
      sup2: 1,
      sup3: '1',
      nbQuestions: 1,
      numeroExercice: 2,
    }
    const exercice = await genere('6e/6G3B.ts', '0k4B', parametres)
    exercices.push(exercice)
    const figure = figuresEleve(exercice)[0]
    const [A, B] = pointsDeLaConstruction(exercice, figure)
    const segment = figure.create('Segment', { point1: A, point2: B })
    const milieu = figure.create('Middle', { point1: A, point2: B })
    const mediatrice = figure.create('LinePerpendicular', {
      line: segment,
      point: milieu,
    })
    // Comme la palette : la couleur sélectionnée devient le défaut de la figure.
    figure.options.color = 'orange'
    mediatrice.color = 'orange'
    expect(await verifie(exercice, '0k4B')).toEqual([['OK']])
    const sauvegarde = figureAnswerJson(figure)

    const copie = await genere('6e/6G3B.ts', '0k4B', parametres)
    exercices.push(copie)
    const figureRelue = figuresEleve(copie)[0]
    figureRelue.loadJson(JSON.parse(sauvegarde))
    expect((figureRelue.elements.get(mediatrice.id) as Element2D).color).toBe(
      'orange',
    )
    const exerciceRelu = copie as IExercice
    document.body.innerHTML = exerciceRelu.listeQuestions[0]
    expect(ApigeomFigureElement.verifQuestion(exerciceRelu, 0)).toMatchObject({
      isOk: true,
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
  })
})

function pointsDeLaConstruction(
  exercice: ExerciceApigeom,
  figure: Figure,
): Point[] {
  const { nomSeg1, nomSeg2, couleurMed } = (
    exercice as ExerciceApigeom & {
      ensembleDesQuestions: {
        mediatrice: {
          nomSeg1: string
          nomSeg2: string
          couleurMed: { couleurHTML: string }
        }[]
      }[]
    }
  ).ensembleDesQuestions[0].mediatrice[0]
  expect(couleurMed.couleurHTML).toBe('orange')
  const points = [...figure.elements.values()] as Point[]
  return [nomSeg1, nomSeg2].map((nom) => points.find((p) => p.label === nom)!)
}
