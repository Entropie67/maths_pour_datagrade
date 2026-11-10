import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer la limite d’une suite géométrique'
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const uuid = 'fbf5b'
export const refs = {
  'fr-fr': ['TSA1-26', 'TCA1-16'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'contractionPositive'
  | 'contractionNegative'
  | 'expansionPositive'
  | 'expansionNegative'
  | 'alternee'

type Reponse = '0' | '+\\infty' | '-\\infty' | 'Pas de limite'

type Raison = {
  tex: string
  comparaison: string
}

const raisonsContractionPositive: Raison[] = [
  { tex: '\\dfrac{1}{2}', comparaison: 'q\\in ]0\\,;\\,1[' },
  { tex: '\\dfrac{2}{3}', comparaison: 'q\\in ]0\\,;\\,1[' },
  { tex: '\\dfrac{3}{4}', comparaison: 'q\\in ]0\\,;\\,1[' },
]

const raisonsContractionNegative: Raison[] = [
  { tex: '-\\dfrac{1}{2}', comparaison: 'q\\in ]-1\\,;\\,0[' },
  { tex: '-\\dfrac{2}{3}', comparaison: 'q\\in ]-1\\,;\\,0[' },
  { tex: '-\\dfrac{3}{4}', comparaison: 'q\\in ]-1\\,;\\,0[' },
]

function puissance(raison: string): string {
  return /^\d+$/.test(raison) ? `${raison}^n` : `\\left(${raison}\\right)^n`
}

function termeGeometrique(coefficient: number, raison: string): string {
  return `${coefficient}\\times ${puissance(raison)}`
}

function reponseEnEvidence(reponse: Reponse): string {
  return reponse === 'Pas de limite'
    ? texteEnCouleurEtGras('Pas de limite')
    : `$${miseEnEvidence(reponse)}$`
}

/**
 * Limite d'une suite géométrique donnée par son premier terme et sa raison.
 * @author Stéphane Guyon
 */
export default class LimiteSuiteGeometrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer, si elle existe, la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer, si elle existe, la limite de chacune des suites lorsque $n$ tend vers $+\\infty$.'

    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'contractionPositive',
        'contractionNegative',
        'expansionPositive',
        'expansionNegative',
        'alternee',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const valeurAbsolueU0 = randint(2, 8)
      let u0: number
      let raison: Raison
      let reponse: Reponse
      let limitePuissance: string

      switch (type) {
        case 'contractionPositive':
          u0 = choice([-1, 1]) * valeurAbsolueU0
          raison = choice(raisonsContractionPositive)
          reponse = '0'
          limitePuissance = '0'
          break
        case 'contractionNegative':
          u0 = choice([-1, 1]) * valeurAbsolueU0
          raison = choice(raisonsContractionNegative)
          reponse = '0'
          limitePuissance = '0'
          break
        case 'expansionPositive': {
          u0 = valeurAbsolueU0
          const q = randint(2, 5)
          raison = { tex: String(q), comparaison: `q=${q}>1` }
          reponse = '+\\infty'
          limitePuissance = '+\\infty'
          break
        }
        case 'expansionNegative': {
          u0 = -valeurAbsolueU0
          const q = randint(2, 5)
          raison = { tex: String(q), comparaison: `q=${q}>1` }
          reponse = '-\\infty'
          limitePuissance = '+\\infty'
          break
        }
        case 'alternee': {
          u0 = choice([-1, 1]) * valeurAbsolueU0
          const q = choice([-1, -2, -3])
          raison = {
            tex: String(q),
            comparaison: q === -1 ? 'q=-1' : `-1>${q}=q`,
          }
          reponse = 'Pas de limite'
          limitePuissance = 'Pas de limite'
          break
        }
      }

      const expression = termeGeometrique(u0, raison.tex)
      let correction = `La suite $(u_n)$ est géométrique de premier terme $u_0=${u0}$ et de raison $q=${raison.tex}$.<br><br>Pour tout $n\\in\\mathbb N$, on a :<br>$u_n=u_0\\times q^n=${expression}$.<br><br>`

      if (limitePuissance === 'Pas de limite') {
        correction += `On a $${raison.comparaison}$. D’après le cours, la suite $(q^n)$ n’a pas de limite.<br><br>Par conséquent, la suite $(u_n)$ n’a pas de limite.`
      } else {
        correction += `On a $${raison.comparaison}$. D’après le cours, $\\displaystyle \\lim_{n\\to+\\infty}q^n=${limitePuissance}$.<br><br>`
        correction += `Ainsi, $\\displaystyle \\lim_{n\\to+\\infty}u_n=\\lim_{n\\to+\\infty}\\left(${expression}\\right)=${reponse}$.`
      }

      this.autoCorrection[i] = {
        enonce: '',
        options: { radio: true, vertical: false, ordered: true },
        propositions: shuffle([
          { texte: '$0$', statut: reponse === '0' },
          { texte: '$+\\infty$', statut: reponse === '+\\infty' },
          { texte: '$-\\infty$', statut: reponse === '-\\infty' },
          { texte: 'Pas de limite', statut: reponse === 'Pas de limite' },
        ]),
      }

      const texte = `La suite $(u_n)$ est une suite géométrique de premier terme $u_0=${u0}$ et de raison $q=${raison.tex}$.<br>${propositionsQcm(this, i).texte}`
      const texteCorr = `${correction}<br>La bonne réponse est ${reponseEnEvidence(reponse)}.`

      if (this.questionJamaisPosee(i, u0, raison.tex)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
