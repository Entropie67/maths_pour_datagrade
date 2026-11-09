import { arc } from '../../../lib/2d/Arc'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { nommePolygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { texteSurSegment } from '../../../lib/2d/texteSurSegment'
import { rotation } from '../../../lib/2d/transformations'
import {
    triangle2points1angle1longueur,
    triangle2points2angles,
    triangle2points2longueurs,
} from '../../../lib/2d/triangles'
import { angleOriente } from '../../../lib/2d/utilitairesGeometriques'
import { pointAdistance, pointSurSegment } from '../../../lib/2d/utilitairesPoint'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffleLettres } from '../../../lib/outils/arrayOutils'
import {
    miseEnEvidence,
    texteGras,
    texteItalique,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import Exercice from '../../Exercice'

export const titre = 'Résolution de triangles (cas non ambigus)'
export const dateDePublication = '16/03/2026'
export const interactifReady = true

export const uuid = 'a3f7b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoTri-5'],
}

function texDeg(value: string) {
  return `${value}^\\circ`
}

function texResult(value: number) {
  return texNombre(arrondi(value, 2), 2, true)
}

type TriangleFigureRenderMetrics = {
  pixelsParCm: number
  scale: number
}

function getTriangleFigureRenderMetrics(
  objets: NestedObjetMathalea2dArray,
): TriangleFigureRenderMetrics {
  const bordures = fixeBordures(objets)
  const largeur = Math.max(bordures.xmax - bordures.xmin, 1)
  const hauteur = Math.max(bordures.ymax - bordures.ymin, 1)
  return {
    pixelsParCm: Math.max(
      18,
      Math.min(75, Math.min(250 / largeur, 180 / hauteur)),
    ),
    scale: Math.max(0.5, Math.min(1.2, Math.min(6 / largeur, 4.5 / hauteur))),
  }
}

function renderTriangleFigure(
  objets: NestedObjetMathalea2dArray,
  metrics: TriangleFigureRenderMetrics = getTriangleFigureRenderMetrics(objets),
) {
  const bordures = fixeBordures(objets)
  return mathalea2d(
    {
      ...bordures,
      pixelsParCm: metrics.pixelsParCm,
      scale: metrics.scale,
      display: 'inline-block',
    },
    objets,
  )
}

function angleDisplaySettings(angle: number) {
  if (angle < 40) return { distance: 0.9, ecart: 0.12 }
  if (angle < 70) return { distance: 0.75, ecart: 0.12 }
  return { distance: 0.65, ecart: 0.1 }
}

function estimateLatexLabelWidthPx(label: string) {
  const simplified = label
    .replace(/\\,/g, ' ')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(?:d)?frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\circ/g, '°')
    .replace(/\\left|\\right/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const charCount = Math.max(simplified.length, 1)
  return 4 + charCount * 3.2
}

export function computeTrigo5AngleLabelDistance({
  angleDegrees,
  distance,
  ecart,
  label,
  pixelsParCm,
}: {
  angleDegrees: number
  distance: number
  ecart: number
  label: string
  pixelsParCm: number
}) {
  const effectivePixelsParCm = Math.max(pixelsParCm, 1)
  const baseDistance = distance + (ecart * 20) / effectivePixelsParCm
  const labelWidthCm = estimateLatexLabelWidthPx(label) / effectivePixelsParCm
  const labelHeightCm = 9 / effectivePixelsParCm
  const labelHalfDiagonal = Math.hypot(labelWidthCm / 2, labelHeightCm / 2)
  const halfAngleRadians =
    (Math.max(Math.abs(angleDegrees), 18) * Math.PI) / 360
  const safetyPaddingCm = 4 / effectivePixelsParCm
  const minDistance =
    (labelHalfDiagonal + safetyPaddingCm) /
    Math.max(Math.sin(halfAngleRadians), 0.25)

  return Math.max(baseDistance, minDistance)
}

function createTrigo5AngleMeasure(
  depart: ReturnType<typeof pointAbstrait>,
  sommet: ReturnType<typeof pointAbstrait>,
  arrivee: ReturnType<typeof pointAbstrait>,
  label: string,
  pixelsParCm: number,
) {
  const angle = angleOriente(depart, sommet, arrivee)
  const { distance, ecart } = angleDisplaySettings(Math.abs(angle))
  const startPoint = pointSurSegment(sommet, depart, distance)
  const labelDistance = computeTrigo5AngleLabelDistance({
    angleDegrees: angle,
    distance,
    ecart,
    label,
    pixelsParCm,
  })
  const labelPoint = rotation(
    pointSurSegment(sommet, startPoint, labelDistance),
    sommet,
    angle / 2,
  )
  const angleArc = arc(startPoint, sommet, angle, false, 'none', 'black', 0.2)
  angleArc.epaisseur = 1
  return [
    latex2d(label, labelPoint.x, labelPoint.y, {
      color: 'black',
      letterSize: 'scriptsize',
    }),
    angleArc,
  ]
}

function createTriangleFigure(
  params: Omit<BuildFigureParams, 'showAngleMeasures' | 'pixelsParCmForAngles'>,
) {
  const objetsSansAngles = buildFigure({
    ...params,
    showAngleMeasures: false,
  })
  const metrics = getTriangleFigureRenderMetrics(objetsSansAngles)
  const objets = buildFigure({
    ...params,
    showAngleMeasures: true,
    pixelsParCmForAngles: metrics.pixelsParCm,
  })
  return renderTriangleFigure(objets, metrics)
}

/**
 * Résolution de triangles — cas non ambigus (ACA, CAC, CCC)
 * @author Nathan Scheinmann
 */
export default class ResolutionTrianglesNonAmbigus extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.sup = '5'
    this.sup2 = true
    this.besoinFormulaireTexte = [
      'Type de cas',
      [
        'Nombres séparés par des tirets :',
        '1 : ACA',
        '2 : AAC',
        '3 : CAC',
        '4 : CCC',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      "Afficher le triangle dans l'énoncé",
      true,
    ]
  }

  nouvelleVersion() {
    const typesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const listeTypes = combinaisonListes(typesDisponibles, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeDeNomsDePolygones = ['QD']
      const nom = shuffleLettres(creerNomDePolygone(3, listeDeNomsDePolygones))
      listeDeNomsDePolygones.push(nom)
      const precisionInstruction = texteItalique(
        'Donner les réponses arrondies au centième.',
      )

      // Vertices: nom[0], nom[1], nom[2]
      // Side naming: lowercase of opposite vertex
      //   sa = lowercase(nom[0]) = side opposite nom[0] = segment nom[1]nom[2]
      //   sb = lowercase(nom[1]) = side opposite nom[1] = segment nom[0]nom[2]
      //   sc = lowercase(nom[2]) = side opposite nom[2] = segment nom[0]nom[1]
      const sa = nom[0].toLowerCase() // opposite nom[0], i.e. nom[1]nom[2]
      const sb = nom[1].toLowerCase() // opposite nom[1], i.e. nom[0]nom[2]
      const sc = nom[2].toLowerCase() // opposite nom[2], i.e. nom[0]nom[1]
      // 3-letter angle names
      const angA = `${nom[1]}${nom[0]}${nom[2]}`
      const angB = `${nom[0]}${nom[1]}${nom[2]}`
      const angC = `${nom[0]}${nom[2]}${nom[1]}`

      const typeQ = listeTypes[i]
      let texte = ''
      let texteCorr = ''

      if (typeQ === 1) {
        // ======== ACA (angle-côté-angle) ========
        let angleA: number, angleB: number, angleC: number, sideC: number
        let cptDo = 0
        do {
          cptDo++
          angleA = randint(15, 150) + randint(0, 9) / 10
          angleB = randint(15, 150) + randint(0, 9) / 10
          angleC = 180 - angleA - angleB
          sideC = randint(3, 15) + randint(0, 99) / 100
        } while (
          (angleC < 10 ||
            angleC > 170 ||
            Math.abs(angleA - 90) < 3 ||
            Math.abs(angleB - 90) < 3 ||
            Math.abs(angleC - 90) < 3) &&
          cptDo < 30
        )

        const angleARad = (angleA * Math.PI) / 180
        const angleBRad = (angleB * Math.PI) / 180
        const angleCRad = (angleC * Math.PI) / 180
        const sideA = (sideC * Math.sin(angleARad)) / Math.sin(angleCRad)
        const sideB = (sideC * Math.sin(angleBRad)) / Math.sin(angleCRad)

        const rotationDeg = randint(-170, 170)
        const figure = createTriangleFigure({
          nom,
          type: 'ACA',
          sideC,
          angleA,
          angleB,
          sideA,
          sideB,
          rotationDeg,
        })

        texte = `Résoudre le triangle $${nom}$ sachant que $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))}$, $\\widehat{${angB}} = ${texDeg(texNombre(angleB, 1))}$ et $${sc} = ${nom[0]}${nom[1]} = ${texNombre(sideC, 2)}$.`
        if (this.sup2) texte += '<br>' + figure
        texte += `<br>${precisionInstruction}`

        handleAnswers(this, i, {
          champ1: { value: texResult(angleC) },
          champ2: { value: texResult(sideA) },
          champ3: { value: texResult(sideB) },
        })
        if (this.interactif) {
          texte +=
            '<br>' +
            remplisLesBlancs(
              this,
              i,
              `\\widehat{${angC}} \\approx \\;%{champ1}°\\quad ${sa} \\approx \\;%{champ2}\\quad ${sb} \\approx \\;%{champ3}`,
            )
        }

        // Correction
        texteCorr = ''
        if (!this.sup2) texteCorr += figure + '<br>'
        texteCorr += `On est dans le cas ${texteGras('A-C-A')} (angle-côté-angle).<br><br>`
        texteCorr += `${texteGras('Angle manquant :')}<br>
$\\widehat{${angC}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angB}} = ${texDeg('180')} - ${texDeg(texNombre(angleA, 1))} - ${texDeg(texNombre(angleB, 1))} = ${texDeg(miseEnEvidence(texResult(angleC)))}$<br><br>`

        texteCorr += `${texteGras('Théorème du sinus :')}<br>
$\\dfrac{${sa}}{\\sin(\\widehat{${angA}})} = \\dfrac{${sb}}{\\sin(\\widehat{${angB}})} = \\dfrac{${sc}}{\\sin(\\widehat{${angC}})}$<br><br>`

        texteCorr += `${texteGras(`Côté $${sa}$ :`)}<br>
$\\begin{aligned}
${sa} &= \\dfrac{${sc} \\times \\sin(\\widehat{${angA}})}{\\sin(\\widehat{${angC}})} \\\\
  &= \\dfrac{${texNombre(sideC, 2)} \\times \\sin(${texDeg(texNombre(angleA, 1))})}{\\sin(${texDeg(texResult(angleC))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideA))}
\\end{aligned}$<br><br>`

        texteCorr += `${texteGras(`Côté $${sb}$ :`)}<br>
$\\begin{aligned}
${sb} &= \\dfrac{${sc} \\times \\sin(\\widehat{${angB}})}{\\sin(\\widehat{${angC}})} \\\\
  &= \\dfrac{${texNombre(sideC, 2)} \\times \\sin(${texDeg(texNombre(angleB, 1))})}{\\sin(${texDeg(texResult(angleC))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideB))}
\\end{aligned}$`
      } else if (typeQ === 2) {
        // ======== AAC (angle-angle-côté) ========
        let angleA: number, angleB: number, angleC: number, sideA: number
        let sideB = 0
        let sideC = 0
        let cptDo = 0
        do {
          cptDo++
          angleA = randint(20, 150) + randint(0, 9) / 10
          angleB = randint(20, 150) + randint(0, 9) / 10
          angleC = 180 - angleA - angleB
          sideA = randint(3, 15) + randint(0, 99) / 100
          const angleARad = (angleA * Math.PI) / 180
          const angleBRad = (angleB * Math.PI) / 180
          const angleCRad = (angleC * Math.PI) / 180
          sideB = (sideA * Math.sin(angleBRad)) / Math.sin(angleARad)
          sideC = (sideA * Math.sin(angleCRad)) / Math.sin(angleARad)
        } while (
          (angleC < 10 ||
            angleC > 170 ||
            sideB < 1 ||
            sideB > 20 ||
            sideC < 1 ||
            sideC > 20 ||
            Math.abs(angleA - 90) < 3 ||
            Math.abs(angleB - 90) < 3 ||
            Math.abs(angleC - 90) < 3) &&
          cptDo < 30
        )

        const rotationDeg = randint(-170, 170)
        const figure = createTriangleFigure({
          nom,
          type: 'AAC',
          sideC,
          angleA,
          angleB,
          sideA,
          sideB,
          rotationDeg,
        })

        texte = `Résoudre le triangle $${nom}$ sachant que $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))}$, $\\widehat{${angB}} = ${texDeg(texNombre(angleB, 1))}$ et $${sa} = ${nom[1]}${nom[2]} = ${texNombre(sideA, 2)}$.`
        if (this.sup2) texte += '<br>' + figure
        texte += `<br>${precisionInstruction}`

        handleAnswers(this, i, {
          champ1: { value: texResult(angleC) },
          champ2: { value: texResult(sideB) },
          champ3: { value: texResult(sideC) },
        })
        if (this.interactif) {
          texte +=
            '<br>' +
            remplisLesBlancs(
              this,
              i,
              `\\widehat{${angC}} \\approx \\;%{champ1}°\\quad ${sb} \\approx \\;%{champ2}\\quad ${sc} \\approx \\;%{champ3}`,
            )
        }

        texteCorr = ''
        if (!this.sup2) texteCorr += figure + '<br>'
        texteCorr += `On est dans le cas ${texteGras('A-A-C')} (angle-angle-côté).<br><br>`
        texteCorr += `${texteGras('Angle manquant :')}<br>
$\\widehat{${angC}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angB}} = ${texDeg('180')} - ${texDeg(texNombre(angleA, 1))} - ${texDeg(texNombre(angleB, 1))} = ${texDeg(miseEnEvidence(texResult(angleC)))}$<br><br>`

        texteCorr += `${texteGras('Théorème du sinus :')}<br>
$\\dfrac{${sa}}{\\sin(\\widehat{${angA}})} = \\dfrac{${sb}}{\\sin(\\widehat{${angB}})} = \\dfrac{${sc}}{\\sin(\\widehat{${angC}})}$<br><br>`

        texteCorr += `${texteGras(`Côté $${sb}$ :`)}<br>
$\\begin{aligned}
${sb} &= \\dfrac{${sa} \\times \\sin(\\widehat{${angB}})}{\\sin(\\widehat{${angA}})} \\\\
  &= \\dfrac{${texNombre(sideA, 2)} \\times \\sin(${texDeg(texNombre(angleB, 1))})}{\\sin(${texDeg(texNombre(angleA, 1))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideB))}
\\end{aligned}$<br><br>`

        texteCorr += `${texteGras(`Côté $${sc}$ :`)}<br>
$\\begin{aligned}
${sc} &= \\dfrac{${sa} \\times \\sin(\\widehat{${angC}})}{\\sin(\\widehat{${angA}})} \\\\
  &= \\dfrac{${texNombre(sideA, 2)} \\times \\sin(${texDeg(texResult(angleC))})}{\\sin(${texDeg(texNombre(angleA, 1))})} \\\\
  &\\approx ${miseEnEvidence(texResult(sideC))}
\\end{aligned}$`
      } else if (typeQ === 3) {
        // ======== CAC (côté-angle-côté) ========
        let angleA: number,
          sideB: number,
          sideC: number,
          sideA: number,
          angleB: number,
          angleC: number
        let cptDo = 0
        do {
          cptDo++
          angleA = randint(15, 165) + randint(0, 9) / 10
          sideB = randint(3, 15) + randint(0, 99) / 100
          sideC = randint(3, 15) + randint(0, 99) / 100
          const angleARad = (angleA * Math.PI) / 180
          sideA = Math.sqrt(
            sideB * sideB +
              sideC * sideC -
              2 * sideB * sideC * Math.cos(angleARad),
          )
          const cosB =
            (sideA * sideA + sideC * sideC - sideB * sideB) /
            (2 * sideA * sideC)
          const cosC =
            (sideA * sideA + sideB * sideB - sideC * sideC) /
            (2 * sideA * sideB)
          angleB = (Math.acos(cosB) * 180) / Math.PI
          angleC = (Math.acos(cosC) * 180) / Math.PI
        } while (
          (sideA < 1 ||
            Math.abs(angleA - 90) < 3 ||
            Math.abs(angleB - 90) < 3 ||
            Math.abs(angleC - 90) < 3 ||
            angleB < 10 ||
            angleC < 10 ||
            isNaN(angleB) ||
            isNaN(angleC)) &&
          cptDo < 30
        )

        const rotationDeg = randint(-170, 170)
        const figure = createTriangleFigure({
          nom,
          type: 'CAC',
          sideC,
          angleA,
          sideB,
          sideA,
          rotationDeg,
        })

        texte = `Résoudre le triangle $${nom}$ sachant que $${sb} = ${nom[0]}${nom[2]} = ${texNombre(sideB, 2)}$, $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))}$ et $${sc} = ${nom[0]}${nom[1]} = ${texNombre(sideC, 2)}$.`
        if (this.sup2) texte += '<br>' + figure
        texte += `<br>${precisionInstruction}`

        handleAnswers(this, i, {
          champ1: { value: texResult(sideA) },
          champ2: { value: texResult(angleB) },
          champ3: { value: texResult(angleC) },
        })
        if (this.interactif) {
          texte +=
            '<br>' +
            remplisLesBlancs(
              this,
              i,
              `${sa} \\approx \\;%{champ1}\\quad \\widehat{${angB}} \\approx \\;%{champ2}°\\quad \\widehat{${angC}} \\approx \\;%{champ3}°`,
            )
        }

        // Correction
        texteCorr = ''
        if (!this.sup2) texteCorr += figure + '<br>'
        texteCorr += `On est dans le cas ${texteGras('C-A-C')} (côté-angle-côté).<br><br>`

        texteCorr += `${texteGras('Côté manquant par le théorème du cosinus :')}<br>
$\\begin{aligned}
${sa}^2 &= ${sb}^2 + ${sc}^2 - 2 ${sb} ${sc} \\cos(\\widehat{${angA}}) \\\\
    &= ${texNombre(sideB, 2)}^2 + ${texNombre(sideC, 2)}^2 - 2 \\times ${texNombre(sideB, 2)} \\times ${texNombre(sideC, 2)} \\times \\cos(${texDeg(texNombre(angleA, 1))}) \\\\
${sa}   &= \\sqrt{${texNombre(sideB, 2)}^2 + ${texNombre(sideC, 2)}^2 - 2 \\times ${texNombre(sideB, 2)} \\times ${texNombre(sideC, 2)} \\times \\cos(${texDeg(texNombre(angleA, 1))})} \\\\
    &\\approx ${miseEnEvidence(texResult(sideA))}
\\end{aligned}$<br><br>`

        if (angleA > 90) {
          texteCorr += `Comme $\\widehat{${angA}} = ${texDeg(texNombre(angleA, 1))} > 90^\\circ$, les deux autres angles sont aigus. On peut donc déterminer $\\sin(\\widehat{${angB}})$ avec le théorème du sinus, puis utiliser directement $\\arcsin$ sans ambiguïté sur la branche choisie :<br><br>`
          texteCorr += `${texteGras(`Angle $\\widehat{${angB}}$ :`)}<br>
$\\dfrac{\\sin(\\widehat{${angB}})}{${sb}} = \\dfrac{\\sin(\\widehat{${angA}})}{${sa}}$<br>
$\\begin{aligned}
\\sin(\\widehat{${angB}}) &= \\dfrac{${sb} \\times \\sin(\\widehat{${angA}})}{${sa}} \\\\
                          &= \\dfrac{${texNombre(sideB, 2)} \\times \\sin(${texDeg(texNombre(angleA, 1))})}{${sa}} \\\\
\\widehat{${angB}} &= \\arcsin\\left(\\dfrac{${texNombre(sideB, 2)} \\times \\sin(${texDeg(texNombre(angleA, 1))})}{${sa}}\\right) \\\\
                    &\\approx ${texDeg(miseEnEvidence(texResult(angleB)))}
\\end{aligned}$<br><br>`
        } else {
          texteCorr += `${texteGras(`Angle $\\widehat{${angB}}$ :`)}<br>
On isole $\\widehat{${angB}}$ dans la formule du théorème du cosinus, on obtient :<br>
$\\begin{aligned}
\\cos(\\widehat{${angB}}) &= \\dfrac{${sa}^2 + ${sc}^2 - ${sb}^2}{2 ${sa} ${sc}} \\\\
                          &= \\dfrac{${sa}^2 + ${texNombre(sideC, 2)}^2 - ${texNombre(sideB, 2)}^2}{2 \\times ${sa} \\times ${texNombre(sideC, 2)}} \\\\
\\widehat{${angB}} &= \\arccos\\left(\\dfrac{${sa}^2 + ${texNombre(sideC, 2)}^2 - ${texNombre(sideB, 2)}^2}{2 \\times ${sa} \\times ${texNombre(sideC, 2)}}\\right) \\\\
                    &\\approx ${texDeg(miseEnEvidence(texResult(angleB)))}
\\end{aligned}$<br><br>`
        }

        texteCorr += `${texteGras(`Angle $\\widehat{${angC}}$ :`)}<br>
$\\widehat{${angC}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angB}} \\approx ${texDeg('180')} - ${texDeg(texNombre(angleA, 1))} - ${texDeg(texResult(angleB))} \\approx ${texDeg(miseEnEvidence(texResult(angleC)))}$`
      } else {
        // ======== CCC (côté-côté-côté) ========
        let sideA: number
        let sideB: number
        let sideC: number
        let angleA = NaN
        let angleB = NaN
        let angleC = NaN
        let cptDo = 0
        do {
          cptDo++
          sideA = randint(3, 15) + randint(0, 99) / 100
          sideB = randint(3, 15) + randint(0, 99) / 100
          sideC = randint(3, 15) + randint(0, 99) / 100
          if (
            sideA + sideB > sideC &&
            sideA + sideC > sideB &&
            sideB + sideC > sideA
          ) {
            const cosA =
              (sideB * sideB + sideC * sideC - sideA * sideA) /
              (2 * sideB * sideC)
            const cosB =
              (sideA * sideA + sideC * sideC - sideB * sideB) /
              (2 * sideA * sideC)
            const cosC =
              (sideA * sideA + sideB * sideB - sideC * sideC) /
              (2 * sideA * sideB)
            angleA = (Math.acos(cosA) * 180) / Math.PI
            angleB = (Math.acos(cosB) * 180) / Math.PI
            angleC = (Math.acos(cosC) * 180) / Math.PI
          }
        } while (
          (isNaN(angleA) ||
            isNaN(angleB) ||
            isNaN(angleC) ||
            angleA < 10 ||
            angleB < 10 ||
            angleC < 10 ||
            angleA > 170 ||
            angleB > 170 ||
            angleC > 170 ||
            Math.abs(angleA - 90) < 3 ||
            Math.abs(angleB - 90) < 3 ||
            Math.abs(angleC - 90) < 3) &&
          cptDo < 30
        )

        const rotationDeg = randint(-170, 170)
        const figure = createTriangleFigure({
          nom,
          type: 'CCC',
          sideA,
          sideB,
          sideC,
          rotationDeg,
        })

        texte = `Résoudre le triangle $${nom}$ sachant que $${sa} = ${nom[1]}${nom[2]} = ${texNombre(sideA, 2)}$, $${sb} = ${nom[0]}${nom[2]} = ${texNombre(sideB, 2)}$ et $${sc} = ${nom[0]}${nom[1]} = ${texNombre(sideC, 2)}$.`
        if (this.sup2) texte += '<br>' + figure
        texte += `<br>${precisionInstruction}`

        handleAnswers(this, i, {
          champ1: { value: texResult(angleA) },
          champ2: { value: texResult(angleB) },
          champ3: { value: texResult(angleC) },
        })
        if (this.interactif) {
          texte +=
            '<br>' +
            remplisLesBlancs(
              this,
              i,
              `\\widehat{${angA}} \\approx \\;%{champ1}°\\quad \\widehat{${angB}} \\approx \\;%{champ2}°\\quad \\widehat{${angC}} \\approx \\;%{champ3}°`,
            )
        }

        // Correction
        texteCorr = ''
        if (!this.sup2) texteCorr += figure + '<br>'
        texteCorr += `On est dans le cas ${texteGras('C-C-C')} (côté-côté-côté).<br><br>`
        texteCorr += `On isole l'angle dans la formule du théorème du cosinus.<br><br>`

        texteCorr += `${texteGras(`Angle $\\widehat{${angA}}$ :`)}<br>
$\\begin{aligned}
\\cos(\\widehat{${angA}}) &= \\dfrac{${sb}^2 + ${sc}^2 - ${sa}^2}{2 ${sb} ${sc}} \\\\
                          &= \\dfrac{${texNombre(sideB, 2)}^2 + ${texNombre(sideC, 2)}^2 - ${texNombre(sideA, 2)}^2}{2 \\times ${texNombre(sideB, 2)} \\times ${texNombre(sideC, 2)}} \\\\
\\widehat{${angA}} &= \\arccos\\left(\\dfrac{${texNombre(sideB, 2)}^2 + ${texNombre(sideC, 2)}^2 - ${texNombre(sideA, 2)}^2}{2 \\times ${texNombre(sideB, 2)} \\times ${texNombre(sideC, 2)}}\\right) \\\\
                    &\\approx ${texDeg(miseEnEvidence(texResult(angleA)))}
\\end{aligned}$<br><br>`

        texteCorr += `${texteGras(`Angle $\\widehat{${angB}}$ :`)}<br>
$\\begin{aligned}
\\cos(\\widehat{${angB}}) &= \\dfrac{${sa}^2 + ${sc}^2 - ${sb}^2}{2 ${sa} ${sc}} \\\\
                          &= \\dfrac{${texNombre(sideA, 2)}^2 + ${texNombre(sideC, 2)}^2 - ${texNombre(sideB, 2)}^2}{2 \\times ${texNombre(sideA, 2)} \\times ${texNombre(sideC, 2)}} \\\\
\\widehat{${angB}} &= \\arccos\\left(\\dfrac{${texNombre(sideA, 2)}^2 + ${texNombre(sideC, 2)}^2 - ${texNombre(sideB, 2)}^2}{2 \\times ${texNombre(sideA, 2)} \\times ${texNombre(sideC, 2)}}\\right) \\\\
                    &\\approx ${texDeg(miseEnEvidence(texResult(angleB)))}
\\end{aligned}$<br><br>`

        texteCorr += `${texteGras(`Angle $\\widehat{${angC}}$ :`)}<br>
$\\widehat{${angC}} = ${texDeg('180')} - \\widehat{${angA}} - \\widehat{${angB}} \\approx ${texDeg('180')} - ${texDeg(texResult(angleA))} - ${texDeg(texResult(angleB))} \\approx ${texDeg(miseEnEvidence(texResult(angleC)))}$`
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

/**
 * Build the figure objects for the triangle.
 */
type BuildFigureParams = {
  nom: string
  type: 'ACA' | 'AAC' | 'CAC' | 'CCC'
  sideC: number
  angleA?: number
  angleB?: number
  sideA?: number
  sideB?: number
  rotationDeg: number
  showAngleMeasures?: boolean
  pixelsParCmForAngles?: number
}

function buildFigure({
  nom,
  type,
  sideC,
  angleA,
  angleB,
  sideA,
  sideB,
  rotationDeg,
  showAngleMeasures = true,
  pixelsParCmForAngles = 20,
}: BuildFigureParams) {
  const objets: NestedObjetMathalea2dArray = []
  // Lowercase side names: opposite vertex letter
  const sa = nom[0].toLowerCase()
  const sb = nom[1].toLowerCase()
  const sc = nom[2].toLowerCase()

  const A = pointAbstrait(0, 0)
  const B = pointAdistance(A, sideC, rotationDeg)

  let ABC
  if (type === 'ACA' || type === 'AAC') {
    ABC = triangle2points2angles(A, B, angleA!, angleB!)
  } else if (type === 'CAC') {
    ABC = triangle2points1angle1longueur(A, B, angleA!, sideB!)
  } else {
    ABC = triangle2points2longueurs(A, B, sideB!, sideA!)
  }

  const C = ABC.listePoints[2]
  const nommeABC = nommePolygone(ABC, nom)
  objets.push(ABC, nommeABC)

  // Helper: label on segment, aligned along it (horizontal = false by default)
  const labelSeg = (text: string, P1: typeof A, P2: typeof A, P3: typeof A) =>
    angleOriente(P3, P1, P2) > 0
      ? texteSurSegment(`$${text}$`, P1, P2, 'black', 0.5)
      : texteSurSegment(`$${text}$`, P2, P1, 'black', 0.5)
  const measureAngle = (
    P1: typeof A,
    S: typeof A,
    P2: typeof A,
    angle: number,
  ) => {
    return createTrigo5AngleMeasure(
      P1,
      S,
      P2,
      texDeg(texNombre(angle, 1)),
      pixelsParCmForAngles,
    )
  }

  if (type === 'ACA') {
    // Given: angleA, angleB, sideC. Unknown: sideA, sideB, angleC
    objets.push(
      labelSeg(texNombre(sideC, 2), A, B, C), // sc value on AB
      labelSeg(sa, B, C, A), // sa unknown on BC
      labelSeg(sb, C, A, B), // sb unknown on CA
    )
    if (showAngleMeasures) {
      objets.push(
        measureAngle(B, A, C, angleA!),
        measureAngle(A, B, C, angleB!),
      )
    }
  } else if (type === 'AAC') {
    // Given: angleA, angleB, sideA. Unknown: sideB, sideC, angleC
    objets.push(
      labelSeg(sc, A, B, C), // sc unknown on AB
      labelSeg(texNombre(sideA!, 2), B, C, A), // sa value on BC
      labelSeg(sb, C, A, B), // sb unknown on CA
    )
    if (showAngleMeasures) {
      objets.push(
        measureAngle(B, A, C, angleA!),
        measureAngle(A, B, C, angleB!),
      )
    }
  } else if (type === 'CAC') {
    // Given: sideB (AC), angleA, sideC (AB). Unknown: sideA (BC), angleB, angleC
    objets.push(
      labelSeg(texNombre(sideC, 2), A, B, C), // sc value on AB
      labelSeg(texNombre(sideB!, 2), C, A, B), // sb value on CA
      labelSeg(sa, B, C, A), // sa unknown on BC
    )
    if (showAngleMeasures) {
      objets.push(measureAngle(B, A, C, angleA!))
    }
  } else {
    // CCC: all sides given, all angles unknown
    objets.push(
      labelSeg(texNombre(sideC, 2), A, B, C), // sc on AB
      labelSeg(texNombre(sideB!, 2), C, A, B), // sb on CA
      labelSeg(texNombre(sideA!, 2), B, C, A), // sa on BC
    )
  }

  return objets
}
