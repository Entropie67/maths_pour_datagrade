import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un prix avec une proportionnalité'
export const interactifReady = true

export const uuid = 'ee6lz'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q6 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' €' }
  }

  enonce(nbTotal?: number, prixUnitaire?: number, diviseur?: number) {
    if (nbTotal == null || prixUnitaire == null || diviseur == null) {
      const choix = choice(['a', 'b', 'c'])
      prixUnitaire = randint(7, 15) / 10
      if (choix === 'a') {
        diviseur = 2
        nbTotal = randint(2, 5) * 2
      } else if (choix === 'b') {
        diviseur = 3
        nbTotal = randint(1, 3) * 3
      } else {
        diviseur = 4
        nbTotal = randint(1, 3) * 4
      }
    }

    const prixTotal = prixUnitaire * nbTotal
    const nbDemande = nbTotal / diviseur
    const reponse = new Decimal(prixUnitaire).mul(nbTotal).div(diviseur)

    if (nbDemande === 1) {
      this.question = `$${nbTotal}$ croissants coûtent  $${texPrix(prixTotal)}$ €. <br> Combien coûte $${texNombre(nbDemande, 0)}$ croissant ?`
      this.correction = `$${nbTotal}$ croissants coûtent  $${texPrix(prixTotal)}$ €, donc
$${texNombre(nbDemande, 0)}$ croissant coûte $${diviseur}$ fois moins, soit : <br>
$${texPrix(prixTotal)}\\div ${diviseur}=${miseEnEvidence(texPrix(reponse))}$ €.`
    } else {
      this.question = `$${nbTotal}$ croissants coûtent  $${texPrix(prixTotal)}$ €.  <br>Combien coûtent $${texNombre(nbDemande, 0)}$ croissants ?`
      this.correction = `$${nbTotal}$ croissants coûtent  $${texPrix(prixTotal)}$ €, donc
$${texNombre(nbDemande, 0)}$ croissants coûtent $${diviseur}$ fois moins, soit : <br>
$${texPrix(prixTotal)}\\div ${diviseur}=${miseEnEvidence(texPrix(reponse))}$ €.`
    }

    this.reponse = reponse

    this.canReponseACompleter = `$\\ldots$ € `
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(8, 0.9, 4)
    else this.enonce()
  }
}
