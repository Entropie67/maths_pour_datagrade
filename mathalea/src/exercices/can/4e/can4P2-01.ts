import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer une valeur définie avec un pourcentage'
export const interactifReady = true

export const dateDePublication = '15/09/2024'
export const dateDeModifImportante = '30/10/2026'
export const uuid = '0b829'
export const refs = {
  'fr-fr': ['can4P2-01'],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ValeursDefPourcentage extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.versionQcmDisponible = true
    this.versionQcmOptions = { radio: true, compact: true }
  }

  nouvelleVersion() {
    const listeValeurs = [
      [1, randint(1, 100) * 10, 100],
      [5, randint(3, 20) * 10, 20],
      [10, randint(5, 20) * 10, 10],
      [20, randint(1, 9) * 10, 5],
      [50, randint(10, 30), 2],
      [25, randint(1, 10) * 10, 4],
    ] // le pourcentage, N, coeff mul-->100
    const choix = choice(listeValeurs)
    const valeur = new Decimal(choix[0]).mul(choix[1]).div(100)
    this.distracteurs = [
      `$N=${texNombre(valeur.mul(1 - choix[0] / 100), 2)}$`,
      `$N=${texNombre(choix[1] * 10, 0)}$`,
      `$N=${texNombre(choix[1] / 100, 2)}$`,
    ]
    this.reponse = this.versionQcm
      ? `$N=${texNombre(choix[1], 0)}$`
      : texNombre(choix[1], 0)
    this.question = `$${choix[0]}\\,\\%$ de $N$ est égal à $${texNombre(valeur, 2)}$.<br> `
    if (!this.versionQcm) {
      this.question += ' Quelle est la valeur de $N$ ?'
    } else {
      this.question += ' On a :'
    }

    this.canReponseACompleter = '$N=\\ldots$'
    this.correction = `Pour passer de $${choix[0]}\\,\\%$ à $100\\,\\%$, on multiplie par $${choix[2]}$.<br>
        $\\begin{aligned}
        ${choix[0]}\\,\\% \\text{ de } N &=  ${texNombre(valeur, 2)}\\\\
        100\\,\\% \\text{ de } N&=${choix[2]}\\times${texNombre(valeur, 2)}\\\\
        ${choix[0] === 5 && !Number.isInteger((choix[0] * choix[1]) / 100) ? `100\\,\\% \\text{ de } N&=\\underbrace{2\\times 10}_{=20}\\times${texNombre(valeur, 2)}\\\\` : ''}`
    this.correction += this.versionQcm
      ? `${miseEnEvidence('N')}&${miseEnEvidence(`=${texNombre(choix[1], 0)}`)}`
      : `N&=${miseEnEvidence(`${texNombre(choix[1], 0)}`)}`
    this.correction += `\\end{aligned}$<br>`
    if (choix[0] === 5 && !Number.isInteger((choix[0] * choix[1]) / 100)) {
      this.correction += `${texteGras('Remarque : ')} <br>
              Pour multiplier un nombre par $20$, on peut le multiplier par $10$, puis par $2$.`
    }

    if (this.interactif && !this.versionQcm) {
      this.question += '<br> $N=$'
    }
    if (this.versionQcm) {
      // Secours : Confondre partie et tout ou se tromper d’un facteur 10.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          valeur.toNumber(),
          choix[1] / 10,
          choix[1] * 100,
          choix[1] - valeur.toNumber(),
        ].map((n) => `$N=${texNombre(n, 4)}$`),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
