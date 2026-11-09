import { choice } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'

import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '04e68'
export const refs = {
  'fr-fr': ['1A-E04-4'],
  'fr-ch': ['10CTFA1E-8', '10LCFA1E-8', '10LSFA1E-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer l'effet de deux évolutions successives"
export const dateDePublication = '18/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class EvolSuccEffet extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = ` Un prix augmente de $20\\,\\%$ puis diminue de $20\\,\\%$. <br>
    Après ces deux évolutions, on peut affirmer que : `
    this.correction = `Lorsqu'on applique une augmentation de $20\\,\\%$, on ajoute $20\\,\\%$ du prix initial.<br>
   Lorsqu'on applique ensuite une diminution de $20\\,\\%$, on retire $20\\,\\%$ du nouveau prix (qui est plus élevé que le prix initial).<br>
   Par conséquent, la somme retirée est plus importante que la somme ajoutée initialement.<br>
   ${texteEnCouleurEtGras('Le prix final sera donc strictement inférieur au prix initial.')}`
    this.reponses = [
      'le prix est strictement inférieur à sa valeur de départ. ',
      'le prix est égal à sa valeur de départ. ',
      'le prix est strictement supérieur à sa valeur de départ. ',
      'on ne peut pas savoir : cela dépend de la valeur de départ. ',
    ]
  }

  versionAleatoire: () => void = () => {
    switch (
      choice([1, 2, 2, 2, 3, 3, 3]) //
    ) {
      case 1:
        {
          const taux = randint(1, 9) * 10
          const choix = choice([true, false])
          this.enonce = ` Un prix ${choix ? 'augmente' : 'diminue'} de $${taux}\\,\\%$ puis ${choix ? 'diminue' : 'augmente'} de $${taux}\\,\\%$. <br>
    Après ces deux évolutions, on peut affirmer que : `
          this.correction = `Lorsqu'on applique une ${choix ? 'augmentation' : 'diminution'} de $${taux}\\,\\%$, on ${choix ? 'ajoute' : 'retire'} $${taux}\\,\\%$ du prix initial.<br>
   Lorsqu'on applique ensuite une ${choix ? 'diminution' : 'augmentation'} de $${taux}\\,\\%$, on ${choix ? 'retire' : 'ajoute'} $${taux}\\,\\%$ du nouveau prix (qui est ${choix ? 'plus grand' : 'plus petit'} que le prix initial).<br>
  Par conséquent, ${choix ? 'la somme retirée est plus importante que la somme ajoutée initialement' : 'la somme retirée initialement est plus importante que la somme ajoutée ensuite'}.<br>
   ${texteEnCouleurEtGras('Le prix final sera donc strictement inférieur au prix initial.')}<br>
   
          ${texteGras('Autre justification :')} <br>
           Le coefficient multiplicateur associé à une augmentation de taux $T$ est $CM_1=1+T$.<br>
   Celui associé à une diminution de même taux $T$ est $CM_2=1-T$.<br>
   Ainsi le coefficient multiplicateur glogal est $CM_G=CM_1\\times CM_2=\\underbrace{(1+T)(1-T)}_{(a+b)(a-b)}=\\underbrace{1-T^2}_{a^2-b^2}$.<br>
   Ce dernier résultat montre que le coefficient multiplicateur global est inférieur à $1$. <br>
   Ainsi le prix final sera strictement inférieur au prix initial.`

          this.reponses = [
            'le prix est strictement inférieur à sa valeur de départ. ',
            'le prix est égal à sa valeur de départ. ',
            'le prix est strictement supérieur à sa valeur de départ. ',
            'on ne peut pas savoir : cela dépend de la valeur de départ. ',
          ]
        }
        break

      case 2:
        {
          const taux = randint(20, 30)
          this.enonce = `
  Un prix diminue de $20\\,\\%$ puis augmente de $${taux}\\,\\%$. <br>
Sachant que le taux réciproque d'une baisse de $20\\,\\%$ est une augmentation de $25\\,\\%$, après ces deux évolutions, on peut affirmer que : `
          if (taux > 25) {
            this.correction = `
    Le taux réciproque d'une baisse de $20\\,\\%$ est une augmentation de $25\\,\\%$.<br>
    Comme $${taux}\\,\\% > 25\\,\\%$, l'augmentation appliquée est plus forte que celle nécessaire pour retrouver le prix initial.<br>
    ${texteEnCouleurEtGras('Le prix final sera donc strictement supérieur au prix initial.')}`
            this.reponses = [
              'Le prix est strictement supérieur à sa valeur de départ. ',
              'Le prix est égal à sa valeur de départ. ',
              'Le prix est strictement inférieur à sa valeur de départ. ',
              ' On ne peut pas savoir : cela dépend de la valeur de départ. ',
            ]
          } else if (taux === 25) {
            this.correction = `
      Le taux réciproque d'une baisse de $20\\,\\%$ est une augmentation de $25\\,\\%$.<br>
      Comme on applique exactement le taux réciproque, les deux opérations s'annulent parfaitement.<br>
      ${texteEnCouleurEtGras('Le prix final sera donc égal au prix initial.')}`
            this.reponses = [
              'Le prix est égal à sa valeur de départ. ',
              'Le prix est strictement inférieur à sa valeur de départ. ',
              'Le prix est strictement supérieur à sa valeur de départ. ',
              ' On ne peut pas savoir : cela dépend de la valeur de départ. ',
            ]
          } else {
            this.correction = `
      Le taux réciproque d'une baisse de $20\\,\\%$ est une augmentation de $25\\,\\%$.<br>
      Comme $${taux}\\,\\% < 25\\,\\%$, l'augmentation appliquée est insuffisante pour retrouver le prix initial.<br>
      ${texteEnCouleurEtGras('Le prix final sera donc strictement inférieur au prix initial.')}`
            this.reponses = [
              'Le prix est strictement inférieur à sa valeur de départ. ',
              'Le prix est égal à sa valeur de départ. ',
              'Le prix est strictement supérieur à sa valeur de départ. ',
              ' On ne peut pas savoir : cela dépend de la valeur de départ. ',
            ]
          }
        }
        break

      case 3:
      default:
        {
          const taux = randint(15, 25)
          this.enonce = `
Un prix augmente de $25\\,\\%$ puis baisse de $${taux}\\,\\%$. <br>
Sachant que le taux réciproque d'une augmentation de $25\\,\\%$ est une baisse de $20\\,\\%$, après ces deux évolutions, on peut affirmer que : `
          if (taux > 20) {
            this.correction = `
Le taux réciproque d'une augmentation de $25\\,\\%$ est une baisse de $20\\,\\%$.<br>
Comme $${taux}\\,\\% > 20\\,\\%$, la baisse appliquée est plus forte que celle nécessaire pour retrouver le prix initial.<br>
${texteEnCouleurEtGras('Le prix final sera donc strictement inférieur au prix initial.')}`
            this.reponses = [
              'Le prix est strictement inférieur à sa valeur de départ. ',
              'Le prix est égal à sa valeur de départ. ',
              'Le prix est strictement supérieur à sa valeur de départ. ',
              ' On ne peut pas savoir : cela dépend de la valeur de départ. ',
            ]
          } else if (taux === 20) {
            this.correction = `
Le taux réciproque d'une augmentation de $25\\,\\%$ est une baisse de $20\\,\\%$.<br>
Comme on applique exactement le taux réciproque, les deux opérations s'annulent parfaitement.<br>
${texteEnCouleurEtGras('Le prix final sera donc égal au prix initial.')}`
            this.reponses = [
              'Le prix est égal à sa valeur de départ. ',
              'Le prix est strictement inférieur à sa valeur de départ. ',
              'Le prix est strictement supérieur à sa valeur de départ. ',
              ' On ne peut pas savoir : cela dépend de la valeur de départ. ',
            ]
          } else {
            this.correction = `
Le taux réciproque d'une augmentation de $25\\,\\%$ est une baisse de $20\\,\\%$.<br>
Comme $${taux}\\,\\% < 20\\,\\%$, la baisse appliquée est insuffisante pour annuler l'augmentation initiale.<br>
${texteEnCouleurEtGras('Le prix final sera donc strictement supérieur au prix initial.')}`
            this.reponses = [
              'Le prix est strictement supérieur à sa valeur de départ. ',
              'Le prix est égal à sa valeur de départ. ',
              'Le prix est strictement inférieur à sa valeur de départ. ',
              ' On ne peut pas savoir : cela dépend de la valeur de départ. ',
            ]
          }
        }
        break
    }
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
