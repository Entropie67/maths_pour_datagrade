// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 28998 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { interpolationDeLagrange } from '../../lib/mathFonctions/outilsMaths'
import { choice } from '../../lib/outils/arrayOutils'
import { reduirePolynomeDegre3 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { mathalea2d } from '../../modules/mathalea2d'

export const titre = 'Résoudre graphiquement une équation ou une inéquation'
export const dateDePublication = '29/10/2023'
export const dateDeModifImportante = '24/04/2024'
export const interactifReady = true

/**
 * Résoudre graphiquement une équation ou une inéquation
 *
 * @author Jean-claude Lhote
 */

export const uuid = '28998'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
type TypesDeFonction = 'constante' | 'affine' | 'poly2' | 'poly3'

/**
 * retourne le yMin pour cadrer la figure
 * @param poly1
 * @param poly2
 */
function trouveMaxMin(
  poly1: Polynome,
  poly2: Polynome,
  np1: {
    x: number
    y: number
  }[],
  np2: {
    x: number
    y: number
  }[],
): number {
  // on s'embête pas avec les constantes, elles sont toujours dans la fenêtre
  // on ne s'embête pas avec les affines, la encore, on sait comment elles se comportent quand elles sortent de la fenêtre
  // on va chercher donc le min et le max de fct1 et fct2 si ce sont au moins des polynomes de degré 2
  const fPrime1 = poly1.derivee()
  const fPrime2 = poly2.derivee()
  let yMin1: number
  let yMin2: number
  if (fPrime1.deg === 2) {
    const [c, b, a] = fPrime1.monomes as [number, number, number]
    const delta1 = b ** 2 - 4 * a * c
    if (delta1 > 0) {
      // deux racines dérivée négative entre les racines donc fonction croissante puis décroissante puis croissante ou l'inverse selon le signe de a
      const ptitDelta1 = Math.sqrt(delta1)
      const x1 = (-b - ptitDelta1) / (2 * a)
      const x2 = (-b + ptitDelta1) / (2 * a)
      yMin1 =
        a > 0 ? poly1.image(Math.max(x1, x2)) : poly1.image(Math.min(x1, x2))
    } else {
      // une seule racine la dérivée est du signe de a sur tout l'intervalle donc monotone, on ne cherche pas de min
      yMin1 = 0
    }
  } else if (fPrime1.deg === 1) {
    // poly de degré 2
    const [b, a] = fPrime1.monomes as [number, number]
    if (a < 0) {
      // la courbe est concave, on ne cherche pas de min
      yMin1 = 0
    } else {
      yMin1 = poly1.image(-b / a)
    }
  } else {
    // c'est une fonction affine, on ne cherche pas de min
    yMin1 = 0
  }
  if (fPrime2.deg === 2) {
    const [c, b, a] = fPrime2.monomes as [number, number, number]
    const delta2 = b ** 2 - 4 * a * c
    if (delta2 > 0) {
      // deux racines dérivée négative entre les racines donc fonction croissante puis décroissante puis croissante ou l'inverse selon le signe de a
      const ptitDelta2 = Math.sqrt(delta2)
      const x1 = (-b - ptitDelta2) / (2 * a)
      const x2 = (-b + ptitDelta2) / (2 * a)
      yMin2 =
        a > 0 ? poly2.image(Math.max(x1, x2)) : poly2.image(Math.min(x1, x2))
    } else {
      // une seule racine ou aucune la dérivée est du signe de a sur tout l'intervalle donc monotone, on ne cherche pas de min
      yMin2 = 0
    }
  } else if (fPrime2.deg === 1) {
    // poly de degré 2
    const [b, a] = fPrime2.monomes as [number, number]
    if (a < 0) {
      // la courbe est concave, on ne cherche pas de min
      yMin2 = 0
    } else {
      yMin2 = poly2.image(-b / a)
    }
  } else {
    // c'est une fonction affine, on ne cherche pas de min
    yMin2 = 0
  }

  return Math.min(
    yMin1,
    yMin2,
    ...np1.map((el) => el.y),
    ...np2.map((el) => el.y),
  )
}

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
 * La fonction pour récupérer les intervalles de solutions
 * @param fonc
 * @param inferieur
 */
export function chercheIntervalles(
  fonc: Polynome,
  soluces: number[],
  inferieur: boolean,
  xMin: number,
  xMax: number,
): string {
  const liste = [xMin, ...soluces, xMax]
  const values = liste.filter((el, i) => el !== liste[i + 1])
  const solutions: string[] = []
  for (let i = 0; i < values.length - 1; i++) {
    const middle = (values[i] + values[i + 1]) / 2
    const imageMiddle = fonc.image(middle)
    if ((imageMiddle < 0 && inferieur) || (!inferieur && imageMiddle > 0)) {
      solutions.push(
        `[${texNombre(values[i], 1)};${texNombre(values[i + 1], 1)}]`,
      )
    } else if (
      i === values.length - 2 &&
      soluces[soluces.length - 1] === xMax
    ) {
      solutions.push(`\\{${texNombre(values[i + 1], 1)}\\}`)
    }
  }
  return solutions.join('\\cup')
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
    const decalAxe = randint(0, 1)
    const xMin = x0 - decalAxe - 1
    const xMax = xMin + 10
    let yMin
    let cpt = 0
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
      // on calcule la différence des polys, on intègre entre -5 et 0 et entre 0 et 5
      const poly = fonction1.poly
      if (poly == null) {
        // normalement, ça ne doit pas arriver car la seule à ne pas avoir la propriété poly est la spline qui est éliminée
        // d'ailleurs typescript le sait puisque dans le test, si on met f1Type !== 'spline' il nous fait remarquer que c'est pas la peine !
        // donc ce test est là juste pour que typescript ne me dise pas que fonctions[0].poly peut être undefined
        throw Error("la fonction 1 n'a pas de polynôme alors qu'elle devrait")
      }
      const diff = poly.multiply(-1).add(fonction2.poly)
      for (let k = 0; k < 10; k++) {
        integrales.push(Math.abs(diff.image(x0 + k) - diff.image(x0 - 1 + k)))
      }
      integraleDiff = Math.min(...integrales)
      yMin =
        Math.min(
          trouveMaxMin(
            fonction1.poly,
            fonction2.poly,
            noeudsPassants1,
            noeudsPassants2,
          ),
          -1,
        ) - 0.3
    } while (integraleDiff < 0.5 && cpt < 100)
    const polyDiff = fonction1.poly.add(fonction2.poly.multiply(-1))

    // on s'occupe de la fonction 1 et du point mobile dessus on trace tout ça.
    // Maintenant, la fonction1 n'est jamais une spline !

    let enonce = `On considère les fonctions $${f1}$ et $${f2}$ définies sur $\\R$ et dont on a représenté ci-dessous une partie de leurs courbes respectives.<br><br>`
    // let diff
    let soluces: number[]
    const inferieur = Boolean(choice([true, false]))

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
      const image = fonction1.func(racinesArrondies[n])
      const isInside =
        racinesArrondies[n] <= xMax + 0.5 && racinesArrondies[n] >= xMin
      const isInside2 = image >= yMin && image <= yMin + 12.6
      if (isInside && isInside2) {
        soluces.push(racinesArrondies[n])
      }
    }
    soluces = Array.from(new Set(soluces)) as number[]
    soluces = soluces.sort((a: number, b: number) => a - b)
    if (this.sup === 1 || this.sup === 3) {
      enonce += `Résoudre graphiquement l'équation $${f1}(x)=${f2}(x)$ sur $[${xMin}~;~${xMax}]$.<br>`
      if (this.interactif)
        enonce +=
          'Si besoin, les solutions doivent être séparées par un point-virgule.<br>'
      texteCorr += `L'ensemble de solutions de l'équation $${f1}(x)=${f2}(x)$ sur $[${xMin}~;~${xMax}]$ correspond aux abscisses des points d'intersection des deux courbes, soit : `
      texteCorr +=
        this.sup === 1
          ? `$\\{${soluces.map((el) => texNombre(el, 1)).join(';')}\\}$`
          : `$${miseEnEvidence(`\\{${soluces.map((el) => texNombre(el, 1)).join(';')}\\}`)}$.<br>`
    }
    let indexQuestion = 0
    if (soluces != null) {
      if (this.sup === 1 || this.sup === 3) {
        if (this.interactif)
          enonce +=
            `L'ensemble de solutions de l'équation $${f1}(x)=${f2}(x)$ sur $[${xMin}~;~${xMax}]$ est : ` +
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
      enonce += `Résoudre graphiquement l'inéquation $${f1}(x)${inferieur ? miseEnEvidence('\\leqslant', 'black') : miseEnEvidence('~\\geqslant~', 'black')}${f2}(x)$ sur $\\left[${texNombre(xMin, 1)};${texNombre(xMax, 1)}\\right]$.<br>`
      if (this.interactif) {
        enonce +=
          "On peut taper 'union' au clavier ou utiliser le clavier virtuel pour le signe $\\cup$.<br>"
        enonce +=
          `L'ensemble des solutions de l'inéquation $${f1}(x)${inferieur ? miseEnEvidence('\\leqslant', 'black') : miseEnEvidence('~\\geqslant~', 'black')}${f2}(x)$ sur $[${xMin}~;~${xMax}]$ est : ` +
          ajouteChampTexteMathLive(
            this,
            indexQuestion,
            KeyboardType.clavierEnsemble,
          ) +
          '<br><br>'
      }
      const soluces2: string = chercheIntervalles(
        polyDiff,
        soluces,
        Boolean(inferieur),
        xMin,
        xMax,
      )

      handleAnswers(this, indexQuestion, {
        reponse: {
          value: soluces2,
          options: { intervalle: true },
        },
      })

      texteCorr += `Pour trouver l'ensemble des solutions de l'inéquation $${f1}(x)${inferieur ? miseEnEvidence('\\leqslant', 'black') : miseEnEvidence('~\\geqslant~', 'black')}${f2}(x)$ sur $[${xMin};${xMax}]$, on regarde les portions où la courbe $${miseEnEvidence('\\mathscr{C}_' + f1, bleuMathalea)}$ est située ${inferieur ? 'en dessous' : 'au-dessus'} de la courbe $${miseEnEvidence('\\mathscr{C}_' + f2, 'red')}$.<br>`
      texteCorr += `On lit les intervalles correspondants sur l'axe des abscisses : $${soluces2}$`
    }

    const repere = new RepereBuilder({
      xMin: -8,
      yMin: -8,
      xMax: 8,
      yMax: 8,
    })
      .setGrille({
        grilleX: {
          dx: 1,
          xMin: -8,
          xMax: 8,
        },
        grilleY: {
          dy: 1,
          yMin: -8,
          yMax: 8,
        },
      })
      .setGrilleSecondaire({
        grilleX: {
          dx: 0.2,
          xMin: -8,
          xMax: 8,
        },
        grilleY: { dy: 0.2, yMin: -8, yMax: 8 },
      })
      .setThickX({ xMin: -8, xMax: 8, dx: 1 })
      .setThickY({ yMin: -8, yMax: 8, dy: 1 })
      .buildCustom()

    let courbe1, courbe2
    if (f1Type === 'constante' || f1Type === 'affine') {
      courbe1 = segment(
        -8,
        fonction1.func(-8),
        8,
        fonction1.func(8),
        bleuMathalea,
      )
    } else {
      courbe1 = courbe(fonction1.func, {
        repere,
        xMin: -8,
        xMax: 8,
        color: bleuMathalea,
        epaisseur: 1,
      })
    }
    const nomCourbe1 = latex2d(`\\mathscr{C}_${f1}`, -7.5, 7, {
      color: bleuMathalea,
      letterSize: 'normalsize',
      backgroundColor: '',
    })
    const nomCourbe2 = latex2d(`\\mathscr{C}_${f2}`, -7.5, 6, {
      color: 'red',
      letterSize: 'normalsize',
      backgroundColor: '',
    })

    courbe1.color = colorToLatexOrHTML(bleuMathalea)

    courbe1.epaisseur = 1
    if (f2Type === 'affine') {
      courbe2 = segment(-8, fonction2.func(-8), 8, fonction2.func(8), 'red')
    } else {
      courbe2 = courbe(fonction2.func, {
        repere,
        xMin: -8,
        xMax: 8,
        color: 'red',
        epaisseur: 1,
      })
    }
    courbe2.color = colorToLatexOrHTML('red')

    courbe2.epaisseur = 1
    const p1A = pointAbstrait(-7, 7)
    const p1B = pointAbstrait(-6, 7)
    const p2A = pointAbstrait(-7, 6)
    const p2B = pointAbstrait(-6, 6)
    const trait1 = segment(p1A, p1B, bleuMathalea)
    const trait2 = segment(p2A, p2B, 'red')
    trait1.epaisseur = 1
    trait2.epaisseur = 1
    const courbes = [courbe1, courbe2, trait1, trait2, nomCourbe1, nomCourbe2]
    this.listeQuestions = [
      enonce +
        mathalea2d(
          Object.assign({}, fixeBordures([...(repere.objets ?? [])])),
          repere.objets ?? [],
          ...courbes,
        ),
    ]
    // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
    const textCorrSplit = texteCorr.split(':')
    let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
    aRemplacer = aRemplacer.replaceAll('$', '')

    texteCorr = ''
    for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
      texteCorr += textCorrSplit[ee] + ':'
    }
    texteCorr += ` $${miseEnEvidence(aRemplacer)}$`
    // Fin de cette uniformisation
    texteCorr += '.'
    this.listeCorrections = [texteCorr]
  }
}

export default resolutionEquationInequationGraphique
