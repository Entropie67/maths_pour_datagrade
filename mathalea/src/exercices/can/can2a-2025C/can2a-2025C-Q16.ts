import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un angle dans un triangle rectangle'
export const interactifReady = true

export const uuid = 's64w8'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ16 extends ExerciceCan {
  enonce(
    lettres?: [string, string, string],
    angleDroit?: number,
    angleConnu?: number,
  ): void {
    if (lettres == null || angleDroit == null || angleConnu == null) {
      const triplettes: [string, string, string][] = [
        ['I', 'J', 'K'],
        ['A', 'B', 'C'],
        ['D', 'E', 'F'],
        ['P', 'Q', 'R'],
      ]
      lettres = choice(triplettes)
      angleDroit = choice([0, 1, 2]) // indice du sommet de l'angle droit
      angleConnu = randint(1, 6) * 10 + 5
    }

    const [l0, l1, l2] = lettres
    const sommets = [l0, l1, l2]
    const sommetDroit = sommets[angleDroit]

    // L'angle connu est l'un des deux autres sommets
    const autresSommets = [0, 1, 2].filter((i) => i !== angleDroit)
    const indiceConnu = autresSommets[0]
    const indiceInconnu = autresSommets[1]

    const angleInconnu = 90 - angleConnu

    // Notation de l'angle : les trois sommets avec le sommet de l'angle au milieu
    const nomAngleConnu = `\\widehat{${sommets[(indiceConnu + 2) % 3]}${sommets[indiceConnu]}${sommets[(indiceConnu + 1) % 3]}}`
    const nomAngleInconnu = `\\widehat{${sommets[(indiceInconnu + 2) % 3]}${sommets[indiceInconnu]}${sommets[(indiceInconnu + 1) % 3]}}`

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(angleInconnu)

    this.question = `$${l0}${l1}${l2}$ est un triangle rectangle en $${sommetDroit}$ et $${nomAngleConnu}=${angleConnu}^\\circ$.<br>`
    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: `<br>$${nomAngleInconnu}=$`,
        texteApres: '$^\\circ$',
      }
    } else {
      this.question += `$${nomAngleInconnu}=\\ldots^\\circ$`
    }

    this.correction = `Dans un triangle rectangle, les deux angles aigus sont complémentaires (leur somme vaut $90^\\circ$).<br>
    $${nomAngleInconnu}=90^\\circ-${angleConnu}^\\circ=${miseEnEvidence(angleInconnu)}^\\circ$.`

    this.canEnonce = `$${l0}${l1}${l2}$ est un triangle rectangle en $${sommetDroit}$ et $${nomAngleConnu}=${angleConnu}^\\circ$.`
    this.canReponseACompleter = `$${nomAngleInconnu}=\\ldots^\\circ$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(['I', 'J', 'K'], 1, 30)
    else this.enonce()
  }
}
