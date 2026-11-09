import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Transformer des heures décimales en minutes'
export const dateDePublication = '06/09/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora

 */
export const uuid = '20cf0'

export const refs = {
  'fr-fr': ['can6D3-03', '6M4C-flash5'],
  'fr-ch': ['NR'],
}
export default class HeureDecimalesMinutes extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const choixType = this.quotaChoice('choixType', [1, 2, 2])
    let totalMinutes = 0
    switch (choixType) {
      case 1:
        {
          // Cas avec des quarts d'heure (0,25, 0,75, 1,25, 1,75)
          const heures = randint(0, 1) // 0 ou 1 heure
          const fractionsQuart = [0.25, 0.75] // 1/4 ou 3/4 d'heure
          const fractionDecimale = fractionsQuart[randint(0, 1)]
          const heuresDecimales = heures + fractionDecimale
          totalMinutes = heuresDecimales * 60

          this.question = `Une durée de $${texNombre(heuresDecimales, 2)}$ ${heuresDecimales >= 2 ? 'heures' : 'heure'} correspond à : `

          const fractionText =
            fractionDecimale === 0.25 ? '\\dfrac{1}{4}' : '\\dfrac{3}{4}'
          const minutesFraction = fractionDecimale === 0.25 ? 15 : 45

          if (heures > 0) {
            // Cas avec heures entières + fraction
            this.correction = `$${texNombre(heuresDecimales, 2)}\\text{ h} =${heures} \\text{ h} + ${texNombre(fractionDecimale, 2)} \\text{ h}$, soit $${heures}\\text{ h} + ${fractionText} \\text{ h} = ${heures * 60} \\text{ min} + ${minutesFraction}\\text{ min} = ${totalMinutes} \\text{ min}$.<br>
            Ainsi, $${texNombre(heuresDecimales, 2)}$ ${heuresDecimales >= 2 ? 'heures' : 'heure'} correspond à`
          } else {
            // Cas avec seulement une fraction d'heure
            this.correction = `$${texNombre(heuresDecimales, 2)}\\text{ h} = ${fractionText} \\text{ h} = ${minutesFraction} \\text{ min}$.<br>
            Ainsi, $${texNombre(heuresDecimales, 2)}$ heure correspond à`
          }

          // Générer des fausses réponses
          const fausses = [
            heuresDecimales * 100, // Erreur classique : confondre décimales et minutes
            totalMinutes + (heures > 0 ? 30 : 15), // Ajouter 30 ou 15 minutes
            totalMinutes - (fractionDecimale === 0.25 ? 10 : 20), // Retirer un peu
          ].filter((x) => x > 0 && x !== totalMinutes)

          this.reponse = this.versionQcm
            ? `$${texNombre(totalMinutes, 0)}$ minutes`
            : `${texNombre(totalMinutes, 0)}`

          this.distracteurs = [
            `$${texNombre(fausses[0], 0)}$ minutes`,
            `$${texNombre(fausses[1], 0)}$ minutes`,
            `$${texNombre(fausses[2], 0)}$ minutes`,
          ]
        }
        break

      case 2:
      default:
        {
          // Cas avec des décimales simples (multiples de 0,1)
          const heuresEntieres = randint(1, 2) // 1 ou 2 heures
          const dixiemes = [1, 2, 3, 4, 6, 7, 8, 9][randint(0, 7)] // Éviter 0 et 5 pour plus de variété
          const heuresDecimales = heuresEntieres + dixiemes / 10
          totalMinutes = heuresDecimales * 60

          this.question = `Une durée de $${texNombre(heuresDecimales, 1)}$ ${heuresDecimales >= 2 ? 'heures' : 'heure'} correspond à : `

          const minutesFraction = dixiemes * 6 // 0,1h = 6min

          // Construire la fraction si elle se simplifie bien
          let fractionText = `\\dfrac{${dixiemes}}{10}`
          if (dixiemes === 2) fractionText = '\\dfrac{1}{5}'
          else if (dixiemes === 4) fractionText = '\\dfrac{2}{5}'
          else if (dixiemes === 6) fractionText = '\\dfrac{3}{5}'
          else if (dixiemes === 8) fractionText = '\\dfrac{4}{5}'

          this.correction = `$${texNombre(heuresDecimales, 1)}\\text{ h} =${heuresEntieres} \\text{ h} + ${texNombre(dixiemes / 10, 1)} \\text{ h}$, soit $${heuresEntieres}\\text{ h} + ${fractionText} \\text{ h} = ${heuresEntieres * 60} \\text{ min} + ${minutesFraction}\\text{ min} = ${totalMinutes} \\text{ min}$.<br>
          Ainsi, $${texNombre(heuresDecimales, 1)}$ heures correspond à`

          // Générer des fausses réponses
          const erreurClassique = heuresEntieres * 60 + dixiemes // Ex: 1,3h → 61 min au lieu de 78 min
          const fausses = [
            erreurClassique,
            heuresDecimales * 100, // Erreur : confondre avec des centièmes
            totalMinutes + 10, // Ajouter 10 minutes
          ].filter((x) => x > 0 && x !== totalMinutes)

          this.reponse = this.versionQcm
            ? `$${texNombre(totalMinutes, 0)}$ minutes`
            : `${texNombre(totalMinutes, 0)}`

          this.distracteurs = [
            `$${texNombre(fausses[0], 0)}$ minutes`,
            `$${texNombre(fausses[1], 0)}$ minutes`,
            `$${texNombre(fausses[2], 0)}$ minutes`,
          ]
        }
        break
    }
    this.correction += this.versionQcm
      ? ` $${miseEnEvidence(texNombre(totalMinutes, 1))}$ ${texteEnCouleurEtGras('minutes')}.`
      : ` $${miseEnEvidence(texNombre(totalMinutes, 1))}$ minutes.`

    this.canReponseACompleter = this.question + '$\\ldots$ ' + 'minutes'
    if (!this.interactif && !this.versionQcm)
      this.question = this.canReponseACompleter + '.'
    this.canEnonce = 'Compléter.'
    this.optionsChampTexte = { texteApres: 'minutes.' }
  }
}
