import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Retrouver un pourcentage'
export const interactifReady = true

export const dateDePublication = '14/09/2024'
export const dateDeModifImportante = '30/10/2026'
export const uuid = 'fb552'
export const refs = {
  'fr-fr': ['can4P2-02'],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PourcentageARetrouver extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    const listeValeurs = [
      [5, randint(3, 20) * 10, 2],
      [10, randint(1, 50) * 5, 1],
      [20, randint(1, 15) * 5, 2],
      [30, randint(1, 15) * 5, 3],
      [40, randint(1, 15) * 10, 4],
      [60, randint(1, 10) * 10, 6],
      [70, randint(1, 10) * 10, 7],
      [80, randint(1, 10) * 10, 8],
      [90, randint(1, 10) * 10, 9],
    ] //
    const choix = choice(listeValeurs)
    const valeur = new Decimal(choix[0]).mul(choix[1]).div(100)

    if (context.isAmc) this.versionQcm = false
    this.reponse = this.versionQcm ? `$p=${texNombre(choix[0], 2)}$` : choix[0]
    if (this.versionQcm) {
      this.distracteurs = [
        `$p=${texNombre(choix[0] / 10, 2)}$`,
        `$p=${texNombre(choix[0] * 10, 0)}$`,
        `$p=${texNombre(valeur, 2)}$`,
      ]
    }
    this.question = `$p\\,\\%$ de $${choix[1]}$ est égal à $${texNombre(valeur, 1)}$.<br> `
    if (!this.versionQcm) {
      this.question += ' Quelle est la valeur de $p$ ?'
    } else {
      this.question += ' On a :'
    }

    this.canReponseACompleter = '$p=\\ldots$'
    this.correction =
      "Prendre $10\\,\\%$ d'une quantité revient à la diviser par $10$.<br>"
    this.correction += ` $10\\,\\%$ de $${choix[1]}$ est égal à ${choix[0] === 5 ? `$${texNombre(valeur.mul(choix[2]), 1)}$` : `$${texNombre(valeur.div(choix[2]), 1)}$`}.<br>`
    if (choix[0] === 5 || choix[0] === 10) {
      if (choix[0] === 10) {
        this.correction += ''
      } else {
        this.correction += ` En divisant par $${choix[2]}$, on obtient : <br>`
        this.correction += `$${choix[0]}\\,\\%$  de $${choix[1]}$ est égal à $${texNombre(valeur, 1)}$.<br>`
      }
    } else {
      this.correction += ` En multipliant par $${choix[2]}$, on obtient : <br>`
      this.correction += `$${choix[0]}\\,\\%$  de $${choix[1]}$ est égal à $${texNombre(valeur, 1)}$.<br>`
    }
    this.correction += ` Ainsi, `
    this.correction += this.versionQcm
      ? `$${miseEnEvidence('p = ' + texNombre(choix[0], 2))}$.`
      : `$p=${miseEnEvidence(texNombre(choix[0], 2))}$.`

    if (this.interactif && !this.versionQcm) {
      this.question += '<br> $p=$'
    }
    if (this.versionQcm) {
      // Secours : Prendre le complément à 100 ou oublier le facteur 100.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [100 - choix[0], choix[0] / 100, -choix[0], choix[1]].map(
          (n) => `$p=${texNombre(n, 4)}$`,
        ),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
