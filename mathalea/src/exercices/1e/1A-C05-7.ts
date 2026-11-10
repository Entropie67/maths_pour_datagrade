import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  correctionPuissanceLaPlusProche,
  puissanceDeDix,
  tireNombreOdg,
  type NombreOdg,
  touchesPuissanceDeDix,
} from '../../lib/outils/ordreDeGrandeur'
import { texNombre } from '../../lib/outils/texNombre'
import { choice } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = '75f03'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C05-7', '2A-N5-7'],
  'fr-ch': ['10LCNO4C-9', '10LSNO4C-9'],
}
export const interactifReady = true
export const titre =
  'Déterminer la puissance de $10$ la plus proche d’un nombre'

/**
 * Ordre de grandeur d'un nombre seul, sous la forme d'une puissance de 10.
 * Le premier chiffre significatif est 1, 2, 8 ou 9 : l’arrondi n’est jamais discutable.
 */
export default class PuissanceDeDixLaPlusProche extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { puissance: true }
  }

  nouvelleVersion() {
    const cas = this.quotaChoice('cas', [1, 2, 3, 4])
    let nb: NombreOdg
    let ecriture: string
    // 10^0 et 10^1 sont écartés : leur écriture prête à confusion avec 1 et 10
    do {
      switch (cas) {
        case 1: {
          // entier
          const exposant = randint(4, 9)
          nb = tireNombreOdg(exposant, randint(1, exposant - 1))
          ecriture = texNombre(nb.valeur)
          break
        }
        case 2: {
          // décimal supérieur à 1
          nb = tireNombreOdg(randint(1, 3), randint(2, 4))
          ecriture = texNombre(nb.valeur)
          break
        }
        case 3: {
          // décimal inférieur à 1
          nb = tireNombreOdg(randint(-5, -1), randint(0, 3))
          ecriture = texNombre(nb.valeur)
          break
        }
        default: {
          // k × 10^p, avec k qui n'est pas entre 1 et 10
          nb = tireNombreOdg(0, 1)
          const puissance = choice([randint(2, 7), randint(-7, -2)])
          const decimal = choice([false, true])
          nb.exposant = decimal ? puissance - 1 : puissance + 2
          nb.exposantOdg = nb.mantisse.gte(5) ? nb.exposant + 1 : nb.exposant
          ecriture = `${decimal ? `0,${nb.chiffres}` : nb.chiffres}\\times10^{${puissance}}`
          break
        }
      }
    } while (nb.exposantOdg === 0 || nb.exposantOdg === 1)
    const attendu = puissanceDeDix(nb.exposantOdg)
    this.question = `Donner un ordre de grandeur de $${ecriture}$ sous la forme d'une puissance de $10$.`
    this.optionsChampTexte = {
      dataKeys: touchesPuissanceDeDix,
      texteAvant: `<br>Un ordre de grandeur de $${ecriture}$ est `,
      texteApres: '.',
    }
    this.reponse = attendu
    this.correction =
      cas === 4
        ? this.correctionEcritureNonScientifique(nb, ecriture, attendu)
        : `${correctionPuissanceLaPlusProche(nb, ecriture)}<br>
  Un ordre de grandeur est donc $${miseEnEvidence(attendu)}$.`
  }

  /** Correction quand le nombre est de la forme k × 10^p avec k hors de [1 ; 10[ */
  private correctionEcritureNonScientifique(
    nb: NombreOdg,
    ecriture: string,
    attendu: string,
  ): string {
    const mantisse = texNombre(nb.mantisse)
    const vers10 = nb.exposantOdg > nb.exposant
    return `On écrit d'abord le nombre en notation scientifique : $${ecriture}=${mantisse}\\times10^{${nb.exposant}}$.<br>
  Comme $${mantisse}$ est plus proche de $${vers10 ? 10 : 1}$ que de $${vers10 ? 1 : 10}$, on a $${ecriture}\\approx${vers10 ? `10\\times10^{${nb.exposant}}` : `1\\times10^{${nb.exposant}}`}=${miseEnEvidence(attendu)}$.`
  }
}
