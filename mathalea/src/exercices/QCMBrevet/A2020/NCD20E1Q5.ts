import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { fraction } from '../../../modules/fractions'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '28e39'
export const refs = {
  'fr-fr': ['3S2QCM-2', 'BP2FLUC3', 'BP1AUTO003'],
  'fr-ch': ['4mProbStat-17'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Probabilité simple (12/2020 Nouvelle Calédonie)'
export const dateDePublication = '3/11/2024'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 * @author Matthieu DEVILLERS
 * matthieu.devillers@ac-rennes.fr
 */

export default class NouvelleCaledonieDec20Exo1Q5 extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    nbreCartes: number,
    [nbre, typCartes, obt]: [number, string, string],
  ): void {
    const frac1 = fraction(nbre, nbreCartes).simplifie()
    const frac20 = fraction(1, nbre)
    const frac2 = frac20.produitFraction(frac1).simplifie()
    const frac3 = frac1.differenceFraction(frac2)
    const resultat = frac1.texFSD
    const distrac1 = frac2.texFSD
    const distrac2 = frac3.texFSD
    this.reponses = [`$${resultat}$`, `$${distrac1}$`, `$${distrac2}$`]

    this.enonce = `Un jeu de $${nbreCartes}$ cartes comporte $${nbre}$ ${typCartes}.<br> On tire au hasard une carte du jeu.<br>
    Quelle est la probabilité d'obtenir ${obt} ?`

    this.correction = `$\\begin{aligned}
    \\text{Probabilité}&=\\dfrac{\\text{Nombre de cartes réalisant «~obtenir ${obt}~»}}{\\text{Nombre total de cartes dans le jeu}} \\\\
    &=\\dfrac{${nbre}}{${nbreCartes}} \\\\
    &= ${miseEnEvidence(resultat)}
    \\end{aligned}
    $`
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(32, [4, 'rois', 'un roi']) // valeurs du sujet original
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 3 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const nombreCartes = choice([32, 54])
      const [nombre, typeCartes, obtenir] = choice([
        [4, 'rois', 'un roi'],
        [8, 'cartes qui sont des rois ou des dames', 'un roi ou une dame'],
        [4, 'as', 'un as'],
        [4, 'dames', 'une dame'],
        [4, 'valets', 'un valet'],
        [8, 'cartes qui sont des valets ou des as', 'un valet ou un as'],
      ])
      this.appliquerLesValeurs(nombreCartes, [nombre, typeCartes, obtenir])
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.versionAleatoire()
  }
}
