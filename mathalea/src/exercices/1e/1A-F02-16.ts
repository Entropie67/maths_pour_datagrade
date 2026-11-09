import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '1938c'
export const refs = {
  'fr-fr': ['1A-F02-16'],
  'fr-ch': ['1mQCM-42', '11CTQCMFA2-5', '11LCQCMFA2A-5', '11LSQCMFA2A-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Retrouver l'ordonnée d'un point à partir d'une représentation graphique"
export const dateDePublication = '17/12/2025'
export const dateDeModifImportante = '21/10/2026'

export default class Auto1AF2p extends ExerciceQcmA {
  private questionsOuvertes = new Map<
    string,
    { correction: string; reponses: string[] }
  >()

  private appliquerLesValeurs(
    fracNum: number,
    fracDen: number,
    abs: number,
    ordOrigine: number,
  ): void {
    const coeffDir = new FractionEtendue(fracNum, fracDen)
    const solution = coeffDir
      .produitFraction(new FractionEtendue(abs, 1))
      .ajouteEntier(ordOrigine)
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(0, ordOrigine)
    const B = pointAbstrait(fracDen, ordOrigine + fracNum)
    const Bx = pointAbstrait(B.x, A.y)
    const sABx = A.x !== Bx.x || A.y !== Bx.y ? segment(A, Bx) : vide2d()
    const sBBx = B.x !== Bx.x || B.y !== Bx.y ? segment(B, Bx) : vide2d()

    sBBx.epaisseur = 2
    sBBx.pointilles = 5
    sABx.epaisseur = 2
    sABx.pointilles = 5

    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const xmin = -2
    const ymin = -2
    const xmax = 8
    const ymax = 7

    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      axesEpaisseur: 2,
      yLabelDistance: 1,
      yLabelEcart: 0.3,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireOpacite: 0.2,
      grilleSecondaireYMin: ymin,
      grilleSecondaireYMax: ymax + 0.05,
      grilleSecondaireXMin: xmin + 0.05,
      grilleSecondaireXMax: xmax + 0.05,
    })

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.25,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      o,
      traceA,
      traceB,
    )

    this.enonce = `${deuxColonnes(
      `Dans un repère du plan, on a représenté une droite $(D)$.<br><br>
      ${this.sup3 || context.isAmc ? `L'ordonnée du point de $(D)$ dont l'abscisse est $${abs}$ est :` : `Déterminer l'ordonnée du point de $(D)$ d'abscisse $${abs}$.`}`,
      `${objet}`,
    )}`

    this.correction = `On commence par déterminer l'équation réduite de la droite $(D)$.<br>
      Son coefficient directeur est $${coeffDir.texFraction}$ et son ordonnée à l'origine est $${ordOrigine}$.<br>
     L'équation réduite de $(D)$ est : $y=${coeffDir.texFractionSimplifiee}x${ecritureAlgebrique(ordOrigine)}$.<br>
     
     L'ordonnée du point de $(D)$ d'abscisse $${abs}$ est donnée par : $y=${coeffDir.texFractionSimplifiee}\\times ${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(ordOrigine)}$, 
     ce qui donne $y=${coeffDir.produitFraction(new FractionEtendue(abs, 1)).texFraction}${ecritureAlgebrique(ordOrigine)}=${coeffDir.produitFraction(new FractionEtendue(abs, 1)).sommeFraction(new FractionEtendue(ordOrigine, 1)).texFraction}${solution.texSimplificationAvecEtapes()}$.<br>
     L'ordonnée du point de $(D)$ d'abscisse $${abs}$ est $${miseEnEvidence(solution.texFractionSimplifiee)}$.`
    this.reponses = [
      `$${solution.texFractionSimplifiee}$`,
      `$${coeffDir.produitFraction(new FractionEtendue(abs, 1)).texFractionSimplifiee}$`, // Oubli d'ajouter l'ordonnée à l'origine
      `$${coeffDir.produitFraction(new FractionEtendue(-abs, 1)).ajouteEntier(ordOrigine).texFractionSimplifiee}$`, // Erreur de signe sur l'abscisse
      `$${new FractionEtendue(fracDen, fracNum).produitFraction(new FractionEtendue(abs, 1)).ajouteEntier(ordOrigine).texFractionSimplifiee}$`, // Coefficient directeur inversé
    ]
    this.questionsOuvertes.set(this.enonce, {
      correction: this.correction,
      reponses: [this.reponses[0].replace(/\$/g, '').trim()],
    })
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1, 2, -50, 2)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const listeFractions = [
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [2, 5],
        [-1, 2],
        [-1, 3],
        [-2, 3],
        [-1, 5],
        [-2, 5],
        [-1, 6],
        [1, 6],
      ]
      const frac = choice(listeFractions)
      const abs = randint(5, 10) * 10 * choice([-1, 1])
      const ordOrigine = randint(1, 3)
      this.appliquerLesValeurs(frac[0], frac[1], abs, ordOrigine)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    // Conserver les tirages du générateur, puis remplacer l'affichage du QCM.
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            /Déterminer l'ordonnée du point de \$\(D\)\$ d'abscisse \$(.*?)\$\./,
            (_, x) =>
              `L'ordonnée du point de $(D)$ d'abscisse $${x}$ est ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}.`,
          )
        : enonce
      this.listeCorrections[i] = donnees.correction
      handleAnswers(
        this,
        i,
        { reponse: { value: donnees.reponses } },
        { formatInteractif: 'mathalea-mathfield' },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.versionAleatoire()
  }
}
