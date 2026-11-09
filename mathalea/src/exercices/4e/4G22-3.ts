import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import TripletPythagoricien from '../../lib/mathFonctions/TripletsPythagoriciens'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Résoudre un problème en lien avec le périmètre ou l'aire"
export const interactifReady = true

export const dateDePublication = '16/08/2026'

/**
 * Problèmes combinant une formule d'aire ou de périmètre et le théorème de Pythagore.
 * Toutes les longueurs sont construites à partir d'un triplet pythagoricien pour que
 * les valeurs cherchées soient exactes.
 * @author Rémi Angot
 */
export const uuid = 'f2967'

export const refs = {
  'fr-fr': ['4G22-3'],
  'fr-ch': ['10LCGM3A-8', '10LSGM3A-8', '11CTGM2A-8'],
}

/** Longueur, en centimètres sur le dessin, du plus grand côté des figures. */
const TAILLE_FIGURE = 6

/** Unités mises en forme pour les conclusions et les champs de réponse. */
const CM = '\\text{ cm}'
const CM2 = '\\text{ cm}^2'

const formulaireProblemes: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'problemes',
      label: 'Types de problèmes (poids d’apparition)',
      items: [
        {
          nom: 'perimetreTriangleRectangle',
          label:
            'Triangle rectangle : aire et un côté de l’angle droit, calculer le périmètre',
        },
        {
          nom: 'aireTriangleRectangle',
          label:
            'Triangle rectangle : hypoténuse et un côté de l’angle droit, calculer l’aire',
        },
        {
          nom: 'diagonaleRectangleAire',
          label: 'Rectangle : aire et un côté, calculer la diagonale',
        },
        {
          nom: 'diagonaleRectanglePerimetre',
          label: 'Rectangle : périmètre et un côté, calculer la diagonale',
        },
        {
          nom: 'aireRectangleDiagonale',
          label: 'Rectangle : diagonale et un côté, calculer l’aire',
        },
        {
          nom: 'perimetreLosange',
          label: 'Losange : aire et une diagonale, calculer le périmètre',
        },
        {
          nom: 'perimetreTriangleIsocele',
          label: 'Triangle isocèle : aire et base, calculer le périmètre',
        },
      ],
    },
    { type: 'case', nom: 'figure', label: 'Avec une figure', defaut: true },
  ],
}

/** Facteur d'échelle du dessin pour que la plus grande longueur mesure `TAILLE_FIGURE`. */
function echelleFigure(...longueurs: number[]): number {
  return TAILLE_FIGURE / Math.max(...longueurs)
}

function assemble(objets: NestedObjetMathalea2dArray): string {
  return mathalea2d(
    Object.assign({ scale: 0.8, pixelsParCm: 25 }, fixeBordures(objets)),
    objets,
  )
}

/** Longueur en centimètres, telle qu'elle s'affiche sur une figure. */
function legende(longueur: number): string {
  return `${texNombre(longueur, 0)}${CM}`
}

/**
 * Triangle rectangle en `noms[0]`, les côtés de l'angle droit valant `cote1` (vers
 * `noms[1]`) et `cote2` (vers `noms[2]`). Le côté `cote1` est toujours coté ;
 * l'hypoténuse ne l'est que si l'énoncé la donne.
 */
function figureTriangleRectangle(
  noms: string,
  cote1: number,
  cote2: number,
  hypotenuse?: number,
): string {
  const k = echelleFigure(cote1, cote2)
  const A = pointAbstrait(0, 0, noms[0], 'below left')
  const B = pointAbstrait(cote1 * k, 0, noms[1], 'below right')
  const C = pointAbstrait(0, cote2 * k, noms[2], 'above left')
  const objets: NestedObjetMathalea2dArray = [
    polygone(A, B, C),
    labelPoint(A, B, C),
    codageAngleDroit(B, A, C),
    placeLatexSurSegment(legende(cote1), B, A, {
      distance: 0.6,
      horizontal: true,
      letterSize: 'small',
    }),
  ]
  if (hypotenuse != null) {
    objets.push(
      placeLatexSurSegment(legende(hypotenuse), C, B, {
        distance: 0.5,
        letterSize: 'small',
      }),
    )
  }
  return assemble(objets)
}

/**
 * Rectangle `noms` de côtés `cote1` (`noms[0]noms[1]`) et `cote2` (`noms[1]noms[2]`),
 * avec sa diagonale `[noms[0]noms[2]]`. Seul `cote1` est toujours coté ; la diagonale
 * ne l'est que si l'énoncé la donne.
 */
function figureRectangle(
  noms: string,
  cote1: number,
  cote2: number,
  diagonale?: number,
): string {
  const k = echelleFigure(cote1, cote2)
  const A = pointAbstrait(0, 0, noms[0], 'below left')
  const B = pointAbstrait(cote1 * k, 0, noms[1], 'below right')
  const C = pointAbstrait(cote1 * k, cote2 * k, noms[2], 'above right')
  const D = pointAbstrait(0, cote2 * k, noms[3], 'above left')
  const objets: NestedObjetMathalea2dArray = [
    polygone(A, B, C, D),
    segment(A, C),
    labelPoint(A, B, C, D),
    codageAngleDroit(A, B, C),
    placeLatexSurSegment(legende(cote1), B, A, {
      distance: 0.6,
      horizontal: true,
      letterSize: 'small',
    }),
  ]
  if (diagonale != null) {
    objets.push(
      placeLatexSurSegment(legende(diagonale), A, C, {
        distance: 0.5,
        letterSize: 'small',
      }),
    )
  }
  return assemble(objets)
}

/**
 * Losange `noms` dont les diagonales `[noms[0]noms[2]]` et `[noms[1]noms[3]]` mesurent
 * `diagonale1` et `diagonale2`, seule la première étant cotée. Leur point d'intersection
 * n'est nommé que dans la correction : la figure code seulement leur angle droit.
 */
function figureLosange(
  noms: string,
  diagonale1: number,
  diagonale2: number,
): string {
  const k = echelleFigure(diagonale1, diagonale2)
  const A = pointAbstrait((-diagonale1 * k) / 2, 0, noms[0], 'left')
  const B = pointAbstrait(0, (diagonale2 * k) / 2, noms[1], 'above')
  const C = pointAbstrait((diagonale1 * k) / 2, 0, noms[2], 'right')
  const D = pointAbstrait(0, (-diagonale2 * k) / 2, noms[3], 'below')
  const objets: NestedObjetMathalea2dArray = [
    polygone(A, B, C, D),
    segment(A, C),
    segment(B, D),
    labelPoint(A, B, C, D),
    codageAngleDroit(A, pointAbstrait(0, 0), B),
    codageSegments('//', 'black', A, B, B, C, C, D, D, A),
    // La cote est écrite sous la diagonale, sans dépasser la moitié du demi-losange.
    placeLatexSurSegment(legende(diagonale1), C, A, {
      distance: Math.min(0.7, (diagonale2 * k) / 4),
      horizontal: true,
      letterSize: 'small',
    }),
  ]
  return assemble(objets)
}

/**
 * Triangle isocèle en `noms[0]`, de base `[noms[1]noms[2]]` cotée, avec la hauteur issue
 * de `noms[0]`. Son pied n'est nommé que dans la correction.
 */
function figureTriangleIsocele(
  noms: string,
  base: number,
  hauteur: number,
): string {
  const k = echelleFigure(base, hauteur)
  const A = pointAbstrait(0, hauteur * k, noms[0], 'above')
  const B = pointAbstrait((-base * k) / 2, 0, noms[1], 'below left')
  const C = pointAbstrait((base * k) / 2, 0, noms[2], 'below right')
  const H = pointAbstrait(0, 0)
  const objets: NestedObjetMathalea2dArray = [
    polygone(A, B, C),
    segment(A, H),
    labelPoint(A, B, C),
    codageAngleDroit(B, H, A),
    codageSegments('//', 'black', A, B, A, C),
    placeLatexSurSegment(legende(base), C, B, {
      distance: 0.6,
      horizontal: true,
      letterSize: 'small',
    }),
  ]
  return assemble(objets)
}

/**
 * Rédaction du calcul de l'hypoténuse d'un triangle rectangle dont on connaît les deux
 * côtés de l'angle droit.
 */
function calculHypotenuse(
  nomTriangle: string,
  nomAngleDroit: string,
  nomHypotenuse: string,
  nomCote1: string,
  nomCote2: string,
  cote1: number,
  cote2: number,
): string {
  const carre = cote1 * cote1 + cote2 * cote2
  const hypotenuse = Math.sqrt(carre)
  return `Le triangle $${nomTriangle}$ est rectangle en $${nomAngleDroit}$, donc d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${nomCote1}^2 + ${nomCote2}^2$<br>
  $${nomHypotenuse}^2 = ${texNombre(cote1, 0)}^2 + ${texNombre(cote2, 0)}^2 = ${texNombre(cote1 * cote1, 0)} + ${texNombre(cote2 * cote2, 0)} = ${texNombre(carre, 0)}$<br>
  $${nomHypotenuse} = \\sqrt{${texNombre(carre, 0)}} = ${texNombre(hypotenuse, 0)}$.`
}

/**
 * Rédaction du calcul d'un côté de l'angle droit d'un triangle rectangle dont on connaît
 * l'hypoténuse et l'autre côté de l'angle droit.
 */
function calculCoteAngleDroit(
  nomTriangle: string,
  nomAngleDroit: string,
  nomHypotenuse: string,
  nomCoteConnu: string,
  nomCoteCherche: string,
  hypotenuse: number,
  coteConnu: number,
): string {
  const carre = hypotenuse * hypotenuse - coteConnu * coteConnu
  const coteCherche = Math.sqrt(carre)
  return `Le triangle $${nomTriangle}$ est rectangle en $${nomAngleDroit}$, donc d'après le théorème de Pythagore :<br>
  $${nomHypotenuse}^2 = ${nomCoteConnu}^2 + ${nomCoteCherche}^2$<br>
  $${texNombre(hypotenuse, 0)}^2 = ${texNombre(coteConnu, 0)}^2 + ${nomCoteCherche}^2$<br>
  $${nomCoteCherche}^2 = ${texNombre(hypotenuse * hypotenuse, 0)} - ${texNombre(coteConnu * coteConnu, 0)} = ${texNombre(carre, 0)}$<br>
  $${nomCoteCherche} = \\sqrt{${texNombre(carre, 0)}} = ${texNombre(coteCherche, 0)}$.`
}

/** Phrase de conclusion, avec la valeur cherchée mise en évidence. */
function conclusion(debut: string, valeur: number, unite: string): string {
  return `${debut} $${miseEnEvidence(texNombre(valeur, 0))}${unite}$.`
}

export default class ProblemesPerimetreAirePythagore extends ExerciceSimple {
  niveau: number = 4
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 3
    this.spacingCorr = 2
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.besoinFormulaireComplexe = formulaireProblemes
    this.sup = serialiseFormulaireComplexe(
      formulaireProblemes,
      valeursParDefaut(formulaireProblemes),
    )
  }

  nouvelleVersion(): void {
    const params = lireFormulaireComplexe(formulaireProblemes, this.sup)
    const avecFigure = params.case('figure')
    const probleme = this.fromQuestionPlan('probleme', (nbQuestions) =>
      params.repartition('problemes', nbQuestions),
    )
    // Dans le losange et le triangle isocèle, deux longueurs valent le double d'un côté
    // de l'angle droit : on part de triplets plus petits pour rester raisonnable.
    const maxTriplet =
      probleme === 'perimetreLosange' || probleme === 'perimetreTriangleIsocele'
        ? 25
        : 40
    const [petitCote, grandCote, hypotenuse] = TripletPythagoricien.getTriplets(
      maxTriplet,
      1,
    )[0]
    // La longueur donnée par l'énoncé est tantôt la plus petite, tantôt la plus grande.
    const [cote1, cote2] = choice([
      [petitCote, grandCote],
      [grandCote, petitCote],
    ])

    switch (probleme) {
      case 'aireTriangleRectangle': {
        const noms = choisitLettresDifferentes(3).join('')
        const [A, B, C] = noms
        const aire = (cote1 * cote2) / 2
        this.reponse = aire
        this.optionsChampTexte = { texteApres: ' $\\text{cm}^2$' }
        this.question = `Le triangle $${noms}$ est rectangle en $${A}$, $${A}${B} = ${texNombre(cote1, 0)}${CM}$ et $${B}${C} = ${texNombre(hypotenuse, 0)}${CM}$.<br>
        Calculer l'aire du triangle $${noms}$.`
        if (avecFigure) {
          this.question += `<br>${figureTriangleRectangle(noms, cote1, cote2, hypotenuse)}`
        }
        this.correction = `${calculCoteAngleDroit(noms, A, `${B}${C}`, `${A}${B}`, `${A}${C}`, hypotenuse, cote1)}<br>
        L'aire d'un triangle rectangle est le demi-produit des côtés de l'angle droit :<br>
        $\\mathcal{A} = \\dfrac{${A}${B} \\times ${A}${C}}{2} = \\dfrac{${texNombre(cote1, 0)} \\times ${texNombre(cote2, 0)}}{2} = ${texNombre(aire, 0)}$.<br>
        ${conclusion(`L'aire du triangle $${noms}$ est égale à`, aire, CM2)}`
        break
      }

      case 'diagonaleRectangleAire': {
        const noms = choisitLettresDifferentes(4).join('')
        const [A, B, C] = noms
        const aire = cote1 * cote2
        this.reponse = hypotenuse
        this.optionsChampTexte = { texteApres: ' cm' }
        this.question = `$${noms}$ est un rectangle d'aire $${texNombre(aire, 0)}${CM2}$ tel que $${A}${B} = ${texNombre(cote1, 0)}${CM}$.<br>
        Calculer la longueur de sa diagonale $[${A}${C}]$.`
        if (avecFigure) {
          this.question += `<br>${figureRectangle(noms, cote1, cote2)}`
        }
        this.correction = `L'aire d'un rectangle est le produit de ses deux dimensions :<br>
        $\\mathcal{A} = ${A}${B} \\times ${B}${C}$<br>
        $${texNombre(aire, 0)} = ${texNombre(cote1, 0)} \\times ${B}${C}$<br>
        $${B}${C} = \\dfrac{${texNombre(aire, 0)}}{${texNombre(cote1, 0)}} = ${texNombre(cote2, 0)}$.<br>
        ${calculHypotenuse(`${A}${B}${C}`, B, `${A}${C}`, `${A}${B}`, `${B}${C}`, cote1, cote2)}<br>
        ${conclusion(`La diagonale $[${A}${C}]$ mesure`, hypotenuse, CM)}`
        break
      }

      case 'diagonaleRectanglePerimetre': {
        const noms = choisitLettresDifferentes(4).join('')
        const [A, B, C] = noms
        const perimetre = 2 * (cote1 + cote2)
        this.reponse = hypotenuse
        this.optionsChampTexte = { texteApres: ' cm' }
        this.question = `$${noms}$ est un rectangle de périmètre $${texNombre(perimetre, 0)}${CM}$ tel que $${A}${B} = ${texNombre(cote1, 0)}${CM}$.<br>
        Calculer la longueur de sa diagonale $[${A}${C}]$.`
        if (avecFigure) {
          this.question += `<br>${figureRectangle(noms, cote1, cote2)}`
        }
        this.correction = `Le périmètre d'un rectangle vaut deux fois la somme de ses deux dimensions :<br>
        $\\mathcal{P} = 2 \\times (${A}${B} + ${B}${C})$<br>
        $${texNombre(perimetre, 0)} = 2 \\times (${texNombre(cote1, 0)} + ${B}${C})$<br>
        $${texNombre(perimetre / 2, 0)} = ${texNombre(cote1, 0)} + ${B}${C}$<br>
        $${B}${C} = ${texNombre(perimetre / 2, 0)} - ${texNombre(cote1, 0)} = ${texNombre(cote2, 0)}$.<br>
        ${calculHypotenuse(`${A}${B}${C}`, B, `${A}${C}`, `${A}${B}`, `${B}${C}`, cote1, cote2)}<br>
        ${conclusion(`La diagonale $[${A}${C}]$ mesure`, hypotenuse, CM)}`
        break
      }

      case 'aireRectangleDiagonale': {
        const noms = choisitLettresDifferentes(4).join('')
        const [A, B, C] = noms
        const aire = cote1 * cote2
        this.reponse = aire
        this.optionsChampTexte = { texteApres: ' $\\text{cm}^2$' }
        this.question = `$${noms}$ est un rectangle tel que $${A}${B} = ${texNombre(cote1, 0)}${CM}$ et dont la diagonale $[${A}${C}]$ mesure $${texNombre(hypotenuse, 0)}${CM}$.<br>
        Calculer l'aire du rectangle $${noms}$.`
        if (avecFigure) {
          this.question += `<br>${figureRectangle(noms, cote1, cote2, hypotenuse)}`
        }
        this.correction = `${calculCoteAngleDroit(`${A}${B}${C}`, B, `${A}${C}`, `${A}${B}`, `${B}${C}`, hypotenuse, cote1)}<br>
        L'aire d'un rectangle est le produit de ses deux dimensions :<br>
        $\\mathcal{A} = ${A}${B} \\times ${B}${C} = ${texNombre(cote1, 0)} \\times ${texNombre(cote2, 0)} = ${texNombre(aire, 0)}$.<br>
        ${conclusion(`L'aire du rectangle $${noms}$ est égale à`, aire, CM2)}`
        break
      }

      case 'perimetreLosange': {
        const noms = choisitLettresDifferentes(4).join('')
        const [A, B, C, D] = noms
        const O = choisitLettresDifferentes(1, noms)[0]
        const diagonale1 = 2 * cote1
        const diagonale2 = 2 * cote2
        const aire = (diagonale1 * diagonale2) / 2
        const perimetre = 4 * hypotenuse
        this.reponse = perimetre
        this.optionsChampTexte = { texteApres: ' cm' }
        this.question = `$${noms}$ est un losange d'aire $${texNombre(aire, 0)}${CM2}$ dont la diagonale $[${A}${C}]$ mesure $${texNombre(diagonale1, 0)}${CM}$.<br>
        Calculer le périmètre du losange $${noms}$.`
        if (avecFigure) {
          this.question += `<br>${figureLosange(noms, diagonale1, diagonale2)}`
        }
        this.correction = `L'aire d'un losange est le demi-produit de ses diagonales :<br>
        $\\mathcal{A} = \\dfrac{${A}${C} \\times ${B}${D}}{2}$<br>
        $${texNombre(aire, 0)} = \\dfrac{${texNombre(diagonale1, 0)} \\times ${B}${D}}{2}$<br>
        $${texNombre(diagonale1 * diagonale2, 0)} = ${texNombre(diagonale1, 0)} \\times ${B}${D}$<br>
        $${B}${D} = \\dfrac{${texNombre(diagonale1 * diagonale2, 0)}}{${texNombre(diagonale1, 0)}} = ${texNombre(diagonale2, 0)}$.<br>
        Les diagonales d'un losange se coupent perpendiculairement en leur milieu. En notant $${O}$ leur point d'intersection :<br>
        $${A}${O} = \\dfrac{${texNombre(diagonale1, 0)}}{2} = ${texNombre(cote1, 0)}$ et $${O}${B} = \\dfrac{${texNombre(diagonale2, 0)}}{2} = ${texNombre(cote2, 0)}$.<br>
        ${calculHypotenuse(`${A}${O}${B}`, O, `${A}${B}`, `${A}${O}`, `${O}${B}`, cote1, cote2)}<br>
        Les quatre côtés d'un losange ont la même longueur, donc son périmètre vaut :<br>
        $4 \\times ${texNombre(hypotenuse, 0)} = ${texNombre(perimetre, 0)}$.<br>
        ${conclusion(`Le périmètre du losange $${noms}$ est égal à`, perimetre, CM)}`
        break
      }

      case 'perimetreTriangleIsocele': {
        const noms = choisitLettresDifferentes(3).join('')
        const [A, B, C] = noms
        const H = choisitLettresDifferentes(1, noms)[0]
        const base = 2 * cote1
        const hauteur = cote2
        const aire = cote1 * cote2
        const perimetre = base + 2 * hypotenuse
        this.reponse = perimetre
        this.optionsChampTexte = { texteApres: ' cm' }
        this.question = `Le triangle $${noms}$ est isocèle en $${A}$. Sa base $[${B}${C}]$ mesure $${texNombre(base, 0)}${CM}$ et son aire est égale à $${texNombre(aire, 0)}${CM2}$.<br>
        Calculer le périmètre du triangle $${noms}$.`
        if (avecFigure) {
          this.question += `<br>${figureTriangleIsocele(noms, base, hauteur)}`
        }
        this.correction = `Notons $${H}$ le pied de la hauteur issue de $${A}$. Comme le triangle $${noms}$ est isocèle en $${A}$, $${H}$ est le milieu de $[${B}${C}]$.<br>
        L'aire d'un triangle est le demi-produit d'une base par la hauteur associée :<br>
        $\\mathcal{A} = \\dfrac{${B}${C} \\times ${A}${H}}{2}$<br>
        $${texNombre(aire, 0)} = \\dfrac{${texNombre(base, 0)} \\times ${A}${H}}{2}$<br>
        $${texNombre(base * hauteur, 0)} = ${texNombre(base, 0)} \\times ${A}${H}$<br>
        $${A}${H} = \\dfrac{${texNombre(base * hauteur, 0)}}{${texNombre(base, 0)}} = ${texNombre(hauteur, 0)}$.<br>
        De plus $${H}${B} = \\dfrac{${texNombre(base, 0)}}{2} = ${texNombre(cote1, 0)}$.<br>
        ${calculHypotenuse(`${A}${H}${B}`, H, `${A}${B}`, `${A}${H}`, `${H}${B}`, hauteur, cote1)}<br>
        Comme $${A}${B} = ${A}${C}$, le périmètre du triangle $${noms}$ vaut :<br>
        $${texNombre(base, 0)} + 2 \\times ${texNombre(hypotenuse, 0)} = ${texNombre(perimetre, 0)}$.<br>
        ${conclusion(`Le périmètre du triangle $${noms}$ est égal à`, perimetre, CM)}`
        break
      }

      case 'perimetreTriangleRectangle':
      default: {
        const noms = choisitLettresDifferentes(3).join('')
        const [A, B, C] = noms
        const aire = (cote1 * cote2) / 2
        const perimetre = cote1 + cote2 + hypotenuse
        this.reponse = perimetre
        this.optionsChampTexte = { texteApres: ' cm' }
        this.question = `Le triangle $${noms}$ est rectangle en $${A}$. Son aire est égale à $${texNombre(aire, 0)}${CM2}$ et $${A}${B} = ${texNombre(cote1, 0)}${CM}$.<br>
        Calculer le périmètre du triangle $${noms}$.`
        if (avecFigure) {
          this.question += `<br>${figureTriangleRectangle(noms, cote1, cote2)}`
        }
        this.correction = `L'aire d'un triangle rectangle est le demi-produit des côtés de l'angle droit :<br>
        $\\mathcal{A} = \\dfrac{${A}${B} \\times ${A}${C}}{2}$<br>
        $${texNombre(aire, 0)} = \\dfrac{${texNombre(cote1, 0)} \\times ${A}${C}}{2}$<br>
        $${texNombre(cote1 * cote2, 0)} = ${texNombre(cote1, 0)} \\times ${A}${C}$<br>
        $${A}${C} = \\dfrac{${texNombre(cote1 * cote2, 0)}}{${texNombre(cote1, 0)}} = ${texNombre(cote2, 0)}$.<br>
        ${calculHypotenuse(noms, A, `${B}${C}`, `${A}${B}`, `${A}${C}`, cote1, cote2)}<br>
        Le périmètre du triangle $${noms}$ vaut :<br>
        $${texNombre(cote1, 0)} + ${texNombre(cote2, 0)} + ${texNombre(hypotenuse, 0)} = ${texNombre(perimetre, 0)}$.<br>
        ${conclusion(`Le périmètre du triangle $${noms}$ est égal à`, perimetre, CM)}`
        break
      }
    }
  }
}
