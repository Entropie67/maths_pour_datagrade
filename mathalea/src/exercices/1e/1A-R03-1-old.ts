// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid cc63e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/10/2026 (commit 720424992).
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'cc63e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une proportion de proportion (1)'
export const dateDePublication = '16/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class ProportionDeProportionOld extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  appliquerLesValeurs: (
    jour: string,
    prop1: number,
    prop2: number,
    prenom: string,
    reponses: string[],
  ) => void = (
    jour: string,
    prop1: number,
    prop2: number,
    prenom: string,
    reponses: string[],
  ) => {
    this.enonce = `${prenom} consacre $${prop1}\\,\\%$ de sa journée de ${jour} à faire ses devoirs. <br>
     $${prop2}\\,\\%$ du temps consacré aux devoirs est consacré à faire un exposé.  <br>
    Le pourcentage du temps consacré à l’exposé par rapport à la journée de ${jour} est égal à :`
    this.correction = `Le pourcentage du temps consacré à l’exposé par rapport à la journée de ${jour} est égal à $${prop1}\\,\\%$ de $${prop2}\\,\\%$, soit $${miseEnEvidence(reponses[0].slice(1, -1))}$.`
    this.reponses = reponses
  }

  versionOriginale: () => void = () => {
    const prenom = 'Jean'
    const jour = 'dimanche'
    const prop1 = 25
    const prop2 = 80
    const reponses = [
      '$\\dfrac{1}{4}\\times 80\\,\\%$',
      '$80\\,\\%-25\\,\\%$',
      '$0,08\\times 25\\,\\%$',
      `Cela dépend de la durée de la journée de ${jour}. `,
    ]
    this.appliquerLesValeurs(jour, prop1, prop2, prenom, reponses)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const table = [
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
        'dimanche',
      ]
      const jour = randint(0, 6)
      let proportions: [number, number] = [0, 0]
      let bonnesReponses: string[] = []
      let prop1: number
      let prop2: number
      let reponses: string[]
      switch (choice([1, 2])) {
        case 1:
          proportions = choice([
            [25, 4 * randint(7, 15)],
            [20, 5 * randint(5, 15)],
            [50, 2 * randint(26, 40)],
          ])
          prop1 = proportions[0]
          prop2 = proportions[1]
          bonnesReponses = [
            `$${texNombre(prop1 / 100, 2)}\\times ${texNombre(prop2, 2)}\\,\\%$`,
            `$${texNombre(prop2 / 100, 2)}\\times ${texNombre(prop1, 2)}\\,\\%$`,
            `$${texNombre((prop2 * prop1) / 100, 2)}\\,\\%$`,
          ]
          reponses = [
            choice(bonnesReponses),
            `$${prop2}\\,\\%-${prop1}\\,\\%$`,
            `$${prop2}\\,\\%\\times${texNombre(prop1 / 100, 2)}\\,\\%$`,
            `$${texNombre(prop1 / 100, 2)}\\times${texNombre(prop2 / 100, 2)}\\,\\%$`,
          ]
          break

        case 2:
        default:
          proportions = choice([
            [25, 4 * randint(5, 15)],
            [20, 5 * randint(5, 15)],
            [50, 2 * randint(28, 40)],
          ])
          prop1 = proportions[0]
          prop2 = proportions[1]
          bonnesReponses = [
            `$${texNombre(prop1 / 100, 2)}\\times ${texNombre(prop2, 2)}\\,\\%$`,
            `$${texNombre(prop1 / 100, 2)}\\times ${texNombre(prop2 / 100, 2)}$`,
            `$${texNombre(prop1 / 100, 2)}\\times ${new FractionEtendue(prop2, 100).texFractionSimplifiee}$`,
            `$${new FractionEtendue(prop1, 100).texFractionSimplifiee}\\times ${texNombre(prop2 / 100, 2)}$`,
          ]

          reponses = [
            choice(bonnesReponses),
            `$${prop2}\\,\\%-${prop1}\\,\\%$`,
            `$${new FractionEtendue(prop1, 100).texFractionSimplifiee}\\times ${texNombre(prop2, 2)}$`,
            `$${prop1}\\times ${texNombre(prop2 / 100, 2)}$`,
          ]
          break
      }
      const P = prenomM()
      this.appliquerLesValeurs(table[jour], prop1, prop2, String(P), reponses)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
  }
}
