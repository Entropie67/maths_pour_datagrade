import {
  ajouteKenKen,
  KenKenGrilleElement,
} from '../../lib/customElements/KenKenGrilleElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  genereKenKen,
  OPERATIONS_KENKEN,
  repartitionsPossibles,
  tailleKenKen,
  type CageKenKen,
  type GrilleKenKen,
  type NiveauKenKen,
  type OperationKenKen,
} from '../../lib/outils/kenken'
import type { Valeur } from '../../lib/types'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const dateDePublication = '06/09/2026'
export const titre = 'Résoudre une grille de KenKen'
export const interactifReady = true

export const uuid = '5b4fa'
export const refs = {
  'fr-fr': ['EN-KenKen'],
  'fr-ch': ['9R1NO6H-12', '9R2NO6H-12', '9R3NO6H-12'],
}

/** Le symbole LaTeX de chaque opération, pour écrire une étiquette de cage en mode mathématique. */
const SYMBOLES_LATEX: Record<string, string> = {
  '+': '+',
  '-': '-',
  '×': '\\times',
  '÷': '\\div',
  '=': '',
}

/** L'étiquette d'une cage, écrite pour le mode mathématique. */
function etiquetteMath(cage: CageKenKen): string {
  return `${cage.resultat}${SYMBOLES_LATEX[cage.operation]}`
}

/** Le nom de chaque opération, article compris, pour le rappel des règles. */
const NOMS_DES_OPERATIONS: Record<string, string> = {
  '+': 'l’addition',
  '-': 'la soustraction',
  '×': 'la multiplication',
  '÷': 'la division',
}

function tailleDepuisSup(valeur: unknown): number {
  return tailleKenKen(valeur)
}

/** Le paramètre est une suite de numéros d'opérations séparés par des tirets. */
function operationsDepuisSup(valeur: unknown): OperationKenKen[] {
  const numeros = String(valeur ?? '')
    .split('-')
    .map((numero) => Math.round(Number(numero.trim())))
  const operations = OPERATIONS_KENKEN.filter((_, rang) =>
    numeros.includes(rang + 1),
  )
  return operations.length > 0 ? operations : ['+']
}

function niveauDepuisSup(valeur: unknown): NiveauKenKen {
  const nombre = Math.round(Number(valeur))
  if (nombre === 2) return 2
  if (nombre === 3) return 3
  return 1
}

/**
 * Le KenKen : compléter un carré latin découpé en cages, chaque cage annonçant
 * le résultat obtenu en combinant ses cases avec l'opération indiquée.
 *
 * La note est la proportion de cases correctement remplies, multipliée par le
 * barème de la grille (sa taille, via `tailleKenKen()`) et arrondie à
 * l'entier inférieur : elle est attribuée par `KenKenGrilleElement.verifQuestion()`,
 * qui compare chaque case à la solution transmise par `handleAnswers()`. Les
 * valeurs données par l'énoncé, écrites d'avance, ne comptent pas.
 *
 * @author Rémi Angot
 */
export default class KenKen extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Taille de la grille',
      4,
      '1 : 3 × 3\n2 : 4 × 4\n3 : 5 × 5\n4 : 6 × 6',
    ]
    this.besoinFormulaire2Texte = [
      'Choix des opérations',
      'Nombres séparés par des tirets  :\n' +
        '1 : Addition\n2 : Soustraction\n3 : Multiplication\n4 : Division',
    ]
    this.besoinFormulaire3Numerique = [
      'Niveau de difficulté',
      3,
      '1 : facile\n2 : moyen\n3 : difficile',
    ]
    this.besoinFormulaire4CaseACocher = ['Rappeler les règles']
    this.sup = 2
    this.sup2 = '1-2-3-4'
    this.sup3 = 1
    this.sup4 = true
    this.nbQuestions = 1
    // La réponse est une grille à compléter : pas de réponse courte
    this.reponseCourteDisponible = false
    this.nbQuestionsModifiable = false
    this.comment =
      'Le niveau de difficulté joue sur la taille des cages, sur le nombre de ' +
      'valeurs déjà écrites dans la grille et sur la longueur du raisonnement ' +
      `nécessaire pour déterminer un nombre${sp()}: le niveau « facile » se résout ` +
      'par simples éliminations, le niveau « difficile » demande de croiser ' +
      'plusieurs contraintes. Une grille 3 × 3 reste toujours abordable, elle ' +
      'est trop petite pour exiger un long raisonnement. ' +
      'La soustraction et la division ne sont utilisées que dans les cages de ' +
      `deux cases, et la division seulement quand elle tombe juste${sp()}: choisir ` +
      'ces seules opérations donne donc une grille faite de cages de deux cases. ' +
      `Note${sp()}: la proportion de cases correctement remplies, sur autant de ` +
      'points que la taille de la grille.'
  }

  nouvelleVersion(): void {
    const taille = tailleDepuisSup(this.sup)
    const operations = operationsDepuisSup(this.sup2)
    const niveau = niveauDepuisSup(this.sup3)
    const grille = genereKenKen({ taille, operations, niveau })

    const rappelDesRegles = this.sup4 === true || this.sup4 === 'true'
    this.consigne = rappelDesRegles
      ? this.texteRegles(grille)
      : `Compléter la grille avec les nombres de $1$ à $${taille}$.`

    this.listeQuestions[0] = ajouteKenKen(this, 0, {
      taille,
      cages: grille.cages,
      interactivityOn: this.interactif,
    })

    handleAnswers(this, 0, this.reponsesAttendues(grille), {
      formatInteractif: KenKenGrilleElement.elementTag,
    })

    this.listeCorrections[0] =
      this.texteDepart(grille) +
      ajouteKenKen(this, 0, {
        id: `${KenKenGrilleElement.elementTag}Ex${this.numeroExercice ?? 0}Q0Correction`,
        taille,
        cages: grille.cages,
        solution: grille.solution,
        interactivityOn: false,
      })

    listeQuestionsToContenu(this)
  }

  /** Rappel des règles du jeu, affiché en consigne. */
  private texteRegles(grille: GrilleKenKen): string {
    const utilisees = new Set(grille.cages.map((cage) => cage.operation))
    const operations = OPERATIONS_KENKEN.filter((operation) =>
      utilisees.has(operation),
    ).map((operation) => NOMS_DES_OPERATIONS[operation])
    const listeDesOperations =
      operations.length <= 1
        ? (operations[0] ?? '')
        : `${operations.slice(0, -1).join(', ')} et ${operations.at(-1)}`
    const donnees = grille.cages.filter((cage) => cage.operation === '=').length
    const rappelDesDonnees =
      donnees === 0
        ? ''
        : `Les nombres déjà écrits sont donnés${sp()}: ils ne sont pas à trouver.<br>`
    // Une grille sans aucune cage composée n'a rien à expliquer sur les
    // opérations : le cas se produit quand les opérations choisies sont trop
    // rares pour habiller la moindre cage.
    const regleDesCages =
      listeDesOperations === ''
        ? ''
        : 'Dans chaque zone entourée d’un trait épais, appelée cage, le nombre inscrit ' +
          'en haut à gauche est le résultat obtenu en combinant les nombres de la cage ' +
          `avec l’opération indiquée${sp()}: ici ${listeDesOperations}.<br>` +
          'L’ordre des nombres à l’intérieur d’une cage n’a pas d’importance.<br>'
    return (
      `Compléter la grille avec les nombres de $1$ à $${grille.taille}$.<br>` +
      'Ne pas écrire deux fois le même nombre dans une ligne ni dans une colonne.<br>' +
      regleDesCages +
      rappelDesDonnees
    )
  }

  /** Une case à saisir par valeur à trouver : les cases données sont exclues. */
  private reponsesAttendues(grille: GrilleKenKen): Valeur {
    const donnees = new Set(
      grille.cages
        .filter((cage) => cage.operation === '=')
        .map((cage) => cage.cases[0]),
    )
    // Le type `Valeur` ne déclare les clés `LxCy` que jusqu'à `L3C5` : une
    // grille 6 × 6 impose donc de les ajouter une à une, comme dans EN-gratte-ciel.
    let reponses: Valeur = {}
    for (let ligne = 0; ligne < grille.taille; ligne++) {
      for (let colonne = 0; colonne < grille.taille; colonne++) {
        if (donnees.has(ligne * grille.taille + colonne)) continue
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
   * La cage la plus contrainte au départ : c'est par elle qu'il est le plus
   * simple de commencer, la correction s'ouvre donc sur elle.
   */
  private texteDepart(grille: GrilleKenKen): string {
    let meilleure: { cage: CageKenKen; repartitions: number[][] } | null = null
    for (const cage of grille.cages) {
      if (cage.cases.length < 2) continue
      const repartitions = repartitionsPossibles(grille, cage)
      if (
        repartitions.length > 0 &&
        (meilleure === null ||
          repartitions.length < meilleure.repartitions.length)
      ) {
        meilleure = { cage, repartitions }
      }
    }
    if (meilleure === null) return ''
    const etiquette = etiquetteMath(meilleure.cage)
    if (meilleure.repartitions.length === 1) {
      const nombres = [...meilleure.repartitions[0]]
        .sort((premier, second) => premier - second)
        .map((nombre) => `$${miseEnEvidence(nombre)}$`)
      const enumeration = `${nombres.slice(0, -1).join(', ')} et ${nombres.at(-1)}`
      return (
        `Commencer par la cage $${etiquette}$${sp()}: elle ne peut contenir que ` +
        `${enumeration}.<br>` +
        'Les autres cages se remplissent ensuite de proche en proche.<br>'
      )
    }
    return (
      `Commencer par la cage $${etiquette}$${sp()}: c’est celle qui offre le moins ` +
      `de possibilités, seulement $${meilleure.repartitions.length}$.<br>` +
      'Les autres cages se remplissent ensuite de proche en proche.<br>'
    )
  }
}
