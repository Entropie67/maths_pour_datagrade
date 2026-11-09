import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer la limite de suites géométriques et arithmético-géométriques'
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const uuid = 'd87f9'
export const refs = {
  'fr-fr': ['TSA1-30', 'TCA1-20'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'puissanceContractionPositive'
  | 'puissanceContractionNegative'
  | 'puissanceExpansion'
  | 'puissanceAlternee'
  | 'geometriqueContractionPositive'
  | 'geometriqueContractionNegative'
  | 'geometriqueExpansion'
  | 'affineExpansion'
  | 'geometriqueAlternee'
  | 'affineAlternee'

type Reponse = '0' | '+\\infty' | '-\\infty' | 'Pas de limite'

type DonneesQuestion = {
  expression: string
  reponse: Reponse
  correction: string
}

const valeursQContractionPositive = [
  { tex: '\\dfrac{1}{2}', description: 'q\\in ]0\\,;\\,1[' },
  { tex: '\\dfrac{2}{3}', description: 'q\\in ]0\\,;\\,1[' },
  { tex: '\\dfrac{3}{4}', description: 'q\\in ]0\\,;\\,1[' },
]

const valeursQContractionNegative = [
  { tex: '-\\dfrac{1}{2}', description: 'q\\in ]-1\\,;\\,0[' },
  { tex: '-\\dfrac{2}{3}', description: 'q\\in ]-1\\,;\\,0[' },
  { tex: '-\\dfrac{3}{4}', description: 'q\\in ]-1\\,;\\,0[' },
]

function termeGeometrique(coefficient: number, q: string): string {
  const base = /^\d+$/.test(q) ? q : `\\left(${q}\\right)`
  return `${coefficient}\\times ${base}^n`
}

function expressionAffine(a: number, b: number, q: string): string {
  const terme = termeGeometrique(Math.abs(b), q)
  return `${a}${b > 0 ? '+' : '-'}${terme}`
}

function reponseEnEvidence(reponse: Reponse): string {
  return reponse === 'Pas de limite'
    ? texteEnCouleurEtGras('Pas de limite')
    : `$${miseEnEvidence(reponse)}$`
}

/**
 * Limites de suites de la forme a q^n ou a+b q^n.
 * @author Stéphane Guyon
 */
export default class LimitesSuitesGeometriques extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type de suites',
      4,
      '1 : qⁿ\n2 : a × qⁿ\n3 : a + b × qⁿ\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer, si elle existe, la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer, si elle existe, la limite de chacune des suites lorsque $n$ tend vers $+\\infty$.'

    const typesPuissances: TypeQuestion[] = [
      'puissanceContractionPositive',
      'puissanceContractionNegative',
      'puissanceExpansion',
      'puissanceAlternee',
    ]
    const typesGeometriques: TypeQuestion[] = [
      'geometriqueContractionPositive',
      'geometriqueContractionNegative',
      'geometriqueExpansion',
      'geometriqueAlternee',
    ]
    const typesArithmeticoGeometriques: TypeQuestion[] = [
      'affineExpansion',
      'affineAlternee',
    ]
    const typesDisponibles =
      this.sup === 1
        ? typesPuissances
        : this.sup === 2
          ? typesGeometriques
          : this.sup === 3
            ? typesArithmeticoGeometriques
            : [
                ...typesPuissances,
                ...typesGeometriques,
                ...typesArithmeticoGeometriques,
              ]

    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      typesDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const a = randint(-7, 7, 0)
      const b = randint(-7, 7, 0)
      let donnees: DonneesQuestion

      switch (type) {
        case 'puissanceContractionPositive':
        case 'puissanceContractionNegative':
        case 'geometriqueContractionPositive':
        case 'geometriqueContractionNegative': {
          const sansCoefficient = type.startsWith('puissance')
          const q = choice(
            type.endsWith('Positive')
              ? valeursQContractionPositive
              : valeursQContractionNegative,
          )
          donnees = {
            expression: sansCoefficient
              ? `\\left(${q.tex}\\right)^n`
              : termeGeometrique(a, q.tex),
            reponse: '0',
            correction: `On a $${q.description}$, donc $\\displaystyle \\lim_{n\\to+\\infty}q^n=0$.<br>Ainsi, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
        case 'puissanceExpansion':
        case 'geometriqueExpansion': {
          const q = randint(2, 5)
          const sansCoefficient = type === 'puissanceExpansion'
          const reponse: Reponse =
            sansCoefficient || a > 0 ? '+\\infty' : '-\\infty'
          donnees = {
            expression: sansCoefficient
              ? `${q}^n`
              : termeGeometrique(a, String(q)),
            reponse,
            correction: sansCoefficient
              ? `Comme $q=${q}>1$, on sait que $\\displaystyle \\lim_{n\\to+\\infty}q^n=${miseEnEvidence('+\\infty')}$.`
              : `Comme $q=${q}>1$, on sait que $\\displaystyle \\lim_{n\\to+\\infty}q^n=+\\infty$.<br><br>Comme $${a > 0 ? `${a}>0` : `0>${a}`}$, alors $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
        case 'affineExpansion': {
          const q = randint(2, 5)
          const reponse: Reponse = b > 0 ? '+\\infty' : '-\\infty'
          donnees = {
            expression: expressionAffine(a, b, String(q)),
            reponse,
            correction: `Comme $q=${q}>1$, on sait que $\\displaystyle \\lim_{n\\to+\\infty}q^n=+\\infty$.<br><br>Comme $${b > 0 ? `${b}>0` : `0>${b}`}$, alors $\\displaystyle \\lim_{n\\to+\\infty}\\left(${expressionAffine(a, b, String(q))}\\right)=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
        case 'puissanceAlternee':
        case 'geometriqueAlternee': {
          const q = choice([-1, -2, -3])
          const sansCoefficient = type === 'puissanceAlternee'
          donnees = {
            expression: sansCoefficient
              ? `\\left(${q}\\right)^n`
              : termeGeometrique(a, String(q)),
            reponse: 'Pas de limite',
            correction:
              q === -1
                ? `Pour tout entier naturel $n$, $(-1)^{2n}=1$ et $(-1)^{2n+1}=-1$.<br>La suite $(u_n)$ n’a pas de limite.`
                : `Comme $-1>${q}=q$, la suite $(u_n)$ n’a pas de limite.`,
          }
          break
        }
        case 'affineAlternee': {
          const q = choice([-1, -2, -3])
          donnees = {
            expression: expressionAffine(a, b, String(q)),
            reponse: 'Pas de limite',
            correction:
              q === -1
                ? `Pour tout entier naturel $n$, $(-1)^{2n}=1$ et $(-1)^{2n+1}=-1$.<br>Les termes d’indices pairs et impairs de $(u_n)$ ont donc des comportements différents ; l’ajout de la constante $${a}$ ne change pas ce constat.<br>La suite $(u_n)$ n’a pas de limite.`
                : `Comme $-1>${q}=q$, $(${q})^n$ n'admet pas de limites en $+\\infty$<br>La multiplication par un réel non nul et l’ajout de la constante $${a}$ ne changent rien<br>La suite $(u_n)$ n’a pas de limite.`,
          }
          break
        }
      }

      this.autoCorrection[i] = {
        enonce: '',
        options: { radio: true, vertical: false, ordered: true },
        propositions: shuffle([
          { texte: '$0$', statut: donnees.reponse === '0' },
          { texte: '$+\\infty$', statut: donnees.reponse === '+\\infty' },
          { texte: '$-\\infty$', statut: donnees.reponse === '-\\infty' },
          {
            texte: 'Pas de limite',
            statut: donnees.reponse === 'Pas de limite',
          },
        ]),
      }

      const texte = `La suite $(u_n)$ est définie, pour tout entier naturel $n$, par :<br>$u_n=${donnees.expression}$.<br>${propositionsQcm(this, i).texte}`
      const texteCorr = `${donnees.correction}<br>La bonne réponse est ${reponseEnEvidence(donnees.reponse)}.`

      if (this.questionJamaisPosee(i, donnees.expression)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
