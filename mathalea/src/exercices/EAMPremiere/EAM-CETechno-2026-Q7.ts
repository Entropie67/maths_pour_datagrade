import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '88f1e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Résoudre une inéquation à partir de la lecture d'une courbe"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7ANt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    dx: number,
    dy: number,
    isSuperieur: boolean,
  ): void {
    // Nœuds soigneusement calibrés pour reproduire la courbe du sujet officiel
    const baseNoeuds = [
      { x: -4, y: 4, deriveeGauche: -5, deriveeDroit: -5, isVisible: true },
      { x: -3, y: 0, deriveeGauche: -3, deriveeDroit: -3, isVisible: true },
      { x: -2, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true }, // Minimum
      { x: -1, y: 0, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
      { x: 0, y: 2, deriveeGauche: 2.2, deriveeDroit: 2.2, isVisible: true },
      { x: 2, y: 5, deriveeGauche: 0, deriveeDroit: 0, isVisible: true }, // Maximum
      { x: 3, y: 4, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
    ]

    // Application des translations aléatoires
    const noeuds = baseNoeuds.map((n) => ({
      x: n.x + dx,
      y: n.y + dy,
      deriveeGauche: n.deriveeGauche,
      deriveeDroit: n.deriveeDroit,
      isVisible: n.isVisible,
    }))

    const theSpline = spline(noeuds)

    // Définition des bornes mathématiques
    const xMinD = -4 + dx
    const xMaxD = 3 + dx
    const k = 0 + dy // Ordonnée de la droite de coupe (axe des abscisses à l'origine)
    const x1 = -3 + dx // 1ère solution de l'équation
    const x2 = -1 + dx // 2ème solution de l'équation
    const xm = -2 + dx // Abscisse du minimum
    const x0 = 0 + dx // Abscisse du point de passage y=2 (pour le distracteur)

    // Définition de la fenêtre d'affichage MathALÉA
    const xMin = xMinD - 1
    const xMax = xMaxD + 1
    const yMin = -1 + dy - 1
    const yMax = 5 + dy + 1

    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
      axesEpaisseur: 1.5,
    })

    const courbe = theSpline.courbe({
      epaisseur: 1.5,
      color: 'red',
      ajouteNoeuds: true, // Affiche les marques sur la courbe comme sur l'image
    })

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const labelCf = latex2d('\\mathcal{C}_f', 3.5 + dx, 4.5 + dy, {
      color: 'red',
    })

    const figure = mathalea2d(
      {
        xmin: xMin - 0.5,
        xmax: xMax + 0.5,
        ymin: yMin - 0.5,
        ymax: yMax + 0.5,
        pixelsParCm: 25,
        scale: 0.6,
        display: 'block',
        center: !context.isHtml,
      },
      r,
      courbe,
      o,
      labelCf,
    )

    // Formulation de l'énoncé
    const symbole = isSuperieur ? '\\geqslant' : '\\leqslant'
    this.enonce = `On donne ci-dessous la courbe représentative $\\mathcal{C}_f$ d'une fonction $f$ définie sur l'intervalle $[${xMinD}\\,;\\,${xMaxD}]$.<br><br>`
    this.enonce += `${figure}<br>`
    this.enonce += `L'ensemble des solutions de l'inéquation $f(x) ${symbole} ${k}$ est :`

    let correct: string, dist1: string, dist2: string, dist3: string

    if (isSuperieur) {
      correct = `[${xMinD}\\,;\\,${x1}] \\cup [${x2}\\,;\\,${xMaxD}]`
      dist1 = `[${xMinD}\\,;\\,${x1}] \\cup [${x0}\\,;\\,${xMaxD}]` // Le fameux distracteur D très intéressant !
      dist2 = `[${x0}\\,;\\,${xMaxD}]` // Distracteur A
      dist3 = `[${xMinD}\\,;\\,${xm}]` // Distracteur B
    } else {
      correct = `[${x1}\\,;\\,${x2}]`
      dist1 = `[${x1}\\,;\\,${x0}]` // L'équivalent du distracteur très intéressant inversé
      dist2 = `[${xMinD}\\,;\\,${xm}]` // Distracteur A version inversée
      dist3 = `[${x0}\\,;\\,${xMaxD}]` // Distracteur B version inversée
    }

    this.reponses = [`$${correct}$`, `$${dist1}$`, `$${dist2}$`, `$${dist3}$`]

    // Rédaction de la correction
    const positionLigne = isSuperieur ? 'au-dessus de' : 'en dessous de'
    const positionCourbe = isSuperieur ? 'au-dessus' : 'en dessous'

    this.correction = `Pour résoudre graphiquement l'inéquation $f(x) ${symbole} ${k}$, on cherche les abscisses respectives des points de la courbe situés ${positionLigne} la droite horizontale d'équation $y = ${k}$ (ou sur cette droite).<br>`
    this.correction += `La courbe coupe cette droite en deux points d'abscisses $x = ${x1}$ et $x = ${x2}$.<br>`
    this.correction += `Elle est située ${positionCourbe} de cette droite pour les abscisses appartenant à l'ensemble $${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    // Cas de l'image de référence : aucune translation, et inéquation >= 0
    this.appliquerLesValeurs(0, 0, true)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Translations horizontales et verticales limitées pour garder un bel affichage
      const dx = choice([-3, -2, -1, 0, 1, 2, 3])
      const dy = choice([-2, -1, 0, 1, 2])

      // Choix aléatoire du sens de l'inéquation (>= ou <=)
      const isSuperieur = choice([true, false])

      this.appliquerLesValeurs(dx, dy, isSuperieur)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /L'ensemble des solutions de (l'inéquation \$[^$]*\$) est :\s*$/,
        (_, inequation: string) =>
          `Donner l'ensemble des solutions de ${inequation}.`,
      )
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$|\$$/g, '').replace(/\\,/g, '')
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { intervalle: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
  }
}
