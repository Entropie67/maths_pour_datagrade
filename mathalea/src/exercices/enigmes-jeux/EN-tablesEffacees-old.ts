// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 34c33 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { bleuMathalea } from '../../lib/colors'
import {
  ajouteTablesEffacees,
  TablesEffaceesGrilleElement,
} from '../../lib/customElements/TablesEffaceesGrilleElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texteEnCouleur } from '../../lib/outils/embellissements'
import {
  amorceCorrection,
  coteComplet,
  genereTablesEffacees,
  solutionComplete,
  toutesLesCases,
  valeurCase,
  type GrilleTables,
} from '../../lib/outils/tablesEffacees'
import type { Valeur } from '../../lib/types'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '07/09/2026'
export const titre = 'Compléter des tables de multiplication effacées'
export const interactifReady = true

export const uuid = '34c33'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/** Les tailles proposées, dans l'ordre du formulaire. */
const TAILLES = [2, 3, 4, 5, 6]

function tailleDepuisSup(valeur: unknown): number {
  const rang = Math.round(Number(valeur))
  const indice = Number.isFinite(rang) ? rang : 3
  return TAILLES[Math.min(TAILLES.length, Math.max(1, indice)) - 1]
}

/**
 * Compléter un tableau de multiplication dont on a effacé le contenu de
 * certaines cases : première ligne et première colonne de facteurs, cases
 * intérieures égales à leur produit.
 *
 * L'exercice rapporte un point par case correctement remplie : le score est
 * attribué par `TablesEffaceesGrilleElement.verifQuestion()`, qui compare chaque
 * case à la solution transmise par `handleAnswers()`. Les valeurs données par
 * l'énoncé, écrites d'avance, ne comptent pas.
 *
 * @author Rémi Angot
 */
export default class TablesEffaceesOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Taille de la table',
      TAILLES.length,
      '1 : 2\n2 : 3\n3 : 4\n4 : 5\n5 : 6',
    ]
    this.sup = 3
    this.nbQuestions = 1
    this.comment =
      'Compléter un tableau de multiplication dont certaines cases sont ' +
      'effacées, facteurs compris. La grille a toujours une solution unique, ' +
      'atteignable sans essais : par divisions successives et en évitant de ' +
      'répéter un nombre sur une ligne ou une colonne. Score : un point par ' +
      'case correctement complétée.'
  }

  nouvelleVersion(): void {
    const taille = tailleDepuisSup(this.sup)
    this.consigne =
      'Compléter ces tables de multiplication dont on a effacé le contenu de ' +
      'certaines cases.<br>' +
      'Chaque nombre à l’intérieur du tableau est le produit du nombre situé ' +
      'au début de sa ligne par celui situé en haut de sa colonne.<br>' +
      'Tous les nombres sont des entiers strictement positifs, et un même ' +
      'nombre ne peut pas apparaître deux fois sur une même ligne ou une même ' +
      'colonne.'

    for (let question = 0; question < this.nbQuestions; question++) {
      const grille = genereTablesEffacees({ taille })
      const empreinte = solutionComplete(grille).join('-') + '|' + grille.donnees.join('-')
      if (!this.questionJamaisPosee(question, empreinte)) {
        question--
        continue
      }

      const donnees: [number, number][] = grille.donnees.map((index) => [
        index,
        valeurCase(grille, index) as number,
      ])

      // L'énoncé ne reçoit jamais la solution : hors interactivité, les cases à
      // trouver restent vides ; seule la correction affiche les valeurs.
      this.listeQuestions[question] = ajouteTablesEffacees(this, question, {
        taille,
        donnees,
        interactivityOn: this.interactif,
      })

      handleAnswers(this, question, this.reponsesAttendues(grille), {
        formatInteractif: TablesEffaceesGrilleElement.elementTag,
      })

      this.listeCorrections[question] =
        texteEnCouleur(
          'Compléter d’abord chaque colonne dont le facteur du haut est ' +
            'connu, en divisant les produits donnés par ce facteur ; faire de ' +
            'même avec les lignes, puis recouper les deux jusqu’à remplir la ' +
            'table.',
          bleuMathalea,
        ) +
        '<br>' +
        texteEnCouleur(amorceCorrection(grille), bleuMathalea) +
        ajouteTablesEffacees(this, question, {
          id: `${TablesEffaceesGrilleElement.elementTag}Ex${this.numeroExercice ?? 0}Q${question}Correction`,
          taille,
          donnees,
          solution: solutionComplete(grille),
          interactivityOn: false,
        })
    }

    listeQuestionsToContenu(this)
  }

  /** Une case à saisir par valeur à trouver : les cases données sont exclues. */
  private reponsesAttendues(grille: GrilleTables): Valeur {
    const cote = coteComplet(grille.taille)
    const donnees = new Set(grille.donnees)
    // Le type `Valeur` ne déclare les clés `LxCy` que jusqu'à `L3C5` : une
    // grande grille impose donc de les ajouter une à une, comme dans
    // EN-gratte-ciel et EN-kenken.
    let reponses: Valeur = {}
    for (const index of toutesLesCases(grille.taille)) {
      if (donnees.has(index)) continue
      const ligne = Math.floor(index / cote)
      const colonne = index % cote
      reponses = Object.assign(
        reponses,
        Object.fromEntries([
          [
            `L${ligne + 1}C${colonne + 1}`,
            { value: String(valeurCase(grille, index)) },
          ],
        ]),
      )
    }
    return reponses
  }
}
