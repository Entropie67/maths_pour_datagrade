import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une évolution en pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '15/07/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '66b7e'

export const refs = {
  'fr-fr': ['can4P2-05'],
  'fr-ch': ['NR'],
}
export default class PoucentageE2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.spacing = 1.5
    this.optionsChampTexte = { texteApres: ' $\\,\\%$' }
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [true, false])
    const a = this.versionQcm
      ? this.quotaRandint('a', 4, 13) * 5
      : this.quotaRandint('a', 2, 6) * 10
    const n = choice(['pull', 'pantalon', 'vêtement', 'blouson', 'sweat'])
    const b = this.versionQcm
      ? choice([5, 10, 15, 20, 25, 30, 40, 50])
      : a === 20 || a === 40 || a === 60
        ? choice([5, 10, 20, 25, 30, 40, 50])
        : choice([5, 10, 20, 30, 40, 50])
    this.question = `Le prix d'un ${n} est passé de $${a}$ € à ${choix ? `$${texNombre(a * (1 + b / 100), 2)}$` : `$${texNombre(a * (1 - b / 100), 2)}$`} €.<br>`
    if (this.versionQcm || this.interactif) {
      this.question += choix ? 'Il a augmenté de  : ' : 'Il a baissé de  : '
    } else {
      this.question += choix
        ? 'Il a augmenté de  : $\\ldots\\, \\%$'
        : 'Il a baissé de  : $\\ldots\\, \\%$'
    }
    // Deux propositions peuvent s'écrire pareil (« 2 \\,\\% » et « 2\\,\\% ») : le doublon est retiré
    // et remplacé si besoin, sans tirage aléatoire supplémentaire.
    this.distracteurs = distracteursDistincts(
      `$${b}\\,\\%$`,
      choix
        ? [
            `$${texNombre(a * (1 + b / 100) - a, 2)} \\,\\%$`,
            `$${texNombre(b / 10, 2)}\\,\\%$`,
            `$${texNombre(a / 10, 2)} \\,\\%$`,
            `$${texNombre(1 + b / 100, 2)} \\,\\%$`,
          ]
        : [
            `$${texNombre(abs(a * (1 - b / 100) - a), 2)} \\,\\%$`,
            `$${texNombre(b / 10, 2)}\\,\\%$`,
            `$${texNombre(a / 10, 2)} \\,\\%$`,
            `$${texNombre(1 + b / 100, 2)} \\,\\%$`,
          ],
      [`$${texNombre(b + 5, 2)}\\,\\%$`, `$${texNombre(b * 2, 2)}\\,\\%$`],
      4,
    )

    const montant = choix ? a * (1 + b / 100) - a : abs(a * (1 - b / 100) - a)
    const explicationCalcul =
      b === 50
        ? `de $${a}$, c'est la moitié de $${a}$, soit $${texNombre(montant, 2)}$`
        : `de $${a} = ${texNombre(b / 100, 2)} \\times ${a} = ${texNombre(montant, 2)}$`
    this.correction = `Le prix initial de $${a}$ € a ${choix ? 'augmenté' : 'baissé'} de  $${texNombre(montant, 2)}$ €.<br>
    Or $${texNombre(montant, 2)}\\div${a}=${texNombre(b / 100, 2)}=${texNombre(b, 2)}\\, \\%$.<br>
          En effet, $${texNombre(b, 2)}\\,\\%$ ${explicationCalcul}.<br>
          Le prix du ${n} a donc ${choix ? 'augmenté' : 'baissé'} de `
    this.correction += this.versionQcm
      ? `$${miseEnEvidence(texNombre(b, 2) + '\\, \\%')}$.`
      : `$${miseEnEvidence(texNombre(b, 2))}\\, \\%$.`

    this.reponse = this.versionQcm ? `$${b}\\,\\%$` : b

    this.canEnonce = `Le prix d'un ${n} est passé de $${a}$ € à ${choix ? `$${texNombre(a * (1 + b / 100), 2)}$` : `$${texNombre(a * (1 - b / 100), 2)}$`} €.`
    this.canReponseACompleter = ` Le prix du ${n} a  ${choix ? 'augmenté' : 'baissé'} de $\\ldots\\,\\%$`
  }
}
