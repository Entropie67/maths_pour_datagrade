import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaître les opérations sur les limites de suites'
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = '1d15b'
export const refs = {
  'fr-fr': ['TSA1-21', 'TCA1-11'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'reelFoisInfini'
  | 'reelSurInfini'
  | 'zeroFoisReel'
  | 'zeroFoisZero'
  | 'zeroSurZero'
  | 'infiniSurInfini'
  | 'infiniSurZero'
  | 'infinisOpposes'
  | 'zeroPlusInfini'
  | 'zeroSurInfini'
  | 'reelSurZero'
  | 'zeroSurReel'
  | 'infiniSurReel'
  | 'infiniFoisInfini'

type Conclusion = 'zero' | 'plusInfini' | 'moinsInfini' | 'indeterminee'

type DonneesQuestion = {
  limiteU: string
  limiteV: string
  expression: string
  conclusion: Conclusion
  justification: string
}

const textesConclusions: Record<Conclusion, string> = {
  zero: '$0$',
  plusInfini: '$+\\infty$',
  moinsInfini: '$-\\infty$',
  indeterminee: 'Forme indéterminée',
}

function conclusionSignee(signe: number): Conclusion {
  return signe > 0 ? 'plusInfini' : 'moinsInfini'
}

function conclusionEnEvidence(conclusion: Conclusion) {
  const texte =
    conclusion === 'zero'
      ? '0'
      : conclusion === 'plusInfini'
        ? '+\\infty'
        : conclusion === 'moinsInfini'
          ? '-\\infty'
          : '\\text{forme indéterminée}'
  return miseEnEvidence(texte)
}

/**
 * Reconnaître les formes déterminées et indéterminées dans les opérations sur
 * les limites de deux suites.
 * @author Stéphane Guyon
 */
export default class OperationsSurLesLimites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'reelFoisInfini',
        'reelSurInfini',
        'zeroFoisReel',
        'zeroFoisZero',
        'zeroSurZero',
        'infiniSurInfini',
        'infiniSurZero',
        'infinisOpposes',
        'zeroPlusInfini',
        'zeroSurInfini',
        'reelSurZero',
        'zeroSurReel',
        'infiniSurReel',
        'infiniFoisInfini',
      ],
      this.nbQuestions,
    )
    const qcmOptions = { radio: true, vertical: false, ordered: true }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const ell = choice([-1, 1]) * randint(2, 7)
      const signeU = choice([-1, 1])
      const signeV = choice([-1, 1])
      const infiniU = signeU > 0 ? '+\\infty' : '-\\infty'
      const infiniV = signeV > 0 ? '+\\infty' : '-\\infty'
      const signeZero = choice([-1, 1])
      const zeroLateral = signeZero > 0 ? '0^+' : '0^-'
      let donnees: DonneesQuestion

      switch (type) {
        case 'reelFoisInfini':
          donnees = {
            limiteU: String(ell),
            limiteV: infiniV,
            expression: 'u_n\\times v_n',
            conclusion: conclusionSignee(ell * signeV),
            justification:
              'Le produit d’un réel non nul par un infini est infini. Son signe est donné par la règle des signes.',
          }
          break
        case 'reelSurInfini':
          donnees = {
            limiteU: String(ell),
            limiteV: infiniV,
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: 'zero',
            justification: 'Le quotient d’un réel par un infini tend vers $0$.',
          }
          break
        case 'zeroFoisReel':
          donnees = {
            limiteU: '0',
            limiteV: String(ell),
            expression: 'u_n\\times v_n',
            conclusion: 'zero',
            justification: 'Le produit de $0$ par un réel est égal à $0$.',
          }
          break
        case 'zeroFoisZero':
          donnees = {
            limiteU: '0',
            limiteV: '0',
            expression: 'u_n\\times v_n',
            conclusion: 'zero',
            justification:
              'Le produit de deux suites qui tendent vers $0$ tend vers $0$.',
          }
          break
        case 'zeroSurZero':
          donnees = {
            limiteU: '0',
            limiteV: '0',
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: 'indeterminee',
            justification:
              'La forme «\u00a0$\\dfrac{0}{0}$\u00a0» est une forme indéterminée.',
          }
          break
        case 'infiniSurInfini':
          donnees = {
            limiteU: infiniU,
            limiteV: infiniV,
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: 'indeterminee',
            justification:
              'La forme $\\dfrac{\\infty}{\\infty}$ est une forme indéterminée.',
          }
          break
        case 'infiniSurZero':
          donnees = {
            limiteU: infiniU,
            limiteV: zeroLateral,
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: conclusionSignee(signeU * signeZero),
            justification:
              'Le numérateur tend vers un infini et le dénominateur vers $' +
              zeroLateral +
              '$. Le signe du quotient est donné par la règle des signes.',
          }
          break
        case 'infinisOpposes':
          donnees = {
            limiteU: '+\\infty',
            limiteV: '-\\infty',
            expression: 'u_n+v_n',
            conclusion: 'indeterminee',
            justification:
              'La forme $+\\infty-\\infty$ est une forme indéterminée.',
          }
          break
        case 'zeroPlusInfini':
          donnees = {
            limiteU: '0',
            limiteV: infiniV,
            expression: 'u_n+v_n',
            conclusion: conclusionSignee(signeV),
            justification:
              'Ajouter une suite qui tend vers $0$ ne change pas la limite infinie.',
          }
          break
        case 'zeroSurInfini':
          donnees = {
            limiteU: '0',
            limiteV: infiniV,
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: 'zero',
            justification:
              'Le quotient de $0$ par un infini a pour limite $0$.',
          }
          break
        case 'reelSurZero':
          donnees = {
            limiteU: String(ell),
            limiteV: zeroLateral,
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: conclusionSignee(ell * signeZero),
            justification:
              'Le numérateur tend vers le réel non nul $' +
              ell +
              '$ et le dénominateur vers $' +
              zeroLateral +
              '$. Le signe du quotient est donné par la règle des signes.',
          }
          break
        case 'zeroSurReel':
          donnees = {
            limiteU: '0',
            limiteV: String(ell),
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: 'zero',
            justification:
              'Le quotient de $0$ par un réel non nul a pour limite $0$.',
          }
          break
        case 'infiniSurReel':
          donnees = {
            limiteU: infiniU,
            limiteV: String(ell),
            expression: '\\dfrac{u_n}{v_n}',
            conclusion: conclusionSignee(signeU * ell),
            justification:
              'Le quotient d’un infini par un réel non nul est infini. Son signe est donné par la règle des signes.',
          }
          break
        case 'infiniFoisInfini':
          donnees = {
            limiteU: infiniU,
            limiteV: infiniV,
            expression: 'u_n\\times v_n',
            conclusion: conclusionSignee(signeU * signeV),
            justification:
              'Le produit de deux infinis est infini. Son signe est donné par la règle des signes.',
          }
          break
      }

      let texte =
        'On considère deux suites $(u_n)$ et $(v_n)$ telles que :<br>' +
        '$\\displaystyle\\lim_{n\\to+\\infty}u_n=' +
        donnees.limiteU +
        '$ et $\\displaystyle\\lim_{n\\to+\\infty}v_n=' +
        donnees.limiteV +
        '$.<br>À l’aide des opérations sur les limites, à quoi est égale ' +
        '$\\displaystyle\\lim_{n\\to+\\infty}\\left(' +
        donnees.expression +
        '\\right)$ ?'
      let texteCorr = donnees.justification
      if (donnees.conclusion === 'indeterminee') {
        texteCorr += `<br>C'est une ${texteEnCouleurEtGras('forme indéterminée')} : les limites de $(u_n)$ et $(v_n)$ ne suffisent pas pour déterminer celle de l’expression.`
      } else {
        texteCorr +=
          '<br>Donc $\\displaystyle\\lim_{n\\to+\\infty}\\left(' +
          donnees.expression +
          '\\right)=' +
          conclusionEnEvidence(donnees.conclusion) +
          '$.'
      }

      const bonneReponse = textesConclusions[donnees.conclusion]
      const utiliseEll = [
        'reelFoisInfini',
        'reelSurInfini',
        'zeroFoisReel',
        'reelSurZero',
        'zeroSurReel',
        'infiniSurReel',
      ].includes(type)
      const utiliseInfini = type.toLowerCase().includes('infini')
      const distracteursPrioritaires = [
        ...(utiliseEll ? [`$${ell}$`] : []),
        ...(utiliseEll ? [ell < 0 ? '$-\\infty$' : '$+\\infty$'] : []),
        ...(utiliseInfini ? ['$0$'] : []),
      ]
      const distracteursGeneriques = [
        '$0$',
        '$+\\infty$',
        '$-\\infty$',
        'Forme indéterminée',
        '$1$',
      ]
      const distracteurs = [
        ...new Set([
          ...distracteursPrioritaires,
          ...shuffle(distracteursGeneriques),
        ]),
      ].filter((proposition) => proposition !== bonneReponse)
      const propositions = shuffle([
        { texte: bonneReponse, statut: true },
        ...distracteurs
          .slice(0, 3)
          .map((proposition) => ({ texte: proposition, statut: false })),
      ])

      if (
        this.questionJamaisPosee(i, type, ell, donnees.limiteU, donnees.limiteV)
      ) {
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorr += qcmLatex.texteCorr
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
