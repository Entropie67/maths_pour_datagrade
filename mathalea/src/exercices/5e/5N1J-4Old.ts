import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = "Trouver un nombre à l'aide d'un critère de divisibilité"
export const dateDePublication = '07/11/2025'

export const uuid = 'bc570'
export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter
 */

function formaterReponse(reponse: (number | string)[]): string {
  if (reponse.length === 0) return ''

  // Si c'est un tableau de chaînes, on le renvoie tel quel, joint avec "et"
  if (typeof reponse[0] === 'string') {
    return reponse.length === 1
      ? `${reponse[0]}`
      : `${reponse.slice(0, -1).join(', ')} et ${reponse[reponse.length - 1]}`
  }

  // Sinon (number[]), on applique le formatage LaTeX
  if (reponse.length === 1) {
    return `$${miseEnEvidence(reponse[0] as number)}$`
  }

  const corps = reponse
    .slice(0, -1)
    .map((x) => `$${miseEnEvidence(x as number)}$`)
    .join(', ')

  const dernier = `$${miseEnEvidence(reponse[reponse.length - 1] as number)}$`

  return `${corps} et ${dernier}`
}

export default class TrouverNombreOld extends Exercice {
  version: string
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Critères de divisibilité',
      [
        'Nombres séparés par des tirets  :',
        '1 : Par 2',
        '2 : Par 3',
        '3 : Par 4',
        '4 : Par 5',
        '5 : Par 6',
        '6 : Par 9',
        '7 : Par 10',
        '8 : Par 15',
        '9 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1-2-4'
    this.nbQuestions = 4
    this.version = '5N1J-4'
  }

  nouvelleVersion() {
    this.consigne = 'Trouver, si possible, un nombre qui convient à '

    this.consigne += this.nbQuestions > 1 ? 'chaque demande.' : 'cette demande.'

    this.consigne += this.interactif
      ? " Si aucun nombre n'est possible, indiquer $\\emptyset$ comme réponse."
      : ''

    const typeQuestionsDisponibles =
      this.version === '5N1autoA4-4'
        ? gestionnaireFormulaireTexte({
            saisie: this.sup,
            max: 3,
            melange: 4,
            defaut: 4,
            nbQuestions: this.nbQuestions,
            listeOfCase: [2, 5, 10],
          }).map(Number)
        : gestionnaireFormulaireTexte({
            saisie: this.sup,
            max: 8,
            melange: 9,
            defaut: 9,
            nbQuestions: this.nbQuestions,
            listeOfCase: [2, 3, 4, 5, 6, 9, 10, 15],
          }).map(Number)

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse: number[] | string[] = []
      let unite = 0
      unite = randint(0, 9)
      texte = `Trouver un nombre inférieur à $100$ et supérieur à $10$, divisible par $${listeTypeQuestions[i]}$ et dont le chiffre des unités est $${unite}$.`
      switch (listeTypeQuestions[i]) {
        case 2:
          texteCorr = `Pour qu'un nombre soit divisible par $2$, il doit être pair.<br>`
          if (unite % 2 === 0) {
            reponse = Array.from({ length: 9 }, (_, i) => (i + 1) * 10 + unite)
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ et est pair, alors tout nombre entier dont le chiffre des unités est $${unite}$ convient : ${formaterReponse(reponse)}.`
          } else {
            reponse = ['\\emptyset']
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ et est impair, alors ${texteEnCouleurEtGras('aucun')} nombre entier ${texteEnCouleurEtGras('ne convient')}.`
          }
          break
        case 3: {
          const base = [
            [30, 60, 90],
            [20, 50, 80],
            [10, 40, 70],
          ]
          reponse = base[unite % 3].map((v) => v + unite)
          texteCorr = `Pour qu'un nombre soit divisible par $3$, la somme de ses chiffres doit être divisible par $3$.<br>`
          texteCorr += `Puisque le chiffre des unités doit être $${unite}$, alors les seuls nombres entiers qui conviennent sont : ${formaterReponse(reponse)}.`

          break
        }
        case 4:
          texteCorr = `Pour qu'un nombre soit divisible par $4$, le nombre formé par son chiffre des dizaines et son chiffre des unités doit être divisible par $4$.<br>`
          if (unite % 2 === 0) {
            reponse = Array.from(
              { length: 9 },
              (_, i) => 10 * (i + 1) + unite,
            ).filter((n) => n % 4 === 0)
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ et est pair, alors tout nombre entier dont le chiffre des unités est $${unite}$ convient : ${formaterReponse(reponse)}.`
          } else {
            reponse = ['\\emptyset']
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ et est impair, alors ${texteEnCouleurEtGras('aucun')} nombre entier ${texteEnCouleurEtGras('ne convient')}.`
          }
          break
        case 5:
          texteCorr = `Pour qu'un nombre soit divisible par $5$, son chiffre des unités doit être $0$ ou $5$.<br>`
          if (unite % 5 === 0) {
            reponse = Array.from({ length: 8 }, (_, i) => (i + 2) * 10 + unite)
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$, alors tout nombre entier (entre $10$ et $100$) dont le chiffre des unités est $${unite}$ convient : ${formaterReponse(reponse)}.`
          } else {
            reponse = ['\\emptyset']
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ (et non $0$ ou $5$), alors ${texteEnCouleurEtGras('aucun')} nombre entier ${texteEnCouleurEtGras('ne convient')}.`
          }
          break
        case 6:
          texteCorr = `Pour qu'un nombre soit divisible par $6$, il doit être divisible par $2$ et par $3$.<br>`
          texteCorr +=
            'Il doit donc être pair et la somme de ses chiffres doit être divisible par $3$.'
          if (unite % 2 === 0) {
            reponse = Array.from(
              { length: 9 },
              (_, i) => 10 * (i + 1) + unite,
            ).filter((n) => {
              const d = Math.floor(n / 10)
              const u = n % 10
              return (d + u) % 3 === 0
            })
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ et est pair, alors les nombres entiers qui conviennent sont : ${formaterReponse(reponse)}.`
          } else {
            reponse = ['\\emptyset']
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ et est impair, alors ${texteEnCouleurEtGras('aucun')} nombre entier ${texteEnCouleurEtGras('ne convient')}.`
          }
          break
        case 9:
          reponse = unite === 9 ? [99] : [(9 - unite) * 10 + unite]
          texteCorr = `Pour qu'un nombre soit divisible par $9$, la somme de ses chiffres doit être divisible par $9$.<br>`
          texteCorr += `Puisque le chiffre des unités doit être $${unite}$, alors le seul nombres entier qui convient est : ${formaterReponse(reponse)}.`
          break
        case 10:
          texteCorr = `Pour qu'un nombre soit divisible par $10$, son chiffre des unités doit être $0$.<br>`
          if (unite % 10 === 0) {
            reponse = Array.from({ length: 8 }, (_, i) => (i + 2) * 10 + unite)
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$, alors tout nombre entier (entre $10$ et $100$) dont le chiffre des unités est $${unite}$ convient : ${formaterReponse(reponse)}.`
          } else {
            reponse = ['\\emptyset']
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ (et non $0$), alors ${texteEnCouleurEtGras('aucun')} nombre entier ${texteEnCouleurEtGras('ne convient')}.`
          }
          break
        case 15:
          texteCorr = `Pour qu'un nombre soit divisible par $15$, il doit être divisible par $3$ et par $5$.<br>`
          texteCorr +=
            'La somme de ses chiffres doit être divisible par $3$ et son chiffre des unités doit être $0$ ou $5$.'
          if (unite % 5 === 0) {
            reponse = Array.from(
              { length: 9 },
              (_, i) => 10 * (i + 1) + unite,
            ).filter((n) => {
              const d = Math.floor(n / 10)
              const u = n % 10
              return (d + u) % 3 === 0
            })
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$, alors les nombres entiers qui conviennent sont : ${formaterReponse(reponse)}.`
          } else {
            reponse = ['\\emptyset']
            texteCorr += `Puisque le chiffre des unités doit être $${unite}$ (et non $0$ ou $5$), alors ${texteEnCouleurEtGras('aucun')} nombre entier ${texteEnCouleurEtGras('ne convient')}.`
          }
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble)
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { suiteDeNombres: true } },
      })
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], unite)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
