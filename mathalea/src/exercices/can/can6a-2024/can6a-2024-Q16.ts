import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec un pourcentage'
export const interactifReady = true

export const uuid = '67c9a'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/
export default class PourcentageFacile extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let p: number
    let distance: number
    let unite: string
    const ratios: Record<number, [number, number]> = {
      25: [1, 4],
      50: [1, 2],
      75: [3, 4],
    }
    if (this.canOfficielle) {
      p = 25
      distance = 240
      unite = 'km'
    } else {
      p = choice([25, 50, 75])
      distance = randint(11, 18) * 20
      unite = choice(['km', 'm', 'kg', 'g'])
    }
    this.optionsChampTexte = { texteApres: unite, texteAvant: ' $=$' }
    const num = ratios[p][0]
    const den = ratios[p][1]
    this.reponse = ((p * distance) / 100).toFixed(0)
    this.question = `$${texNombre(p, 0)}\\,\\%$ de $${texNombre(distance, 0)}\\text{ ${unite}}$`

    this.canReponseACompleter = `$\\ldots\\text{ ${unite}}$`
    this.correction = `On a $\\dfrac{${num}}{${den}}=${String(p)}\\,\\%$.<br>
   
  `
    if (p === 25 || p === 50) {
      this.correction += ` Ainsi, prendre $${String(p)}\\,\\%$ d'une quantité revient à la diviser par $${ratios[p][1]}$. <br>
      Donc, on divise $${texNombre(distance, 0)}$ par $${den}$, soit  $${texNombre(distance, 0)}\\text{ ${unite}}\\div ${den}=${miseEnEvidence(this.reponse)}\\text{ ${unite}}$.`
    } else {
      this.correction += `
      Ainsi, prendre $${String(p)}\\,\\%$ d'une quantité revient à diviser par $${ratios[p][1]}$ puis multiplier par $${num}$. <br>
      Donc, on divise $${texNombre(distance, 0)}$ par $${den}$ et on multiplie par $${num}$, soit $${texNombre(distance, 0)}\\text{ ${unite}}\\div ${den} \\times ${num}=${texNombre(distance / den, 0)}\\text{ ${unite}}\\times ${num}=${miseEnEvidence(this.reponse)}\\text{ ${unite}}$.`
    }
  }
}
