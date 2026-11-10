import { bleuMathalea } from '../../lib/colors'
import {
  ajouteEtoileCalculs,
  EtoileCalculsElement,
  operateurLatex,
  type BrancheEtoile,
  type OperationEtoile,
} from '../../lib/customElements/EtoileCalculsElement'
import { cleDeLaCase } from '../../lib/customElements/grilleDeChiffres'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleur } from '../../lib/outils/embellissements'
import type { Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const dateDePublication = '10/09/2026'
export const titre = 'Compléter une étoile de calculs'
export const interactifReady = true

export const uuid = 'e7f3a'
export const refs = {
  'fr-fr': ['EN-EtoileCalculs'],
  'fr-ch': ['9R1NO6H-10', '9R2NO6H-10', '9R3NO6H-10'],
}

/**
 * Les familles de calculs, dans l'ordre de l'aide du formulaire des poids : c'est
 * cet ordre, décrit en « `N :` », que `parseCasFormulaireTexte()` lit pour
 * transformer le champ texte en cases à cocher pondérées (voir `SupParameterGroup`).
 */
const TYPES_DE_CALCUL: OperationEtoile[] = [
  'ajout',
  'soustraction',
  'multiplication',
  'multiplicationCombinee',
]
/** Numéro du cas « Mélange » dans l'aide : juste après le dernier type réel. */
const MELANGE_TYPES_DE_CALCUL = TYPES_DE_CALCUL.length + 1

/** Le nombre de flèches, borné entre 4 et 12. */
function nbFlechesDepuisSup(valeur: unknown): number {
  const nombre = Math.round(Number(valeur))
  if (!Number.isFinite(nombre)) return 8
  return Math.min(12, Math.max(4, nombre))
}

/** Un centre composé, pour qu'une flèche « $\times a$ » soit toujours possible. */
function tireCentre(): number {
  return randint(3, 9) * randint(9, 14)
}

/** Les diviseurs de `centre` compris entre 2 et 9. */
function petitsDiviseurs(centre: number): number[] {
  return [2, 3, 4, 5, 6, 7, 8, 9].filter((diviseur) => centre % diviseur === 0)
}

/**
 * Toutes les flèches distinctes que peut porter une famille pour ce centre,
 * nombre caché entier positif. Bornée : au plus 18 pour `ajout`/`soustraction`,
 * 8 pour `multiplication`, 16 pour `multiplicationCombinee` (« $\times a + b$ »
 * ou « $\times a - b$ »), ce qui permet à `choixBranche()` d'en écarter sans
 * jamais retomber à court d'options pour `ajout`/`soustraction`, seules
 * familles utilisées en repli.
 */
function branchesPossibles(
  centre: number,
  categorie: OperationEtoile,
): BrancheEtoile[] {
  if (categorie === 'ajout') {
    const max = Math.min(19, centre - 1)
    const branches: BrancheEtoile[] = []
    for (let terme = 2; terme <= max; terme++) {
      branches.push({
        operation: 'ajout',
        facteur: 1,
        terme,
        signe: 1,
        reponse: centre - terme,
      })
    }
    return branches
  }
  if (categorie === 'soustraction') {
    const branches: BrancheEtoile[] = []
    for (let terme = 2; terme <= 19; terme++) {
      branches.push({
        operation: 'soustraction',
        facteur: 1,
        terme,
        signe: -1,
        reponse: centre + terme,
      })
    }
    return branches
  }
  if (categorie === 'multiplication') {
    return petitsDiviseurs(centre).map((facteur) => ({
      operation: 'multiplication',
      facteur,
      terme: 0,
      signe: 1,
      reponse: centre / facteur,
    }))
  }
  const facteursPossibles = [2, 3, 4, 5, 6, 7, 8, 9].filter(
    (facteur) => centre % facteur !== 0 && centre >= facteur * 2,
  )
  const branches: BrancheEtoile[] = []
  for (const facteur of facteursPossibles) {
    const reste = centre % facteur
    branches.push({
      operation: 'multiplicationCombinee',
      facteur,
      terme: reste,
      signe: 1,
      reponse: (centre - reste) / facteur,
    })
    const terme = facteur - reste
    branches.push({
      operation: 'multiplicationCombinee',
      facteur,
      terme,
      signe: -1,
      reponse: (centre + terme) / facteur,
    })
  }
  return branches
}

/** Ce qui distingue deux flèches à l'affichage : évite les doublons évidents. */
function signature(branche: BrancheEtoile): string {
  return `${branche.operation}|${branche.facteur}|${branche.signe}|${branche.terme}`
}

/**
 * Tire une flèche inédite de la famille demandée. Quand cette famille est
 * épuisée pour ce centre (par exemple un `multiplication` réclamé plus de fois
 * qu'il n'y a de diviseurs disponibles entre 2 et 9), se rabat sur une autre
 * famille plutôt que de répéter une flèche déjà posée dans l'étoile : deux
 * flèches identiques donneraient deux fois la même question à l'élève.
 */
function choixBranche(
  centre: number,
  categorie: OperationEtoile,
  vues: Set<string>,
): BrancheEtoile {
  const ordre = [categorie, ...TYPES_DE_CALCUL.filter((c) => c !== categorie)]
  for (const famille of ordre) {
    const disponibles = branchesPossibles(centre, famille).filter(
      (branche) => !vues.has(signature(branche)),
    )
    if (disponibles.length > 0) return choice(disponibles)
  }
  // Toutes les familles sont épuisées pour ce centre : n'arrive jamais en
  // pratique (ajout et soustraction offrent chacune jusqu'à 18 flèches, pour
  // au plus 12 flèches par étoile), mais évite de renvoyer `undefined`.
  return choice(branchesPossibles(centre, categorie))
}

/** Un centre et ses flèches, jamais deux fois la même question. */
function genereEtoile(operations: OperationEtoile[]): {
  centre: number
  branches: BrancheEtoile[]
} {
  const centre = tireCentre()
  const branches: BrancheEtoile[] = []
  const vues = new Set<string>()
  for (const categorie of operations) {
    const branche = choixBranche(centre, categorie, vues)
    vues.add(signature(branche))
    branches.push(branche)
  }
  return { centre, branches }
}

/** L'égalité vérifiée par une flèche, réponse mise en évidence. */
function egalite(branche: BrancheEtoile, centre: number): string {
  const reponse = miseEnEvidence(branche.reponse)
  switch (branche.operation) {
    case 'ajout':
      return `${reponse} + ${branche.terme} = ${centre}`
    case 'soustraction':
      return `${reponse} - ${branche.terme} = ${centre}`
    case 'multiplication':
      return `${reponse} \\times ${branche.facteur} = ${centre}`
    case 'multiplicationCombinee':
      return `${reponse} \\times ${branche.facteur} ${branche.signe > 0 ? '+' : '-'} ${branche.terme} = ${centre}`
  }
}

/** La correction : le rappel de la méthode, une ligne par flèche, puis l'étoile. */
function texteCorrection(centre: number, branches: BrancheEtoile[]): string {
  const intro = texteEnCouleur(
    `Pour retrouver un nombre caché, effectuer l’opération inverse à partir de $${centre}$.`,
    bleuMathalea,
  )
  const lignes = branches.map((branche) =>
    texteEnCouleur(
      `Flèche «${sp()}$${operateurLatex(branche)}$${sp()}» : $${egalite(branche, centre)}$.`,
      bleuMathalea,
    ),
  )
  if (context.isHtml) {
    return `${intro}<ul>${lignes.map((ligne) => `<li>${ligne}</li>`).join('')}</ul>`
  }
  return `${intro}\\begin{itemize}${lignes.map((ligne) => `\\item ${ligne}`).join('')}\\end{itemize}`
}

/**
 * L'étoile de calculs : un nombre entier au centre, entouré de flèches qui
 * portent chacune une opération à appliquer à un nombre caché pour retomber sur
 * le centre. Tous les nombres à trouver sont des entiers positifs.
 *
 * Le score est d'un point par flèche correctement complétée : il est attribué
 * par `EtoileCalculsElement.verifQuestion()`, qui compare chaque saisie à la
 * réponse transmise par `handleAnswers()`.
 *
 * @author Rémi Angot
 */
export default class EtoileDesCalculs extends Exercice {
  constructor() {
    super()
    // Un numéro par ligne, reconnu par `parseCasFormulaireTexte()` : le
    // formulaire affiche donc une case à cocher par type de calcul, avec un
    // réglage de poids d'apparition à côté — voir `SupParameterGroup.svelte`,
    // à la manière de `3L11` (« Forme de développement »).
    this.besoinFormulaireTexte = [
      'Fréquence de chaque calcul',
      'Nombres séparés par des tirets :\n' +
        '1 : addition\n' +
        '2 : soustraction\n' +
        '3 : multiplication\n' +
        '4 : multiplication puis addition ou soustraction\n' +
        `${MELANGE_TYPES_DE_CALCUL} : Mélange`,
    ]
    this.besoinFormulaire2Numerique = ['Nombre de flèches par étoile', 12]
    this.sup = MELANGE_TYPES_DE_CALCUL
    this.sup2 = 8
    this.nbQuestions = 1
    this.comment =
      'Chaque flèche indique une opération à appliquer à un nombre caché pour ' +
      'obtenir le nombre inscrit au centre de l’étoile : il faut donc effectuer ' +
      'l’opération inverse. Tous les nombres à trouver sont des entiers ' +
      'positifs. Le premier paramètre choisit les types de calcul à faire ' +
      'apparaître et leur poids respectif, le second le nombre de flèches ' +
      '(de 4 à 12). Score : un point par flèche correctement complétée.'
  }

  nouvelleVersion(): void {
    const nbFleches = nbFlechesDepuisSup(this.sup2)
    // Une seule pioche pondérée pour toutes les flèches de toutes les étoiles :
    // `gestionnaireFormulaireTexte()` respecte alors le poids de chaque type sur
    // l'ensemble de l'exercice, pas étoile par étoile.
    const operations = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: TYPES_DE_CALCUL.length,
      defaut: MELANGE_TYPES_DE_CALCUL,
      listeOfCase: TYPES_DE_CALCUL,
      nbQuestions: this.nbQuestions * nbFleches,
      melange: MELANGE_TYPES_DE_CALCUL,
    }) as OperationEtoile[]

    this.consigne =
      'Compléter les pointillés de manière à obtenir le résultat figurant au ' +
      'milieu de l’étoile.<br>Tous les nombres à trouver sont des entiers.'

    for (let question = 0; question < this.nbQuestions; question++) {
      const operationsEtoile = Array.from(
        { length: nbFleches },
        (_, index) =>
          operations[(question * nbFleches + index) % operations.length],
      )
      const { centre, branches } = genereEtoile(operationsEtoile)

      this.listeQuestions[question] = ajouteEtoileCalculs(this, question, {
        centre,
        branches,
        interactivityOn: this.interactif,
      })

      // Le type `Valeur` ne déclare les clés `LxCy` que jusqu'à `L3C5` : les
      // flèches (jusqu'à douze) sont donc ajoutées une à une, comme dans
      // `EN-gratte-ciel`.
      let reponses: Valeur = {}
      branches.forEach((branche, index) => {
        reponses = Object.assign(
          reponses,
          Object.fromEntries([
            [cleDeLaCase(0, index), { value: String(branche.reponse) }],
          ]),
        )
      })
      handleAnswers(this, question, reponses, {
        formatInteractif: EtoileCalculsElement.elementTag,
      })

      this.listeCorrections[question] =
        texteCorrection(centre, branches) +
        ajouteEtoileCalculs(this, question, {
          id: `${EtoileCalculsElement.elementTag}Ex${this.numeroExercice ?? 0}Q${question}Correction`,
          centre,
          branches,
          montreSolution: true,
          interactivityOn: false,
        })
    }

    listeQuestionsToContenu(this)
  }
}
