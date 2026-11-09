import { droiteParPointEtPente } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { all, sameInterval, sameSet } from '../../lib/interactif/checks'
import { createQuestion } from '../../lib/interactif/createQuestion'
import {
  spline,
  type NoeudSpline,
  type Spline,
} from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Résoudre graphiquement une équation et une inéquation'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '08/11/2026'
export const uuid = 'a5750'

export const refs = {
  'fr-fr': ['2F32-4'],
  'fr-ch': [],
}

// Les nœuds des courbes (repris de 2F32-1)
const noeuds1 = [
  { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -3, y: 1, deriveeGauche: 3, deriveeDroit: 3, isVisible: false },
  { x: -2, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -1, y: 1, deriveeGauche: -3, deriveeDroit: -3, isVisible: false },
  { x: 0, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 3, y: -2, deriveeGauche: -2.5, deriveeDroit: -2.5, isVisible: false },
  { x: 4, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]
const noeuds2 = [
  { x: -5, y: 1, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
  { x: -4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -3, y: 1, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
  { x: -2, y: 0, deriveeGauche: -1.5, deriveeDroit: -1, isVisible: false },
  { x: -1, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 0, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
  { x: 1, y: 3, deriveeGauche: 3, deriveeDroit: 3, isVisible: false },
  { x: 2, y: 5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 3, y: 4, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
  { x: 4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 5, y: 4, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
  { x: 6, y: 5, deriveeGauche: 0.2, deriveeDroit: 0.2, isVisible: true },
]
const noeuds3 = [
  { x: -6, y: -4, deriveeGauche: 0.5, deriveeDroit: 0.5, isVisible: true },
  { x: -5, y: -3, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
  { x: -4, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
  { x: -3, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -2, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: -1, y: -3, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: 0, y: -5, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 1, y: -3, deriveeGauche: 2.5, deriveeDroit: 2.5, isVisible: true },
  { x: 2, y: 0, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
  { x: 3, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 4, y: 0, deriveeGauche: -1.5, deriveeDroit: -1.5, isVisible: true },
  { x: 5, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]
const mesFonctions = [noeuds1, noeuds2, noeuds3]

/**
 * Transforme une des courbes de la liste par symétries et translations.
 */
function aleatoiriseCourbe(listeFonctions: NoeudSpline[][]): NoeudSpline[] {
  const coeffX = choice([-1, 1])
  const coeffY = choice([-1, 1])
  const deltaX = randint(-2, 2)
  const deltaY = randint(-2, 2)
  const choix = choice(listeFonctions)
  return choix.map((noeud) => ({
    x: (noeud.x + deltaX) * coeffX,
    y: (noeud.y + deltaY) * coeffY,
    deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
    deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
    isVisible: noeud.isVisible,
  }))
}

type Signe = '<' | '\\leqslant' | '>' | '\\geqslant'
const signes: Signe[] = ['<', '\\leqslant', '>', '\\geqslant']

type Intervalle = {
  gauche: number
  droite: number
  gaucheFerme: boolean
  droiteFerme: boolean
}

/**
 * Antécédents entiers de k, triés, ou null si l'un d'eux n'est pas entier.
 */
function antecedentsEntiers(f: Spline, k: number): number[] | null {
  const solutions = f.solve(k, 2) ?? []
  if (solutions.some((x) => !Number.isInteger(x))) return null
  return Array.from(new Set(solutions)).sort((a, b) => a - b)
}

/**
 * Ensemble des solutions de f(x) signe k sur le domaine de f,
 * sous forme d'une liste d'intervalles disjoints (un singleton est un
 * intervalle dont les bornes sont égales).
 */
function resoudInequation(
  f: Spline,
  k: number,
  signe: Signe,
  antecedents: number[],
): Intervalle[] {
  const image = f.fonction
  const xMin = f.x[0]
  const xMax = f.x[f.n - 1]
  const verifie = (y: number) => {
    switch (signe) {
      case '<':
        return y < k
      case '\\leqslant':
        return y <= k
      case '>':
        return y > k
      default:
        return y >= k
    }
  }
  const points = Array.from(new Set([xMin, ...antecedents, xMax])).sort(
    (a, b) => a - b,
  )
  // On parcourt alternativement les points et les intervalles ouverts entre
  // deux points consécutifs, puis on regroupe les éléments consécutifs qui
  // vérifient l'inéquation.
  const elements: { gauche: number; droite: number; ok: boolean }[] = []
  for (let j = 0; j < points.length; j++) {
    const x = points[j]
    const yPoint = antecedents.includes(x) ? k : image(x)
    elements.push({ gauche: x, droite: x, ok: verifie(yPoint) })
    if (j < points.length - 1) {
      const milieu = (x + points[j + 1]) / 2
      elements.push({
        gauche: x,
        droite: points[j + 1],
        ok: verifie(image(milieu)),
      })
    }
  }
  const intervalles: Intervalle[] = []
  let debut: number | null = null
  for (let j = 0; j <= elements.length; j++) {
    const ok = j < elements.length && elements[j].ok
    if (ok && debut === null) debut = j
    if (!ok && debut !== null) {
      const premier = elements[debut]
      const dernier = elements[j - 1]
      intervalles.push({
        gauche: premier.gauche,
        droite: dernier.droite,
        // un élément d'indice pair est un point, impair un intervalle ouvert
        gaucheFerme: debut % 2 === 0,
        droiteFerme: (j - 1) % 2 === 0,
      })
      debut = null
    }
  }
  return intervalles
}

/**
 * Écriture LaTeX de la réunion d'intervalles.
 */
function intervallesToLatex(intervalles: Intervalle[], sep = ';'): string {
  if (intervalles.length === 0) return '\\emptyset'
  return intervalles
    .map((inter) =>
      inter.gauche === inter.droite
        ? `\\{${inter.gauche}\\}`
        : `${inter.gaucheFerme ? '[' : ']'}${inter.gauche}${sep}${inter.droite}${inter.droiteFerme ? ']' : '['}`,
    )
    .join('\\cup')
}

/**
 * Lecture graphique des solutions de f(x)=k puis de f(x)<k (ou >, ⩽, ⩾).
 * @author Gilles Mora (d'après 2F32-1 de Jean-Claude Lhote)
 */
export default class ResoudreEquationInequationGraphiquement extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '5'
    this.besoinFormulaireTexte = [
      "Signe de l'inéquation",
      [
        'Nombres séparés par des tirets  :',
        '1 : <',
        '2 : ⩽',
        '3 : >',
        '4 : ⩾',
        '5 : Mélange',
      ].join('\n'),
    ]
    // Décrire la courbe donnerait les solutions.
    this.demandeLaVue = true
  }

  nouvelleVersion() {
    const listeSignes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map((n) => signes[Number(n) - 1])

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const signe = listeSignes[i]
      const nuage = aleatoiriseCourbe(mesFonctions)
      const f = spline(nuage)
      const bornes = f.trouveMaxes()
      const xMin = f.x[0]
      const xMax = f.x[f.n - 1]

      // Question a) : k1 a au moins un antécédent, tous entiers.
      const candidatsK1: number[] = []
      // Question b) : k2 a au moins un antécédent, tous entiers, et l'ensemble
      // des solutions n'est ni vide, ni le domaine entier, ni ne contient de
      // valeur isolée.
      const candidatsK2: number[] = []
      for (let k = bornes.yMin; k <= bornes.yMax; k++) {
        const ants = antecedentsEntiers(f, k)
        if (ants === null || ants.length === 0) continue
        candidatsK1.push(k)
        const sol = resoudInequation(f, k, signe, ants)
        if (sol.length === 0) continue
        if (sol.some((inter) => inter.gauche === inter.droite)) continue
        if (
          sol.length === 1 &&
          sol[0].gauche === xMin &&
          sol[0].droite === xMax &&
          sol[0].gaucheFerme &&
          sol[0].droiteFerme
        )
          continue
        candidatsK2.push(k)
      }
      if (candidatsK1.length === 0 || candidatsK2.length === 0) continue
      const k2 = choice(candidatsK2)
      const autresK1 = candidatsK1.filter((k) => k !== k2)
      const k1 = autresK1.length > 0 ? choice(autresK1) : k2
      if (!this.questionJamaisPosee(i, nuage.map((n) => n.y).join(','), k1, k2))
        continue

      const solutions1 = antecedentsEntiers(f, k1) ?? []
      const antecedents2 = antecedentsEntiers(f, k2) ?? []
      const intervalles = resoudInequation(f, k2, signe, antecedents2)
      const reponse1 = `\\{${solutions1.join(';')}\\}`
      const reponse2 = intervallesToLatex(intervalles)
      const reponse2Affichee = intervallesToLatex(intervalles, '\\,;\\,')

      // Figures
      const parametresRepere = {
        xMin: bornes.xMin - 1,
        xMax: bornes.xMax + 1,
        yMin: bornes.yMin - 1,
        yMax: bornes.yMax + 1,
        axesEpaisseur: 1.5,
        thickEpaisseur: 1.2,
        yLabelEcart: 0.6,
        thickHauteur: 0.1,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: bornes.yMin - 1,
        grilleSecondaireYMax: bornes.yMax + 1,
        grilleSecondaireXMin: bornes.xMin - 1,
        grilleSecondaireXMax: bornes.xMax + 1,
      } as const
      const repere1 = repere(parametresRepere)
      const courbeF = f.courbe({
        epaisseur: 1.2,
        color: bleuMathalea,
        ajouteNoeuds: true,
        optionsNoeuds: {
          color: bleuMathalea,
          taille: 1,
          style: '.',
          epaisseur: 1.5,
        },
      })
      const origine = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      const nomCourbe = latex2d(
        '\\mathscr{C}_f',
        xMax + 0.5,
        f.fonction(xMax) + 0.5,
        { color: bleuMathalea, letterSize: 'normalsize' },
      )

      const horizontale = (k: number) => {
        const d = droiteParPointEtPente(pointAbstrait(0, k), 0, '', '#009900')
        d.epaisseur = 2
        d.pointilles = 2
        return [
          d,
          latex2d(`y=${k}`, bornes.xMin - 0.5, k + 0.4, {
            color: '#009900',
            letterSize: 'small',
          }),
        ]
      }

      const objetsEnonce: NestedObjetMathalea2dArray = [
        repere1,
        courbeF,
        nomCourbe,
        origine,
      ]
      const objetsCorrection1: NestedObjetMathalea2dArray = [
        ...objetsEnonce,
        ...horizontale(k1),
        ...solutions1.map((x) =>
          lectureAntecedent(x, k1, 1, 1, 'red', '', ''),
        ),
      ]
      const objetsCorrection2: NestedObjetMathalea2dArray = [
        ...objetsEnonce,
        ...horizontale(k2),
        ...antecedents2.map((x) =>
          lectureAntecedent(x, k2, 1, 1, 'red', '', ''),
        ),
      ]
      for (const inter of intervalles) {
        const s = segment(inter.gauche, 0, inter.droite, 0, orangeMathalea)
        s.epaisseur = 4
        s.opacite = 0.7
        objetsCorrection2.push(s)
      }

      const figure = (objets: NestedObjetMathalea2dArray, description: string) =>
        mathalea2d(
          Object.assign(
            { scale: 0.6, display: 'block', description } as const,
            fixeBordures(objets),
          ),
          objets,
        )

      const descriptionEnonce = `Courbe représentative d'une fonction f définie sur l'intervalle de ${xMin} à ${xMax}, tracée dans un repère quadrillé. Lire sur le graphique les solutions demandées.`

      const position =
        signe === '<' || signe === '\\leqslant' ? 'en dessous' : 'au-dessus'
      const inclusion =
        signe === '<' || signe === '>'
          ? `L'inégalité est stricte : les abscisses des points d'intersection avec la droite d'équation $y=${k2}$ ne sont pas solutions.`
          : `L'inégalité est large : les abscisses des points d'intersection avec la droite d'équation $y=${k2}$ sont solutions.`
      const correctionB = `On cherche les abscisses des points de $\\mathscr{C}_f$ situés ${position} de la droite d'équation $y=${k2}$${signe === '\\leqslant' || signe === '\\geqslant' ? ' ou sur cette droite' : ''} (en pointillés verts).<br>
        ${inclusion}<br>
        On en déduit : $S=${miseEnEvidence(reponse2Affichee)}$.`

      createQuestion(this, i, {
        question:
          `Voici la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$ définie sur $[${xMin}\\,;\\,${xMax}]$.<br>` +
          figure(objetsEnonce, descriptionEnonce) +
          'Répondre aux questions en utilisant le graphique.',
        subQuestions: [
          {
            question: `Résoudre l'équation $f(x)=${k1}$.${this.interactif ? '<br>$S=$ %{0}' : ''}`,
            answer: {
              value: reponse1,
              compare: all([sameSet()]),
            },
            field: {
              keyboard: KeyboardType.clavierEnsemble,
            },
            correction:
              `Résoudre l'équation $f(x)=${k1}$ graphiquement revient à lire les abscisses des points d'intersection entre $\\mathscr{C}_f$ et ${k1 === 0 ? "l'axe des abscisses" : `la droite d'équation $y=${k1}$ (en pointillés verts)`}.<br>
              On en déduit : $S=${miseEnEvidence(`\\{${solutions1.join('\\,;\\,')}\\}`)}$.` +
              figure(objetsCorrection1, `Courbe de f et droite d'équation y = ${k1}.`),
          },
          {
            question: `Résoudre l'inéquation $f(x)${signe}${k2}$.${this.interactif ? '<br>$S=$ %{0}' : ''}`,
            answer: {
              value: reponse2,
              compare: all([sameInterval()]),
            },
            field: {
              keyboard: KeyboardType.clavierEnsemble,
            },
            correction:
              correctionB +
              figure(
                objetsCorrection2,
                `Courbe de f, droite d'équation y = ${k2} et solutions marquées sur l'axe des abscisses.`,
              ),
          },
        ],
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
