import { texPrix } from '../../lib/format/style'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cf889'
export const refs = {
  'fr-fr': ['3AutoP03-1'],
  'fr-ch': ['10CTFA1E-13', '10LCFA1E-13', '10LSFA1E-13', 'PRQPF05B-10'],
}
export const interactifReady = true
export const titre =
  'Calculer un nouveau prix (pourcentage de baisse ou de hausse)'
export const dateDePublication = '10/08/2026'

/**
 * DNB Asie juin 2026 - Question 7
 * @author Jean-Claude Lhote
 */
export default class AutoQ7Asiebrevet2026 extends ExerciceCan {
  constructor() {
    super()
  }

  enonce(
    prixInitial?: number,
    remiseEnPourcentage?: number,
    baisseOuHausse = 'baisse',
  ) {
    if (prixInitial == null || remiseEnPourcentage == null) {
      prixInitial = randint(5, 9) * 10
      remiseEnPourcentage = randint(1, 3) * 10
      baisseOuHausse = randint(0, 1) === 0 ? 'baisse' : 'hausse'
    }

    this.question = `Un article coûte $${texPrix(prixInitial)}$ €. Calculer son nouveau prix après une ${baisseOuHausse} de $${remiseEnPourcentage}\\,\\%$.`
    this.optionsChampTexte = { texteApres: '€', texteAvant: ' ' }
    this.reponse =
      baisseOuHausse === 'baisse'
        ? texPrix(prixInitial * (1 - remiseEnPourcentage / 100))
        : texPrix(prixInitial * (1 + remiseEnPourcentage / 100))

    this.correction = `Le nouveau prix est calculé en appliquant la ${baisseOuHausse} de $${remiseEnPourcentage}\\,\\%$ au prix initial de $${texPrix(prixInitial)}$ €.<br>
Le calcul est le suivant :<br> 
$\\text{Nouveau prix} = ${prixInitial} ${baisseOuHausse === 'baisse' ? '-' : '+'} \\dfrac{${remiseEnPourcentage}\\times ${prixInitial}}{100} = ${prixInitial} ${baisseOuHausse === 'baisse' ? '-' : '+'} ${texPrix((prixInitial * remiseEnPourcentage) / 100)} =${miseEnEvidence(this.reponse)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(60, 10, 'baisse')
    } else {
      this.enonce()
    }
  }
}
