import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Effectuer une somme de combinaisons.'
export const interactifReady = true

export const dateDePublication = '20/4/2025'

export const uuid = '3634f'
export const refs = {
  'fr-fr': ['TSG1-06'],
  'fr-ch': [],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const n = randint(4, 20)
    this.question = `Calculer $\\displaystyle\\sum_{k=0}^{k=${n}} \\dbinom{${n}}{k}=$`
    this.correction =
      "C'est un résultat de cours : $\\displaystyle\\sum_{k=0}^{k=n} \\dbinom{n}{k}=2^n$<br>"
    this.correction += `En application dans la situation de l'exercice :<br>$\\begin{aligned}\\displaystyle\\sum_{k=0}^{k=${n}} \\dbinom{${n}}{k}&=2^{${n}}\\\\&=${miseEnEvidence(texNombre(2 ** n))}.\\end{aligned}$`
    if (context.isHtml) {
      this.correction +=
        '<div class="text-coopmaths-struct font-bold my-4">Démonstration de cours en vidéo</div>'
      this.correction +=
        '<iframe src="https://podeduc.apps.education.fr/video/89920-demontrer-que-le-nombre-total-de-parties-dun-ensemble-a-n-elements-est-egal-a-2-puissance-n/?is_iframe=true" width="640" height="360" style="padding: 0; margin: 0; border:0" allowfullscreen title="Démontrer que le nombre total de parties d\'un ensemble à n éléments est égal à 2 puissance n" ></iframe>'
    }
    this.reponse = 2 ** n
  }
}
