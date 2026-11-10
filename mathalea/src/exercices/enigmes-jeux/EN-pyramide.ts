import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajoutePyramide,
  PyramideNombresElement,
} from '../../lib/customElements/PyramideNombresElement'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  bornesValeurMax,
  generePyramide,
  nbCasesDeLEtage,
  resoutPyramide,
  VALEUR_MAX_PAR_DEFAUT,
  type EtapePyramide,
  type ModePyramide,
  type OperationPyramide,
  type PyramideNombres,
} from '../../lib/outils/pyramideNombres'
import type { Valeur } from '../../lib/types'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const dateDePublication = '10/09/2026'
export const titre = 'Compléter une pyramide de nombres'
export const interactifReady = true

export const uuid = 'fa607'
export const refs = {
  'fr-fr': ['EN-Pyramide'],
  'fr-ch': ['9R1NO6H-11', '9R2NO6H-11', '9R3NO6H-11', 'PRQST04A-3'],
}

/** Nombre d'étages de la pyramide : celui du dessin de référence. */
const NB_ETAGES = 5

/** Le symbole LaTeX de chaque opération, pour écrire un calcul. */
const SYMBOLES_LATEX: Record<OperationPyramide, string> = {
  '+': '+',
  '-': '-',
  '×': '\\times',
  '÷': '\\div',
}

function modeDepuisSup(valeur: unknown): ModePyramide {
  return Math.round(Number(valeur)) === 2 ? 'trous' : 'base'
}

/** Le calcul d'une étape de résolution, écrit pour le mode mathématique. */
function calculDeLEtape(etape: EtapePyramide): string {
  const { operation, gauche, droite, sommet, trouvee } = etape
  const parenthese = ecritureParentheseSiNegatif
  if (trouvee === 'sommet') {
    return `${texNombre(gauche)}${SYMBOLES_LATEX[operation]}${parenthese(droite)}=${miseEnEvidence(texNombre(sommet))}`
  }
  // Une case du bas se retrouve en remontant l'opération : c'est l'opération
  // inverse qui est écrite, avec les deux nombres déjà connus.
  if (trouvee === 'gauche') {
    const inverses: Record<OperationPyramide, string> = {
      '+': `${sommet}-${parenthese(droite)}`,
      '-': `${sommet}+${parenthese(droite)}`,
      '×': `${sommet}\\div${parenthese(droite)}`,
      '÷': `${sommet}\\times${parenthese(droite)}`,
    }
    return `${inverses[operation]}=${miseEnEvidence(gauche)}`
  }
  const inverses: Record<OperationPyramide, string> = {
    '+': `${sommet}-${parenthese(gauche)}`,
    '-': `${gauche}-${parenthese(sommet)}`,
    '×': `${sommet}\\div${parenthese(gauche)}`,
    '÷': `${gauche}\\div${parenthese(sommet)}`,
  }
  return `${inverses[operation]}=${miseEnEvidence(droite)}`
}

/** L'étage (compté depuis le bas, à partir de 1) de la case trouvée. */
function etageDeLEtape(etape: EtapePyramide): number {
  return etape.trouvee === 'sommet' ? etape.etage + 2 : etape.etage + 1
}

/** Le rang, dans son étage, de la case trouvée. */
function rangDeLEtape(etape: EtapePyramide): number {
  return etape.trouvee === 'droite' ? etape.index + 2 : etape.index + 1
}

/**
 * La pyramide de nombres : chaque case est le résultat de l'opération écrite
 * entre les deux cases situées juste en dessous d'elle.
 *
 * L'opération change d'une paire de cases à l'autre, ce qui distingue cette
 * pyramide de la pyramide additive classique : selon les cases données, il
 * faut la descendre autant que la remonter, donc utiliser l'opération inverse.
 *
 * La note est la proportion de cases correctement remplies, sur 5 points (le
 * nombre d'étages de la pyramide) et arrondie à l'entier inférieur : elle est
 * attribuée par `PyramideNombresElement.verifQuestion()`, qui compare chaque
 * case à la solution transmise par `handleAnswers()`. Les valeurs données par
 * l'énoncé, écrites d'avance, ne comptent pas.
 *
 * @author Rémi Angot
 */
export default class PyramideDeNombres extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Nombres donnés',
      2,
      '1 : Toute la ligne du bas est donnée\n2 : Calculs à trous',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres négatifs']
    this.besoinFormulaire3Numerique = ['Plus grand nombre possible', 9999]
    this.sup = 1
    this.sup2 = false
    this.sup3 = VALEUR_MAX_PAR_DEFAUT
    this.nbQuestions = 1
    this.comment =
      'Tous les nombres de la pyramide sont entiers : une division n’est ' +
      'proposée entre deux cases que lorsqu’elle tombe juste. ' +
      'Avec toute la ligne du bas donnée, la pyramide se remplit de bas en ' +
      'haut, chaque case demandant un seul calcul. Avec des calculs à trous, ' +
      'les nombres donnés sont éparpillés et réduits au strict nécessaire : ' +
      'il faut aussi redescendre la pyramide, donc utiliser l’opération ' +
      'inverse de celle qui est écrite. ' +
      'Le plus grand nombre possible borne toutes les cases, celles de ' +
      'l’étage du bas comprises : le baisser resserre les multiplications et ' +
      'fait davantage appel à la soustraction et à la division. ' +
      'Note : la proportion de cases correctement remplies, sur 5 points.'
  }

  nouvelleVersion(): void {
    const mode = modeDepuisSup(this.sup)
    const nombresNegatifs = this.sup2 === true || this.sup2 === 'true'
    const valeurMax = bornesValeurMax(Number(this.sup3))
    this.consigne =
      this.nbQuestions === 1
        ? 'Compléter la pyramide suivante sachant que chaque nombre est le ' +
          'résultat de l’opération effectuée avec les deux nombres se trouvant ' +
          'dans les deux cases juste en dessous.'
        : 'Compléter les pyramides suivantes sachant que chaque nombre est le ' +
          'résultat de l’opération effectuée avec les deux nombres se trouvant ' +
          'dans les deux cases juste en dessous.'

    for (let i = 0; i < this.nbQuestions; i++) {
      const pyramide = generePyramide({
        nbEtages: NB_ETAGES,
        mode,
        nombresNegatifs,
        valeurMax,
      })

      this.listeQuestions[i] = ajoutePyramide(this, i, {
        nbEtages: pyramide.nbEtages,
        operations: pyramide.operations,
        donnees: this.valeursDonnees(pyramide),
        interactivityOn: this.interactif,
        avecNombresNegatifs: nombresNegatifs,
      })

      handleAnswers(this, i, this.reponsesAttendues(pyramide), {
        formatInteractif: PyramideNombresElement.elementTag,
      })

      this.listeCorrections[i] =
        ajoutePyramide(this, i, {
          id: `${PyramideNombresElement.elementTag}Ex${this.numeroExercice ?? 0}Q${i}Correction`,
          nbEtages: pyramide.nbEtages,
          operations: pyramide.operations,
          donnees: this.valeursDonnees(pyramide),
          solution: pyramide.valeurs,
          interactivityOn: false,
        }) + this.texteDesCalculs(pyramide, mode)
    }

    listeQuestionsToContenu(this)
  }

  /** Les valeurs écrites dans l'énoncé, `null` pour une case à trouver. */
  private valeursDonnees(pyramide: PyramideNombres): (number | null)[][] {
    return pyramide.valeurs.map((etage, rang) =>
      etage.map((valeur, index) =>
        pyramide.donnees[rang][index] ? valeur : null,
      ),
    )
  }

  /** Une case à saisir par valeur à trouver : les cases données sont exclues. */
  private reponsesAttendues(pyramide: PyramideNombres): Valeur {
    // Le type `Valeur` ne déclare les clés `LxCy` que jusqu'à `L3C5` : une
    // pyramide plus haute impose donc de les ajouter une à une, comme dans
    // EN-kenken.
    let reponses: Valeur = {}
    for (let etage = 0; etage < pyramide.nbEtages; etage++) {
      const nbCases = nbCasesDeLEtage(etage, pyramide.nbEtages)
      for (let index = 0; index < nbCases; index++) {
        if (pyramide.donnees[etage][index]) continue
        reponses = Object.assign(
          reponses,
          Object.fromEntries([
            [
              `L${pyramide.nbEtages - etage}C${index + 1}`,
              { value: String(pyramide.valeurs[etage][index]) },
            ],
          ]),
        )
      }
    }
    return reponses
  }

  /**
   * Les calculs de la correction.
   *
   * Quand toute la ligne du bas est donnée, ils se lisent étage par étage et
   * sont regroupés sur une ligne par étage. Avec des calculs à trous, l'ordre
   * dans lequel les cases se déduisent est justement ce qu'il faut expliquer :
   * chaque étape occupe alors sa propre ligne et sa case est repérée.
   */
  private texteDesCalculs(
    pyramide: PyramideNombres,
    mode: ModePyramide,
  ): string {
    const { etapes } = resoutPyramide(pyramide, pyramide.donnees)
    if (etapes.length === 0) return ''
    if (mode === 'base') {
      const lignes: string[] = []
      for (let etage = 1; etage < pyramide.nbEtages; etage++) {
        const calculs = etapes
          .filter((etape) => etageDeLEtape(etape) === etage + 1)
          .map((etape) => `$${calculDeLEtape(etape)}$`)
        if (calculs.length > 0) {
          lignes.push(`Étage $${etage + 1}$ : ${calculs.join(' ; ')}.`)
        }
      }
      return `<br>${lignes.join('<br>')}`
    }
    const lignes = etapes.map(
      (etape) =>
        `Étage ${etageDeLEtape(etape)}, case ${rangDeLEtape(etape)} : ` +
        `$${calculDeLEtape(etape)}$.`,
    )
    return (
      '<br>Les cases se trouvent dans cet ordre, en descendant ou en remontant ' +
      `l’opération écrite entre deux cases.<br>${lignes.join('<br>')}`
    )
  }
}
