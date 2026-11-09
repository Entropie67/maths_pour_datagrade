import { Arc, arc } from '../../lib/2d/Arc'
import { Cercle, cercleCentrePoint } from '../../lib/2d/cercle'
import {
  CodageAngleDroit,
  codageAngleDroit,
} from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { motifs } from '../../lib/2d/pattern'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  combinaisonListes,
  getRandomSubarray,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const dateDeModificationImportante = '12/04/2026'
export const titre = 'Résoudre un problème en utilisant des fractions'

/**
 * * Résoudre un problème additif de fractions niv 5e
 * @author Éric Elter
 * (sur les bases d'un exo de SL)
 */

export const uuid = 'b625e'

export const refs = {
  'fr-fr': ['5N3C-1'],
  'fr-2016': ['5N22'],
  'fr-ch': ['9R3NO4K-4', '10CTNO3D-7', '10LCNO3D-7', '10LSNO3D-7', 'PRQNO15B-12'],
}
// une fonction pour gérer le codage des angles
function myCodageAngle(
  A: PointAbstrait,
  O: PointAbstrait,
  B: PointAbstrait,
  angle: number,
  numeroMotif: number,
): CodageAngleDroit | Arc {
  if (angle === 90) {
    return codageAngleDroit(A, O, B)
  } else {
    const a = arc(A, O, angle, true, 'none', 'black', 0.5)
    a.hachures = motifs(numeroMotif)
    a.couleurDeRemplissage = colorToLatexOrHTML('none')
    a.couleurDesHachures = colorToLatexOrHTML(bleuMathalea)
    a.epaisseurDesHachures = 2
    return a
  }
}

// une fonction pour gérer le texte en fonction de l'angle (sup=1 : 30°, sup=2 : 22.5°, sup=3 : 18°)
function myTexteVolsCorr(
  angle: number,
  destination: string,
  nbPetitsSecteurs: number,
) {
  switch (angle) {
    case 90:
      return `du secteur est un angle droit, il mesure $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque, soit $\\dfrac{1}{4}$.`
    case 30:
      return `du secteur apparaît $${nbPetitsSecteurs}$ fois, alors que le secteur le plus grand a un angle plat qui vaut $180^\\circ$ et que le dernier secteur a un angle droit qui vaut $90^\\circ$.<br>
L'angle pour un tour complet vaut $360^\\circ$, donc l'angle du secteur pour ${destination} vaut $(360-180-90)\\div ${nbPetitsSecteurs} = ${angle}^\\circ$.<br>
L'angle pour ${destination} mesure donc $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque, soit $\\dfrac{1}{12}$.`
    case 22.5:
      return `du secteur apparaît $${nbPetitsSecteurs}$ fois, alors que le secteur le plus grand a un angle plat qui vaut $180^\\circ$ et que le dernier secteur a un angle droit qui vaut $90^\\circ$.<br>
L'angle pour un tour complet vaut $360^\\circ$, donc l'angle du secteur pour ${destination} vaut $(360-180-90)\\div ${nbPetitsSecteurs} = ${texNombre(angle)}^\\circ$.<br>
L'angle pour ${destination} mesure donc $${texNombre(angle)}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${texNombre(angle)}}{360}$ du disque, soit $\\dfrac{1}{16}$.`
    case 18:
      return `du secteur apparaît $${nbPetitsSecteurs}$ fois, alors que le secteur le plus grand a un angle plat qui vaut $180^\\circ$ et que le dernier secteur a un angle droit qui vaut $90^\\circ$.<br>
L'angle pour un tour complet vaut $360^\\circ$, donc l'angle du secteur pour ${destination} vaut $(360-180-90)\\div ${nbPetitsSecteurs} = ${angle}^\\circ$.<br>
L'angle pour ${destination} mesure donc $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque, soit $\\dfrac{1}{20}$.`
    case 180:
    default:
      return `du secteur est un angle plat, il mesure $${angle}^\\circ$ sur les $360^\\circ$ d'un tour complet, donc il représente $\\dfrac{${angle}}{360}$ du disque, soit $\\dfrac{1}{2}$.`
  }
}

// une fonction pour positionner le label
// y est l'ordonnée du point
function myLabelPosition(y: number) {
  if (y < 0) {
    return 'below'
  } else {
    return 'above'
  }
}
export default class ProblemesAdditifsFractions5e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : 5 secteurs angulaires',
        '2 : 6 secteurs angulaires',
        '3 : 7 secteurs angulaires',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de destinations',
      [
        'Nombres séparés par des tirets  :',
        '1 : Pays',
        '2 : Ville',
        '3 : Continents',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.sup2 = '4'
  }

  nouvelleVersion() {
    const pays: [string, string][] = [
      ['France', 'la France'],
      ['Allemagne', "l'Allemagne"],
      ['Espagne', "l'Espagne"],
      ['Italie', "l'Italie"],
      ['Royaume-Uni', 'le Royaume-Uni'],
      ['États-Unis', 'les États-Unis'],
      ['Canada', 'le Canada'],
      ['Brésil', 'le Brésil'],
      ['Argentine', "l'Argentine"],
      ['Japon', 'le Japon'],
      ['Chine', 'la Chine'],
      ['Australie', "l'Australie"],
    ]

    const villes: [string, string][] = [
      ['Paris', 'Paris'],
      ['New York', 'New York'],
      ['Tokyo', 'Tokyo'],
      ['Londres', 'Londres'],
      ['Berlin', 'Berlin'],
      ['Madrid', 'Madrid'],
      ['Rome', 'Rome'],
      ['Sydney', 'Sydney'],
      ['Toronto', 'Toronto'],
      ['Nouméa', 'Nouméa'],
      ['Pékin', 'Pékin'],
      ['Dubaï', 'Dubaï'],
    ]
    const continents: [string, string][] = [
      ['Afrique', "l'Afrique"],
      ['Amérique du Nord', "l'Amérique du Nord"],
      ['Amérique du Sud', "l'Amérique du Sud"],
      ['Asie', "l'Asie"],
      ['Europe', "l'Europe"],
      ['Océanie', "l'Océanie"],
      ['Antarctique', "l'Antarctique"],
    ]
    const typesDestinationsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const listeDestinations = combinaisonListes(
      typesDestinationsDisponibles,
      this.nbQuestions,
    )
    const typesSecteursDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const listeSecteurs = combinaisonListes(
      typesSecteursDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on définit les fractions pour les vols et les arguments pour le graphique
      type FracVols = [number, number, number][]
      const motif1 = randint(0, 3)
      const motif2 = randint(4, 10)

      /**
       * Chaque entrée : [numérateur, dénominateur, motifIndex]
       * sup=1 → 5 secteurs : 3×30°(1/12), 1×90°(1/4), 1×180°(1/2)
       * sup=2 → 6 secteurs : 4×22,5°(1/16), 1×90°(1/4), 1×180°(1/2)
       * sup=3 → 7 secteurs : 5×18°(1/20), 1×90°(1/4), 1×180°(1/2)
       */
      let fracVols: FracVols
      let nbPetitsSecteurs: number // nombre de petits secteurs identiques (hors 90° et 180°)

      switch (listeSecteurs[i]) {
        case 2:
          // 6 secteurs : 4×22,5° (1/16), 1×90° (1/4), 1×180° (1/2)
          nbPetitsSecteurs = 4
          fracVols = [
            [1, 16, motif1],
            [1, 16, motif1],
            [1, 16, motif1],
            [1, 16, motif1],
            [1, 4, 100],
            [1, 2, motif2],
          ]
          break
        case 3:
          // 7 secteurs : 5×18° (1/20), 1×90° (1/4), 1×180° (1/2)
          nbPetitsSecteurs = 5
          fracVols = [
            [1, 20, motif1],
            [1, 20, motif1],
            [1, 20, motif1],
            [1, 20, motif1],
            [1, 20, motif1],
            [1, 4, 100],
            [1, 2, motif2],
          ]
          break
        default:
          // sup=1 → 5 secteurs : 3×30° (1/12), 1×90° (1/4), 1×180° (1/2)
          nbPetitsSecteurs = 3
          fracVols = [
            [1, 12, motif1],
            [1, 12, motif1],
            [1, 12, motif1],
            [1, 4, 100],
            [1, 2, motif2],
          ]
          break
      }

      // on mélange pour l'aléatoire tant que les deux premières fractions sont égales
      do {
        fracVols = shuffle(fracVols)
      } while (fracVols[0][1] === fracVols[1][1])

      let nbVolsTotal
      let choixDestinations = []
      switch (listeDestinations[i]) {
        case 1:
          choixDestinations = pays
          break
        case 2:
          choixDestinations = villes
          break
        default:
          choixDestinations = continents
          break
      }
      const destinationsVols = getRandomSubarray(
        choixDestinations,
        listeSecteurs[i] + 4,
      )

      // nbVolsTotal doit être divisible par 2, 3 ou 4 selon sup
      // sup=1 : dénominateurs 12, 4, 2  → divisible par 12 (= ppcm(12,4,2))
      // sup=2 : dénominateurs 16, 4, 2  → divisible par 16
      // sup=3 : dénominateurs 20, 4, 2  → divisible par 20
      const diviseur =
        listeSecteurs[i] === 2 ? 16 : listeSecteurs[i] === 3 ? 20 : 12
      do {
        nbVolsTotal = randint(200, 600)
      } while (nbVolsTotal % diviseur !== 0)

      type Categorie = {
        destination: string
        nom: string
        frac: [number, number, number]
        angle: number
        numeroMotif: number
      }

      type Situation = {
        fin_enonce_situation: string
        nom_enonce: string
        last_question: string[]
        categories: Categorie[]
        nb_total: number
        fig: string
      }

      const categories: Categorie[] = destinationsVols.map((dest, i) => ({
        destination: dest[1],
        nom: dest[0],
        frac: fracVols[i],
        angle: 360 / fracVols[i][1],
        numeroMotif: fracVols[i][2],
      }))
      const situations: Situation = {
        fin_enonce_situation:
          "vols d'une compagnie aérienne selon la destination",
        nom_enonce: 'vols',
        last_question: [
          'cette compagnie a affrété',
          'vols',
          'le nombre de vols',
          'Le nombre de vols',
        ],
        categories,
        nb_total: nbVolsTotal,
        fig: '',
      }

      // Vestige utile de fenetreMathalea2d
      const fenetreMathalea2D = {
        xmin: -10,
      }

      const OVols: PointAbstrait = pointAbstrait(0, 0)
      const AVols: PointAbstrait = pointAbstrait(fenetreMathalea2D.xmin + 6, 0)
      const cVols: Cercle = cercleCentrePoint(OVols, AVols, 'black')
      cVols.epaisseur = 2

      const points = [AVols] // point de départ
      const segments: Segment[] = []
      const codages: (Arc | CodageAngleDroit)[] = []

      situations.categories.forEach((cat, i) => {
        const prevPoint: PointAbstrait = points[i]

        const nextPoint: PointAbstrait = rotation(prevPoint, OVols, cat.angle)
        points.push(nextPoint)

        segments.push(segment(OVols, nextPoint))

        codages.push(
          myCodageAngle(
            prevPoint,
            OVols,
            nextPoint,
            cat.angle,
            cat.numeroMotif,
          ),
        )
      })

      const legendSegments: Segment[] = []
      const legendPoints: PointAbstrait[] = []

      const ALegende = pointAbstrait(fenetreMathalea2D.xmin + 4, 0)

      // point initial
      let prevLegendPoint = rotation(
        ALegende,
        OVols,
        situations.categories[0].angle / 2,
        // situations.categories[0].nom,
      )

      prevLegendPoint.positionLabel = myLabelPosition(prevLegendPoint.y)
      const labelDestination = pointAbstrait(
        OVols.x < prevLegendPoint.x
          ? prevLegendPoint.x + situations.categories[0].nom.length / 10
          : prevLegendPoint.x - situations.categories[0].nom.length / 5,
        prevLegendPoint.y,
        situations.categories[0].nom,
        myLabelPosition(prevLegendPoint.y),
      )
      legendPoints.push(prevLegendPoint, labelDestination)

      for (let i = 0; i < situations.categories.length; i++) {
        const cat = situations.categories[i]

        const piePoint = points[i] // A, B, C, D...

        const projected = rotation(piePoint, OVols, cat.angle / 2) //, cat.nom)

        const seg = segment(prevLegendPoint, projected)
        seg.styleExtremites = '->'
        seg.pointilles = 5

        legendSegments.push(seg)

        // préparer le point suivant (sauf dernier)
        if (i < situations.categories.length - 1) {
          const nextCat = situations.categories[i + 1]

          const nextLegendPoint = rotation(
            prevLegendPoint,
            OVols,
            cat.angle / 2 + nextCat.angle / 2,
          )

          nextLegendPoint.positionLabel = myLabelPosition(nextLegendPoint.y)
          legendPoints.push(nextLegendPoint)
          prevLegendPoint = nextLegendPoint
          const labelDestination = pointAbstrait(
            OVols.x < prevLegendPoint.x
              ? prevLegendPoint.x + nextCat.nom.length / 5
              : prevLegendPoint.x - nextCat.nom.length / 5,
            prevLegendPoint.y,
            nextCat.nom,
            myLabelPosition(prevLegendPoint.y),
          )

          legendPoints.push(labelDestination)
        }
      }
      const segmentOA = segment(OVols, AVols)

      const mesAppels = [
        cVols,
        segmentOA,
        ...segments,
        ...codages,
        ...legendPoints.map((p) => labelPoint(p)),
        ...legendSegments,
      ]

      const figVols = mathalea2d(
        Object.assign({ scale: 0.5 }, fixeBordures(mesAppels)),
        mesAppels,
      )
      situations.fig = figVols

      let indexSouSegmentQuestionCorr = 0

      const texteMathfield = `${addMultiMathfield(this, i, {
        dataTemplate: `a) Quelle fraction représente les ${situations.nom_enonce} vers ${situations.categories[0].destination} ? %{champ1}
                   b) Quelle fraction représente les ${situations.nom_enonce} vers ${situations.categories[1].destination} ? %{champ2}
                   c) Sachant que ${situations.last_question[0]} $${situations.nb_total}$ ${situations.last_question[1]} et que les ${situations.nom_enonce} vers ${situations.categories[2].destination} représentent $\\dfrac{${situations.categories[2].frac[0]}}{${situations.categories[2].frac[1]}}$ de ce total, calculer ${situations.last_question[2]} vers ${situations.categories[2].destination} ? %{champ3}
                  `,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
          champ2: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
          champ3: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
        },
      }).replaceAll('$\\ldots\\ldots$', '')}`

      const enonces = {
        enonce: `
On a représenté sur le diagramme circulaire ci-dessous la répartition des ${situations.fin_enonce_situation}.<br>
Les secteurs angulaires ayant le même motif ont la même mesure d'angle. L'un des angles est un angle plat.<br>
${situations.fig}
${texteMathfield}
`,
        correction: `
${numAlpha(indexSouSegmentQuestionCorr++)} Pour ${situations.categories[0].destination}, l'angle ${myTexteVolsCorr(situations.categories[0].angle, situations.categories[0].destination, nbPetitsSecteurs)}<br>
La fraction qui représente les ${situations.nom_enonce} vers ${situations.categories[0].destination} vaut donc $${miseEnEvidence(`\\dfrac{${situations.categories[0].frac[0]}}{${situations.categories[0].frac[1]}}`)}$.<br>

${numAlpha(indexSouSegmentQuestionCorr++)} Pour ${situations.categories[1].destination}, l'angle ${myTexteVolsCorr(situations.categories[1].angle, situations.categories[0].destination, nbPetitsSecteurs)}<br>
La fraction qui représente les ${situations.nom_enonce} vers ${situations.categories[1].destination} vaut donc $${miseEnEvidence(`\\dfrac{${situations.categories[1].frac[0]}}{${situations.categories[1].frac[1]}}`)}$.<br>

${numAlpha(indexSouSegmentQuestionCorr++)} Calculons $\\dfrac{${situations.categories[2].frac[0]}}{${situations.categories[2].frac[1]}}$ de $${situations.nb_total}$ :<br>
$\\dfrac{${situations.categories[2].frac[0]}}{${situations.categories[2].frac[1]}}\\times ${situations.nb_total} = \\dfrac{${situations.categories[2].frac[0]}\\times ${situations.nb_total}}{${situations.categories[2].frac[1]}} = \\dfrac{${situations.categories[2].frac[0]}\\times ${situations.nb_total / situations.categories[2].frac[1]}\\times ${situations.categories[2].frac[1]}}{${situations.categories[2].frac[1]}} = \\dfrac{${situations.categories[2].frac[0]}\\times ${situations.nb_total / situations.categories[2].frac[1]}\\times \\cancel{${situations.categories[2].frac[1]}}}{\\cancel{${situations.categories[2].frac[1]}}} = ${situations.categories[2].frac[0]}\\times ${situations.nb_total / situations.categories[2].frac[1]} = ${situations.nb_total / situations.categories[2].frac[1]}$<br>
${situations.last_question[3]} vers ${situations.categories[2].destination} vaut donc $${miseEnEvidence(`${situations.nb_total / situations.categories[2].frac[1]}`)}$.
`,
      }

      texte = `${enonces.enonce}`
      texteCorr = `${enonces.correction}`

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            champ1: {
              value: fraction(
                situations.categories[0].frac[0],
                situations.categories[0].frac[1],
              ).texFraction,
              options: { fractionEgale: true },
            },
            champ2: {
              value: fraction(
                situations.categories[1].frac[0],
                situations.categories[1].frac[1],
              ).texFraction,
              options: { fractionEgale: true },
            },
            champ3: {
              value: situations.nb_total / situations.categories[2].frac[1],
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
