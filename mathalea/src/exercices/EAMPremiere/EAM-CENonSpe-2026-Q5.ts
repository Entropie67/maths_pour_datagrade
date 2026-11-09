import Decimal from 'decimal.js'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '49275'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Retrouver l'équation réduite d'une droite à partir de son graphique"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5CEns2026 extends ExerciceQcmACourt {
  // Droite de coefficient directeur m = rise/run et d'ordonnée à l'origine p.
  // On lit la pente par un triangle à pas ENTIER : avancer de « run », se décaler de « rise ».
  private appliquerLesValeurs(rise: number, run: number, p: number): void {
    const mDec = new Decimal(rise).div(run) // coefficient directeur
    const pDec = new Decimal(p) // ordonnée à l'origine
    const x0 = pDec.neg().div(mDec) // abscisse à l'origine : -p/m
    const invM = new Decimal(1).div(mDec) // 1/m
    const x0Num = x0.toNumber()

    // --- CRÉATION DU GRAPHIQUE 2D (ÉNONCÉ) ---
    const r = repere({
      xMin: -3,
      xMax: 6,
      yMin: -4,
      yMax: 6,
      grilleSecondaire: false,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
    })

    const ptA = pointAbstrait(0, p) // point sur l'axe des ordonnées
    const ptB = pointAbstrait(run, p + rise) // second point de la droite
    const ptCorner = pointAbstrait(run, p) // sommet du triangle de lecture

    const d = droite(ptA, ptB, '', 'red')
    d.epaisseur = 1.5
    const o = latex2d('0', -0.3, -0.3, { letterSize: 'scriptsize' })

    // Point A : ordonnée à l'origine
    const A = pointAbstrait(0, p, 'A', 'right')
    // Point B : l'abscisse à l'origine si elle est entière ET dans le cadre,
    // sinon le point de décalage (run ; p+rise) servant à lire le coefficient directeur (cf. correction)
    const B =
      x0.isInteger() && x0Num >= -3 && x0Num < 6
        ? pointAbstrait(x0Num, 0, 'B', 'above')
        : pointAbstrait(run, p + rise, 'B', rise > 0 ? 'above' : 'above')
    const marqueursAB = tracePoint(A, B)
    const labelsAB = labelPoint(A, B)

    const fenetreMathalea2d = {
      xmin: -3.05,
      xmax: 6.05,
      ymin: -4.05,
      ymax: 6.05,
      pixelsParCm: 30,
      scale: 0.6,
      display: 'block' as const,
      center: !context.isHtml,
    }

    const figure = mathalea2d(fenetreMathalea2d, r, d, marqueursAB, labelsAB, o)

    // --- CRÉATION DU GRAPHIQUE DE CORRECTION (triangle de lecture) ---
    const sHoriz = segment(ptA, ptCorner, 'blue')
    sHoriz.epaisseur = 2
    sHoriz.pointilles = 5

    const sVert = segment(ptCorner, ptB, 'green')
    sVert.epaisseur = 2
    sVert.pointilles = 5

    const decY = rise > 0 ? -0.4 : 0.4
    const lHoriz = latex2d(`+${run}`, run / 2, p + decY, {
      color: 'blue',
      letterSize: 'scriptsize',
    })

    const lVertStr = rise > 0 ? `+${rise}` : `${rise}`
    const lVert = latex2d(lVertStr, run + 0.4, p + rise / 2, {
      color: 'green',
      letterSize: 'scriptsize',
    })

    const figureCorr = mathalea2d(
      fenetreMathalea2d,
      r,
      d,
      marqueursAB,
      labelsAB,
      o,
      sHoriz,
      sVert,
      lHoriz,
      lVert,
    )

    // --- ÉNONCÉ ET CORRECTION ---
    // TODO : caler ce texte au mot près sur le PDF du sujet
    this.enonce = `Dans un repère du plan, on a représenté la droite $(AB)$.<br><br>${figure}`
    this.enonce += `L'équation réduite de la droite $(AB)$ est :`

    this.correction = `Par lecture graphique :<br>`
    this.correction += `$\\bullet$ La droite coupe l'axe des ordonnées au point de coordonnées $(0\\,;\\,${texNombre(pDec)})$, donc l'ordonnée à l'origine est $p = ${texNombre(pDec)}$.<br>`
    this.correction += `$\\bullet$ En partant de ce point, si on avance de $${run}$ unité${run > 1 ? 's' : ''} vers la droite, on se décale de $${Math.abs(rise)}$ unité${Math.abs(rise) > 1 ? 's' : ''} vers le ${rise > 0 ? 'haut' : 'bas'}. Le coefficient directeur est donc $m = ${texNombre(mDec)}$.<br>`
    this.correction += `L'équation réduite est de la forme $y = mx + p$, ce qui donne $${miseEnEvidence(`y=${reduireAxPlusB(mDec, pDec)}`)}$.<br>`
    this.correction += figureCorr

    // --- RÉPONSES (la première est la bonne) ---
    this.reponses = [
      `$y = ${reduireAxPlusB(mDec, pDec)}$`, // correct
      `$y = ${reduireAxPlusB(x0, pDec)}$`, // distracteur : x0 pris comme coefficient directeur
      `$y = ${reduireAxPlusB(invM, pDec)}$`, // distracteur : 1/m pris comme coefficient directeur
      `$y = ${reduireAxPlusB(pDec, x0)}$`, // distracteur : m et p intervertis (pente = p, constante = x0)
    ]
  }

  versionOriginale: () => void = () => {
    // Droite passant par A(0 ; 2) et B(4 ; 0) : m = -1/2, p = 2
    this.appliquerLesValeurs(-1, 2, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [rise, run, p] : pentes ±1/2 et ±2 (1/m et x0 restent « propres »), p ≠ 0
    const donnees: [number, number, number][] = [
      [-1, 2, 2],
      [1, 2, 1],
      [-1, 2, 3],
      [1, 2, -2],
      [2, 1, 1],
      [-2, 1, 3],
      [2, 1, -3],
      [-2, 1, 2],
      [1, 2, -3],
      [-1, 2, 4],
      [-1, 4, 3],
      [1, 4, 2],
      [1, 4, 3],
      [1, 4, -1],
      [-1, 4, 1],
      [4, 1, -1],
      [-4, 1, 3],
      [4, 1, -2],
    ]

    let compteur = 0
    do {
      const [rise, run, p] = choice(donnees)
      this.appliquerLesValeurs(rise, run, p)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /L'équation réduite de la droite \$\(AB\)\$ est :\s*$/,
        this.interactif
          ? "L'équation réduite de la droite $(AB)$ est "
          : "Déterminer l'équation réduite de la droite $(AB)$.",
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { egaliteExpression: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
