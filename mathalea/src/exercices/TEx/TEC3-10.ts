import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { addMultiMathfield, type DataOptionsMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import type { Valeur as ReponsesAttendues } from '../../lib/types'
import { cercleTrigo } from '../../lib/2d/cercleTrigo'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Utiliser les formules d'addition du cosinus et du sinus"
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = 'f6bd3'
export const refs = {
  'fr-fr': ['TEC3-10'],
  'fr-ch': [],
}
export const dateDePublication = '04/11/2026'

/**
 * Calculer la somme ou la différence de deux angles remarquables, puis en
 * déduire le cosinus et le sinus d'un angle de la forme kπ/12 (k = ±1, ±5,
 * ±7, ±11) avec les formules d'addition (56 couples).
 * Les angles sont notés en douzièmes de π : k désigne kπ/12.
 */

// Angles remarquables (en douzièmes de π) : ±π/6, ±π/4, ±π/3 modulo π,
// de π/6 à 11π/6 (2π/3, 3π/4, 5π/6, 7π/6, 5π/4, 4π/3, 5π/3, 7π/4, 11π/6…)
const ANGLES = [2, 3, 4, 8, 9, 10, 14, 15, 16, 20, 21, 22]
// Un résultat n'est pas remarquable quand k n'est divisible ni par 2 ni par 3 ;
// on le garde dans ]-π ; π[.
const estResultatValide = (k: number) => Math.abs(k) <= 12 && k % 2 !== 0 && k % 3 !== 0

// Valeur remarquable c/2 × √r, avec r valant 1, 2 ou 3
type Valeur = { c: number, r: 1 | 2 | 3 }
// Cosinus et sinus de π/6, π/4 et π/3
const BASE: Record<number, { cos: Valeur, sin: Valeur }> = {
  2: { cos: { c: 1, r: 3 }, sin: { c: 1, r: 1 } },
  3: { cos: { c: 1, r: 2 }, sin: { c: 1, r: 2 } },
  4: { cos: { c: 1, r: 1 }, sin: { c: 1, r: 3 } },
}

/** Cosinus et sinus de kπ/12 (k remarquable), par angle associé et signes. */
function cosSin(k: number): { cos: Valeur, sin: Valeur } {
  const m = ((k % 24) + 24) % 24
  const sinPositif = m <= 12
  const n = sinPositif ? m : 24 - m
  const cosPositif = n <= 6
  const ref = BASE[cosPositif ? n : 12 - n]
  return {
    cos: { c: cosPositif ? ref.cos.c : -ref.cos.c, r: ref.cos.r },
    sin: { c: sinPositif ? ref.sin.c : -ref.sin.c, r: ref.sin.r },
  }
}

const CHIFFRES = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']
// Claviers réduits : ni lettres ni touches inutiles
const TOUCHES_ANGLE = [CHIFFRES, ['-', '\\pi', 'FRAC']]
const TOUCHES_VALEUR = [CHIFFRES, ['-', '+', 'SQRT', 'FRAC']]

type Couple = { a: number, b: number, signe: 1 | -1 }

const COUPLES: Couple[] = []
for (const a of ANGLES) {
  for (const b of ANGLES) {
    if (a === b) continue
    for (const signe of [1, -1] as const) {
      if (estResultatValide(a + signe * b)) {
        COUPLES.push({ a, b, signe })
      }
    }
  }
}

function fracAngle(k: number): string {
  const signe = k < 0 ? '-' : ''
  const abs = Math.abs(k)
  const pgcd = abs % 12 === 0 ? 12 : [6, 4, 3, 2].find(d => abs % d === 0 && 12 % d === 0) ?? 1
  const num = abs / pgcd
  const den = 12 / pgcd
  const numTex = num === 1 ? '\\pi' : `${num}\\pi`
  return den === 1 ? `${signe}${numTex}` : `${signe}\\dfrac{${numTex}}{${den}}`
}

function texValeur(v: Valeur): string {
  const racine = v.r === 1 ? '' : `\\dfrac{\\sqrt{${v.r}}}{2}`
  if (v.r === 1) return `${v.c < 0 ? '-' : ''}\\dfrac{1}{2}`
  return v.c < 0 ? `-${racine}` : racine
}

function entoure(v: Valeur): string {
  return v.c < 0 ? `\\left(${texValeur(v)}\\right)` : texValeur(v)
}

// Somme de produits : chaque terme vaut coef/4 × √r ; on regroupe par radical
function calculeTermes(termes: { coef: number, v1: Valeur, v2: Valeur }[]): string {
  const parRadical = new Map<number, number>()
  for (const { coef, v1, v2 } of termes) {
    const produit = v1.r * v2.r
    // √r1 × √r2 : 1, 2, 3 ou 6 sous la racine, ou un entier (4 → 2, 9 → 3)
    const radical = [1, 2, 3, 6].includes(produit) ? produit : 1
    const facteur = produit === 4 ? 2 : produit === 9 ? 3 : 1
    parRadical.set(radical, (parRadical.get(radical) ?? 0) + coef * v1.c * v2.c * facteur)
  }
  let numerateur = ''
  for (const radical of [6, 3, 2, 1]) {
    const c = parRadical.get(radical)
    if (!c) continue
    const abs = Math.abs(c)
    const corps = radical === 1 ? `${abs}` : `${abs === 1 ? '' : abs}\\sqrt{${radical}}`
    numerateur += `${c < 0 ? '-' : numerateur === '' ? '' : '+'}${corps}`
  }
  return `\\dfrac{${numerateur}}{4}`
}

// Produit de deux valeurs remarquables : valeur absolue (en texte) et signe
function produit(v1: Valeur, v2: Valeur): { negatif: boolean, tex: string } {
  const tex = calculeTermes([{ coef: 1, v1: { ...v1, c: 1 }, v2: { ...v2, c: 1 } }])
  return { negatif: v1.c * v2.c < 0, tex }
}

export default class FormulesAdditionCosSin extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 2
    this.sup = '1-2'
    this.besoinFormulaireTexte = [
      'Valeurs à calculer',
      'Nombres séparés par des tirets :\n1 : Cosinus\n2 : Sinus\n(1-2 pour les deux)',
    ]
  }

  nouvelleVersion() {
    const choix = String(this.sup).split('-')
    const avecCos = choix.includes('1') || !choix.includes('2')
    const avecSin = choix.includes('2') || !choix.includes('1')
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 200; cpt++) {
      const { a, b, signe } = choice(COUPLES)
      // Au-delà de 50 essais, tolérer un doublon (peu de couples pour beaucoup de questions)
      if (!this.questionJamaisPosee(i, a, b, signe) && cpt < 50) continue
      const k = a + signe * b
      const op = signe === 1 ? '+' : '-'
      const ta = fracAngle(a)
      const tb = fracAngle(b)
      const tk = fracAngle(k)
      const A = cosSin(a)
      const B = cosSin(b)
      const cosTex = calculeTermes([
        { coef: 1, v1: A.cos, v2: B.cos },
        { coef: -signe, v1: A.sin, v2: B.sin },
      ])
      const sinTex = calculeTermes([
        { coef: 1, v1: A.sin, v2: B.cos },
        { coef: signe, v1: A.cos, v2: B.sin },
      ])
      const na = `\\left(${ta}\\right)`
      const nb = `\\left(${tb}\\right)`
      const nk = `\\left(${tk}\\right)`

      // Cercle trigonométrique : coordonnées (cos ; sin) des angles remarquables,
      // avec les deux angles utilisés repérés en couleur
      const figure = mathalea2d(
        { xmin: -2.2, ymin: -1.95, xmax: 2.2, ymax: 2.0, pixelsParCm: 100, scale: 1, display: 'block' },
        cercleTrigo({
          radius: 1.5,
          showCoordinates: false,
          showRadians: false,
          showBasePoints: false,
          guideAngles: [fraction(a, 12), fraction(b, 12)],
          markedPoints: [
            { angle: fraction(a, 12), color: '#216D9A', projection: true },
            { angle: fraction(b, 12), color: '#4D8613', projection: true },
          ],
        }),
      )

      // Rappel des valeurs remarquables utilisées
      const rappel =
        `Le cercle trigonométrique permet de lire les valeurs remarquables : le cosinus est l'abscisse du point et le sinus son ordonnée.${figure}` +
        `L'angle $${ta}$ correspond au point bleu et l'angle $${tb}$ au point vert.<br><br>` +
        'Rappel des valeurs remarquables :<br>' +
        `$\\cos${na}=${texValeur(A.cos)}$ et $\\sin${na}=${texValeur(A.sin)}$,<br>` +
        `$\\cos${nb}=${texValeur(B.cos)}$ et $\\sin${nb}=${texValeur(B.sin)}$.`

      // Détail du calcul d'une formule d'addition
      const detail = (
        fn: 'cos' | 'sin',
        [f1, g1, v1, w1]: [string, string, Valeur, Valeur],
        [f2, g2, v2, w2]: [string, string, Valeur, Valeur],
        opFormule: string,
        resultat: string,
        avecRappel: boolean,
      ) => {
        const p1 = produit(v1, w1)
        const p2 = produit(v2, w2)
        const terme2 = p2.negatif ? `\\left(-${p2.tex}\\right)` : p2.tex
        const marge = `\\phantom{\\${fn}${nk}}`
        return (
          `Comme $${tk}=${ta}${op}${tb}$, on applique la formule ` +
          `$\\${fn}(a${op}b)=\\${f1}(a)\\${g1}(b)${opFormule}\\${f2}(a)\\${g2}(b)$ ` +
          `avec $a=${ta}$ et $b=${tb}$.<br><br>` +
          `$\\${fn}${nk}=\\${f1}${na}\\${g1}${nb}${opFormule}\\${f2}${na}\\${g2}${nb}$<br><br>` +
          // Les valeurs remarquables suivent l'expression qui les fait apparaître
          (avecRappel ? `${rappel}<br><br>` : '') +
          // Après le rappel, le calcul reprend avec l'écriture de départ
          `$${avecRappel ? `\\${fn}${nk}` : marge}=${entoure(v1)}\\times ${entoure(w1)}${opFormule}${entoure(v2)}\\times ${entoure(w2)}$<br><br>` +
          `$${marge}=${p1.negatif ? '-' : ''}${p1.tex}${opFormule}${terme2}$<br><br>` +
          `$${marge}=${miseEnEvidence(resultat)}$.`
        )
      }

      // En interactif : uniquement le calcul, suivi du champ de réponse
      const inter = this.interactif
      const champ = { keyboard: KeyboardType.clavierEntierementPersonnalisable, dataKeys: TOUCHES_VALEUR }
      const subQuestions = [
        {
          question: inter ? `$${ta}${op}${tb}=$` : `Calculer $${ta}${op}${tb}$.`,
          answer: { value: tk },
          field: { keyboard: KeyboardType.clavierEntierementPersonnalisable, dataKeys: TOUCHES_ANGLE },
          correction:
            `$${ta}${op}${tb}=\\dfrac{${a}\\pi}{12}${op}\\dfrac{${b}\\pi}{12}=${miseEnEvidence(tk)}$.`,
        },
      ]
      if (avecCos) {
        subQuestions.push({
          question: inter ? `En déduire $\\cos${nk}=$` : `En déduire la valeur exacte de $\\cos${nk}$.`,
          answer: { value: cosTex },
          field: champ,
          correction: detail('cos', ['cos', 'cos', A.cos, B.cos], ['sin', 'sin', A.sin, B.sin], signe === 1 ? '-' : '+', cosTex, true),
        })
      }
      if (avecSin) {
        subQuestions.push({
          question: inter ? `${avecCos ? '' : 'En déduire '}$\\sin${nk}=$` : `${avecCos ? 'Donner' : 'En déduire'} la valeur exacte de $\\sin${nk}$.`,
          answer: { value: sinTex },
          field: champ,
          correction: detail('sin', ['sin', 'cos', A.sin, B.cos], ['cos', 'sin', A.cos, B.sin], signe === 1 ? '+' : '-', sinTex, !avecCos),
        })
      }
      if (inter) {
        // Pas de repères a), b) : une ligne par calcul, chacune avec son champ
        const answers: Record<string, unknown> = {}
        const dataOptions: DataOptionsMultiMathfield = {}
        subQuestions.forEach(({ answer, field }, k) => {
          const name = `field${k}` as keyof DataOptionsMultiMathfield
          answers[name] = answer
          dataOptions[name] = field
        })
        this.listeQuestions[i] = addMultiMathfield(this, i, {
          dataTemplate: subQuestions.map(({ question }, k) => `${question} %{field${k}}`).join('<br><br>') + '<br>',
          dataOptions,
        })
        this.listeCorrections[i] = subQuestions.map(({ correction }) => correction).join('<br><br>')
        handleAnswers(this, i, { ...answers, bareme: toutAUnPoint } as ReponsesAttendues, { formatInteractif: 'multi-mathfield' })
      } else {
        createQuestion(this, i, {
          question: "Utiliser les formules d'addition du cosinus et du sinus.",
          subQuestions,
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}

