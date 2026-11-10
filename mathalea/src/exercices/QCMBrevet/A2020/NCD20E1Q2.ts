import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '5d700'
export const refs = {
  'fr-fr': ['3C1QCM-02'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Écriture scientifique d'un nombre (12/2020 Nouvelle Calédonie)"
export const dateDePublication = '01/11/2024'
/**
 *
 * @author Matthieu DEVILLERS
 * matthieu.devillers@ac-rennes.fr
 */
// Ceci est un exemple de QCM avec version originale et version aléatoire
export default class NouvelleCaledonieDecembre2023Exo1Q2 extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    a: number,
    exposant: number,
    decalage: number,
  ): void {
    this.reponses = [
      `$${texNombre(a / 10 ** decalage)} \\times 10^{${String(exposant + decalage)}} $`,
      `$${String(a)} \\times ${String(exposant > 0 ? exposant : -exposant)} $`,
      `$${texNombre(a / 10 ** decalage)} \\times 10^{${String(exposant - decalage)}}$`,
    ]

    // times 10^(exposant-decalage))}$`,
    //
    this.enonce = `L'écriture scientifique de $ ${texNombre(a)} \\times 10^{${exposant}}$ est : `
    this.correction = `$ \\begin{aligned}
    ${texNombre(a)} \\times 10^{${exposant}} &= ${texNombre(a / 10 ** decalage)} \\times 10^{${decalage}} \\times 10^{${exposant}} \\\\
    &= ${texNombre(a / 10 ** decalage)} \\times 10^{${decalage} + ${ecritureParentheseSiNegatif(exposant)}} \\\\
    &= ${miseEnEvidence(texNombre(a / 10 ** decalage) + `\\times 10^{${decalage + exposant}}`)} 
    \\end{aligned} $`
  }

  // \\times 10^{decalage + exposant})}
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(245, -5, 2) // valeurs originales DNB
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 3 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const a = randint(0, 1) === 1 ? randint(101, 999) : randint(1001, 9999)
      const decalage = a < 1000 ? 2 : 3
      const exposant = randint(-20, 20, [-4, -3, -2, -1, 0, 1, 2, 3, 4])
      this.appliquerLesValeurs(a, exposant, decalage)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.versionAleatoire()
  }
}
