import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
  Angle,
  angleOppose,
  angleSupplementaire,
} from '../../../lib/mathFonctions/Angle'
import {
  kCosOuKSin,
  parenthesesSiNegatifStrigArray,
} from '../../../lib/mathFonctions/radToDeg'
import { choice } from '../../../lib/outils/arrayOutils'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Donner un complexe à partir de son expression trigonométrique'

export const dateDePublication = '4/5/2024'

export const uuid = '16c5f'
export const refs = {
  'fr-fr': ['canTEC2-05'],
  'fr-ch': ['3mNC-3'],
}

function ajoutePlusSiPasMoins(str: string): string {
  if (str[0] === '-') return str
  return `+${str}`
}

/**
 * @author Jean-claude Lhote
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const k = randint(2, 5)
    const choix = choice(['30', '45', '60'])
    const teta2 = new Angle({ degres: choix })
    let teta: Angle
    if (choice([true, false])) {
      teta = angleSupplementaire(teta2)
    } else teta = teta2
    if (choice([true, false])) {
      teta = angleOppose(teta)
    }
    const cos = Array.isArray(teta.cos) ? teta.cos[0] : teta.cos
    const sin = Array.isArray(teta.sin) ? teta.sin[0] : teta.sin
    const parsedReel = kCosOuKSin(k, cos)
    const parsedImaginaire = kCosOuKSin(k, sin)
    this.question = `Soit le nombre complexe $z=${k}\\left(\\cos\\left(${teta.radians}\\right) + \\mathrm{i}\\sin\\left(${teta.radians}\\right)\\right)$.<br> Écrire $z$ sous forme algébrique. `
    this.correction = `On a :<br>$\\begin{aligned}z&=${k}\\left( ${cos}+\\mathrm{i}${parenthesesSiNegatifStrigArray(sin)}\\right)\\\\
    &= ${k}\\times ${parenthesesSiNegatifStrigArray(cos)} + ${k}\\times${parenthesesSiNegatifStrigArray(sin)}\\mathrm{i}\\\\
    &=${miseEnEvidence(`${parsedReel}${ajoutePlusSiPasMoins(`${parsedImaginaire !== '1' ? parsedImaginaire : ''}\\mathrm{i}`)}`)}\\end{aligned}$`
    this.reponse = ''
  }
}
