import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un coefficient multiplicateur'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '15/07/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'e4a1f'

export const refs = {
  'fr-fr': ['can2I2-03', '2I20-flash3'],
  'fr-ch': [],
}
export default class CoeffMul extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteApres: '.' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    let prix1, prix2, CM, choix

    switch (
      this.quotaChoice('cas', [1, 2]) //
    ) {
      case 1:
        choix = choice([true, true, true, false])
        prix1 = choix ? randint(3, 20) * 10 : randint(3, 20) * 4

        CM = choix
          ? new Decimal(choice([0.95, 0.8, 0.9, 0.7, 0.6]))
          : new Decimal(choice([0.75]))
        prix2 = CM.mul(prix1)
        this.question = `Le prix d’un article a baissé : il est passé ${context.isDiaporama ? '<br>' : ''} de $${texPrix(prix1)}$ euros à $${texPrix(prix2)}$ euros.<br>
          Cela signifie que ce prix a été multiplié par : `
        this.correction = `${texteGras('Correction $1$ :')}<br>
On cherche le nombre $k$ tel que $ k \\times ${texPrix(prix1)}=${texPrix(prix2)} $.<br>
On obtient $k=\\dfrac{${texPrix(prix2)}}{${texPrix(prix1)}} = ${new FractionEtendue(prix2.toNumber(), prix1).texFractionSimplifiee}=${miseEnEvidence(texNombre(CM, 2))}$.<br><br>
        ${texteGras('Correction $2$ :')}<br>
        Le prix a diminué de $${texNombre(prix2.sub(prix1).mul(-1), 2)}$ euros, ce qui représente $${texNombre(CM.sub(1).mul(-1).mul(100), 2)}\\,\\%$ de $${texPrix(prix1)}$ euros.<br>
        Le coefficient multiplicateur associé à cette baisse est $${texNombre(CM, 2)}$.<br>
        On peut dire que le prix a été multiplié par $${miseEnEvidence(texNombre(CM, 2))}$.`

        this.reponse = this.versionQcm
          ? `$${texNombre(CM, 2)}$`
          : `${texNombre(CM, 2)}`

        this.distracteurs = [
          `$${texNombre(CM.sub(1).mul(-1), 2)}$`,
          `$${texNombre(CM.sub(1).mul(-1).add(1), 2)}$`,
          `$${texNombre(CM.add(1), 2)}$`,
        ]
        this.canEnonce = `Le prix d’un article a baissé : il est passé de $${texPrix(prix1)}$ euros à $${texPrix(prix2)}$ euros.`
        this.canReponseACompleter = 'Ce prix a été multiplié par : $\\ldots$'
        break
      case 2:
      default:
        choix = choice([true, true, true, false])
        prix1 = choix ? randint(3, 20) * 10 : randint(3, 20) * 4
        CM = choix
          ? new Decimal(choice([1.05, 1.2, 1.1, 1.3, 1.4]))
          : new Decimal(choice([1.25]))

        prix2 = CM.mul(prix1)
        this.question = `Le prix d’un article a augmenté : il est passé ${context.isDiaporama ? '<br>' : ''} de $${texPrix(prix1)}$ euros à $${texPrix(prix2)}$ euros.<br>
          Cela signifie que ce prix a été multiplié par : `
        this.correction = `${texteGras('Correction $1$ :')}<br>
On cherche le nombre $k$ tel que $ k \\times ${texPrix(prix1)}=${texPrix(prix2)} $.<br>
On obtient $k=\\dfrac{${texPrix(prix2)}}{${texPrix(prix1)}} = ${new FractionEtendue(prix2.toNumber(), prix1).texFractionSimplifiee}=${miseEnEvidence(texNombre(CM, 2))}$.<br><br>
        ${texteGras('Correction $2$ :')}<br>Le prix a augmenté de $${texNombre(prix2.sub(prix1), 2)}$ euros, ce qui représente $${texNombre(CM.sub(1).mul(100), 2)}\\,\\%$ de $${texPrix(prix1)}$ euros.<br>
        Le coefficient multiplicateur associé à cette hausse est $${texNombre(CM, 2)}$.<br>
        On peut dire que le prix a été multiplié par $${miseEnEvidence(texNombre(CM, 2))}$.`

        this.reponse = this.versionQcm
          ? `$${texNombre(CM, 2)}$`
          : `${texNombre(CM, 2)}`

        this.distracteurs = [
          `$${texNombre(CM.sub(2).mul(-1), 2)}$`,
          `$${texNombre(CM.add(0.1), 2)}$`,
          `$${texNombre(CM.sub(1), 2)}$`,
        ]
        this.canEnonce = `Le prix d’un article a augmenté : il est passé de $${texPrix(prix1)}$ euros à $${texPrix(prix2)}$ euros.`
        this.canReponseACompleter = 'Ce prix a été multiplié par : $\\ldots$'
        break
    }
    if (!this.interactif && !this.versionQcm) {
      // La consigne se place entre la situation et la phrase à compléter (pas de consigne en diaporama)
      this.question = context.isDiaporama
        ? `${this.question} $\\ldots$ `
        : `${this.question.replace('.<br>', '.<br>Compléter :<br>')} $\\ldots$ `
    }
  }
}
