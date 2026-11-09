// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 69bb5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  ajouteGrimuku,
  GrimukuGrilleElement,
} from '../../lib/customElements/GrimukuGrilleElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  casesAChercher,
  colonneDe,
  formatGrimuku,
  genereGrimuku,
  ligneDe,
  repartitionsPossibles,
  type FlecheGrimuku,
  type GrilleGrimuku,
  type NiveauGrimuku,
} from '../../lib/outils/grimuku'
import type { Valeur } from '../../lib/types'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '06/09/2026'
export const titre = 'Résoudre une grille de grimuku'
export const interactifReady = true

export const uuid = '69bb5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/** Le symbole LaTeX de chaque flèche, pour écrire son étiquette en mode mathématique. */
const SYMBOLES_LATEX: Record<string, string> = {
  droite: '\\rightarrow',
  gauche: '\\leftarrow',
  haut: '\\uparrow',
  bas: '\\downarrow',
}

function formatDepuisSup(valeur: unknown): [number, number] {
  const format = formatGrimuku(valeur)
  return [format.lignes, format.colonnes]
}

function niveauDepuisSup(valeur: unknown): NiveauGrimuku {
  const nombre = Math.round(Number(valeur))
  if (nombre === 2) return 2
  if (nombre === 3) return 3
  return 1
}

/** L'étiquette d'une flèche, écrite pour le mode mathématique. */
function etiquetteMath(fleche: FlecheGrimuku): string {
  const symbole = SYMBOLES_LATEX[fleche.direction]
  return fleche.direction === 'gauche'
    ? `${symbole}\\,${fleche.produit}`
    : `${fleche.produit}\\,${symbole}`
}

/**
 * Le grimuku : compléter une grille de chiffres où le nombre écrit avant chaque
 * flèche est le produit des chiffres des cases qu'elle désigne.
 *
 * Contrairement au kakuro, un même chiffre peut se répéter dans une flèche : le
 * produit 27 sur quatre cases impose par exemple 1, 1, 3 et 9.
 *
 * La note est la proportion de cases correctement remplies, multipliée par le
 * barème de la grille (`formatGrimuku()`) et arrondie à l'entier inférieur :
 * elle est attribuée par `GrimukuGrilleElement.verifQuestion()`, qui compare
 * chaque case à la solution transmise par `handleAnswers()`. Les chiffres
 * écrits d'avance dans l'énoncé ne comptent pas.
 *
 * @author Rémi Angot
 */
export default class GrimukuOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Taille de la grille',
      4,
      '1 : 5 × 5\n2 : 6 × 6\n3 : 7 × 7\n4 : 6 × 9',
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
    this.comment =
      'Le niveau de difficulté joue sur la longueur des flèches, sur le nombre ' +
      'de chiffres déjà écrits dans la grille et sur la longueur du ' +
      'raisonnement nécessaire. Au niveau « facile », les flèches ne couvrent ' +
      'que deux cases et une simple division suffit à chaque étape. Au niveau ' +
      '« moyen », elles en couvrent trois et il faut chercher les répartitions ' +
      'possibles. Au niveau « difficile », elles en couvrent quatre. ' +
      'Un même chiffre peut se répéter dans une flèche : c’est ce qui distingue ' +
      'le grimuku du kakuro. ' +
      'Note : la proportion de cases correctement remplies, sur le barème de ' +
      'la grille (5 points pour une grille 5 × 5, 6 pour une grille 6 × 6, ' +
      '7 pour une grille 7 × 7, 8 pour une grille 6 × 9).'
  }

  nouvelleVersion(): void {
    const [lignes, colonnes] = formatDepuisSup(this.sup)
    const niveau = niveauDepuisSup(this.sup2)
    const grille = genereGrimuku({ lignes, colonnes, niveau })

    const rappelDesRegles = this.sup3 === true || this.sup3 === 'true'
    this.consigne = rappelDesRegles
      ? this.texteRegles(grille)
      : 'Compléter la grille en plaçant un chiffre par case blanche.'

    const donnees: [number, number][] = grille.donnees.map((index) => [
      index,
      grille.solution[index],
    ])

    this.listeQuestions[0] = ajouteGrimuku(this, 0, {
      lignes: grille.lignes,
      colonnes: grille.colonnes,
      grises: grille.grises,
      fleches: grille.fleches,
      donnees,
      interactivityOn: this.interactif,
    })

    handleAnswers(this, 0, this.reponsesAttendues(grille), {
      formatInteractif: GrimukuGrilleElement.elementTag,
    })

    this.listeCorrections[0] =
      this.texteDepart(grille) +
      ajouteGrimuku(this, 0, {
        id: `${GrimukuGrilleElement.elementTag}Ex${this.numeroExercice ?? 0}Q0Correction`,
        lignes: grille.lignes,
        colonnes: grille.colonnes,
        grises: grille.grises,
        fleches: grille.fleches,
        donnees,
        solution: grille.solution,
        interactivityOn: false,
      })

    listeQuestionsToContenu(this)
  }

  /** Rappel des règles du jeu, affiché en consigne. */
  private texteRegles(grille: GrilleGrimuku): string {
    const rappelDesDonnees =
      grille.donnees.length === 0
        ? ''
        : 'Les chiffres déjà écrits sont donnés : ils ne sont pas à trouver.<br>'
    return (
      'Compléter la grille en plaçant un chiffre de 1 à 9 par case blanche.<br>' +
      'Le nombre écrit avant une flèche est le produit des chiffres des cases ' +
      'que cette flèche désigne.<br>' +
      'Un même chiffre peut se répéter à l’intérieur d’une flèche.<br>' +
      rappelDesDonnees
    )
  }

  /** Une case à saisir par chiffre à trouver : les cases données sont exclues. */
  private reponsesAttendues(grille: GrilleGrimuku): Valeur {
    // Le type `Valeur` ne déclare les clés `LxCy` que jusqu'à `L3C5` : une
    // grille plus grande impose donc de les ajouter une à une, comme dans
    // EN-gratte-ciel.
    let reponses: Valeur = {}
    for (const index of casesAChercher(grille)) {
      reponses = Object.assign(
        reponses,
        Object.fromEntries([
          [
            `L${ligneDe(index, grille.colonnes) + 1}C${colonneDe(index, grille.colonnes) + 1}`,
            { value: String(grille.solution[index]) },
          ],
        ]),
      )
    }
    return reponses
  }

  /**
   * La flèche la plus contrainte au départ : c'est par elle qu'il est le plus
   * simple de commencer, la correction s'ouvre donc sur elle.
   */
  private texteDepart(grille: GrilleGrimuku): string {
    let meilleure: { fleche: FlecheGrimuku; repartitions: number[][] } | null =
      null
    for (const fleche of grille.fleches) {
      const repartitions = repartitionsPossibles(grille, fleche)
      if (
        repartitions.length > 0 &&
        (meilleure === null ||
          repartitions.length < meilleure.repartitions.length)
      ) {
        meilleure = { fleche, repartitions }
      }
    }
    if (meilleure === null) return ''
    const etiquette = etiquetteMath(meilleure.fleche)
    if (meilleure.repartitions.length === 1) {
      const chiffres = meilleure.repartitions[0].map(
        (chiffre) => `$${miseEnEvidence(chiffre)}$`,
      )
      const enumeration = `${chiffres.slice(0, -1).join(', ')} puis ${chiffres.at(-1)}`
      return (
        `Commencer par la flèche $${etiquette}$ : ses cases ne peuvent contenir ` +
        `que ${enumeration}.<br>` +
        'Les autres flèches se remplissent ensuite de proche en proche.<br>'
      )
    }
    return (
      `Commencer par la flèche $${etiquette}$ : c’est celle qui offre le moins ` +
      `de possibilités, seulement ${meilleure.repartitions.length}.<br>` +
      'Les autres flèches se remplissent ensuite de proche en proche.<br>'
    )
  }
}
