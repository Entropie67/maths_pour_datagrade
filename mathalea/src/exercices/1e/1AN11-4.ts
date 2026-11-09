import { courbe, intervallesDansLaFenetre } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Associer une courbe et sa tangente à une fonction'
export const dateDePublication = '12/10/2026'
export const uuid = '3792f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true
export const amcReady = 'true'
export const amcType = 'qcmMono'

/**
 * Une courbe et sa tangente en un point sont données. Parmi trois fonctions de la forme
 * $k\times g(x)+c$ ($g$ étant une fonction de référence), il faut retrouver celle qui convient :
 * - un distracteur a la bonne pente mais pas la bonne image (lecture de $f(a)$) ;
 * - un distracteur a la bonne image mais pas le bon nombre dérivé (lecture de $f'(a)$).
 *
 * Par défaut, la courbe n'est tracée qu'au voisinage du point de tangence pour qu'on ne puisse pas
 * deviner la fonction en lisant d'autres images (par exemple $f(0)$) ; une option permet de la tracer en entier.
 * @author Rémi Angot
 */

type FonctionDeReference = {
  /** Fonction de référence $g$ */
  g: (x: number) => number
  /** Dérivée de $g$ */
  dg: (x: number) => number
  /** Ensemble de définition de $f$ */
  domaine: string
  /** Abscisses du point de tangence pour lesquelles $g(a)$ est entier */
  valeursA: number[]
  /** Coefficients multiplicatifs possibles (le nombre dérivé reste entier) */
  valeursK: number[]
  /** Intervalles sur lesquels la courbe est tracée */
  intervalles: [number, number][]
  /** Écriture de $k\times g(x)$ */
  terme: (k: number) => string
  /** Écriture de $k\times g(a)$ avec $a$ remplacé */
  termeEn: (k: number, a: number) => string
  /** Écriture de $k\times g'(x)$ */
  derivee: (k: number) => string
  /** Écriture de $k\times g'(a)$ avec $a$ remplacé */
  deriveeEn: (k: number, a: number) => string
}

/** Facteur écrit devant un terme : rien si $k=1$, « - » si $k=-1$ */
const facteur = (k: number) => (k === 1 ? '' : k === -1 ? '-' : `${k}\\times`)

const fractionAvecSigne = (numerateur: number, denominateur: string) =>
  `${numerateur < 0 ? '-' : ''}\\dfrac{${Math.abs(numerateur)}}{${denominateur}}`

const fonctionsDeReference: FonctionDeReference[] = [
  {
    // x²
    g: (x) => x ** 2,
    dg: (x) => 2 * x,
    domaine: '$\\mathbb{R}$',
    valeursA: [-2, -1, 1, 2],
    valeursK: [-2, -1, 1, 2],
    intervalles: [[-5, 5]],
    terme: (k) => `${rienSi1(k)}x^2`,
    termeEn: (k, a) => `${facteur(k)}${ecritureParentheseSiNegatif(a)}^2`,
    derivee: (k) => `${rienSi1(2 * k)}x`,
    deriveeEn: (k, a) => `${2 * k}\\times${ecritureParentheseSiNegatif(a)}`,
  },
  {
    // x³
    g: (x) => x ** 3,
    dg: (x) => 3 * x ** 2,
    domaine: '$\\mathbb{R}$',
    valeursA: [-1, 1],
    valeursK: [-1, 1],
    intervalles: [[-5, 5]],
    terme: (k) => `${rienSi1(k)}x^3`,
    termeEn: (k, a) => `${facteur(k)}${ecritureParentheseSiNegatif(a)}^3`,
    derivee: (k) => `${rienSi1(3 * k)}x^2`,
    deriveeEn: (k, a) => `${3 * k}\\times${ecritureParentheseSiNegatif(a)}^2`,
  },
  {
    // √x
    g: (x) => Math.sqrt(x),
    dg: (x) => 1 / (2 * Math.sqrt(x)),
    domaine: '$[0\\,;+\\infty[$',
    valeursA: [1],
    valeursK: [-4, -2, 2, 4],
    intervalles: [[0, 5]],
    terme: (k) => `${rienSi1(k)}\\sqrt{x}`,
    termeEn: (k, a) => `${k}\\times\\sqrt{${a}}`,
    derivee: (k) => `\\dfrac{${k}}{2\\sqrt{x}}`,
    deriveeEn: (k, a) => `\\dfrac{${k}}{2\\sqrt{${a}}}`,
  },
  {
    // 1/x
    g: (x) => 1 / x,
    dg: (x) => -1 / x ** 2,
    domaine: '$\\mathbb{R}^*$',
    valeursA: [-1, 1],
    valeursK: [-3, -2, -1, 1, 2, 3],
    intervalles: [
      [-5, -0.2],
      [0.2, 5],
    ],
    terme: (k) => fractionAvecSigne(k, 'x'),
    termeEn: (k, a) => `${facteur(k)}\\dfrac{1}{${a}}`,
    derivee: (k) => fractionAvecSigne(-k, 'x^2'),
    deriveeEn: (k, a) =>
      fractionAvecSigne(-k, `${ecritureParentheseSiNegatif(a)}^2`),
  },
  {
    // e^x
    g: (x) => Math.exp(x),
    dg: (x) => Math.exp(x),
    domaine: '$\\mathbb{R}$',
    valeursA: [0],
    valeursK: [-3, -2, -1, 1, 2, 3],
    intervalles: [[-5, 5]],
    terme: (k) => `${rienSi1(k)}\\text{e}^x`,
    termeEn: (k, a) => `${facteur(k)}\\text{e}^{${a}}`,
    derivee: (k) => `${rienSi1(k)}\\text{e}^x`,
    deriveeEn: (k, a) => `${facteur(k)}\\text{e}^{${a}}`,
  },
]

const fenetre = 5 // le repère est [-5 ; 5] × [-5 ; 5]
// Par défaut, la courbe n'est tracée qu'au voisinage du point de tangence : on ne peut pas y lire d'autres
// images (par exemple f(0)) qui permettraient d'éliminer des propositions sans utiliser le nombre dérivé.
const voisinageCourbe = 0.75
const voisinageTangente = 1 // la tangente passe alors par des points à coordonnées entières

const expression = (fonction: FonctionDeReference, k: number, c: number) =>
  `f(x)=${fonction.terme(k)}${c === 0 ? '' : ecritureAlgebrique(c)}`

export default class AssocierCourbeTangenteFonction extends ExerciceQcmA {
  private appliquerLesValeurs(
    fonction: FonctionDeReference,
    a: number,
    k: number,
    c: number,
    cDistracteur: number,
    kDistracteur: number,
  ): void {
    const image = k * fonction.g(a) + c // f(a), entier par construction
    const nombreDerive = k * fonction.dg(a) // f'(a), entier par construction
    // Le second distracteur a la même image en a mais une autre pente
    const cDistracteurPente = c + (k - kDistracteur) * fonction.g(a)

    const f = (x: number) => k * fonction.g(x) + c
    const tangente = (x: number) => nombreDerive * (x - a) + image

    const r = repere({
      xMin: -fenetre,
      xMax: fenetre,
      yMin: -fenetre,
      yMax: fenetre,
      grille: true,
      grilleSecondaire: false,
      thickHauteur: 0.1,
      axeXStyle: '->',
      axeYStyle: '->',
    })
    const toutTracer = Boolean(this.sup5)
    const intervallesTraces = toutTracer
      ? fonction.intervalles
      : fonction.intervalles
          .map(([xMin, xMax]): [number, number] => [
            Math.max(xMin, a - voisinageCourbe),
            Math.min(xMax, a + voisinageCourbe),
          ])
          .filter(([xMin, xMax]) => xMin < xMax)
    const objets = intervallesDansLaFenetre(
      f,
      intervallesTraces,
      -fenetre,
      fenetre,
    ).map(([xMin, xMax]) =>
      courbe(f, {
        repere: r,
        xMin,
        xMax,
        yMin: -fenetre,
        yMax: fenetre,
        color: bleuMathalea,
        epaisseur: 2,
        step: 0.05,
      }),
    )
    const droiteTangente = courbe(tangente, {
      repere: r,
      xMin: toutTracer ? -fenetre : a - voisinageTangente,
      xMax: toutTracer ? fenetre : a + voisinageTangente,
      yMin: -fenetre,
      yMax: fenetre,
      color: 'red',
      epaisseur: 1.5,
    })
    const pointTangence = tracePoint(pointAbstrait(a, image), 'black')
    pointTangence.taille = 6
    pointTangence.epaisseur = 2

    // Le nom de la tangente est placé près de son extrémité droite, tant qu'elle reste dans le repère
    let xT = toutTracer ? fenetre - 0.5 : a + voisinageTangente
    while (
      Math.abs(tangente(xT)) > fenetre - 0.8 &&
      xT > (toutTracer ? -fenetre : a)
    )
      xT -= 0.1
    const nomTangente = texteParPosition(
      '$T$',
      xT + 0.3,
      tangente(xT) + (nombreDerive >= 0 ? 0.3 : -0.3),
      0,
      'red',
      1,
    )

    const objetsGraphique = [
      r,
      ...objets,
      droiteTangente,
      pointTangence,
      nomTangente,
    ]
    const graphique = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.6, style: 'margin: auto' },
        fixeBordures(objetsGraphique),
        { center: !context.isHtml },
      ),
      objetsGraphique,
    )

    const bonne = expression(fonction, k, c)
    const mauvaiseImage = expression(fonction, k, cDistracteur)
    const mauvaisePente = expression(fonction, kDistracteur, cDistracteurPente)
    this.reponses = [bonne, mauvaiseImage, mauvaisePente].map((e) => `$${e}$`)

    const calculImage = (kk: number, cc: number) =>
      `f(${a})=${fonction.termeEn(kk, a)}${cc === 0 ? '' : ecritureAlgebrique(cc)}`
    const calculDerivee = (kk: number) =>
      `f'(x)=${fonction.derivee(kk)}$, donc $f'(${a})=${fonction.deriveeEn(kk, a)}`
    const valeurDerivee = (kk: number) => texNombre(kk * fonction.dg(a))
    const valeurImage = (kk: number, cc: number) =>
      texNombre(kk * fonction.g(a) + cc)

    this.corrections = [
      `Pour cette fonction, $${calculImage(k, c)}=${valeurImage(k, c)}$ et $${calculDerivee(k)}=${valeurDerivee(k)}$ : elle convient.`,
      `Pour cette fonction, $${calculImage(k, cDistracteur)}=${valeurImage(k, cDistracteur)}$, or $f(${a})=${texNombre(image)}$ : elle ne convient pas.`,
      `Pour cette fonction, $${calculDerivee(kDistracteur)}=${valeurDerivee(kDistracteur)}$, or $f'(${a})=${texNombre(nombreDerive)}$ : elle ne convient pas.`,
    ]

    this.enonce = `On a tracé, ci-dessous, une partie de la courbe $\\mathcal{C}_f$ (en bleu) d'une fonction $f$ définie sur ${fonction.domaine}, ainsi que la tangente $T$ (en rouge) à $\\mathcal{C}_f$ au point d'abscisse $${a}$.<br>
${graphique}
Une seule des trois fonctions ci-dessous a pour courbe représentative $\\mathcal{C}_f$. Laquelle ?`
    this.correction = `Par lecture graphique, $f(${a})=${texNombre(image)}$ et le coefficient directeur de la tangente $T$ est $${texNombre(nombreDerive)}$, donc $f'(${a})=${texNombre(nombreDerive)}$.<br>On calcule ces deux valeurs pour chacune des fonctions proposées.<br>`
    this.correction += `La bonne réponse est : $${miseEnEvidence(bonne)}$`
    this.correction += '.<br>'
  }

  versionAleatoire: () => void = () => {
    const [type] = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: fonctionsDeReference.length,
      melange: fonctionsDeReference.length + 1,
      defaut: fonctionsDeReference.length + 1,
      nbQuestions: 1,
    })
    const fonction = fonctionsDeReference[Number(type) - 1]
    // Tirages dont le point de tangence est bien visible et la pente lisible sur le graphique
    const tirages = fonction.valeursA.flatMap((a) =>
      fonction.valeursK.flatMap((k) =>
        [-3, -2, -1, 0, 1, 2, 3]
          .filter(
            (c) =>
              Math.abs(k * fonction.g(a) + c) <= 3 &&
              Math.abs(k * fonction.dg(a)) <= 4,
          )
          .map((c) => ({ a, k, c })),
      ),
    )
    const { a, k, c } = choice(tirages)
    const cDistracteur = c + choice([-2, -1, 1, 2])
    const kDistracteur = choice(fonction.valeursK.filter((v) => v !== k))
    this.appliquerLesValeurs(fonction, a, k, c, cDistracteur, kDistracteur)
  }

  constructor() {
    super()
    this.options.vertical = true
    this.besoinFormulaire3Texte = [
      'Fonctions de référence',
      [
        'Nombres séparés par des tirets :',
        '1 : Fonction carré',
        '2 : Fonction cube',
        '3 : Fonction racine carrée',
        '4 : Fonction inverse',
        '5 : Fonction exponentielle',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = '6'
    // Décochée, la courbe n'est tracée qu'au voisinage du point de tangence
    this.besoinFormulaire5CaseACocher = ['Tracer toute la courbe', false]
    this.sup5 = false
    this.versionAleatoire()
  }
}
