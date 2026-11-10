import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Compléter une relation de Chasles'
export const interactifReady = true

export const uuid = '3195d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q29 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierMajuscules
    this.formatInteractif = 'fillInTheBlank'
  }

  enonce(lettre1?: string, lettre2?: string, lettre3?: string): void {
    if (lettre1 == null || lettre2 == null || lettre3 == null) {
      const lettres = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'H',
        'I',
        'J',
        'L',
        'M',
        'N',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
      ]
      const lettresChoisies = shuffle(lettres).slice(0, 3)
      lettre1 = lettresChoisies[0]
      lettre2 = lettresChoisies[1]
      lettre3 = lettresChoisies[2]
    }

    this.reponse = {
      champ1: {
        value: `${lettre2}${lettre3}`,
        compare: seq([fromOptions({ texteSansCasse: true })]),
      },
    }

    this.consigne = `Compléter à l'aide de la relation de Chasles : `

    if (this.interactif) {
      this.question = `\\overrightarrow{${lettre1}${lettre3}}=\\overrightarrow{${lettre1}${lettre2}}+ \\overrightarrow{%{champ1}}`
    } else {
      this.question = `\\overrightarrow{${lettre1}${lettre3}}=\\overrightarrow{${lettre1}${lettre2}}+ \\ldots`
    }
    this.correction = `D'après la relation de Chasles :<br>
    $\\overrightarrow{${lettre1}${lettre3}}=\\overrightarrow{${lettre1}${lettre2}}+${miseEnEvidence(`\\overrightarrow{${lettre2}${lettre3}}`)}$`

    this.canEnonce = `Compléter à l'aide de la relation de Chasles.
    `
    this.canReponseACompleter = `$\\overrightarrow{${lettre1}${lettre3}}=\\overrightarrow{${lettre1}${lettre2}}+\\ldots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce('F', 'K', 'G')
    else this.enonce()
  }
}
