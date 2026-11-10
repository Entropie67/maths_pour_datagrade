import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '5e11f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer une équation réduite de droite par lecture graphique'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5FMt2026 extends ExerciceQcmACourt {
  // Ajout de paramètres optionnels pour forcer les distracteurs de la version originale
  private appliquerLesValeurs(
    m: number,
    p: number,
    distA?: string,
    distB?: string,
    distC?: string,
  ): void {
    const x0 = -p / m // L'abscisse à l'origine

    // --- CRÉATION DU GRAPHIQUE 2D (ÉNONCÉ) ---
    const r = repere({
      xMin: -3,
      xMax: 4,
      yMin: -4,
      yMax: 6,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
    })

    const ptA = pointAbstrait(0, p)
    const ptB = pointAbstrait(1, m + p)
    const ptCorner = pointAbstrait(1, p)

    const d = droite(ptA, ptB, '', 'red')
    const o = latex2d('0', -0.3, -0.3, { letterSize: 'scriptsize' })
    d.epaisseur = 2

    const fenetreMathalea2d = {
      xmin: -3.05,
      xmax: 4.05,
      ymin: -5.05,
      ymax: 6.05,
      pixelsParCm: 30,
      scale: 0.6,
      display: 'block' as const,
      center: !context.isHtml,
    }

    const figure = mathalea2d(fenetreMathalea2d, r, d, o)

    // --- CRÉATION DU GRAPHIQUE DE CORRECTION ---
    const sHoriz = segment(ptA, ptCorner, 'blue')
    sHoriz.epaisseur = 2
    sHoriz.pointilles = 5

    const sVert = segment(ptCorner, ptB, 'green')
    sVert.epaisseur = 2
    sVert.pointilles = 5

    const decY = m > 0 ? -0.4 : 0.4
    const lHoriz = latex2d('+1', 0.5, p + decY, {
      color: 'blue',
      letterSize: 'scriptsize',
    })

    const lVertStr = m > 0 ? `+${m}` : `${m}`
    const lVert = latex2d(lVertStr, 1.4, p + m / 2, {
      color: 'green',
      letterSize: 'scriptsize',
    })

    const figureCorr = mathalea2d(
      fenetreMathalea2d,
      r,
      d,
      o,
      sHoriz,
      sVert,
      lHoriz,
      lVert,
    )

    // --- ÉNONCÉ ET CORRECTION ---
    this.enonce = `Une droite est représentée ci-dessous. <br><br>
      ${figure}`

    this.enonce += `L'équation réduite de cette droite est :`
    this.correction = `Par lecture graphique :<br>`
    this.correction += `$\\bullet$ La droite coupe l'axe des ordonnées au point de coordonnées $(0 ; ${p})$, donc l'ordonnée à l'origine est $p = ${p}$.<br>`
    this.correction += `$\\bullet$ En partant de ce point, si on avance de $1$ unité vers la droite, on se décale de $${Math.abs(m)}$ unités vers le ${m > 0 ? 'haut' : 'bas'} pour rejoindre la droite. Le coefficient directeur est donc $m = ${m}$.<br>`
    this.correction += `L'équation réduite est de la forme $y = mx + p$, ce qui donne $${miseEnEvidence(`y = ${reduireAxPlusB(m, p)}`)}$.<br>`
    this.correction += figureCorr.replace(
      `\\end{tikzpicture}\\\\`,
      '\\end{tikzpicture}',
    )

    // --- DISTRACTEURS ---
    const repCorrecte = `$y = ${reduireAxPlusB(m, p)}$`
    let dist1, dist2, dist3

    // Si on a forcé les valeurs (pour la version officielle), on les utilise
    if (distA && distB && distC) {
      dist1 = distA
      dist2 = distB
      dist3 = distC
    } else {
      // Sinon, pour la version aléatoire, on crée des distracteurs "propres" (fractions et arrondis 1 décimale)
      const formatX = (coeff: number | string) => {
        if (typeof coeff === 'number') {
          if (coeff === 1) return 'x'
          if (coeff === -1) return '-x'
          return `${texNombre(coeff, 1)}x`
        }
        return `${coeff}x`
      }

      const formatConstant = (val: number) => {
        const rounded = Math.round(val * 10) / 10 // Arrondi à 1 décimale
        if (rounded === 0) return ''
        if (rounded > 0) return ` + ${texNombre(rounded, 1)}`
        return ` - ${texNombre(Math.abs(rounded), 1)}`
      }

      // Utilisation de FractionEtendue pour afficher 1/3 proprement
      const fracInvM = new FractionEtendue(1, m).texFractionSimplifiee

      dist1 = `$y = ${formatX(fracInvM)}${formatConstant(p)}$`
      dist2 = `$y = ${formatX(m)}${formatConstant(x0)}$`
      dist3 = `$y = ${formatX(p)}${formatConstant(x0)}$`
    }

    this.reponses = [repCorrecte, dist1, dist2, dist3]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : droite y = -2x + 3 (distracteurs A, B, C du sujet)
    this.appliquerLesValeurs(
      -2,
      3,
      `$y = -0,5x + 1,5$`,
      `$y = -2x + 1,5$`,
      `$y = 2x + 3$`,
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const donnees: [number, number][] = [
      [-2, 3],
      [2, 3],
      [-2, 1],
      [2, 1],
      [2, -3],
      [-2, 5],
      [2, -4],
      [4, -2],
      [-4, 2],
      [4, 1],
      [-4, 4],
      [4, 2],
      [-4, 5],
    ]

    let compteur = 0
    do {
      const [m, p] = choice(donnees)
      this.appliquerLesValeurs(m, p)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /L'équation réduite de cette droite est :\s*$/,
        this.interactif
          ? "L'équation réduite de cette droite est "
          : "Déterminer l'équation réduite de cette droite.",
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { egaliteExpression: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
