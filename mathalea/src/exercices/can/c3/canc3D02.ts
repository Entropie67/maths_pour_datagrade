import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import Horloge from '../../../lib/2d/horloge'
import { texteParPosition } from '../../../lib/2d/textes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { personne } from '../../../lib/outils/Personne'
import { formatMinute } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import Hms from '../../../modules/Hms'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Lire une durée'
export const dateDePublication = '4/11/2021'
export const interactifReady = true

/**
 * @author Jean-claude Lhote
 */
export const uuid = '0861b'

export const refs = {
  'fr-fr': ['canc3D02', '6M4B-flash1', '6AutoT1-1', 'CM1M6C', 'CM2M3C'],
  'fr-ch': ['PR-13'],
}
export default class LireUneDuree extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierHms
  }

  nouvelleVersion() {
    let h1, m1, h2, m2, enonce
    const matinOuSoir = this.quotaChoice('matinOuSoir', ['matin', 'soir'])
    const quidam = personne()
    const OccupationsMatinales = [
      'a lu un livre',
      'a fait un jogging',
      'a préparé le repas',
      'a fait ses devoirs',
    ]
    const occupationsNocturnes = [
      'a regardé une émission',
      'a écouté de la musique',
      'a joué aux cartes',
    ]
    switch (matinOuSoir) {
      case 'matin':
        h1 = randint(8, 10)
        m1 = randint(1, 5) * 5
        h2 = h1 + randint(0, 1)
        m2 = m1 + randint(2 - h2 + h1, 6) * 5
        enonce = `${quidam.prenom} ${choice(OccupationsMatinales)} ce matin. ${quidam.Pronom} a noté l'heure de début et l'heure de fin.<br>`
        break
      case 'soir':
      default:
        h1 = randint(20, 22)
        m1 = randint(1, 5) * 5
        h2 = h1 + randint(0, 1)
        m2 = m1 + randint(2 - h2 + h1, 6) * 5
        enonce = `${quidam.prenom} ${choice(occupationsNocturnes)} ce soir. ${quidam.Pronom} a noté l'heure de début et l'heure de fin.<br>`
        break
    }

    const horloge1 = new Horloge(0, 0, 2, new Hms({ hour: h1, minute: m1 }))
    const horloge2 = new Horloge(0, 0, 2, new Hms({ hour: h2, minute: m2 }))
    this.question =
      enonce +
      (context.isHtml ? '<table><tr><td>' : '\\begin{multicols}{2}\n') +
      mathalea2d(
        {
          xmin: -3,
          ymin: -3,
          xmax: 3,
          ymax: 3,
          scale: 0.6,
          center: !context.isHtml,
        },
        horloge1,
        texteParPosition('Heure de début', 0, -2.5),
      ) +
      (context.isHtml ? '</td><td>' : '') +
      mathalea2d(
        {
          xmin: -3,
          ymin: -3,
          xmax: 3,
          ymax: 3,
          scale: 0.6,
          center: !context.isHtml,
        },
        horloge2,
        texteParPosition('Heure de fin', 0, -2.5),
      ) +
      (context.isHtml ? '</td></tr></table>' : '\\end{multicols}\n') +
      'Combien de temps cela a-t-il duré ?'
    this.reponse = {
      reponse: { value: `${h2 - h1}h ${m2 - m1}`, options: { HMS: true } },
    }
    this.correction = `On regarde de combien de graduations la grande aiguille a avancé : elle a avancé de $${Math.round((m2 - m1) / 5)}$ graduations soit $${m2 - m1}$ minutes.<br>`
    this.correction +=
      "Ensuite on regarde si la petite aiguille a avancé d'au moins une graduation.<br>"
    if (h2 === h1) {
      this.correction += `Ce n'est pas le cas, donc il s'est écoulé seulement $${miseEnEvidence(`${formatMinute(m2 - m1)}\\text{ min }`)}$.`
    } else {
      this.correction += `La petite aiguille a avancé d'une heure, donc il s'est écoulé $${miseEnEvidence(`1\\text{ h }${formatMinute(m2 - m1)}\\text{ min }`)}$.`
    }

    this.canReponseACompleter = '$\\ldots$ h $\\ldots$ min'
  }
}
