// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9aef1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '9aef1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer la médiane d'une série à faible effectif"
export const dateDePublication = '01/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */

export default class MedianeQCMOld extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    effectif: number,
    valeurs: number[],
    rang: number,
    mediane: number,
    serieClassee: number[],
  ): void {
    let distracteur2: number
    if (effectif % 2 === 0) {
      // cas série effectif pair
      distracteur2 = (valeurs[rang - 1] + valeurs[rang]) / 2
    } else {
      // cas série effectif impair
      distracteur2 = valeurs[rang - 1]
    }
    let distracteur3: number
    let distracteur4: number
    if (effectif % 2 === 0) {
      // cas série effectif pair
      distracteur3 = serieClassee[rang - 1]
      distracteur4 = serieClassee[rang]
    } else {
      // cas série effectif impair
      distracteur3 = serieClassee[rang - 2]
      distracteur4 = serieClassee[rang]
    }
    function rendreDistracteursDistincts(
      mediane: number,
      distracteur2: number,
      distracteur3: number,
      distracteur4: number,
    ): { d3: number; d4: number } {
      const interdits = new Set([mediane, distracteur2])

      const ajustements = [0, 1, -1, 2, -2]

      // Trouver une valeur valide pour distracteur3
      const d3Valides = ajustements
        .map((delta) => distracteur3 + delta)
        .filter((val) => !interdits.has(val))

      if (d3Valides.length === 0)
        throw new Error('Impossible de rendre distracteur3 distinct')

      const d3 = d3Valides[0]
      interdits.add(d3)

      // Trouver une valeur valide pour distracteur4
      const d4Valides = ajustements
        .map((delta) => distracteur4 + delta)
        .filter((val) => !interdits.has(val))

      if (d4Valides.length === 0)
        throw new Error('Impossible de rendre distracteur4 distinct')

      const d4 = d4Valides[0]

      return { d3, d4 }
    }
    let d3 = distracteur3
    let d4 = distracteur4
    const result = rendreDistracteursDistincts(
      mediane,
      distracteur2,
      distracteur3,
      distracteur4,
    )
    d3 = result.d3
    d4 = result.d4
    this.reponses = [
      `$${texNombre(mediane)}$`,
      `$${texNombre(d3)}$`,
      `$${texNombre(d4)}$`,
      `$${texNombre(distracteur2)}$`,
    ]

    this.enonce = `On donne la série statistique suivante : 
    $${valeurs.join('$ ; $')}$.<br>
    Parmi ces propositions, laquelle peut être la médiane de la série ?`
    this.correction = `La série triée dans l'ordre croissant est : $${serieClassee.join('$  ;  $')}$.`
    this.correction += `<br>La série comporte $${effectif}$ valeurs, qui est `
    if (effectif % 2 === 0) {
      this.correction += `un nombre pair, donc une médiane est une valeur ${texteGras('strictement')} comprise entre les termes de rang $${rang}$ et $${rang + 1}$, 
      soit entre $${serieClassee[rang - 1]}$ et $${serieClassee[rang]}$. <br>Prenons la moyenne de ces deux valeurs :<br>
       $\\dfrac{${texNombre(serieClassee[rang - 1])} + ${texNombre(serieClassee[rang])}}{2} = ${texNombre(mediane)}$.<br>`
    } else {
      this.correction += `un nombre impair,  donc la médiane est le terme de rang $${rang}$.<br>`
    }
    this.correction += `La médiane est donc $${miseEnEvidence(texNombre(mediane))}$.`
    this.reponse = `$${texNombre(mediane)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, [3, 8, 5, 2], 2, 4, [2, 3, 5, 8]) // valeurs originales
    this.reponses = ['4', '6,5', '5', '8']
  }

  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      const effectif = randint(5, 10) // nombre de valeurs dans la série
      const valeurs: number[] = [] // On ditribue des valeurs distinctes à la série
      while (valeurs.length < effectif) {
        const val = randint(2, 20)
        if (!valeurs.includes(val)) {
          valeurs.push(val)
        }
      }
      const serieClassee = [...valeurs].sort((a, b) => a - b)
      const rang = effectif % 2 === 0 ? effectif / 2 : (effectif + 1) / 2
      // Attention, le rang donne le bon rang dans la série impaire, mais le rang inférieur dans la série paire.
      let mediane: number
      if (effectif % 2 === 0) {
        mediane = (serieClassee[rang - 1] + serieClassee[rang]) / 2
      } else {
        mediane = serieClassee[rang - 1]
      }

      // On adapte la série de l'énoncé pour créer un distracteur qui utilise la bonne méthode mais dans la série de l'énoncé :
      if (effectif % 2 === 0) {
        // cas série effectif pair
        if (mediane === (valeurs[rang - 1] + valeurs[rang]) / 2) {
          // Interchanger les valeurs de valeurs[rang-1] et valeurs[rang-2]
          const temp = valeurs[rang - 1]
          valeurs[rang - 1] = valeurs[rang - 2]
          valeurs[rang - 2] = temp
        }
      } else {
        // cas série effectif impair
        if (mediane === valeurs[rang - 1]) {
          const temp = valeurs[rang - 1]
          valeurs[rang - 1] = valeurs[rang - 2]
          valeurs[rang - 2] = temp
        }
      }

      this.appliquerLesValeurs(effectif, valeurs, rang, mediane, serieClassee)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
  }
}
