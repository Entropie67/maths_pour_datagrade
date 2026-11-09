import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texPrix } from '../../../lib/format/style'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un prix avec une proportionnalité'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'js5gt'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ22 extends ExerciceCan {
  enonce(
    nbTotal?: number,
    prixTotal?: Decimal,
    nbDemande?: number,
    objet?: string,
  ): void {
    if (
      nbTotal == null ||
      prixTotal == null ||
      nbDemande == null ||
      objet == null
    ) {
      const objets = ['bonbons', 'stylos', 'cahiers', 'croissants', 'gâteaux']
      objet = choice(objets)
      // Couples (nbTotal, nbDemande) : on passe par l'unité
      const couples: [number, number][] = [
        [5, 3],
        [6, 4],
        [4, 3],
      ]
      const couple = choice(couples)
      nbTotal = couple[0]
      nbDemande = couple[1]
      // Prix unitaire décimal : x,25 ou x,50 ou x,75
      const partieEntiere = randint(1, 3)
      const partieDecimale = choice([25, 50, 75])
      prixTotal = new Decimal(partieEntiere)
        .add(new Decimal(partieDecimale).div(100))
        .mul(nbTotal)
    }

    const prixUnitaire = prixTotal.div(nbTotal)
    const resultat = prixUnitaire.mul(nbDemande)
    const nbTotalLettre: Record<number, string> = {
      4: 'Quatre',
      5: 'Cinq',
      6: 'Six',
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texPrix(resultat)
    this.question = `${nbTotalLettre[nbTotal] || nbTotal} ${objet} coûtent $${texPrix(prixTotal)}$ €.<br>
    Quel est le prix de $${nbDemande}$ ${objet} ?<br>`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: ' €' }
    } else {
      this.question += '$\\ldots$ €'
    }
    this.correction = `Le prix d'un ${objet.replace(/s$/, '')} est $${texPrix(prixTotal)}\\div ${nbTotal}=${texPrix(prixUnitaire)}$ €.<br>
    Le prix de $${nbDemande}$ ${objet} est $${nbDemande}\\times ${texPrix(prixUnitaire)}=${miseEnEvidence(texPrix(resultat))}$ €.`
    this.canEnonce = `${nbTotalLettre[nbTotal] || nbTotal} ${objet} coûtent $${texPrix(prixTotal)}$ €. Quel est le prix de $${nbDemande}$ ${objet} ?`
    this.canReponseACompleter = '$\\ldots$ €'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, new Decimal(6.25), 3, 'bonbons')
    else this.enonce()
  }
}
