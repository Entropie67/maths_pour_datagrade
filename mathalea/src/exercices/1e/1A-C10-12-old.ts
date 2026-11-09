// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 459d1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '459d1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation'
export const dateDePublication = '26/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C11dOld extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `La solution de l'équation $(5x+3)-(3x-2)=0$ est : `

    this.correction = `On se ramène à une équation du type $ax=b$ en isolant les  «\u00a0$x$\u00a0» dans le membre de gauche et les «\u00a0non $x$\u00a0» dans le membre de droite.<br>
    $\\begin{aligned}
    (5x+3)-(3x-2)&=0\\\\
    5x+3-3x+2&=0\\\\
2x&=-5\\\\
x&=-\\dfrac{5}{2}
\\end{aligned}$<br>
    
   La solution de cette équation est  $${miseEnEvidence(`-\\dfrac{5}{2}`)}$.`

    this.reponses = [
      '$-\\dfrac{5}{2}$',
      '$-\\dfrac{3}{5}$',
      '$\\dfrac{2}{3}$',
      '$-\\dfrac{1}{2}$',
    ]
  }

  versionAleatoire: () => void = () => {
    const a = randint(1, 10)
    const b = randint(-10, 10, 0)
    const c = randint(2, 10, [a, a - 1, a + 1])
    const d = randint(-10, 10, [0, b])
    const reponse = new FractionEtendue(d - b, a - c)
    const dist1 = new FractionEtendue(-b, a)
    const dist2 = new FractionEtendue(-d, c)
    const dist3 = new FractionEtendue(-d - b, a - c)
    this.enonce = `La solution de l'équation $(${reduireAxPlusB(a, b)})-(${reduireAxPlusB(c, d)})=0$ est : `

    this.correction = `On se ramène à une équation du type $ax=b$ en isolant les  «\u00a0$x$\u00a0» dans le membre de gauche et les «\u00a0non $x$\u00a0» dans le membre de droite.<br>
    $\\begin{aligned}
    (${reduireAxPlusB(a, b)})-(${reduireAxPlusB(c, d)})&=0\\\\
   ${a}x${ecritureAlgebrique(b)}${ecritureAlgebrique(-c)}x${ecritureAlgebrique(-d)}&=0\\\\
 ${a - c}x${ecritureAlgebrique(b - d)}&=0\\\\
 ${a - c}x&=${d - b}\\\\
x&= ${reponse.simplifie().texFSD}
\\end{aligned}$<br>
    
   La solution de cette équation est  $${miseEnEvidence(reponse.simplifie().texFSD)}$.`

    this.reponses = [
      `$${reponse.simplifie().texFSD}$`,
      `$${dist1.simplifie().texFSD}$`,
      `$${dist2.simplifie().texFSD}$`,
      `$${dist3.simplifie().texFSD}$`,
    ]
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
    this.spacing = 1.5
  }
}
