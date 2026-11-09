import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Déterminer un vecteur directeur avec une équation cartésienne'
export const interactifReady = true

export const dateDePublication = '08/07/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora avec Jean-Claude pour la partie interactive

 *
 */
export const uuid = 'dacc1'

export const refs = {
  'fr-fr': ['can2G31-01', '2G32-flash1'],
  'fr-ch': ['3G97-4'],
}
export default class VecteurDirEqCart extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.listeAvecNumerotation = false
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -9, 9, [0])
    const b = this.quotaRandint('b', -9, 9, [0])
    const c = this.quotaRandint('c', -5, 5, [0])

    this.question = `Dans un repère, la droite $d$ a pour équation :
      $${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${ecritureAlgebrique(c)}=0$<br>
      Donner les coordonnées d'un vecteur directeur $\\vec{u}$ de la droite $d$.<br><br>`
    this.optionsChampTexte = { texteAvant: '$\\vec{u}$ a pour coordonnées :' }
    this.correction = `Si l'équation d'une droite $d$ est de la forme $ax+by+c=0$, on sait d'après le cours,<br>
      qu'un vecteur directeur $\\vec{u}$ de $d$ a pour coordonnées $\\vec{u}(-b\\,;\\,a)$.<br>
      Tout vecteur colinéaire à $\\vec{u}$ est aussi un vecteur directeur de $d$.<br>
      On en déduit que les coordonnées de $\\vec{u}$ sont $${miseEnEvidence('(')} ${miseEnEvidence(`${-b}`)}\\,${miseEnEvidence(';')}\\,${miseEnEvidence(`${a}`)} ${miseEnEvidence(')')}$.`
    this.reponse = `(${-b};${a})`
  }
}
