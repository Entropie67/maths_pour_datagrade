import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Transformer des minutes en heures décimales'
export const dateDePublication = '06/09/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora

 */
export const uuid = '99957'

export const refs = {
  'fr-fr': ['can6D3-02', '6M4C-flash4'],
  'fr-ch': ['NR'],
}
export default class MinutesHeuresDecimale extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const choixType = this.quotaChoice('choixType', [1, 2, 2])

    switch (choixType) {
      case 1:
        {
          // Cas avec des quarts d'heure (15, 45 minutes)
          const heures = randint(0, 1) // 0 ou 1 heure
          const minutes = [15, 45][randint(0, 1)] // 15 ou 45 minutes
          const totalMinutes = heures * 60 + minutes
          const heuresDecimales = heures + minutes / 60

          this.question = `Une durée de $${totalMinutes}$ minutes correspond à : `

          const fractionText =
            minutes === 15 ? '\\dfrac{1}{4}' : '\\dfrac{3}{4}'
          const decimalText = minutes === 15 ? '0,25' : '0,75'

          if (totalMinutes >= 60) {
            // Cas avec 1h + 15min ou 1h + 45min
            this.correction = `$${totalMinutes}\\text{ min}= ${heures * 60} \\text{ min}+${minutes}\\text{ min}=${heures}\\text{ h}+${fractionText}\\text{ h}=${texNombre(heuresDecimales, 2)}\\text{ h}$.<br>
               Ainsi, $${totalMinutes}$ min correspond à $${miseEnEvidence(texNombre(heuresDecimales, 2))}$ heure.`
          } else {
            // Cas avec seulement 15min ou 45min
            this.correction = `$${totalMinutes}\\text{ min}= ${fractionText}\\text{ h}=${decimalText}\\text{ h}$.<br>
               Ainsi, $${totalMinutes}$ min correspond à `
            this.correction += this.versionQcm
              ? `$${miseEnEvidence(texNombre(heuresDecimales, 2))}$ ${texteEnCouleurEtGras('heure')}.`
              : `$${miseEnEvidence(texNombre(heuresDecimales, 2))}$ heure.`
          }

          // Générer des fausses réponses
          const fausses = [
            heuresDecimales + 0.1,
            totalMinutes === 15 ? heuresDecimales + 0.2 : heuresDecimales - 0.1,
            (heures * 60 + minutes) / 100, // Erreur classique : mettre les minutes en centièmes
          ].filter((x) => x > 0 && x !== heuresDecimales)

          this.reponse = this.versionQcm
            ? `$${texNombre(heuresDecimales, 2)}$ heure`
            : `${texNombre(heuresDecimales, 2)}`

          this.distracteurs = [
            `$${texNombre(fausses[0], 2)}$ heure`,
            `$${texNombre(fausses[1], 2)}$ heure`,
            `$${texNombre(fausses[2], 2)}$ heure`,
          ]
        }
        break

      case 2:
      default:
        {
          // Cas avec des durées incluant plus d'une heure - multiples de 6 pour décimales rondes
          const minutesChoix = [66, 72, 78, 84, 90, 96, 102, 108, 114] // 1h + multiples de 6
          const minutesTotales =
            minutesChoix[randint(0, minutesChoix.length - 1)]
          const heures = Math.floor(minutesTotales / 60)
          const minutes = minutesTotales % 60
          const heuresDecimales = minutesTotales / 60

          this.question = `Une durée de $${minutesTotales}$ minutes correspond à : `

          // Construire la fraction simplifiée
          let fractionText = `\\dfrac{${minutes}}{60}`
          // let decimalText = texNombre(minutes / 60, 2)

          if (minutes === 30) {
            fractionText = '\\dfrac{1}{2}'
            // decimalText = '0,5'
          } else if (minutes % 6 === 0) {
            const dixieme = minutes / 6
            fractionText = `\\dfrac{${dixieme}}{10}`
            // decimalText = texNombre(dixieme / 10, 1)
          }

          this.correction = `$${minutesTotales}\\text{ min}= ${heures * 60} \\text{ min}+${minutes}\\text{ min}=${heures}\\text{ h}+${fractionText}\\text{ h}=${texNombre(heuresDecimales, 1)}\\text{ h}$.<br>
             Ainsi, $${minutesTotales}$ min correspond à `

          this.correction += this.versionQcm
            ? `$${miseEnEvidence(texNombre(heuresDecimales, 1))}$ ${texteEnCouleurEtGras('heure')}.`
            : `$${miseEnEvidence(texNombre(heuresDecimales, 1))}$ heure.`

          // Générer des fausses réponses
          const erreurClassique =
            Math.floor(minutesTotales / 60) + (minutesTotales % 60) / 100 // Ex: 108 min → 1,08h au lieu de 1,8h
          const fausses = [
            erreurClassique, // Erreur classique : mettre les minutes en centièmes
            heuresDecimales + 0.1,
            minutesTotales / 100, // Erreur classique : mettre les minutes en centièmes,
          ].filter((x) => x > 0 && x !== heuresDecimales)

          this.reponse = this.versionQcm
            ? `$${texNombre(heuresDecimales, 1)}$ heure`
            : `${texNombre(heuresDecimales, 1)}`

          this.distracteurs = [
            `$${texNombre(fausses[0], 2)}$ ${fausses[0] === 2 ? 'heures' : 'heure'}`,
            `$${texNombre(fausses[1], 1)}$ ${fausses[1] === 2 ? 'heures' : 'heure'}`,
            `$${texNombre(fausses[2], 2)}$ ${fausses[2] === 2 ? 'heures' : 'heure'}`,
          ]
        }
        break
    }
    this.canReponseACompleter = this.question + '$\\ldots$ ' + 'heure(s)'
    if (!this.interactif && !this.versionQcm) {
      this.question = this.canReponseACompleter + '.'
    }

    this.canEnonce = 'Compléter.'
    this.optionsChampTexte = { texteApres: 'heure(s).' }
  }
}
