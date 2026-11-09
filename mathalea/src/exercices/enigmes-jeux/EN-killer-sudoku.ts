import { bleuMathalea } from '../../lib/colors'
import {
  ajouteKillerSudoku,
  KillerSudokuGrilleElement,
} from '../../lib/customElements/KillerSudokuGrilleElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  combinaisonsPossibles,
  dimensionsBloc,
  genereKillerSudoku,
  tailleKiller,
  type GrilleKiller,
  type NiveauKiller,
} from '../../lib/outils/killerSudoku'
import type { Valeur } from '../../lib/types'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const dateDePublication = '09/10/2026'
export const titre = 'Résoudre une grille de Killer Sudoku'
export const interactifReady = true

export const uuid = '4f449'
export const refs = {
  'fr-fr': ['EN-KillerSudoku'],
  'fr-ch': ['9R1NO6H-13', '9R2NO6H-13', '9R3NO6H-13'],
}

function niveauDepuisSup(valeur: unknown): NiveauKiller {
  const nombre = Math.round(Number(valeur))
  if (nombre === 2) return 2
  if (nombre === 3) return 3
  return 1
}

/** Liste « a, b et c » de nombres mis en évidence. */
function enumeration(nombres: number[]): string {
  const mis = nombres.map(
    (nombre) => `$${miseEnEvidence(nombre, bleuMathalea)}$`,
  )
  return mis.length === 1
    ? mis[0]
    : `${mis.slice(0, -1).join(', ')} et ${mis.at(-1)}`
}

/**
 * Le Killer Sudoku : compléter un sudoku découpé en cages, chaque cage
 * annonçant la somme de ses nombres, qui sont tous différents.
 *
 * La note est la proportion de cases correctement remplies, multipliée par le
 * barème de la grille (sa taille, via `tailleKiller()`) et arrondie à l'entier
 * inférieur : elle est attribuée par `KillerSudokuGrilleElement.verifQuestion()`,
 * qui compare chaque case à la solution transmise par `handleAnswers()`. Aucun
 * nombre n'est donné dans l'énoncé : toutes les cases comptent.
 *
 * @author Rémi Angot
 */
export default class KillerSudoku extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Taille de la grille',
      3,
      '1 : 4 × 4\n2 : 6 × 6\n3 : 9 × 9',
    ]
    this.besoinFormulaire2Numerique = [
      'Niveau de difficulté',
      3,
      '1 : facile\n2 : moyen\n3 : difficile',
    ]
    this.besoinFormulaire3CaseACocher = ['Rappeler les règles']
    this.sup = 2
    this.sup2 = 1
    this.sup3 = true
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.reponseCourteDisponible = false // La réponse est une grille complète à remplir.
    this.comment =
      'Le niveau de difficulté joue sur la taille des cages et sur le raisonnement ' +
      `nécessaire pour déterminer un nombre${sp()}: le niveau « facile » se résout avec ` +
      'des cages de deux ou trois cases et des éliminations simples, le niveau ' +
      '« moyen » demande de croiser les combinaisons possibles de plusieurs cages, ' +
      'le niveau « difficile » demande en plus de raisonner sur la somme des nombres ' +
      'd’une ligne, d’une colonne ou d’un bloc. Une grille 4 × 4 est trop petite ' +
      `pour exiger un raisonnement aussi long${sp()}: le niveau « difficile » y reste ` +
      'abordable. ' +
      'Les blocs sont de 2 × 2 cases en 4 × 4, de 2 lignes sur 3 colonnes en 6 × 6 ' +
      'et de 3 × 3 cases en 9 × 9. ' +
      `Note${sp()}: la proportion de cases correctement remplies, sur autant de ` +
      'points que la taille de la grille.'
  }

  nouvelleVersion(): void {
    const taille = tailleKiller(this.sup)
    const niveau = niveauDepuisSup(this.sup2)
    const grille = genereKillerSudoku({ taille, niveau })

    const rappelDesRegles = this.sup3 === true || this.sup3 === 'true'
    this.consigne = rappelDesRegles
      ? this.texteRegles(taille)
      : `Compléter la grille avec les nombres de $1$ à $${taille}$.`

    this.listeQuestions[0] = ajouteKillerSudoku(this, 0, {
      taille,
      cages: grille.cages,
      interactivityOn: this.interactif,
    })

    handleAnswers(this, 0, this.reponsesAttendues(grille), {
      formatInteractif: KillerSudokuGrilleElement.elementTag,
    })

    this.listeCorrections[0] =
      this.texteDepart(grille) +
      ajouteKillerSudoku(this, 0, {
        id: `${KillerSudokuGrilleElement.elementTag}Ex${this.numeroExercice ?? 0}Q0Correction`,
        taille,
        cages: grille.cages,
        solution: grille.solution,
        interactivityOn: false,
      })

    listeQuestionsToContenu(this)
  }

  /** Rappel des règles du jeu, affiché en consigne. */
  private texteRegles(taille: number): string {
    const [hauteur, largeur] = dimensionsBloc(taille)
    return (
      `Compléter la grille avec les nombres de $1$ à $${taille}$.<br>` +
      'Ne pas écrire deux fois le même nombre dans une ligne, dans une colonne ni dans un bloc ' +
      `(les blocs sont de $${hauteur}\\times${largeur}$ cases et entourés d’un trait épais).<br>` +
      'Dans chaque zone entourée de pointillés, appelée cage, le nombre inscrit ' +
      'en haut à gauche est la somme des nombres de la cage.<br>' +
      'Un même nombre ne peut pas être écrit deux fois dans une cage.<br>' +
      `Aucun nombre n’est donné${sp()}: une cage d’une seule case donne directement son nombre.<br>`
    )
  }

  /** Une case à saisir par case de la grille : aucun nombre n'est donné. */
  private reponsesAttendues(grille: GrilleKiller): Valeur {
    // Le type `Valeur` ne déclare les clés `LxCy` que jusqu'à `L3C5` : une
    // grille plus grande impose donc de les ajouter une à une, comme dans EN-gratte-ciel.
    let reponses: Valeur = {}
    for (let ligne = 0; ligne < grille.taille; ligne++) {
      for (let colonne = 0; colonne < grille.taille; colonne++) {
        reponses = Object.assign(
          reponses,
          Object.fromEntries([
            [
              `L${ligne + 1}C${colonne + 1}`,
              { value: String(grille.solution[ligne][colonne]) },
            ],
          ]),
        )
      }
    }
    return reponses
  }

  /**
   * Par où commencer : une cage dont la somme n'a qu'une décomposition en
   * nombres différents, à défaut une cage d'une seule case, à défaut la cage
   * qui offre le moins de décompositions.
   */
  private texteDepart(grille: GrilleKiller): string {
    const decompositions = (cage: GrilleKiller['cages'][number]) =>
      combinaisonsPossibles(cage.cases.length, cage.somme, grille.taille)
    const composees = grille.cages.filter((cage) => cage.cases.length > 1)
    const uniques = composees.filter(
      (cage) => decompositions(cage).length === 1,
    )
    if (uniques.length > 0) {
      // La plus grande cage à décomposition unique apporte le plus d'information.
      const cage = uniques.reduce((plusGrande, candidate) =>
        candidate.cases.length > plusGrande.cases.length
          ? candidate
          : plusGrande,
      )
      return (
        `Commencer par la cage de somme $${cage.somme}$ et de $${cage.cases.length}$ cases${sp()}: ` +
        `elle ne peut contenir que ${enumeration(decompositions(cage)[0])}.<br>` +
        'Les autres cages se remplissent ensuite de proche en proche.<br>'
      )
    }
    const simples = grille.cages.filter((cage) => cage.cases.length === 1)
    if (simples.length > 0) {
      return (
        `Commencer par la cage d’une seule case de somme $${simples[0].somme}$${sp()}: ` +
        'elle contient directement ce nombre.<br>' +
        'Les autres cages se remplissent ensuite de proche en proche.<br>'
      )
    }
    if (composees.length === 0) return ''
    const cage = composees.reduce((meilleure, candidate) =>
      decompositions(candidate).length < decompositions(meilleure).length
        ? candidate
        : meilleure,
    )
    return (
      `Commencer par la cage de somme $${cage.somme}$ et de $${cage.cases.length}$ cases${sp()}: ` +
      `c’est celle qui offre le moins de possibilités, seulement $${decompositions(cage).length}$.<br>` +
      'Les autres cages se remplissent ensuite de proche en proche.<br>'
    )
  }
}
