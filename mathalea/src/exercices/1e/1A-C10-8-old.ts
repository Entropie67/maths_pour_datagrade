// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2e7a5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, signe } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '2e7a5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation du premier degré'
export const dateDePublication = '05/08/2025'
//
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C11Old extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = "La solution de l'équation $4(x-5)=7x+3$ est : "
    this.correction = `On développe, puis on isole l'inconnue dans le membre de gauche :<br>
 $\\begin{aligned}
 4(x-5)&=7x+3\\\\
 4x-20&=7x+3\\\\
 4x-7x&=3+20\\\\
 -3x&=23\\\\
 x&=-\\dfrac{23}{3}
\\end{aligned}$
 `

    this.correction += ` La solution est $${miseEnEvidence('-\\dfrac{23}{3}')}$.`

    this.reponses = [
      '$-\\dfrac{23}{3}$',
      '$\\dfrac{23}{3}$',
      '$26$',
      '$-\\dfrac{17}{3}$',
    ]
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const typeEquation = choice(['k(ax+b)=cx+d', 'k-(ax+b)=cx+d'])

      let bonnereponse, c
      let erreur1, erreur2, erreur3

      // Génération des coefficients
      const a = randint(-9, 9, 0)
      const b = randint(-9, 9, 0)
      c = randint(-9, 9, a)
      const d = randint(-9, 9, 0)
      const k = randint(2, 9, b)

      if (typeEquation === 'k(ax+b)=cx+d') {
        if (c === k * a) {
          c = randint(1, 9, [k * a])
        } // éviter division par 0

        this.enonce = `La solution de l'équation $${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$ est : `
        this.correction = `On développe, puis on isole l'inconnue dans le membre de gauche :<br>
 $\\begin{aligned}
 ${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${k * a}x${ecritureAlgebrique(k * b)}&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${k * a}x${ecritureAlgebrique(k * b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}&=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}\\\\
 ${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}&=${d}\\\\
 ${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}${miseEnEvidence(ecritureAlgebrique(-k * b))}&=${d}${miseEnEvidence(ecritureAlgebrique(-k * b))}\\\\
 ${rienSi1(k * a - c)}x&=${d - k * b}\\\\
 x&=${texFractionFromString(d - k * b, k * a - c)}\\\\
 ${pgcd(abs(d - k * b), abs(k * a - c)) > 1 || k * a - c < 0 ? `x&=${new FractionEtendue(d - k * b, k * a - c).texFractionSimplifiee}` : ''}\\end{aligned}$<br>`
        this.correction += `La solution est $${miseEnEvidence(new FractionEtendue(d - k * b, k * a - c).texFractionSimplifiee)}$.`

        bonnereponse = new FractionEtendue(d - k * b, k * a - c)
          .texFractionSimplifiee

        // Erreurs possibles
        erreur1 = new FractionEtendue(d - b, a - c).texFractionSimplifiee // Oubli du k dans le développement
        erreur2 = new FractionEtendue(d + k * b, k * a - c)
          .texFractionSimplifiee // Erreur de signe
        erreur3 = new FractionEtendue(d - k * b, k * a + c)
          .texFractionSimplifiee // Erreur dans la soustraction des x
      } else {
        // k-(ax+b)=cx+d
        if (c === -a) {
          c = randint(-9, 9, [0, a, -a])
        } // éviter division par 0

        // On calcule les nouvelles valeurs dès le début
        const newA = -a
        const newB = k - b

        this.enonce = `La solution de l'équation $${k}-(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$ est : `
        this.correction = `On développe, puis on isole l'inconnue dans le membre de gauche :<br>
 $\\begin{aligned}
 ${k}-(${rienSi1(a)}x${ecritureAlgebrique(b)})&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${k}${ecritureAlgebrique(-a)}x${ecritureAlgebrique(-b)}&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${rienSi1(newA)}x${ecritureAlgebrique(newB)}&=${rienSi1(c)}x${ecritureAlgebrique(d)}\\\\
 ${rienSi1(newA)}x${ecritureAlgebrique(newB)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}&=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}\\\\
 ${rienSi1(newA - c)}x${ecritureAlgebrique(newB)}&=${d}\\\\
 ${rienSi1(newA - c)}x${ecritureAlgebrique(newB)}${miseEnEvidence(ecritureAlgebrique(-1 * newB))}&=${d}${miseEnEvidence(ecritureAlgebrique(-1 * newB))}\\\\
 ${rienSi1(newA - c)}x&=${d - newB}\\\\
 x&=${texFractionFromString(d - newB, newA - c)}\\\\
 ${pgcd(abs(d - newB), abs(newA - c)) > 1 || newA - c < 0 ? `x&=${new FractionEtendue(d - newB, newA - c).texFractionSimplifiee}` : ''}\\end{aligned}$`

        this.correction += `<br> La solution est $${miseEnEvidence(new FractionEtendue(d - newB, newA - c).texFractionSimplifiee)}$.`

        bonnereponse = new FractionEtendue(d - newB, newA - c)
          .texFractionSimplifiee

        // Erreurs possibles
        erreur1 = new FractionEtendue(d + newB, newA - c).texFractionSimplifiee // Erreur de signe
        erreur2 = new FractionEtendue(d - b, a - c).texFractionSimplifiee // Pas de développement du membre de gauche
        erreur3 = new FractionEtendue(-d + newB, newA - c).texFractionSimplifiee // Erreur dans la soustraction des x
      }

      this.reponses = [
        `$${bonnereponse}$`,
        `$${erreur1}$`,
        `$${erreur2}$`,
        `$${erreur3}$`,
      ]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
    this.spacing = 1.5
  }
}
