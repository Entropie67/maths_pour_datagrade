import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { interpolationDeLagrange } from '../../lib/mathFonctions/outilsMaths'
import { choice } from '../../lib/outils/arrayOutils'
import { reduirePolynomeDegre3 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { courbe } from '../../lib/2d/Courbe'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  lectureSolutionsAnimee,
  lectureSolutionsStatique,
  type IntervalleSolution,
} from '../../lib/2d/LectureSolutionsAnimee'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'

export const titre = 'Résoudre graphiquement une équation ou une inéquation $f(x)=g(x)$ ou $f(x) < g(x)$'
export const dateDePublication = '29/10/2023'
export const dateDeModifImportante = '08/11/2026'
export const interactifReady = true

/**
 * Résoudre graphiquement une équation ou une inéquation
 *
 * @author Jean-claude Lhote
 */

export const uuid = 'b5b65'

export const refs = {
  'fr-fr': ['2F32-2', '1Tec-F14', 'BP1RGEI03'],
  'fr-ch': ['2mIneq-1'],
}
type TypesDeFonction = 'constante' | 'affine' | 'poly2' | 'poly3'

function renseigneFonction(poly: Polynome) {
  const func = poly.fonction
  const monomesNormalized = poly.monomes.slice()
  while (monomesNormalized.length < 4) {
    monomesNormalized.push(0)
  }
  const [a, b, c, d]: [number, number, number, number] = monomesNormalized
    .map(Number)
    .reverse()
    .map((el: number) => (Math.abs(el) < 1e-10 ? 0 : el)) as [
    number,
    number,
    number,
    number,
  ]
  const expr: string = reduirePolynomeDegre3(a, b, c, d)
    .replaceAll('\\,', '')
    .replaceAll(',', '.')
  return { func, expr, poly }
}

/**
 * Les intervalles de solutions de fonc(x) ⩽ 0 (ou ⩾ 0, < 0, > 0) sur
 * [xMin ; xMax], connaissant les racines soluces de fonc. Avec une inégalité
 * stricte, les racines sont exclues (crochets ouverts). Un singleton a ses
 * deux bornes égales.
 * @param fonc
 * @param inferieur
 * @param strict
 */
export function intervallesSolutions(
  fonc: Polynome,
  soluces: number[],
  inferieur: boolean,
  xMin: number,
  xMax: number,
  strict = false,
): IntervalleSolution[] {
  const liste = [xMin, ...soluces, xMax]
  const values = liste.filter((el, i) => el !== liste[i + 1])
  const solutions: IntervalleSolution[] = []
  // Une borne est exclue si l'inégalité est stricte et que fonc s'y annule
  const estFermee = (x: number) => !strict || !soluces.includes(x)
  const intervalle = (gauche: number, droite: number) => ({
    gauche,
    droite,
    gaucheFerme: estFermee(gauche),
    droiteFerme: estFermee(droite),
  })
  for (let i = 0; i < values.length - 1; i++) {
    const middle = (values[i] + values[i + 1]) / 2
    const imageMiddle = fonc.image(middle)
    if ((imageMiddle < 0 && inferieur) || (!inferieur && imageMiddle > 0)) {
      solutions.push(intervalle(values[i], values[i + 1]))
    } else if (
      !strict &&
      i === values.length - 2 &&
      soluces[soluces.length - 1] === xMax
    ) {
      solutions.push(intervalle(values[i + 1], values[i + 1]))
    }
  }
  return solutions
}

/**
 * La fonction pour récupérer les intervalles de solutions
 * @param fonc
 * @param inferieur
 * @param strict
 */
export function chercheIntervalles(
  fonc: Polynome,
  soluces: number[],
  inferieur: boolean,
  xMin: number,
  xMax: number,
  strict = false,
): string {
  return intervallesSolutions(fonc, soluces, inferieur, xMin, xMax, strict)
    .map(({ gauche, droite, gaucheFerme, droiteFerme }) =>
      gauche === droite
        ? `\\{${texNombre(droite, 1)}\\}`
        : `${gaucheFerme ? '[' : ']'}${texNombre(gauche, 1)};${texNombre(droite, 1)}${droiteFerme ? ']' : '['}`,
    )
    .join('\\cup')
}

class resolutionEquationInequationGraphique extends Exercice {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = 'none' // Pour un exercice de type simple qui n'utilise pas le champ de réponse
    this.exoCustomResultat = true
    this.answers = {}
    this.sup2 = 10
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      3,
      '1 : Résoudre une équation\n2 : Résoudre une inéquation\n3: Résoudre une équation et une inéquation',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix des deux fonctions',
      10,
      'Constante-affine\nConstante-degré2\nConstante-degré3\nAffine-affine\nAffine-degré2\nAffine-degré3\nDegré2-degré2\nDegré2-degré3\nDegré3-degré3\nMélange',
    ]
    this.sup3 = '3'
    this.besoinFormulaire3Texte = [
      "Type d'inégalité",
      [
        'Nombres séparés par des tirets  :',
        '1 : Large (⩽ ou ⩾)',
        '2 : Stricte (< ou >)',
        '3 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion(): void {
    // on va chercher une spline aléatoire

    this.listeCorrections = ['']

    const aleaF1 = randint(1, 20, [5, 9, 10, 15]) // EE : J'enlève e, i, j et o.
    const f1 = lettreMinusculeDepuisChiffre(aleaF1)
    const f2 = lettreMinusculeDepuisChiffre(
      randint(1, 20, [5, 9, 10, 15, aleaF1]),
    )
    const choixFonctions = this.sup2 < 10 ? this.sup2 : randint(1, 9)
    let integraleDiff: number
    let f1Type: TypesDeFonction
    let f2Type: TypesDeFonction
    let fonction1: {
      func: (x: number) => number
      expr: string
      poly: Polynome
    }
    let fonction2: {
      func: (x: number) => number
      expr: string
      poly: Polynome
    }
    let texteCorr = ''
    const xbase = randint(-2, 2)
    const x0 = -4 + xbase
    const x1 = randint(-2, -1) + xbase
    const x2 = randint(0, 1) + xbase
    const x3 = 2 + xbase
    randint(0, 1) // ancien décalage de l'axe, conservé pour la suite des tirages
    // L'ensemble de définition [xMin ; xMax] contient les nœuds [x0 ; x3] et
    // s'étend tant que les deux courbes restent dans la fenêtre.
    let xMin = x0
    let xMax = x3
    let cpt = 0
    // Toutes les intersections dans l'ensemble de définition doivent avoir une
    // abscisse entière et être visibles, pour être lues sur le quadrillage.
    let intersectionsEntieres = false
    let solutionIsolee = false
    let noeudsDansFenetre = false
    // Valeurs extrêmes prises par les deux courbes sur [xMin ; xMax], pour
    // adapter la fenêtre graphique.
    let yBasCourbes = 0
    let yHautCourbes = 0
    do {
      // Une boucle pour tester des valeurs et on sort si les courbes sont suffisamment distantes      }
      // On choisit les noeuds passants (il en faut 4 pour déterminer un poly3, qui peut le plus peut le moins !
      cpt++
      let y0: number
      let y1: number
      let y2: number
      let y3: number
      let vec1: {
        u: number
        v: number
      }
      let vec2: {
        u: number
        v: number
      }
      let vec3: {
        u: number
        v: number
      }
      // Calcul des coordonnées d'un vecteur
      const vector = (x0: number, y0: number, x1: number, y1: number) =>
        Object.assign(
          {},
          {
            u: x1 - x0,
            v: y1 - y0,
          },
        )
      // est-ce que deux vecteurs sont colinéaires ou à peu près colinéaires
      const areColineaires = (
        v1: {
          u: number
          v: number
        },
        v2: {
          u: number
          v: number
        },
      ) => Boolean(Math.abs(v1.u * v2.v - v1.v * v2.u) < 0.1)
      if (this.sup2 < 7) {
        // il faut des points alignés et une pente pas trop importante
        do {
          y0 = randint(-2, 2)
          y1 = randint(-3, 3, y0)
        } while (Math.abs((y1 - y0) / (x1 - x0)) > 1)
        const a = (y1 - y0) / (x1 - x0)
        const b = y1 - a * x1
        y2 = a * x2 + b
        y3 = a * x3 + b
      } else {
        do {
          y0 = randint(-2, 2)
          y1 = randint(-3, 3, y0)
          y2 = randint(-4, 4, y1)
          y3 = randint(-2, 3, [y0, y2, y1])
          vec1 = vector(x0, y0, x1, y1)
          vec2 = vector(x0, y0, x2, y2)
          vec3 = vector(x0, y0, x3, y3)
        } while (areColineaires(vec1, vec2) || areColineaires(vec1, vec3)) // On cherche des points non alignés
      }

      // les noeuds passants qu'on trie dans l'ordre des x croissants
      // on initialise noeudsPassants1 et noeudsPassants2. Les 4 noeuds sont identiques, mais on va les changer selon le type de fonction

      const noeudsPassants1 = [
        { x: x0, y: y0 },
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 },
      ].sort((el1, el2) => el1.x - el2.x)
      const noeudsPassants2 = [
        { x: x0, y: y0 },
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 },
      ].sort((el1, el2) => el1.x - el2.x)

      switch (
        choixFonctions // On choisit les fonctions demandées
      ) {
        case 1: // constante et affine
          {
            f1Type = 'constante'
            f2Type = 'affine'
            // C'est l'index du point d'intersection
            const indexPI = randint(0, 1)
            // c'est l'index du point non commun
            const indexPNC = randint(0, 3, indexPI)
            // la fonction constante
            fonction1 = {
              // On prend un noeud au milieu de la liste pour éviter d'avoir une tangente en début de graphe.
              func: () => noeudsPassants1[indexPI].y,
              expr: `${noeudsPassants1[indexPI].y}`,
              poly: new Polynome({
                rand: false,
                deg: 3,
                coeffs: [noeudsPassants1[indexPI].y, 0, 0, 0],
              }),
            }
            // la fonction affine
            const noeudsFonction = noeudsPassants1.filter(
              (el, i) => i === indexPI || i === indexPNC,
            )
            const poly = interpolationDeLagrange(noeudsFonction)
            fonction2 = renseigneFonction(poly)
          }
          break
        case 2:
          {
            // constante et degré2
            f1Type = 'constante'
            f2Type = 'poly2'
            const indexPI1 = 0
            const indexPI2 = randint(1, 3)
            fonction1 = {
              func: () => noeudsPassants1[indexPI1].y,
              expr: `${noeudsPassants1[indexPI1].y}`,
              poly: new Polynome({
                rand: false,
                deg: 3,
                coeffs: [noeudsPassants1[indexPI1].y, 0, 0, 0],
              }),
            } // la fonction constante
            noeudsPassants2[indexPI2].y = noeudsPassants1[0].y
            // c'est l'index du point non commun
            const indexNC1 = randint(0, 3, [indexPI1, indexPI2])
            noeudsPassants2[indexNC1].y = randint(-5, 5, [
              noeudsPassants1[indexPI1].y,
              noeudsPassants1[indexPI1].y - 1,
              noeudsPassants1[indexPI1].y + 1,
            ])
            const noeudsFonction = noeudsPassants2.filter(
              (el, i) => i === indexPI1 || i === indexPI2 || i === indexNC1,
            )
            const poly = interpolationDeLagrange(noeudsFonction)
            fonction2 = renseigneFonction(poly) // une fonction de degré 2
          }
          break
        case 3:
          {
            // constante et degré3
            f1Type = 'constante'
            f2Type = 'poly3'
            const indexPI1 = randint(0, 1)
            const indexPI2 = randint(1, 3, indexPI1)
            const indexPI3 = randint(1, 3, [indexPI1, indexPI2])
            const indexNC = randint(0, 3, [indexPI1, indexPI2, indexPI3])
            fonction1 = {
              // On prend un noeud au milieu de la liste pour éviter d'avoir une tangente en début de graphe.
              func: () => noeudsPassants1[indexPI1].y,
              expr: `${noeudsPassants1[indexPI1].y}`,
              poly: new Polynome({
                rand: false,
                deg: 3,
                coeffs: [noeudsPassants1[indexPI1].y, 0, 0, 0],
              }),
            } // la fonction constante
            for (const index of [indexPI1, indexPI2, indexPI3]) {
              noeudsPassants2[index].y = noeudsPassants1[indexPI1].y
            }
            noeudsPassants2[indexNC].y = randint(-5, 5, [
              noeudsPassants1[indexPI1].y,
              noeudsPassants1[indexPI1].y - 1,
              noeudsPassants1[indexPI1].y + 1,
            ])
            const poly = interpolationDeLagrange(noeudsPassants2)
            fonction2 = renseigneFonction(poly) // une fonction de degré 3
          }
          break
        case 4: // 2 affines
          f1Type = 'affine'
          f2Type = 'affine'
          {
            const indexPI1 = randint(0, 3)
            const indexNC1 = randint(0, 2, indexPI1)
            const indexNC2 = randint(0, 2, [indexPI1, indexNC1])
            const noeudsFonction1 = noeudsPassants1.filter(
              (el, i) => i === indexPI1 || i === indexNC1,
            )
            noeudsPassants2[indexNC2].y = randint(-4, 4, [
              noeudsPassants1[indexPI1].y,
              noeudsPassants1[indexNC1].y,
            ])
            const noeudsFonction2 = noeudsPassants2.filter(
              (el, i) => i === indexPI1 || i === indexNC2,
            )
            const poly1 = interpolationDeLagrange(noeudsFonction1)
            fonction1 = renseigneFonction(poly1) // une fonction affine
            const poly2 = interpolationDeLagrange(noeudsFonction2)
            fonction2 = renseigneFonction(poly2) // la deuxième fonction affine
          }
          break
        case 5: // affine et degré2
          f1Type = 'affine'
          f2Type = 'poly2'
          {
            const indexPI = randint(0, 3)
            const indexPNC1 = randint(0, 3, indexPI)
            const indexPI2 = randint(0, 3, [indexPI, indexPNC1])
            const noeudsFonction1 = noeudsPassants1.filter(
              (el, i) => i === indexPI || i === indexPNC1,
            )
            const poly1 = interpolationDeLagrange(noeudsFonction1)
            fonction1 = renseigneFonction(poly1) // la fonction affine
            for (const index of [indexPI, indexPI2]) {
              noeudsPassants2[index].y = fonction1.func(
                noeudsPassants2[index].x,
              )
            }
            noeudsPassants2[indexPNC1].y = randint(-5, 5, [
              noeudsPassants1[indexPNC1].y,
              noeudsPassants2[0].y,
              noeudsPassants2[1].y,
              noeudsPassants2[2].y,
              noeudsPassants2[3].y,
            ])
            const noeudsFonction2 = noeudsPassants2.filter(
              (el, i) => i === indexPI || i === indexPNC1 || i === indexPI2,
            )
            const poly2 = interpolationDeLagrange(noeudsFonction2)
            fonction2 = renseigneFonction(poly2) // la fonction degré 2
          }
          break
        case 6:
          {
            // affine et degré3
            f1Type = 'affine'
            f2Type = 'poly3'
            const indexPI = randint(0, 3)
            const indexPI1 = randint(0, 3, indexPI)
            const indexPI2 = randint(0, 3, [indexPI, indexPI1])
            const indexPNC1 = randint(0, 3, [indexPI, indexPI1, indexPI2])
            const noeudsFonction1 = noeudsPassants1.filter(
              (el, i) => i === indexPI || i === indexPI1,
            )
            const poly1 = interpolationDeLagrange(noeudsFonction1)
            fonction1 = renseigneFonction(poly1) // la fonction affine
            for (const index of [indexPI, indexPI1, indexPI2]) {
              noeudsPassants2[index].y = fonction1.func(
                noeudsPassants2[index].x,
              )
            }
            noeudsPassants2[indexPNC1].y = randint(-5, 5, [
              noeudsPassants1[indexPNC1].y,
              noeudsPassants2[0].y,
              noeudsPassants2[1].y,
              noeudsPassants2[2].y,
              noeudsPassants2[3].y,
            ])
            const poly2 = interpolationDeLagrange(noeudsPassants2)
            fonction2 = renseigneFonction(poly2) // la fonction degré 3
          }
          break
        case 7: // degré2 et degré2
          f1Type = 'poly2'
          f2Type = 'poly2'
          {
            const indexPI = choice([0, 3])
            const indexPI1 = randint(0, 3, [indexPI, 2])
            const indexPNC1 = randint(0, 3, [indexPI, indexPI1])
            const indexPNC2 = randint(0, 3, [indexPI, indexPNC1, indexPI1])
            const noeudsFonction1 = noeudsPassants1.filter(
              (el, i) => i === indexPI || i === indexPI1 || i === indexPNC1,
            )
            const noeudsFonction2 = noeudsPassants2.filter(
              (el, i) => i === indexPI || i === indexPNC1 || i === indexPNC2,
            )
            const poly1 = interpolationDeLagrange(noeudsFonction1)
            fonction1 = renseigneFonction(poly1) // la première parabole
            const poly2 = interpolationDeLagrange(noeudsFonction2)
            fonction2 = renseigneFonction(poly2) // la deuxième parabole
          }
          break
        case 8: // degré2 et degré3
          f1Type = 'poly2'
          f2Type = 'poly3'
          {
            const indexPI1 = randint(0, 3)
            const indexPI2 = randint(0, 3, indexPI1)
            const indexPI3 = randint(0, 3, [indexPI1, indexPI2])
            const noeudsFonction1 = noeudsPassants1.filter(
              (el, i) => i === indexPI1 || i === indexPI3 || i === indexPI2,
            )
            const poly1 = interpolationDeLagrange(noeudsFonction1)
            fonction1 = renseigneFonction(poly1) // la parabole
            const poly2 = interpolationDeLagrange(noeudsPassants2)
            fonction2 = renseigneFonction(poly2) // la fonction degré 3
          }
          break
        case 9:
          // degré3 et degré3

          f1Type = 'poly3'
          f2Type = 'poly3'
          {
            const poly1 = interpolationDeLagrange(noeudsPassants1) // une fonction de degré 3
            fonction1 = renseigneFonction(poly1)
            // on modifie la valeur y de l'un des points passants qui devient non passant pour la fonction1
            const indexPNC1 = randint(1, 2)
            // const ordonnees = noeudsPassants1.map((el) => el.y)
            /* let newY: number
            do {
              newY =
                (noeudsPassants1[indexPNC1].y > 0 ? -1 : 1) *
                randint(-4, 4, ordonnees)
            } while (Math.abs(newY - noeudsPassants1[indexPNC1].y) > 5)
             */
            noeudsPassants2[indexPNC1].y =
              noeudsPassants1[indexPNC1].y !== 0
                ? -noeudsPassants1[indexPNC1].y
                : 2
            const poly2 = interpolationDeLagrange(noeudsPassants2)
            fonction2 = renseigneFonction(poly2) // une fonction de degré 3
          }
          break
        default: // affine et affine (c'est le this.sup par défaut) Le code du case 4 est dupliqué ici pour avoir une valeur par défaut au cas où
          f1Type = 'affine'
          f2Type = 'affine'
          {
            const indexPI = randint(0, 3)
            const indexPNC1 = randint(0, 3, indexPI)
            const indexPNC2 = randint(0, 3, [indexPI, indexPNC1])
            const noeudsFonction1 = noeudsPassants1.filter(
              (el, i) => i === indexPI || i === indexPNC1,
            )
            const noeudsFonction2 = noeudsPassants2.filter(
              (el, i) => i === indexPI || i === indexPNC2,
            )
            const poly1 = interpolationDeLagrange(noeudsFonction1)
            fonction1 = renseigneFonction(poly1) // une fonction affine
            const poly2 = interpolationDeLagrange(noeudsFonction2)
            fonction2 = renseigneFonction(poly2) // la deuxième fonction affine
          }

          break
      }
      const integrales = []
      const poly = fonction1.poly
      if (poly == null) {
        // normalement, ça ne doit pas arriver car la seule à ne pas avoir la propriété poly est la spline qui est éliminée
        // d'ailleurs typescript le sait puisque dans le test, si on met f1Type !== 'spline' il nous fait remarquer que c'est pas la peine !
        // donc ce test est là juste pour que typescript ne me dise pas que fonctions[0].poly peut être undefined
        throw Error("la fonction 1 n'a pas de polynôme alors qu'elle devrait")
      }
      const diff = poly.multiply(-1).add(fonction2.poly)
      // Les deux courbes restent-elles entre -7 et 7 sur [a ; b] ?
      const dansFenetre = (a: number, b: number) => {
        for (let x = a; x <= b + 1e-9; x += 0.05) {
          if (
            Math.abs(fonction1.func(x)) > 7 ||
            Math.abs(fonction2.func(x)) > 7
          )
            return false
        }
        return true
      }
      noeudsDansFenetre = dansFenetre(x0, x3)
      xMin = x0
      xMax = x3
      while (xMin > x0 - 3 && dansFenetre(xMin - 1, xMin)) xMin--
      while (xMax < x3 + 3 && dansFenetre(xMax, xMax + 1)) xMax++
      const racinesDomaine = (diff.racines() ?? [])
        .filter((r) => r >= xMin - 1e-6 && r <= xMax + 1e-6)
        .sort((a, b) => a - b)
      intersectionsEntieres = racinesDomaine.every(
        (r) => Math.abs(r - Math.round(r)) < 1e-6,
      )
      // On évite les solutions isolées de l'inéquation, que chercheIntervalles
      // ne sait pas écrire : intersection sur une borne du domaine, ou courbes
      // qui se touchent sans se croiser (l'écart garde le même signe).
      solutionIsolee = racinesDomaine.some(
        (r) =>
          Math.abs(r - xMin) < 1e-6 ||
          Math.abs(r - xMax) < 1e-6 ||
          diff.image(r - 0.05) * diff.image(r + 0.05) > 0,
      )
      // Entre deux intersections consécutives (ou une borne), les courbes
      // doivent s'écarter suffisamment pour être bien distinctes.
      const bornesZones = [xMin, ...racinesDomaine, xMax]
      for (let k = 0; k < bornesZones.length - 1; k++) {
        const [a, b] = [bornesZones[k], bornesZones[k + 1]]
        if (b - a < 1e-6) continue
        let ecartMax = 0
        for (let x = a; x <= b; x += (b - a) / 20) {
          ecartMax = Math.max(ecartMax, Math.abs(diff.image(x)))
        }
        integrales.push(ecartMax)
      }
      integraleDiff = integrales.length > 0 ? Math.min(...integrales) : 0
      const ordonnees: number[] = []
      for (let x = xMin; x <= xMax + 1e-9; x += 0.05) {
        ordonnees.push(fonction1.func(x), fonction2.func(x))
      }
      yBasCourbes = Math.min(...ordonnees)
      yHautCourbes = Math.max(...ordonnees)
    } while (
      (integraleDiff < 0.5 ||
        !intersectionsEntieres ||
        solutionIsolee ||
        !noeudsDansFenetre ||
        // pas de fonction nulle (confondue avec l'axe des abscisses) : un
        // polynôme de degré au plus 3 qui s'annule en 4 points est nul
        [fonction1, fonction2].some((fct) =>
          [0, 1, 2, 3].every((x) => Math.abs(fct.func(x)) < 1e-9),
        )) &&
      cpt < 1000
    )
    const polyDiff = fonction1.poly.add(fonction2.poly.multiply(-1))

    // on s'occupe de la fonction 1 et du point mobile dessus on trace tout ça.
    // Maintenant, la fonction1 n'est jamais une spline !

    let enonce = `On considère les fonctions $${f1}$ et $${f2}$ définies sur $[${xMin}\\,;\\,${xMax}]$ et dont on a représenté ci-dessous les courbes respectives.<br><br>`
    // let diff
    let soluces: number[]
    const inferieur = Boolean(choice([true, false]))
    const strict =
      Number(
        gestionnaireFormulaireTexte({
          saisie: this.sup3,
          min: 1,
          max: 2,
          melange: 3,
          defaut: 3,
          nbQuestions: 1,
        })[0],
      ) === 2
    const symbole = inferieur
      ? strict
        ? '<'
        : '\\leqslant'
      : strict
        ? '>'
        : '\\geqslant'
    // \mathrel rend au symbole mis en évidence les espaces d'une relation
    const signeInegalite = `\\mathrel{${miseEnEvidence(symbole, 'black')}}`

    soluces = []
    if (fonction1.poly == null && fonction2.poly == null)
      throw Error("Un problème avec l'un des polynômes.")

    const racines = polyDiff.racines()
    if (racines == null)
      throw Error(
        `Il n'y aurait pas de points d'intersection !!! polyDiff = ${polyDiff.toLatex()}`,
      )
    const racinesArrondies = racines.map((el) => Number(el.toFixed(1)))
    for (let n = 0; n < racinesArrondies.length; n++) {
      const isInside =
        racinesArrondies[n] <= xMax && racinesArrondies[n] >= xMin
      if (isInside) {
        soluces.push(racinesArrondies[n])
      }
    }
    soluces = Array.from(new Set(soluces)) as number[]
    soluces = soluces.sort((a: number, b: number) => a - b)
    if (this.sup === 1 || this.sup === 3) {
      enonce += `Résoudre graphiquement l'équation $${f1}(x)=${f2}(x)$ sur $[${xMin}\\,;\\,${xMax}]$.<br>`
      if (this.interactif)
        enonce +=
          'Si besoin, les solutions doivent être séparées par un point-virgule.<br>'
      texteCorr += `L'ensemble des solutions de l'équation $${f1}(x)=${f2}(x)$ sur $[${xMin}\\,;\\,${xMax}]$ correspond aux abscisses des points d'intersection des deux courbes, soit : $${miseEnEvidence(`\\{${soluces.map((el) => texNombre(el, 1)).join('\\,;\\,')}\\}`)}$.<br>`
    }
    let indexQuestion = 0
    let intervallesLus: IntervalleSolution[] = []
    if (soluces != null) {
      if (this.sup === 1 || this.sup === 3) {
        if (this.interactif)
          enonce +=
            `L'ensemble de solutions de l'équation $${f1}(x)=${f2}(x)$ sur $[${xMin}\\,;\\,${xMax}]$ est : ` +
            ajouteChampTexteMathLive(
              this,
              indexQuestion,
              KeyboardType.clavierEnsemble,
            ) +
            '<br><br>' // '$\\{' + Array.from(soluces).join(' ; ') + '\\}$'//
        handleAnswers(this, indexQuestion, {
          reponse: {
            value: `\\{${Array.from(soluces).join(';')}\\}`,
            options: { ensembleDeNombres: true },
          },
        }) // on s'en fiche du formatInteractif, c'est la fonction compare qui fait ce qu'il faut
        indexQuestion++
      }
    }
    if (this.sup !== 1) {
      enonce += `Résoudre graphiquement l'inéquation $${f1}(x)${signeInegalite}${f2}(x)$ sur $[${xMin}\\,;\\,${xMax}]$.<br>`
      if (this.interactif) {
        enonce +=
          "On peut taper 'union' au clavier ou utiliser le clavier virtuel pour le signe $\\cup$.<br>"
        enonce +=
          `L'ensemble des solutions de l'inéquation $${f1}(x)${signeInegalite}${f2}(x)$ sur $[${xMin}\\,;\\,${xMax}]$ est : ` +
          ajouteChampTexteMathLive(
            this,
            indexQuestion,
            KeyboardType.clavierEnsemble,
          ) +
          '<br><br>'
      }
      intervallesLus = intervallesSolutions(
        polyDiff,
        soluces,
        Boolean(inferieur),
        xMin,
        xMax,
        strict,
      )
      const soluces2: string = chercheIntervalles(
        polyDiff,
        soluces,
        Boolean(inferieur),
        xMin,
        xMax,
        strict,
      )

      handleAnswers(this, indexQuestion, {
        reponse: {
          value: soluces2,
          options: { intervalle: true },
        },
      })

      texteCorr += `Pour trouver l'ensemble des solutions de l'inéquation $${f1}(x)${signeInegalite}${f2}(x)$ sur $[${xMin}\\,;\\,${xMax}]$, on regarde les portions où la courbe $${miseEnEvidence('\\mathscr{C}_' + f1, bleuMathalea)}$ est située ${strict ? 'strictement ' : ''}${inferieur ? 'au-dessous' : 'au-dessus'} de la courbe $${miseEnEvidence('\\mathscr{C}_' + f2, 'red')}$${strict ? '' : ' ou sur celle-ci'}.<br>`
      texteCorr += strict
        ? "L'inégalité est stricte : les abscisses des points d'intersection des deux courbes ne sont pas solutions, les crochets sont donc ouverts en ces valeurs.<br>"
        : "L'inégalité est large : les abscisses des points d'intersection des deux courbes sont solutions, les crochets sont donc fermés en ces valeurs.<br>"
      // \left et \right placent correctement les crochets ouverts ]a ; b[
      const soluces2Affichees = intervallesLus
        .map(({ gauche, droite, gaucheFerme, droiteFerme }) =>
          gauche === droite
            ? `\\{${texNombre(gauche, 1)}\\}`
            : `\\left${gaucheFerme ? '[' : ']'}${texNombre(gauche, 1)}\\,;\\,${texNombre(droite, 1)}\\right${droiteFerme ? ']' : '['}`,
        )
        .join('\\cup')
      texteCorr += `On lit les intervalles correspondants sur l'axe des abscisses : $${miseEnEvidence(soluces2Affichees)}$.<br>`
    }

    // Fenêtre adaptée aux courbes, contenant toujours l'origine
    const xMinRepere = Math.min(xMin - 1, -1)
    const xMaxRepere = Math.max(xMax + 1, 1)
    const yMinRepere = Math.min(Math.floor(yBasCourbes) - 1, -1)
    const yMaxRepere = Math.max(Math.ceil(yHautCourbes) + 1, 1)
    const repere = new RepereBuilder({
      xMin: xMinRepere,
      yMin: yMinRepere,
      xMax: xMaxRepere,
      yMax: yMaxRepere,
    })
      .setGrille({
        grilleX: {
          dx: 1,
          xMin: xMinRepere,
          xMax: xMaxRepere,
        },
        grilleY: {
          dy: 1,
          yMin: yMinRepere,
          yMax: yMaxRepere,
        },
      })
      .setThickX({ xMin: xMinRepere, xMax: xMaxRepere, dx: 1 })
      .setThickY({ yMin: yMinRepere, yMax: yMaxRepere, dy: 1 })
      .buildCustom()

    let courbe1, courbe2
    if (f1Type === 'constante' || f1Type === 'affine') {
      courbe1 = segment(
        xMin,
        fonction1.func(xMin),
        xMax,
        fonction1.func(xMax),
        bleuMathalea,
      )
    } else {
      courbe1 = courbe(fonction1.func, {
        repere,
        xMin,
        xMax,
        color: bleuMathalea,
        epaisseur: 2,
      })
    }
    // Noms des courbes au bout des courbes, du côté où elles sont le plus
    // éloignées, celui de la courbe du haut au-dessus, l'autre en dessous.
    const ecart = (x: number) => Math.abs(fonction1.func(x) - fonction2.func(x))
    const xBout = ecart(xMax) >= ecart(xMin) ? xMax : xMin
    const xNom = xBout === xMax ? xMax + 0.5 : xMin - 0.5
    const yBout1 = fonction1.func(xBout)
    const yBout2 = fonction2.func(xBout)
    const decalY = yBout1 >= yBout2 ? 0.5 : -0.5
    const nomCourbe1 = latex2d(
      `\\mathscr{C}_${f1}`,
      xNom,
      yBout1 + decalY,
      {
        color: bleuMathalea,
        letterSize: 'normalsize',
        backgroundColor: '',
      },
    )
    const nomCourbe2 = latex2d(
      `\\mathscr{C}_${f2}`,
      xNom,
      yBout2 - decalY,
      {
        color: 'red',
        letterSize: 'normalsize',
        backgroundColor: '',
      },
    )

    courbe1.color = colorToLatexOrHTML(bleuMathalea)

    courbe1.epaisseur = 2
    if (f2Type === 'affine') {
      courbe2 = segment(
        xMin,
        fonction2.func(xMin),
        xMax,
        fonction2.func(xMax),
        'red',
      )
    } else {
      courbe2 = courbe(fonction2.func, {
        repere,
        xMin,
        xMax,
        color: 'red',
        epaisseur: 2,
      })
    }
    courbe2.color = colorToLatexOrHTML('red')

    courbe2.epaisseur = 2
    // Le repère n'écrit pas le 0 de l'origine : on l'ajoute
    const origine = latex2d('0', -0.3, -0.4, {
      letterSize: 'scriptsize',
      opacity: 0.8,
      color: 'black',
    })
    const courbes = [courbe1, courbe2, nomCourbe1, nomCourbe2, origine]
    // scale réduit la figure en LaTeX/PDF (repère pouvant faire 12 × 17)
    const optionsFigure = Object.assign(
      { scale: 0.5, pixelsParCm: 20 },
      fixeBordures([...(repere.objets ?? [])]),
    )
    this.listeQuestions = [
      enonce + mathalea2d(optionsFigure, repere.objets ?? [], ...courbes),
    ]
    // Lecture des solutions : des intersections vers l'axe des abscisses,
    // puis intervalles solutions avec leurs crochets (inéquation)
    const lecture = {
      points: soluces.map((x) => ({ x, y: fonction1.func(x) })),
      // portions de la courbe de la première fonction qui conviennent
      portions: intervallesLus.map(({ gauche, droite }) => {
        const pas = (droite - gauche) / 80
        const pts: [number, number][] = []
        for (let k = 0; k <= 80; k++) {
          const x = gauche + k * pas
          pts.push([x, fonction1.func(x)])
        }
        return pts
      }),
      intervalles: intervallesLus,
    }
    const figureId = `correction2F322Ex${this.numeroExercice ?? 0}`
    const figureCorrection =
      !context.isHtml || context.isTypst
        ? mathalea2d(
            optionsFigure,
            repere.objets ?? [],
            ...courbes,
            ...lectureSolutionsStatique(lecture),
          )
        : `<div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">${mathalea2d(
            Object.assign({ id: figureId }, optionsFigure),
            repere.objets ?? [],
            ...courbes,
          )}${lectureSolutionsAnimee({ ...lecture, figureId, pixelsParCm: 20 })}</div>`
    this.listeCorrections = [texteCorr + figureCorrection]
  }
}

export default resolutionEquationInequationGraphique
