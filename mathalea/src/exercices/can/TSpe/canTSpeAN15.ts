import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer la dérivée d'une fonction logarithme népérien"
export const interactifReady = true

export const dateDePublication = '22/02/2025'

export const dateDeModifImportante = '31/10/2026'
export const uuid = '66395'
export const refs = {
  'fr-fr': ['canTSpeAN15'],
  'fr-ch': ['4mDer-2'],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class deriveLn extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFonctionsTerminales
  }

  nouvelleVersion() {
    const a = randint(-7, 7, 0)
    const b = randint(7, 7, 0)
    this.question = `On considère la fonction $f$ définie et dérivable sur un intervalle $I$ de $\\mathbb R$. <br>Pour tout $x$ de $ I$, on a $f(x)=\\ln(${reduireAxPlusB(a, b)})$ .`
    this.question +=
      "<br>Déterminer l'expression de la fonction dérivée de $f$."
    this.correction =
      "On sait que si $u$ est une fonction dérivable et strictement positive sur $I$, alors la fonction $\\ln(u)$ est dérivable sur $I$. <br>On a alors : $\\left(\\ln u\\right)'=\\dfrac{u'}{u}$.<br>"
    this.correction += `On reconnaît ici cette situation, avec $u(x)=${reduireAxPlusB(a, b)}$ et $u'(x)=${a}$.<br>`
    // this.correction += `On a donc   $f'(x)=\\dfrac{${a}}{${reduireAxPlusB(a, b)}}$.`
    this.reponse = `\\dfrac{${a}}{${reduireAxPlusB(a, b)}}`
    this.correction += `On a donc   $f'(x)=${miseEnEvidence(this.reponse)}$.`
    this.optionsChampTexte = { texteAvant: "<br>$f'(x)=~$" }
  }
}
