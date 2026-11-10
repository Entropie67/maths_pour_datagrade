import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '3a64e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Donner une équation de droite à partir de son graphique'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2FMs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(m: number, b: number): void {
    // Configuration du repère
    const xMin = -4
    const xMax = 5
    const yMin = -3
    const yMax = 5

    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
      axesEpaisseur: 1.5,
      xThickListe: [1], // N'affiche que la graduation 1
      yThickListe: [1], // N'affiche que la graduation 1
      xLabelListe: [100], // Astuce pour masquer les nombres
      yLabelListe: [100], // Astuce pour masquer les nombres
    })

    // Création de la droite
    const A = pointAbstrait(0, b)
    const B = pointAbstrait(1, b + m)
    const d = droite(A, B, '', 'red') // Droite en rouge comme sur ta dernière capture
    d.epaisseur = 2

    // --- PLACEMENT DYNAMIQUE DU LABEL (Δ) AUX EXTRÉMITÉS ---
    // On tire au sort pour placer le label en haut ou en bas
    const placerEnHaut = choice([true, false])
    let xLabel: number
    let yLabel: number

    // On cible le haut (y=4) ou le bas (y=-2) du repère
    const yCible = placerEnHaut ? 4 : -2

    // On calcule le x correspondant : y = mx + b <=> x = (y - b) / m
    xLabel = (yCible - b) / m
    yLabel = yCible

    // Sécurité : si ce x sort du repère horizontalement, on le bloque au bord et on recalcule y
    if (xLabel < -3.5) {
      xLabel = -3.5
      yLabel = m * xLabel + b
    } else if (xLabel > 4) {
      xLabel = 4
      yLabel = m * xLabel + b
    }

    // Décalage pour que le texte soit  à côté de la ligne sans la toucher
    const decalageX = m > 0 ? -0.6 : 0.6
    const decalageY = 0.2

    const labelDelta = latex2d(
      '(\\Delta)',
      xLabel + decalageX,
      yLabel + decalageY,
      { color: 'red' },
    )

    // Placement des points O, I, J
    const o = latex2d('\\text{O}', 0.3, 0.3, { letterSize: 'scriptsize' })
    const i = latex2d('\\text{I}', 1, -0.4, { letterSize: 'scriptsize' })
    const j = latex2d('\\text{J}', -0.4, 1, { letterSize: 'scriptsize' })

    const fenetreMathalea2d = {
      xmin: xMin - 0.05,
      xmax: xMax + 0.05,
      ymin: yMin - 1.05,
      ymax: yMax + 0.05,
      pixelsParCm: 25,
      scale: 0.6,
      display: 'block' as const,
      center: !context.isHtml,
    }

    const figure = mathalea2d(fenetreMathalea2d, r, d, labelDelta, o, i, j)

    this.enonce = `Dans le repère (O,I,J) ci-contre, la droite $(\\Delta)$ a pour équation :<br><br>`
    this.enonce += `${figure}`

    // Génération des équations réduites
    const correct = `y = ${reduireAxPlusB(m, b)}`

    // Distracteurs calqués sur l'image (erreur de signe, coefficient directeur doublé ou opposé du double)
    const d1 = `y = ${reduireAxPlusB(-m, b)}`
    const d2 = `y = ${reduireAxPlusB(2 * m, b)}`
    const d3 = `y = ${reduireAxPlusB(-2 * m, b)}`

    this.reponses = [`$${correct}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]

    // --- ÉLÉMENTS GRAPHIQUES POUR LA CORRECTION ---

    // Marqueur pour l'ordonnée à l'origine
    const traceOrdonnee = tracePoint(A, 'red')
    traceOrdonnee.taille = 3
    traceOrdonnee.epaisseur = 2

    // Déplacement horizontal en bleu et en pointillés
    const sHoriz = segment(pointAbstrait(0, b), pointAbstrait(1, b), 'blue')
    sHoriz.epaisseur = 2
    sHoriz.pointilles = 5

    // Déplacement vertical en vert et en pointillés
    const sVert = segment(pointAbstrait(1, b), pointAbstrait(1, b + m), 'green')
    sVert.epaisseur = 2
    sVert.pointilles = 5

    // Étiquettes sur les pointillés avec les bonnes couleurs
    const lblHoriz =
      m > 0
        ? latex2d('+1', 0.5, b - 0.5, {
            letterSize: 'scriptsize',
            color: 'blue',
          })
        : latex2d('+1', 0.5, b + 0.5, {
            letterSize: 'scriptsize',
            color: 'blue',
          })

    const lblVertTxt = m > 0 ? `+${m}` : `${m}`
    const lblVert = latex2d(lblVertTxt, 1.6, b + m / 2, {
      letterSize: 'scriptsize',
      color: 'green',
    })

    // FIGURE 2 : Pour la correction (annotée)
    const figureCorr = mathalea2d(
      fenetreMathalea2d,
      r,
      d,
      labelDelta,
      o,
      i,
      j,
      traceOrdonnee,
      sHoriz,
      sVert,
      lblHoriz,
      lblVert,
    )

    // Rédaction de la correction textuelle associée
    const action = m > 0 ? 'monte' : 'descend'
    const uniteAction = Math.abs(m) === 1 ? 'unité' : 'unités'

    this.correction = `L'équation réduite d'une droite non parallèle à l'axe des ordonnées est de la forme $y = ax + b$.<br><br>`
    this.correction += `${figureCorr}`
    this.correction += `$\\bullet\\quad$ L'ordonnée à l'origine $b$ se lit sur l'axe des ordonnées  : la droite coupe cet axe en $y = ${b}$, donc $b = ${b}$.<br>`
    this.correction += `$\\bullet\\quad$ Le coefficient directeur $a$ se lit graphiquement : en partant de ce point, lorsqu'on avance de $1$ unité vers la droite (en bleu), la droite ${action} de $${Math.abs(m)}$ ${uniteAction} (en vert).<br>`
    this.correction += `Donc $a = ${m}$.<br><br>`
    this.correction += `L'équation de la droite est donc $${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    // Valeurs de l'image de référence : m = -1 et b = 2
    this.appliquerLesValeurs(-1, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Pour garder un affichage clair dans le repère, on limite les pentes et ordonnées à l'origine
      const m = choice([-3, -2, -1, 1, 2, 3])
      const b = choice([-2, -1, 1, 2, 3])

      this.appliquerLesValeurs(m, b)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Dans le repère \(O,I,J\) ci-contre, la droite \$\(\\Delta\)\$ a pour équation :/,
        "Dans le repère $(O,I,J)$ ci-dessous, donner l'équation réduite de la droite $(\\Delta)$.",
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { egaliteExpression: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
