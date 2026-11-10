import { droite, type Droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { latex2d, type Latex2d } from '../../lib/2d/textes'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '9b70b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Retrouver une fonction affine à partir de sa droite'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3AGns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    mNum: number,
    mDen: number,
    p: number,
    forcedShuffle?: number[],
  ): void {
    // 1. Formatage de l'équation y = mx + p
    const mFrac = new FractionEtendue(mNum, mDen).simplifie()
    let mTex = ''
    if (mFrac.valeurDecimale === 1) mTex = ''
    else if (mFrac.valeurDecimale === -1) mTex = '-'
    else mTex = mFrac.texFSD

    const pStr = p > 0 ? `+ ${p}` : `- ${Math.abs(p)}`
    const eq = `y = ${mTex}x ${pStr}`

    // 2. Création du repère
    const r = repere({
      xMin: -7,
      xMax: 11,
      yMin: -4,
      yMax: 6,
      grilleX: true,
      grilleY: true,
      thickHauteur: 0.1,
      xLabelMin: -6,
      xLabelMax: 10,
      yLabelMin: -3,
      yLabelMax: 5,
    })

    // 3. Les quatre droites : la bonne et ses trois réflexions (±pente, ±ordonnée à l'origine)
    const linesData = [
      { id: 0, isCorrect: true, f: (x: number) => (mNum / mDen) * x + p }, // (m ; p) correct
      { id: 1, isCorrect: false, f: (x: number) => (-mNum / mDen) * x + p }, // (-m ; p) signe de la pente
      { id: 2, isCorrect: false, f: (x: number) => (mNum / mDen) * x - p }, // (m ; -p) signe de l'ordonnée à l'origine
      { id: 3, isCorrect: false, f: (x: number) => (-mNum / mDen) * x - p }, // (-m ; -p) les deux
    ]

    // On mélange l'attribution des droites aux noms d1..d4
    const indices = forcedShuffle || shuffle([0, 1, 2, 3])

    const colors = ['blue', 'red', 'gray', 'black']
    const droites2d: Droite[] = []
    const labels2d: Latex2d[] = []
    const repOptions: string[] = []
    let correctName = ''
    let correctColor = colors[0]

    // --- Placement explicite des étiquettes ---------------------------------
    const yMinLabel = -3.3
    const yMaxLabel = 5.3
    // Abscisses candidates : on part des bords et on FUIT la zone de croisement
    // (autour de x = 0), où les droites se rejoignent.
    const candidateXs = [10, -6, 8, -4, 6, -2, 9, -5, 7, -3, 5, 3, -7, 4, 2]
    const dejaPlacees: Array<{ x: number; y: number }> = []

    const choisirAncre = (
      f: (x: number) => number,
    ): { x: number; y: number } => {
      for (const cx of candidateXs) {
        if (Math.abs(cx) < 2) continue // on évite la zone de croisement
        const cy = f(cx)
        if (cy < yMinLabel || cy > yMaxLabel) continue
        const libre = dejaPlacees.every(
          (q) => Math.hypot(q.x - cx, q.y - cy) > 1.7,
        )
        if (libre) return { x: cx, y: cy }
      }
      // Repli 1 : on relâche la contrainte d'écartement
      for (const cx of candidateXs) {
        if (Math.abs(cx) < 2) continue
        const cy = f(cx)
        if (cy >= yMinLabel && cy <= yMaxLabel) return { x: cx, y: cy }
      }
      // Repli 2 : première abscisse dont l'ordonnée tient dans le cadre
      for (const cx of candidateXs) {
        const cy = f(cx)
        if (cy >= yMinLabel && cy <= yMaxLabel) return { x: cx, y: cy }
      }
      return { x: candidateXs[0], y: f(candidateXs[0]) }
    }

    for (let i = 0; i < 4; i++) {
      const lineObj = linesData[indices[i]]
      const name = `d_{${i + 1}}`
      if (lineObj.isCorrect) {
        correctName = name
        correctColor = colors[i]
      }

      // Tracé de la droite (infinie, rognée par la fenêtre)
      const d = droite(
        pointAbstrait(-6, lineObj.f(-6)),
        pointAbstrait(10, lineObj.f(10)),
      )
      d.epaisseur = 2
      d.color = [colors[i], colors[i]]
      droites2d.push(d)

      // Étiquette décalée PERPENDICULAIREMENT à la droite (jamais posée dessus)
      const ancre = choisirAncre(lineObj.f)
      dejaPlacees.push(ancre)
      const pente = lineObj.f(1) - lineObj.f(0)
      const norme = Math.hypot(1, pente)
      const decX = (-pente / norme) * 0.55
      const decY = (1 / norme) * 0.55
      labels2d.push(
        latex2d(`(${name})`, ancre.x + decX, ancre.y + decY, {
          color: colors[i],
          letterSize: 'normalsize',
        }),
      )

      repOptions.push(`$(${name})$`)
    }

    const objects2d = [r, ...droites2d, ...labels2d]
    const figure = mathalea2d(
      { xmin: -7.5, xmax: 11.5, ymin: -4.5, ymax: 6.5, scale: 0.55 },
      objects2d,
    )

    // 4. Énoncé
    this.enonce = `Dans le repère ci-dessous sont tracées les droites $(d_1), (d_2), (d_3)$ et $(d_4)$.<br>`
    this.enonce += `La droite ayant pour équation réduite $${eq}$ est :<br>`
    this.enonce += figure

    // Réponses (la première est la bonne ; l'engin mélange l'affichage)
    this.reponses = [`$(${correctName})$`]
    this.reponses.push(
      ...repOptions.filter((name) => name !== `$(${correctName})$`),
    )

    // 5. Correction (élimination par les deux critères de signe)
    const mDisplay = mTex === '' ? '1' : mTex === '-' ? '-1' : mTex
    const sens = mFrac.valeurDecimale > 0 ? 'croissante' : 'décroissante'
    this.correction = `L'équation $${eq}$ est de la forme $y=mx+p$ avec $m=${mDisplay}$ (coefficient directeur) et $p=${p}$ (ordonnée à l'origine).<br>`
    this.correction += `$\\bullet$ L'ordonnée à l'origine vaut $${p}$ : la droite coupe l'axe des ordonnées en $(0\\,;\\,${p})$. On écarte les droites qui le coupent en $(0\\,;\\,${-p})$.<br>`
    this.correction += `$\\bullet$ Le coefficient directeur vaut $${mDisplay}$ : la droite est ${sens}. On écarte la droite de pente opposée.<br>`
    this.correction += `Seule la droite $${miseEnEvidence(correctName)}$ vérifie ces deux conditions.`
  }

  versionOriginale: () => void = () => {
    // forcedShuffle pour reproduire l'attribution des noms (d1..d4) de l'image d'origine.
    this.appliquerLesValeurs(1, 1, 1, [0, 1, 2, 3])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Pentes abordables pour une lecture graphique
    const slopes = [
      { n: 1, d: 2 },
      { n: -1, d: 2 },
      { n: 1, d: 3 },
      { n: -1, d: 3 },
      { n: 2, d: 3 },
      { n: -2, d: 3 },
      { n: 3, d: 2 },
      { n: -3, d: 2 },
      { n: 1, d: 1 },
      { n: -1, d: 1 },
      { n: 2, d: 1 },
      { n: -2, d: 1 },
    ]

    let compteur = 0
    do {
      const { n: mNum, d: mDen } = choice(slopes)
      const p = choice([-3, -2, -1, 1, 2, 3]) // p ≠ 0 : les quatre droites restent distinctes
      this.appliquerLesValeurs(mNum, mDen, p)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /La droite ayant pour équation réduite \$(.*?)\$ est :<br>/,
        (_, equation: string) =>
          `Donner le numéro $k$ de la droite $(d_k)$ qui a pour équation réduite $${equation}$.<br>`,
      )
    // La bonne réponse du QCM est de la forme « $(d_2)$ » : on attend le numéro de la droite
    this.reponseCourte = () => this.reponses[0].replace(/\D/g, '')
    this.correctionCourte = () => {
      const numero = this.reponseCourte?.() ?? ''
      // Le nom de la droite est écrit d_{k} : seul le numéro k est mis en évidence
      return (this.correction ?? '').replace(
        miseEnEvidence(`d_{${numero}}`),
        () => `d_{${miseEnEvidence(numero)}}`,
      )
    }
    this.texteAvantReponseCourte = '$k=$'
    this.clavierReponseCourte = KeyboardType.clavierNumbers
  }
}
