// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7f02a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '09/09/2025'
export const uuid = '7f02a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation $ax+b=c$'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11cOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = "La solution de l'équation  $-53x+72=-137$ est : "
    this.correction = ` On obtient $x$ en retranchant $72$ à $-137$, puis en divisant le résultat par $-53$.<br>
    Ainsi, $x=\\dfrac{-137-72}{-53}$, soit  $${miseEnEvidence('x=\\dfrac{137+72}{53}')}$.`

    this.reponses = [
      '$\\dfrac{137+72}{53}$',
      '$\\dfrac{137-72}{53}$',
      '$\\dfrac{72-137}{53}$',
      '$\\dfrac{72+137}{-53}$',
    ]
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      switch (randint(1, 3)) {
        case 1: // a>0, b<0 et c<0
          {
            const a = randint(71, 99, [80, 90])
            const b = randint(-49, -29)
            const c = randint(-149, -119)

            this.enonce = `La solution de l'équation  $${reduireAxPlusB(a, b)}=${c}$ est : `
            this.correction = ` On obtient $x$ en ajoutant $${-b}$ à $${c}$, puis en divisant le résultat par $${a}$.<br>
    Ainsi, $x=\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}$, soit  $${miseEnEvidence(`x=\\dfrac{${-b}${ecritureAlgebrique(c)}}{${a}}`)}$.`

            this.reponses = [
              `$\\dfrac{${-b}${ecritureAlgebrique(c)}}{${a}}$`,
              `$\\dfrac{${c}${ecritureAlgebrique(b)}}{${a}}$`,
              `$\\dfrac{${-c}${ecritureAlgebrique(b)}}{${a}}$`,
              `$\\dfrac{${c}${ecritureAlgebrique(-a)}}{${-b}}$`,
            ]
          }
          break
        case 2: // a<0, b<0 et c<0
          {
            const a = randint(-99, -34)
            const b = randint(-49, -29)
            const c = randint(-149, -119)

            this.enonce = `La solution de l'équation  $${reduireAxPlusB(a, b)}=${c}$ est : `
            this.correction = ` On obtient $x$ en ajoutant $${-b}$ à $${c}$, puis en divisant le résultat par $${a}$.<br>
    Ainsi, $x=\\dfrac{${c}${ecritureAlgebrique(-b)}}{${a}}$, soit  $${miseEnEvidence(`x=\\dfrac{${-c}${ecritureAlgebrique(b)}}{${-a}}`)}$.`

            this.reponses = [
              `$\\dfrac{${-c}${ecritureAlgebrique(b)}}{${-a}}$`,
              `$\\dfrac{${-c}${ecritureAlgebrique(-b)}}{${-a}}$`,
              `$\\dfrac{${-c}${ecritureAlgebrique(-b)}}{${a}}$`,
              `$\\dfrac{${c}${ecritureAlgebrique(-a)}}{${-b}}$`,
            ]
          }
          break

        case 3: // a<0, b>0 et c<0
        default:
          {
            const a = randint(-99, -34)
            const b = randint(29, 49)
            const c = randint(-149, -119)

            this.enonce = `La solution de l'équation  $${reduireAxPlusB(a, b)}=${c}$ est : `
            this.correction = ` On obtient $x$ en retranchant $${b}$ à $${c}$, puis en divisant le résultat par $${a}$.<br>
    Ainsi, $x=\\dfrac{${c}-${b}}{${a}}$, soit  $${miseEnEvidence(`x=\\dfrac{${-c}${ecritureAlgebrique(b)}}{${-a}}`)}$.`

            this.reponses = [
              `$\\dfrac{${-c}${ecritureAlgebrique(b)}}{${-a}}$`,
              `$\\dfrac{${-c}${ecritureAlgebrique(-b)}}{${a}}$`,
              `$\\dfrac{${c}${ecritureAlgebrique(b)}}{${-a}}$`,
              `$\\dfrac{${c}${ecritureAlgebrique(-a)}}{${-b}}$`,
            ]
          }
          break
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
