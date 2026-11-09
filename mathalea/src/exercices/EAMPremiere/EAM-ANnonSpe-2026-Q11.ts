import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '6d0e9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation graphiquement'
export const dateDePublication = '05/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ11ANns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    dx: number,
    dy: number,
    sx: number,
    nbSols: number,
  ): void {
    // Points de base fidèles à la courbe de l'image officielle
    const baseNoeuds = [
      { x: -3, y: 3, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: -2, y: 2, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
      { x: -1, y: 0, deriveeGauche: -3, deriveeDroit: -3, isVisible: false },
      { x: 0, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false }, // Minimum 1
      { x: 1, y: 0, deriveeGauche: 4, deriveeDroit: 4, isVisible: false },
      { x: 2, y: 2, deriveeGauche: 2, deriveeDroit: 2, isVisible: false },
      { x: 2.5, y: 3.5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false }, // Maximum
      { x: 3, y: 2, deriveeGauche: -3, deriveeDroit: -3, isVisible: false },
      { x: 4, y: -4, deriveeGauche: -6, deriveeDroit: -6, isVisible: false }, // Minimum 2
    ]

    const noeuds = baseNoeuds.map((n) => ({
      x: n.x * sx + dx,
      y: n.y + dy,
      deriveeGauche: n.deriveeGauche * sx,
      deriveeDroit: n.deriveeDroit * sx,
      isVisible: n.isVisible,
    }))

    // La fonction Spline nécessite des x triés par ordre croissant
    noeuds.sort((a, b) => a.x - b.x)

    const theSpline = spline(noeuds)
    const bornes = theSpline.trouveMaxes()

    const xMin = Math.floor(bornes.xMin) - 1
    const xMax = Math.ceil(bornes.xMax) + 1
    const yMin = Math.floor(bornes.yMin) - 1
    const yMax = Math.ceil(bornes.yMax) + 1

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
      epaisseur: 2,
      color: bleuMathalea,
      ajouteNoeuds: false,
    })

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })

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
    )

    // Détermination de l'équation en fonction du nombre de solutions souhaité
    let kBase: number
    let baseSols: number[]

    if (nbSols === 2) {
      kBase = -4 // Ordonnée des minima
      baseSols = [0, 4] // Abscisses des minima
    } else {
      kBase = 2 // Ordonnée qui coupe la bosse
      baseSols = [-2, 2, 3] // Abscisses d'intersection
    }

    const k = kBase + dy
    const domaineMin = sx === 1 ? -3 + dx : -4 + dx
    const domaineMax = sx === 1 ? 4 + dx : 3 + dx
    this.enonce = `Une fonction $h$ définie sur $[${domaineMin}\\,;\\,${domaineMax}]$ est représentée ci-dessous.<br><br>
  ${figure}`
    this.enonce += `L'équation $h(x) = ${k}$ a pour ensemble solution :`

    // Application des transformations aux solutions de base
    const sols = baseSols.map((x) => x * sx + dx).sort((a, b) => a - b)

    // --- DISTRACTEURS ---
    const repCorrecte = `$S = \\{${sols.join('\\,;\\,')}\\}$`
    const dist1 = `$S = \\{${k}\\}$` // Confusion avec l'ordonnée
    const dist2 = `$S = [${sols[0]}\\,;\\,${sols[sols.length - 1]}]$` // Confusion avec un intervalle

    // Distracteur 3 : Fausses valeurs symétriques
    const fake1 = (nbSols === 2 ? -2 : -0.5) * sx + dx
    const fake2 = (nbSols === 2 ? 2 : 0.5) * sx + dx
    const dist3 = `$S = \\{${texNombre(fake1, 1)}\\,;\\,${texNombre(fake2, 1)}\\}$`

    this.reponses = [repCorrecte, dist1, dist2, dist3]

    // --- CORRECTION ADAPTATIVE ---
    const strNbPoints = nbSols === 2 ? 'deux' : 'trois'
    const strSolsList =
      nbSols === 2
        ? `$${sols[0]}$ et $${sols[1]}$`
        : `$${sols[0]}$, $${sols[1]}$ et $${sols[2]}$`

    this.correction = `Pour résoudre graphiquement l'équation $h(x) = ${k}$, on cherche les abscisses respectives des points d'intersection de la courbe avec la droite horizontale d'équation $y = ${k}$.<br>`
    this.correction += `La courbe coupe cette droite en ${strNbPoints} points dont les abscisses sont ${strSolsList}.<br>`
    this.correction += `Donc l'ensemble solution est : $${miseEnEvidence(`S = \\{${sols.join('\\,;\\,')}\\}`)}$.`
  }

  versionOriginale: () => void = () => {
    // 0 translation en x, 0 translation en y, symétrie normale (1), et on force les 3 solutions
    this.appliquerLesValeurs(0, 0, 1, 3)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const dx = choice([-2, -1, 0, 1, 2])
      const dy = choice([-2, -1, 0, 1])
      const sx = choice([-1, 1])

      // On tire au sort pour avoir 2 ou 3 solutions
      const nbSols = choice([2, 3])

      this.appliquerLesValeurs(dx, dy, sx, nbSols)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /L'équation \$(h\(x\) = [^$]*)\$ a pour ensemble solution :\s*$/,
        (_, equation: string) =>
          `Donner l'ensemble $S$ des solutions de l'équation $${equation}$.`,
      )
    // La bonne réponse du QCM est de la forme « $S = \{-1\,;\,3\}$ » : on ne garde que l'ensemble
    this.reponseCourte = () =>
      this.reponses[0]
        .replace(/^\$S = /, '')
        .replace(/\$$/, '')
        .replace(/\\,/g, '')
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { ensembleDeNombres: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
    this.options = { vertical: true }
  }
}
