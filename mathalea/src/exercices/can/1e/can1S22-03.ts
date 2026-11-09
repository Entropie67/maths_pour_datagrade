import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Donner la forme explicite d’une suite arithmétique/géométrique'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '17/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '20/03/2026' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'fba63'

export const refs = {
  'fr-fr': ['can1S22-03'],
  'fr-ch': [],
}
export default class CalculTermeSuiteRec extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    let a, u
    const nomSuite = ['u', 'v', 'w']
    const s = choice(nomSuite)
    switch (
      this.quotaChoice('cas', ['a', 'b', 'c', 'd']) //
    ) {
      case 'a': // suite arithmétique
        if (!this.interactif) {
          a = randint(1, 15) * choice([-1, 1])
          u = randint(1, 15) * choice([-1, 1])

          this.question = `Soit $(${s}_n)$ une suite arithmétique de raison $r$  définie pour tout  $n\\in\\mathbb{N}$, telle que
        $${s}_0=${u}$ et  $r=${a}$.<br>
        Donner l'expression de $${s}_n$ en fonction de $n$.`

          this.question += ''
        } else {
          a = randint(1, 15)
          u = randint(1, 15) * choice([-1, 1])

          this.question = `Soit $(${s}_n)$ une suite arithmétique de raison $r$  définie pour tout  $n\\in \\mathbb{N}$, telle que
          $${s}_0=${u}$ et $r=${a}$.<br>
          Donner l'expression de $${s}_n$ en fonction de $n$.`

          this.question += `<br> $${s}_n=$`
        }
        this.correction = `Pour tout entier naturel $n$, $u_n=u_0+n\\times r$.<br>
        Avec $${s}_0=${u}$ et  $r=${a}$, on obtient $${s}_n=${u}+n\\times${ecritureParentheseSiNegatif(a)}=$ `
        if (a === 1) {
          this.correction += `$${miseEnEvidence(`${u}+n`)}$.`
        } else if (a === -1) {
          this.correction += `$${miseEnEvidence(`${u}-n`)}$.`
        } else {
          this.correction += `$${miseEnEvidence(`${u}${ecritureAlgebrique(a)}n`)}$.`
        }

        this.reponse = [`${u}+${a}n`, `${u}+${a}\\times n`]
        break
      case 'b': // suite arithmétique pour n>=1
        if (!this.interactif) {
          a = randint(1, 15) * choice([-1, 1])
          u = randint(1, 15, [-a, a]) * choice([-1, 1])
          this.question = `Soit $(${s}_n)$ une suite arithmétique de raison $r$  définie pour tout   $n\\in\\mathbb{N}^*$, telle que
          $${s}_1=${u}$ et $r=${a}$.<br>
          Donner l'expression de $${s}_n$ (la plus simple possible) en fonction de $n$.`

          this.question += ''
        } else {
          a = randint(1, 15)
          u = randint(1, 15, [a, -a]) * choice([-1, 1])

          this.question = `Soit $(${s}_n)$ une suite arithmétique de raison $r$  définie pour tout   $n\\in\\mathbb{N}^*$, telle que
          $${s}_1=${u}$ et $r=${a}$.<br>
          Donner l'expression de $${s}_n$  (la plus simple possible) en fonction de $n$.`

          this.question += `<br> $${s}_n=$`
        }
        this.correction = `Pour tout entier naturel $n$ non nul, $u_n=u_1+(n-1)\\times r$.<br>
        Avec $${s}_1=${u}$ et  $r=${a}$, on obtient $${s}_n=${u}+(n-1)\\times${ecritureParentheseSiNegatif(a)}=$ `
        if (a === 1) {
          this.correction += `$${miseEnEvidence(`${u - 1}+n`)}$.`
        } else if (a === -1) {
          this.correction += `$${miseEnEvidence(`${u + 1}-n`)}$.`
        } else {
          this.correction += `$${miseEnEvidence(`${u - a}${ecritureAlgebrique(a)}n`)}$.`
        }

        this.reponse = [`${u - a}+${a}n`, `${u - a}+${a}\\times n`]
        break
      case 'c': // suite géométrique
        if (!this.interactif) {
          a = choice([randint(2, 15) * choice([-1, 1]), randint(1, 99) / 100])
          u = randint(-15, 15, [0, 1, a, -a])
          this.question = `Soit $(${s}_n)$ une suite géométrique de raison $q$  définie pour tout   $n\\in \\mathbb{N}$, telle que
          $${s}_0=${u}$ et $q=${texNombre(a, 2)}$.<br>
          Donner l'expression de $${s}_n$ en fonction de $n$.`
          this.question += ''
        } else {
          a = choice([randint(2, 15), randint(1, 99) / 100])
          u = randint(-15, 15, [0, 1, a])
          this.question = `Soit $(${s}_n)$ une suite géométrique de raison $q$  définie pour tout   $n\\in \\mathbb{N}$, telle que
          $${s}_0=${u}$ et $q=${texNombre(a, 2)}$.<br>
          Donner l'expression de $${s}_n$ en fonction de $n$.`
          this.question += `<br> $${s}_n=$`
        }
        this.correction = `Pour tout entier naturel $n$, $u_n=u_0\\times q^n$.<br>
        Avec $${s}_0=${u}$ et  $q=${texNombre(a, 2)}$, on obtient $${s}_n=${miseEnEvidence(`${u}\\times${ecritureParentheseSiNegatif(a)}^n`)}$.`
        if (u === -1) {
          this.reponse = [`${u}\\times ${a}^n`, `-${a}^n`, `${a}^n\\times${u}`]
        } else {
          this.reponse = [`${u}\\times ${a}^n`, `${a}^n\\times${u}`]
        }
        break
      case 'd': // suite géométrique sur N*
        if (!this.interactif) {
          a = choice([randint(2, 15) * choice([-1, 1]), randint(1, 99) / 100])
          u = randint(-15, 15, [0, 1, -1, a, -a])
          this.question = `Soit $(${s}_n)$ une suite géométrique de raison $q$ définie pour tout $n\\in\\mathbb{N}^*$, telle que
          $${s}_1=${u}$ et $q=${texNombre(a, 2)}$.<br>
          Donner l'expression de $${s}_n$ en fonction de $n$.`
        } else {
          a = choice([randint(2, 15), randint(1, 99) / 100])
          u = randint(-15, 15, [0, 1, -1, a, -a])
          this.question = `Soit $(${s}_n)$ une suite géométrique de raison $q$  définie pour tout   $n\\in\\mathbb{N}^*$, telle que
          $${s}_1=${u}$ et $q=${texNombre(a, 2)}$.<br>
          Donner l'expression de $${s}_n$ en fonction de $n$.`
          this.question += `<br> $${s}_n=$`
        }
        this.correction = `Pour tout entier naturel $n$, $u_n=u_1\\times q^{n-1}$.<br>
        Avec $${s}_1=${u}$ et  $q=${texNombre(a, 2)}$, on obtient $${s}_n=${miseEnEvidence(`${u}\\times${ecritureParentheseSiNegatif(a)}^{n-1}`)}$`
        this.reponse = [
          `${u}\\times ${ecritureParentheseSiNegatif(a)}^{n-1}`,
          `${ecritureParentheseSiNegatif(a)}^{n-1}\\times${u}`,
        ]
        break
    }
  }
}
