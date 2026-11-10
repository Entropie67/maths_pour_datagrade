import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  contraindreValeur,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

import {
  canvasEnonceCorrection,
  empilementCubes,
} from '../../lib/3d/3d_dynamique/empilementsCube'
import { createCubesProjections } from '../../lib/3d/3dProjectionMathalea2d/CubeIso'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

export const dateDePublication = '03/03/2021'
export const dateDeModificationImportante = '15/07/2025'
export const titre = 'Compter les cubes manquants ou pas'
export const interactifReady = true

/**
 * Compter des cubes dans un empilement de cubes
 * @author Erwan DUPLESSY
 * Source : http://cache.media.education.gouv.fr/file/Geometrie_et_espace/47/1/RA16_C4_MATH_geo_espace_flash_567471.pdf
 * Ajout de la 3D dynamique par Jean-claude Lhote
 */

export const uuid = '5f115'

export const refs = {
  'fr-fr': ['6G8A-1', '6AutoE1-3', '5G2autoB'],
  'fr-2016': ['6G43'],
  'fr-ch': ['9R1ES3C-1', '9R2ES3C-1', '9R3ES3C-1', 'PRQES06C-4'],
}
export default class DenombrerCubes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Compter les cubes\n2 : Compter les cubes manquants\n3 : Mélange',
    ]
    this.sup = 1
    this.besoinFormulaire2Numerique = [
      "Taille de l'empilement",
      5,
      'De taille 3\nDe taille 4\nDe taille 5\nDe taille 6\nDe taille 7',
    ]
    this.sup2 = 1
    this.besoinFormulaire3CaseACocher = ['3D dynamique', false]
    this.sup3 = false
    this.nbQuestions = 3 // Ici le nombre de questions
    this.besoinFormulaire4Numerique = [
      'Volume',
      2,
      '1 : Volume en nombre de cubes\n2 : Volume en cm³',
    ]
    this.sup4 = 1

    // c'est ici que commence le code de l'exercice cette fonction crée une copie de l'exercice
  }

  nouvelleVersion() {
    this.sup = contraindreValeur(1, 3, this.sup, 1) // taille de l'empilement
    this.sup2 = contraindreValeur(1, 5, this.sup2, 1) // type de questions
    let typesDeQuestionsDisponibles: number[] = [] // tableau à compléter par valeurs possibles des types de questions
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = [1]
        break
      case 2:
        typesDeQuestionsDisponibles = [2]
        break
      case 3:
        typesDeQuestionsDisponibles = [1, 2]
        break
    }
    const unitesCubes = this.sup4 === 1

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const longueur = 2 + parseInt(this.sup2) // longueur de l'empilement
    const largeur = longueur // largeur de l'empilement
    const hauteur = longueur // hauteur de l'empilement

    if (this.nbQuestions === 1) {
      if (this.sup === 1) {
        //Compter le nb de cubes présents
        if (!this.sup3 || !context.isHtml) {
          // 3d Iso avec Mathalea2d
          if (!unitesCubes) {
            this.consigne =
              'Un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ de cet empilement.'
          } else {
            this.consigne =
              'Un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Déterminer le nombre de cubes que contient cet empilement.'
          }
        } else {
          // 3d dynamique avec Canvas3DElement
          if (!unitesCubes) {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ de cet empilement."
          } else {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Déterminer le nombre de cubes que contient cet empilement."
          }
        }
      } else if (this.sup === 2) {
        //Compter le nb de cubes manquant
        if (!this.sup3 || !context.isHtml) {
          // 3d Iso avec Mathalea2d
          if (!unitesCubes) {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ manquant pour reconstruire un cube de $3$ cm d'arête."
          } else {
            this.consigne =
              'Un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Déterminer le nombre de cubes manquant pour reconstruire un grand cube constitué de $3$ cubes sur chaque arête.'
          }
        } else {
          // 3d dynamique avec Canvas3DElement
          if (!unitesCubes) {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume manquant pour reconstruire un cube de $3$ cm d'arête."
          } else {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Déterminer le nombre de cubes manquant pour reconstruire un grand cube constitué de $3$ cubes sur chaque arête."
          }
        }
      } else if (this.sup === 3) {
        //Compter le nb de cubes manquant
        if (!this.sup3 || !context.isHtml) {
          // 3d Iso avec Mathalea2d
          if (!unitesCubes) {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ le composant ou manquant pour reconstruire un cube de $3$ cm d'arête."
          } else {
            this.consigne =
              'Un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Déterminer le nombre de cubes le composant ou manquant pour reconstruire un grand cube constitué de $3$ cubes sur chaque arête.'
          }
        } else {
          // 3d dynamique avec Canvas3DElement
          if (!unitesCubes) {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume le composant ou manquant pour reconstruire un cube de $3$ cm d'arête."
          } else {
            this.consigne =
              "Un empilement de cubes est représenté ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Déterminer le nombre de cubes le composant ou manquant pour reconstruire un grand cube constitué de $3$ cubes sur chaque arête."
          }
        }
      }
    } else {
      // Cas pour plusieurs questions
      if (this.sup === 1) {
        //Compter le nb de cubes présents
        if (!this.sup3 || !context.isHtml) {
          // 3d Iso avec Mathalea2d pour plusieurs questions
          if (!unitesCubes) {
            this.consigne =
              'Dans chacun des cas ci-dessous, un empilement de cubes est représenté avec deux angles différents.<br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ de ces empilements.'
          } else {
            this.consigne = `Dans chacun des cas ci-dessous, un empilement de cubes est représenté ci-dessous avec deux angles différents.<br>Déterminer le nombre de cubes que contient chacun de ces empilements.`
          }
        } else {
          // 3d dynamique avec Canvas3DElement
          if (!unitesCubes) {
            this.consigne =
              "Des empilements de cubes sont représentés ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ de ces empilements."
          } else {
            this.consigne = `Des empilements de cubes sont représentés ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Déterminer le nombre de cubes que contient chacun de ces empilements.`
          }
        }
      } else if (this.sup === 2) {
        if (!this.sup3 || !context.isHtml) {
          // 3D Iso avec Mathalea2d
          if (!unitesCubes) {
            this.consigne = `Dans chacun des cas ci-dessous, un empilement de cubes est représenté avec deux angles différents.<br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ manquant pour reconstruire un cube de $${longueur}$ cm d'arête.`
          } else {
            this.consigne = `Dans chacun des cas ci-dessous, un empilement de cubes est représenté avec deux angles différents.<br>Déterminer le nombre de cubes manquant pour reconstruire un grand cube constitué de $${longueur}$ cubes sur chaque arête.`
          }
        } else {
          // 3D dynamique avec Canvas3DElement
          if (!unitesCubes) {
            this.consigne = `Des empilements de cubes sont représentés ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ manquant pour reconstruire un cube de $${longueur}$ cm d'arête.`
          } else {
            this.consigne = `Des empilements de cubes sont représentés ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Déterminer le nombre de cubes manquant pour reconstruire un grand cube constitué de $${longueur}$ cubes sur chaque arête.`
          }
        }
      } else if (this.sup === 3) {
        if (!this.sup3 || !context.isHtml) {
          // 3D Iso avec Mathalea2d
          if (!unitesCubes) {
            this.consigne = `Dans chacun des cas ci-dessous, un empilement de cubes est représenté avec deux angles différents.<br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ le composant ou manquant pour reconstruire un cube de $${longueur}$ cm d'arête.`
          } else {
            this.consigne = `Dans chacun des cas ci-dessous, un empilement de cubes est représenté avec deux angles différents.<br>Déterminer le nombre de cubes le composant ou manquant pour reconstruire un grand cube constitué de $${longueur}$ cubes sur chaque arête.`
          }
        } else {
          // 3D dynamique avec Canvas3DElement
          if (!unitesCubes) {
            this.consigne = `Des empilements de cubes sont représentés ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Les cubes ayant des arêtes de $1$ cm de longueur, calculer le volume en $\\text{cm}^3$ le composant ou manquant pour reconstruire un cube de $${longueur}$ cm d'arête.`
          } else {
            this.consigne = `Des empilements de cubes sont représentés ci-dessous (on peut faire tourner l'empilement en plein écran). <br>Déterminer le nombre de cubes le composant ou manquant pour reconstruire un grand cube constitué de $${longueur}$ cubes sur chaque arête.`
          }
        }
      }
    }

    for (let q = 0, texteCorr, cpt = 0; q < this.nbQuestions && cpt < 50;) {
      let figure, figureCorrection
      const L = empilementCubes(longueur, largeur, hauteur) // crée un empilement aléatoire
      let texte = ''
      texteCorr = '' // Idem pour le texte de la correction.

      if (!this.sup3 || !context.isHtml) {
        // 3d Iso avec Mathalea2d
        texte += ''
        ;({ figure, figureCorrection } = createCubesProjections(
          L,
          largeur,
          longueur,
          hauteur,
        ))
      } else {
        // 3d dynamique avec Canvas3DElement
        texte += ''
        ;({ canvasEnonce: figure, canvasCorrection: figureCorrection } =
          canvasEnonceCorrection(L, `scene3dEx${this.numeroExercice}Q${q}`))
      }
      // début de l'exercice

      switch (listeTypeDeQuestions[q]) {
        case 1:
          if (this.interactif) {
            texte += unitesCubes
              ? 'Nombre de petits cubes composant cet empilement :' +
                ajouteChampTexteMathLive(this, q, KeyboardType.clavierNumbers)
              : 'Volume en $\\text{cm}^3$ :' +
                ajouteChampTexteMathLive(this, q, KeyboardType.volume)
          } else if (this.sup === 3) {
            texte += unitesCubes
              ? 'Nombre de petits cubes composant cet empilement ?<br>'
              : 'Volume en $\\text{cm}^3$ composant cet empilement ?<br>'
          }
          texte += figure

          // correction :
          texteCorr += "On peut représenter l'empilement par tranches : <br>"
          texteCorr += figureCorrection + '<br>'
          texteCorr += `Il y a au total $${miseEnEvidence(L.length)}$ cubes.`
          handleAnswers(this, q, {
            reponse: {
              value: L.length,
            },
          })
          break
        case 2:
          if (this.interactif) {
            texte += unitesCubes
              ? `Nombre de petits cubes manquant pour reconstruire un grand cube constitué de $${longueur}$ petits cubes sur chaque arête :` +
                ajouteChampTexteMathLive(this, q, KeyboardType.clavierNumbers)
              : `Volume en $\\text{cm}^3$ manquant pour reconstruire un cube de $${longueur}\\text{ cm}$ d'arête :` +
                ajouteChampTexteMathLive(this, q, KeyboardType.volume)
          } else if (this.sup === 3) {
            texte += unitesCubes
              ? 'Nombre de petits cubes manquant pour compléter cet empilement ?<br>'
              : 'Volume en $\\text{cm}^3$ manquant pour compléter cet empilement ?<br>'
          }
          texte += figure
          // correction :
          texteCorr +=
            "On peut, par exemple, représenter l'empilement par tranches : <br>"
          texteCorr += figureCorrection + '<br>'
          texteCorr += unitesCubes
            ? `Il y a au total $${L.length}$ cubes. On en veut $${longueur}\\times ${largeur} \\times ${hauteur} = ${longueur * largeur * hauteur}$. <br>`
            : `Il y a au total $${L.length}$ $\\text{cm}^3$. On en veut $${longueur}\\,\\text{cm} \\times ${largeur}\\,\\text{cm} \\times ${hauteur}\\,\\text{cm} = ${longueur * largeur * hauteur}\\,\\text{cm}^3$. <br>`
          texteCorr += `Il manque $${miseEnEvidence(longueur * largeur * hauteur - L.length)}$ `
          texteCorr += unitesCubes ? `cubes.` : `$\\text{cm}^3$.`
          handleAnswers(this, q, {
            reponse: {
              value: longueur * largeur * hauteur - L.length,
            },
          })
          break
      }
      if (this.questionJamaisPosee(q, JSON.stringify(L))) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr
        this.listeCanEnonces[q] =
          (listeTypeDeQuestions[q] === 1
            ? unitesCubes
              ? "Compter les cubes de l'empilement (voir figure)."
              : "Calculer le volume en $\\text{cm}^3$ de l'empilement (voir figure)."
            : unitesCubes
              ? `Compter les cubes manquants pour compléter un grand cube de $${longueur}$ petits cubes d'arête (voir figure).`
              : `Calculer le volume en $\\text{cm}^3$ manquant pour reconstruire un cube de $${longueur}\\text{ cm}$ d'arête (voir figure).`) +
          figure
        q++
      }
      cpt++
    }

    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
