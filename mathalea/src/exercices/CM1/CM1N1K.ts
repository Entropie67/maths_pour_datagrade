import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaître les multiples de 2, de 5 et de 10'
export const dateDePublication = '03/11/2026'
export const interactifReady = true

/**
 * Repérer, à partir du chiffre des unités, les multiples de 2, de 5 ou de 10
 * parmi quatre nombres
 * @author Rémi Angot
 */
export const uuid = 'b88f4'

export const refs = {
  'fr-fr': ['CM1N1K'],
  'fr-ch': [],
}

const unitesMultiples: Record<number, number[]> = {
  2: [0, 2, 4, 6, 8],
  5: [0, 5],
  10: [0],
}

const regles: Record<number, string> = {
  2: 'Un nombre est un multiple de $2$ si son chiffre des unités est $0$, $2$, $4$, $6$ ou $8$.',
  5: 'Un nombre est un multiple de $5$ si son chiffre des unités est $0$ ou $5$.',
  10: 'Un nombre est un multiple de $10$ si son chiffre des unités est $0$.',
}

export default class ReconnaitreMultiples2510 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Multiples',
      [
        'Nombres séparés par des tirets  :',
        '1 : De 2',
        '2 : De 5',
        '3 : De 10',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const diviseurs = [2, 5, 10]
    const listeDiviseurs = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: this.nbQuestions,
      }).map((n) => diviseurs[Number(n) - 1]),
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const k = listeDiviseurs[i]
      const bonnesUnites = unitesMultiples[k]
      const mauvaisesUnites = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
        (u) => !bonnesUnites.includes(u),
      )
      const nbMultiples = randint(1, 3)
      const unites = [
        ...Array.from({ length: nbMultiples }, () => choice(bonnesUnites)),
        // Pour les multiples de 10, un nombre terminé par 5 sert de piège
        ...(k === 10 ? [5] : []),
      ]
      while (unites.length < 4) {
        unites.push(choice(mauvaisesUnites))
      }
      const nombres = shuffle(unites.map((u) => randint(1, 999) * 10 + u))
      if (new Set(nombres).size < 4) {
        cpt++
        continue
      }
      const multiples = nombres.filter((n) => n % k === 0)

      let texte = `Parmi les nombres suivants, quels sont les multiples de $${k}$ ?`
      let texteCorr = `${regles[k]}<br>`
      texteCorr += nombres
        .map(
          (n) =>
            `$${texNombre(n)}$ a pour chiffre des unités $${n % 10}$, ${n % k === 0 ? "c'est" : "ce n'est pas"} un multiple de $${k}$.`,
        )
        .join('<br>')
      texteCorr += `<br>${multiples.length > 1 ? 'Les multiples' : 'Le seul multiple'} de $${k}$ ${multiples.length > 1 ? 'sont' : 'est'} ${multiples.map((n) => `$${miseEnEvidence(texNombre(n))}$`).join(', ')}.`

      const qcmOptions = { radio: false, vertical: false }
      if (this.questionJamaisPosee(i, k, ...nombres)) {
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions: nombres.map((n) => ({
                texte: `$${texNombre(n)}$`,
                statut: n % k === 0,
              })),
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
          texte += propositionsQcm(this, i).texte
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
