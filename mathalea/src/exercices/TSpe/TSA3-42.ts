import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { buildQcmForExercise } from '../../lib/interactif/qcmBuilder'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { spline, type NoeudSpline } from '../../lib/mathFonctions/Spline'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '33b45'
export const refs = {
  'fr-fr': ['TSA3-42', 'TCA7-42'],
  'fr-ch': ['3mQCM-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Étudier la convexité d'une fonction (QCM issus sujet BAC)"
export const dateDePublication = '03/11/2024'

function correctionAvecPuces(
  analyses: string[],
  bonneReponse: string,
  propositions: string[],
): string {
  const avecPointFinal = (texte: string): string =>
    /[.!?]$/.test(texte.trim()) ? texte : `${texte}.`
  const items = analyses.map((analyse, index) => {
    const proposition = texteEnCouleurEtGras(
      avecPointFinal(propositions[index]),
      'black',
    )
    const justification = avecPointFinal(analyse).replace(
      /cette proposition est vraie/gi,
      (verdict) => texteEnCouleurEtGras(verdict, 'black'),
    )
    if (context.isTypst) return `${proposition} ${justification}`
    if (context.isHtml) {
      return `<div><div>${proposition}</div><div class="-mt-1 leading-tight">${justification}</div></div>`
    }
    return `${proposition}<br>${justification}`
  })
  const bonneReponseEnGras = texteEnCouleurEtGras(bonneReponse, 'black')
  return `On reprend chaque proposition une par une.<br>${createList({ items, style: 'fleches', classOptions: context.isHtml && !context.isTypst ? 'space-y-4' : undefined })}<br>La bonne réponse est donc${sp()}: ${bonneReponseEnGras}.`
}

function tableauVariationsPolynesie(): string {
  return tableauDeVariation({
    tabInit: [
      [
        ['$x$', 2, 20],
        ["$\\text{variations de } f'$", 3, 80],
      ],
      ['$-2$', 20, '$0$', 20, '$2$', 20],
    ],
    tabLines: [['Var', 10, '+/$1$', 20, '-/$-2$', 20, '+/$-1$', 10]],
    espcl: 5,
    deltacl: 0.8,
    lgt: 8,
    scale: 1,
  })
}

function graphiqueMars2023G1({
  zero,
  echelle,
  maximum,
  pointInflexion,
  hauteurExtremum,
}: {
  zero: number
  echelle: number
  maximum: number
  pointInflexion: number
  hauteurExtremum: number
}): string {
  const yUnite = 0.85
  const xMax = pointInflexion + 3 * echelle
  const amplitude = Math.abs(hauteurExtremum)
  const yMin = -amplitude - 1
  const yMax = amplitude + 1
  const coefficient = (hauteurExtremum * Math.exp(maximum / echelle)) / echelle
  const fonction = (x: number) =>
    coefficient * (x - zero) * Math.exp(-x / echelle)
  const r = repere({
    xMin: 0,
    xMax,
    yMin,
    yMax,
    yUnite,
    xLabelMin: 0,
    xLabelMax: xMax,
    yLabelMin: yMin,
    yLabelMax: yMax,
    xThickDistance: 1,
    yThickDistance: 1,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 1,
    grilleSecondaireXMin: 0,
    grilleSecondaireXMax: xMax,
    grilleSecondaireYMin: yMin,
    grilleSecondaireYMax: yMax,
  })
  const ordonneeP = fonction(pointInflexion)
  const penteEnP =
    coefficient *
    Math.exp(-pointInflexion / echelle) *
    (1 - (pointInflexion - zero) / echelle)
  const demiLongueurTangente = 2.5 * echelle
  const tangenteAuMaximum = segment(
    Math.max(0, maximum - 2 * echelle),
    hauteurExtremum * yUnite,
    Math.min(xMax, maximum + 2 * echelle),
    hauteurExtremum * yUnite,
  )
  const tangenteEnP = segment(
    pointInflexion - demiLongueurTangente,
    (ordonneeP - penteEnP * demiLongueurTangente) * yUnite,
    pointInflexion + demiLongueurTangente,
    (ordonneeP + penteEnP * demiLongueurTangente) * yUnite,
  )
  const pointP = pointAbstrait(
    pointInflexion,
    ordonneeP * yUnite,
    'P',
    hauteurExtremum > 0 ? 'above right' : 'below right',
  )
  const nomDuPoint = labelPoint(pointP)
  const nomCourbe = texteParPosition(
    '$\\mathcal{C}_f$',
    xMax - 0.8,
    fonction(xMax) + (hauteurExtremum > 0 ? 0.45 : -0.45),
    0,
    bleuMathalea,
    1,
  )

  return mathalea2d(
    {
      xmin: -0.5,
      xmax: xMax + 0.5,
      ymin: yMin * yUnite - 0.1,
      ymax: yMax * yUnite + 0.25,
      pixelsParCm: 20,
      scale: 0.95,
      center: !context.isHtml,
      centerLatex: true,
    },
    r,
    courbe(fonction, {
      repere: r,
      xMin: 0,
      xMax,
      yMin,
      yMax,
      color: bleuMathalea,
      epaisseur: 2,
    }),
    tangenteAuMaximum,
    tangenteEnP,
    nomDuPoint,
    nomCourbe,
  )
}
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class metropoleSept2024Ex4Q1 extends ExerciceQcmA {
  private ordreSousCasDeriveePremiere = combinaisonListes([1, 2, 3])
  private indiceSousCasDeriveePremiere = 0
  private ordreSousCasTableau = combinaisonListes([1, 2, 3])
  private indiceSousCasTableau = 0
  private ordreSousCasCourbe = combinaisonListes([1, 2, 3])
  private indiceSousCasCourbe = 0
  private ordreFamillesCourbe = combinaisonListes([1, -1])
  private indiceFamilleCourbe = 0

  versionAvecDeriveeSeconde(): void {
    const nombrePointsInflexion = randint(1, 3)
    const positionTangence = randint(0, nombrePointsInflexion)
    const pas = 1.4
    const nombreIntervalles = 2 * nombrePointsInflexion + 2
    let x = -Math.round((nombreIntervalles * pas) / 2)
    let signe = randint(0, 1) === 0 ? -1 : 1
    const abscissesChangementsDeSigne: number[] = []
    let abscisseTangence = 0
    const nuage: NoeudSpline[] = []

    const ajouteNoeud = (y: number, derivee: number): void => {
      nuage.push({
        x,
        y,
        deriveeGauche: derivee,
        deriveeDroit: derivee,
        isVisible: false,
      })
      x = Number((x + pas).toFixed(1))
    }

    // Les dérivées à gauche et à droite sont identiques à chaque nœud :
    // la courbe obtenue est dérivable sur tout l'intervalle.
    ajouteNoeud(signe * randint(2, 4), 0)
    for (let i = 0; i <= nombrePointsInflexion; i++) {
      if (i === positionTangence) {
        abscisseTangence = x
        ajouteNoeud(0, 0)
        ajouteNoeud(signe * randint(2, 4), 0)
      }
      if (i < nombrePointsInflexion) {
        abscissesChangementsDeSigne.push(x)
        ajouteNoeud(0, -signe * randint(2, 3))
        signe *= -1
        ajouteNoeud(signe * randint(2, 4), 0)
      }
    }
    const f = spline(nuage)
    const nombresEnLettres = ['Zéro', 'Un', 'Deux', 'Trois', 'Quatre']
    this.reponses = [
      nombresEnLettres[nombrePointsInflexion],
      ...[0, 1, 2, 3, 4]
        .filter((valeur) => valeur !== nombrePointsInflexion)
        .slice(0, 3)
        .map((valeur) => nombresEnLettres[valeur]),
    ]

    const borneGauche = nuage[0].x
    const borneDroite = nuage[nuage.length - 1].x
    const graduationXMin = Math.ceil(borneGauche)
    const graduationXMax = Math.floor(borneDroite)
    const rep = repere({
      xMin: borneGauche - 0.5,
      xMax: borneDroite + 0.5,
      yMin: -4.5,
      yMax: 4.5,
      xLabelMin: graduationXMin,
      xLabelMax: graduationXMax,
      yLabelMin: -4,
      yLabelMax: 4,
      xThickDistance: 1,
      yThickDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
    })
    const maCourbe = f.courbe({
      color: bleuMathalea,
      epaisseur: 2.5,
      ajouteNoeuds: false,
    })
    const nomCourbe = texteParPosition(
      '$\\mathcal{C}_{f^{\\prime\\prime}}$',
      borneDroite - 0.3,
      f.fonction(borneDroite) + (f.fonction(borneDroite) > 0 ? 0.5 : -0.5),
      0,
      bleuMathalea,
      1,
    )
    this.enonce = `On considère une fonction $f$ définie et deux fois dérivable sur l'intervalle $[${texNombre(borneGauche, 1)};${texNombre(borneDroite, 1)}]$. On note $\\mathcal{C}_{f^{\\prime\\prime}}$ la courbe représentative de sa dérivée seconde $f^{\\prime\\prime}$. Cette courbe est représentée ci-dessous dans un repère orthonormé.<br>`
    this.enonce += mathalea2d(
      Object.assign({}, fixeBordures([rep, maCourbe, nomCourbe]), {
        pixelsParCm: 24,
        scale: 0.75,
      }),
      rep,
      maCourbe,
      nomCourbe,
    )
    this.enonce +=
      `Combien de points d'inflexion possède la courbe représentative de $f$ sur cet intervalle${sp()}?`

    const abscissesFormatees = abscissesChangementsDeSigne.map(
      (abscisse) => `$${texNombre(abscisse, 1)}$`,
    )
    const listeAbscisses =
      abscissesFormatees.length === 1
        ? abscissesFormatees[0]
        : `${abscissesFormatees.slice(0, -1).join(', ')} et ${abscissesFormatees.at(-1)}`
    const consequencesChangementsDeSigne =
      nombrePointsInflexion === 1
        ? `À l'abscisse ${listeAbscisses}, $f^{\\prime\\prime}$ change de signe. La courbe $\\mathcal{C}_f$ change donc de convexité. Elle admet donc un point d'inflexion d'abscisse ${listeAbscisses}.`
        : `Aux abscisses ${listeAbscisses}, $f^{\\prime\\prime}$ change de signe. La courbe $\\mathcal{C}_f$ change donc de convexité en chacune de ces abscisses. Elle admet donc des points d'inflexion d'abscisses respectives ${listeAbscisses}.`
    const nombrePointsInflexionEnTexte = `${nombresEnLettres[nombrePointsInflexion].toLowerCase()} point${nombrePointsInflexion > 1 ? 's' : ''} d'inflexion`
    this.correction = `La courbe $\\mathcal{C}_f$ admet un point d'inflexion en un point d'abscisse $a$ lorsque sa convexité change en $a$. Comme $f$ est deux fois dérivable, ce changement de convexité se produit lorsque $f^{\\prime\\prime}$ change de signe en $a$.<br><br>`
    this.correction += `${consequencesChangementsDeSigne}<br><br>`
    this.correction += `En $x=${texNombre(abscisseTangence, 1)}$, $f^{\\prime\\prime}$ s'annule mais ne change pas de signe. La courbe $\\mathcal{C}_f$ ne change donc pas de convexité en cette abscisse${sp()}: ce point n'est pas un point d'inflexion.<br><br>`
    this.correction += `Finalement, la courbe $\\mathcal{C}_f$ admet ${texteEnCouleurEtGras(nombrePointsInflexionEnTexte, 'black')}.`
  }

  versionAvecDeriveePremiere(): void {
    if (
      this.indiceSousCasDeriveePremiere >=
      this.ordreSousCasDeriveePremiere.length
    ) {
      this.ordreSousCasDeriveePremiere = combinaisonListes([1, 2, 3])
      this.indiceSousCasDeriveePremiere = 0
    }
    const sousCas =
      this.ordreSousCasDeriveePremiere[this.indiceSousCasDeriveePremiere]
    this.indiceSousCasDeriveePremiere++
    const borneGauche = randint(-5, -3)
    const largeurCroissance = randint(2, 3)
    const largeurDecroissance = randint(2, 3)
    const largeurFinale = randint(2, 3)
    const extremumHaut = randint(2, 4)
    const extremumBas = -randint(1, 3)
    const xMaximum = borneGauche + largeurCroissance
    const xMinimum = xMaximum + largeurDecroissance
    const borneDroite = xMinimum + largeurFinale
    const nuage: NoeudSpline[] = [
      {
        x: borneGauche,
        y: extremumHaut - randint(2, 3),
        deriveeGauche: 1,
        deriveeDroit: 1,
        isVisible: false,
      },
      {
        x: xMaximum,
        y: extremumHaut,
        deriveeGauche: 0,
        deriveeDroit: 0,
        isVisible: false,
      },
      {
        x: xMinimum,
        y: extremumBas,
        deriveeGauche: 0,
        deriveeDroit: 0,
        isVisible: false,
      },
      {
        x: borneDroite,
        y: extremumBas + randint(2, 3),
        deriveeGauche: 1,
        deriveeDroit: 1,
        isVisible: false,
      },
    ]
    const fonctionDerivee = spline(nuage)
    const yMin = Math.min(...nuage.map((noeud) => noeud.y)) - 1
    const yMax = Math.max(...nuage.map((noeud) => noeud.y)) + 1
    const rep = repere({
      xMin: borneGauche - 0.5,
      xMax: borneDroite + 0.5,
      yMin,
      yMax,
      xLabelMin: borneGauche,
      xLabelMax: borneDroite,
      yLabelMin: Math.ceil(yMin),
      yLabelMax: Math.floor(yMax),
      xThickDistance: 1,
      yThickDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
    })
    const courbeDerivee = fonctionDerivee.courbe({
      color: bleuMathalea,
      epaisseur: 2.5,
      ajouteNoeuds: false,
    })
    const nomCourbe = texteParPosition(
      "$\\mathcal{C}_{f'}$",
      borneDroite - 0.3,
      fonctionDerivee.fonction(borneDroite) +
        (fonctionDerivee.fonction(borneDroite) > 0 ? 0.5 : -0.5),
      0,
      bleuMathalea,
      1,
    )

    const intervalles = {
      premier: `[${texNombre(borneGauche)};${texNombre(xMaximum)}]`,
      central: `[${texNombre(xMaximum)};${texNombre(xMinimum)}]`,
      dernier: `[${texNombre(xMinimum)};${texNombre(borneDroite)}]`,
    }
    switch (sousCas) {
      case 1:
        this.reponses = [
          `$f$ est convexe sur $${intervalles.premier}$`,
          `$f$ est concave sur $${intervalles.premier}$`,
          `$f$ est convexe sur $${intervalles.central}$`,
          `$f'$ est décroissante sur $${intervalles.premier}$`,
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $${intervalles.premier}$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ est convexe${sp()}: cette proposition est vraie.`,
            `Sur $${intervalles.premier}$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ n'est pas concave${sp()}: cette proposition est fausse.`,
            `Sur $${intervalles.central}$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ n'est pas convexe${sp()}: cette proposition est fausse.`,
            `Sur $${intervalles.premier}$, on observe que $f'$ est croissante${sp()}: la proposition affirmant qu'elle est décroissante est fausse.`,
          ],
          `$f$ est convexe sur $${intervalles.premier}$`,
          this.reponses,
        )
        break
      case 2:
        this.reponses = [
          `$f$ est concave sur $${intervalles.central}$`,
          `$f$ est convexe sur $${intervalles.central}$`,
          `$f$ est concave sur $${intervalles.premier}$`,
          `$f'$ est croissante sur $${intervalles.central}$`,
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $${intervalles.central}$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave${sp()}: cette proposition est vraie.`,
            `Sur $${intervalles.central}$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ n'est pas convexe${sp()}: cette proposition est fausse.`,
            `Sur $${intervalles.premier}$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ n'est pas concave${sp()}: cette proposition est fausse.`,
            `Sur $${intervalles.central}$, on observe que $f'$ est décroissante${sp()}: la proposition affirmant qu'elle est croissante est fausse.`,
          ],
          `$f$ est concave sur $${intervalles.central}$`,
          this.reponses,
        )
        break
      case 3:
        this.reponses = [
          `$f'$ est croissante sur $${intervalles.dernier}$`,
          `$f$ est concave sur $${intervalles.dernier}$`,
          `$f$ est convexe sur $${intervalles.central}$`,
          `$f'$ est décroissante sur $${intervalles.dernier}$`,
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $${intervalles.dernier}$, on observe que $f'$ est croissante${sp()}: cette proposition est vraie.`,
            `Sur $${intervalles.dernier}$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ est convexe et non concave${sp()}: cette proposition est fausse.`,
            `Sur $${intervalles.central}$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave et non convexe${sp()}: cette proposition est fausse.`,
            `Sur $${intervalles.dernier}$, on observe que $f'$ est croissante, donc $f'$ n'est pas décroissante${sp()}: cette proposition est fausse.`,
          ],
          `$f'$ est croissante sur $${intervalles.dernier}$`,
          this.reponses,
        )
        break
    }
    this.enonce = `On considère une fonction $f$ définie et deux fois dérivable sur l'intervalle $[${texNombre(borneGauche)};${texNombre(borneDroite)}]$. On note $\\mathcal{C}_{f'}$ la courbe représentative de sa dérivée $f^{\\prime}$. Cette courbe est représentée ci-dessous.<br>`
    this.enonce += mathalea2d(
      Object.assign({}, fixeBordures([rep, courbeDerivee, nomCourbe]), {
        pixelsParCm: 24,
        scale: 0.75,
      }),
      rep,
      courbeDerivee,
      nomCourbe,
    )
    this.enonce += `On peut en déduire que${sp()}:`
  }

  versionAvecTableauVariations(): void {
    if (this.indiceSousCasTableau >= this.ordreSousCasTableau.length) {
      this.ordreSousCasTableau = combinaisonListes([1, 2, 3])
      this.indiceSousCasTableau = 0
    }
    const sousCas = this.ordreSousCasTableau[this.indiceSousCasTableau]
    this.indiceSousCasTableau++

    this.enonce = `On considère une fonction $f$ définie et deux fois dérivable sur $[-2~;~2]$. Le tableau de variations de la fonction $f^{\\prime}$, dérivée de la fonction $f$, sur l'intervalle $[-2~;~2]$ est donné par${sp()}:<br><br>${tableauVariationsPolynesie()}<br><br>On peut en déduire que${sp()}:`
    switch (sousCas) {
      case 1:
        this.reponses = [
          '$f$ est concave sur $[-2~;~0]$',
          '$f$ est convexe sur $[-2~;~-1]$',
          '$f$ est concave sur $[0~;~1]$',
          '$f$ est convexe sur $[-1~;~2]$',
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $[-2~;~0]$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave${sp()}: cette proposition est vraie.`,
            `Sur $[-2~;~-1]$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave et non convexe${sp()}: cette proposition est fausse.`,
            `Sur $[0~;~1]$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ est convexe et non concave${sp()}: cette proposition est fausse.`,
            `Sur $[-1~;~2]$, $f'$ décroît d'abord puis croît, donc $f$ change de convexité${sp()}: cette proposition est fausse.`,
          ],
          '$f$ est concave sur $[-2~;~0]$',
          this.reponses,
        )
        break
      case 2:
        this.reponses = [
          '$f$ est convexe sur $[0~;~2]$',
          '$f$ est concave sur $[0~;~1]$',
          '$f$ est convexe sur $[-2~;~-1]$',
          '$f^{\\prime}$ est convexe sur $[-2~;~2]$',
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $[0~;~2]$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ est convexe${sp()}: cette proposition est vraie.`,
            `Sur $[0~;~1]$, $f'$ est croissante, donc $f''(x)\\geqslant0$, donc $f$ est convexe et non concave${sp()}: cette proposition est fausse.`,
            `Sur $[-2~;~-1]$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave et non convexe${sp()}: cette proposition est fausse.`,
            `Sur $[-2~;~2]$, le tableau donne seulement les variations de $f'$ ; il ne donne pas les variations de $f''$, donc il ne permet pas d'affirmer que $f'$ est convexe${sp()}: cette proposition est fausse.`,
          ],
          '$f$ est convexe sur $[0~;~2]$',
          this.reponses,
        )
        break
      case 3:
        this.reponses = [
          '$f$ est concave sur $[-2~;~-1]$',
          '$f^{\\prime}$ est concave sur $[-2~;~2]$',
          '$f$ est concave sur $[-2~;~2]$',
          '$f$ est convexe sur $[-2~;~-1]$',
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $[-2~;~-1]$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave${sp()}: cette proposition est vraie.`,
            "Sur $[-2~;~2]$, le tableau donne seulement les variations de $f'$ ; l'aspect en cuvette ne renseigne pas sur sa convexité, donc cette proposition est fausse.",
            `Sur $[-2~;~2]$, $f'$ est décroissante sur $[-2~;~0]$ puis croissante sur $[0~;~2]$, donc $f$ n'est pas concave sur tout l'intervalle${sp()}: cette proposition est fausse.`,
            `Sur $[-2~;~-1]$, $f'$ est décroissante, donc $f''(x)\\leqslant0$, donc $f$ est concave et non convexe${sp()}: cette proposition est fausse.`,
          ],
          '$f$ est concave sur $[-2~;~-1]$',
          this.reponses,
        )
        break
    }
  }

  versionAvecCourbeEtPointInflexion(): void {
    if (this.indiceSousCasCourbe >= this.ordreSousCasCourbe.length) {
      this.ordreSousCasCourbe = combinaisonListes([1, 2, 3])
      this.indiceSousCasCourbe = 0
    }
    const sousCas = this.ordreSousCasCourbe[this.indiceSousCasCourbe]
    this.indiceSousCasCourbe++
    if (this.indiceFamilleCourbe >= this.ordreFamillesCourbe.length) {
      this.ordreFamillesCourbe = combinaisonListes([1, -1])
      this.indiceFamilleCourbe = 0
    }
    const orientation = this.ordreFamillesCourbe[this.indiceFamilleCourbe]
    this.indiceFamilleCourbe++
    const zero = randint(1, 2)
    const echelle = randint(2, 3)
    const maximum = zero + echelle
    const pointInflexion = zero + 2 * echelle
    const hauteurExtremum = orientation * randint(4, 6)
    const natureExtremum = orientation === 1 ? 'maximum' : 'minimum'
    const intervalleApresInflexion = `]${texNombre(pointInflexion)}~;~+\\infty[`
    const intervalleAvantMaximum = `]${texNombre(zero)}~;~${texNombre(maximum)}[`
    const intervalleAvantInflexion = `]${texNombre(maximum)}~;~${texNombre(pointInflexion)}[`
    const signeF = orientation === 1 ? '>0' : '<0'
    const signeFPrimeAvantMaximum = orientation === 1 ? '>0' : '<0'
    const signeFPrimeApresMaximum = orientation === 1 ? '<0' : '>0'
    const signeFSecondeAvantInflexion = orientation === 1 ? '<0' : '>0'
    const signeFSecondeApresInflexion = orientation === 1 ? '>0' : '<0'

    this.enonce =
      `La courbe $\\mathcal{C}_f$ ci-dessous représente une fonction $f$ définie et deux fois dérivable sur $]0~;~+\\infty[$. On sait que${sp()}:<br><br>- le ${natureExtremum} de la fonction $f$ est atteint au point d'abscisse $${texNombre(maximum)}$ ;<br>- le point P d'abscisse $${texNombre(pointInflexion)}$ est l'unique point d'inflexion de la courbe $\\mathcal{C}_f$.<br><br>` +
      graphiqueMars2023G1({
        zero,
        echelle,
        maximum,
        pointInflexion,
        hauteurExtremum,
      }) +
      `On peut affirmer que${sp()}:`
    switch (sousCas) {
      case 1:
        this.reponses = [
          `pour tout $x\\in${intervalleApresInflexion}$, $f(x)$ et $f''(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleApresInflexion}$, $f(x)$ et $f'(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleApresInflexion}$, $f'(x)$ et $f''(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleApresInflexion}$, $f(x)$ et $f''(x)$ sont de signes contraires`,
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $${intervalleApresInflexion}$, on a $f(x)${signeF}$ et $f''(x)${signeFSecondeApresInflexion}$, donc $f(x)$ et $f''(x)$ sont de même signe${sp()}: cette proposition est vraie.`,
            `Sur $${intervalleApresInflexion}$, on a $f(x)${signeF}$ et $f'(x)${signeFPrimeApresMaximum}$, donc ces deux nombres sont de signes contraires${sp()}: cette proposition est fausse.`,
            `Sur $${intervalleApresInflexion}$, on a $f'(x)${signeFPrimeApresMaximum}$ et $f''(x)${signeFSecondeApresInflexion}$, donc ces deux nombres sont de signes contraires${sp()}: cette proposition est fausse.`,
            `Sur $${intervalleApresInflexion}$, on a $f(x)${signeF}$ et $f''(x)${signeFSecondeApresInflexion}$, donc ces deux nombres sont de même signe${sp()}: cette proposition est fausse.`,
          ],
          `$f(x)$ et $f''(x)$ sont de même signe sur $${intervalleApresInflexion}$`,
          this.reponses,
        )
        break
      case 2:
        this.reponses = [
          `pour tout $x\\in${intervalleAvantMaximum}$, $f(x)$ et $f'(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleAvantMaximum}$, $f(x)$ et $f''(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleAvantMaximum}$, $f'(x)$ et $f''(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleAvantMaximum}$, $f(x)$ et $f'(x)$ sont de signes contraires`,
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $${intervalleAvantMaximum}$, on a $f(x)${signeF}$ et $f'(x)${signeFPrimeAvantMaximum}$, donc ces deux nombres sont de même signe${sp()}: cette proposition est vraie.`,
            `Sur $${intervalleAvantMaximum}$, on a $f(x)${signeF}$ et $f''(x)${signeFSecondeAvantInflexion}$, donc ces deux nombres sont de signes contraires${sp()}: cette proposition est fausse.`,
            `Sur $${intervalleAvantMaximum}$, on a $f'(x)${signeFPrimeAvantMaximum}$ et $f''(x)${signeFSecondeAvantInflexion}$, donc ces deux nombres sont de signes contraires${sp()}: cette proposition est fausse.`,
            `Sur $${intervalleAvantMaximum}$, on a $f(x)${signeF}$ et $f'(x)${signeFPrimeAvantMaximum}$, donc ces deux nombres sont de même signe${sp()}: cette proposition est fausse.`,
          ],
          `$f(x)$ et $f'(x)$ sont de même signe sur $${intervalleAvantMaximum}$`,
          this.reponses,
        )
        break
      case 3:
        this.reponses = [
          `pour tout $x\\in${intervalleAvantInflexion}$, $f'(x)$ et $f''(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleAvantInflexion}$, $f(x)$ et $f'(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleAvantInflexion}$, $f(x)$ et $f''(x)$ sont de même signe`,
          `pour tout $x\\in${intervalleAvantInflexion}$, $f'(x)$ et $f''(x)$ sont de signes contraires`,
        ]
        this.correction = correctionAvecPuces(
          [
            `Sur $${intervalleAvantInflexion}$, on a $f'(x)${signeFPrimeApresMaximum}$ et $f''(x)${signeFSecondeAvantInflexion}$, donc ces deux nombres sont de même signe${sp()}: cette proposition est vraie.`,
            `Sur $${intervalleAvantInflexion}$, on a $f(x)${signeF}$ et $f'(x)${signeFPrimeApresMaximum}$, donc ces deux nombres sont de signes contraires${sp()}: cette proposition est fausse.`,
            `Sur $${intervalleAvantInflexion}$, on a $f(x)${signeF}$ et $f''(x)${signeFSecondeAvantInflexion}$, donc ces deux nombres sont de signes contraires${sp()}: cette proposition est fausse.`,
            `Sur $${intervalleAvantInflexion}$, on a $f'(x)${signeFPrimeApresMaximum}$ et $f''(x)${signeFSecondeAvantInflexion}$, donc ces deux nombres sont de même signe${sp()}: cette proposition est fausse.`,
          ],
          `$f'(x)$ et $f''(x)$ sont de même signe sur $${intervalleAvantInflexion}$`,
          this.reponses,
        )
        break
    }
  }

  versionAleatoire = (typeImpose?: number) => {
    const typeQuestion =
      typeImpose ??
      (this.sup3 >= 1 && this.sup3 <= 4 ? this.sup3 : randint(1, 4))
    switch (typeQuestion) {
      case 1:
        this.versionAvecCourbeEtPointInflexion()
        break
      case 2:
        this.versionAvecDeriveePremiere()
        break
      case 3:
        this.versionAvecDeriveeSeconde()
        break
      case 4:
        this.versionAvecTableauVariations()
        break
    }
    this.reponses = this.reponses.map((reponse) =>
      /[.!?]$/.test(reponse.trim()) ? reponse : `${reponse}.`,
    )
  }

  nouvelleVersion(): void {
    this.listeQuestions = []
    this.listeCorrections = []
    const typesQuestions = combinaisonListes(
      this.sup3 >= 1 && this.sup3 <= 4 ? [this.sup3] : [1, 2, 3, 4],
      this.nbQuestions,
    )

    for (let index = 0; index < this.nbQuestions; index++) {
      this.versionAleatoire(typesQuestions[index])
      const qcmData = buildQcmForExercise(this, index, {
        question: this.enonce,
        correction: this.correction,
        propositions: this.reponses.map((reponse, indiceReponse) => ({
          texte: reponse,
          statut: indiceReponse === 0,
        })),
        options: this.options,
        ajouteQcmCorr: this.ajouteQcmCorr,
        messageMode: 'single',
      })
      this.listeQuestions[index] = qcmData.question
      this.listeCorrections[index] = qcmData.correction
    }
  }

  constructor() {
    super()
    this.sup3 = 5
    this.besoinFormulaire3Numerique = [
      'Situations proposées',
      5,
      "1 : Courbe de f\n2 : Courbe de f'\n3 : Courbe de f''\n4 : Tableau de variations de f'\n5 : Mélange",
    ]

    this.versionAleatoire()
  }
}
