import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { homothetie, rotation } from '../../lib/2d/transformations'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { arcPointPointAngle } from '../../lib/2d/Arc'
import { texteSurArc } from '../../lib/2d/TexteSurArc'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Effectuer des calculs liés aux homothéties'
export const dateDePublication = '28/11/2021'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

/**
 * Calculs dans une homothétie : longueurs, aires.
 * @author Frédéric PIOU
 * Grosse refactorisation par Éric Elter
 */
export const uuid = '6f383'

export const refs = {
  'fr-fr': ['3G13'],
  'fr-ch': ['11LCES3A-3', '11LSES3A-3'],
}

function texteSurSegmentDessus(
  texte: string,
  A: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  d = 0.5,
  horizontal = false,
) {
  if (A.x < B.x) return texteSurSegment(texte, A, B, color, d, horizontal)
  else return texteSurSegment(texte, B, A, color, d, horizontal)
}

export default class CalculsHomothetie extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4 // Nombre de questions par défaut
    this.nbCols = 0 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 0 // Uniquement pour la sortie LaTeX

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.spacing = context.isHtml ? 1.5 : 1
    this.spacingCorr = context.isHtml ? 1.5 : 1
    this.sup = 12 // Type d'exercice
    this.sup2 = 3 // 1 : Homothéties de rapport positif, 2: de rapport négatif 3 : mélange
    this.sup3 = 1 // Choix des valeurs
    this.sup4 = true // Affichage des figures facultatives dans l'énoncé (en projet)

    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Calculer le rapport',
        '2 : Calculer une longueur image',
        '3 : Calculer une longueur antécédent',
        '4 : Calculer une longueur image (deux étapes)',
        '5 : Calculer une longueur antécédent (deux étapes)',
        '6 : Calculer une aire image',
        '7 : Calculer une aire antécédent',
        '8 : Calculer le rapport à partir des aires',
        "9 : Calculer le rapport connaissant OA et AA'",
        '10 : Encadrer le rapport k',
        "11 : Encadrer le rapport k connaissant OA et AA'",
        '12 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Numerique = [
      'Signe du rapport',
      3,
      '1 : Positif\n2 : Négatif\n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Choix des valeurs',
      3,
      '1 : k est décimal\n2 : k est fractionnaire\n3 : k est une fractionnaire et les mesures sont entières',
    ]
    this.besoinFormulaire4CaseACocher = [
      "Figure dans l'énoncé (Cas 1 à 5 et 9 à 11)",
      false,
    ]
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      'rapport',
      'image',
      'antécédent',
      'image2etapes',
      'antecendent2etapes',
      'aireImage',
      'aireAntécédent',
      'aireRapport',
      'rapport2',
      'encadrerk',
      'encadrerk2',
    ]
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 11,
      melange: 12,
      defaut: 12,
      nbQuestions: this.nbQuestions,
      listeOfCase: typeQuestionsDisponibles,
    }).map(String)
    // const listeTypeQuestions = typeQuestionsDisponibles
    const kNonDecimal = Number(this.sup3 > 1)
    const valeursSimples = Number(this.sup3 === 3)
    for (
      let i = 0, environ, melange, texte, texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const lettres = choisitLettresDifferentes(
        5,
        ['P', 'Q', 'U', 'V', 'W', 'X', 'Y', 'Z'].join(''),
      )
      const A = lettres[0]
      const hA = lettres[1]
      const O = lettres[2]
      const B = lettres[3]
      const hB = lettres[4]
      // const A = 'A'; const hA = 'H'; const O = 'O'; const B = 'B'; const hB = 'K'

      const ks = new FractionEtendue(
        this.sup2 === 1 ? 1 : this.sup2 === 2 ? -1 : choice([1, -1]),
        1,
      )

      let k = new FractionEtendue(1, 1)
      do {
        k = new FractionEtendue(
          kNonDecimal
            ? randint(1, 9)
            : choice([randint(15, 40), randint(1, 9)]),
          kNonDecimal ? randint(1, 9) : 10,
        )
        k = k.produitFraction(ks)
        k = k.simplifie()
      } while (Math.abs(k.valeurDecimale) === 1) // ni k = 1 ni k = -1

      const absk = k.valeurAbsolue()
      const agrandissement = absk.valeurDecimale > 1

      const kpositif = k.valeurDecimale > 0

      const longueurEntiere = valeursSimples
        ? new FractionEtendue(randint(1, 19), 1)
        : new FractionEtendue(randint(11, 99), 1)

      let OA = agrandissement
        ? longueurEntiere.entierDivise(10)
        : longueurEntiere
      OA = OA.multiplieEntier(10 ** valeursSimples * absk.d ** kNonDecimal)
      const OhA = k.produitFraction(OA)

      let OB = new FractionEtendue(
        randint(10, 99, [Math.round(longueurEntiere.valeurDecimale)]),
        10,
      )
      OB = OB.multiplieEntier(10 ** valeursSimples * absk.d ** kNonDecimal)
      const OhB = k.produitFraction(OB)

      let AhA = OhA.differenceFraction(OA).simplifie()
      AhA = AhA.valeurAbsolue()

      let kAire = new FractionEtendue(
        choice([randint(1, 4) * 10 + 5 + choice([0, 5]), randint(1, 9)]),
        1,
      )
      kAire = kAire.entierDivise(10)
      kAire = kAire.simplifie()
      const Aire =
        valeursSimples === 1
          ? new FractionEtendue(randint(10, 99), 1)
          : new FractionEtendue(randint(100, 999), 10)
      const hAire = kAire.produitFractions(kAire, Aire).valeurDecimale
      const hAireArrondie = arrondi(hAire, 2)

      const plusgrandque = agrandissement ? '>' : '<'
      const unAgrandissement = agrandissement
        ? 'un agrandissement'
        : 'une réduction'
      const intervallek = agrandissement
        ? kpositif
          ? 'k > 1'
          : 'k < -1'
        : kpositif
          ? '0 < k < 1'
          : '-1 < k < 0'
      const positif = kpositif ? 'positif' : 'négatif'
      const signek = kpositif ? '' : '-'
      const lopposede = kpositif ? '' : "l'opposé de "
      const lopposedu = kpositif ? 'le' : "l'opposé du "
      const derapportpositifet = this.sup4 ? '' : `de rapport ${positif} et `
      const inNotin = kpositif ? '\\in' : '\\notin'
      const illustrerParUneFigureAMainLevee = this.sup4
        ? ''
        : "Pour vous aider, illustrer cette situation par une figure (sans forcément respecter l'échelle).<br>"

      const kinverse = new FractionEtendue(1, 1).diviseFraction(absk)

      const OhAdivkInversed = OhA.entierDivise(kinverse.d)
        .simplifie()
        .valeurAbsolue().texFSD
      const OhBdivkInversed = OhB.entierDivise(
        kinverse.denIrred,
      ).valeurAbsolue().valeurDecimale // Pas en version Latex contrairement à avant

      let largeurFigure = new FractionEtendue(
        Math.max(
          OA.valeurAbsolue().valeurDecimale,
          OhA.valeurAbsolue().valeurDecimale,
          AhA.valeurAbsolue().valeurDecimale,
        ),
        1,
      )
      largeurFigure = new FractionEtendue(10, 1).diviseFraction(largeurFigure)
      largeurFigure = largeurFigure.multiplieEntier(2)

      let correctionOhA = OhA.multiplieEntier(1)
      let correctionOA = OA
      let testFigureCorrigee = true

      if (absk.valeurDecimale < 0.3) {
        correctionOhA = OA.produitFraction(
          new FractionEtendue(3, 10).multiplieEntier(
            (-1) ** Number(k.valeurDecimale < 0),
          ),
        )
      } else if (absk.valeurDecimale < 1 && absk.valeurDecimale > 0.7) {
        correctionOhA = OA.produitFraction(
          new FractionEtendue(7, 10).multiplieEntier(
            (-1) ** Number(k.valeurDecimale < 0),
          ),
        )
      } else if (absk.valeurDecimale > 1 && absk.valeurDecimale < 1.3) {
        correctionOhA = OA.produitFraction(
          new FractionEtendue(13, 10).multiplieEntier(
            (-1) ** Number(k.valeurDecimale < 0),
          ),
        )
      } else if (absk.valeurDecimale > 4) {
        correctionOA = OA.multiplieEntier(2)
      } else {
        testFigureCorrigee = false
      }
      const figurealechelle =
        !(testFigureCorrigee && this.sup4) ||
        [
          'image2etapes',
          'antecendent2etapes',
          'aireImage',
          'aireAntécédent',
          'aireRapport',
        ].includes(listeTypeQuestions[i])
          ? ''
          : "La figure ci-dessous n'est pas à l'échelle.<br>"
      const figurealechelle2 = !this.sup4
        ? ''
        : "La figure ci-dessous n'est pas à l'échelle.<br>"

      let figure: {
        [key: string]: PointAbstrait
      } = {
        O: pointAbstrait(0, 0, `${O}`, 'below'),
        A: pointAbstrait(
          correctionOA.produitFraction(largeurFigure).valeurDecimale,
          0,
          `${A}`,
          'below',
        ),
        hA: pointAbstrait(
          correctionOhA.produitFraction(largeurFigure).valeurDecimale,
          0,
          `${hA}`,
          kpositif ? 'below' : 'below',
        ),
      }

      const angle = choice([randint(20, 50), randint(130, 160)])
      figure = Object.assign({}, figure, {
        B: homothetie(
          rotation(figure.A, figure.O, angle),
          figure.O,
          1.2,
          `${B}`,
        ),
        hB: homothetie(
          rotation(figure.hA, figure.O, angle),
          figure.O,
          1.2,
          `${hB}`,
          kpositif ? 'above' : 'below',
        ),
      })

      const OhADecimale = OhA.valeurAbsolue().valeurDecimale // Non LaTeX

      const OhAtimeskinverse =
        valeursSimples && !absk.estEntiere
          ? `=${texNombre(OhADecimale)}\\times ${kinverse.texFSD}` +
            (kinverse.d !== 1
              ? `=\\dfrac{${texNombre(OhADecimale)}}{${kinverse.d}}\\times ${kinverse.n}=${OhAdivkInversed}\\times ${kinverse.n}`
              : '')
          : ''

      const OhBDecimale = OhB.valeurAbsolue().valeurDecimale // Non LaTeX
      const OhBtimeskinverse =
        valeursSimples && !absk.estEntiere
          ? `=${texNombre(OhBDecimale)}\\times ${kinverse.texFSD}` +
            (kinverse.d !== 1
              ? `=\\dfrac{${texNombre(OhBDecimale)}}{${kinverse.d}}\\times ${kinverse.n}=${OhBdivkInversed}\\times ${kinverse.n}`
              : '')
          : ''

      const parentheseskAire =
        (absk.d === 1 || this.sup3 === 1) && kpositif
          ? texNombre(kAire.valeurDecimale)
          : `\\left(${signek}${this.sup3 === 1 ? texNombre(kAire.valeurDecimale) : kAire.texFSD}\\right)`

      const calculsOhA = !kpositif
        ? `${hA}${A} - ${O}${A} = ${texNombre(AhA.valeurAbsolue().valeurDecimale, 2)} - ${texNombre(OA.valeurAbsolue().valeurDecimale, 2)}`
        : agrandissement
          ? `${O}${A} + ${A}${hA} = ${texNombre(OA.valeurAbsolue().valeurDecimale, 2)} + ${texNombre(AhA.valeurAbsolue().valeurDecimale, 2)} `
          : `${O}${A} - ${A}${hA} = ${texNombre(OA.valeurAbsolue().valeurDecimale, 2)} - ${texNombre(AhA.valeurAbsolue().valeurDecimale, 2)}`

      figure = Object.assign({}, figure, {
        segmentOA: segmentAvecExtremites(figure.O, figure.A),
        segmentOhA: segmentAvecExtremites(figure.O, figure.hA),
        segmentOB: segmentAvecExtremites(figure.O, figure.B),
        segmentOhB: segmentAvecExtremites(figure.O, figure.hB),
      })

      figure = Object.assign({}, figure, {
        arcOA:
          agrandissement || !kpositif
            ? figure.A
            : arcPointPointAngle(figure.O, figure.A, 60, false),
        arcOhA:
          !agrandissement || !kpositif
            ? figure.hA
            : arcPointPointAngle(figure.O, figure.hA, 60, false),
        arcOB:
          agrandissement || !kpositif
            ? figure.B
            : arcPointPointAngle(figure.B, figure.O, 60, false),
        arcOhB:
          !agrandissement || !kpositif
            ? figure.hB
            : arcPointPointAngle(figure.hB, figure.O, 60, false),
        arcAhA: kpositif
          ? figure.A
          : arcPointPointAngle(figure.hA, figure.A, 60, false),
        legendeOA:
          agrandissement || !kpositif
            ? texteSurSegmentDessus(
                `$${texNombre(OA.valeurDecimale)}\\text{ cm}$`,
                figure.A,
                figure.O,
                'black',
                0.6,
              )
            : texteSurArc(
                `$${texNombre(OA.valeurDecimale)}\\text{ cm}$`,
                figure.O,
                figure.A,
                90,
                'black',
                0.3,
              ),
        legendeOhA:
          !agrandissement || !kpositif
            ? texteSurSegmentDessus(
                `$${texNombre(OhADecimale)}\\text{ cm}$`,
                figure.hA,
                figure.O,
                'black',
                0.6,
              )
            : texteSurArc(
                `$${texNombre(OhADecimale)}\\text{ cm}$`,
                figure.O,
                figure.hA,
                60,
                'black',
                0.3,
              ),
        legendeOB:
          agrandissement || !kpositif
            ? texteSurSegmentDessus(
                `$${texNombre(OB.valeurDecimale)}\\text{ cm}$`,
                figure.B,
                figure.O,
                'black',
                0.6,
              )
            : texteSurArc(
                `$${texNombre(OB.valeurDecimale)}\\text{ cm}$`,
                figure.B,
                figure.O,
                60,
                'black',
                0.3,
              ),
        legendeOhB:
          !agrandissement || !kpositif
            ? texteSurSegmentDessus(
                `$${texNombre(OhB)}\\text{ cm}$`,
                figure.hB,
                figure.O,
                'black',
                0.6,
              )
            : texteSurArc(
                `$${texNombre(OhB)}\\text{ cm}$`,
                figure.hB,
                figure.O,
                60,
                'black',
                0.3,
              ),
        legendeAhA: kpositif
          ? texteSurSegmentDessus(
              `$${texNombre(AhA.valeurDecimale)}\\text{ cm}$`,
              figure.hA,
              figure.A,
              'black',
              0.6,
            )
          : texteSurArc(
              `$${texNombre(AhA.valeurDecimale)}\\text{ cm}$`,
              figure.hA,
              figure.A,
              60,
              'black',
              0.3,
            ),
      })

      figure.arcOA.pointilles = 5
      figure.arcOhA.pointilles = 5
      figure.arcOB.pointilles = 5
      figure.arcOhB.pointilles = 5
      figure.arcAhA.pointilles = 5

      figure = Object.assign({}, figure, {
        legendeOAi:
          agrandissement || !kpositif
            ? texteSurSegmentDessus('$?$', figure.O, figure.A, 'black', 0.6)
            : texteSurArc('$?$', figure.O, figure.A, 60, 'black', 0.3),
        legendeOhAi:
          !agrandissement || !kpositif
            ? texteSurSegmentDessus('$?$', figure.O, figure.hA, 'black', 0.6)
            : texteSurArc('$?$', figure.hA, figure.O, 60, 'black', 0.3),
        legendeOBi:
          agrandissement || !kpositif
            ? texteSurSegmentDessus('$?$', figure.O, figure.B, 'black', 0.6)
            : texteSurArc('$?$', figure.B, figure.O, 60, 'black', 0.3),
        legendeOhBi:
          !agrandissement || !kpositif
            ? texteSurSegmentDessus('$?$', figure.O, figure.hB, 'black', 0.6)
            : texteSurArc('$?$', figure.hB, figure.O, 60, 'black', 0.3),
      })

      let objetsEnonce = []
      const fscale = context.isHtml ? 1 : 0.4

      const flabelsPoints = labelPoint(figure.O, figure.A, figure.hA)
      objetsEnonce = [
        figure.segmentOA,
        figure.segmentOhA,
        figure.legendeOA,
        figure.legendeOhA,
      ]
      if (figure.arcOA.typeObjet !== 'point') objetsEnonce.push(figure.arcOA)
      if (figure.arcOhA.typeObjet !== 'point') objetsEnonce.push(figure.arcOhA)
      const frapportFig = mathalea2d(
        Object.assign({}, fixeBordures([...objetsEnonce, ...flabelsPoints]), {
          display: 'inline' as const,
          scale: fscale,
        }),
        objetsEnonce,
        flabelsPoints,
      )
      const frapport = {
        enonce: this.sup4 ? frapportFig : '',
        solution: !this.sup4 ? frapportFig : '',
      }

      objetsEnonce = [
        figure.segmentOA,
        figure.segmentOhA,
        figure.legendeOA,
        figure.legendeOhAi,
      ]
      if (figure.arcOA.typeObjet !== 'point') objetsEnonce.push(figure.arcOA)
      if (figure.arcOhA.typeObjet !== 'point') objetsEnonce.push(figure.arcOhA)
      const fImageFig = mathalea2d(
        Object.assign({}, fixeBordures([...objetsEnonce, ...flabelsPoints]), {
          display: 'inline' as const,
          scale: fscale,
        }),
        objetsEnonce,
        flabelsPoints,
      )
      const fImage = {
        enonce: this.sup4 ? fImageFig : '',
        solution: !this.sup4 ? fImageFig : '',
      }

      objetsEnonce = [
        figure.segmentOA,
        figure.segmentOhA,
        figure.legendeOhA,
        figure.legendeOAi,
      ]
      if (figure.A.typeObjet !== 'point') objetsEnonce.push(figure.A)
      if (figure.O.typeObjet !== 'point') objetsEnonce.push(figure.O)
      if (figure.hA.typeObjet !== 'point') objetsEnonce.push(figure.hA)
      if (figure.arcOA.typeObjet !== 'point') objetsEnonce.push(figure.arcOA)
      if (figure.arcOhA.typeObjet !== 'point') objetsEnonce.push(figure.arcOhA)
      const fAntecedentFig = mathalea2d(
        Object.assign({}, fixeBordures([...objetsEnonce, ...flabelsPoints]), {
          display: 'inline' as const,
          scale: fscale,
        }),
        objetsEnonce,
        flabelsPoints,
      )
      const fAntecedent = {
        enonce: this.sup4 ? fAntecedentFig : '',
        solution: !this.sup4 ? fAntecedentFig : '',
      }

      const flabelsPointsAvecB = labelPoint(
        figure.O,
        figure.A,
        figure.hA,
        figure.B,
        figure.hB,
      )
      objetsEnonce = [
        figure.segmentOA,
        figure.segmentOhA,
        figure.segmentOB,
        figure.segmentOhB,
        figure.legendeOA,
        figure.legendeOhA,
        figure.legendeOB,
        figure.legendeOhBi,
      ]
      if (figure.A.typeObjet !== 'point') objetsEnonce.push(figure.A)
      if (figure.O.typeObjet !== 'point') objetsEnonce.push(figure.O)
      if (figure.hA.typeObjet !== 'point') objetsEnonce.push(figure.hA)
      if (figure.B.typeObjet !== 'point') objetsEnonce.push(figure.B)
      if (figure.hB.typeObjet !== 'point') objetsEnonce.push(figure.hB)
      if (figure.arcOA.typeObjet !== 'point') objetsEnonce.push(figure.arcOA)
      if (figure.arcOB.typeObjet !== 'point') objetsEnonce.push(figure.arcOB)
      if (figure.arcOhA.typeObjet !== 'point') objetsEnonce.push(figure.arcOhA)
      if (figure.arcOhB.typeObjet !== 'point') objetsEnonce.push(figure.arcOhB)
      const fImage2etapesFig = mathalea2d(
        Object.assign(
          {},
          fixeBordures([...objetsEnonce, ...flabelsPointsAvecB]),
          { display: 'inline' as const, scale: fscale },
        ),
        objetsEnonce,
        flabelsPointsAvecB,
      )
      const fImage2etapes = {
        enonce: this.sup4 ? fImage2etapesFig : '',
        solution: !this.sup4 ? fImage2etapesFig : '',
      }

      objetsEnonce = [
        figure.segmentOA,
        figure.segmentOhA,
        figure.segmentOB,
        figure.segmentOhB,
        figure.legendeOBi,
        figure.legendeOhB,
        figure.legendeOA,
        figure.legendeOhA,
      ]
      if (figure.arcOA.typeObjet !== 'point') objetsEnonce.push(figure.arcOA)
      if (figure.arcOhA.typeObjet !== 'point') objetsEnonce.push(figure.arcOhA)
      if (figure.arcOB.typeObjet !== 'point') objetsEnonce.push(figure.arcOB)
      if (figure.arcOhB.typeObjet !== 'point') objetsEnonce.push(figure.arcOhB)
      const fAntecedent2etapesFig = mathalea2d(
        Object.assign(
          {},
          fixeBordures([...objetsEnonce, ...flabelsPointsAvecB]),
          { display: 'inline' as const, scale: fscale },
        ),
        objetsEnonce,
        flabelsPointsAvecB,
      )
      const fAntecedent2etapes = {
        enonce: this.sup4 ? fAntecedent2etapesFig : '',
        solution: !this.sup4 ? fAntecedent2etapesFig : '',
      }

      objetsEnonce = [
        figure.segmentOA,
        figure.segmentOhA,
        figure.legendeOA,
        figure.legendeOhA,
        figure.legendeAhA,
      ]
      if (figure.arcOA.typeObjet !== 'point') objetsEnonce.push(figure.arcOA)
      if (figure.arcOhA.typeObjet !== 'point') objetsEnonce.push(figure.arcOhA)
      if (figure.arcAhA.typeObjet !== 'point') objetsEnonce.push(figure.arcAhA)
      const frapport2Fig = mathalea2d(
        Object.assign({}, fixeBordures([...objetsEnonce, ...flabelsPoints]), {
          display: 'inline' as const,
          scale: fscale,
        }),
        objetsEnonce,
        flabelsPoints,
      )
      const frapport2 = {
        enonce: this.sup4 ? '<br>' + frapport2Fig : '',
        solution: !this.sup4 ? frapport2Fig : '',
      }
      let donnees, donnee1, donnee2, donnee3

      switch (listeTypeQuestions[i]) {
        case 'rapport': // cas 1
          donnees = [
            `${O}${hA}=${texNombre(OhADecimale)}\\text{ cm}`,
            `${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}`,
          ]
          melange = combinaisonListes([0, 1])
          donnee1 = donnees[melange[0]]
          donnee2 = donnees[melange[1]]

          texte = `$${hA}$ est l'image de $${A}$
          par une homothétie ${derapportpositifet}
          de centre $${O}$ telle que $${donnee1}$ et $${donnee2}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle}
          Calculer le rapport $k$ de cette homothétie`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:` },
          )

          texte += '.<br>' + frapport.enonce

          handleAnswers(this, i, { reponse: { value: k.texFSD } })

          if (this.correctionDetaillee) {
            texteCorr = `$[${O}${hA}]$ est l'image de $[${O}${A}]$ par cette homothétie
            et $${O} ${hA} ${plusgrandque} ${O} ${A}$,
            donc c'est ${unAgrandissement} et on a${sp()}: $${intervallek}$.<br>
            ${frapport.solution}`
            texteCorr += `Le rapport de cette homothétie est ${lopposedu} quotient
            de la longueur d'un segment «${sp()}à l'arrivée${sp()}»
            par sa longueur «${sp()}au départ${sp()}».<br>
            Soit `
          } else texteCorr = frapport.solution
          texteCorr += `$k=${signek}\\dfrac{${O}${hA}}{${O}${A}}=${signek}\\dfrac{${texNombre(OhADecimale)}}{${texNombre(OA.valeurDecimale)}}=${miseEnEvidence(this.sup3 === 1 ? texNombre(k.valeurDecimale, 2) : k.texFSD)}$.`
          break

        case 'image': // cas 2
          texte = `$${hA}$ est l'image de $${A}$ par une homothétie
          de centre $${O}$ et de rapport $k=${this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD}$
          tel que $ {${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle} 
          Calculer $${O}${hA}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:`, texteApres: '$ \\text{ cm}$' },
          )

          texte += '.<br>' + fImage.enonce

          handleAnswers(this, i, { reponse: { value: OhADecimale } })

          if (this.correctionDetaillee) {
            texteCorr = `$[${O}${hA}]$ est l'image de $[${O}${A}]$ par cette homothétie et $${intervallek}$, donc $[${O}${hA}]$ est ${unAgrandissement} de $[${O}${A}]$.<br>${fImage.solution}`
            texteCorr += `Une homothétie de rapport ${positif} est
            une transformation qui multiplie
            toutes les longueurs par ${lopposede} son rapport.<br>
            Soit $${O}${hA}=${signek}k \\times ${O}${A}$.<br>
            Donc `
          } else texteCorr = fImage.solution
          texteCorr += `$${O}${hA}= ${this.sup3 === 1 ? texNombre(absk.valeurDecimale) : absk.texFSD} \\times ${texNombre(OA.valeurDecimale)} = ${miseEnEvidence(texNombre(OhADecimale))}\\text{ cm}$.`
          break

        case 'antécédent': // cas 3
          texte = `$${hA}$ est l'image de $${A}$ par une
          homothétie de centre $${O}$ et de rapport
          $k=${this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD}$ tel que $ {${O}${hA}=${texNombre(OhADecimale)}\\text{ cm}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle} 
          Calculer $${O}${A}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:`, texteApres: '$ \\text{ cm}$' },
          )

          texte += '.<br>' + fAntecedent.enonce

          handleAnswers(this, i, { reponse: { value: OA.texFSD } })

          if (this.correctionDetaillee) {
            texteCorr = `$[${O}${hA}]$ est l'image de $[${O}${A}]$ par cette homothétie et 
            $${intervallek}$, donc $[${O}${hA}]$ est ${unAgrandissement} de $[${O}${A}]$.
            <br>${fAntecedent.solution}
            Une homothétie de rapport ${positif} est
            une transformation qui multiplie
            toutes les longueurs par ${lopposede} son rapport.<br>
            Soit $${O}${hA}=${signek}k \\times ${O}${A}$.<br>
            Donc `
          } else texteCorr = fAntecedent.solution
          texteCorr += `$${O}${A}=\\dfrac{${O}${hA}}{${signek}k}=\\dfrac{${texNombre(OhADecimale)}}{${this.sup3 === 1 ? texNombre(absk.valeurDecimale) : absk.texFSD}} ${OhAtimeskinverse} = ${miseEnEvidence(texNombre(OA.valeurDecimale))}\\text{ cm}$.`
          break

        case 'image2etapes': // cas 4
          donnees = [
            `${O}${B}=${texNombre(OB.valeurDecimale)}\\text{ cm}`,
            `${O}${hA}=${texNombre(OhADecimale)}\\text{ cm}`,
            `${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}`,
          ]
          melange = combinaisonListes([0, 1, 2])
          donnee1 = donnees[melange[0]]
          donnee2 = donnees[melange[1]]
          donnee3 = donnees[melange[2]]
          texte = `$${hA}$ et $${hB}$ sont les images respectives
          de $${A}$ et $${B}$ par une homothétie
          ${derapportpositifet} de centre $${O}$ telle que
          $ {${donnee1}}$, $ {${donnee2}}$ et $ {${donnee3}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle} 
          Calculer $${O}${hB}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:`, texteApres: '$ \\text{ cm}$' },
          )

          texte += '.<br>' + fImage2etapes.enonce

          handleAnswers(this, i, { reponse: { value: OhB.valeurAbsolue() } })

          if (this.correctionDetaillee) {
            texteCorr = `$[${O}${hA}]$ est l'image de $[${O}${A}]$
            et $${O} ${hA} ${plusgrandque} ${O} ${A}$
            donc c'est ${unAgrandissement} et on a${sp()}: $${intervallek}$.<br>${fImage2etapes.solution}`
            texteCorr += `Le rapport de cette homothétie est
            ${lopposedu} quotient de la longueur d'un segment
            «${sp()}à l'arrivée${sp()}» par sa longueur «${sp()}au départ${sp()}».<br>
            Soit $k=${signek}\\dfrac{${O}${hA}}{${O}${A}}=${signek}\\dfrac{${texNombre(OhADecimale)}}{${texNombre(OA.valeurDecimale)}}=${this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD}$.<br>
            $[${O}${hB}]$ est l'image de $[${O}${B}]$.<br>
            Or, une homothétie de rapport ${positif}
            est une transformation qui multiplie
            toutes les longueurs par ${lopposede} son rapport.<br>
            Soit $${O}${hB}= ${signek}k \\times ${O}${B}$.<br>
            Donc `
          } else {
            texteCorr = fImage2etapes.solution
            texteCorr += `Soit $k=${signek}\\dfrac{${O}${hA}}{${O}${A}}=${signek}\\dfrac{${texNombre(OhADecimale)}}{${texNombre(OA.valeurDecimale)}}=${this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD}$.<br><br>`
          }
          texteCorr += `$${O}${hB}= ${this.sup3 === 1 ? texNombre(absk.valeurDecimale) : absk.texFSD} \\times ${texNombre(OB.valeurDecimale)} = ${miseEnEvidence(texNombre(OhB.valeurAbsolue()))}\\text{ cm}$.`
          break

        case 'antecendent2etapes': // cas 5
          donnees = [
            `${O}${hB}=${texNombre(OhB)}\\text{ cm}`,
            `${O}${hA}=${texNombre(OhADecimale)}\\text{ cm}`,
            `${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}`,
          ]
          melange = combinaisonListes([0, 1, 2])
          donnee1 = donnees[melange[0]]
          donnee2 = donnees[melange[1]]
          donnee3 = donnees[melange[2]]
          texte = `$${hA}$ et $${hB}$ sont les images respectives
          de $${A}$ et $${B}$ par une homothétie ${derapportpositifet}
          de centre $${O}$ telle que $ {${donnee1}}$, $ {${donnee2}}$ et $ {${donnee3}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle2} 
          Calculer $${O}${B}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:`, texteApres: '$ \\text{ cm}$' },
          )

          texte += '.<br>' + fAntecedent2etapes.enonce

          handleAnswers(this, i, { reponse: { value: OB.texFSD } })

          if (this.correctionDetaillee) {
            texteCorr = `$[${O}${hA}]$ est l'image de $[${O}${A}]$
            et $${O} ${hA} ${plusgrandque} ${O} ${A}$
            donc c'est ${unAgrandissement} et on a${sp()}: $${intervallek}$.<br>${fAntecedent2etapes.solution}`

            texteCorr += `Le rapport de cette homothétie est ${lopposedu} quotient
            de la longueur d'un segment «${sp()}à l'arrivée${sp()}» par sa longueur «${sp()}au départ${sp()}».<br>
            Soit $k=${signek}\\dfrac{${O}${hA}}{${O}${A}}=${signek}\\dfrac{${texNombre(OhADecimale)}}{${texNombre(OA.valeurDecimale)}}=${this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD}$.<br>
            $[${O}${hB}]$ est l'image de $[${O}${B}]$.<br>
            Or, une homothétie de rapport ${positif} est
            une transformation qui multiplie
            toutes les longueurs par ${lopposede} son rapport.<br>
            Soit $${O}${hB}=${signek}k \\times ${O}${B}$.<br>
            Donc `
          } else {
            texteCorr = fImage2etapes.solution
            texteCorr += `Soit $k=${signek}\\dfrac{${O}${hA}}{${O}${A}}=${signek}\\dfrac{${texNombre(OhADecimale)}}{${texNombre(OA.valeurDecimale)}}=${this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD}$.<br><br>`
          }
          texteCorr += `$${O}${B}=\\dfrac{${O}${hB}}{${signek}k}=\\dfrac{${texNombre(OhB)}}{${this.sup3 === 1 ? texNombre(absk.valeurDecimale) : absk.texFSD}} ${OhBtimeskinverse} = ${miseEnEvidence(texNombre(OB.valeurDecimale))}\\text{ cm}$.`

          break

        case 'aireImage': // cas 6
          environ = hAire === hAireArrondie ? '' : 'environ'
          texte = `Une figure a pour aire $ {${texNombre(Aire.valeurDecimale)}\\text{ cm}^2}$.<br>
          Calculer l'aire de son image par une homothétie de rapport $${signek}${this.sup3 === 1 ? texNombre(kAire.valeurDecimale) : kAire.texFSD}$`

          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: `${sp()}:`,
                texteApres:
                  ' $\\text{ cm}^2$ (arrondi au $\\text{ mm}^2$ si besoin)',
              },
            )
          else texte += ' (arrondir au $\\text{mm}^2$ près si besoin)'

          handleAnswers(this, i, { reponse: { value: hAireArrondie } })

          texteCorr = `$${parentheseskAire}^2 \\times ${texNombre(Aire.valeurDecimale)}`
          texteCorr +=
            environ === 'environ'
              ? ` = ${texNombre(hAire)} \\approx ${miseEnEvidence(texNombre(hAireArrondie))}`
              : ` = ${miseEnEvidence(texNombre(hAire))}`
          texteCorr += '\\text{ cm}^2$'
          if (this.correctionDetaillee) {
            texteCorr = `Une homothétie est une transformation qui multiplie toutes les aires par le carré de son rapport.<br>
            $${parentheseskAire}^2 \\times ${texNombre(Aire.valeurDecimale)} = ${texNombre(hAire)}`
            texteCorr +=
              environ === 'environ'
                ? `\\approx ${texNombre(hAireArrondie)}`
                : ''
            texteCorr += `$<br>
            Donc l'aire de l'image de cette figure est ${environ} $ {${miseEnEvidence(texNombre(hAireArrondie))}\\text{ cm}^2}$.`
          }
          break

        case 'aireAntécédent': // cas 7
          texte = `L'image d'une figure par une homothétie de rapport $${signek}${this.sup3 === 1 ? texNombre(kAire.valeurDecimale) : kAire.texFSD}$ a pour aire $ {${texNombre(hAire)}\\text{ cm}^2}$.<br>
          Calculer l'aire de la figure de départ`

          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:`, texteApres: ' $\\text{ cm}^2$' },
          )

          texte += '.'

          handleAnswers(this, i, { reponse: { value: Aire.texFSD } })

          texteCorr = `$ {\\dfrac{${texNombre(hAire)}}{${parentheseskAire}^2} = ${miseEnEvidence(texNombre(Aire.valeurDecimale))}\\text{ cm}^2}$`
          if (this.correctionDetaillee) {
            texteCorr = `Une homothétie est une transformation qui multiplie toutes les aires par le carré de son rapport.<br>
            Notons $\\mathscr{A}$ l'aire de la figure de départ.<br>
            D'où $${parentheseskAire}^2 \\times \\mathscr{A} = ${texNombre(hAire)}$.<br>
            Puis $\\mathscr{A}=\\dfrac{${texNombre(hAire)}}{${parentheseskAire}^2}=${texNombre(Aire.valeurDecimale)}$.<br>
            Donc l'aire de la figure de départ est $ {${miseEnEvidence(texNombre(Aire.valeurDecimale))}\\text{ cm}^2}$.`
          }
          break

        case 'aireRapport': // cas 8
          kAire = positif === 'positif' ? kAire : kAire.multiplieEntier(-1)
          texte = `Une figure et son image par une homothétie de rapport ${positif} ont respectivement pour aires $ {${texNombre(Aire.valeurDecimale)}\\text{ cm}^2}$ et $ {${texNombre(hAire)}\\text{ cm}^2}$.<br>
          Calculer le rapport de l'homothétie`

          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:` },
          )

          texte += '.'

          handleAnswers(this, i, { reponse: { value: kAire.texFSD } })

          if (this.correctionDetaillee) {
            texteCorr = `Une homothétie est une transformation qui multiplie toutes les aires par le carré de son rapport. <br>
            Notons $k$ le rapport de cette homothétie.
            On a donc $k^2 \\times ${texNombre(Aire.valeurDecimale)} = ${texNombre(hAire)}$,
            ou encore $k^2=\\dfrac{${texNombre(hAire)}}{${texNombre(Aire.valeurDecimale)}}$.<br>
            D'où `
          }
          texteCorr += `$ {k=${signek}\\sqrt{\\dfrac{${texNombre(hAire)}}{${texNombre(Aire.valeurDecimale)}}} = ${miseEnEvidence(this.sup3 === 1 ? texNombre(kAire.valeurDecimale) : kAire.texFSD)}}$.`
          break

        case 'rapport2': // cas 9
          donnees = [
            `${A}${hA}=${texNombre(AhA.valeurDecimale)}\\text{ cm}`,
            `${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}`,
          ]
          melange = combinaisonListes([0, 1])
          donnee1 = donnees[melange[0]]
          donnee2 = donnees[melange[1]]
          texte = `$${hA}$ est l'image de $${A}$
          par une homothétie ${derapportpositifet}
          de centre $${O}$ telle que $ {${donnee1}}$ et $ {${donnee2}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle} 
          Calculer le rapport $k$ de cette homothétie`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `${sp()}:` },
          )

          texte += '.<br>' + frapport2.enonce

          handleAnswers(this, i, { reponse: { value: k.texFSD } })

          if (this.correctionDetaillee) {
            texteCorr = `$${O}${hA} = ${calculsOhA} = ${texNombre(OhADecimale)}\\text{ cm}$<br>
            $[${O}${hA}]$ est l'image de $[${O}${A}]$
            et $${O} ${hA} ${plusgrandque} ${O} ${A}$
            donc c'est ${unAgrandissement} et on a${sp()}: $${intervallek}$.<br> ${frapport.solution}`
            texteCorr += `Le rapport de cette homothétie est ${lopposedu} quotient
            de la longueur d'un segment «${sp()}à l'arrivée${sp()}»
            par sa longueur «${sp()}au départ${sp()}».<br>
            Soit `
          } else texteCorr = frapport.solution
          texteCorr += `$k=${signek}\\dfrac{${O}${hA}}{${O}${A}}=${signek}\\dfrac{${texNombre(OhADecimale)}}{${texNombre(OA.valeurDecimale)}}=${miseEnEvidence(this.sup3 === 1 ? texNombre(k.valeurDecimale) : k.texFSD)}$.`
          break

        case 'encadrerk': // cas 10
          donnees = [
            `${O}${hA}=${texNombre(OhADecimale)}\\text{ cm}`,
            `${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}`,
          ]
          melange = combinaisonListes([0, 1])
          donnee1 = donnees[melange[0]]
          donnee2 = donnees[melange[1]]
          texte = `$${hA}$ est l'image de $${A}$
          par une homothétie ${derapportpositifet}
          de centre $${O}$ telle que $ {${donnee1}}$ et $ {${donnee2}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle} 
          Sans effectuer de calculs, que peut-on dire du rapport $k$ de cette homothétie${sp()}? Choisir la bonne réponse.<br>
          ${figurealechelle}
          ${frapport.enonce}`

          this.autoCorrection[i] = {}
          this.autoCorrection[i].propositions = [
            {
              texte: '$k < -1$',
              statut: k.valeurDecimale < -1,
            },
            {
              texte: '$-1 < k < 0$',
              statut: k.valeurDecimale > -1 && k.valeurDecimale < 0,
            },
            {
              texte: '$0 < k < 1$',
              statut: k.valeurDecimale < 1 && k.valeurDecimale > 0,
            },
            {
              texte: '$k > 1$',
              statut: k.valeurDecimale > 1,
            },
          ]
          this.autoCorrection[i].options = {
            ordered: false,
          }
          texte += '<br>' + propositionsQcm(this, i).texte

          if (this.correctionDetaillee) {
            texteCorr = `$[${O}${hA}]$ est l'image de $[${O}${A}]$
            et $${O} ${hA} ${plusgrandque} ${O} ${A}$
            donc c'est ${unAgrandissement}.<br>
            De plus, $${hA}${inNotin}[${O}${A})$.
            ${frapport.solution}<br>Donc `
          } else texteCorr = frapport.solution + '<br>'
          texteCorr += `$${miseEnEvidence(intervallek)}$`
          texteCorr += this.correctionDetaillee ? '.' : ''
          break

        case 'encadrerk2': // cas 11
        default:
          donnees = [
            `${A}${hA}=${texNombre(AhA.valeurDecimale)}\\text{ cm}`,
            `${O}${A}=${texNombre(OA.valeurDecimale)}\\text{ cm}`,
          ]
          melange = combinaisonListes([0, 1])
          donnee1 = donnees[melange[0]]
          donnee2 = donnees[melange[1]]
          texte = `$${hA}$ est l'image de $${A}$
          par une homothétie ${derapportpositifet}
          de centre $${O}$ telle que $ {${donnee1}}$ et $ {${donnee2}}$.<br>
          ${illustrerParUneFigureAMainLevee} ${figurealechelle} 
          Sans effectuer de calculs, que peut-on dire du rapport $k$ de cette homothétie${sp()}? Choisir la bonne réponse.<br>
          ${figurealechelle}
          ${frapport2.enonce}`

          this.autoCorrection[i] = {}
          this.autoCorrection[i].propositions = [
            {
              texte: '$k < -1$',
              statut: k.valeurDecimale < -1,
            },
            {
              texte: '$-1 < k < 0$',
              statut: k.valeurDecimale > -1 && k.valeurDecimale < 0,
            },
            {
              texte: '$0 < k < 1$',
              statut: k.valeurDecimale < 1 && k.valeurDecimale > 0,
            },
            {
              texte: '$k > 1$',
              statut: k.valeurDecimale > 1,
            },
          ]
          this.autoCorrection[i].options = {
            ordered: false,
          }
          texte += '<br>' + propositionsQcm(this, i).texte

          if (this.correctionDetaillee) {
            texteCorr = `$${O}${hA} = ${calculsOhA} = ${texNombre(OhADecimale)}\\text{ cm}$<br>
            $[${O}${hA}]$ est l'image de $[${O}${A}]$
            et $${O} ${hA} ${plusgrandque} ${O} ${A}$
            donc c'est ${unAgrandissement}.<br>
            De plus, $${hA}${inNotin}[${O}${A})$.
            ${frapport2.solution}<br>Donc `
          } else texteCorr = frapport2.solution + '<br>'
          texteCorr += `$${miseEnEvidence(intervallek)}$`
          texteCorr += this.correctionDetaillee ? '.' : ''
          break
      }

      if (this.questionJamaisPosee(i, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
