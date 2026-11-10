import type Point from 'apigeom/src/elements/points/Point'
import type Figure from 'apigeom/src/Figure'
import Decimal from 'decimal.js'
import FractionEtendue from '../../modules/FractionEtendue'
import { egal, randint } from '../../modules/outils'
import { BezierPath } from '../2d/BezierPath'
import { colorToLatexOrHTML } from '../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../2d/ObjetMathalea2D'
import { pointAbstrait } from '../2d/PointAbstrait'
import { tracePoint } from '../2d/TracePoint'
import { choice } from '../outils/arrayOutils'
import { rangeMinMax, round } from '../outils/nombres'
import { stringNombre } from '../outils/texNombre'
import {
  brent,
  polynomialRoot,
  tableauDeVariation,
  variationsFonction,
} from './etudeFonction'
import { chercheMinMaxLocal, Polynome } from './Polynome'

export type NoeudSpline = {
  x: number
  y: number
  deriveeGauche: number
  deriveeDroit: number
  isVisible: boolean
}
type OptionsNoeuds = {
  color?: string
  epaisseur?: number
  taille?: number
  style?: string
  visible?: boolean
  couleurDeRemplissage?: string
}
/**
 * Une fonction pour créer une Spline aléatoire
 * @param {number} n
 * @param {boolean} noeudsVisibles
 * @param {number} xMin
 * @param {number} step
 * @param {number} y0 ordonnée de départ de la spline aléatoire
 * @returns {Array<NoeudSpline>}
 */
export function noeudsSplineAleatoire(
  n: number,
  noeudsVisibles: boolean,
  xMin = -n / 2,
  y0 = 0,
  step = 2,
) {
  const noeuds = []
  const isVisible = noeudsVisibles

  let y = y0
  let deriveeDroit = Math.cos(Math.random() * Math.PI) * randint(1, 2)
  for (let x = xMin; x < -xMin + 1; x += step) {
    const y0 = y
    noeuds.push({ x, y, deriveeGauche: deriveeDroit, deriveeDroit, isVisible })
    do {
      y = y + choice([-1, 1]) * randint(1, 2)
    } while (y > 5 || y < -5)
    do {
      deriveeDroit = Math.cos(Math.random() * Math.PI) * randint(0, 2)
    } while (deriveeDroit * (y - y0) < 0)
  }
  return noeuds
}

/**
 * Une fonction pour créer un nuage de noeuds différents d'un nuage passé en argument avec certaines options
 * @param {Array<{x: number, y:number, deriveeGauche:number, deriveeDroit:number, isVisible:boolean}>} noeudsF
 * @param {objet} options
 * @param {boolean} [options.symetrieH]
 * @param {boolean} [options.symetrieV]
 * @param {number} [options.echangeNoeuds]
 * @param {number} [options.decalVertical]
 * @param {number} [options.decalHorizontal]
 * @return {Array<{x: number, y:number, deriveeGauche:number, deriveeDroit:number, isVisible:boolean}>}
 */
type OptionsModifieNoeuds = {
  symetrieH?: boolean
  symetrieV?: boolean
  echangeNoeuds?: number
  decalVertical?: number
  decalHorizontal?: number
}
export function modifieNoeuds(
  noeudsF: NoeudSpline[],
  options: OptionsModifieNoeuds,
) {
  const noeudsG = noeudsF.map((el) =>
    Object.assign(
      {},
      {
        x: el.x,
        y: el.y,
        deriveeGauche: el.deriveeGauche,
        deriveeDroit: el.deriveeDroit,
        isVisible: el.isVisible,
      },
    ),
  )
  const nbNoeuds = noeudsF.length
  if (options.symetrieH) {
    for (let i = nbNoeuds; i > 0; i--) {
      noeudsG[nbNoeuds - i] = {
        x: noeudsF[nbNoeuds - i].x,
        y: noeudsF[i - 1].y,
        deriveeGauche: noeudsF[i - 1].deriveeDroit,
        deriveeDroit: noeudsF[i - 1].deriveeGauche,
        isVisible: noeudsF[i - 1].isVisible,
      }
    }
  }
  if (options.symetrieV) {
    for (let i = 0; i < nbNoeuds; i++) {
      noeudsG[i] = {
        x: noeudsG[i].x,
        y: -noeudsG[i].y,
        deriveeGauche: -noeudsG[i].deriveeGauche,
        deriveeDroit: -noeudsG[i].deriveeDroit,
        isVisible: noeudsG[i].isVisible,
      }
    }
  }
  if (options.echangeNoeuds) {
    const indices = rangeMinMax(0, nbNoeuds - 1)
    // le nombre de modifications doit être pair car on va échanger 2 par 2 et il doit y en avoir moins que nbNoeuds.
    const nbModifs =
      options.echangeNoeuds ?? 2 * Math.round(randint(2, nbNoeuds) / 2)
    const indiceDepartArrivee: number[] = []
    for (let i = 0, cpt = 0; i < nbModifs / 2 && cpt < 50; ) {
      const choix1 = choice(indices, indiceDepartArrivee)
      const choix2 = choice(indices, indiceDepartArrivee)
      if (choix1 != null && choix2 != null) {
        indiceDepartArrivee.push(choix1, choix2)
        i++
      }
      cpt++
    }
    for (let i = 0; i < indiceDepartArrivee.length; i += 2) {
      // on va de 2 en 2 car les indices impairs sont les indices d'arrivée
      const depart = indiceDepartArrivee[i]
      const arrivee = indiceDepartArrivee[i + 1]
      // on n'échange que si l'indice du noeud concerné est avant celui d'arrivée
      const noeudInter = {
        x: noeudsG[arrivee].x,
        y: noeudsG[depart].y,
        deriveeGauche: noeudsG[depart].deriveeGauche,
        deriveeDroit: noeudsG[depart].deriveeDroit,
        isVisible: noeudsG[depart].isVisible,
      }
      noeudsG[depart] = {
        x: noeudsG[depart].x,
        y: noeudsG[arrivee].y,
        deriveeGauche: noeudsG[arrivee].deriveeGauche,
        deriveeDroit: noeudsG[arrivee].deriveeDroit,
        isVisible: noeudsG[arrivee].isVisible,
      }
      noeudsG[arrivee] = {
        x: noeudInter.x,
        y: noeudInter.y,
        deriveeGauche: noeudInter.deriveeGauche,
        deriveeDroit: noeudInter.deriveeDroit,
        isVisible: noeudInter.isVisible,
      }
    }
  }
  if (options.decalVertical) {
    const offset = Number.isInteger(options.decalVertical)
      ? options.decalVertical
      : randint(-2, 2, 0)
    for (let i = 0; i < noeudsG.length; i++) {
      noeudsG[i] = {
        x: noeudsG[i].x,
        y: noeudsG[i].y + offset,
        deriveeGauche: noeudsG[i].deriveeGauche,
        deriveeDroit: noeudsG[i].deriveeDroit,
        isVisible: noeudsG[i].isVisible,
      }
    }
  }
  if (options.decalHorizontal) {
    const offset = Number.isInteger(options.decalHorizontal)
      ? options.decalHorizontal
      : randint(-2, 2, 0)
    for (let i = 0; i < noeudsG.length; i++) {
      noeudsG[i] = {
        x: noeudsG[i].x + offset,
        y: noeudsG[i].y,
        deriveeGauche: noeudsG[i].deriveeGauche,
        deriveeDroit: noeudsG[i].deriveeDroit,
        isVisible: noeudsG[i].isVisible,
      }
    }
  }
  return noeudsG
}
/**
 * Les noeuds sont des objets : {x,y, nombreDerive} attention à les donner dans l'ordre des x croissants
 * @author Jean-claude Lhote
 */
export class Spline {
  /**
   * Passer au moins deux noeuds, sinon ça ne peut pas fonctionner d'où la valeur par défaut...
   * @param {Array<{x: number, y:number, deriveeGauche:number, deriveeDroit:number, isVisible:boolean}>} noeuds la liste des noeuds avec leurs nombres dérivés
   */
  n: number
  polys: Polynome[]
  nbPointsForApiGeom: number
  noeuds: NoeudSpline[]
  x: number[]
  y: number[]
  visibles: boolean[]
  fonctions: ((x: number) => number)[]
  private readonly solveCache = new Map<string, number[] | undefined>()
  private deriveesCache?: Polynome[]

  constructor(noeuds: NoeudSpline[]) {
    this.polys = []
    this.x = []
    this.y = []
    this.noeuds = []
    this.visibles = []
    this.nbPointsForApiGeom = 100 // On pourra modifier cette propriété avant de récupérer pointOfSpline
    this.fonctions = []
    if (noeuds == null || !Array.isArray(noeuds) || noeuds.length < 2) {
      // on ne peut pas interpoler une courbe avec moins de 2 noeuds
      window.notify('Spline : nombre de noeuds insuffisant', { noeuds })
      noeuds = [
        { x: -3, y: -5, deriveeGauche: 0, deriveeDroit: 2, isVisible: false },
        { x: 3, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
      ]
    }
    if (!trieNoeuds(noeuds)) {
      this.n = noeuds.length

      window.notify(
        'Il y a un problème avec ces noeuds (peut-être un doublon ?) ',
        { noeuds },
      )
      return
    } // les noeuds comportent une anomalie : deux valeur de x identiques
    this.n = noeuds.length

    for (let i = 0; i < noeuds.length - 1; i++) {
      const x0 = noeuds[i].x
      const y0 = noeuds[i].y
      const d0 = noeuds[i].deriveeDroit
      const x1 = noeuds[i + 1].x
      const y1 = noeuds[i + 1].y
      const d1 = noeuds[i + 1].deriveeGauche
      if (y0 + (x1 - x0) * d1 === y1 && d0 === d1) {
        const a = (y1 - y0) / (x1 - x0)
        const b = y0 - a * x0
        this.polys.push(new Polynome({ coeffs: [b, a, 0, 0] }))
      } else {
        const h = x1 - x0
        if (h === 0) {
          window.notify(
            "Spline : impossible de trouver un polynome ici car deux noeuds ont la même abscisse : ",
            {
              noeudGauche: noeuds[i],
              noeudDroit: noeuds[i + 1],
            },
          )
          return
        }
        const deltaY = y1 - y0
        const a = (d0 + d1) / h ** 2 - (2 * deltaY) / h ** 3
        const b = (3 * deltaY) / h ** 2 - (2 * d0 + d1) / h
        this.polys.push(
          new Polynome({
            useFraction: true,
            coeffs: [
              -a * x0 ** 3 + b * x0 ** 2 - d0 * x0 + y0,
              3 * a * x0 ** 2 - 2 * b * x0 + d0,
              -3 * a * x0 + b,
              a,
            ].map((el) => Number(el.toFixed(6))), // même arrondi que l'ancien calcul matriciel
          }),
        )
      }
    }
    this.noeuds = [...noeuds]
    this.n = this.noeuds.length
    this.x = this.noeuds.map((noeud) => noeud.x)
    this.y = this.noeuds.map((noeud) => noeud.y)
    this.visibles = this.noeuds.map((noeud) => noeud.isVisible) // On récupère la visibilité des noeuds pour la courbe
    this.n = this.y.length // on a n valeurs de y et donc de x, soit n-1 intervalles numérotés de 1 à n-1.
    // this.step = step // on en a besoin pour la dérivée...
    this.fonctions = this.#convertPolyFunction()
  }

  get image() {
    return this.fonction
  }

  pointsOfSpline(figure: Figure) {
    const points: Point[] = []
    const stepPoints =
      (this.x[this.x.length - 1] - this.x[0]) / this.nbPointsForApiGeom // on fait 50 points ça devrait suffir...
    let x = this.x[0]
    do {
      points.push(
        figure.create('Point', { x, y: this.#image(x), isVisible: false }),
      )
      x += stepPoints
    } while (x <= this.x[this.x.length - 1])
    points.push(
      figure.create('Point', {
        x: this.x[this.x.length - 1],
        y: this.#image(this.x[this.x.length - 1]),
        isVisible: false,
      }),
    )
    return points
  }

  /**
   * convertit les polynomes en fonctions
   * @returns {Function[]}
   */
  #convertPolyFunction(): ((x: number) => number)[] {
    const f = []
    for (let i = 0; i < this.n - 1; i++) {
      f.push(this.polys[i].fonction)
    }
    return f
  }

  /**
   * une méthode pour ajouter deux splines... et retourner une nouvelle spline !
   * Attention ! il faut que les deux splines aient exactement le même nombre de noeuds, et que les abscisses de ces noeuds soient les mêmes !
   * @param {Spline} s
   * @param {boolean} opposite
   */
  add(s: Spline, opposite: boolean) {
    if (this.n !== s.n) {
      throw Error('Veuillez vous assurer de donner deux splines compatibles')
    }
    if (this.x.filter((el) => s.x.includes(el)).length !== this.n) {
      throw Error('Veuillez vous assurer de donner deux splines compatibles')
    }
    const noeuds = []
    for (let i = 0; i < this.n; i++) {
      const x = this.x[i]
      const y = this.y[i] + (opposite ? -1 : 1) * s.y[i]
      const deriveeGauche =
        this.noeuds[i].deriveeGauche +
        (opposite ? -1 : 1) * s.noeuds[i].deriveeGauche
      const deriveeDroit =
        this.noeuds[i].deriveeDroit +
        (opposite ? -1 : 1) * s.noeuds[i].deriveeDroit
      const isVisible = this.noeuds[i].isVisible && s.noeuds[i].isVisible
      noeuds.push({ x, y, deriveeGauche, deriveeDroit, isVisible })
    }
    return new Spline(noeuds)
  }

  zeros(precision = 1) {
    const zeros = []
    for (let x = this.x[0]; x < this.x[this.n - 1]; x += 0.5) {
      if (this.#image(x) * this.#image(x + 0.5) < 0) {
        const { root } = brent(this.fonction, x, x + 0.5, 0.000000001, 100)
        if (root != null) zeros.push(round(root, precision))
      } else {
        if (this.#image(x) === 0) zeros.push(round(x, precision))
        if (this.#image(x + 0.5) === 0) zeros.push(round(x + 0.5, precision))
      }
    }
    return Array.from(new Set(zeros).values())
  }

  /**
   * retourne les solutions de f(x) = y sur son domaine de définition
   * @param {number} y
   * @param {number} precision préciser la tolérance dans la recherche de solutions : une précision de 2 signifie que y-0.01<f(x)<y+0.01
   * mettre 0 comme précision signifie potentiellement y-0.5<f(x)<y+0.5 !
   * @returns {number[]}
   */
  solve(y: number, precision = 2) {
    // On a eu des soucis plus loin dans polynome.add(-y) donc on s'assure que y est bien un number.
    const yArg = y
    y = Number(y)
    if (!isNaN(y)) {
      const cacheKey = `${y}|${precision}`
      if (this.solveCache.has(cacheKey)) return this.solveCache.get(cacheKey)
      const antecedents: number[] = []
      for (let i = 0; i < this.polys.length; i++) {
        const polEquation = this.polys[i].add(-y) // Le polynome dont les racines sont les antécédents de y
        // Algebrite n'aime pas beaucoup les coefficients decimaux...
        try {
          // si le polynome utilise des FractionEtendue, il faut les convertir au format mathjs pour polynomialRoot
          const [coeff0, coeff1, coeff2, coeff3] =
            polEquation.monomes.map(Number)
          const liste = polEquation.useFraction
            ? polynomialRoot(coeff0, coeff1, coeff2, coeff3)
            : polynomialRoot(coeff0, coeff1, coeff2, coeff3)
          for (const valeur of liste) {
            let arr
            if (typeof valeur === 'number') {
              arr = round(valeur, precision)
            } else {
              // complexe !
              const module = valeur.mod
              if (Number(module) < 10 ** (-precision - 4)) {
                // module trop petit pour être complexe, c'est 0 !
                arr = 0
              } else {
                const argument = valeur.arg
                if (
                  Math.abs(argument) < 0.001 ||
                  Math.abs(Math.abs(argument) - Math.PI) < 0.001
                ) {
                  // si l'argument est proche de 0 ou de Pi ou de -Pi
                  arr = round(Number(valeur.re), precision) // on prend la partie réelle
                } else {
                  arr = null // c'est une vraie racine complexe, du coup, on prend null
                }
              }
            }
            if (arr !== null && arr >= this.x[i] && arr <= this.x[i + 1]) {
              if (!antecedents.includes(arr)) {
                antecedents.push(arr)
              }
            }
          }
        } catch (e) {
          const err = e instanceof Error ? e.message : String(e)
          window.notify('Erreur dans Spline.solve()' + err, { valeur_de_y: y })
        }
      }
      this.solveCache.set(cacheKey, antecedents)
      return antecedents
    } else {
      window.notify(
        `Spline.solve() a reçu un truc bizarre à la place d'un nombre : ${yArg} !`,
        { valeurArgument: yArg },
      )
    }
  }

  /**
   * retourne un array décrivant les variations de la Spline sur son domaine de déf
   * à améliorer... la fonction variationsFonctions ne travaille pas proprement. on peut faire beaucoup mieux avec Spline
   * @returns {*[]|null}
   */
  variations(step: number | FractionEtendue = new FractionEtendue(1, 100)) {
    return variationsFonction(
      this.derivee,
      this.noeuds[0].x,
      this.noeuds[this.n - 1].x,
      step,
    )
  }

  /**
   * retourne les signes pris par la Spline sur son domaine de déf
   * à améliorer... la fonction signesFonctions ne travaille pas proprement. on peut faire beaucoup mieux avec Spline
   * @returns {T[]}
   */
  signes() {
    const signes = []
    const zeros = this.zeros(1)
    let x
    if (zeros.length === 0) {
      return [
        {
          xG: this.x[0],
          xD: this.x[this.n - 1],
          signe: this.y[0] > 0 ? '+' : '-',
        },
      ]
    }
    if (this.x[0] !== zeros[0])
      signes.push({
        xG: this.x[0],
        xD: zeros[0],
        signe: this.y[0] > 0 ? '+' : '-',
      })
    x = zeros[0]
    signes.push({ xG: zeros[0], xD: zeros[0], signe: 'z' })
    for (let i = 1; i < zeros.length; i++) {
      const y = this.#image((x + zeros[i]) / 2)
      signes.push({ xG: x, xD: zeros[i], signe: y > 0 ? '+' : '-' })
      signes.push({ xG: zeros[i], xD: zeros[i], signe: 'z' })
      x = zeros[i]
    }
    if (zeros[zeros.length - 1] === this.x[this.n - 1]) return signes
    const y = this.#image((zeros[zeros.length - 1] + this.x[this.n - 1]) / 2)
    signes.push({
      xG: zeros[zeros.length - 1],
      xD: this.x[this.n - 1],
      signe: y > 0 ? '+' : '-',
    })
    return signes // signesFonction(this.fonction, this.noeuds[0].x, this.noeuds[this.n - 1].x, step ?? new FractionEtendue(1, 10), 0.001)
  }

  /**
   * renvoie le tableau de signes d'une fonction
   * @param fonction
   * @param {object} options
   * @param {string} [options.nomVariable] // ce qui est écrit dans l'entête de la première ligne 'x' par défaut
   * @param {string} [options.nomFonction] // ce qui est écrit dans l'entête de la première ligne 'x' par défaut
   * @returns {string} [options.nomFonction] // ce  qui est écrit dans l'entête de la deuxième ligne 'f(x)' par défaut
   */
  tableauSignes(nomVariable = 'x', nomFonction = 'f(x)') {
    const signes = this.signes()
    const premiereLigne = []
    for (let i = 0; i < signes.length; i++) {
      if (i === 0) {
        premiereLigne.push(stringNombre(signes[0].xG, 2), 10)
      }
      if (i > 0 && signes[i].xG !== signes[i - 1].xG) {
        premiereLigne.push(stringNombre(signes[i].xG, 2), 10)
      }
    }
    if (signes[signes.length - 1].xD !== signes[signes.length - 1].xG)
      premiereLigne.push(stringNombre(signes[signes.length - 1].xD, 2), 10)
    const tabLine = ['Line', 30]
    if (!egal(this.#image(this.x[0]), 0)) {
      tabLine.push('', 10)
    }

    for (let i = 0; i < signes.length; i++) {
      tabLine.push(signes[i].signe, 10)
    }

    return tableauDeVariation({
      tabInit: [
        [
          [nomVariable, 2, 10],
          [nomFonction, 2, 10],
        ],
        premiereLigne,
      ],
      tabLines: [tabLine],
      espcl: 3.5, // taille en cm entre deux antécédents
      deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
      lgt: 8, // taille de la première colonne en cm
    })
  }

  /**
   * retourne le nombre d'antécédents entiers trouvés pour une valeur y donnée
   * @param {number} y
   * @returns {number}
   */
  nombreAntecedentsEntiers(y: number) {
    const solutions = this.solve(y)
    const solutionsEntieres =
      solutions?.filter((sol) => Number.isInteger(sol)) ?? []
    return solutionsEntieres.length
  }

  /**
   * retourne le nombre d'antécédents de y
   * @param {number} y
   * @returns {number}
   */
  nombreAntecedents(y: number) {
    const solutions = this.solve(y)
    return solutions?.length ?? 0
  }

  nombreAntecedentsMaximum(
    yMin: number,
    yMax: number,
    yentier = true,
    entiers = true,
  ) {
    let nbMax = 0
    for (let k = yMin; k < yMax; k += yentier ? 1 : 0.1) {
      if (entiers) {
        nbMax = Math.max(nbMax, this.nombreAntecedentsEntiers(k))
      } else {
        nbMax = Math.max(nbMax, this.nombreAntecedents(k))
      }
    }
    return nbMax
  }

  /**
   * Retourne une valeur de y (si trouvée) pour laquelle il y a exactement n antécédents
   * @param {number} n
   * @param {number} yMin
   * @param {number} yMax
   * @returns {boolean|string|*}
   */
  trouveYPourNAntecedents(
    n: number,
    yMin: number,
    yMax: number,
    yEntier = true,
    antecedentsEntiers = true,
  ) {
    const candidats = []
    if (Number.isInteger(yMin) && Number.isInteger(yMax)) {
      if (yEntier) {
        for (let y = yMin; y <= yMax; y++) {
          if (
            (antecedentsEntiers &&
              this.nombreAntecedentsEntiers(y) === n &&
              this.nombreAntecedents(y) === n) ||
            (!antecedentsEntiers && this.nombreAntecedents(y) === n)
          ) {
            candidats.push(y)
          }
        }
      } else {
        // ici, on n'a pas trouvé avec y entier entre xMin et yMax, on recommence avec un pas de 0.1
        for (let y = yMin; y <= yMax; y += 0.1) {
          if (
            (antecedentsEntiers &&
              this.nombreAntecedentsEntiers(y) === n &&
              this.nombreAntecedents(y) === n) ||
            (!antecedentsEntiers && this.nombreAntecedents(y) === n)
          ) {
            candidats.push(y)
          }
        }
      }
    } else {
      window.notify(
        'trouveYPourNAntecedentsEntiers() appelé avec des valeurs incorrectes',
        { n, yMin, yMax },
      )
    }
    if (candidats.length < 1) {
      // window.notify('trouveYPourNAntecedents() : Je n\'ai rien trouvé !', { n, yMin, yMax })
      return false
    }
    return choice(candidats) // normalement, il ne devrait jamais retourner cette valeur.
  }

  /**
   * retourne les min et max pour un repère contenant la courbe si ceux-ci sont sur des noeuds (c'est vivement conseillé)
   * Ne fonctionne pas si yMax ou yMin sont atteints entre deux noeuds
   */
  trouveMaxes(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    if (Array.isArray(this.noeuds) && this.noeuds.length > 0) {
      const xMin = Math.ceil(Math.min(...this.noeuds.map((el) => el.x)))
      const yMin = Math.ceil(Math.min(...this.noeuds.map((el) => el.y)))
      const xMax = Math.floor(Math.max(...this.noeuds.map((el) => el.x)))
      const yMax = Math.floor(Math.max(...this.noeuds.map((el) => el.y)))
      return { xMin, xMax, yMin, yMax }
    } else {
      window.notify(
        "Spline.trouveMaxes() on demande ça alors que la Spline n'a pas de noeuds !",
        { laSpline: JSON.stringify(this) },
      )
      return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 }
    }
  }

  /**
   * retourne le minimum et le maximum de la fonction
   * @returns {{yMin: number, yMax: number}}
   */
  amplitude() {
    let yMin = 1000
    let yMax = -1000
    for (let i = 0; i < this.x.length - 1; i++) {
      const { minLocal, maxLocal } = chercheMinMaxLocal({
        poly: this.polys[i],
        xG: this.x[i],
        xD: this.x[i + 1],
      })
      yMin = Math.min(yMin, minLocal)
      yMax = Math.max(yMax, maxLocal)
    }
    return { yMin, yMax }
  }

  /**
   * fournit la fonction à passer pour simuler une fonction mathématique du type (x)=>f(x)
   * @returns {function(*): number|*}
   */
  get fonction() {
    return (x: number) => this.#image(x)
  }

  /**
   * Retourne l'image de x par la fonction
   * @param {number} x
   * @returns {number}
   */
  #image(x: unknown) {
    if (typeof x !== 'number') {
      if (x instanceof FractionEtendue) {
        x = x.valeurDecimale
      } else if (x instanceof Decimal) {
        x = x.toNumber()
      }
    }
    const xNumber = x as number
    let trouveK = false
    let k = 0
    for (let i = 0; i < this.n - 1; i++) {
      if (xNumber >= this.x[i] && xNumber <= this.x[i + 1]) {
        k = i
        trouveK = true
        break
      }
    }
    if (!trouveK) {
      const intervalle = `D = [${this.x[0]} ; ${this.x[this.n - 1]}]`
      window.notify(
        "Spline: la valeur de x fournie n'est pas dans lìntervalle de définition de la fonction",
        {
          x,
          intervalle,
        },
      )
      return NaN
    } else {
      return this.fonctions[k](xNumber)
    }
  }

  /**
   * retourne un array de polynomes dérivés (degré 2) de ceux de la Spline utilisé par derivee() pour définir la dérivée pour tout x du domaine
   * la fonction est continue, mais les dérivées à gauche et à droite des noeuds ne seront pas identiques
   * donc on ne peut pas en faire une Spline.
   */
  get derivees() {
    if (this.deriveesCache != null) return this.deriveesCache
    const derivees = []
    for (let i = 0; i < this.polys.length; i++) {
      derivees.push(this.polys[i].derivee())
    }
    this.deriveesCache = derivees
    return derivees
  }

  /**
   * retourne une fonction dérivée de la spline sur son domaine de définition
   */
  get derivee() {
    const intervalles: { xG: number; xD: number }[] = []
    for (let i = 0; i < this.noeuds.length - 1; i++) {
      intervalles.push({ xG: this.noeuds[i].x, xD: this.noeuds[i + 1].x })
    }
    return (x: number) => {
      const index = intervalles.findIndex(
        (intervalle) => x >= intervalle.xG && x <= intervalle.xD,
      )
      return this.derivees[index].image(x)
    }
  }

  /** retourne une spline construite avec les valeurs dérivées aux noeuds de la spline.
   * Il faut impérativement que cette fonction soit continue donc les nombre dérivés à gauche et à droite en chacun des noeuds doivent être égaux !
   */
  get splineDerivee() {
    const noeudsDerivee /** Array<{x: number, y:number, deriveeGauche:number, deriveeDroit:number, isVisible:boolean}> */ =
      []
    const derivees = this.derivees
    const deriveesSecondes = derivees.map((derivee) => derivee.derivee())
    console.log('derivees secondes : ', deriveesSecondes)

    for (let i = 0; i < this.noeuds.length - 1; i++) {
      const noeud = this.noeuds[i]
      if (i > 0 && i < this.noeuds.length - 2) {
        noeudsDerivee.push({
          x: noeud.x,
          y: noeud.deriveeGauche ?? noeud.deriveeDroit, // on prend la dérivée gauche si elle existe, sinon la dérivée droite
          deriveeGauche: deriveesSecondes[i - 1].image(noeud.x),
          deriveeDroit: deriveesSecondes[i].image(noeud.x),
          isVisible: noeud.isVisible,
        })
      } else {
        noeudsDerivee.push({
          x: noeud.x,
          y: noeud.deriveeDroit,
          deriveeGauche: deriveesSecondes[i].image(noeud.x),
          deriveeDroit: deriveesSecondes[i].image(noeud.x),
          isVisible: noeud.isVisible,
        })
      }
    }
    noeudsDerivee.push({
      x: this.noeuds[this.noeuds.length - 1].x,
      y: this.noeuds[this.noeuds.length - 1].deriveeGauche,
      deriveeGauche: deriveesSecondes[deriveesSecondes.length - 1].image(
        this.noeuds[this.noeuds.length - 1].x,
      ),
      deriveeDroit: deriveesSecondes[deriveesSecondes.length - 1].image(
        this.noeuds[this.noeuds.length - 1].x,
      ),
      isVisible: this.noeuds[this.noeuds.length - 1].isVisible,
    })
    return new Spline(noeudsDerivee)
  }

  /**
   * crée l'objet mathalea2d correspondant à la courbe tracée
   * @param {Repere} repere
   * @param {string} color
   * @param {number} epaisseur
   * @param {boolean} ajouteNoeuds
   * @param {Object} optionsNoeuds
   * @returns {Trace}
   */
  courbe({
    color = 'black',
    epaisseur = 1,
    ajouteNoeuds = false,
    optionsNoeuds = {},
  }: {
    color?: string
    epaisseur?: number
    ajouteNoeuds?: boolean
    optionsNoeuds?: object
  } = {}) {
    return new Trace(this, {
      color,
      epaisseur,
      ajouteNoeuds,
      optionsNoeuds,
    })
  }
}

/**
 * un raccourcis pour new Spline(noeuds)
 * @param {Array<{x: number, y:number, deriveeGauche:number, deriveeDroit:number, isVisible:boolean}>} noeuds
 * @returns {Spline}
 */
export function spline(noeuds: NoeudSpline[]) {
  return new Spline(noeuds)
}

/**
 * Fonction qui trie des noeuds pour Spline afin de les remettre dans l'ordre des x croissant
 * @param {Array<{x: number, y:number,nombreDerive:number}>} noeuds
 * @author Jean-claude Lhote
 */
export function trieNoeuds(noeuds: NoeudSpline[]) {
  let xInter, yInter, dGaucheInter, dDroitInter, isVisibleInter
  for (let i = 0; i < noeuds.length - 1; i++) {
    for (let j = i + 1; j < noeuds.length; j++) {
      if (noeuds[i].x > noeuds[j].x) {
        xInter = noeuds[i].x
        yInter = noeuds[i].y
        dGaucheInter = noeuds[i].deriveeGauche
        dDroitInter = noeuds[i].deriveeDroit
        isVisibleInter = noeuds[i].isVisible
        noeuds[i].x = noeuds[j].x
        noeuds[i].y = noeuds[j].y
        noeuds[i].deriveeGauche = noeuds[j].deriveeGauche
        noeuds[i].deriveeDroit = noeuds[j].deriveeDroit
        noeuds[i].isVisible = noeuds[j].isVisible
        noeuds[j].x = xInter
        noeuds[j].y = yInter
        noeuds[j].deriveeGauche = dGaucheInter
        noeuds[j].deriveeDroit = dDroitInter
        noeuds[j].isVisible = isVisibleInter
      } else if (egal(noeuds[i].x, noeuds[j].x)) {
        return false
      }
    }
  }
  return true
}

/**
 * @class
 * crée la courbe de la spline (objet mathalea2d)
 */
export class Trace extends ObjetMathalea2D {
  /**
   * @param {Spline}spline La splineCatmulRom ou Spline dont on veut la Trace
   * @param {Repere} repere le repère associé
   * @param {number} step le pas entre deux points
   * @param {string} color la couleur
   * @param {number} epaisseur son épaisseur
   * @param {boolean} ajouteNoeuds si true, des points sont ajoutés aux endroits des noeuds
   * @param {Object} optionsNoeud
   */
  constructor(
    spline: Spline,
    {
      color = 'black',
      epaisseur = 2,
      opacite = 1,
      ajouteNoeuds = true,
      optionsNoeuds = {},
    }: {
      color?: string
      epaisseur?: number
      opacite?: number
      ajouteNoeuds?: boolean
      optionsNoeuds?: OptionsNoeuds
    },
  ) {
    super()
    this.objets = []
    const { xMin, xMax, yMin, yMax } = spline.trouveMaxes()
    this.bordures = [xMin, yMin, xMax, yMax]
    const listeOfTriplets: [
      [number, number],
      [number, number],
      [number, number],
    ][] = []

    for (let i = 0; i < spline.n - 1; i++) {
      const deltaX = spline.x[i + 1] - spline.x[i]
      const deltaY = spline.y[i + 1] - spline.y[i]
      const x1 = deltaX / 3
      const y1 = (spline.noeuds[i].deriveeDroit * deltaX) / 3
      const x2 = (2 * deltaX) / 3
      const y2 = deltaY - (spline.noeuds[i + 1].deriveeGauche * deltaX) / 3
      const x3 = deltaX
      const y3 = deltaY
      listeOfTriplets.push([
        [x1, y1],
        [x2, y2],
        [x3, y3],
      ])
    }
    this.objets.push(
      new BezierPath({
        xStart: spline.x[0],
        yStart: spline.y[0],
        listeOfTriplets,
        color,
        epaisseur,
        opacite,
      }),
    )
    if (ajouteNoeuds) {
      for (let i = 0; i < spline.n; i++) {
        if (spline.visibles[i]) {
          const noeud = pointAbstrait(spline.x[i], spline.y[i])
          const traceNoeud = tracePoint(noeud)
          if (optionsNoeuds) {
            if (optionsNoeuds.color) {
              traceNoeud.color = colorToLatexOrHTML(optionsNoeuds.color)
              traceNoeud.couleurDeRemplissage = colorToLatexOrHTML(
                optionsNoeuds.color,
              )
            }
            if (optionsNoeuds.epaisseur) {
              traceNoeud.epaisseur = optionsNoeuds.epaisseur
            }
            if (optionsNoeuds.style) {
              traceNoeud.style = optionsNoeuds.style
            }
            if (optionsNoeuds.taille) {
              traceNoeud.taille = optionsNoeuds.taille
            }
          }
          this.objets.push(traceNoeud)
        }
      }
    }
    this.svg = function (coeff) {
      let code = ''
      if (this.objets == null) return code
      for (const objet of this.objets) {
        code += '\n\t' + objet.svg(coeff)
      }
      return code
    }
    this.tikz = function () {
      let code = ''
      if (this.objets == null) return code
      for (const objet of this.objets) {
        code += objet.tikz()
      }
      return code
    }
  }
}
