import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Dérivée cosinus et sinus'
export const interactifReady = true

export const dateDePublication = '13/5/2025'

export const uuid = 'f6ac7'
export const refs = {
  'fr-fr': ['canTSpeAN30'],
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
    this.formatChampTexte = KeyboardType.grecTrigo
  }

  nouvelleVersion() {
    const a = randint(-5, 5, 0)
    const b = randint(-5, 5)
    let c = 1
    const fonction = choice(['\\sin', '\\cos'])
    const derivee = fonction === '\\sin' ? '\\cos' : ((c = -1), '\\sin')

    this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${fonction}\\left(${reduireAxPlusB(a, b)}\\right)$. <br> Déterminer l'expression de $f'(x)$.`
    this.correction = `On sait que $\\left(${fonction}(u)\\right)'=${rienSi1(c)}u'${derivee}\\left(u\\right)$.<br>`
    this.correction += `On a ici $u(x)=${reduireAxPlusB(a, b)}$.<br>`
    this.correction += `Donc $u'(x)=${a}$.<br>`
    this.correction += `Il vient alors $f'(x)=${miseEnEvidence(`${rienSi1(a * c)}${derivee}\\left(${reduireAxPlusB(a, b)}\\right)`)}$`
    this.reponse = `${rienSi1(a * c)}${derivee}\\left(${reduireAxPlusB(a, b)}\\right)`
    this.optionsChampTexte = { texteAvant: "<br>$f'(x)=~$" }
  }
}
