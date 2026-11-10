import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { cercle } from '../../lib/2d/cercle'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { polygone } from '../../lib/2d/polygones'
import { cylindre } from '../../lib/2d/projections3d'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, Latex2d } from '../../lib/2d/textes'
import { similitude, translation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'

export const interactifReady = true

export const titre = 'Calculer des longueurs avec un patron de cylindre'

export const dateDePublication = '27/04/2024'
export const dateDeModifImportante = '18/05/2026'

export const uuid = 'bc788'
export const refs = {
  'fr-fr': ['5G2B'],
  'fr-2016': ['5G52'],
  'fr-ch': ['10CTES1B-3', '10LCES1B-3', '10LSES1B-3', '11CTES2B-1', '11LCES2B-1', '11LSES2B-1', 'PRQES07D-2'],
}
/**
 * calculer des longueurs avec un patron de cylindre
 * 'problème en  baseCoteCoucheVuDroite avec r=4'
 * @author Olivier Mimeau
 */
export default class longueursPatronsCylindre extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : Cylindre vers patron \n2 : Patron vers cylindre \n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Position du cylindre',
      'Nombres séparés par des tirets :\n1 : Debout \n2 : La base en face avant \n3 : La base vue de côté \n4 : Mélange',
    ]
    this.besoinFormulaire3Texte = [
      'Base du cylindre donnée par son ...',
      'Nombres séparés par des tirets :\n1 : Rayon \n2 : Diamètre \n3 : Mélange',
    ]
    this.sup = '3'
    this.sup2 = '4'
    this.sup3 = '3'
  }

  nouvelleVersion() {
    // ['CylindreVersPatron', 'PatronVersCylindre'], 'type3'
    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['CylindreVersPatron', 'PatronVersCylindre'],
      shuffle: false,
      nbQuestions: 999,
    })
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    // ['DeboutVuDessus', 'baseAvantCoucheVuGauche', 'baseCoteCoucheVuDroite']/// ['DeboutVuDessus', 'baseCoteCoucheVuDroite', 'baseAvantCoucheVuGauche']// ['DeboutVuDessus', 'baseAvantCoucheVuDroite', 'baseCoteCoucheVuDroite']// ['DeboutVuDessus', 'DeboutVuDessous', 'baseAvantCoucheVuGauche', 'baseAvantCoucheVuDroite', 'baseCoteCoucheVuGauche', 'baseCoteCoucheVuDroite']
    const orientationCylindre = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: [
        'DeboutVuDessus',
        'baseAvantCoucheVuGauche',
        'baseCoteCoucheVuDroite',
      ],
      shuffle: false,
      nbQuestions: 999,
    })
    const listeTypeOrientationCylindre = combinaisonListes(
      orientationCylindre,
      this.nbQuestions,
    )

    const baseCylindre = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['rayon', 'diametre'],
      shuffle: false,
      nbQuestions: 999,
    })
    const listeTypeBaseCylindre = combinaisonListes(
      baseCylindre,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = '' // listeTypeQuestions[i] + '<br>' //
      let texteCorr = ''
      const tailleMinFigure = 7
      const scaleDessin = 0.5
      const largeurCol = 50 // en % sert pour sortie PDF et HTML ?
      const largeurHTMCol = `${tailleMinFigure * 20}px`
      const objetsPerspective = []
      const objetsPerspectiveReponse = []
      const objetsPatron = []
      const objetsPatronReponse = []

      const rEx = randint(2, 7) // rayon
      const hEx = randint(3, 10, [rEx]) // hauteur
      const rAff = Math.max(3, Math.min(rEx, 5))
      const hAff = hEx
      const cent1 = pointAbstrait(0, 0, 'A', 'left')

      /*
       * On travaille sur la perspective du cylindre : on crée d'abord le cylindre puis les éléments servant à poser les questions (rayon/diamètre et hauteur) en fonction de la position du cylindre et de la question posée
       */
      let cylindreEx = cylindre({
        centre: cent1,
        rx: rAff,
        hauteur: hAff,
        color: 'black',
      })
      let cent2 = pointAbstrait(0, hAff, 'Z', 'left')
      // On initialise les éléments servant aux questions avec n'importe quoi (ce sera remplacé ensuite)
      let ext1RayonDiametre: PointAbstrait = pointAbstrait(0, 0)
      let ext2RayonDiametre: PointAbstrait
      // On initialise les éléments servant aux questions avec n'importe quoi (ce sera remplacé ensuite)
      let ext1Hauteur = pointAbstrait(0, 0)
      let ext2Hauteur = pointAbstrait(0, 1)

      switch (listeTypeOrientationCylindre[i]) {
        case 'DeboutVuDessus':
          cylindreEx = cylindre({
            centre: cent1,
            rx: rAff,
            hauteur: hAff,
            position: 'DeboutVuDessus',
            color: 'black',
          })
          cent2 = pointAbstrait(0, hAff, 'B', 'left')
          ext1RayonDiametre = pointAbstrait(rAff, 0)
          if (listeTypeBaseCylindre[i] === 'rayon') {
            ext2RayonDiametre = cent1
          } else {
            // 'diametre'
            cent1.positionLabel = 'above'
            ext2RayonDiametre = pointAbstrait(-rAff, 0)
          }
          ext1Hauteur = pointAbstrait(rAff, hAff)
          ext2Hauteur = pointAbstrait(rAff, 0)
          break
        case 'baseAvantCoucheVuGauche': {
          // valeurs dans la perspective
          const angDeFuite = 30
          const coefDeFuite = 0.8
          // valeurs dans la perspective
          cylindreEx = cylindre({
            centre: cent1,
            rx: rAff,
            hauteur: hAff,
            position: 'baseAvantCoucheVuGauche',
            color: 'black',
            coefficientDeFuite: coefDeFuite,
          })
          cent2 = pointAdistance(
            cent1,
            hAff * coefDeFuite,
            angDeFuite,
            'G',
            'left',
          )
          const ey = -rAff * Math.cos((angDeFuite * Math.PI) / 180)
          const ex = rAff * Math.sin((angDeFuite * Math.PI) / 180)
          if (listeTypeBaseCylindre[i] === 'rayon') {
            ext1RayonDiametre = pointAbstrait(cent1.x + rAff, cent1.y)
            ext2RayonDiametre = cent1
          } else {
            // 'diametre'
            ext1RayonDiametre = pointAbstrait(cent1.x, cent1.y + rAff)
            ext2RayonDiametre = pointAbstrait(cent1.x, cent1.y - rAff)
          }
          ext1Hauteur = pointAbstrait(cent2.x + ex, cent2.y + ey)
          ext2Hauteur = pointAbstrait(cent1.x + ex, cent1.y + ey)
          break
        }
        case 'baseCoteCoucheVuDroite':
        default:
          // a finir
          cylindreEx = cylindre({
            centre: cent1,
            rx: rAff,
            hauteur: hAff,
            position: 'baseCoteCoucheVuDroite',
            color: 'black',
          })
          cent2 = pointAbstrait(hAff, 0, 'B', 'left')
          if (listeTypeBaseCylindre[i] === 'rayon') {
            ext2RayonDiametre = cent2
            ext1RayonDiametre = pointAbstrait(hAff, rAff)
          } else {
            // 'diametre'
            ext1RayonDiametre = pointAbstrait(hAff, rAff)
            ext2RayonDiametre = pointAbstrait(hAff, -rAff)
          }
          ext1Hauteur = pointAbstrait(0, rAff)
          ext2Hauteur = pointAbstrait(hAff, rAff)
          break
      }
      const tCent1 = tracePoint(cent1)
      const tCent2 = tracePoint(cent2)

      const segRayon = segment(ext1RayonDiametre, ext2RayonDiametre, 'black')
      segRayon.pointilles = 1

      const qRayonCylindre = placeLatexSurSegment(
        '\\text{.......}',
        ext1RayonDiametre,
        ext2RayonDiametre,
      )
      const qHauteurCylindre = placeLatexSurSegment(
        '\\text{.......}',
        ext1Hauteur,
        ext2Hauteur,
      )

      const rRayonCylindre = placeLatexSurSegment(
        `${texNombre(listeTypeBaseCylindre[i] === 'rayon' ? rEx : 2 * rEx, 1)}\\text{ cm}`,
        ext1RayonDiametre,
        ext2RayonDiametre,
      )

      const rHauteurCylindre = placeLatexSurSegment(
        `${texNombre(hEx, 1)}\\text{ cm}`,
        ext1Hauteur,
        ext2Hauteur,
      )
      if (listeTypeQuestions[i] === 'CylindreVersPatron') {
        objetsPerspective.push(
          cylindreEx,
          tCent1,
          tCent2,
          segRayon,
          rRayonCylindre,
          rHauteurCylindre,
          labelPoint(cent1, cent2),
        )
        objetsPerspectiveReponse.push(
          cylindreEx,
          tCent1,
          tCent2,
          segRayon,
          rRayonCylindre,
          rHauteurCylindre,
          labelPoint(cent1, cent2),
        )
      } else {
        objetsPerspective.push(
          cylindreEx,
          tCent1,
          tCent2,
          segRayon,
          labelPoint(cent1, cent2),
        )
        if (this.interactif) {
          const boolRayonDiametre =
            ext1RayonDiametre.y - ext2RayonDiametre.y < 1e-6

          const mRayonDiametre = coordMultiMathsFieldSurSegment(
            ext1RayonDiametre,
            ext2RayonDiametre,
            boolRayonDiametre ? 0.7 : 1.3,
          ) //milieu(ext1RayonDiametre, ext2RayonDiametre)
          const boolHauteur = ext1Hauteur.y - ext2Hauteur.y < 1e-6
          const MHauteur = coordMultiMathsFieldSurSegment(
            ext1Hauteur,
            ext2Hauteur,
            boolHauteur ? 0.7 : 1.3,
          )

          const qMetaInteractif = new MetaInteractif2d(
            [
              {
                content: '%{champ1}\\text{ cm}', // champ1 est à utiliser systématiquement pour tous les inputs
                x: mRayonDiametre.x,
                y: mRayonDiametre.y,
                classe: '', // Ici on pourra mettre le clavier à utiliser
                blanc: '\\ldots ',
                opacity: 1,
                index: 0,
              },
              {
                content: '%{champ1}\\text{ cm}', // On utilise toujours champ1 comme placeholder
                x: MHauteur.x,
                y: MHauteur.y,
                classe: '',
                blanc: '\\ldots ',
                opacity: 1,
                index: 1,
              },
            ],
            {
              exercice: this,
              question: i,
            },
          )
          handleAnswers(
            this,
            i,
            {
              bareme: toutPourUnPoint,
              field0: {
                value: texNombre(
                  listeTypeBaseCylindre[i] === 'rayon' ? rEx : 2 * rEx,
                  1,
                ),
              },
              field1: { value: texNombre(hEx, 1) },
            },
            { formatInteractif: 'MetaInteractif2d' },
          )
          objetsPerspective.push(qMetaInteractif)
        } else {
          objetsPerspective.push(qRayonCylindre, qHauteurCylindre)
        }
        objetsPerspectiveReponse.push(
          cylindreEx,
          tCent1,
          tCent2,
          segRayon,
          rRayonCylindre,
          rHauteurCylindre,
          labelPoint(cent1, cent2),
        )
      }

      /*
       * On travaille sur le patron du cylindre : on crée d'abord le patron puis les éléments servant à poser les questions (longueur, hauteur, rayon/diamètre) en fonction de la position du cylindre et de la question posée
       */

      const [dimlRect, dimLRect, dimRCercle] = [4, 12, 2] // dimLargeurRectangle
      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(0, dimlRect)
      const C = pointAbstrait(dimLRect, dimlRect)
      const D = pointAbstrait(dimLRect, 0)
      const centreHaut = pointAbstrait(
        randint(dimlRect, dimLRect - dimRCercle),
        dimlRect + dimRCercle,
      )
      const centreBas = pointAbstrait(
        randint(dimlRect, dimLRect - dimRCercle),
        -dimRCercle,
      )
      const rectanglePatron = polygone([A, B, C, D], 'black')
      const cercleHaut = cercle(centreHaut, dimRCercle)
      const cercleBas = cercle(centreBas, dimRCercle)
      objetsPatron.push(rectanglePatron, cercleHaut, cercleBas)
      objetsPatronReponse.push(rectanglePatron, cercleHaut, cercleBas)
      // les quatre éléments suivants : positions à varier ??
      let ALongueurPatron: PointAbstrait
      let BLongueurPatron: PointAbstrait
      let coteHauteurPatron: Segment
      let qHauteurPatron: Latex2d
      let rHauteurPatron: Latex2d
      let ptExtremite1Rayon: PointAbstrait
      let ptExtremite2Rayon: PointAbstrait
      let ptExtremite1Diametre: PointAbstrait
      let ptExtremite2Diametre: PointAbstrait
      if (choice([0, 1]) === 0) {
        ALongueurPatron = C
        BLongueurPatron = B
      } else {
        ALongueurPatron = A
        BLongueurPatron = D
      }
      const perimetre = 2 * rEx * Math.PI
      const coteLongueurPatron = afficheCoteSegmentSansTexte(
        segment(ALongueurPatron, BLongueurPatron),
        0.5,
        'black',
      )
      const qLongueurPatron = placeLatexSurSegment(
        '\\text{.......}',
        ALongueurPatron,
        BLongueurPatron,
        { distance: 1 },
      )
      const rLongueurPatron = placeLatexSurSegment(
        `${listeTypeQuestions[i] === 'CylindreVersPatron' ? '\\approx' : ''}\\text{${texNombre(perimetre, 1)} cm}`,
        ALongueurPatron,
        BLongueurPatron,
        { letterSize: 'small', distance: 1 },
      )

      if (choice([0, 1]) === 0 && !this.interactif) {
        coteHauteurPatron = afficheCoteSegmentSansTexte(
          segment(A, B),
          0.5,
          'black',
        )
        qHauteurPatron = placeLatexSurSegment('\\text{.......}', A, B, {
          distance: 1,
        })
        rHauteurPatron = placeLatexSurSegment(`\\text{${hEx} cm}`, A, B, {
          letterSize: 'small',
          distance: 1,
        })
      } else {
        coteHauteurPatron = afficheCoteSegmentSansTexte(
          segment(C, D),
          0.5,
          'black',
        )
        qHauteurPatron = placeLatexSurSegment('\\text{.......}', C, D, {
          distance: 1,
        })
        rHauteurPatron = placeLatexSurSegment(`\\text{${hEx} cm}`, C, D, {
          letterSize: 'small',
          distance: 1,
        })
      }
      if (choice([0, 1]) === 0) {
        ptExtremite1Rayon = pointAbstrait(centreHaut.x, centreHaut.y)
        ptExtremite2Rayon = pointAbstrait(
          centreHaut.x + dimRCercle,
          centreHaut.y,
        )
        ptExtremite1Diametre = pointAbstrait(
          centreBas.x - dimRCercle,
          centreBas.y,
        )
        ptExtremite2Diametre = pointAbstrait(
          centreBas.x + dimRCercle,
          centreBas.y,
        )
      } else {
        ptExtremite1Rayon = pointAbstrait(centreHaut.x, centreHaut.y)
        ptExtremite2Rayon = pointAbstrait(
          centreHaut.x + dimRCercle,
          centreHaut.y,
        )
        ptExtremite1Diametre = pointAbstrait(
          centreBas.x - dimRCercle,
          centreBas.y,
        )
        ptExtremite2Diametre = pointAbstrait(
          centreBas.x + dimRCercle,
          centreBas.y,
        )
      }
      const coteRayon = afficheCoteSegmentSansTexte(
        segment(ptExtremite1Rayon, ptExtremite2Rayon),
        0,
        'black',
      )
      const coteDiametre = afficheCoteSegmentSansTexte(
        segment(ptExtremite1Diametre, ptExtremite2Diametre),
        0,
        'black',
      )
      let qRayon = placeLatexSurSegment(
        '\\text{.......}',
        ptExtremite1Rayon,
        ptExtremite2Rayon,
      )
      let qDiametre = placeLatexSurSegment(
        '\\text{.......}',
        ptExtremite1Diametre,
        ptExtremite2Diametre,
      )

      let rRayon = placeLatexSurSegment(
        `\\text{${rEx} cm}`,
        ptExtremite1Rayon,
        ptExtremite2Rayon,
        { letterSize: 'small', distance: 1 },
      )
      let rDiametre = placeLatexSurSegment(
        `\\text{${2 * rEx} cm}`,
        ptExtremite1Diametre,
        ptExtremite2Diametre,
        { letterSize: 'small', distance: 1 },
      )

      if (listeTypeQuestions[i] === 'CylindreVersPatron') {
        qRayon = placeLatexSurSegment(
          '\\text{.......}',
          ptExtremite1Rayon,
          ptExtremite2Rayon,
        )
        rRayon = placeLatexSurSegment(
          `\\text{${rEx} cm}`,
          ptExtremite1Rayon,
          ptExtremite2Rayon,
          { letterSize: 'small', distance: 1 },
        )
        qDiametre = placeLatexSurSegment(
          '\\text{.......}',
          ptExtremite1Diametre,
          ptExtremite2Diametre,
        )
        rDiametre = placeLatexSurSegment(
          `\\text{${2 * rEx} cm}`,
          ptExtremite1Diametre,
          ptExtremite2Diametre,
          { letterSize: 'small', distance: 1 },
        )
        objetsPatron.push(
          coteLongueurPatron,
          coteHauteurPatron,
          coteRayon,
          coteDiametre,
        )
        if (this.interactif) {
          const mLongueurPatron = coordMultiMathsFieldSurSegment(
            ALongueurPatron,
            BLongueurPatron,
            1.2,
          )
          const mHauteurPatron = coordMultiMathsFieldSurSegment(C, D, 1.7)

          const mRayon = coordMultiMathsFieldSurSegment(
            ptExtremite1Rayon,
            ptExtremite2Rayon,
            0.7,
          ) //milieu(ext1RayonDiametre, ext2RayonDiametre)

          const mDiametre = coordMultiMathsFieldSurSegment(
            ptExtremite1Diametre,
            ptExtremite2Diametre,
            0.7,
          )

          const qMetaInteractif = new MetaInteractif2d(
            [
              //qLongueurPatron, qHauteurPatron, qRayon, qDiametre
              {
                content: '%{champ1}\\text{ cm}', // champ1 est à utiliser systématiquement pour tous les inputs
                x: mLongueurPatron.x,
                y: mLongueurPatron.y,
                classe: '', // Ici on pourra mettre le clavier à utiliser
                blanc: '\\ldots ',
                opacity: 1,
                index: 0,
              },
              {
                content: '%{champ1}\\text{ cm}', // On utilise toujours champ1 comme placeholder
                x: mHauteurPatron.x,
                y: mHauteurPatron.y,
                classe: '',
                blanc: '\\ldots ',
                opacity: 1,
                index: 1,
              },
              {
                content: '%{champ1}\\text{ cm}', // On utilise toujours champ1 comme placeholder
                x: mRayon.x,
                y: mRayon.y,
                classe: '',
                blanc: '\\ldots ',
                opacity: 1,
                index: 2,
              },
              {
                content: '%{champ1}\\text{ cm}', // On utilise toujours champ1 comme placeholder
                x: mDiametre.x,
                y: mDiametre.y,
                classe: '',
                blanc: '\\ldots ',
                opacity: 1,
                index: 3,
              },
            ],
            {
              exercice: this,
              question: i,
            },
          )
          handleAnswers(
            this,
            i,
            {
              bareme: toutPourUnPoint,
              field0: {
                value: texNombre(perimetre, 1),
              },
              field1: { value: texNombre(hEx, 1) },
              field2: { value: texNombre(rEx, 1) },
              field3: { value: texNombre(2 * rEx, 1) },
            },
            { formatInteractif: 'MetaInteractif2d' },
          )
          objetsPatron.push(qMetaInteractif)
        } else {
          objetsPatron.push(qLongueurPatron, qHauteurPatron, qRayon, qDiametre)
        }
        objetsPatronReponse.push(
          coteLongueurPatron,
          coteHauteurPatron,
          coteRayon,
          coteDiametre,
          rLongueurPatron,
          rHauteurPatron,
          rRayon,
          rDiametre,
        )
      } else {
        objetsPatron.push(
          coteLongueurPatron,
          coteHauteurPatron,
          /* coteRayon, */ rLongueurPatron,
          rHauteurPatron /*, rRayon */,
        )
        objetsPatronReponse.push(
          coteLongueurPatron,
          coteHauteurPatron,
          coteRayon,
          rLongueurPatron,
          rHauteurPatron /*, rRayon */,
        )
      }

      switch (listeTypeQuestions[i]) {
        case 'CylindreVersPatron': {
          const [colonne1, colonne2] = definiColonnes(
            objetsPerspective,
            objetsPatron,
            scaleDessin,
          )
          const [rColonne1, rColonne2] = definiColonnes(
            objetsPerspectiveReponse,
            objetsPatronReponse,
            scaleDessin,
          )
          // texte += `Question ${i + 1} de type CylindreVersPatron<br>${listetypeOrientationCylindre[i]}<br>`
          texte +=
            'On souhaite construire le patron du cylindre ci-dessous.<br> Complète le schéma du patron en indiquant les longueurs en valeur exacte si possible ou au millimètre près.<br>'
          texte += '<br><br>'
          texte += deuxColonnesResp(colonne1, colonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })
          if (listeTypeBaseCylindre[i] === 'rayon') {
            texteCorr += `Le rayon du cercle de base est $${texNombre(rEx, 1)}${sp()}\\text{cm}$<br>`
            texteCorr += `Le diamètre du cercle de base est $2 \\times ${texNombre(rEx, 1)} = ${miseEnEvidence(texNombre(2 * rEx, 1))}${sp()}\\text{cm}$.<br>`
          } else {
            // 'diametre'
            texteCorr += `Le diamètre du cercle de base est $${texNombre(2 * rEx, 1)}${sp()}\\text{cm}$.<br>`
            texteCorr += `Le rayon du cercle de base est $${texNombre(2 * rEx, 1)} \\div 2 = ${miseEnEvidence(texNombre(rEx, 1))}${sp()}\\text{cm}$.<br>`
          }
          texteCorr += `La largeur du rectangle est égale à la hauteur du cylindre soit $${miseEnEvidence(texNombre(hEx, 1))}${sp()}\\text{cm}$.<br>`
          texteCorr += `La longueur du rectangle est égale à la longueur du cercle de base soit $2 \\times ${texNombre(rEx, 1)}\\times \\pi=${texNombre(
            2 * rEx,
            1,
          )}\\pi\\approx${miseEnEvidence(texNombre(perimetre, 1))}${sp()}\\text{cm}$.<br>`
          texteCorr += '<br><br>'
          texteCorr += deuxColonnesResp(rColonne1, rColonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })
          break
        }
        case 'PatronVersCylindre': {
          const [colonne1, colonne2] = definiColonnes(
            objetsPatron,
            objetsPerspective,
            scaleDessin,
          )
          const [rColonne1, rColonne2] = definiColonnes(
            objetsPatronReponse,
            objetsPerspectiveReponse,
            scaleDessin,
          )
          // texte += `Question ${i + 1} de type PatronVersCylindre`
          texte +=
            'On souhaite connaitre les dimensions du cylindre correspondant au patrons ci-dessous.<br> Complète le schéma du cylindre en indiquant les longueurs en valeur exacte si possible ou au millimètre près.<br>'
          texte += '<br><br>'
          texte += deuxColonnesResp(colonne1, colonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })
          const approxDiametre = arrondi(perimetre / Math.PI, 1)
          texteCorr += `La hauteur du cylindre est égale à la largeur du rectangle soit $${miseEnEvidence(texNombre(hEx, 1))}${sp()}\\text{cm}$.<br>`
          texteCorr += `La longueur du rectangle est égale à la longueur du cercle de base, on a donc l'égalité $diametre \\times \\pi=${texNombre(perimetre, 1)}${sp()}\\text{cm}$.<br>`
          texteCorr += `Donc la longueur du diamètre est égale à $${texNombre(perimetre, 1)} \\div \\pi \\approx${miseEnEvidence(texNombre(approxDiametre))}${sp()}\\text{cm}$.<br>`
          if (listeTypeBaseCylindre[i] === 'rayon') {
            texteCorr += `Donc la longueur du rayon est donc approximativement égale à $${texNombre(approxDiametre)} \\div 2 = ${miseEnEvidence(texNombre(approxDiametre / 2, 1))}${sp()}\\text{cm}$.<br>`
          }
          texteCorr += '<br><br>'
          texteCorr += deuxColonnesResp(rColonne1, rColonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })
          break
        }
        case 'type3':
        default:
          texte = `Question ${i + 1} de type 3`
          texteCorr = `Correction ${i + 1} de type 3`
          break
      }
      if (this.questionJamaisPosee(i, rEx, hEx)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function afficheCoteSegmentSansTexte(
  s: Segment,
  positionCote = 0.5,
  couleurCote = 'black',
): Segment {
  const A = s.extremite1
  const B = s.extremite2
  const v = similitude(vecteur(A, B), A, 90, positionCote / s.longueur)
  const cote = segment(translation(A, v), translation(B, v), couleurCote)
  if (longueur(A, B) > 1) cote.styleExtremites = '<->'
  else cote.styleExtremites = '>-<'
  return cote
}
function definiColonnes(
  objetsAAfficher1: NestedObjetMathalea2dArray,
  objetsAAfficher2: NestedObjetMathalea2dArray,
  scaleDessin: number,
): [string, string] {
  const bord1 = fixeBordures(objetsAAfficher1, {
    rxmin: -0.1,
    rymin: -0.1,
    rxmax: 0.1,
    rymax: 0.1,
  })
  const bord2 = fixeBordures(objetsAAfficher2, {
    rxmin: -0.1,
    rymin: -0.1,
    rxmax: 0.1,
    rymax: 0.1,
  })
  const colonne1 = mathalea2d(
    Object.assign(
      {
        /* pixelsParCm: 20,  */ scale: scaleDessin,
        optionsTikz: ['baseline=(current bounding box.north)'],
        mainlevee: false,
      },
      bord1,
    ),
    objetsAAfficher1,
  )
  const colonne2 = mathalea2d(
    Object.assign(
      {
        scale: scaleDessin,
        optionsTikz: ['baseline=(current bounding box.north)'],
        mainlevee: false,
      },
      bord2,
    ),
    objetsAAfficher2,
  )
  return [colonne1, colonne2]
}

function coordMultiMathsFieldSurSegment(
  A: PointAbstrait,
  B: PointAbstrait,
  distance: number = 0.7,
): { x: number; y: number } {
  // code copié de placeLatex2d(A, B, distance)
  // Milieu de [AB]
  const Mx = (A.x + B.x) / 2
  const My = (A.y + B.y) / 2
  // Vecteur AB
  const dx = B.x - A.x
  const dy = B.y - A.y
  const len = Math.hypot(dx, dy)
  // Vecteur normal unitaire (perpendiculaire, orientation +90°)
  const nx = len > 1e-12 ? -dy / len : 0
  const ny = len > 1e-12 ? dx / len : 1
  // Point décalé à distance le long de la normale
  return { x: Mx + nx * distance, y: My + ny * distance }
}
