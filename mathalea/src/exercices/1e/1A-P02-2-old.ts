// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f20ef continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'f20ef'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une probabilité avec un événement contraire'
export const dateDePublication = '07/01/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1P02bOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    typeQuestion: string,
    p: number,
    n: number,
    probAuMoinsUn: number,
    probAucun: number,
  ): void {
    let situation = ''
    let explication = ''
    let bonneReponse = 0
    let dist1 = 0
    let dist2 = 0

    switch (typeQuestion) {
      case 'de1':
        // On donne P(au moins un 6) → cherche P(aucun 6)
        situation = `On lance un dé cubique ${n === 3 ? 'trois' : 'quatre'} fois de suite. Le dé est truqué. <br>
        La probabilité d'obtenir au moins une fois $6$ lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à $${texNombre(probAuMoinsUn, 3)}$.<br>
On peut alors affirmer que la probabilité de n'obtenir aucun $6$ lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à :`
        explication = `On note $A$ l'événement «\u00a0obtenir au moins un 6\u00a0» et $B$ l'événement «\u00a0n'obtenir aucun 6\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(B) = 1 - P(A)$.<br>
$P(B) = 1 - ${texNombre(probAuMoinsUn, 3)} = ${miseEnEvidence(texNombre(probAucun, 3))}$`
        bonneReponse = probAucun
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAuMoinsUn // Valeur donnée
        break

      case 'de2':
        // On donne P(aucun 6) → cherche P(au moins un 6)
        situation = `On lance un dé cubique ${n === 3 ? 'trois' : 'quatre'} fois de suite. Le dé est truqué. <br>
        La probabilité de n'obtenir aucun $6$ lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à $${texNombre(probAucun, 3)}$.<br>
On peut alors affirmer que la probabilité d'obtenir au moins une fois $6$ lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à :`
        explication = `On note $A$ l'événement «\u00a0obtenir au moins un 6\u00a0» et $B$ l'événement «\u00a0n'obtenir aucun 6\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(A) = 1 - P(B)$.<br>
$P(A) = 1 - ${texNombre(probAucun, 3)} = ${miseEnEvidence(texNombre(probAuMoinsUn, 3))}$`
        bonneReponse = probAuMoinsUn
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAucun // Valeur donnée
        break

      case 'piece1':
        // On donne P(au moins un Pile) → cherche P(aucun Pile)
        situation = `On lance une pièce truquée ${n === 3 ? 'trois' : 'quatre'} fois de suite. <br>
        La pièce donne Pile avec une probabilité de $${texNombre(p, 2)}$. <br>
        La probabilité d'obtenir au moins un Pile lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à $${texNombre(probAuMoinsUn, 3)}$.<br>
On peut alors affirmer que la probabilité de n'obtenir aucun Pile lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à :`
        explication = `On note $A$ l'événement «\u00a0obtenir au moins un Pile\u00a0» et $B$ l'événement «\u00a0n'obtenir aucun Pile\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(B) = 1 - P(A)$.<br>
$P(B) = 1 - ${texNombre(probAuMoinsUn, 3)} = ${miseEnEvidence(texNombre(probAucun, 3))}$`
        bonneReponse = probAucun
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAuMoinsUn // Valeur donnée
        break

      case 'piece2':
        // On donne P(aucun Pile) → cherche P(au moins un Pile)
        situation = `On lance une pièce truquée ${n === 3 ? 'trois' : 'quatre'} fois de suite. <br>
        La pièce donne Pile avec une probabilité de $${texNombre(p, 2)}$. <br>
        La probabilité de n'obtenir aucun Pile lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à $${texNombre(probAucun, 3)}$.<br>
On peut alors affirmer que la probabilité d'obtenir au moins un Pile lors des ${n === 3 ? 'trois' : 'quatre'} lancers est égale à :`
        explication = `On note $A$ l'événement «\u00a0obtenir au moins un Pile\u00a0» et $B$ l'événement «\u00a0n'obtenir aucun Pile\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(A) = 1 - P(B)$.<br>
$P(A) = 1 - ${texNombre(probAucun, 3)} = ${miseEnEvidence(texNombre(probAuMoinsUn, 3))}$`
        bonneReponse = probAuMoinsUn
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAucun // Valeur donnée
        break

      case 'tir1':
        // On donne P(au moins une réussite) → cherche P(tout rater)
        situation = `Un archer réussit le tir sur sa cible avec une probabilité de $${texNombre(p, 2)}$. <br>
        Il tire ${n === 3 ? 'trois' : 'quatre'} flèches.
La probabilité qu'il réussisse au moins une fois un tir est égale à $${texNombre(probAuMoinsUn, 3)}$.<br>
On peut alors affirmer que la probabilité qu'il rate ses ${n === 3 ? 'trois' : 'quatre'} tirs est égale à :`
        explication = `On note $A$ l'événement «\u00a0réussir au moins une fois un tir\u00a0» et $B$ l'événement «\u00a0rater tous les tirs\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(B) = 1 - P(A)$.<br>
$P(B) = 1 - ${texNombre(probAuMoinsUn, 3)} = ${miseEnEvidence(texNombre(probAucun, 3))}$`
        bonneReponse = probAucun
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAuMoinsUn // Valeur donnée
        break

      case 'tir2':
        // On donne P(tout rater) → cherche P(au moins une réussite)
        situation = `Un archer réussit sa cible avec une probabilité de $${texNombre(p, 2)}$. Il tire ${n === 3 ? 'trois' : 'quatre'} flèches.<br>
La probabilité qu'il rate tous ses tirs est égale à $${texNombre(probAucun, 3)}$.<br>
On peut alors affirmer que la probabilité qu'il réussisse au moins une fois un tir est égale à :`
        explication = `On note $A$ l'événement «\u00a0réussir au moins une fois un tir\u00a0» et $B$ l'événement «\u00a0rater tous les tirs\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(A) = 1 - P(B)$.<br>
$P(A) = 1 - ${texNombre(probAucun, 3)} = ${miseEnEvidence(texNombre(probAuMoinsUn, 3))}$`
        bonneReponse = probAuMoinsUn
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAucun // Valeur donnée
        break

      case 'defaut1':
        // On donne P(au moins une défectueuse) → cherche P(aucune défectueuse)
        situation = `Dans une production, $${texNombre(p * 100, 0)}\\,\\%$ des pièces sont défectueuses. <br>
        On prélève ${n === 3 ? 'trois' : 'quatre'} pièces au hasard.<br>
La probabilité qu'au moins une pièce soit défectueuse est environ $${texNombre(probAuMoinsUn, 3)}$.<br>
On peut alors affirmer que la probabilité qu'aucune pièce ne soit défectueuse est égale à :`
        explication = `On note $A$ l'événement «\u00a0au moins une pièce est défectueuse\u00a0» et $B$ l'événement «\u00a0aucune pièce n'est défectueuse\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(B) = 1 - P(A)$.<br>
$P(B) = 1 - ${texNombre(probAuMoinsUn, 3)} = ${miseEnEvidence(texNombre(probAucun, 3))}$`
        bonneReponse = probAucun
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAuMoinsUn // Valeur donnée
        break

      case 'defaut2':
        // On donne P(aucune défectueuse) → cherche P(au moins une défectueuse)
        situation = `Dans une production, $${texNombre(p * 100, 0)}\\,\\%$ des pièces sont défectueuses. On prélève ${n === 3 ? 'trois' : 'quatre'} pièces au hasard.<br>
La probabilité qu'aucune pièce ne soit défectueuse est environ $${texNombre(probAucun, 3)}$.<br>
On peut alors affirmer que la probabilité qu'au moins une pièce soit défectueuse est égale à :`
        explication = `On note $A$ l'événement «\u00a0au moins une pièce est défectueuse\u00a0» et $B$ l'événement «\u00a0aucune pièce n'est défectueuse\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(A) = 1 - P(B)$.<br>
$P(A) = 1 - ${texNombre(probAucun, 3)} = ${miseEnEvidence(texNombre(probAuMoinsUn, 3))}$`
        bonneReponse = probAuMoinsUn
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAucun // Valeur donnée
        break

      case 'meteo1':
        // On donne P(au moins un jour de pluie) → cherche P(aucun jour de pluie)
        situation = `La probabilité qu'il pleuve un jour donné est de $${texNombre(p, 2)}$. <br>On observe la météo pendant ${n === 3 ? 'trois' : 'quatre'} jours.<br>
La probabilité qu'il pleuve au moins un jour est égale à $${texNombre(probAuMoinsUn, 3)}$.<br>
On peut alors affirmer que la probabilité qu'il ne pleuve aucun des ${n === 3 ? 'trois' : 'quatre'} jours est égale à :`
        explication = `On note $A$ l'événement «\u00a0il pleut au moins un jour\u00a0» et $B$ l'événement «\u00a0il ne pleut aucun jour\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(B) = 1 - P(A)$.<br>
$P(B) = 1 - ${texNombre(probAuMoinsUn, 3)} = ${miseEnEvidence(texNombre(probAucun, 3))}$`
        bonneReponse = probAucun
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAuMoinsUn // Valeur donnée
        break

      case 'meteo2':
        // On donne P(aucun jour de pluie) → cherche P(au moins un jour de pluie)
        situation = `La probabilité qu'il pleuve un jour donné est de $${texNombre(p, 2)}$. <br>
        On observe la météo pendant ${n === 3 ? 'trois' : 'quatre'} jours.
La probabilité qu'il ne pleuve aucun des ${n === 3 ? 'trois' : 'quatre'} jours est égale à $${texNombre(probAucun, 3)}$.<br>
On peut alors affirmer que la probabilité qu'il pleuve au moins un jour est égale à :`
        explication = `On note $A$ l'événement «\u00a0il pleut au moins un jour\u00a0» et $B$ l'événement «\u00a0il ne pleut aucun jour\u00a0».<br>
Les événements $A$ et $B$ sont contraires.<br>
Donc : $P(A) = 1 - P(B)$.<br>
$P(A) = 1 - ${texNombre(probAucun, 3)} = ${miseEnEvidence(texNombre(probAuMoinsUn, 3))}$`
        bonneReponse = probAuMoinsUn
        dist1 = 1 - p // Complémentaire de p
        dist2 = probAucun // Valeur donnée
        break
    }

    this.enonce = situation
    this.correction = explication

    // Génération des distracteurs
    this.reponses = [
      `$${texNombre(bonneReponse, 3)}$`, // Bonne réponse
      `$${texNombre(dist1, 2)}$`, // Distracteur 1 : TOUJOURS 1-p (complémentaire de p)
      `$${texNombre(dist2, 3)}$`, // Distracteur 2 : valeur donnée dans l'énoncé
      `On ne peut pas savoir`, // Distracteur 3
    ]
  }

  versionOriginale: () => void = () => {
    // Dé truqué avec P(6) = 1/6, 3 lancers
    const p = 1 / 6
    const n = 3
    const probAucun = Math.pow(1 - p, n)
    const probAuMoinsUn = 1 - probAucun
    this.appliquerLesValeurs('de1', p, n, probAuMoinsUn, probAucun)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const choix = choice([
        // Dé truqué (2 cas)
        { type: 'de1', p: 1 / 6, n: choice([3, 4]) },
        { type: 'de2', p: 1 / 6, n: choice([3, 4]) },

        // Pièce truquée (2 cas)
        { type: 'piece1', p: choice([0.6, 0.7, 0.4]), n: choice([3, 4]) },
        { type: 'piece2', p: choice([0.6, 0.7, 0.4]), n: choice([3, 4]) },

        // Tir à l'arc (2 cas)
        { type: 'tir1', p: choice([0.7, 0.8, 0.6]), n: choice([3, 4]) },
        { type: 'tir2', p: choice([0.7, 0.8, 0.6]), n: choice([3, 4]) },

        // Contrôle qualité (2 cas)
        { type: 'defaut1', p: choice([0.05, 0.1, 0.15]), n: choice([3, 4]) },
        { type: 'defaut2', p: choice([0.05, 0.1, 0.15]), n: choice([3, 4]) },

        // Météo (2 cas)
        { type: 'meteo1', p: choice([0.3, 0.4, 0.2]), n: choice([3, 4]) },
        { type: 'meteo2', p: choice([0.3, 0.4, 0.2]), n: choice([3, 4]) },
      ])

      const probAucun = Math.pow(1 - choix.p, choix.n)
      const probAuMoinsUn = 1 - probAucun

      this.appliquerLesValeurs(
        choix.type,
        choix.p,
        choix.n,
        probAuMoinsUn,
        probAucun,
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
