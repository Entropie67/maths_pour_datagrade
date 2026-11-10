import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '1f28c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer si un point appartient à une parabole'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7FMs2026 extends ExerciceQcmACourt {
  /** Le point de la bonne réponse du QCM, de la forme « $C(3\\,;\\,10)$ ». */
  private pointDeLaCourbe(): {
    nom: string
    abscisse: string
    ordonnee: string
  } {
    const [, nom, abscisse, ordonnee] =
      /^\$(\w)\(([^;]*?)\\,;\\,([^)]*)\)\$$/.exec(this.reponses[0]) ?? []
    return { nom, abscisse, ordonnee: ordonnee.replace(/\\,/g, '') }
  }

  private appliquerLesValeurs(
    a: number,
    alpha: number,
    beta: number,
    xTest: number,
    nomCorrectOrigine?: string,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const aStr = texNombre(a, 1)
    const alphaOppStr = ecritureAlgebrique(-alpha)
    const betaStr = ecritureAlgebrique(beta)
    const xTestStr = texNombre(xTest, 1)

    // Calcul de l'ordonnée correcte
    const diff = xTest - alpha
    const yTest = a * diff * diff + beta

    this.enonce = `On considère une fonction $f$ définie sur $\\mathbb{R}$ par :<br>`
    this.enonce += `\\[ f(x) = ${aStr}(x ${alphaOppStr})^2 ${betaStr} \\]<br>`
    this.enonce += `On note $\\mathcal{C}_f$ sa courbe représentative dans un repère.<br>`
    this.enonce += `Un seul des quatre points ci-dessous appartient à la courbe $\\mathcal{C}_f$. Lequel ?`

    let nomCorrect: string
    let correct: string
    let d1: string, d2: string, d3: string

    // Si on a forcé les réponses (pour la version originale calquée sur l'image)
    if (
      repOrigine &&
      d1Origine &&
      d2Origine &&
      d3Origine &&
      nomCorrectOrigine
    ) {
      nomCorrect = nomCorrectOrigine
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      // On tire 4 noms de points au hasard
      const noms = shuffle([
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'M',
        'N',
        'P',
      ])
      nomCorrect = noms[0]

      // La bonne réponse calculée
      correct = `${nomCorrect}(${xTestStr}\\,;\\,${texNombre(yTest, 1)})`

      // Distracteur 1 : Erreur de signe sur l'abscisse
      const xD1 = xTest === 0 ? alpha : -xTest
      d1 = `${noms[1]}(${texNombre(xD1, 1)}\\,;\\,${texNombre(yTest, 1)})`

      // Distracteur 2 : Erreur sur l'ordonnée
      // Si l'abscisse annule la parenthèse (diff === 0), on applique le piège a * 0 = a
      const yD2 = diff === 0 ? a + beta : yTest + (a > 0 ? 2 : -2)
      d2 = `${noms[2]}(${xTestStr}\\,;\\,${texNombre(yD2, 1)})`

      // Distracteur 3 : Faux sommet (piège classique pour ceux qui cherchent (alpha ; beta))
      let decalage = choice([-1, 1, 2])
      // Sécurité : on s'assure que yD3 ne soit pas identique à yD2 dans le cas où diff === 0
      while (diff === 0 && beta + decalage === yD2) {
        decalage = choice([-2, -1, 1, 2, 3])
      }
      d3 = `${noms[3]}(${texNombre(alpha, 1)}\\,;\\,${texNombre(beta + decalage, 1)})`
    }

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]

    // Rédaction de la correction étape par étape
    this.correction = `Un point $M(x\\,;\\,y)$ appartient à la courbe représentative $\\mathcal{C}_f$ d'une fonction $f$ si et seulement si ses coordonnées vérifient l'équation $y = f(x)$.<br><br>`
    this.correction += `On calcule $f(${xTestStr})$ pour vérifier si le point $${nomCorrect}$ est sur $\\mathcal{C}_f$ :<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `f(${xTestStr}) &= ${aStr}(${xTestStr} ${alphaOppStr})^2 ${betaStr} \\\\[0.5em]`

    // Détail du calcul pour aider l'élève
    const diffStr = diff < 0 ? `(${texNombre(diff, 1)})` : texNombre(diff, 1)
    this.correction += `f(${xTestStr}) &= ${aStr} \\times ${diffStr}^2 ${betaStr} \\\\[0.5em]`

    if (diff !== 0) {
      this.correction += `f(${xTestStr}) &= ${aStr} \\times ${texNombre(diff * diff, 1)} ${betaStr} \\\\[0.5em]`
    }

    this.correction += `f(${xTestStr}) &= ${texNombre(yTest, 1)}`
    this.correction += `\\end{aligned}$<br><br>`

    this.correction += `On retrouve l'ordonnée du point $${nomCorrect}$, donc le point $${nomCorrect}$ appartient bien à la courbe $\\mathcal{C}_f$.<br><br>`
    this.correction += `En effectuant la même démarche pour les autres points proposés, on constate que l'image de leur abscisse par la fonction $f$ ne correspond pas à leur ordonnée.<br>`
    this.correction += `La bonne réponse est donc $${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes de l'image (Sommet de la parabole)
    this.appliquerLesValeurs(
      0.5,
      3,
      10,
      3,
      'C',
      'C(3\\,;\\,10)',
      'A(-3\\,;\\,10)',
      'B(3\\,;\\,10,5)',
      'D(0\\,;\\,19,5)',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Coefficients très ciblés pour garder des calculs simples
      const a = choice([-3, -2, -0.5, 0.5, 2, 3])
      const alpha = randint(-5, 5, [0])
      const beta = randint(-10, 10, [0])

      // 50% de chance que le point soit le sommet, 50% de chance que ce soit un autre point simple
      const isSommet = choice([true, false])

      // Si ce n'est pas le sommet, on décale l'abscisse de 1 ou 2 pour que le carré soit 1 ou 4 (facile à calculer)
      const delta = choice([-2, -1, 1, 2])
      const xTest = isSommet ? alpha : alpha + delta

      this.appliquerLesValeurs(a, alpha, beta, xTest)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () => {
      const { nom, abscisse } = this.pointDeLaCourbe()
      return this.enonce.replace(
        /Un seul des quatre points ci-dessous appartient à la courbe \$\\mathcal\{C\}_f\$\. Lequel \?\s*$/,
        this.interactif
          ? `Le point $${nom}$ de $\\mathcal{C}_f$ a pour abscisse $${abscisse}$. Son ordonnée est `
          : `Déterminer l'ordonnée du point $${nom}$ de $\\mathcal{C}_f$ d'abscisse $${abscisse}$.`,
      )
    }
    // La bonne réponse du QCM est de la forme « $C(3\,;\,10)$ » : on ne garde que l'ordonnée
    this.reponseCourte = () => this.pointDeLaCourbe().ordonnee
    this.correctionCourte = () => {
      const { nom, ordonnee } = this.pointDeLaCourbe()
      const correction = this.correction ?? ''
      const fin = correction.indexOf("On retrouve l'ordonnée")
      return `${correction
        .slice(0, fin)
        .replace(
          /pour vérifier si le point \$(\w)\$ est sur \$\\mathcal\{C\}_f\$ :/,
          (_, lettre: string) =>
            `pour déterminer l'ordonnée du point $${lettre}$ :`,
        )}Le point $${nom}$ a donc pour ordonnée $${miseEnEvidence(ordonnee)}$.`
    }
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
