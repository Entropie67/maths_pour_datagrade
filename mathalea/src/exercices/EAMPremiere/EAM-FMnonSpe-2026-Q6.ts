import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '0cc62'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer les coordonnées d'un point sur une courbe"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6FMns2026 extends ExerciceQcmACourt {
  /** Le point de la bonne réponse du QCM, de la forme « $C(3\\,;\\,10)$ ». */
  private pointDeLaCourbe(): { abscisse: string; ordonnee: string } {
    const [, abscisse, ordonnee] =
      /^\$\w\(([^;]*?)\\,;\\,([^)]*)\)\$$/.exec(this.reponses[0]) ?? []
    return { abscisse, ordonnee: ordonnee.replace(/\\,/g, '') }
  }

  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    xTest: number,
    nomCorrectOrigine?: string,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const poly = new Polynome({ coeffs: [c, b, a] })
    const polynomeLatex = poly.toLatex()
    const xTestStr = texNombre(xTest, 1)

    // Calcul de l'ordonnée correcte
    const yTest = a * xTest * xTest + b * xTest + c

    this.enonce = `On considère la courbe d'équation $y = ${polynomeLatex}$.<br>`
    this.enonce += `Le point d'abscisse $${xTestStr}$ de la courbe est :`

    let correct: string = ''
    let d1: string = ''
    let d2: string = ''
    let d3: string = ''

    if (
      repOrigine &&
      d1Origine &&
      d2Origine &&
      d3Origine &&
      nomCorrectOrigine
    ) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      // Distracteur 1 : erreur de signe (oubli du carré sur xTest)
      const yD1 = a * xTest + b * xTest + c
      // Distracteur 2 : erreur classique sur le signe de b*x
      const yD2 = a * xTest * xTest - b * xTest + c

      // On s'assure d'avoir 3 fausses ordonnées uniques
      const faussesOrdonnees = [...new Set([yD1, yD2])].filter(
        (y) => y !== yTest,
      )
      let decalage = 1
      while (faussesOrdonnees.length < 3) {
        if (!faussesOrdonnees.includes(yTest + decalage))
          faussesOrdonnees.push(yTest + decalage)
        if (faussesOrdonnees.length === 3) break
        if (!faussesOrdonnees.includes(yTest - decalage))
          faussesOrdonnees.push(yTest - decalage)
        decalage++
      }

      // On pioche 4 lettres au hasard pour nommer les points
      const noms = shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'P'])

      correct = `${noms[0]}(${xTestStr}\\,;\\,${texNombre(yTest, 1)})`
      d1 = `${noms[1]}(${xTestStr}\\,;\\,${texNombre(faussesOrdonnees[0], 1)})`
      d2 = `${noms[2]}(${xTestStr}\\,;\\,${texNombre(faussesOrdonnees[1], 1)})`
      d3 = `${noms[3]}(${xTestStr}\\,;\\,${texNombre(faussesOrdonnees[2], 1)})`
    }

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]

    // Rédaction de la correction étape par étape
    this.correction = `Pour trouver l'ordonnée $y$ du point d'abscisse $x = ${xTestStr}$ situé sur la courbe, on remplace $x$ par $${xTestStr}$ dans l'équation de la courbe :<br><br>`
    this.correction += `$\\begin{aligned}`

    // Utilisation de la fonction native pour gérer les parenthèses des nombres négatifs
    const xTestParen = ecritureParentheseSiNegatif(xTest)

    this.correction += `y &= ${a} \\times ${xTestParen}^2 `

    if (b === 1) this.correction += `+ ${xTestParen} `
    else if (b === -1) this.correction += `- ${xTestParen} `
    else if (b > 0) this.correction += `+ ${b} \\times ${xTestParen} `
    else if (b < 0) this.correction += `- ${-b} \\times ${xTestParen} `

    if (c > 0) this.correction += `+ ${c} `
    else if (c < 0) this.correction += `- ${-c} `

    this.correction += `\\\\[0.5em]`

    const carre = xTest * xTest
    this.correction += `y &= ${a} \\times ${texNombre(carre, 1)} `

    const bx = b * xTest
    if (bx > 0) this.correction += `+ ${texNombre(bx, 1)} `
    else if (bx < 0) this.correction += `- ${texNombre(-bx, 1)} `

    if (c > 0) this.correction += `+ ${c} `
    else if (c < 0) this.correction += `- ${-c} `

    this.correction += `\\\\[0.5em]`

    this.correction += `y &= ${texNombre(yTest, 1)}`
    this.correction += `\\end{aligned}$<br><br>`

    this.correction += `Le point de la courbe d'abscisse $${xTestStr}$ a donc pour ordonnée $${texNombre(yTest, 1)}$.<br>`
    this.correction += `C'est donc le point $${miseEnEvidence(correct)}$ qui est sur la courbe.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      2,
      -1,
      3,
      -1,
      'D',
      'D(-1\\,;\\,6)',
      'A(-1\\,;\\,0)',
      'B(-1\\,;\\,2)',
      'C(-1\\,;\\,4)',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const a = choice([-3, -2, -1, 1, 2, 3])
      const b = randint(-5, 5)
      const c = randint(-5, 5)

      // On choisit uniquement une petite abscisse négative pour forcer la gestion des signes
      const xTest = choice([-3, -2, -1])

      this.appliquerLesValeurs(a, b, c, xTest)
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
      const { abscisse } = this.pointDeLaCourbe()
      return this.enonce.replace(
        /Le point d'abscisse \$[^$]*\$ de la courbe est :\s*$/,
        this.interactif
          ? `Le point d'abscisse $${abscisse}$ de la courbe a pour ordonnée `
          : `Déterminer l'ordonnée du point d'abscisse $${abscisse}$ de la courbe.`,
      )
    }
    // La bonne réponse du QCM est de la forme « $C(3\\,;\\,10)$ » : on ne garde que l'ordonnée
    this.reponseCourte = () => this.pointDeLaCourbe().ordonnee
    this.correctionCourte = () => {
      const { abscisse, ordonnee } = this.pointDeLaCourbe()
      const correction = this.correction ?? ''
      const fin = correction.indexOf("Le point de la courbe d'abscisse")
      return `${correction.slice(0, fin)}Le point de la courbe d'abscisse $${abscisse}$ a donc pour ordonnée $${miseEnEvidence(ordonnee)}$.`
    }
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
