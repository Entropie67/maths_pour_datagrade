import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer des longueurs à partir des périmètres'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'd5c88'

export const refs = {
  'fr-fr': ['can6M1-03', 'CM1M1I-flash1', '2G11-flash1'],
  'fr-ch': [],
}
export default class PerimetreCarreRectangle extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
  }

  nouvelleVersion() {
    let a, b
    switch (this.quotaChoice('typeProbleme', ['a', 'b'])) {
      case 'a':
        a = randint(5, 10) * 2
        this.question = `Le périmètre d'un carré est $${a}\\text{ cm}$.<br>
         Quelle est la longueur du côté du carré ? `
        this.correction = `On calcule le périmètre d'un carré
        en multipliant par $4$ la longueur de son côté. <br>
        On obtient donc la longueur du côté en divisant par $4$ son périmètre : $${a}\\div 4=${miseEnEvidence(texNombre(a / 4))}\\text{ cm}$.`
        this.reponse = a / 4
        break
      case 'b':
        a = randint(4, 7) * 2
        b = randint(1, a - 1)
        this.question = `Le périmètre d'un rectangle de largeur $${b}\\text{ cm}$ est $${(a + b) * 2}\\text{ cm}$.<br>Quelle est sa longueur ?
            `
        this.correction = `Si on note $L$ la longueur du rectangle, le demi-périmètre de ce rectangle est $${b}+L=\\dfrac{${(a + b) * 2}}{2}=${a + b}\\text{ cm}$.
        <br>Donc $L=${miseEnEvidence(texNombre(a))}\\text{ cm}$.`
        this.reponse = a
        break
    }

    this.canReponseACompleter = '$\\dots\\text{ cm}$'
  }
}
